import { ref } from 'vue';
import { httpsCallable } from 'firebase/functions';
import { functions } from './useFirebase.js';
import { userProfile } from './useAuth.js';

export default function useStripeConnect() {
  const loading = ref(false);
  const error = ref(null);
  const connectStatus = ref({
    connected: false,
    accountId: null,
    chargesEnabled: false,
    detailsSubmitted: false,
  });

  const fetchConnectStatus = async () => {
    loading.value = true;
    error.value = null;
    try {
      const getStatusFn = httpsCallable(functions, 'getStripeConnectStatus');
      const response = await getStatusFn();
      connectStatus.value = response.data;
      if (userProfile.value) {
        userProfile.value.chargesEnabled = response.data.chargesEnabled;
      }
      return response.data;
    } catch (err) {
      console.error('Error fetching Stripe Connect status:', err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const createConnectAccount = async () => {
    loading.value = true;
    error.value = null;
    try {
      const createAccountFn = httpsCallable(functions, 'createConnectAccount');
      const response = await createAccountFn({
        returnUrl: window.location.origin + '/onboarding',
        refreshUrl: window.location.origin + '/onboarding',
      });
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      console.error('Error creating Connect account:', err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const getInvoiceForPayment = async (invoiceId) => {
    loading.value = true;
    error.value = null;
    try {
      const getInvoiceFn = httpsCallable(functions, 'getInvoiceForPayment');
      const response = await getInvoiceFn({ invoiceId });
      return response.data;
    } catch (err) {
      console.error('Error fetching invoice for payment:', err);
      error.value = err.message;
      return null;
    } finally {
      loading.value = false;
    }
  };

  const createPaymentSession = async (invoiceId) => {
    loading.value = true;
    error.value = null;
    try {
      const createSessionFn = httpsCallable(functions, 'createInvoicePaymentSession');
      const response = await createSessionFn({
        invoiceId,
        successUrl: window.location.origin + `/payment-success?type=invoice&invoiceId=${invoiceId}`,
        cancelUrl: window.location.origin + `/payment/${invoiceId}`,
      });
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      console.error('Error creating payment session:', err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    connectStatus,
    fetchConnectStatus,
    createConnectAccount,
    getInvoiceForPayment,
    createPaymentSession,
  };
}
