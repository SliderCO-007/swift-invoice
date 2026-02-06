const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { defineString } = require("firebase-functions/params");

admin.initializeApp();

// Define the Stripe secrets as parameters.
const stripeSecretKey = defineString("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineString("STRIPE_WEBHOOK_SECRET");

exports.createCheckoutSession = onCall({ enforceAppCheck: false }, async (request) => {
  const { auth, data } = request;

  if (!auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const stripe = require("stripe")(stripeSecretKey.value());

  const { invoiceId, isServiceFee, cancelUrl } = data;

  if (!invoiceId) {
    throw new HttpsError('invalid-argument', 'An invoice ID is required.');
  }

  if (isServiceFee === undefined) {
    throw new HttpsError("invalid-argument", "The 'isServiceFee' parameter is required.");
  }
  
  if (!cancelUrl || !cancelUrl.startsWith('http')) {
    throw new HttpsError('invalid-argument', 'A valid cancel URL is required.');
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Invoice Finalization Fee`,
            description: `Service fee to activate invoice #${invoiceId}`,
          },
          unit_amount: 100, // $1.00 in cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `https://swiftinvoice.biz/payment-success?invoice_id=${invoiceId}`,
      cancel_url: cancelUrl,
      metadata: {
        invoice_id: invoiceId,
        payment_type: isServiceFee ? 'service_fee' : 'full_payment',
      },
    });

    return { id: session.id };

  } catch (error) {
    console.error("Error creating Stripe Checkout session:", error.message);
    throw new HttpsError('internal', 'An error occurred while creating the checkout session.');
  }
});

exports.stripeWebhook = onRequest(async (req, res) => {
  const stripe = require("stripe")(stripeSecretKey.value());
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, stripeWebhookSecret.value());
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // --- Start of Enhanced Logging ---
  console.log(`Received Stripe event with type: ${event.type}`);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const metadata = session.metadata;
    
    console.log('Checkout session metadata:', JSON.stringify(metadata, null, 2));
    
    const { invoice_id, payment_type } = metadata;

    if (!invoice_id) {
      console.error("Webhook received completed session without invoice_id in metadata.");
      return res.status(400).send("Error: Missing invoice_id in session metadata.");
    }

    try {
      if (payment_type === 'service_fee') {
        console.log(`Processing 'service_fee' for invoice: ${invoice_id}`);
        const db = admin.firestore();
        const invoiceRef = db.collection('invoices').doc(invoice_id);
        
        await invoiceRef.update({ svcFeePaid: true });

        console.log(`Successfully marked service fee as paid for invoice ${invoice_id}.`);

      } else {
        console.log(`Webhook received for unhandled payment_type: \"${payment_type}\" for invoice ${invoice_id}.`);
      }
    } catch (dbError) {
      console.error(`Database error processing invoice ${invoice_id}:`, dbError.message || dbError);
      return res.status(500).send(`Database update failed: ${dbError.message || dbError}`);
    }
  } else {
      console.log(`Ignoring event type: ${event.type}`);
  }
  // --- End of Enhanced Logging ---

  res.status(200).json({ received: true });
});