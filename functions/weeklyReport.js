
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
        const paidItemsHtml = paidLastWeek.length > 0
            ? paidLastWeek.map(invoice => `<li>Invoice #${invoice.invoiceNumber} - $${invoice.total.toFixed(2)}</li>`).join('')
            : "<li>No invoices were marked as paid in the last 7 days.</li>";

        const dueItemsHtml = dueThisWeek.length > 0
            ? dueThisWeek.map(invoice => `<li>Invoice #${invoice.invoiceNumber} - $${invoice.total.toFixed(2)} (Due: ${invoice.dueDate})</li>`).join('')
            : "<li>No invoices are due in the next 7 days.</li>";

        const emailHtml = `
            <h1>Your Weekly Invoice Summary</h1>
            <p>Here is your summary for the past week and the week ahead.</p>
            
            <h2>Invoices Paid Last Week</h2>
            <ul>
                ${paidItemsHtml}
            </ul>
            
            <h2>Invoices Due This Week</h2>
            <ul>
                ${dueItemsHtml}
            </ul>

            <br>
            <p><i>This is an automated email. Please do not reply.</i></p>
        `;

      try {
        await resend.emails.send({
          from: 'no-reply@scangoinvoice.com',
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
