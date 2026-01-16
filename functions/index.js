const {onRequest} = require("firebase-functions/v2/https");
const {defineString} = require('firebase-functions/params');
const admin = require('firebase-admin');
const cors = require('cors');

admin.initializeApp();

// Define the Stripe secret key using a NEW name to force a refresh.
const stripeSecretKey = defineString('STRIPE_LIVE_SECRET_KEY');

// Initialize Stripe lazily within the function call.
let stripe;

// Define the allowed origins for CORS.
const FRONTEND_URL = "https://swift-invoice-9124f.web.app";
const PROD_DOMAIN = "https://swiftinvoice.biz";
const DEV_FRONTEND_URL = "https://5173-firebase-swift-invoice-1767843866511.cluster-lqzyk3r5hzdcaqv6zwm7wv6pwa.cloudworkstations.dev";
const ALLOWED_ORIGINS = [FRONTEND_URL, PROD_DOMAIN, DEV_FRONTEND_URL];

const corsHandler = cors({ 
    origin: (origin, callback) => {
        if (!origin || ALLOWED_ORIGINS.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
});

exports.createCheckoutSession = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    const key = stripeSecretKey.value();
    stripe = require('stripe')(key);

    const baseUrl = req.headers.origin || FRONTEND_URL;
    
    const invoiceId = req.body.data && req.body.data.invoice ? req.body.data.invoice.id : 'new_user_fee';
    const isNewUser = invoiceId === 'new_user_fee';

    if (!invoiceId) {
      console.error("Invalid data in request body:", req.body);
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
              name: isNewUser ? 'Swift Invoice - Sign-up Fee' : 'Swift Invoice - New Invoice Fee',
              images: [`${PROD_DOMAIN}/Logo.png`], 
            },
            unit_amount: 100, // $1.00 in cents
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&invoice_id=${invoiceId}`,
        cancel_url: isNewUser ? `${baseUrl}/register` : `${baseUrl}/invoice/${invoiceId}`,
        metadata: {
          invoice_id: invoiceId,
        },
      });
      
      res.send({ data: { id: session.id } });

    } catch (error) {
      console.error("Stripe Error:", error.message);
      res.status(500).send({error: {message: error.message}});
    }
  });
});
