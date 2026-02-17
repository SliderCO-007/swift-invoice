import { ref } from 'vue';
import { loadStripe } from '@stripe/stripe-js';
import { httpsCallable } from 'firebase/functions';
import { functions, appCheck } from './useFirebase';
import { currentUser } from './useAuth';
import { getToken } from 'firebase/app-check';

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

  /**
   * Creates a Stripe Checkout session for subscriptions and redirects the user to the Stripe Checkout page.
   * This is used on the Pricing Page.
   */
  async function createCheckoutSession(checkoutData) {
    loading.value = true;
    error.value = null;
    try {
      const user = currentUser.value;
      if (!user) throw new Error('You must be logged in to subscribe.');

      if (appCheck) {
        await getToken(appCheck, false);
      }

      const createSessionFunction = httpsCallable(functions, 'createCheckoutSession');
      
      // The `checkoutData` object from PricingPage.vue contains priceId, successUrl, and cancelUrl
      const response = await createSessionFunction(checkoutData);

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
      console.error('Error creating checkout session:', e.message || e);
      if (e.message && e.message.toLowerCase().includes('internal')) {
        error.value = 'A temporary issue occurred with our payment provider. Please try again in a few moments.';
      } else {
        error.value = e.message || 'An unknown error occurred during checkout.';
      }
    } finally {
      loading.value = false;
    }
  }

  return {
    createCheckoutSession,
    loading,
    error,
  };
}
