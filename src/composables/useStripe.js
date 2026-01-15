import { ref } from 'vue';
import { loadStripe } from '@stripe/stripe-js';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebase'; 
import useInvoices from './useInvoices';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function useStripe() {
  const stripe = ref(null);
  const error = ref(null);
  const { deleteInvoice } = useInvoices();

  async function initializeStripe() {
    stripe.value = await stripePromise;
  }

  initializeStripe();

  async function redirectToCheckout(invoice) {
    if (!stripe.value) {
      error.value = 'Stripe.js has not loaded yet.';
      return;
    }
    if (!invoice) {
      error.value = 'Invoice data is missing.';
      return;
    }

    try {
      const functions = getFunctions(app);
      const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
      const response = await createCheckoutSession({ invoice });
      const sessionId = response.data.id;

      const { error: stripeError } = await stripe.value.redirectToCheckout({ sessionId });

      if (stripeError) {
        error.value = stripeError.message;
        // If payment fails or is canceled, delete the invoice.
        await deleteInvoice(invoice.id);
      }
    } catch (e) {
      if (e && e.message) {
        error.value = e.message;
      } else {
        error.value = 'An unknown error occurred during checkout.';
      }
      // If any error occurs, delete the invoice.
      await deleteInvoice(invoice.id);
    }
  }

  return {
    redirectToCheckout,
    error
  };
}