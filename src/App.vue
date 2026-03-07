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
import AppBar from './components/AppBar.vue';
import TheCookieBanner from './components/TheCookieBanner.vue';
</script>
