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
    <v-card class="pa-8 text-center" max-width="500">
      <v-icon size="64" color="warning">mdi-cancel</v-icon>
      <h1 class="text-h5 font-weight-bold mt-4">Payment Canceled</h1>
      <p class="mt-2">Your transaction was not completed. You have not been charged.</p>
      <p class="mt-2">You can return to the pricing page to select a different plan or go back to your dashboard.</p>
      <div class="mt-6">
        <v-btn color="primary" @click="goToPricing" class="mr-4">View Plans</v-btn>
        <v-btn variant="text" @click="goToDashboard">Back to Dashboard</v-btn>
      </div>
    </v-card>
  </v-container>
</template>

<style scoped>
.fill-height {
  min-height: 80vh;
}
</style>
