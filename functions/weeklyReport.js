
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const { Resend } = require("resend");
const { defineString } = require("firebase-functions/params");

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

    // --- Subscription Check ---
    if (user.subscriptionStatus !== 'active') {
      console.log(`Skipping report for user ${userId} due to inactive subscription.`);
      continue; // Skip to the next user
    }

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

    if (paidLastWeek.length > 0 || dueThisWeek.length > 0) {
        const userName = user.name || "Customer";

        const paidItemsHtml = paidLastWeek.length > 0
            ? paidLastWeek.map(invoice => `<li>💰 <strong>Invoice #${invoice.invoiceNumber}:</strong> $${invoice.total.toFixed(2)}</li>`).join('')
            : "<li>No invoices were marked as paid in the last 7 days.</li>";

        const dueItemsHtml = dueThisWeek.length > 0
            ? dueThisWeek.map(invoice => `<li>⏳ <strong>Invoice #${invoice.invoiceNumber}:</strong> $${invoice.total.toFixed(2)} (Due: ${invoice.dueDate})</li>`).join('')
            : "<li>No invoices are due in the next 7 days.</li>";

        const emailHtml = `
            <div style="font-family: 'Inter', Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background-color: #111d2f; color: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #1e293b;">
                <h1 style="color: #60a5fa; margin-bottom: 24px;">Your Weekly Invoice Summary 📊</h1>
                <p style="font-size: 16px; line-height: 1.6; color: #e2e8f0;">
                    Hi ${userName},
                </p>
                <p style="font-size: 16px; line-height: 1.6; color: #e2e8f0;">
                    Here is your summary for the past week and the week ahead.
                </p>
                
                <div style="background-color: #1e293b; padding: 24px; border-radius: 8px; margin: 32px 0;">
                    <h2 style="color: #f8fafc; font-size: 18px; margin-top: 0; margin-bottom: 16px;">Invoices Paid Last Week</h2>
                    <ul style="color: #cbd5e1; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                        ${paidItemsHtml}
                    </ul>
                </div>
                
                <div style="background-color: #1e293b; padding: 24px; border-radius: 8px; margin: 32px 0;">
                    <h2 style="color: #f8fafc; font-size: 18px; margin-top: 0; margin-bottom: 16px;">Invoices Due This Week</h2>
                    <ul style="color: #cbd5e1; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                        ${dueItemsHtml}
                    </ul>
                </div>

                <div style="text-align: center; margin-top: 32px;">
                    <a href="https://scangoinvoice.com" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                        View Your Dashboard
                    </a>
                </div>

                <hr style="border: none; border-top: 1px solid #334155; margin: 40px 0;">
                
                <p style="font-size: 14px; color: #94a3b8; text-align: center; margin: 0;">
                    Need help? Simply <a href="mailto:support@scangoinvoice.com" style="color: #60a5fa; text-decoration: none;">click here</a> to reach our support team.<br>
                    — The ScanGo Invoice Team
                </p>
            </div>
        `;

      try {
        await resend.emails.send({
          from: "ScanGo Invoice <support@scangoinvoice.com>",
          to: user.email,
          subject: "Your Weekly Invoice Report",
          html: emailHtml,
        });
      } catch (error) {
        console.error(`Error sending email to ${user.email}:`, error);
      }
    }
  }
});
