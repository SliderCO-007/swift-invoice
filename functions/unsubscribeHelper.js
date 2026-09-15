const crypto = require("crypto");

// Fallback salt if UNSUBSCRIBE_SECRET is not explicitly set in the environment
const UNSUBSCRIBE_SECRET = process.env.UNSUBSCRIBE_SECRET || "scango_weekly_report_secure_salt_9124f";

/**
 * Generates an HMAC-SHA256 signature for a user ID.
 * @param {string} userId 
 * @returns {string} 32-character hexadecimal token
 */
function generateUnsubscribeToken(userId) {
  if (!userId || typeof userId !== "string") return "";
  return crypto
    .createHmac("sha256", UNSUBSCRIBE_SECRET)
    .update(userId.trim())
    .digest("hex")
    .slice(0, 32);
}

/**
 * Verifies if the provided token matches the HMAC signature for the given user ID.
 * @param {string} userId 
 * @param {string} token 
 * @returns {boolean}
 */
function verifyUnsubscribeToken(userId, token) {
  if (!userId || !token || typeof token !== "string") return false;
  const expectedToken = generateUnsubscribeToken(userId);
  if (expectedToken.length !== token.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken));
  } catch {
    return false;
  }
}

/**
 * Constructs the canonical one-click unsubscribe URL.
 * @param {string} userId 
 * @param {string} [baseUrl] 
 * @returns {string}
 */
function getUnsubscribeUrl(userId, baseUrl = "https://scangoinvoice.com") {
  const token = generateUnsubscribeToken(userId);
  return `${baseUrl.replace(/\/$/, '')}/unsubscribe?uid=${encodeURIComponent(userId)}&token=${encodeURIComponent(token)}`;
}

module.exports = {
  generateUnsubscribeToken,
  verifyUnsubscribeToken,
  getUnsubscribeUrl,
};
