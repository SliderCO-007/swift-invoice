const functions = require('firebase-functions');
const stripe = require('stripe')('sk_test_51SnOHZPpf0h9E3zvPnvIAZnqk2xFUSwWjX24A02yRk0eVDKbkvayrTqToqHGlwZGaOKHjBQokQiDMIxdXfH4X6li00KjHHzBE0');

const FRONTEND_URL = "https://swift-invoice-9124f.web.app";

exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
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

  return {
    id: session.id
  };
});
