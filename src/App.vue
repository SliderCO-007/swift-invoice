<template>
  <v-app>
    <AppBar />
    <v-main>
      <router-view />
    </v-main>
    <TheCookieBanner />
  </v-app>
</template>

<script setup>
import { useRoute } from 'vue-router';
import AppBar from './components/AppBar.vue';
import TheCookieBanner from './components/TheCookieBanner.vue';
import { useAuth } from './composables/useAuth.js';

const route = useRoute();
const { init } = useAuth();
init(); // Initialize the authentication and user profile fetching
</script>
