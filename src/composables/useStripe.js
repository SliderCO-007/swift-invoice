import { ref } from 'vue';
import { loadStripe } from '@stripe/stripe-js';
import { httpsCallable } from 'firebase/functions';
import { functions } from './useFirebase';
import { waitForAuth } from './useAuth';

const stripeApiKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
if (!stripeApiKey) {
  const errorMsg = "Stripe API key is missing. Please add VITE_STRIPE_PUBLIC_KEY to your .env file.";
  console.error(errorMsg);
  throw new Error(errorMsg);
}

const stripePromise = loadStripe(stripeApiKey);

export default function useStripe() {
  const error = ref(null);
  const loading = ref(false);

  async function redirectToCheckout(invoiceId, isServiceFee = true) {
    loading.value = true;
    error.value = null;

    try {
      const user = await waitForAuth();
      if (!user) {
        throw new Error('You must be logged in to make a payment.');
      }

      if (!invoiceId) {
        throw new Error('A valid invoice ID is required.');
      }

      const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');

      const response = await createCheckoutSession({
        invoiceId: invoiceId,
        isServiceFee: isServiceFee,
      });

      if (response.data.error) {
        throw new Error(response.data.error.message || 'The cloud function returned an error.');
      }

      const sessionId = response.data.id;

      if (!sessionId) {
        throw new Error('Failed to retrieve a valid session ID from the server.');
      }

      const stripe = await stripePromise;
      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });

      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (e) {
      console.error('Error redirecting to checkout:', e.message || e);
      error.value = e.message || 'An unknown error occurred.';
    } finally {
      loading.value = false;
    }
  }

  return {
    redirectToCheckout,
    loading,
    error,
  };
}
