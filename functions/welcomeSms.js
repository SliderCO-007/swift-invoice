const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const { defineString } = require("firebase-functions/params");

const twilioAccountSid = defineString("TWILIO_ACCOUNT_SID");
const twilioAuthToken = defineString("TWILIO_AUTH_TOKEN");
const twilioPhoneNumber = defineString("TWILIO_PHONE_NUMBER");

/**
 * Formats phone to E.164 (+1NXXNXXNXX)
 */
function formatE164(phone) {
  if (!phone) return "";
  let cleaned = String(phone).replace(/[^\d+]/g, "");
  if (!cleaned.startsWith("+")) {
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
 * Fires when a new user document is created in Firestore.
 * If the merchant provided a phone number and opted in on registration,
 * dispatches an instant Welcome SMS confirming subscription and CTIA terms.
 */
exports.sendWelcomeSms = onDocumentCreated({ document: "users/{userId}" }, async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  const userData = snapshot.data();
  const userId = event.params.userId;

  // Check if user provided phone & opted into SMS
  if (!userData.smsOptIn || !userData.phone) {
    console.log(`Skipping Welcome SMS for user ${userId}: No SMS opt-in or phone number provided.`);
    return;
  }

  const formattedPhone = formatE164(userData.phone);
  if (!formattedPhone || formattedPhone.length < 11) {
    console.warn(`Skipping Welcome SMS for user ${userId}: Invalid phone number format (${userData.phone}).`);
    return;
  }

  try {
    const accountSid = twilioAccountSid.value();
    const authToken = twilioAuthToken.value();
    const fromPhone = twilioPhoneNumber.value();

    if (!accountSid || !authToken || !fromPhone) {
      console.warn("Skipping Welcome SMS: Twilio environment credentials not configured.");
      return;
    }

    const twilio = require("twilio");
    const client = twilio(accountSid, authToken);

    const smsBody = "Welcome to ScanGo Invoice! Your account is active. You will receive account & billing notifications here. Msg&data rates may apply. Reply STOP to opt out, HELP for info.";

    const message = await client.messages.create({
      body: smsBody,
      from: fromPhone,
      to: formattedPhone,
    });

    const db = admin.firestore();
    await db.collection("users").doc(userId).collection("smsLogs").add({
      type: "welcome_sms",
      phone: formattedPhone,
      sid: message.sid,
      status: message.status || "sent",
      consentAttested: true,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      body: smsBody,
    });

    console.log(`Welcome SMS sent successfully to user ${userId} at ${formattedPhone} (SID: ${message.sid})`);
  } catch (error) {
    console.error(`Error sending Welcome SMS to user ${userId}:`, error);
  }
});
