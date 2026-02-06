<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// Get the invoice ID from the URL query parameters.
const invoiceId = ref(route.query.invoice_id);

// Function to navigate the user to the invoice they just paid for.
const goToInvoice = () => {
  if (invoiceId.value) {
    router.push(`/invoice/${invoiceId.value}`);
  } else {
    // Fallback to the dashboard if the invoiceId is missing.
    router.push('/dashboard');
  }
};
</script>

<template>
  <v-container class="fill-height d-flex justify-center align-center">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <!-- 
          The logic is simplified. We no longer need to check for auth state here.
          The backend Stripe Webhook is responsible for updating the invoice status.
          This component just confirms the user has returned to the success URL.
        -->
        <v-card class="text-center pa-8">
          <v-icon size="80" color="success" class="mb-4">mdi-check-decagram</v-icon>
          <h1 class="text-h4 font-weight-bold mb-2">Payment Processing!</h1>
          <p class="text-body-1 mb-6">
            Your payment was successful. The invoice status will be updated momentarily.
          </p>
          <v-btn color="primary" size="large" @click="goToInvoice">
            View Your Invoice
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
