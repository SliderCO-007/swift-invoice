<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goToPricing = () => {
  router.push('/pricing');
};

const goToDashboard = () => {
  router.push('/dashboard');
};
</script>

<template>
  <v-container class="fill-height d-flex justify-center align-center">
    <v-card class="text-center pa-8" max-width="500">
      <v-card-title class="text-h4 font-weight-bold mb-4">
        Payment Canceled
      </v-card-title>
      <v-card-text class="text-body-1 mb-6">
        Your payment process was canceled. You have not been charged.
      </v-card-text>
      <div class="d-flex justify-center ga-4">
        <v-btn color="primary" @click="goToPricing">
          View Pricing
        </v-btn>
        <v-btn variant="outlined" @click="goToDashboard">
          Go to Dashboard
        </v-btn>
      </div>
    </v-card>
  </v-container>
</template>
