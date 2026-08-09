const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { defineString } = require("firebase-functions/params");

const stripeSecretKey = defineString("STRIPE_SECRET_KEY");

/**
 * Creates a Stripe Connect account for a user and returns an account onboarding link.
 */
exports.createConnectAccount = onCall({ enforceAppCheck: false }, async (request) => {
  const { auth, data } = request;
  if (!auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const stripe = require("stripe")(stripeSecretKey.value());
  const db = admin.firestore();
  
  const userRef = db.collection('users').doc(auth.uid);
  const userDoc = await userRef.get();
  const userData = userDoc.data() || {};

  let accountId = userData.stripeConnectAccountId;

  try {
    // 1. Create a Stripe account if one doesn't exist
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'standard',
        email: auth.token.email,
      });
      accountId = account.id;
      await userRef.update({ stripeConnectAccountId: accountId });
    }

    // 2. Create an Account Link for onboarding
    const { returnUrl, refreshUrl } = data;
    if (!returnUrl || !refreshUrl) {
      throw new HttpsError('invalid-argument', 'returnUrl and refreshUrl are required.');
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return { url: accountLink.url };
  } catch (error) {
    console.error("Error creating Connect account:", error);
    throw new HttpsError('internal', error.message);
  }
});

/**
 * Gets the Stripe Connect status for the current user.
 */
exports.getStripeConnectStatus = onCall({ enforceAppCheck: false }, async (request) => {
  const { auth } = request;
  if (!auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const stripe = require("stripe")(stripeSecretKey.value());
  const db = admin.firestore();
  
  const userDoc = await db.collection('users').doc(auth.uid).get();
  const accountId = userDoc.data()?.stripeConnectAccountId;

  if (!accountId) {
    return { connected: false, chargesEnabled: false, detailsSubmitted: false };
  }

  try {
    const account = await stripe.accounts.retrieve(accountId);
    
    // Keep Firestore user document in sync with Stripe
    await db.collection('users').doc(auth.uid).update({
      chargesEnabled: account.charges_enabled,
      detailsSubmitted: account.details_submitted
    });

    // AUTO-SYNC business details if they are empty in userSettings
    const settingsRef = db.collection('userSettings').doc(auth.uid);
    const settingsDoc = await settingsRef.get();
    
    const currentSettings = settingsDoc.exists ? settingsDoc.data() : {};
    const company = currentSettings.company || {};
    
    const companyName = company.name || "";
    const companyEmail = company.email || "";
    const companyAddress1 = company.address1 || "";
    const companyAddress2 = company.address2 || "";
    const companyCity = company.city || "";
    const companyState = company.state || "";
    const companyZip = company.zip || "";

    // Pull from Stripe business profile, company fields, or individual fields
    const stripeName = account.business_profile?.name || account.company?.name || (account.individual ? `${account.individual.first_name} ${account.individual.last_name}` : "");
    const stripeEmail = account.business_profile?.support_email || account.email || account.individual?.email || "";
    const stripeAddress = account.company?.address || account.individual?.address || account.business_profile?.support_address || {};

    let needsUpdate = false;
    const companyUpdate = {};

    if (!companyName && stripeName) {
      companyUpdate.name = stripeName;
      needsUpdate = true;
    }
    if (!companyEmail && stripeEmail) {
      companyUpdate.email = stripeEmail;
      needsUpdate = true;
    }
    if (!companyAddress1 && stripeAddress.line1) {
      companyUpdate.address1 = stripeAddress.line1;
      needsUpdate = true;
    }
    if (!companyAddress2 && stripeAddress.line2) {
      companyUpdate.address2 = stripeAddress.line2;
      needsUpdate = true;
    }
    if (!companyCity && stripeAddress.city) {
      companyUpdate.city = stripeAddress.city;
      needsUpdate = true;
    }
    if (!companyState && stripeAddress.state) {
      companyUpdate.state = stripeAddress.state;
      needsUpdate = true;
    }
    if (!companyZip && stripeAddress.postal_code) {
      companyUpdate.zip = stripeAddress.postal_code;
      needsUpdate = true;
    }

    if (needsUpdate) {
      const mergedCompany = Object.assign({}, company, companyUpdate);
      await settingsRef.set({ company: mergedCompany }, { merge: true });
      console.log(`Auto-filled userSettings from Stripe Connect account details for user: ${auth.uid}`);
    }

    return {
      connected: true,
      accountId: account.id,
      chargesEnabled: account.charges_enabled,
      detailsSubmitted: account.details_submitted,
    };
  } catch (error) {
    console.error("Error retrieving Connect account:", error);
    // Check if the account was deleted or access was revoked in Stripe
    const errMsg = error.message || "";
    if (
      error.code === 'resource_missing' || 
      error.statusCode === 404 || 
      error.raw?.code === 'resource_missing' ||
      errMsg.includes('No such account') || 
      errMsg.includes('resource_missing') || 
      errMsg.includes('does not have access to account') || 
      errMsg.includes('account does not exist') || 
      errMsg.includes('revoked')
    ) {
      console.warn(`Stripe Connect account ${accountId} not found or inaccessible in Stripe. Returning invalidAccount status.`);
      return {
        connected: false,
        invalidAccount: true,
        chargesEnabled: false,
        detailsSubmitted: false,
      };
    }
    throw new HttpsError('internal', error.message);
  }
});

/**
 * Public endpoint to get basic invoice details for payment.
 */
exports.getInvoiceForPayment = onCall({ enforceAppCheck: false }, async (request) => {
  const { data } = request;
  const { invoiceId } = data;

  if (!invoiceId) {
    throw new HttpsError('invalid-argument', 'Invoice ID is required.');
  }

  const db = admin.firestore();
  try {
    const invoiceDoc = await db.collection('invoices').doc(invoiceId).get();
    
    if (!invoiceDoc.exists) {
      throw new HttpsError('not-found', 'Invoice not found.');
    }

    const invoiceData = invoiceDoc.data();
    
    // Calculate total
    const subtotal = (invoiceData.items || []).reduce((acc, item) => acc + (item.quantity || 0) * (item.price || 0), 0);
    const taxRate = Number(invoiceData.taxRate) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    // Get merchant's connect account ID
    const userDoc = await db.collection('users').doc(invoiceData.userId).get();
    const merchantSettings = await db.collection('userSettings').doc(invoiceData.userId).get();
    
    const connectAccountId = userDoc.data()?.stripeConnectAccountId;
    const companyName = merchantSettings.exists ? merchantSettings.data().company?.name : 'Merchant';

    return {
      id: invoiceDoc.id,
      invoiceNumber: invoiceData.invoiceNumber,
      status: invoiceData.status,
      totalAmount: totalAmount,
      currency: invoiceData.currency || 'USD',
      clientName: invoiceData.client?.name || 'Client',
      companyName: companyName,
      hasStripeConnect: !!connectAccountId,
      dueDate: invoiceData.dueDate,
    };
  } catch (error) {
    console.error("Error fetching invoice for payment:", error);
    throw new HttpsError('internal', error.message);
  }
});

/**
 * Creates a Stripe Checkout Session for a specific invoice using Direct Charges.
 */
exports.createInvoicePaymentSession = onCall({ enforceAppCheck: false }, async (request) => {
  const { data } = request;
  const { invoiceId, successUrl, cancelUrl } = data;

  if (!invoiceId || !successUrl || !cancelUrl) {
    throw new HttpsError('invalid-argument', 'Invoice ID, successUrl, and cancelUrl are required.');
  }

  const stripe = require("stripe")(stripeSecretKey.value());
  const db = admin.firestore();

  try {
    const invoiceDoc = await db.collection('invoices').doc(invoiceId).get();
    if (!invoiceDoc.exists) {
      throw new HttpsError('not-found', 'Invoice not found.');
    }

    const invoiceData = invoiceDoc.data();
    if (invoiceData.status === 'paid') {
      throw new HttpsError('failed-precondition', 'Invoice is already paid.');
    }

    const userDoc = await db.collection('users').doc(invoiceData.userId).get();
    const connectAccountId = userDoc.data()?.stripeConnectAccountId;

    if (!connectAccountId) {
      throw new HttpsError('failed-precondition', 'Merchant has not connected a Stripe account.');
    }

    // Calculate total in cents
    const subtotal = (invoiceData.items || []).reduce((acc, item) => acc + (item.quantity || 0) * (item.price || 0), 0);
    const taxRate = Number(invoiceData.taxRate) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;
    const totalAmountCents = Math.round(totalAmount * 100);

    // Calculate application fee based on subscription tier: 0.50% for free starter, 0.25% for active Pro subscribers
    const isPro = userDoc.data()?.subscriptionStatus === 'active';
    const feeRate = isPro ? 0.0025 : 0.0050;
    const applicationFeeAmount = Math.round(totalAmountCents * feeRate);


    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: (invoiceData.currency || 'USD').toLowerCase(),
          product_data: {
            name: `Invoice #${invoiceData.invoiceNumber}`,
            description: `Payment for invoice to ${invoiceData.client?.name || 'Client'}`,
          },
          unit_amount: totalAmountCents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
        metadata: {
          invoiceId: invoiceId,
        }
      },
      client_reference_id: invoiceId,
      success_url: successUrl,
      cancel_url: cancelUrl,
    }, {
      stripeAccount: connectAccountId,
    });

    return { url: session.url };
  } catch (error) {
    console.error("Error creating payment session:", error);
    throw new HttpsError('internal', error.message);
  }
});

const { onRequest } = require("firebase-functions/v2/https");
const stripeConnectWebhookSecret = defineString("STRIPE_CONNECT_WEBHOOK_SECRET");

/**
 * Handles incoming webhooks from Stripe Connect accounts.
 */
exports.stripeConnectWebhook = onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  let event;
  try {
    const stripe = require("stripe")(stripeSecretKey.value());
    const webhookSecret = stripeConnectWebhookSecret.value();
    const sig = req.headers["stripe-signature"];

    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error(`Connect Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const db = admin.firestore();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const invoiceId = session.client_reference_id;
        
        if (invoiceId) {
          const invoiceRef = db.collection('invoices').doc(invoiceId);
          await invoiceRef.update({
            status: 'paid',
            stripePaymentIntentId: session.payment_intent,
          });
          console.log(`Successfully marked invoice ${invoiceId} as paid.`);

          try {
            const invoiceDoc = await invoiceRef.get();
            if (invoiceDoc.exists) {
              const sendSmsInvoice = require("./sendSmsInvoice");
              await sendSmsInvoice.sendPaymentReceiptSmsHelper(invoiceId, invoiceDoc.data());
            }
          } catch (smsErr) {
            console.error(`Error sending automated payment receipt SMS for invoice ${invoiceId}:`, smsErr);
          }
        }
        break;
      }
      case 'account.updated': {
        const account = event.data.object;
        // Find the user with this connect account ID
        const usersSnapshot = await db.collection('users').where('stripeConnectAccountId', '==', account.id).get();
        if (!usersSnapshot.empty) {
          const userDoc = usersSnapshot.docs[0];
          await userDoc.ref.update({
            chargesEnabled: account.charges_enabled,
            detailsSubmitted: account.details_submitted
          });
          console.log(`Updated account status for user ${userDoc.id}`);
        }
        break;
      }
      default:
        console.log(`Unhandled connect event type: ${event.type}`);
    }

    return res.status(200).send({ received: true });
  } catch (err) {
    console.error('Unhandled connect webhook error:', err);
    return res.status(500).send(`Webhook Application Error: ${err.message}`);
  }
});

