<script setup>
import { computed, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { currentUser, userProfile, useAuth } from '../composables/useAuth';
import { useMobileNav } from '../composables/useMobileNav';
import UpgradeModal from './UpgradeModal.vue';

const router = useRouter();
const route = useRoute();
const { logout } = useAuth();
const {
  isMoreDrawerOpen,
  isQuickActionsOpen,
  showUnsavedChangesDialog,
  openQuickActions,
  closeQuickActions,
  openMoreDrawer,
  closeMoreDrawer,
  confirmDiscardChanges,
  cancelDiscardChanges
} = useMobileNav();

const showLimitModal = ref(false);

const isAuthenticated = computed(() => !!currentUser.value);
const user = computed(() => currentUser.value);
const profile = computed(() => userProfile.value);

const isFreePlan = computed(() => profile.value?.subscriptionStatus === 'free');
const invoiceLimitReached = computed(() => isFreePlan.value && (profile.value?.invoiceCount || 0) >= 3);

// Hide on public landing pages or guest routes
const isPublicRoute = computed(() => {
  const publicRoutes = ['LandingPage', 'ContractorLandingPage', 'WeekendLandingPage', 'TimeIsMoneyLandingPage', 'NoPaywallLandingPage', 'Features', 'Reviews', 'Privacy', 'AboutUs', 'Terms', 'Pricing', 'Login', 'Register', 'ResetPassword', 'AuthAction', 'DemoPayment', 'PublicPayment', 'NotFound'];
  return publicRoutes.includes(route.name) || !isAuthenticated.value;
});

const isCurrentTab = (name) => {
  if (name === 'dashboard') return route.path === '/dashboard';
  if (name === 'projects') return route.path.startsWith('/projects');
  if (name === 'customers') return route.path.startsWith('/customers');
  return false;
};

const navigateTo = (path) => {
  closeQuickActions();
  closeMoreDrawer();
  router.push(path);
};

const handleQuickNewInvoice = () => {
  closeQuickActions();
  if (invoiceLimitReached.value) {
    showLimitModal.value = true;
    return;
  }
  router.push('/invoice/new');
};

const handleQuickNewProject = () => {
  closeQuickActions();
  router.push('/projects/new');
};

const handleQuickNewCustomer = () => {
  closeQuickActions();
  router.push('/customers?action=new');
};

const handleLogout = async () => {
  closeMoreDrawer();
  await logout();
  router.push('/login');
};
</script>

<template>
  <div v-if="!isPublicRoute" class="mobile-nav-root d-md-none">
    <!-- Bottom Navigation Bar -->
    <nav class="mobile-bottom-bar" aria-label="Mobile Navigation">
      <!-- Dashboard Tab -->
      <button 
        class="nav-tab-btn" 
        :class="{ 'active': isCurrentTab('dashboard') }"
        @click="navigateTo('/dashboard')"
        aria-label="Dashboard"
      >
        <div class="icon-wrapper">
          <v-icon :icon="isCurrentTab('dashboard') ? 'mdi-view-dashboard' : 'mdi-view-dashboard-outline'" size="24"></v-icon>
        </div>
        <span class="tab-label">Dashboard</span>
      </button>

      <!-- Projects Tab -->
      <button 
        class="nav-tab-btn" 
        :class="{ 'active': isCurrentTab('projects') }"
        @click="navigateTo('/projects')"
        aria-label="Projects"
      >
        <div class="icon-wrapper">
          <v-icon :icon="isCurrentTab('projects') ? 'mdi-folder-multiple' : 'mdi-folder-multiple-outline'" size="24"></v-icon>
        </div>
        <span class="tab-label">Projects</span>
      </button>

      <!-- Center Action Button (+) -->
      <div class="center-fab-container">
        <button 
          class="center-fab-btn" 
          @click="openQuickActions"
          aria-label="Quick Actions"
          title="Create New..."
        >
          <v-icon icon="mdi-plus" size="30" color="white"></v-icon>
        </button>
      </div>

      <!-- Customers Tab -->
      <button 
        class="nav-tab-btn" 
        :class="{ 'active': isCurrentTab('customers') }"
        @click="navigateTo('/customers')"
        aria-label="Customers"
      >
        <div class="icon-wrapper">
          <v-icon :icon="isCurrentTab('customers') ? 'mdi-account-group' : 'mdi-account-group-outline'" size="24"></v-icon>
        </div>
        <span class="tab-label">Customers</span>
      </button>

      <!-- More Menu Tab -->
      <button 
        class="nav-tab-btn" 
        :class="{ 'active': isMoreDrawerOpen }"
        @click="openMoreDrawer"
        aria-label="More Menu"
      >
        <div class="icon-wrapper">
          <v-icon icon="mdi-dots-horizontal" size="24"></v-icon>
        </div>
        <span class="tab-label">More</span>
      </button>
    </nav>

    <!-- Quick Action Sheet Modal -->
    <v-dialog 
      v-model="isQuickActionsOpen" 
      location="bottom"
      class="quick-action-dialog"
      max-width="500"
    >
      <div class="quick-action-sheet">
        <div class="sheet-handle-bar">
          <span class="sheet-handle"></span>
        </div>
        <div class="sheet-header">
          <h3 class="sheet-title">Quick Actions</h3>
          <p class="sheet-subtitle">Create or manage records on the go</p>
        </div>

        <div class="quick-actions-grid">
          <!-- New Invoice Tile -->
          <button class="action-card" @click="handleQuickNewInvoice">
            <div class="action-card-icon primary-gradient">
              <v-icon icon="mdi-file-document-plus-outline" size="26" color="white"></v-icon>
            </div>
            <div class="action-card-info">
              <span class="action-name">New Invoice</span>
              <span class="action-desc">Create, send, or scan to invoice</span>
            </div>
            <v-icon icon="mdi-chevron-right" size="20" class="action-chevron"></v-icon>
          </button>

          <!-- New Project Tile -->
          <button class="action-card" @click="handleQuickNewProject">
            <div class="action-card-icon emerald-gradient">
              <v-icon icon="mdi-folder-plus-outline" size="26" color="white"></v-icon>
            </div>
            <div class="action-card-info">
              <span class="action-name">New Project</span>
              <span class="action-desc">Track billable hours and expenses</span>
            </div>
            <v-icon icon="mdi-chevron-right" size="20" class="action-chevron"></v-icon>
          </button>

          <!-- Add Customer Tile -->
          <button class="action-card" @click="handleQuickNewCustomer">
            <div class="action-card-info-wrap">
              <div class="action-card-icon violet-gradient">
                <v-icon icon="mdi-account-plus-outline" size="26" color="white"></v-icon>
              </div>
              <div class="action-card-info">
                <span class="action-name">Add Customer</span>
                <span class="action-desc">Save client billing & email details</span>
              </div>
            </div>
            <v-icon icon="mdi-chevron-right" size="20" class="action-chevron"></v-icon>
          </button>

          <!-- Items & Services Tile -->
          <button class="action-card" @click="navigateTo('/items')">
            <div class="action-card-info-wrap">
              <div class="action-card-icon amber-gradient">
                <v-icon icon="mdi-package-variant-closed" size="26" color="white"></v-icon>
              </div>
              <div class="action-card-info">
                <span class="action-name">Saved Items & Rates</span>
                <span class="action-desc">Manage catalog and line item rates</span>
              </div>
            </div>
            <v-icon icon="mdi-chevron-right" size="20" class="action-chevron"></v-icon>
          </button>
        </div>

        <div class="sheet-footer">
          <v-btn 
            block 
            variant="tonal" 
            color="grey-lighten-2" 
            rounded="lg" 
            size="large"
            @click="closeQuickActions"
            class="text-capitalize font-weight-bold"
          >
            Cancel
          </v-btn>
        </div>
      </div>
    </v-dialog>

    <!-- More Navigation Drawer -->
    <v-navigation-drawer
      v-model="isMoreDrawerOpen"
      location="right"
      temporary
      class="mobile-more-drawer"
      width="320"
    >
      <div class="drawer-content">
        <!-- User Profile Card & Chevron Close Button -->
        <div class="drawer-header d-flex align-center justify-space-between">
          <div class="d-flex align-center ga-3 text-truncate flex-grow-1 mr-2">
            <v-avatar color="primary" size="42" class="profile-avatar flex-shrink-0">
              <span class="text-subtitle-1 font-weight-bold text-white">
                {{ user?.email ? user.email.charAt(0).toUpperCase() : 'U' }}
              </span>
            </v-avatar>
            <div class="profile-details text-truncate">
              <span class="profile-email d-block text-truncate font-weight-bold">{{ user?.email }}</span>
              <span class="profile-badge">
                <v-icon icon="mdi-shield-check" size="14" class="mr-1"></v-icon>
                {{ profile?.role === 'member' ? 'Team Member' : (profile?.subscriptionStatus === 'active' ? 'Pro Member' : 'Free Starter') }}
              </span>
            </div>
          </div>

          <!-- Top Chevron Close Button -->
          <v-btn 
            icon 
            variant="text" 
            size="small" 
            @click="closeMoreDrawer"
            aria-label="Close menu"
            class="drawer-close-btn flex-shrink-0"
            title="Close menu"
          >
            <v-icon icon="mdi-chevron-right" size="28" color="#94a3b8"></v-icon>
          </v-btn>
        </div>

        <v-divider class="my-2 border-opacity-25" color="white"></v-divider>

        <!-- Navigation Links -->
        <v-list class="drawer-nav-list bg-transparent" density="comfortable">
          <v-list-item 
            to="/dashboard" 
            @click="closeMoreDrawer"
            prepend-icon="mdi-view-dashboard-outline"
            title="Dashboard"
            rounded="lg"
            class="drawer-nav-item"
          ></v-list-item>

          <v-list-item 
            to="/projects" 
            @click="closeMoreDrawer"
            prepend-icon="mdi-folder-multiple-outline"
            title="Projects & Hours"
            rounded="lg"
            class="drawer-nav-item"
          ></v-list-item>

          <v-list-item 
            to="/customers" 
            @click="closeMoreDrawer"
            prepend-icon="mdi-account-group-outline"
            title="Customers"
            rounded="lg"
            class="drawer-nav-item"
          ></v-list-item>

          <v-list-item 
            to="/items" 
            @click="closeMoreDrawer"
            prepend-icon="mdi-package-variant-closed"
            title="Items & Services"
            rounded="lg"
            class="drawer-nav-item"
          ></v-list-item>

          <v-list-item 
            to="/reports" 
            @click="closeMoreDrawer"
            prepend-icon="mdi-file-chart-outline"
            title="Reports & Analytics"
            rounded="lg"
            class="drawer-nav-item"
          ></v-list-item>

          <v-list-item 
            to="/settings" 
            @click="closeMoreDrawer"
            prepend-icon="mdi-cog-outline"
            title="Settings & Payments"
            rounded="lg"
            class="drawer-nav-item"
          ></v-list-item>

          <v-list-item 
            v-if="profile?.role !== 'member'"
            to="/team" 
            @click="closeMoreDrawer"
            prepend-icon="mdi-account-multiple-plus-outline"
            title="Team Members"
            rounded="lg"
            class="drawer-nav-item"
          ></v-list-item>

          <v-list-item 
            to="/guide" 
            @click="closeMoreDrawer"
            prepend-icon="mdi-help-circle-outline"
            title="User Guide"
            rounded="lg"
            class="drawer-nav-item"
          ></v-list-item>

          <v-list-item 
            v-if="profile?.subscriptionStatus !== 'active'"
            to="/pricing" 
            @click="closeMoreDrawer"
            prepend-icon="mdi-arrow-up-bold-circle"
            title="Upgrade to Pro"
            rounded="lg"
            class="drawer-nav-item text-amber-accent-2 font-weight-bold"
          ></v-list-item>
        </v-list>

        <div class="drawer-bottom-actions mt-auto pa-4">
          <!-- Thumb-Friendly Close Menu Button -->
          <v-btn 
            block 
            variant="outlined" 
            color="grey-lighten-2" 
            rounded="lg" 
            size="large"
            @click="closeMoreDrawer"
            class="text-capitalize font-weight-bold mb-3 close-menu-btn"
          >
            <v-icon start class="mr-1">mdi-chevron-right</v-icon>
            Close Menu
          </v-btn>

          <!-- Sign Out Button -->
          <v-btn 
            block 
            variant="tonal" 
            color="red-lighten-2" 
            rounded="lg" 
            size="large"
            @click="handleLogout"
            class="text-capitalize font-weight-bold"
          >
            <v-icon start class="mr-2">mdi-logout</v-icon>
            Sign Out
          </v-btn>
        </div>
      </div>
    </v-navigation-drawer>

    <!-- Unsaved Changes Alert Dialog -->
    <v-dialog v-model="showUnsavedChangesDialog" max-width="420" persistent>
      <v-card class="discard-changes-card pa-5" rounded="xl">
        <div class="d-flex align-center ga-3 mb-3">
          <v-avatar color="amber-darken-3" size="42">
            <v-icon icon="mdi-alert-outline" color="white" size="24"></v-icon>
          </v-avatar>
          <div>
            <h3 class="text-h6 font-weight-bold text-white">Discard Changes?</h3>
            <span class="text-caption text-grey-lighten-1">You have unsaved changes on this page.</span>
          </div>
        </div>
        <p class="text-body-2 text-grey-lighten-2 mb-5">
          If you leave now, any changes you made will not be saved. Are you sure you want to go back?
        </p>
        <div class="d-flex justify-end ga-3">
          <v-btn 
            variant="text" 
            color="grey-lighten-1" 
            rounded="lg" 
            @click="cancelDiscardChanges"
            class="text-capitalize font-weight-bold px-4"
          >
            Stay Here
          </v-btn>
          <v-btn 
            color="red-darken-1" 
            variant="flat" 
            rounded="lg" 
            @click="confirmDiscardChanges"
            class="text-capitalize font-weight-bold px-5"
          >
            Discard & Exit
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <UpgradeModal v-model="showLimitModal" />
  </div>
</template>

<style scoped>
.mobile-nav-root {
  position: relative;
  z-index: 999;
}

/* Fixed Mobile Bottom Bar */
.mobile-bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(64px + env(safe-area-inset-bottom, 0px));
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background: rgba(17, 29, 47, 0.96);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.09);
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.35);
  z-index: 1000;
  touch-action: manipulation;
}

/* Nav Tab Buttons */
.nav-tab-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 6px 0 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.nav-tab-btn:active {
  transform: scale(0.92);
}

.nav-tab-btn.active {
  color: #38bdf8;
}

.icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
}

.nav-tab-btn.active .icon-wrapper::after {
  content: '';
  position: absolute;
  bottom: -4px;
  width: 4px;
  height: 4px;
  background-color: #38bdf8;
  border-radius: 50%;
  box-shadow: 0 0 8px #38bdf8;
}

.tab-label {
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.01em;
}

/* Center Elevated FAB (+) Button */
.center-fab-container {
  flex: 0 0 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  top: -14px;
}

.center-fab-btn {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1976D2 0%, #0D47A1 100%);
  border: 3px solid #111d2f;
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.5), 0 2px 6px rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.center-fab-btn:active {
  transform: scale(0.90);
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.4);
}

/* Quick Action Bottom Sheet */
.quick-action-sheet {
  background: #111d2f;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px 24px 0 0;
  padding: 12px 20px 24px;
  color: #f1f5f9;
}

.sheet-handle-bar {
  display: flex;
  justify-content: center;
  padding-bottom: 12px;
}

.sheet-handle {
  width: 40px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.sheet-header {
  margin-bottom: 18px;
}

.sheet-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 2px;
}

.sheet-subtitle {
  font-size: 0.85rem;
  color: #94a3b8;
}

.quick-actions-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.action-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 12px 14px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-card:active {
  background: rgba(255, 255, 255, 0.08);
  transform: scale(0.98);
}

.action-card-info-wrap {
  display: flex;
  align-items: center;
  gap: 14px;
}

.action-card-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 12px;
}

.primary-gradient {
  background: linear-gradient(135deg, #1e88e5 0%, #0d47a1 100%);
}

.emerald-gradient {
  background: linear-gradient(135deg, #10b981 0%, #047857 100%);
}

.violet-gradient {
  background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);
}

.amber-gradient {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.action-card-info {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.action-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #f1f5f9;
}

.action-desc {
  font-size: 0.78rem;
  color: #94a3b8;
}

.action-chevron {
  color: #64748b;
}

/* Mobile More Drawer */
.mobile-more-drawer {
  background: #111d2f !important;
  color: #f1f5f9 !important;
  border-left: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px 8px;
}

.drawer-header {
  padding: 8px 12px 16px;
}

.profile-email {
  font-size: 0.95rem;
  color: #f8fafc;
}

.profile-badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  padding: 2px 8px;
  border-radius: 9999px;
  margin-top: 4px;
}

.drawer-nav-item {
  color: #e2e8f0 !important;
  margin-bottom: 4px;
}

.drawer-nav-item:hover,
.drawer-nav-item:active {
  background: rgba(255, 255, 255, 0.06) !important;
}

.drawer-close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  touch-action: manipulation;
}

.drawer-close-btn:active {
  background: rgba(255, 255, 255, 0.12);
  transform: scale(0.92);
}

.close-menu-btn {
  border-color: rgba(255, 255, 255, 0.15) !important;
  color: #e2e8f0 !important;
  background: rgba(255, 255, 255, 0.04);
  touch-action: manipulation;
}

.close-menu-btn:active {
  background: rgba(255, 255, 255, 0.09);
  transform: scale(0.98);
}

/* Discard Changes Dialog */
.discard-changes-card {
  background: #1e293b !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
}
</style>
