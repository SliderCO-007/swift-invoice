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
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* Adding a subtle noise texture for a premium feel */
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='10' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
}

/* Custom scrollbar for a more modern look */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 10px;
}
::-webkit-scrollbar-track {
  background: var(--background-color);
}
</style>
