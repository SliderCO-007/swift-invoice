import { ref } from 'vue';
import { loadStripe } from '@stripe/stripe-js';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebase'; // Import the initialized app

// Replace with your actual publishable key from your Stripe dashboard
const stripePromise = loadStripe('pk_test_51SnOHZPpf0h9E3zvVVALY8XidMxwieU2Wd6bRosG0hOWV29mHQAk41Fli67WtmbtlC6PXBCosvRQLDJz4J0nYFVh00n3HA1jNU');

export function useStripe() {
  const stripe = ref(null);
  const error = ref(null);

  stripePromise.then(stripeInstance => {
    stripe.value = stripeInstance;
  }).catch(err => {
    if (err && err.message) {
        error.value = err.message;
    } else {
        error.value = 'An unknown error occurred while loading Stripe.';
    }
  });

  const redirectToCheckout = async () => {
    if (!stripe.value) {
      error.value = 'Stripe.js has not loaded yet.';
      return;
    }

    try {
      const functions = getFunctions(app); // Pass the app instance here
      const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
      const response = await createCheckoutSession();
      const sessionId = response.data.id;

      const { error: stripeError } = await stripe.value.redirectToCheckout({ sessionId });

      if (stripeError) {
        error.value = stripeError.message;
      }
    } catch (e) {
        if (e && e.message) {
            error.value = e.message;
        } else {
            error.value = 'An unknown error occurred during checkout.';
        }
    }
  };

  return {
    redirectToCheckout,
    error
  };
}
