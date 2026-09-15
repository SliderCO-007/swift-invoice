const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const { Resend } = require("resend");
const { defineString } = require("firebase-functions/params");
const { getUnsubscribeUrl } = require("./unsubscribeHelper");

const resendApiKey = defineString("RESEND_API_KEY");

const toYYYYMMDD = (date) => {
  if (!date) return '';
  const jsDate = date.toDate ? date.toDate() : date;
  return jsDate.toISOString().split('T')[0];
};

exports.sendWeeklyReport = onSchedule("every monday 08:00", async (event) => {
  const resend = new Resend(resendApiKey.value());

  const today = new Date();
  const oneWeekAgo = new Date(new Date().setDate(today.getDate() - 7));
  const oneWeekFromNow = new Date(new Date().setDate(today.getDate() + 7));

  const usersSnapshot = await admin.firestore().collection("users").get();

  for (const userDoc of usersSnapshot.docs) {
    const user = userDoc.data();
    const userId = userDoc.id;

    if (!user.email) {
      console.log(`Skipping user ${userId}: No email address on file.`);
      continue;
    }

    // --- Opt-Out Check ---
    if (user.weeklyReportOptOut === true) {
      console.log(`Skipping report for user ${userId} due to user opt-out.`);
      continue;
    }

    const isSubscribed = user.subscriptionStatus === 'active';

    let paidLastWeekSnapshot;
    let dueThisWeekSnapshot;

    try {
      paidLastWeekSnapshot = await admin.firestore().collection("invoices")
        .where("userId", "==", userId)
        .where("status", "==", "paid")
        .where("paidAt", ">=", oneWeekAgo)
        .where("paidAt", "<=", today)
        .get();
    } catch (error) {
      console.error(`Error fetching paid invoices for user ${userId}:`, error);
      continue; 
    }

    try {
      dueThisWeekSnapshot = await admin.firestore().collection("invoices")
        .where("userId", "==", userId)
        .where("status", "in", ["pending", "overdue"])
        .where("dueDate", ">=", today)
        .where("dueDate", "<=", oneWeekFromNow)
        .get();
    } catch (error) {
      console.error(`Error fetching due invoices for user ${userId}:`, error);
      continue; 
    }

    const paidLastWeek = paidLastWeekSnapshot.docs.map(doc => doc.data());
    const dueThisWeek = dueThisWeekSnapshot.docs.map(doc => {
      const data = doc.data();
      return { ...data, dueDate: toYYYYMMDD(data.dueDate) };
    });

    const hasActivity = paidLastWeek.length > 0 || dueThisWeek.length > 0;
    const userName = user.name || "Customer";
    const unsubscribeUrl = getUnsubscribeUrl(userId);

    const totalPaid = paidLastWeek.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
    const totalDue = dueThisWeek.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);

    let contentHtml = "";

    if (hasActivity) {
      const paidItemsHtml = paidLastWeek.length > 0
        ? paidLastWeek.map(invoice => `<li style="margin-bottom: 8px;">💰 <strong>Invoice #${invoice.invoiceNumber || 'Draft'}:</strong> $${(Number(invoice.total) || 0).toFixed(2)}</li>`).join('')
        : "<li style=\"color: #94a3b8;\">No invoices were marked as paid in the last 7 days.</li>";

      const dueItemsHtml = dueThisWeek.length > 0
        ? dueThisWeek.map(invoice => `<li style="margin-bottom: 8px;">⏳ <strong>Invoice #${invoice.invoiceNumber || 'Draft'}:</strong> $${(Number(invoice.total) || 0).toFixed(2)} <span style=\"color: #94a3b8;\">(Due: ${invoice.dueDate || 'Soon'})</span></li>`).join('')
        : "<li style=\"color: #94a3b8;\">No invoices are due in the next 7 days.</li>";

      contentHtml = `
        <div style="display: flex; gap: 12px; margin: 24px 0;">
          <div style="flex: 1; background-color: #1e293b; padding: 18px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); text-align: center;">
            <p style="color: #94a3b8; font-size: 13px; margin: 0 0 6px 0; text-transform: uppercase;">Paid Last 7 Days</p>
            <p style="color: #34d399; font-size: 24px; font-weight: 700; margin: 0;">$${totalPaid.toFixed(2)}</p>
          </div>
          <div style="flex: 1; background-color: #1e293b; padding: 18px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); text-align: center;">
            <p style="color: #94a3b8; font-size: 13px; margin: 0 0 6px 0; text-transform: uppercase;">Due Next 7 Days</p>
            <p style="color: #60a5fa; font-size: 24px; font-weight: 700; margin: 0;">$${totalDue.toFixed(2)}</p>
          </div>
        </div>

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
      // "All Caught Up" + Smart Re-engagement Summary
      contentHtml = `
        <div style="background-color: #1e293b; padding: 32px 24px; border-radius: 12px; margin: 24px 0; border: 1px solid rgba(255,255,255,0.06); text-align: center;">
          <div style="font-size: 40px; margin-bottom: 12px;">🎉</div>
          <h2 style="color: #f8fafc; font-size: 20px; font-weight: 700; margin: 0 0 8px 0;">You're All Caught Up!</h2>
          <p style="color: #94a3b8; font-size: 15px; margin: 0 0 20px 0; line-height: 1.6;">
            No client invoices were paid and no balances are currently due in the upcoming 7 days.
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

    // Pro Upsell Banner for Free Tier
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
            <h1 style="color: #60a5fa; margin: 0; font-size: 22px; font-weight: 700;">Weekly Invoice Report 📊</h1>
            <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0 0;">ScanGo Invoice Weekly Financial Pulse</p>
          </div>
          ${isSubscribed ? '<span style="background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;">⭐ PRO SUBSCRIBER</span>' : ''}
        </div>

        <p style="font-size: 15px; line-height: 1.6; color: #e2e8f0; margin-bottom: 8px;">
          Hi ${userName},
        </p>
        <p style="font-size: 14.5px; line-height: 1.6; color: #94a3b8; margin-top: 0;">
          Here is your weekly summary of invoice cash flow and upcoming receivables.
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
          You are receiving this because you have an active ScanGo Invoice account.<br>
          <a href="${unsubscribeUrl}" style="color: #94a3b8; text-decoration: underline;">Unsubscribe from weekly reports</a> &bull;
          <a href="https://scangoinvoice.com/settings" style="color: #94a3b8; text-decoration: underline;">Manage Notification Preferences</a>
        </p>
      </div>
    `;

    try {
      await resend.emails.send({
        from: "ScanGo Invoice <support@scangoinvoice.com>",
        to: user.email,
        subject: hasActivity ? "Your Weekly Invoice Report 📊" : "Weekly Report: You're all caught up! 🎉",
        html: emailHtml,
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        }
      });
      console.log(`Weekly report delivered to ${user.email}`);
    } catch (error) {
      console.error(`Error sending weekly report email to ${user.email}:`, error);
    }
  }
});
