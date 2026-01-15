const {onRequest} = require("firebase-functions/v2/https");
const {defineString} = require('firebase-functions/params');
const admin = require('firebase-admin');
const cors = require('cors');

admin.initializeApp();

// Define the Stripe secret key using Firebase's new parameter system.
// This is the correct, secure way to handle secrets.
const stripeSecretKey = defineString('STRIPE_SECRET_KEY');

// Initialize Stripe lazily within the function call to ensure the secret key is resolved.
let stripe;

// Define the allowed origins for CORS.
const FRONTEND_URL = "https://swift-invoice-9124f.web.app";
const DEV_FRONTEND_URL = "https://5173-firebase-swift-invoice-1767843866511.cluster-lqzyk3r5hzdcaqv6zwm7wv6pwa.cloudworkstations.dev";

const corsHandler = cors({ 
    origin: (origin, callback) => {
        // Allow requests from the defined origins, and also allow undefined origins (for direct function calls, etc.)
        if (!origin || [FRONTEND_URL, DEV_FRONTEND_URL].indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
});

exports.createCheckoutSession = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    // Initialize stripe here to ensure stripeSecretKey.value() is available
    stripe = require('stripe')(stripeSecretKey.value());

    // Determine the base URL for success/cancel URLs based on the request origin
    const origin = req.headers.origin;
    const baseUrl = origin && origin.includes('cloudworkstations.dev') ? DEV_FRONTEND_URL : FRONTEND_URL;
    
    // The request body from an HttpsCallable function is in req.body.data
    const { invoice } = req.body.data;

    if (!invoice || !invoice.id) {
      res.status(400).send({error: {message: "Invalid invoice data provided."}});
      return;
    }

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Swift Invoice - New Invoice Fee',
              images: [`${FRONTEND_URL}/Logo.png`], 
            },
            unit_amount: 100, // $1.00 in cents
          },
          quantity: 1,
        }],
        mode: 'payment',
        // The success_url now correctly includes the baseUrl
        success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&invoice_id=${invoice.id}`,
        cancel_url: `${baseUrl}/invoice/${invoice.id}`,
        metadata: {
          invoice_id: invoice.id,
        },
      });
      
      res.send({ data: { id: session.id } });

    } catch (error) {
      console.error("Stripe Error:", error.message);
      res.status(500).send({error: {message: error.message}});
    }
  });
});
