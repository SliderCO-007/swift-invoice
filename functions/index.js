
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { defineString } = require("firebase-functions/params");
const { Resend } = require("resend");

admin.initializeApp();
const db = admin.firestore();

// Define secrets as parameters for security
const stripeSecretKey = defineString("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineString("STRIPE_WEBHOOK_SECRET");
const resendApiKey = defineString("RESEND_API_KEY");

const weeklyReport = require("./weeklyReport");
exports.sendWeeklyReport = weeklyReport.sendWeeklyReport;

const previewReport = require("./previewReport");
exports.sendPreviewReport = previewReport.sendPreviewReport;

const generateVenmoQR = require("./generateVenmoQR");
exports.generateVenmoQR = generateVenmoQR.generateVenmoQR;

const welcomeEmail = require("./welcomeEmail");
exports.sendWelcomeEmail = welcomeEmail.sendWelcomeEmail;

const stripeConnect = require("./stripeConnect");
exports.createConnectAccount = stripeConnect.createConnectAccount;
exports.getStripeConnectStatus = stripeConnect.getStripeConnectStatus;
exports.getInvoiceForPayment = stripeConnect.getInvoiceForPayment;
exports.createInvoicePaymentSession = stripeConnect.createInvoicePaymentSession;
exports.stripeConnectWebhook = stripeConnect.stripeConnectWebhook;



/**
 * Creates a Stripe Checkout session for a subscription plan.
 */
exports.createCheckoutSession = onCall({ enforceAppCheck: false }, async (request) => {
  const { auth, data } = request;

  // Ensure the user is authenticated
  if (!auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const stripe = require("stripe")(stripeSecretKey.value());
  const { priceId, successUrl, cancelUrl } = data;

  // Validate required parameters
  if (!priceId) {
    throw new HttpsError('invalid-argument', 'A price ID is required to create a checkout session.');
  }
  if (!successUrl || !cancelUrl) {
    throw new HttpsError('invalid-argument', 'Both a success and cancel URL are required.');
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      client_reference_id: auth.uid,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: auth.token.email,
    });

    return { id: session.id, url: session.url };

  } catch (error) {
    console.error("Error creating Stripe Checkout session:", error.message);
    throw new HttpsError('internal', 'An error occurred while creating the checkout session.');
  }
});


/**
 * Handles incoming webhooks from Stripe to update user subscription status in Firestore.
 */
exports.stripeWebhook = onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  let event;
  let stripe;

  try {
    // Initialize stripe safely inside try block to catch secret loading issues
    const apiKey = stripeSecretKey.value();
    const webhookSecret = stripeWebhookSecret.value();
    
    if (!apiKey || !webhookSecret) {
        console.error("Missing Stripe API Key or Webhook Secret.");
        return res.status(500).send("Server Configuration Error");
    }

    stripe = require("stripe")(apiKey);
    const sig = req.headers["stripe-signature"];

    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  const handleCheckoutSessionCompleted = async (session) => {
    const uid = session.client_reference_id;
    if (!uid) {
      console.warn("Webhook received checkout.session.completed without a client_reference_id (uid).");
      return;
    }
    try {
      await db.collection('users').doc(uid).update({
        subscriptionStatus: 'active',
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription
      });
      console.log(`Successfully activated subscription for user: ${uid}`);
    } catch (dbError) {
      console.error(`Database error activating subscription for user ${uid}:`, dbError);
    }
  };

  const handleSubscriptionDeleted = async (subscription) => {
    try {
      const stripeCustomerId = subscription.customer;
      const usersQuery = db.collection('users').where('stripeCustomerId', '==', stripeCustomerId);
      const userSnapshot = await usersQuery.get();
      
      if (userSnapshot.empty) {
        console.warn(`Could not find user with Stripe customer ID: ${stripeCustomerId}`);
        return;
      }
      
      // Fix: Await all updates instead of unhandled Promise execution in forEach
      const updatePromises = userSnapshot.docs.map((doc) => 
        doc.ref.update({ subscriptionStatus: 'free' })
      );
      
      await Promise.all(updatePromises);
      console.log(`Successfully downgraded subscription for Stripe customer ID: ${stripeCustomerId}`);
    } catch (err) {
      console.error(`Database error downgrading subscription for customer ${subscription.customer}:`, err);
    }
  };

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Always enthusiastically confirm receipt 
    return res.status(200).send({ received: true });

  } catch(err) {
      console.error('Unhandled webhook error in event processing:', err);
      // Let Stripe know there was an application error so it can optionally retry
      return res.status(500).send(`Webhook Application Error: ${err.message}`);
  }
});

/**
 * Attaches a client-generated PDF to an email and sends it.
 */
exports.sendInvoiceEmail = onCall({ enforceAppCheck: false }, async (request) => {
    const { auth, data } = request;

    // 1. Authentication & Authorization
    if (!auth) {
        console.error("Authentication failed: No auth object present.");
        throw new HttpsError('unauthenticated', 'Authentication is required.');
    }
    const userDoc = await db.collection('users').doc(auth.uid).get();
    if (!userDoc.exists || userDoc.data().subscriptionStatus !== 'active') {
        console.error("Authorization failed: User does not have a valid subscription.");
        throw new HttpsError('permission-denied', 'A Pro or Business plan is required to send invoices.');
    }

    // 2. Data Validation
    const { invoiceId, recipientEmail, subject, message, pdfBase64 } = data;
    if (!invoiceId || !recipientEmail || !subject || !message || !pdfBase64) {
        console.error("Data validation failed: Missing required fields.");
        throw new HttpsError('invalid-argument', 'Required fields (invoiceId, recipientEmail, subject, message, pdfBase64) are missing.');
    }

    try {
        // 3. Fetch Invoice for Validation and Filename
        const invoiceRef = db.collection('invoices').doc(invoiceId);
        const invoiceDoc = await invoiceRef.get();

        if (!invoiceDoc.exists) {
            console.error(`Invoice not found for ID: ${invoiceId}`);
            throw new HttpsError('not-found', 'Invoice not found.');
        }
        const invoiceData = invoiceDoc.data();
        if (invoiceData.userId !== auth.uid) {
            console.error("Permission denied: User does not have permission to send this invoice.");
            throw new HttpsError('permission-denied', 'You do not have permission to send this invoice.');
        }

        // 4. Convert Base64 PDF to a Buffer
        const pdfBuffer = Buffer.from(pdfBase64, 'base64');

        // 5. Send Email with the PDF Attachment
        const resend = new Resend(resendApiKey.value());
        await resend.emails.send({
            from: 'no-reply@scangoinvoice.com',
            to: recipientEmail,
            subject: subject,
            html: message, // Message is already HTML formatted from the client
            attachments: [{
                filename: `Invoice-${invoiceData.invoiceNumber}.pdf`,
                content: pdfBuffer,
            }],
        });

        return { success: true, message: `Invoice sent to ${recipientEmail}` };

    } catch (error) {
        console.error("Error sending invoice email:", error);
        if (error instanceof HttpsError) throw error;
        // Check for Resend-specific errors and provide a more detailed message
        if (error.response) {
            console.error('Resend API Error:', error.response.body);
            throw new HttpsError('internal', `Failed to send email via Resend: ${error.response.body.message}`);
        }
        throw new HttpsError('internal', 'An unexpected error occurred while sending the email.');
    }
});
