const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { defineString } = require("firebase-functions/params");

const stripeSecretKey = defineString("STRIPE_SECRET_KEY");

/**
 * Validates and sanitizes a URL, falling back to a safe default if invalid.
 */
function sanitizeUrl(rawUrl, defaultUrl = 'https://scangoinvoice.com/settings') {
  if (typeof rawUrl === 'string' && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))) {
    try {
      const parsed = new URL(rawUrl);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.href;
      }
    } catch (e) {
      // Not a valid URL string
    }
  }
  return defaultUrl;
}

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
  let needNewAccount = !accountId;

  // Verify that the existing account actually exists and is accessible in Stripe
  if (accountId) {
    try {
      const existingAccount = await stripe.accounts.retrieve(accountId);
      if (existingAccount.deleted) {
        console.warn(`Stripe account ${accountId} is marked deleted. Creating a fresh account.`);
        needNewAccount = true;
      }
    } catch (err) {
      console.warn(`Stripe account ${accountId} verification failed (${err.message}). Creating a fresh account.`);
      needNewAccount = true;
    }
  }

  try {
    // 1. Create a Stripe Express account if none exists or previous was invalid
    if (needNewAccount) {
      const userEmail = auth.token?.email || userData.email || undefined;
      const accountParams = {
        type: 'express',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      };
      if (userEmail) {
        accountParams.email = userEmail;
      }

      const account = await stripe.accounts.create(accountParams);
      accountId = account.id;
      await userRef.update({ 
        stripeConnectAccountId: accountId,
        chargesEnabled: false,
        detailsSubmitted: false
      });
      console.log(`Created new Stripe Express account ${accountId} for user ${auth.uid}`);
    }

    // 2. Create an Account Link for onboarding
    const returnUrl = sanitizeUrl(data?.returnUrl);
    const refreshUrl = sanitizeUrl(data?.refreshUrl, returnUrl);

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return { url: accountLink.url };
  } catch (error) {
    console.error("Error creating Connect account:", error);
    if (error.message && error.message.includes('platform-profile')) {
      throw new HttpsError(
        'failed-precondition',
        'Stripe Connect Express onboarding requires platform profile confirmation in your Stripe Dashboard. Please visit https://dashboard.stripe.com/settings/connect/platform-profile to confirm loss responsibilities.'
      );
    }
    throw new HttpsError('internal', error.message);
  }
});


/**
 * Creates a single-sign-on login link for the Stripe Express Dashboard,
 * or falls back to an account_update / account_onboarding link.
 */
exports.createExpressDashboardLink = onCall({ enforceAppCheck: false }, async (request) => {
  const { auth, data } = request;
  if (!auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const stripe = require("stripe")(stripeSecretKey.value());
  const db = admin.firestore();

  const userDoc = await db.collection('users').doc(auth.uid).get();
  const accountId = userDoc.data()?.stripeConnectAccountId;

  if (!accountId) {
    throw new HttpsError('failed-precondition', 'No connected Stripe account found.');
  }

  const returnUrl = sanitizeUrl(data?.returnUrl);
  const refreshUrl = sanitizeUrl(data?.refreshUrl, returnUrl);

  try {
    const account = await stripe.accounts.retrieve(accountId);

    if (account.deleted) {
      throw new HttpsError('not-found', 'Your Stripe Connect account has been deleted. Please reconnect.');
    }

    // If details are not submitted yet, route directly to onboarding
    if (!account.details_submitted) {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });
      return { url: accountLink.url, type: 'onboarding' };
    }

    // Try creating single sign-on login link to Stripe Express Dashboard
    try {
      const loginLink = await stripe.accounts.createLoginLink(accountId);
      return { url: loginLink.url, type: 'login_link' };
    } catch (loginErr) {
      console.warn(`createLoginLink failed for ${accountId} (${loginErr.message}). Falling back to account_update account link.`);
      const updateLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_update',
      });
      return { url: updateLink.url, type: 'account_update' };
    }
  } catch (error) {
    console.error("Error creating Express Dashboard / Account link:", error);
    const errMsg = error.message || "";
    if (
      error.code === 'account_invalid' || 
      error.code === 'resource_missing' || 
      error.statusCode === 404 || 
      error.statusCode === 403 ||
      errMsg.includes('No such account') ||
      errMsg.includes('account_invalid')
    ) {
      throw new HttpsError('not-found', 'Your Stripe Connect account is no longer valid or accessible. Please reconnect your account in Settings.');
    }
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
    return { connected: false, chargesEnabled: false, detailsSubmitted: false, invalidAccount: false };
  }

  try {
    const account = await stripe.accounts.retrieve(accountId);

    if (account.deleted) {
      return { connected: false, chargesEnabled: false, detailsSubmitted: false, invalidAccount: true };
    }
    
    // Keep Firestore user document in sync with Stripe
    await db.collection('users').doc(auth.uid).update({
      chargesEnabled: !!account.charges_enabled,
      detailsSubmitted: !!account.details_submitted
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
      chargesEnabled: !!account.charges_enabled,
      detailsSubmitted: !!account.details_submitted,
      invalidAccount: false,
    };
  } catch (error) {
    console.error("Error retrieving Connect account:", error);
    const errMsg = error.message || "";
    const isInvalid = 
      error.code === 'account_invalid' || 
      error.code === 'resource_missing' || 
      error.statusCode === 404 || 
      error.statusCode === 403 || 
      error.raw?.code === 'account_invalid' ||
      error.raw?.code === 'resource_missing' ||
      errMsg.includes('No such account') || 
      errMsg.includes('resource_missing') || 
      errMsg.includes('does not have access to account') || 
      errMsg.includes('account does not exist') || 
      errMsg.includes('account_invalid') ||
      errMsg.includes('revoked');

    if (isInvalid) {
      console.warn(`Stripe Connect account ${accountId} not found or inaccessible in Stripe. Returning invalidAccount status.`);
      try {
        await db.collection('users').doc(auth.uid).update({
          chargesEnabled: false,
          detailsSubmitted: false
        });
      } catch (dbErr) {
        console.error("Failed to update user chargesEnabled after invalid account check:", dbErr);
      }

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


    const currency = (invoiceData.currency || 'USD').toLowerCase();
    const paymentMethodTypes = currency === 'usd' ? ['card', 'us_bank_account'] : ['card'];

    const sessionParams = {
      payment_method_types: paymentMethodTypes,
      line_items: [{
        price_data: {
          currency: currency,
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
    };

    if (currency === 'usd') {
      sessionParams.payment_method_options = {
        us_bank_account: {
          financial_connections: {
            permissions: ['payment_method'],
          },
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams, {
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
 * Helper to mark an invoice as paid and trigger automated receipt SMS
 */
const markInvoicePaid = async (db, invoiceId, paymentIntentId) => {
  const invoiceRef = db.collection('invoices').doc(invoiceId);
  await invoiceRef.update({
    status: 'paid',
    stripePaymentIntentId: paymentIntentId || null,
    paidAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
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
};

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
          if (session.payment_status === 'paid') {
            await markInvoicePaid(db, invoiceId, session.payment_intent);
          } else {
            // Asynchronous payment method (e.g. ACH Direct Debit / us_bank_account) is processing
            const invoiceRef = db.collection('invoices').doc(invoiceId);
            await invoiceRef.update({
              status: 'payment_processing',
              stripePaymentIntentId: session.payment_intent || null,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            console.log(`Invoice ${invoiceId} payment is currently processing (ACH bank transfer).`);
          }
        }
        break;
      }
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object;
        const invoiceId = session.client_reference_id;
        if (invoiceId) {
          await markInvoicePaid(db, invoiceId, session.payment_intent);
          console.log(`Async payment succeeded for invoice ${invoiceId}.`);
        }
        break;
      }
      case 'checkout.session.async_payment_failed': {
        const session = event.data.object;
        const invoiceId = session.client_reference_id;
        if (invoiceId) {
          const invoiceRef = db.collection('invoices').doc(invoiceId);
          await invoiceRef.update({
            status: 'pending',
            paymentFailedReason: 'Async ACH payment transfer failed or returned.',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.warn(`Async payment failed for invoice ${invoiceId}. Status reverted to pending.`);
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

