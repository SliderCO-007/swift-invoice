const {onRequest} = require("firebase-functions/v2/https");
const {defineString} = require('firebase-functions/params');

const stripeSecretKey = defineString('STRIPE_SECRET_KEY');

const stripe = require('stripe')(stripeSecretKey.value());

const FRONTEND_URL = "https://swift-invoice-9124f.web.app";

exports.createCheckoutSession = onRequest(async (req, res) => {
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

  res.send({
    id: session.id
  });
});
