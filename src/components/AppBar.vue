<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth, currentUser } from '../composables/useAuth'
import Logo from './Logo.vue'

const drawer = ref(false)

const { loading, logout } = useAuth()
const router = useRouter()

const isAuthenticated = computed(() => !!currentUser.value)
const user = computed(() => currentUser.value)

const handleLogout = async () => {
  await logout()
  drawer.value = false // Close the drawer on logout
  router.push('/login')
}

const guestNav = [
  { title: 'Create Invoice', to: '/invoice/new', icon: 'mdi-file-document-edit-outline' },
  { title: 'Features', to: '/features', icon: 'mdi-lightbulb-on-outline' },
  { title: 'About Us', to: '/about', icon: 'mdi-information-outline' },
  { title: 'FAQ', to: '/#faq', icon: 'mdi-help-circle-outline' },
  { title: 'Pricing', to: '/pricing', icon: 'mdi-tag-outline' },
  { title: 'Login', to: '/login', icon: 'mdi-login' },
]

const authNav = [
  { title: 'Dashboard', to: '/dashboard', icon: 'mdi-view-dashboard-outline' },
  { title: 'Projects',  to: '/projects',  icon: 'mdi-folder-multiple-outline' },
  { title: 'Customers', to: '/customers', icon: 'mdi-account-group-outline' },
  { title: 'Items', to: '/items', icon: 'mdi-package-variant-closed' },
  { title: 'Settings', to: '/settings', icon: 'mdi-cog-outline' },
  { title: 'Upgrade', to: '/pricing', icon: 'mdi-arrow-up-bold-circle' },
]
</script>

<template>
  <v-app-bar app color="white" elevation="1">
    <v-container class="app-bar-container d-flex align-center">
      <v-toolbar-title>
        <router-link
          to="/"
          class="d-flex align-center text-decoration-none text--primary"
        >
          <Logo class="app-bar-logo" />
          <span
            class="font-weight-bold ml-2 d-none d-sm-inline app-bar-brand"
            style="font-size: 1.25rem"
            >ScanGo Invoice</span
          >
        </router-link>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <div v-if="loading">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>

      <!-- Desktop Navigation & User Menu -->
      <div v-else class="d-none d-md-flex align-center">
        <div v-if="!isAuthenticated">
          <v-btn text to="/features" class="font-weight-bold">Features</v-btn>
          <v-btn text to="/about" class="font-weight-bold">About Us</v-btn>
          <v-btn text to="/#faq" class="font-weight-bold">FAQ</v-btn>
          <v-btn text to="/pricing" class="font-weight-bold">Pricing</v-btn>
          <v-btn text to="/login" class="font-weight-bold">Login</v-btn>
          <v-btn color="primary" variant="flat" to="/invoice/new" class="font-weight-bold ml-2">Create Invoice</v-btn>
          <v-btn outlined color="primary" to="/register" class="font-weight-bold ml-2"
            >Register</v-btn
          >
        </div>

        <div v-else-if="isAuthenticated && user">
          <v-menu offset-y>
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" icon class="ml-4">
                <v-avatar color="primary" size="40">
                  <span class="white--text text-h6">{{
                    user.email ? user.email.charAt(0).toUpperCase() : 'U'
                  }}</span>
                </v-avatar>
              </v-btn>
            </template>
            <v-list>
              <v-list-item-title class="px-4 py-2 font-weight-bold">{{
                user.email
              }}</v-list-item-title>
              <v-divider></v-divider>
              <v-list-item
                v-for="(item, i) in authNav"
                :key="i"
                :to="item.to"
                @click="drawer = false"
              >
                <template v-slot:prepend>
                  <v-icon :icon="item.icon"></v-icon>
                </template>
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item>
              <v-list-item @click="handleLogout">
                <template v-slot:prepend>
                  <v-icon icon="mdi-logout"></v-icon>
                </template>
                <v-list-item-title>Logout</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>

      <!-- Mobile Navigation Menu -->
      <v-menu v-if="!loading" offset-y>
        <template v-slot:activator="{ props }">
          <v-app-bar-nav-icon v-bind="props" class="d-md-none"></v-app-bar-nav-icon>
        </template>
        <v-list>
          <!-- Guest Menu -->
          <div v-if="!isAuthenticated">
            <v-list-item v-for="(item, i) in guestNav" :key="i" :to="item.to">
              <template v-slot:prepend>
                <v-icon :icon="item.icon"></v-icon>
              </template>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-btn
                block
                outlined
                color="primary"
                to="/register"
                class="font-weight-bold"
                >Register</v-btn
              >
            </v-list-item>
          </div>

          <!-- Authenticated Menu -->
          <div v-else-if="isAuthenticated && user">
            <v-list-item class="px-4 py-2">
              <v-list-item-title class="font-weight-bold">{{
                user.email
              }}</v-list-item-title>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item v-for="(item, i) in authNav" :key="i" :to="item.to">
              <template v-slot:prepend>
                <v-icon :icon="item.icon"></v-icon>
              </template>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
            <v-list-item @click="handleLogout">
              <template v-slot:prepend>
                <v-icon icon="mdi-logout"></v-icon>
              </template>
              <v-list-item-title>Logout</v-list-item-title>
            </v-list-item>
          </div>
        </v-list>
      </v-menu>
    </v-container>
  </v-app-bar>
</template>

<style scoped>
.app-bar-container {
  max-width: 1200px;
}

.app-bar-logo {
  height: 40px;
  width: auto;
}

.app-bar-brand,
.app-bar-brand:visited {
  color: #0d47a1;
}

.v-btn {
  text-transform: none;
  font-weight: 600;
}

.white--text {
  color: #fff !important;
}

.text-h6 {
  font-size: 1.25rem;
}

.v-list-item {
  align-items: center;
}
</style>
