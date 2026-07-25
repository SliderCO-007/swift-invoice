const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { defineString } = require("firebase-functions/params");

const twilioAccountSid = defineString("TWILIO_ACCOUNT_SID");
const twilioAuthToken = defineString("TWILIO_AUTH_TOKEN");
const twilioPhoneNumber = defineString("TWILIO_PHONE_NUMBER");

/**
 * Normalizes phone numbers to standard E.164 format (+1NXXNXXNXX for US/Canada)
 */
function formatE164(phone) {
  if (!phone) return "";
  let cleaned = String(phone).replace(/[^\d+]/g, "");
  if (!cleaned.startsWith("+")) {
    // Default 10-digit US/Canada numbers to +1
    if (cleaned.length === 10) {
      cleaned = "+1" + cleaned;
    } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
      cleaned = "+" + cleaned;
    } else {
      cleaned = "+" + cleaned;
    }
  }
  return cleaned;
}

/**
 * Callable Cloud Function to send Text-2-Pay SMS invoice to client.
 */
exports.sendSmsInvoice = onCall({ enforceAppCheck: false }, async (request) => {
  const { auth, data } = request;

  // 1. Authentication
  if (!auth) {
    throw new HttpsError("unauthenticated", "Authentication is required to send SMS invoices.");
  }

  const db = admin.firestore();

  // 2. Authorization (Pro/Paid Plan Gate)
  const userDoc = await db.collection("users").doc(auth.uid).get();
  if (!userDoc.exists || userDoc.data().subscriptionStatus !== "active") {
    throw new HttpsError(
      "permission-denied",
      "A Pro subscription is required to use Text-2-Pay SMS invoicing."
    );
  }

  // 3. Input Validation
  const { invoiceId, clientPhone: overridePhone } = data || {};
  if (!invoiceId) {
    throw new HttpsError("invalid-argument", "Invoice ID is required.");
  }

  try {
    // 4. Fetch Invoice
    const invoiceRef = db.collection("invoices").doc(invoiceId);
    const invoiceDoc = await invoiceRef.get();

    if (!invoiceDoc.exists) {
      throw new HttpsError("not-found", "Invoice not found.");
    }

    const invoiceData = invoiceDoc.data();
    if (invoiceData.userId !== auth.uid) {
      throw new HttpsError("permission-denied", "You do not have permission to access this invoice.");
    }

    // Determine target phone number
    const targetPhoneRaw = overridePhone || invoiceData.client?.phone;
    if (!targetPhoneRaw) {
      throw new HttpsError(
        "invalid-argument",
        "Client phone number is missing. Please provide a phone number."
      );
    }

    const formattedPhone = formatE164(targetPhoneRaw);
    if (!formattedPhone || formattedPhone.length < 11) {
      throw new HttpsError(
        "invalid-argument",
        "Invalid phone number format. Please provide a valid 10-digit phone number."
      );
    }

    // 5. Fetch Merchant Business Profile
    const settingsDoc = await db.collection("userSettings").doc(auth.uid).get();
    const companyName = settingsDoc.exists && settingsDoc.data().company?.name
      ? settingsDoc.data().company.name
      : "ScanGo Merchant";

    // Calculate total amount
    const subtotal = (invoiceData.items || []).reduce(
      (acc, item) => acc + (item.quantity || 0) * (item.price || 0),
      0
    );
    const taxRate = Number(invoiceData.taxRate) || 0;
    const discount = Number(invoiceData.discount) || 0;
    const discountType = invoiceData.discountType || "amount";
    
    let discountAmount = 0;
    if (discountType === "percentage") {
      discountAmount = subtotal * (discount / 100);
    } else {
      discountAmount = discount;
    }
    
    const taxableSubtotal = (invoiceData.items || []).reduce((acc, item) => {
      if (item.taxable !== false) {
        return acc + (item.quantity || 0) * (item.price || 0);
      }
      return acc;
    }, 0);

    const taxAmount = (taxableSubtotal - (subtotal > 0 ? (discountAmount * (taxableSubtotal / subtotal)) : 0)) * (taxRate / 100);
    const totalAmount = Math.max(0, subtotal - discountAmount + taxAmount);
    const formattedTotal = totalAmount.toFixed(2);

    const payUrl = `https://scangoinvoice.com/pay/${invoiceId}`;

    // 6. Build Compliant SMS Body
    const smsBody = `ScanGo Invoice #${invoiceData.invoiceNumber} for $${formattedTotal} from ${companyName} is ready. Pay online here: ${payUrl} - Reply STOP to opt out, HELP for info.`;

    // 7. Send via Twilio API
    const accountSid = twilioAccountSid.value();
    const authToken = twilioAuthToken.value();
    const fromPhone = twilioPhoneNumber.value();

    if (!accountSid || !authToken || !fromPhone) {
      console.error("Twilio credentials not configured in Firebase secrets.");
      throw new HttpsError("internal", "SMS service is not fully configured on server.");
    }

    const twilio = require("twilio");
    const client = twilio(accountSid, authToken);

    const message = await client.messages.create({
      body: smsBody,
      from: fromPhone,
      to: formattedPhone,
    });

    // 8. Log SMS Activity in Firestore
    const logData = {
      type: "invoice_sent",
      phone: formattedPhone,
      sid: message.sid,
      status: message.status || "sent",
      consentAttested: true,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      sentBy: auth.uid,
      body: smsBody,
    };

    await invoiceRef.collection("smsLogs").add(logData);

    // Also update phone on client object inside invoice if missing
    if (!invoiceData.client?.phone) {
      await invoiceRef.update({
        "client.phone": targetPhoneRaw,
      });
    }

    console.log(`Text-2-Pay SMS sent successfully for invoice ${invoiceId} to ${formattedPhone} (SID: ${message.sid})`);

    return {
      success: true,
      messageSid: message.sid,
      phone: formattedPhone,
      status: message.status || "sent",
    };

  } catch (error) {
    console.error("Error in sendSmsInvoice function:", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", error.message || "An error occurred sending Text-2-Pay SMS.");
  }
});

/**
 * Helper to dispatch automated payment receipt SMS when an invoice is marked paid.
 */
exports.sendPaymentReceiptSmsHelper = async function (invoiceId, invoiceData) {
  try {
    const clientPhoneRaw = invoiceData.client?.phone;
    if (!clientPhoneRaw) {
      console.log(`Skipping payment confirmation SMS for invoice ${invoiceId}: No client phone number.`);
      return;
    }

    const formattedPhone = formatE164(clientPhoneRaw);
    if (!formattedPhone || formattedPhone.length < 11) {
      console.warn(`Skipping payment confirmation SMS for invoice ${invoiceId}: Invalid phone ${clientPhoneRaw}.`);
      return;
    }

    const accountSid = twilioAccountSid.value();
    const authToken = twilioAuthToken.value();
    const fromPhone = twilioPhoneNumber.value();

    if (!accountSid || !authToken || !fromPhone) {
      console.warn("Skipping payment confirmation SMS: Twilio secrets not configured.");
      return;
    }

    const db = admin.firestore();
    const settingsDoc = await db.collection("userSettings").doc(invoiceData.userId).get();
    const companyName = settingsDoc.exists && settingsDoc.data().company?.name
      ? settingsDoc.data().company.name
      : "ScanGo Merchant";

    // Calculate total amount
    const subtotal = (invoiceData.items || []).reduce(
      (acc, item) => acc + (item.quantity || 0) * (item.price || 0),
      0
    );
    const taxRate = Number(invoiceData.taxRate) || 0;
    const discount = Number(invoiceData.discount) || 0;
    const discountType = invoiceData.discountType || "amount";
    
    let discountAmount = 0;
    if (discountType === "percentage") {
      discountAmount = subtotal * (discount / 100);
    } else {
      discountAmount = discount;
    }
    
    const taxableSubtotal = (invoiceData.items || []).reduce((acc, item) => {
      if (item.taxable !== false) {
        return acc + (item.quantity || 0) * (item.price || 0);
      }
      return acc;
    }, 0);

    const taxAmount = (taxableSubtotal - (subtotal > 0 ? (discountAmount * (taxableSubtotal / subtotal)) : 0)) * (taxRate / 100);
    const totalAmount = Math.max(0, subtotal - discountAmount + taxAmount);
    const formattedTotal = totalAmount.toFixed(2);

    const smsBody = `Payment Received! Invoice #${invoiceData.invoiceNumber} for $${formattedTotal} from ${companyName} has been paid in full. Thank you! - Reply STOP to opt out.`;

    const twilio = require("twilio");
    const client = twilio(accountSid, authToken);

    const message = await client.messages.create({
      body: smsBody,
      from: fromPhone,
      to: formattedPhone,
    });

    const invoiceRef = db.collection("invoices").doc(invoiceId);
    await invoiceRef.collection("smsLogs").add({
      type: "payment_receipt",
      phone: formattedPhone,
      sid: message.sid,
      status: message.status || "sent",
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      body: smsBody,
    });

    console.log(`Payment confirmation SMS sent for invoice ${invoiceId} to ${formattedPhone} (SID: ${message.sid})`);
  } catch (err) {
    console.error(`Failed to send payment confirmation SMS for invoice ${invoiceId}:`, err);
  }
};
