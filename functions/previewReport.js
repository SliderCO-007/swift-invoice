const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { defineString } = require("firebase-functions/params");
const { Resend } = require("resend");
const { getUnsubscribeUrl } = require("./unsubscribeHelper");

const resendApiKey = defineString("RESEND_API_KEY");

const toYYYYMMDD = (date) => {
  if (!date) return '';
  const jsDate = date.toDate ? date.toDate() : (date instanceof Date ? date : new Date(date));
  return isNaN(jsDate.getTime()) ? '' : jsDate.toISOString().split('T')[0];
};

const parseDate = (date) => {
  if (!date) return null;
  const jsDate = date.toDate ? date.toDate() : (date instanceof Date ? date : new Date(date));
  return isNaN(jsDate.getTime()) ? null : jsDate;
};

exports.sendPreviewReport = onCall({ enforceAppCheck: false }, async (request) => {
  const { auth, data } = request;
  const { recipientEmail } = data;

  if (!auth) {
    throw new HttpsError('unauthenticated', 'Authentication is required.');
  }

  const userId = auth.uid;
  let userName = "Customer";
  let isSubscribed = false;

  try {
    const userDoc = await admin.firestore().collection("users").doc(userId).get();
    if (!userDoc.exists) {
      throw new HttpsError('not-found', 'User profile not found.');
    }
    const userData = userDoc.data();
    userName = userData.name || "Customer";
    isSubscribed = userData.subscriptionStatus === 'active';
  } catch (error) {
    console.error(`Error loading profile for user ${userId}:`, error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError('internal', 'An error occurred while loading your profile.');
  }

  if (!recipientEmail) {
    throw new HttpsError('invalid-argument', 'A recipient email is required.');
  }

  const resend = new Resend(resendApiKey.value());

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const oneWeekAgo = new Date(startOfToday);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const oneWeekFromNow = new Date(startOfToday);
  oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
  oneWeekFromNow.setHours(23, 59, 59, 999);

  let paidLastWeekSnapshot;
  let unpaidSnapshot;

  try {
    paidLastWeekSnapshot = await admin.firestore().collection("invoices")
      .where("userId", "==", userId)
      .where("status", "==", "paid")
      .where("paidAt", ">=", oneWeekAgo)
      .where("paidAt", "<=", today)
      .get();
  } catch (error) {
    console.error("Error fetching paid invoices:", error);
    paidLastWeekSnapshot = { docs: [] };
  }

  try {
    unpaidSnapshot = await admin.firestore().collection("invoices")
      .where("userId", "==", userId)
      .where("status", "in", ["pending", "Pending", "overdue", "Overdue", "sent", "Sent"])
      .get();
  } catch (error) {
    console.error("Error fetching unpaid invoices with IN query:", error);
    try {
      const allInvoicesSnapshot = await admin.firestore().collection("invoices")
        .where("userId", "==", userId)
        .get();
      unpaidSnapshot = {
        docs: allInvoicesSnapshot.docs.filter(d => {
          const s = (d.data().status || '').toLowerCase();
          return s === 'pending' || s === 'overdue' || s === 'sent';
        })
      };
    } catch (fallbackErr) {
      console.error("Fallback invoice query failed:", fallbackErr);
      unpaidSnapshot = { docs: [] };
    }
  }

  try {
    const paidLastWeek = paidLastWeekSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const overdueInvoices = [];
    const dueThisWeek = [];

    for (const doc of unpaidSnapshot.docs) {
      const d = doc.data();
      const invoiceId = doc.id;
      const status = (d.status || '').toLowerCase();

      // Exclude drafts and estimates
      if (status === 'draft' || status === 'estimate' || status === 'paid') continue;

      const dueDateObj = parseDate(d.dueDate);
      const formattedDueDate = dueDateObj ? toYYYYMMDD(dueDateObj) : (typeof d.dueDate === 'string' ? d.dueDate : '');

      let daysOverdue = 0;
      if (dueDateObj && dueDateObj < startOfToday) {
        const diffTime = startOfToday.getTime() - dueDateObj.getTime();
        daysOverdue = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
      }

      const isOverdue = status === 'overdue' || (dueDateObj && dueDateObj < startOfToday);
      const isDueUpcoming = !isOverdue && dueDateObj && dueDateObj >= startOfToday && dueDateObj <= oneWeekFromNow;

      const invoiceItem = {
        ...d,
        id: invoiceId,
        dueDate: formattedDueDate,
        daysOverdue,
        clientName: d.client?.name || d.clientName || ''
      };

      if (isOverdue) {
        overdueInvoices.push(invoiceItem);
      } else if (isDueUpcoming) {
        dueThisWeek.push(invoiceItem);
      }
    }

    // Sort overdue by longest overdue first
    overdueInvoices.sort((a, b) => (b.daysOverdue || 0) - (a.daysOverdue || 0));

    // Sort upcoming due chronologically
    dueThisWeek.sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));

    const totalPaid = paidLastWeek.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
    const totalDue = dueThisWeek.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
    const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);

    const hasActivity = paidLastWeek.length > 0 || dueThisWeek.length > 0 || overdueInvoices.length > 0;
    const unsubscribeUrl = getUnsubscribeUrl(userId);

    let contentHtml = "";

    if (hasActivity) {
      const paidItemsHtml = paidLastWeek.length > 0
        ? paidLastWeek.map(invoice => `<li style="margin-bottom: 8px;">💰 <strong>Invoice #${invoice.invoiceNumber || 'Draft'}:</strong> $${(Number(invoice.total) || 0).toFixed(2)}</li>`).join('')
        : "<li style=\"color: #94a3b8;\">No invoices were marked as paid in the last 7 days.</li>";

      const dueItemsHtml = dueThisWeek.length > 0
        ? dueThisWeek.map(invoice => `<li style="margin-bottom: 8px;">⏳ <strong>Invoice #${invoice.invoiceNumber || 'Draft'}:</strong> $${(Number(invoice.total) || 0).toFixed(2)} <span style="color: #94a3b8;">(Due: ${invoice.dueDate || 'Soon'})</span></li>`).join('')
        : "<li style=\"color: #94a3b8;\">No invoices are due in the next 7 days.</li>";

      const overdueItemsHtml = overdueInvoices.map(inv => {
        const clientPart = inv.clientName ? ` (${inv.clientName})` : '';
        const overdueLabel = inv.daysOverdue > 0
          ? `<span style="color: #fca5a5; font-size: 12px; margin-left: 6px; font-weight: 600;">[${inv.daysOverdue} day${inv.daysOverdue === 1 ? '' : 's'} overdue]</span>`
          : `<span style="color: #fca5a5; font-size: 12px; margin-left: 6px; font-weight: 600;">[Past due]</span>`;
        return `<li style="margin-bottom: 8px;">🚨 <strong>Invoice #${inv.invoiceNumber || 'Draft'}${clientPart}:</strong> $${(Number(inv.total) || 0).toFixed(2)} &bull; <span style="color: #cbd5e1;">Due: ${inv.dueDate || 'Past Due'}</span> ${overdueLabel}</li>`;
      }).join('');

      const overdueCardHtml = overdueInvoices.length > 0
        ? `
          <div style="flex: 1; min-width: 130px; background-color: #1e293b; padding: 18px 14px; border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.35); text-align: center;">
            <p style="color: #fca5a5; font-size: 12px; margin: 0 0 6px 0; text-transform: uppercase; font-weight: 600;">⚠️ Overdue</p>
            <p style="color: #f87171; font-size: 22px; font-weight: 700; margin: 0;">$${totalOverdue.toFixed(2)}</p>
          </div>
        `
        : "";

      const overdueSectionHtml = overdueInvoices.length > 0
        ? `
          <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(185, 28, 28, 0.08) 100%); border: 1px solid rgba(239, 68, 68, 0.35); padding: 22px; border-radius: 10px; margin: 24px 0;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="background-color: #ef4444; color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">ACTION REQUIRED</span>
                <h2 style="color: #f87171; font-size: 17px; margin: 0; font-weight: 700;">Overdue Invoices (${overdueInvoices.length})</h2>
              </div>
              <span style="color: #fca5a5; font-size: 13px; font-weight: 600;">Total: $${totalOverdue.toFixed(2)}</span>
            </div>
            <p style="color: #e2e8f0; font-size: 13.5px; line-height: 1.5; margin: 0 0 14px 0;">
              The following invoices have passed their payment due date. Send a reminder today to keep your cash flow moving:
            </p>
            <ul style="color: #cbd5e1; font-size: 14px; line-height: 1.7; margin: 0 0 18px 0; padding-left: 20px;">
              ${overdueItemsHtml}
            </ul>
            <a href="https://scangoinvoice.com/invoices" style="display: inline-block; background: #dc2626; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; font-size: 13.5px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
              Review &amp; Remind in Dashboard &rarr;
            </a>
          </div>
        `
        : "";

      contentHtml = `
        <div style="display: flex; gap: 12px; margin: 24px 0; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 130px; background-color: #1e293b; padding: 18px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0 0 6px 0; text-transform: uppercase; font-weight: 600;">Paid Last 7 Days</p>
            <p style="color: #34d399; font-size: 22px; font-weight: 700; margin: 0;">$${totalPaid.toFixed(2)}</p>
          </div>
          <div style="flex: 1; min-width: 130px; background-color: #1e293b; padding: 18px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0 0 6px 0; text-transform: uppercase; font-weight: 600;">Due Next 7 Days</p>
            <p style="color: #60a5fa; font-size: 22px; font-weight: 700; margin: 0;">$${totalDue.toFixed(2)}</p>
          </div>
          ${overdueCardHtml}
        </div>

        ${overdueSectionHtml}

        <div style="background-color: #1e293b; padding: 24px; border-radius: 8px; margin: 20px 0; border: 1px solid rgba(255,255,255,0.05);">
          <h2 style="color: #f8fafc; font-size: 17px; margin-top: 0; margin-bottom: 14px; font-weight: 600;">Invoices Paid Last Week (${paidLastWeek.length})</h2>
          <ul style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
            ${paidItemsHtml}
          </ul>
        </div>
        
        <div style="background-color: #1e293b; padding: 24px; border-radius: 8px; margin: 20px 0; border: 1px solid rgba(255,255,255,0.05);">
          <h2 style="color: #f8fafc; font-size: 17px; margin-top: 0; margin-bottom: 14px; font-weight: 600;">Invoices Due This Week (${dueThisWeek.length})</h2>
          <ul style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
            ${dueItemsHtml}
          </ul>
        </div>
      `;
    } else {
      contentHtml = `
        <div style="background-color: #1e293b; padding: 32px 24px; border-radius: 12px; margin: 24px 0; border: 1px solid rgba(255,255,255,0.06); text-align: center;">
          <div style="font-size: 40px; margin-bottom: 12px;">🎉</div>
          <h2 style="color: #f8fafc; font-size: 20px; font-weight: 700; margin: 0 0 8px 0;">You're All Caught Up!</h2>
          <p style="color: #94a3b8; font-size: 15px; margin: 0 0 20px 0; line-height: 1.6;">
            No client invoices were paid, no balances are overdue, and no invoices are currently due in the upcoming 7 days.
          </p>
          
          <div style="background: rgba(96, 165, 250, 0.08); border: 1px solid rgba(96, 165, 250, 0.2); border-radius: 8px; padding: 18px; text-align: left; margin: 16px 0 24px 0;">
            <p style="color: #60a5fa; font-size: 12px; font-weight: 700; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px;">💡 Weekly Cash Flow Pro-Tip</p>
            <p style="color: #e2e8f0; font-size: 14px; line-height: 1.6; margin: 0;">
              Businesses that invoice immediately upon job completion get paid on average <strong>14 days faster</strong> than those billing at the end of the month. Keep your revenue pipeline humming!
            </p>
          </div>

          <a href="https://scangoinvoice.com/invoice/new" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 15px;">
            + Create New Invoice
          </a>
        </div>
      `;
    }

    let upsellHtml = "";
    if (!isSubscribed) {
      upsellHtml = `
        <div style="background: linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(99, 102, 241, 0.15) 100%); border: 1px solid rgba(96, 165, 250, 0.25); padding: 22px; border-radius: 10px; margin: 28px 0; text-align: left;">
          <div style="margin-bottom: 8px;">
            <span style="background-color: #3b82f6; color: #ffffff; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">PRO UPGRADE</span>
            <span style="color: #f8fafc; font-size: 16px; font-weight: 600; margin-left: 8px;">Put Payment Follow-Ups On Autopilot</span>
          </div>
          <p style="color: #cbd5e1; font-size: 13.5px; line-height: 1.5; margin: 8px 0 16px 0;">
            Never chase late payments manually again. ScanGo Pro sends automated email reminders before and after due dates, captures receipt expenses with AI, and tracks billable hours.
          </p>
          <a href="https://scangoinvoice.com/pricing" style="display: inline-block; background: #3b82f6; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; font-size: 13.5px;">
            Upgrade to Pro for $4.99/mo &rarr;
          </a>
        </div>
      `;
    }

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #111d2f; color: #ffffff; padding: 36px 28px; border-radius: 12px; border: 1px solid #1e293b;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid #1e293b; padding-bottom: 16px;">
          <div>
            <h1 style="color: #60a5fa; margin: 0; font-size: 22px; font-weight: 700;">Weekly Invoice Report (Preview) 📊</h1>
            <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0 0;">ScanGo Invoice Weekly Financial Pulse</p>
          </div>
          ${isSubscribed ? '<span style="background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;">⭐ PRO SUBSCRIBER</span>' : ''}
        </div>

        <p style="font-size: 15px; line-height: 1.6; color: #e2e8f0; margin-bottom: 8px;">
          Hi ${userName},
        </p>
        <p style="font-size: 14.5px; line-height: 1.6; color: #94a3b8; margin-top: 0;">
          Here is a preview of your summary for the past week and the week ahead.
        </p>

        ${contentHtml}

        ${upsellHtml}

        <div style="text-align: center; margin-top: 32px;">
          <a href="https://scangoinvoice.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 13px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);">
            View Full Dashboard
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #1e293b; margin: 36px 0 24px 0;">
        
        <p style="font-size: 12.5px; color: #64748b; text-align: center; line-height: 1.6; margin: 0 0 12px 0;">
          Need assistance? Reply to this email or reach us at <a href="mailto:support@scangoinvoice.com" style="color: #60a5fa; text-decoration: none;">support@scangoinvoice.com</a>.<br>
          &copy; ${new Date().getFullYear()} ScanGo Invoice. All rights reserved.
        </p>

        <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
          You are receiving this because you requested a test preview.<br>
          <a href="${unsubscribeUrl}" style="color: #94a3b8; text-decoration: underline;">Unsubscribe from weekly reports</a> &bull;
          <a href="https://scangoinvoice.com/settings" style="color: #94a3b8; text-decoration: underline;">Manage Notification Preferences</a>
        </p>
      </div>
    `;

    let emailSubject = "Preview: Weekly Report - You're all caught up! 🎉";
    if (overdueInvoices.length > 0) {
      const countLabel = overdueInvoices.length === 1 ? "1 Overdue Invoice" : `${overdueInvoices.length} Overdue Invoices`;
      emailSubject = `Preview: Weekly Report - Action Required on ${countLabel} ⚠️`;
    } else if (hasActivity) {
      emailSubject = "Preview: Your Weekly Invoice Report 📊";
    }

    await resend.emails.send({
      from: "ScanGo Invoice <support@scangoinvoice.com>",
      to: recipientEmail,
      subject: emailSubject,
      html: emailHtml,
    });

    return { success: true, message: `Preview report sent successfully to ${recipientEmail}` };

  } catch (error) {
    console.error("Error sending preview report email:", error);
    if (error instanceof HttpsError) throw error;
    if (error.response) {
      console.error('Resend API Error:', error.response.body);
      throw new HttpsError('internal', `Failed to send email via Resend: ${error.response.body.message}`);
    }
    throw new HttpsError('internal', 'An unexpected error occurred while constructing or sending the preview email.');
  }
});
