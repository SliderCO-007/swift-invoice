<template>
  <v-app-bar app color="white" elevate-on-scroll>
    <v-container class="py-0 fill-height d-flex align-center">
      <router-link to="/" class="d-flex align-center text-decoration-none mr-auto">
        <img src="/Logo.png" alt="Swift Invoice Logo" height="50" class="mr-3" />
        <v-toolbar-title class="font-weight-bold text-h5" style="color: #333;">
          Swift Invoice
        </v-toolbar-title>
      </router-link>

      <v-spacer></v-spacer>

      <!-- Show Login/Register buttons if the user is not logged in -->
      <div v-if="!isLoggedIn">
        <v-btn text to="/login" class="font-weight-bold">Login</v-btn>
        <v-btn outlined color="primary" to="/register" class="font-weight-bold ml-2">Register</v-btn>
      </div>

      <!-- Show Dashboard, Settings, and Logout if the user is logged in -->
      <div v-else class="d-flex align-center">
         <v-btn text to="/dashboard" class="font-weight-bold">Dashboard</v-btn>
         <v-menu offset-y>
          <template v-slot:activator="{ props }">
             <v-btn v-bind="props" icon class="ml-4">
               <v-avatar color="primary" size="40">
                 <span class="white--text text-h6">{{ user.email ? user.email.charAt(0).toUpperCase() : 'U' }}</span>
               </v-avatar>
             </v-btn>
           </template>
           <v-list>
            <v-list-item-title class="px-4 py-2 font-weight-bold">{{ user.email }}</v-list-item-title>
            <v-divider></v-divider>
             <v-list-item to="/settings">
               <v-list-item-title>Settings</v-list-item-title>
             </v-list-item>
             <v-list-item @click="handleLogout">
               <v-list-item-title>Logout</v-list-item-title>
             </v-list-item>
           </v-list>
         </v-menu>
      </div>
    </v-container>
  </v-app-bar>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth.js';

const { user, isLoggedIn, logout } = useAuth();
const router = useRouter();

const handleLogout = async () => {
  await logout();
  // Redirect to the landing page after logout
  router.push('/'); 
};
</script>

<style scoped>
.v-btn {
  transition: all 0.3s ease;
}

.v-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.v-avatar {
  cursor: pointer;
}
</style>
