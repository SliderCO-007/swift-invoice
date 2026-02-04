<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const route = useRoute();
const router = useRouter();

const invoiceId = ref(route.query.invoice_id);
const status = ref('loading'); // Manages the component's state: 'loading', 'success', 'error'

onMounted(() => {
  const auth = getAuth();
  
  // onAuthStateChanged listens for the completion of the auth session restoration after a redirect.
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    unsubscribe(); // Unsubscribe after the initial check to prevent memory leaks.

    if (user) {
      // If a user object exists, it means the session was successfully restored.
      status.value = 'success';
    } else {
      // If no user is found, the session was lost. This is the error condition.
      status.value = 'error';
    }
  });
});

// Navigates the user to the invoice they just paid for.
const goToInvoice = () => {
  if (invoiceId.value) {
    router.push(`/invoice/${invoiceId.value}`);
  } else {
    // Fallback to the dashboard if the invoiceId is missing for any reason.
    router.push('/dashboard');
  }
};

// Navigates the user to the login page in the error scenario.
const goToLogin = () => {
  router.push('/login');
};
</script>

<template>
  <v-container class="fill-height d-flex justify-center align-center">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">

        <!-- Loading State: Shown while waiting for Firebase Auth to restore the session -->
        <v-card v-if="status === 'loading'" class="text-center pa-8">
          <v-progress-circular indeterminate size="64" color="primary" class="mb-6"></v-progress-circular>
          <h1 class="text-h5 font-weight-medium">Finalizing Your Invoice</h1>
          <p class="text-body-1 mt-2">Please wait a moment...</p>
        </v-card>

        <!-- Success State: Shown when the user's session is successfully verified -->
        <v-card v-if="status === 'success'" class="text-center pa-8">
          <v-icon size="80" color="success" class="mb-4">mdi-check-decagram</v-icon>
          <h1 class="text-h4 font-weight-bold mb-2">Payment Received!</h1>
          <p class="text-body-1 mb-6">
            Your invoice has been finalized. You can now view the updated details.
          </p>
          <v-btn color="primary" size="large" @click="goToInvoice">
            View Your Invoice
          </v-btn>
        </v-card>

        <!-- Error State: Shown if the user's session was lost after the redirect -->
        <v-card v-if="status === 'error'" class="text-center pa-8">
          <v-icon size="80" color="warning" class="mb-4">mdi-alert-circle-outline</v-icon>
          <h1 class="text-h4 font-weight-bold mb-2">Session Expired</h1>
          <p class="text-body-1 mb-6">
            Your payment was successful, but we couldn't verify your session. Please log in again to view your invoice.
          </p>
          <v-btn color="primary" size="large" @click="goToLogin">
            Go to Login
          </v-btn>
        </v-card>

      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.fill-height {
  min-height: 80vh;
}
</style>
