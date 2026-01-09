<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { useAuthListener } from './composables/useAuthListener';

// Listen for authentication state changes
useAuthListener();
</script>

<style>
/* You can add global styles here if needed */
</style>
