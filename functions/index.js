const {onRequest} = require("firebase-functions/v2/https");
const {defineString} = require('firebase-functions/params');
const admin = require('firebase-admin');
const cors = require('cors');

admin.initializeApp();

const stripeSecretKey = defineString('STRIPE_SECRET_KEY');
const stripe = require('stripe')(stripeSecretKey.value());

const FRONTEND_URL = "https://swift-invoice-9124f.web.app";
const DEV_FRONTEND_URL = "https://5173-firebase-swift-invoice-1767843866511.cluster-lqzyk3r5hzdcaqv6zwm7wv6pwa.cloudworkstations.dev";

// Initialize cors middleware with allowed origins
const corsHandler = cors({ 
    origin: [FRONTEND_URL, DEV_FRONTEND_URL],
});

exports.createCheckoutSession = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    const origin = req.headers.origin;
    const baseUrl = (origin && origin.includes('cloudworkstations.dev')) ? DEV_FRONTEND_URL : FRONTEND_URL;
    const { invoice } = req.body.data; // Access the invoice from the `data` object

    let session;

    if (invoice) {
      // Create a checkout session for the $1 invoice fee
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Swift Invoice - New Invoice Fee',
              images: ['https://swift-invoice-9124f.web.app/Logo.png'], 
            },
            unit_amount: 100, // $1.00 in cents
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&invoice_id=${invoice.id}`,
        cancel_url: `${baseUrl}/invoices/${invoice.id}`,
        metadata: {
          invoice_id: invoice.id,
        },
      });
    } else {
      // Default to the registration fee if no invoice is provided
      session = await stripe.checkout.sessions.create({
        line_items: [
        {
            price_data: {
            currency: 'usd',
            product_data: {
                name: 'Swift Invoice Registration Fee',
            },
            unit_amount: 5000, // $50.00 in cents
            },
            quantity: 1,
        },
        ],
        mode: 'payment',
        success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/register`,
    });
    }

    res.send({ data: { id: session.id } });
  });
});
