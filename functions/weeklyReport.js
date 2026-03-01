
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { Resend } = require("resend");

// Initialize Resend with your API key
const resend = new Resend(functions.config().resend.api_key);

// Function to send weekly report email
exports.sendWeeklyReport = functions.pubsub.schedule("every monday 08:00").onRun(async (context) => {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const usersSnapshot = await admin.firestore().collection("users").get();

  for (const userDoc of usersSnapshot.docs) {
    const user = userDoc.data();
    const userId = userDoc.id;

    const paidLastWeekSnapshot = await admin.firestore().collection("invoices")
      .where("userId", "==", userId)
      .where("status", "==", "Paid")
      .where("paidAt", ">=", oneWeekAgo)
      .get();

    const dueThisWeekSnapshot = await admin.firestore().collection("invoices")
      .where("userId", "==", userId)
      .where("status", "in", ["Pending", "Overdue"])
      .where("dueDate", "<=", oneWeekFromNow)
      .get();

    const paidLastWeek = paidLastWeekSnapshot.docs.map(doc => doc.data());
    const dueThisWeek = dueThisWeekSnapshot.docs.map(doc => doc.data());

    if (paidLastWeek.length > 0 || dueThisWeek.length > 0) {
      try {
        await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: user.email,
          subject: "Your Weekly Invoice Report",
          html: `
            <h1>Weekly Invoice Report</h1>
            <h2>Invoices Paid Last Week</h2>
            <ul>
              ${paidLastWeek.map(invoice => `<li>${invoice.invoiceNumber} - $${invoice.total}</li>`).join('')}
            </ul>
            <h2>Invoices Due This Week</h2>
            <ul>
              ${dueThisWeek.map(invoice => `<li>${invoice.invoiceNumber} - $${invoice.total}</li>`).join('')}
            </ul>
          `
        });
      } catch (error) {
        console.error("Error sending email:", error);
      }
    }
  }
});
