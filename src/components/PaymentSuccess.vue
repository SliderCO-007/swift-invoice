<template>
  <div class="payment-success-page">
    <v-container class="fill-height d-flex justify-center align-center text-center">
    <v-card class="pa-8" max-width="600" elevation="12" style="border-radius: 16px;">
      
      <!-- Loading/Verifying State -->
      <div v-if="isLoading">
        <v-progress-circular indeterminate color="primary" size="64" class="mb-4"></v-progress-circular>
        <h1 class="text-h5 font-weight-bold mt-4">{{ loadingMessage }}</h1>
        <p class="text-body-1 text-medium-emphasis mt-2">
          {{ loadingSubMessage }}
        </p>
      </div>

      <!-- Success State -->
      <div v-if="isSuccess">
        <v-icon color="success" size="80" class="mb-4">mdi-check-decagram</v-icon>
        <h1 class="text-h4 font-weight-bold mb-3">Payment Successful!</h1>
        <p v-if="paymentType === 'invoice'" class="text-body-1 text-medium-emphasis mb-6">
          Thank you for your payment! The invoice has been marked as paid.
        </p>
        <p v-else class="text-body-1 text-medium-emphasis mb-6">
          Welcome aboard! Your subscription is now active. You have full access to all features.
        </p>
        <v-btn v-if="paymentType === 'invoice'" color="primary" size="large" :to="'/payment/' + invoiceId" class="font-weight-bold">
          View Receipt
        </v-btn>
        <v-btn v-else color="primary" size="large" to="/dashboard" class="font-weight-bold">
          Go to My Dashboard
        </v-btn>
      </div>

      <!-- Error/Timeout State -->
      <div v-if="isError">
        <v-icon color="error" size="80" class="mb-4">mdi-alert-circle-outline</v-icon>
        <h1 class="text-h5 font-weight-bold mb-3">Verification Timed Out</h1>
        <p class="text-body-1 text-medium-emphasis mb-6">
          We could not confirm your payment status in time. Please check your email for a receipt or contact support if the issue persists.
        </p>
        <v-btn v-if="paymentType === 'invoice'" color="primary" size="large" :to="'/payment/' + invoiceId" class="font-weight-bold">
          Return to Invoice
        </v-btn>
        <v-btn v-else color="primary" size="large" to="/dashboard" class="font-weight-bold">
          Go to My Dashboard
        </v-btn>
      </div>

    </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../composables/useFirebase.js';
import { currentUser } from '../composables/useAuth.js';

const route = useRoute();
const user = currentUser;

const paymentType = ref(route.query.type || 'subscription');
const invoiceId = ref(route.query.invoiceId || null);

const isLoading = ref(true);
const isSuccess = ref(false);
const isError = ref(false);
const loadingMessage = ref('Verifying Your Payment');
const loadingSubMessage = ref('Please wait a moment while we confirm your payment...');

let unsubscribe = null;
let timeouts = [];

onMounted(() => {
  // If verifying a subscription and user isn't logged in, fail out.
  if (paymentType.value === 'subscription' && !user.value) {
    isLoading.value = false;
    isError.value = true;
    return;
  }

  // Set timeouts to provide a better user experience while waiting.
  timeouts.push(setTimeout(() => {
    if (!isSuccess.value) {
      loadingMessage.value = 'Still confirming...';
      loadingSubMessage.value = 'This can sometimes take up to a minute. We appreciate your patience.';
    }
  }, 20000)); // 20 seconds

  timeouts.push(setTimeout(() => {
    isLoading.value = false;
    if (!isSuccess.value) {
      isError.value = true;
    }
    if (unsubscribe) {
      unsubscribe(); // Stop listening after timeout.
    }
  }, 60000)); // 60 seconds

  if (paymentType.value === 'invoice' && invoiceId.value) {
    // Listen to real-time changes on the invoice document
    const invoiceRef = doc(db, 'invoices', invoiceId.value);
    unsubscribe = onSnapshot(invoiceRef, (doc) => {
      const invoiceData = doc.data();
      if (invoiceData && invoiceData.status === 'paid') {
        isLoading.value = false;
        isSuccess.value = true;
        isError.value = false;
        timeouts.forEach(clearTimeout);
        if (unsubscribe) unsubscribe();
      }
    });
  } else if (user.value) {
    // Listen to real-time changes on the user's document for subscription
    const userRef = doc(db, 'users', user.value.uid);
    unsubscribe = onSnapshot(userRef, (doc) => {
      const userData = doc.data();
      // A non-free status indicates a successful subscription update.
      if (userData && userData.subscriptionStatus && userData.subscriptionStatus !== 'free') {
        isLoading.value = false;
        isSuccess.value = true;
        isError.value = false;
        timeouts.forEach(clearTimeout);
        if (unsubscribe) unsubscribe();
      }
    });
  } else {
      isLoading.value = false;
      isError.value = true;
  }
});

// Clean up the listener and timeout when the component is unmounted.
onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
  timeouts.forEach(clearTimeout);
});
</script>

<style scoped>
.payment-success-page {
  min-height: 100vh;
  background-color: #111d2f;
  color: #f1f5f9;
}
:deep(.v-card) {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(16px);
  color: #f1f5f9 !important;
}
p.text-medium-emphasis {
  color: #94a3b8 !important;
}
</style>
