<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth, currentUser, userProfile } from '../composables/useAuth';
import { useMobileNav } from '../composables/useMobileNav';
import Logo from './Logo.vue';

const { loading, logout } = useAuth();
const router = useRouter();
const route = useRoute();
const { openMoreDrawer, handleBackNavigation } = useMobileNav();

const isAuthenticated = computed(() => !!currentUser.value);
const user = computed(() => currentUser.value);
const profile = computed(() => userProfile.value);

const handleLogout = async () => {
  await logout();
  router.push('/login');
};

const guestNav = [
  { title: 'Features', to: '/features', icon: 'mdi-lightbulb-on-outline' },
  { title: 'About Us', to: '/about', icon: 'mdi-information-outline' },
  { title: 'FAQ', to: '/#faq', icon: 'mdi-help-circle-outline' },
  { title: 'Pricing', to: '/pricing', icon: 'mdi-tag-outline' },
  { title: 'Login', to: '/login', icon: 'mdi-login' },
];

const authNav = computed(() => {
  const role = profile.value?.role || 'owner';
  
  if (role === 'member') {
    return [
      { title: 'Dashboard', to: '/dashboard', icon: 'mdi-view-dashboard-outline' },
      { title: 'Projects',  to: '/projects',  icon: 'mdi-folder-multiple-outline' },
      { title: 'Guide',     to: '/guide',     icon: 'mdi-help-circle-outline' },
    ];
  }
  
  // Owner nav
  const items = [
    { title: 'Dashboard', to: '/dashboard', icon: 'mdi-view-dashboard-outline' },
    { title: 'Projects',  to: '/projects',  icon: 'mdi-folder-multiple-outline' },
    { title: 'Customers', to: '/customers', icon: 'mdi-account-group-outline' },
    { title: 'Items', to: '/items', icon: 'mdi-package-variant-closed' },
    { title: 'Reports', to: '/reports', icon: 'mdi-file-chart-outline' },
    { title: 'Settings', to: '/settings', icon: 'mdi-cog-outline' },
    { title: 'Team', to: '/team', icon: 'mdi-account-multiple-plus-outline' },
  ];
  
  // Only show Upgrade if not subscribed
  if (profile.value?.subscriptionStatus !== 'active') {
    items.push({ title: 'Upgrade', to: '/pricing', icon: 'mdi-arrow-up-bold-circle' });
  }
  
  return items;
});

const subPageTitles = {
  'InvoiceNew': 'New Invoice',
  'InvoiceView': 'Invoice Details',
  'ProjectNew': 'New Project',
  'ProjectDetail': 'Project Details',
  'ProjectEdit': 'Edit Project',
  'Settings': 'Settings',
  'Items': 'Items & Services',
  'Reports': 'Reports & Analytics',
  'TeamSettings': 'Team Members',
  'UserGuide': 'User Guide',
};

const isSubPage = computed(() => {
  if (!isAuthenticated.value) return false;
  return Boolean(subPageTitles[route.name] || route.path.startsWith('/invoice/') || (route.path.startsWith('/projects/') && route.path !== '/projects'));
});

const currentPageTitle = computed(() => {
  return subPageTitles[route.name] || 'ScanGo Invoice';
});

const onBackClick = () => {
  handleBackNavigation(router, '/dashboard');
};
</script>

<template>
  <v-app-bar app color="white" elevation="1" class="main-app-bar">
    <v-container class="app-bar-container d-flex align-center">
      
      <!-- ================= MOBILE SUB-PAGE HEADER (< md only) ================= -->
      <div v-if="isAuthenticated && isSubPage" class="d-flex d-md-none align-center w-100">
        <v-btn 
          icon 
          variant="text" 
          @click="onBackClick" 
          aria-label="Back" 
          class="mr-2 mobile-back-btn"
        >
          <v-icon icon="mdi-arrow-left" size="24" color="#0d47a1"></v-icon>
        </v-btn>

        <span class="mobile-subpage-title font-weight-bold text-truncate flex-grow-1">
          {{ currentPageTitle }}
        </span>

        <v-btn 
          icon 
          variant="text" 
          @click="openMoreDrawer" 
          class="ml-2 mobile-avatar-btn"
          aria-label="User Menu"
        >
          <v-avatar color="primary" size="34">
            <span class="text-white text-caption font-weight-bold">{{
              user?.email ? user.email.charAt(0).toUpperCase() : 'U'
            }}</span>
          </v-avatar>
        </v-btn>
      </div>

      <!-- ================= MOBILE TOP-LEVEL HUB HEADER (< md only) ================= -->
      <div v-else class="d-flex d-md-none align-center justify-space-between w-100">
        <router-link
          to="/"
          class="d-flex align-center text-decoration-none text--primary"
        >
          <Logo class="app-bar-logo" />
          <span class="font-weight-bold ml-2 app-bar-brand">ScanGo Invoice</span>
        </router-link>

        <!-- Authenticated Mobile Menu Trigger -->
        <v-btn 
          v-if="!loading && isAuthenticated"
          icon 
          variant="text" 
          @click="openMoreDrawer" 
          aria-label="Open More Menu"
        >
          <v-avatar color="primary" size="36">
            <span class="text-white text-subtitle-2 font-weight-bold">{{
              user?.email ? user.email.charAt(0).toUpperCase() : 'U'
            }}</span>
          </v-avatar>
        </v-btn>

        <!-- Guest Mobile Menu Trigger -->
        <v-menu v-else-if="!loading && !isAuthenticated" offset-y>
          <template v-slot:activator="{ props }">
            <v-app-bar-nav-icon v-bind="props" aria-label="Open Menu"></v-app-bar-nav-icon>
          </template>
          <v-list>
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
          </v-list>
        </v-menu>
      </div>

      <!-- ================= DESKTOP HEADER (>= md only, ALWAYS VISIBLE ON DESKTOP) ================= -->
      <div class="d-none d-md-flex align-center w-100">
        <router-link
          to="/"
          class="d-flex align-center text-decoration-none text--primary"
        >
          <Logo class="app-bar-logo" />
          <span class="font-weight-bold ml-2 app-bar-brand">ScanGo Invoice</span>
        </router-link>

        <v-spacer></v-spacer>

        <div v-if="loading">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>

        <!-- Desktop Guest Nav -->
        <div v-else-if="!isAuthenticated" class="d-flex align-center">
          <v-btn text to="/features" class="font-weight-bold">Features</v-btn>
          <v-btn text to="/about" class="font-weight-bold">About Us</v-btn>
          <v-btn text to="/#faq" class="font-weight-bold">FAQ</v-btn>
          <v-btn text to="/pricing" class="font-weight-bold">Pricing</v-btn>
          <v-btn text to="/login" class="font-weight-bold">Login</v-btn>
          <v-btn color="primary" variant="flat" to="/register" class="font-weight-bold ml-2">Register</v-btn>
        </div>

        <!-- Desktop Authenticated Nav & User Dropdown -->
        <div v-else-if="isAuthenticated && user" class="d-flex align-center">
          <v-btn 
            v-for="(item, i) in authNav.filter(n => ['Dashboard', 'Projects', 'Customers'].includes(n.title))" 
            :key="i" 
            text 
            :to="item.to" 
            class="font-weight-bold mx-1"
          >
            {{ item.title }}
          </v-btn>

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
            <v-list min-width="220">
              <v-list-item-title class="px-4 py-2 font-weight-bold text-truncate">{{
                user.email
              }}</v-list-item-title>
              <v-divider></v-divider>
              <v-list-item
                v-for="(item, i) in authNav"
                :key="i"
                :to="item.to"
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

    </v-container>
  </v-app-bar>
</template>

<style scoped>
.main-app-bar {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.app-bar-container {
  max-width: 1200px;
}

.app-bar-logo {
  height: 38px;
  width: auto;
  flex-shrink: 0;
}

.app-bar-brand,
.app-bar-brand:visited {
  color: #0d47a1;
  font-size: 1.25rem;
  white-space: nowrap;
  flex-shrink: 0;
}

@media (max-width: 600px) {
  .app-bar-container {
    padding-left: 0.75rem !important;
    padding-right: 0.75rem !important;
  }
  .app-bar-logo {
    height: 32px;
  }
  .app-bar-brand {
    font-size: 1.05rem;
  }
}

.mobile-subpage-title {
  font-size: 1.15rem;
  color: #0d47a1;
  letter-spacing: -0.01em;
}

.mobile-back-btn,
.mobile-avatar-btn {
  touch-action: manipulation;
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
