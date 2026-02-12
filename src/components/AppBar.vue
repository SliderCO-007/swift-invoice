<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth, authReady, currentUser } from '@/composables/useAuth';
import Logo from './Logo.vue';

const { logout } = useAuth();
const router = useRouter();
const loading = ref(true);
const user = currentUser;

const isAuthenticated = computed(() => !!user.value);

onMounted(() => {
  authReady.then(() => {
    loading.value = false;
  });
});

const handleLogout = async () => {
  await logout();
  router.push({ name: 'Login' });
};
</script>

<template>
  <v-app-bar app color="white" elevation="1">
    <v-container class="app-bar-container d-flex align-center">
      <v-toolbar-title>
        <router-link to="/" class="d-flex align-center text-decoration-none primary--text">
          <Logo class="app-bar-logo" />
          <span class="font-weight-bold ml-2 d-none d-md-inline" style="font-size: 1.25rem;">SwiftInvoice</span>
        </router-link>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <div v-if="loading">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>

      <div v-else>
        <div v-if="!isAuthenticated">
          <v-btn text to="/login" class="font-weight-bold d-none d-sm-inline-flex">Login</v-btn>
          <v-btn outlined color="primary" to="/register" class="font-weight-bold ml-2">Register</v-btn>
        </div>

        <div v-else-if="isAuthenticated && user" class="d-flex align-center">
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
              <v-list-item to="/dashboard">
                <v-list-item-title>Dashboard</v-list-item-title>
              </v-list-item>
              <v-list-item to="/customers">
                <v-list-item-title>Customers</v-list-item-title>
              </v-list-item>
              <v-list-item to="/items">
                <v-list-item-title>Items</v-list-item-title>
              </v-list-item>
              <v-list-item to="/settings">
                <v-list-item-title>Settings</v-list-item-title>
              </v-list-item>
              <v-list-item @click="handleLogout">
                <v-list-item-title>Logout</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>
    </v-container>
  </v-app-bar>
</template>

<style scoped>
.app-bar-logo {
  height: 32px;
  width: auto;
}

.v-toolbar__title a {
  color: var(--v-primary-base);
}

.app-bar-container {
  padding: 0 1rem;
}
</style>
