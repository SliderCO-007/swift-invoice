import { ref } from 'vue';
import { loadStripe } from '@stripe/stripe-js';

// Replace with your actual publishable key from your Stripe dashboard
const stripePromise = loadStripe('pk_test_YOUR_PUBLISHABLE_KEY');

export function useStripe() {
  const stripe = ref(null);
  const error = ref(null);

  stripePromise.then(stripeInstance => {
    stripe.value = stripeInstance;
  }).catch(err => {
    error.value = err.message;
  });

  const redirectToCheckout = async () => {
    if (!stripe.value) {
      error.value = 'Stripe.js has not loaded yet.';
      return;
    }

    try {
      // This uses a client-side checkout flow.
      // The price and product are defined here instead of on a server.
      const { error: stripeError } = await stripe.value.redirectToCheckout({
        lineItems: [
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
        // In a real app, you would create dedicated success and cancel pages.
        // For now, we'll redirect to the home page on success.
        successUrl: `${window.location.origin}/`,
        cancelUrl: `${window.location.origin}/register`,
      });

      if (stripeError) {
        error.value = stripeError.message;
      }
    } catch (e) {
      error.value = e.message;
    }
  };

  return {
    redirectToCheckout,
    error
  };
}
