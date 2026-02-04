const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Creates a Stripe checkout session for a specific invoice.
 */
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to make a payment.');
  }

  const { invoiceId, isServiceFee } = data;

  if (!invoiceId) {
    throw new functions.https.HttpsError('invalid-argument', 'An invoice ID is required.');
  }

  let session;

  try {
    if (isServiceFee) {
      session = await stripe.checkout.sessions.create({
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
        success_url: `https://swiftinvoice.biz/payment-success?invoice_id=${invoiceId}&finalize=true`,
        cancel_url: `https://swiftinvoice.biz/invoice/${invoiceId}`,
        metadata: {
          invoice_id: invoiceId,
          payment_type: 'service_fee',
        },
      });
    } else {
      throw new functions.https.HttpsError('unimplemented', 'Full invoice payment is not yet supported.');
    }

    return { id: session.id };

  } catch (error) {
    console.error("Error creating Stripe Checkout session:", error.message);
    throw new functions.https.HttpsError('internal', 'An error occurred while creating the checkout session.');
  }
});

/**
 * Handles incoming webhooks from Stripe to update application state.
 */
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { invoice_id, payment_type } = session.metadata;

    if (!invoice_id) {
      console.error("Webhook received completed session without invoice_id in metadata.");
      return res.status(400).send("Error: Missing invoice_id in session metadata.");
    }

    try {
      const invoiceRef = admin.firestore().collection('invoices').doc(invoice_id);

      if (payment_type === 'service_fee') {
        // --- CORRECT LOGIC: Generate invoice number AFTER payment ---
        const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
        
        await invoiceRef.update({ 
            status: 'pending',
            invoiceNumber: invoiceNumber 
        });

        console.log(`Successfully finalized invoice ${invoice_id}. Status updated to pending with number ${invoiceNumber}.`);

      } else {
        await invoiceRef.update({ status: 'Paid' });
        console.log(`Successfully marked invoice ${invoice_id} as Paid.`);
      }
    } catch (dbError) {
      console.error(`Database error updating invoice ${invoice_id}:`, dbError);
      return res.status(500).send(`Database update failed: ${dbError.message}`);
    }
  }

  res.status(200).json({ received: true });
});

/**
 * Generic callable function to update an invoice's status.
 * Used for manual actions, e.g., marking an invoice as "Paid" for an offline payment.
 */
exports.updateInvoiceStatusOnPayment = functions.https.onCall(async (data, context) => {
  const { invoiceId, status } = data;

  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be logged in.');
  }

  if (!invoiceId || !status) {
    throw new functions.https.HttpsError('invalid-argument', 'The function must be called with "invoiceId" and "status".');
  }

  try {
    const invoiceRef = admin.firestore().collection('invoices').doc(invoiceId);
    await invoiceRef.update({ status: status });
    return { success: true };
  } catch (error) {
    console.error('Error updating invoice status:', error);
    throw new functions.https.HttpsError('unknown', 'An error occurred while updating the invoice.', error);
  }
});
