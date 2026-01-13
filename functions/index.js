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

// Function for the one-time $50 registration fee
exports.createCheckoutSession = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    const session = await stripe.checkout.sessions.create({
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
        success_url: `${FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${FRONTEND_URL}/register`,
    });

    res.send({ id: session.id });
  });
});

// New function for the $1 per-invoice fee
exports.createInvoiceCheckoutSession = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    const session = await stripe.checkout.sessions.create({
        line_items: [
        {
            price_data: {
            currency: 'usd',
            product_data: {
                name: 'Swift Invoice - New Invoice Fee',
            },
            unit_amount: 100, // $1.00 in cents
            },
            quantity: 1,
        },
        ],
        mode: 'payment',
        success_url: `${FRONTEND_URL}/create-invoice-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${FRONTEND_URL}/dashboard`, // Redirect to dashboard on cancellation
    });

    res.send({ id: session.id });
  });
});
