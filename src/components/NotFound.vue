<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" class="text-center">
        <v-icon size="96" color="warning">mdi-alert-circle-outline</v-icon>
        <h1 class="text-h2 font-weight-bold mt-4 mb-2">404 - Page Not Found</h1>
        <p class="text-h5 mb-6">The page you are looking for does not exist.</p>
        <v-btn color="primary" size="large" to="/">
          Go to Homepage
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
// No script logic is needed for this simple component.
</script>

<style scoped>
/* Add any desired styling */
</style>
