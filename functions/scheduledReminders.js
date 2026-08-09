const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const { Resend } = require("resend");
const { defineString } = require("firebase-functions/params");

const resendApiKey = defineString("RESEND_API_KEY");

/**
 * Safely formats Firestore timestamp or Date to YYYY-MM-DD
 */
const toYYYYMMDD = (date) => {
  if (!date) return '';
  if (typeof date === 'string') return date.split('T')[0];
  const jsDate = date.toDate ? date.toDate() : new Date(date);
  if (isNaN(jsDate.getTime())) return '';
  return jsDate.toISOString().split('T')[0];
};

/**
 * Renders HTML email template for invoice payment reminders
 */
const buildReminderEmailHtml = ({
  companyName,
  clientName,
  invoiceNumber,
  total,
  currency,
  dueDate,
  paymentUrl,
  reminderType
}) => {
  const formattedTotal = typeof total === 'number' ? total.toFixed(2) : total;
  const curr = currency || 'USD';
  const currSymbol = curr === 'USD' ? '$' : curr === 'EUR' ? '€' : curr === 'GBP' ? '£' : '$';

  let title = `Invoice #${invoiceNumber} Reminder`;
  let badgeColor = '#3b82f6'; // blue
  let badgeText = 'Upcoming Invoice';
  let message = `This is a friendly reminder that invoice <strong>#${invoiceNumber}</strong> for <strong>${currSymbol}${formattedTotal}</strong> is due on <strong>${dueDate}</strong>.`;

  if (reminderType === 'on_due_date') {
    title = `Invoice #${invoiceNumber} is Due Today`;
    badgeColor = '#f59e0b'; // amber
    badgeText = 'Due Today';
    message = `This is a reminder that invoice <strong>#${invoiceNumber}</strong> for <strong>${currSymbol}${formattedTotal}</strong> is due today (<strong>${dueDate}</strong>).`;
  } else if (reminderType === '7_days_overdue') {
    title = `OVERDUE: Invoice #${invoiceNumber} Payment Reminder`;
    badgeColor = '#ef4444'; // red
    badgeText = 'Overdue Notice';
    message = `Invoice <strong>#${invoiceNumber}</strong> for <strong>${currSymbol}${formattedTotal}</strong> was due on <strong>${dueDate}</strong> and is currently 7 days overdue. Please process payment as soon as possible.`;
  }

  return `
    <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #111d2f; color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #1e293b; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
      <div style="text-align: center; margin-bottom: 28px;">
        <span style="background-color: ${badgeColor}20; color: ${badgeColor}; border: 1px solid ${badgeColor}40; font-size: 13px; font-weight: 600; padding: 6px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
          ${badgeText}
        </span>
        <h1 style="color: #ffffff; font-size: 24px; margin-top: 16px; margin-bottom: 8px;">${title}</h1>
        <p style="color: #94a3b8; font-size: 14px; margin: 0;">Issued by ${companyName || 'Your Service Provider'}</p>
      </div>

      <div style="background-color: #1e293b; padding: 24px; border-radius: 12px; margin-bottom: 28px; border: 1px solid rgba(255, 255, 255, 0.05);">
        <p style="font-size: 15px; line-height: 1.6; color: #e2e8f0; margin-top: 0;">
          Hi ${clientName || 'Valued Customer'},
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1; margin-bottom: 0;">
          ${message}
        </p>
      </div>

      <div style="background-color: #0f172a; padding: 20px 24px; border-radius: 12px; margin-bottom: 32px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #94a3b8; font-size: 14px;">Invoice Number:</span>
          <span style="color: #ffffff; font-weight: 600; font-size: 14px;">#${invoiceNumber}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #94a3b8; font-size: 14px;">Due Date:</span>
          <span style="color: #ffffff; font-weight: 600; font-size: 14px;">${dueDate}</span>
        </div>
        <div style="display: flex; justify-content: space-between; border-top: 1px solid #1e293b; padding-top: 10px; margin-top: 10px;">
          <span style="color: #f8fafc; font-size: 16px; font-weight: 600;">Amount Due:</span>
          <span style="color: #38bdf8; font-weight: 700; font-size: 18px;">${currSymbol}${formattedTotal}</span>
        </div>
      </div>

      ${paymentUrl ? `
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${paymentUrl}" target="_blank" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);">
            Pay Invoice Online Now →
          </a>
        </div>
      ` : ''}

      <div style="border-top: 1px solid #1e293b; padding-top: 20px; text-align: center; color: #64748b; font-size: 12px;">
        <p style="margin: 0;">Sent via ScanGo Invoice on behalf of ${companyName || 'your provider'}.</p>
      </div>
    </div>
  `;
};

/**
 * Scheduled function running daily at 09:00 UTC to process automated payment reminders
 */
exports.sendScheduledReminders = onSchedule("every day 09:00", async (event) => {
  const db = admin.firestore();
  const apiKey = resendApiKey.value();

  if (!apiKey) {
    console.error("RESEND_API_KEY parameter is not configured. Skipping scheduled reminders execution.");
    return;
  }

  const resend = new Resend(apiKey);

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const todayDate = new Date(todayStr + 'T00:00:00Z');

  console.log(`Running scheduled payment reminders check for date: ${todayStr}`);

  try {
    // Fetch pending, sent, and overdue invoices
    const invoicesSnapshot = await db.collection("invoices")
      .where("status", "in", ["pending", "sent", "overdue"])
      .get();

    if (invoicesSnapshot.empty) {
      console.log("No pending, sent, or overdue invoices found.");
      return;
    }

    let sentCount = 0;
    let skippedCount = 0;

    for (const doc of invoicesSnapshot.docs) {
      const invoice = doc.data();
      const invoiceId = doc.id;

      // 1. Check if reminders are explicitly disabled for this invoice
      if (invoice.remindersEnabled === false) {
        skippedCount++;
        continue;
      }

      // 2. Fetch merchant user profile to check subscription status (Pro feature)
      if (!invoice.userId) continue;
      const userDoc = await db.collection("users").doc(invoice.userId).get();
      if (!userDoc.exists) continue;

      const user = userDoc.data();
      if (user.subscriptionStatus !== 'active') {
        // Skip automated reminders for free tier users
        skippedCount++;
        continue;
      }

      // 3. Fetch user settings for reminder configuration and company profile
      const settingsDoc = await db.collection("userSettings").doc(invoice.userId).get();
      const settings = settingsDoc.exists ? settingsDoc.data() : {};
      const reminderSettings = settings.reminderSettings || { enabled: true, triggers: ['3_days_before', 'on_due_date', '7_days_overdue'] };

      if (reminderSettings.enabled === false) {
        skippedCount++;
        continue;
      }

      // 4. Calculate day difference between due date and today
      const dueStr = toYYYYMMDD(invoice.dueDate);
      if (!dueStr) continue;

      const dueDate = new Date(dueStr + 'T00:00:00Z');
      const diffDays = Math.round((dueDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));

      let triggerKey = null;
      if (diffDays === 3) {
        triggerKey = '3_days_before';
      } else if (diffDays === 0) {
        triggerKey = 'on_due_date';
      } else if (diffDays === -7) {
        triggerKey = '7_days_overdue';
      }

      if (!triggerKey) {
        continue; // Day offset does not match any milestone
      }

      // Check if user settings enable this specific trigger
      if (Array.isArray(reminderSettings.triggers) && !reminderSettings.triggers.includes(triggerKey)) {
        continue;
      }

      // 5. De-duplication check: check if reminder key was already sent
      const remindersSent = Array.isArray(invoice.remindersSent) ? invoice.remindersSent : [];
      if (remindersSent.includes(triggerKey)) {
        console.log(`Reminder '${triggerKey}' already sent for invoice ${invoiceId}. Skipping.`);
        continue;
      }

      // Determine recipient email & client name
      const clientEmail = invoice.client?.email || invoice.clientEmail;
      const clientName = invoice.client?.name || invoice.clientName || 'Customer';

      if (!clientEmail) {
        console.warn(`Invoice ${invoiceId} has no client email address. Skipping reminder.`);
        continue;
      }

      const companyName = settings.company?.name || user.name || 'ScanGo Merchant';

      // App payment URL
      const appHost = process.env.VITE_APP_URL || "https://swift-invoice.web.app";
      const paymentUrl = `${appHost}/#/payment/${invoiceId}`;

      const emailHtml = buildReminderEmailHtml({
        companyName,
        clientName,
        invoiceNumber: invoice.invoiceNumber || invoiceId,
        total: invoice.total || 0,
        currency: invoice.currency || settings.currency || 'USD',
        dueDate: dueStr,
        paymentUrl,
        reminderType: triggerKey
      });

      const subjectPrefix = triggerKey === '7_days_overdue' ? '[OVERDUE] ' : triggerKey === 'on_due_date' ? '[DUE TODAY] ' : '[REMINDER] ';
      const subject = `${subjectPrefix}Invoice #${invoice.invoiceNumber || invoiceId} from ${companyName}`;

      try {
        await resend.emails.send({
          from: `${companyName} <billing@scangoinvoice.com>`,
          to: [clientEmail],
          subject: subject,
          html: emailHtml
        });

        console.log(`Successfully sent reminder '${triggerKey}' for invoice ${invoiceId} to ${clientEmail}`);

        // Update Firestore invoice document
        const updates = {
          remindersSent: admin.firestore.FieldValue.arrayUnion(triggerKey)
        };

        if (diffDays < 0 && invoice.status !== 'overdue') {
          updates.status = 'overdue';
        }

        await doc.ref.update(updates);
        sentCount++;
      } catch (sendError) {
        console.error(`Failed to send reminder email for invoice ${invoiceId}:`, sendError);
      }
    }

    console.log(`Scheduled reminders summary: ${sentCount} emails sent, ${skippedCount} skipped.`);
  } catch (err) {
    console.error("Error executing scheduled reminders function:", err);
  }
});
