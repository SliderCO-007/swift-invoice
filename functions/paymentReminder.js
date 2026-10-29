const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { Resend } = require("resend");
const { defineString } = require("firebase-functions/params");

const resendApiKey = defineString("RESEND_API_KEY");

/**
 * Safely escapes HTML special characters in user-supplied plain text
 */
const escapeHtml = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/**
 * Safely formats a Firestore Timestamp, Date, or ISO string into a readable date string
 */
const formatReadableDate = (dateVal) => {
  if (!dateVal) return "Past Due";
  let jsDate;
  if (typeof dateVal.toDate === "function") {
    jsDate = dateVal.toDate();
  } else if (dateVal._seconds !== undefined) {
    jsDate = new Date(dateVal._seconds * 1000);
  } else if (dateVal.seconds !== undefined) {
    jsDate = new Date(dateVal.seconds * 1000);
  } else {
    jsDate = new Date(dateVal);
  }
  if (isNaN(jsDate.getTime())) return String(dateVal);
  return jsDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Calculates exact invoice total accounting for line items, discounts, and per-item taxability
 */
const calculateInvoiceTotal = (invoice) => {
  if (typeof invoice.total === "number" && !isNaN(invoice.total) && invoice.total > 0) {
    return invoice.total;
  }
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const subtotal = items.reduce(
    (acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.price) || 0),
    0
  );
  const taxableSubtotal = items.reduce((acc, item) => {
    const isTaxable = item.taxable !== false;
    return acc + (isTaxable ? (Number(item.quantity) || 0) * (Number(item.price) || 0) : 0);
  }, 0);

  let discountAmount = 0;
  if (invoice.discount) {
    if (invoice.discountType === "percentage") {
      discountAmount = subtotal * (Number(invoice.discount) / 100);
    } else {
      discountAmount = Number(invoice.discount);
    }
  }

  const postDiscountSubtotal = subtotal - discountAmount;
  const rate = Number(invoice.taxRate) || 0;
  let taxAmount = 0;
  if (rate > 0 && subtotal > 0) {
    const ratio = taxableSubtotal / subtotal;
    const postDiscountTaxableSubtotal = taxableSubtotal - discountAmount * ratio;
    taxAmount = Math.max(0, postDiscountTaxableSubtotal) * (rate / 100);
  }

  return Math.max(0, postDiscountSubtotal + taxAmount);
};

/**
 * Renders the branded HTML email for an Overdue Payment Reminder
 */
const buildManualReminderEmailHtml = ({
  companyName,
  invoiceNumber,
  formattedTotal,
  formattedDueDate,
  customMessage,
  paymentUrl,
}) => {
  const paragraphs = String(customMessage || "")
    .trim()
    .split(/\n\s*\n/)
    .map((para) => {
      const safeLines = escapeHtml(para.trim()).replace(/\n/g, "<br>");
      return `<p style="font-size: 15px; line-height: 1.65; color: #e2e8f0; margin: 0 0 16px 0;">${safeLines}</p>`;
    })
    .join("");

  return `
    <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #111d2f; color: #ffffff; padding: 40px 32px; border-radius: 16px; border: 1px solid #1e293b; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
      <div style="text-align: center; margin-bottom: 28px;">
        <span style="background-color: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.35); font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.6px; display: inline-block;">
          Overdue Payment Reminder
        </span>
        <h1 style="color: #ffffff; font-size: 24px; margin-top: 16px; margin-bottom: 6px; font-weight: 700;">
          Invoice #${escapeHtml(invoiceNumber)}
        </h1>
        <p style="color: #94a3b8; font-size: 14px; margin: 0;">
          From ${escapeHtml(companyName)}
        </p>
      </div>

      <div style="background-color: #1e293b; padding: 24px; border-radius: 12px; margin-bottom: 28px; border: 1px solid rgba(255, 255, 255, 0.06);">
        ${paragraphs}
      </div>

      <div style="background-color: #0f172a; padding: 20px 24px; border-radius: 12px; margin-bottom: 32px; border: 1px solid rgba(248, 113, 113, 0.2);">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #94a3b8; font-size: 14px;">Invoice Number</td>
            <td style="padding: 6px 0; color: #ffffff; font-weight: 600; font-size: 14px; text-align: right;">#${escapeHtml(invoiceNumber)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8; font-size: 14px;">Original Due Date</td>
            <td style="padding: 6px 0; color: #f87171; font-weight: 600; font-size: 14px; text-align: right;">${escapeHtml(formattedDueDate)} (Overdue)</td>
          </tr>
          <tr>
            <td style="padding: 12px 0 4px 0; border-top: 1px solid #1e293b; color: #f8fafc; font-size: 16px; font-weight: 700;">Amount Due</td>
            <td style="padding: 12px 0 4px 0; border-top: 1px solid #1e293b; color: #38bdf8; font-weight: 700; font-size: 18px; text-align: right;">${escapeHtml(formattedTotal)}</td>
          </tr>
        </table>
      </div>

      ${
        paymentUrl
          ? `
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${paymentUrl}" target="_blank" rel="noopener noreferrer" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);">
            View &amp; Pay Invoice Online →
          </a>
        </div>
      `
          : ""
      }

      <div style="border-top: 1px solid #1e293b; padding-top: 20px; text-align: center; color: #64748b; font-size: 12px;">
        <p style="margin: 0;">Sent via ScanGo Invoice on behalf of ${escapeHtml(companyName)}.</p>
      </div>
    </div>
  `;
};

/**
 * Callable Cloud Function to send a one-click overdue payment reminder email
 * and track reminderCount + lastReminderSentAt on the invoice document.
 */
exports.sendPaymentReminder = onCall({ enforceAppCheck: false }, async (request) => {
  const { auth, data } = request;

  if (!auth) {
    throw new HttpsError("unauthenticated", "Authentication is required.");
  }

  const { invoiceId, recipientEmail, subject, message } = data || {};
  if (!invoiceId || !recipientEmail || !subject || !message) {
    throw new HttpsError(
      "invalid-argument",
      "Required fields (invoiceId, recipientEmail, subject, message) are missing."
    );
  }

  const db = admin.firestore();
  const apiKey = resendApiKey.value();
  if (!apiKey) {
    throw new HttpsError("internal", "Email service is not configured.");
  }

  try {
    const invoiceRef = db.collection("invoices").doc(invoiceId);
    const invoiceDoc = await invoiceRef.get();

    if (!invoiceDoc.exists) {
      throw new HttpsError("not-found", "Invoice not found.");
    }

    const invoiceData = invoiceDoc.data();
    const userDoc = await db.collection("users").doc(auth.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    const userOrgId = userData.orgId || auth.uid;
    const invoiceOrgId = invoiceData.orgId || invoiceData.userId;

    if (invoiceData.userId !== auth.uid && invoiceOrgId !== userOrgId) {
      throw new HttpsError(
        "permission-denied",
        "You do not have permission to send a reminder for this invoice."
      );
    }

    const settingsDoc = await db.collection("userSettings").doc(invoiceOrgId).get();
    const settings = settingsDoc.exists ? settingsDoc.data() : {};

    const companyName =
      invoiceData.sender?.name ||
      settings.company?.name ||
      userData.name ||
      "Your Service Provider";
    const replyToEmail =
      invoiceData.sender?.email ||
      settings.company?.email ||
      userData.email ||
      auth.token?.email ||
      undefined;

    const currency = invoiceData.currency || settings.currency || "USD";
    const totalAmount = calculateInvoiceTotal(invoiceData);
    const formattedTotal = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(totalAmount);

    const formattedDueDate = formatReadableDate(invoiceData.dueDate);
    const invoiceNumber = invoiceData.invoiceNumber || invoiceId;

    const appHost =
      process.env.APP_URL || process.env.VITE_APP_URL || "https://scangoinvoice.com";
    const paymentUrl = `${appHost}/pay/${invoiceId}`;

    const emailHtml = buildManualReminderEmailHtml({
      companyName,
      invoiceNumber,
      formattedTotal,
      formattedDueDate,
      customMessage: message,
      paymentUrl,
    });

    const resend = new Resend(apiKey);
    const emailPayload = {
      from: `${companyName.replace(/[<>]/g, "")} <billing@scangoinvoice.com>`,
      to: [recipientEmail.trim()],
      subject: subject.trim(),
      html: emailHtml,
    };
    if (replyToEmail) {
      emailPayload.reply_to = replyToEmail;
    }

    await resend.emails.send(emailPayload);

    const nowIso = new Date().toISOString();
    const nextReminderCount = (Number(invoiceData.reminderCount) || 0) + 1;

    await invoiceRef.update({
      reminderCount: admin.firestore.FieldValue.increment(1),
      lastReminderSentAt: admin.firestore.FieldValue.serverTimestamp(),
      reminderHistory: admin.firestore.FieldValue.arrayUnion({
        sentAt: nowIso,
        to: recipientEmail.trim(),
        subject: subject.trim(),
      }),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: `Payment reminder sent to ${recipientEmail.trim()}`,
      reminderCount: nextReminderCount,
      lastReminderSentAt: nowIso,
    };
  } catch (error) {
    console.error("Error sending payment reminder:", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError(
      "internal",
      error.message || "An unexpected error occurred while sending the payment reminder."
    );
  }
});
