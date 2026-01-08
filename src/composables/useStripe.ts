import { ref } from 'vue';
import { loadStripe } from '@stripe/stripe-js';

// Replace with your actual publishable key
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

    // Mock backend function to create a checkout session
    const createCheckoutSession = async () => {
      // In a real application, you would make a call to your backend here
      // to create a checkout session. This backend endpoint would use your
      // Stripe secret key to create the session.
      // For now, we'll return a mock session.
      return {
        id: 'cs_test_YOUR_SESSION_ID'
      };
    };

    const session = await createCheckoutSession();

    const { error: stripeError } = await stripe.value.redirectToCheckout({
      sessionId: session.id
    });

    if (stripeError) {
      error.value = stripeError.message;
    }
  };

  return {
    redirectToCheckout,
    error
  };
}
