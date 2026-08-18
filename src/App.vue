<template>
  <v-app class="app-shell">
    <AppBar />
    <v-main :class="{ 'has-mobile-bottom-nav': isAuth }">
      <router-view />
    </v-main>
    <MobileBottomNav />
    <TheCookieBanner />
  </v-app>
</template>

<script setup>
import { computed } from 'vue';
import AppBar from './components/AppBar.vue';
import MobileBottomNav from './components/MobileBottomNav.vue';
import TheCookieBanner from './components/TheCookieBanner.vue';
import { currentUser } from './composables/useAuth';

const isAuth = computed(() => !!currentUser.value);
</script>

<style>
/* Responsive Mobile App Shell Layout */
html,
body,
.app-shell,
.v-application,
.v-application__wrap,
.v-main {
  background-color: #111d2f !important;
  min-height: 100vh;
}

@media (max-width: 959px) {
  .has-mobile-bottom-nav {
    padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px)) !important;
    background-color: #111d2f !important;
  }
}
</style>
