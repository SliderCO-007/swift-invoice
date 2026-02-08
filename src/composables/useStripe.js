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

  async function createPaymentIntent(invoiceId, isServiceFee = true) {
    loading.value = true;
    error.value = null;
    try {
      const user = currentUser.value;
      if (!user) throw new Error('You must be logged in to make a payment.');

      if (appCheck) {
        try {
          await getToken(appCheck, false);
        } catch (appCheckError) {
          console.error('App Check Error:', appCheckError);
          throw new Error('Could not verify app integrity.');
        }
      }

      if (!invoiceId) throw new Error('A valid invoice ID is required.');

      const createPaymentIntentFunction = httpsCallable(functions, 'createPaymentIntent');
      const response = await createPaymentIntentFunction({
        invoiceId: invoiceId,
        isServiceFee: isServiceFee,
      });

      if (response.data.error) {
        throw new Error(response.data.error.message || 'The cloud function returned an error.');
      }
      
      const { clientSecret, invoiceId: returnedInvoiceId } = response.data;

      if (!clientSecret) {
        throw new Error('Failed to retrieve a valid client secret from the server.');
      }

      return { clientSecret, invoiceId: returnedInvoiceId };

    } catch (e) {
      console.error('Error creating Payment Intent:', e.message || e);
      if (e.message && e.message.toLowerCase().includes('internal')) {
        error.value = 'A temporary issue occurred with our payment provider. Please try again in a few moments.';
      } else {
        error.value = e.message || 'An unknown error occurred while creating the payment intent.';
      }
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function redirectToCheckout(invoiceId, isServiceFee = true) {
    loading.value = true;
    error.value = null;

    try {
      const user = currentUser.value;
      if (!user) {
        throw new Error('You must be logged in to make a payment.');
      }

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

      const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
      const cancelUrl = `${window.location.origin}/invoice/${invoiceId}`;

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
    createPaymentIntent,
    redirectToCheckout,
    loading,
    error,
  };
}
