const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const qrcode = require("qrcode");
const sharp = require("sharp");
const axios = require("axios");

exports.generateVenmoQR = onCall({ enforceAppCheck: false }, async (request) => {
  const { auth, data } = request;

  if (!auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const { venmoUsername } = data;
  if (!venmoUsername) {
    throw new HttpsError("invalid-argument", 'The function must be called with a "venmoUsername" argument.');
  }

  try {
    const userSettingsDoc = await admin.firestore().collection("userSettings").doc(auth.uid).get();
    const companyLogoUrl = userSettingsDoc.data()?.company?.logoUrl;

    const venmoPaymentUrl = `https://venmo.com/u/${venmoUsername}`;
    const qrCodeBuffer = await qrcode.toBuffer(venmoPaymentUrl, { errorCorrectionLevel: 'H', margin: 1 });

    let finalImageBuffer;

    if (companyLogoUrl) {
      const logoResponse = await axios({ url: companyLogoUrl, responseType: 'arraybuffer' });
      const logoBuffer = Buffer.from(logoResponse.data, 'binary');

      const qrImage = sharp(qrCodeBuffer);
      const qrMetadata = await qrImage.metadata();

      const logoSize = Math.floor(qrMetadata.width * 0.25);
      const resizedLogo = await sharp(logoBuffer).resize(logoSize, logoSize, { fit: 'inside' }).toBuffer();

      finalImageBuffer = await qrImage
        .composite([{ input: resizedLogo, gravity: 'center' }])
        .toBuffer();
    } else {
      finalImageBuffer = qrCodeBuffer;
    }

    const bucket = admin.storage().bucket();
    const fileName = `venmo-qrcodes/${auth.uid}.png`;
    const file = bucket.file(fileName);

    await file.save(finalImageBuffer, {
      metadata: {
        contentType: "image/png",
        cacheControl: 'public, max-age=31536000',
      },
    });

    await file.makePublic();
    const timestamp = Date.now();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}?t=${timestamp}`;

    await admin.firestore().collection("userSettings").doc(auth.uid).set(
      { company: { venmoQrUrl: publicUrl } },
      { merge: true }
    );

    return { venmoQrUrl: publicUrl };

  } catch (error) {
    console.error("Error generating Venmo QR code:", error);
    throw new HttpsError("internal", "Failed to generate Venmo QR code.", { error: error.message });
  }
});
