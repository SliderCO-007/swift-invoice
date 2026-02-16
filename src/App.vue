<template>
  <v-app>
    <AppBar />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { useRoute } from 'vue-router';
import AppBar from './components/AppBar.vue';

// CORRECTED: The global authentication listener has been removed from this component.
// It is being moved to main.js to ensure authentication is resolved before the app mounts.

const route = useRoute();
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

/* Global Design System */
:root {
  --primary-color: #4A90E2; /* A modern, friendly blue */
  --secondary-color: #50E3C2; /* A vibrant accent teal */
  --text-color: #333;
  --background-color: #F4F7F9;
  --white-color: #FFFFFF;
  --shadow-color: rgba(0, 0, 0, 0.1);
  
  --shadow-sm: 0 2px 4px var(--shadow-color);
  --shadow-md: 0 5px 15px var(--shadow-color);
  --shadow-lg: 0 10px 30px var(--shadow-color);
}

body {
  font-family: 'Poppins', sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
}

.v-application {
  font-family: 'Poppins', sans-serif;
  background-color: var(--background-color) !important;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

.section-title {
    font-size: 2.5rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 1rem;
    color: var(--text-color);
}

.section-subtitle {
    font-size: 1.2rem;
    color: #555;
    text-align: center;
    margin-bottom: 4rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

.v-btn {
  text-transform: none !important; /* Keep button text case as defined */
  font-weight: 600 !important;
}

.v-card {
    border: none !important; /* Remove borders from cards */
    border-radius: 12px !important;
    box-shadow: var(--shadow-md) !important;
    transition: transform 0.3s ease, box-shadow 0.3s ease !important;
}

.v-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg) !important;
}


</style>
