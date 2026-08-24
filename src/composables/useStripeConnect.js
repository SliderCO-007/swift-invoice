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
    invalidAccount: false,
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
      // Client-side fallback if backend functions are not yet deployed/updated
      const errMsg = err.message || "";
      if (
        errMsg.includes('No such account') || 
        errMsg.includes('resource_missing') || 
        errMsg.includes('does not have access to account') || 
        errMsg.includes('account does not exist') || 
        errMsg.includes('account_invalid') ||
        errMsg.includes('revoked')
      ) {
        connectStatus.value.invalidAccount = true;
        connectStatus.value.connected = false;
        connectStatus.value.chargesEnabled = false;
      } else {
        error.value = err.message;
      }
    } finally {
      loading.value = false;
    }
  };

  const createConnectAccount = async (returnPath = '/settings') => {
    loading.value = true;
    error.value = null;
    const path = typeof returnPath === 'string' && returnPath.startsWith('/') ? returnPath : '/settings';
    try {
      const createAccountFn = httpsCallable(functions, 'createConnectAccount');
      const response = await createAccountFn({
        returnUrl: window.location.origin + path,
        refreshUrl: window.location.origin + path,
      });
      if (response.data?.url) {
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
        cancelUrl: window.location.origin + `/pay/${invoiceId}`,
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

  const openExpressDashboard = async (returnPath = '/settings') => {
    // Pre-open a blank tab synchronously during user click to bypass browser popup blocker restrictions
    let newWindow = null;
    try {
      newWindow = window.open('about:blank', '_blank');
    } catch (e) {
      console.warn('Could not pre-open blank window for Stripe Express:', e);
    }

    loading.value = true;
    error.value = null;
    const path = typeof returnPath === 'string' && returnPath.startsWith('/') ? returnPath : '/settings';
    try {
      const getDashboardLinkFn = httpsCallable(functions, 'createExpressDashboardLink');
      const response = await getDashboardLinkFn({
        returnUrl: window.location.origin + path,
        refreshUrl: window.location.origin + path,
      });
      if (response.data?.url) {
        if (newWindow && !newWindow.closed) {
          newWindow.location.href = response.data.url;
          if (newWindow.focus) {
            newWindow.focus();
          }
        } else {
          const fallbackPopup = window.open(response.data.url, '_blank');
          if (!fallbackPopup || fallbackPopup.closed || typeof fallbackPopup.closed === 'undefined') {
            window.location.href = response.data.url;
          }
        }
      } else {
        if (newWindow && !newWindow.closed) {
          newWindow.close();
        }
      }
    } catch (err) {
      if (newWindow && !newWindow.closed) {
        newWindow.close();
      }
      console.error('Error opening Express Dashboard:', err);
      const errMsg = err.message || "";
      if (
        errMsg.includes('no longer valid') ||
        errMsg.includes('No such account') ||
        errMsg.includes('account_invalid') ||
        errMsg.includes('resource_missing')
      ) {
        connectStatus.value.invalidAccount = true;
      }
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
    openExpressDashboard,
    getInvoiceForPayment,
    createPaymentSession,
  };
}

