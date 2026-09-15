const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { verifyUnsubscribeToken } = require("./unsubscribeHelper");

/**
 * HTTP endpoint allowing users to unsubscribe from weekly invoice reports with a single click.
 * Supports both JSON API requests and direct browser GET requests.
 */
exports.unsubscribeWeeklyReport = onRequest({ cors: true }, async (req, res) => {
  const uid = req.query.uid || req.body?.uid;
  const token = req.query.token || req.body?.token;
  const action = req.query.action || req.body?.action || 'unsubscribe'; // 'unsubscribe' or 'resubscribe'

  if (!uid || !token) {
    if (req.headers.accept?.includes("application/json") || req.method === "POST") {
      return res.status(400).json({ error: "Missing required parameters: uid and token are required." });
    }
    return res.status(400).send(renderErrorHtml("Missing Parameters", "Invalid unsubscribe link. Please ensure the full link from your email was opened."));
  }

  const isValid = verifyUnsubscribeToken(uid, token);
  if (!isValid) {
    if (req.headers.accept?.includes("application/json") || req.method === "POST") {
      return res.status(403).json({ error: "Invalid or forged security token." });
    }
    return res.status(403).send(renderErrorHtml("Invalid Security Token", "The unsubscribe link is invalid or has expired. Please log into your account settings to manage your preferences."));
  }

  const db = admin.firestore();

  try {
    const isOptOut = action !== 'resubscribe';
    
    // 1. Update user document
    await db.collection("users").doc(uid).set({
      weeklyReportOptOut: isOptOut,
      weeklyReportUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // 2. Also update userSettings document if it exists or by orgId
    try {
      const userDoc = await db.collection("users").doc(uid).get();
      const orgId = userDoc.exists && userDoc.data().orgId ? userDoc.data().orgId : uid;
      await db.collection("userSettings").doc(orgId).set({
        weeklyReportEnabled: !isOptOut,
      }, { merge: true });
    } catch (settingsErr) {
      console.warn(`Could not update userSettings for ${uid}:`, settingsErr.message);
    }

    if (req.headers.accept?.includes("application/json") || req.method === "POST") {
      return res.status(200).json({
        success: true,
        optedOut: isOptOut,
        message: isOptOut
          ? "You have been successfully unsubscribed from weekly reports."
          : "You have been successfully re-subscribed to weekly reports.",
      });
    }

    // Direct browser redirect or branded confirmation page
    const redirectUrl = `https://scangoinvoice.com/unsubscribe?status=${isOptOut ? 'unsubscribed' : 'subscribed'}&uid=${encodeURIComponent(uid)}&token=${encodeURIComponent(token)}`;
    return res.redirect(302, redirectUrl);

  } catch (err) {
    console.error(`Error processing unsubscribe for user ${uid}:`, err);
    if (req.headers.accept?.includes("application/json") || req.method === "POST") {
      return res.status(500).json({ error: "Internal server error updating notification preferences." });
    }
    return res.status(500).send(renderErrorHtml("System Error", "An unexpected error occurred while updating your preferences. Please try again or update your settings directly on ScanGo Invoice."));
  }
});

function renderErrorHtml(title, message) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | ScanGo Invoice</title>
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b1320; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
    .card { background: #111d2f; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 40px 32px; max-width: 480px; width: 100%; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    h1 { color: #f87171; font-size: 22px; margin-bottom: 12px; }
    p { color: #94a3b8; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 15px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="https://scangoinvoice.com/settings" class="btn">Go to Settings</a>
  </div>
</body>
</html>`;
}
