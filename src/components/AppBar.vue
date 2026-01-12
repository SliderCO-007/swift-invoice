<template>
  <v-app-bar app color="white" elevate-on-scroll>
    <v-container class="py-0 fill-height">
      <v-spacer></v-spacer>
      <router-link to="/" class="d-flex align-center text-decoration-none">
        <img src="/Logo.png" alt="Swift Invoice Logo" height="50" class="mr-3" />
        <v-toolbar-title class="font-weight-bold text-h5">
          Swift Invoice
        </v-toolbar-title>
      </router-link>
      <v-spacer></v-spacer>
    </v-container>
  </v-app-bar>
</template>

<script setup>
// No script logic needed for this simple component
</script>

<style scoped>
a {
  color: inherit;
}
</style>
