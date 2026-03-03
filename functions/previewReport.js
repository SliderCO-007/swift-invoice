
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { defineString } = require("firebase-functions/params");
const { Resend } = require("resend");

const resendApiKey = defineString("RESEND_API_KEY");

const toYYYYMMDD = (date) => {
  if (!date) return '';
  const jsDate = date.toDate ? date.toDate() : date;
  return jsDate.toISOString().split('T')[0];
};

exports.sendPreviewReport = onCall({ enforceAppCheck: false }, async (request) => {
  const { auth, data } = request;
  const { recipientEmail } = data;

  if (!auth) {
    throw new HttpsError('unauthenticated', 'Authentication is required.');
  }

  const userId = auth.uid;

  // --- Subscription Check ---
  try {
    const userDoc = await admin.firestore().collection("users").doc(userId).get();
    if (!userDoc.exists || userDoc.data().subscriptionStatus !== 'active') {
      throw new HttpsError('permission-denied', 'You must have an active subscription to use this feature.');
    }
  } catch (error) {
    console.error(`Error checking subscription for user ${userId}:`, error);
    if (error instanceof HttpsError) throw error; // Re-throw HttpsError
    throw new HttpsError('internal', 'An error occurred while verifying your subscription status.');
  }
  // --- End Subscription Check ---

  if (!recipientEmail) {
    throw new HttpsError('invalid-argument', 'A recipient email is required.');
  }

  const resend = new Resend(resendApiKey.value());

  const today = new Date();
  const oneWeekAgo = new Date(new Date().setDate(today.getDate() - 7));
  const oneWeekFromNow = new Date(new Date().setDate(today.getDate() + 7));

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
    console.error("Error fetching paid invoices:", error);
    throw new HttpsError('internal', `Failed to fetch paid invoices. Firestore error: ${error.message}`);
  }

  try {
    dueThisWeekSnapshot = await admin.firestore().collection("invoices")
      .where("userId", "==", userId)
      .where("status", "in", ["pending", "overdue"])
      .where("dueDate", ">=", today)
      .where("dueDate", "<=", oneWeekFromNow)
      .get();
  } catch (error) {
    console.error("Error fetching due invoices:", error);
    throw new HttpsError('internal', `Failed to fetch due invoices. Firestore error: ${error.message}`);
  }

  try {
    const paidLastWeek = paidLastWeekSnapshot.docs.map(doc => doc.data());
    const dueThisWeek = dueThisWeekSnapshot.docs.map(doc => {
        const data = doc.data();
        return { ...data, dueDate: toYYYYMMDD(data.dueDate) };
    });

    const paidItemsHtml = paidLastWeek.length > 0
      ? paidLastWeek.map(invoice => `<li>Invoice #${invoice.invoiceNumber} - $${invoice.total.toFixed(2)}</li>`).join('')
      : "<li>No invoices were marked as paid in the last 7 days.</li>";

    const dueItemsHtml = dueThisWeek.length > 0
      ? dueThisWeek.map(invoice => `<li>Invoice #${invoice.invoiceNumber} - $${invoice.total.toFixed(2)} (Due: ${invoice.dueDate})</li>`).join('')
      : "<li>No invoices are due in the next 7 days.</li>";

    const emailHtml = `
      <h1>Weekly Invoice Report (Preview)</h1>
      <p>This is a preview of your weekly invoice summary.</p>
      
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

    await resend.emails.send({
      from: 'no-reply@scangoinvoice.com',
      to: recipientEmail,
      subject: "Preview: Your Weekly Invoice Report",
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
    throw new HttpsError('internal', 'An unexpected error occurred while constructing or sending the email.');
  }
});
