<template>
  <v-container class="fill-height d-flex justify-center align-center text-center">
    <v-card class="pa-8" max-width="600" elevation="12" style="border-radius: 16px;">
      <v-icon color="success" size="80" class="mb-4">mdi-check-decagram</v-icon>
      <h1 class="text-h4 font-weight-bold mb-3">Payment Successful!</h1>
      <p class="text-body-1 text-medium-emphasis mb-6">
        Welcome aboard! Your subscription is now active. You have full access to all features.
      </p>
      <v-btn
        color="primary"
        size="large"
        to="/dashboard"
        class="font-weight-bold"
      >
        Go to My Dashboard
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup>
// This component is for display and navigation, so no complex logic is needed here.
// In a more advanced scenario, you might fetch the session details to show
// more specific information, but for now, a clear confirmation is sufficient.
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
  background-color: #f8f9fa;
}
</style>