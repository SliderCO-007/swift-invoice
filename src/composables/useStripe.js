import { ref } from 'vue';
import { loadStripe } from '@stripe/stripe-js';
import { httpsCallable } from 'firebase/functions';
import { functions, appCheck } from './useFirebase';
// CORRECTED: Removed 'waitForAuth' and imported 'currentUser'
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

  async function redirectToCheckout(invoiceId, isServiceFee = true) {
    loading.value = true;
    error.value = null;

    try {
      // 1. Get the current user.
      // No need to wait anymore, as main.js ensures auth is ready before the app mounts.
      const user = currentUser.value;
      if (!user) {
        throw new Error('You must be logged in to make a payment.');
      }

      // 2. Wait for the App Check token
      if (appCheck) {
        try {
          await getToken(appCheck, /* forceRefresh= */ false);
          console.log('App Check token acquired successfully.');
        } catch (appCheckError) {
          console.error('App Check Error:', appCheckError);
          throw new Error('Could not verify app integrity. Please try again later.');
        }
      }

      if (!invoiceId) {
        throw new Error('A valid invoice ID is required.');
      }

      // 3. Create the callable function reference
      const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');

      // Construct the cancel URL to return the user to the invoice view
      const cancelUrl = `${window.location.origin}/invoice/${invoiceId}`;

      // 4. Call the function.
      const response = await createCheckoutSession({
        invoiceId: invoiceId,
        isServiceFee: isServiceFee,
        cancelUrl: cancelUrl,
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
