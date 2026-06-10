<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import useInvoices from '../composables/useInvoices';
import useUserSettings from '../composables/useUserSettings';
import useStripeConnect from '../composables/useStripeConnect';
import { userProfile } from '../composables/useAuth.js';
import InvoiceTable from './InvoiceTable.vue';
import CompanyInfoPrompt from './CompanyInfoPrompt.vue';
import UpgradePrompt from './UpgradePrompt.vue';
import DashboardChart from './DashboardChart.vue';

const router = useRouter();
const { mobile } = useDisplay();
const activeTab = ref('invoices');

const { invoices, loading: invoicesLoading, error: invoicesError, deleteInvoice } = useInvoices();
const { settings, loading: settingsLoading, error: settingsError } = useUserSettings();
const { connectStatus, fetchConnectStatus } = useStripeConnect();

onMounted(async () => {
  await fetchConnectStatus();
});

// --- ROBUST INITIAL LOAD TRACKING ---
const invoicesHaveLoaded = ref(false);
const settingsHaveLoaded = ref(false);

// Watch the loading status from the invoices composable
watch(invoicesLoading, (isLoading) => {
  if (!isLoading) {
    invoicesHaveLoaded.value = true;
  }
}, { immediate: true });

// Watch the loading status from the user settings composable
watch(settingsLoading, (isLoading) => {
  if (!isLoading) {
    settingsHaveLoaded.value = true;
  }
}, { immediate: true });

// The initial load is complete only when both data sources have loaded.
const isInitialLoad = computed(() => !invoicesHaveLoaded.value || !settingsHaveLoaded.value);
// --- END ROBUST LOADING STATE ---

const hasError = computed(() => invoicesError.value || settingsError.value);
const isFreePlan = computed(() => userProfile.value?.subscriptionStatus === 'free');
const invoiceLimitReached = computed(() => isFreePlan.value && userProfile.value?.invoiceCount >= 3);
const isDataLoading = computed(() => invoicesLoading.value || settingsLoading.value);

const dialogDelete = ref(false);
const itemToDeleteId = ref(null);

const createNewInvoice = () => {
  if (invoiceLimitReached.value) {
    alert('You have reached the invoice limit. Please upgrade.');
    return;
  }
  if (!settings.value.company?.name) {
    alert('Please set up your company information before creating an invoice.');
    router.push('/onboarding');
  } else {
    router.push('/invoice/new');
  }
};

const editInvoice = (invoiceId) => {
  router.push(`/invoice/${invoiceId}`);
};

const openDeleteDialog = (invoiceId) => {
  itemToDeleteId.value = invoiceId;
  dialogDelete.value = true;
};

const closeDeleteDialog = () => {
  itemToDeleteId.value = null;
  dialogDelete.value = false;
};

const confirmDelete = async () => {
  if (itemToDeleteId.value) {
    try {
      await deleteInvoice(itemToDeleteId.value);
    } catch (err) {
      console.error("Failed to delete invoice:", err);
      alert(`Error deleting invoice: ${err.message}`);
    } finally {
      closeDeleteDialog();
    }
  }
};

const getStatusInfo = (status) => {
  const s = status ? status.toLowerCase() : 'pending';
  switch (s) {
    case 'paid': return { color: '#4CAF50', icon: 'mdi-check-circle-outline' };
    case 'overdue': return { color: '#F44336', icon: 'mdi-alert-circle-outline' };
    case 'pending': return { color: '#2196F3', icon: 'mdi-cash-clock' };
    default: return { color: '#9E9E9E', icon: 'mdi-help-circle-outline' };
  }
};

const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
};

const formatInvoiceNumber = (num) => `#${num}`;
const formatCurrency = (value) => new Intl.NumberFormat(undefined, { style: 'currency', currency: settings.value?.currency || 'USD' }).format(value || 0);

</script>

<template>
  <div>
    <div v-if="isInitialLoad" class="page-loading-container">
      <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
      <p>Loading your workspace...</p>
    </div>

    <div v-else class="dashboard-container">
      <header class="dashboard-header">
        <div>
          <h1 class="welcome-message">Your Invoices</h1>
          <p class="date-display">A summary of your recent invoices.</p>
        </div>
      </header>

      <v-alert
        v-if="invoiceLimitReached"
        type="warning"
        variant="outlined"
        class="mb-4"
        prominent
        :icon="false"
      >
        <template v-slot:text>
          You have reached the 3-invoice limit for the free plan. Please upgrade to create more invoices.
        </template>
        <template v-slot:append>
          <v-btn to="/pricing" color="warning" variant="flat">Upgrade</v-btn>
        </template>
      </v-alert>

      <UpgradePrompt v-if="isFreePlan && !invoiceLimitReached && !settingsLoading" />
      <CompanyInfoPrompt v-if="!settings.company?.name && !settingsLoading" />
      
      <!-- Stripe Connect Prompt for Authenticated Users (Custom Glassmorphic Card) -->
      <div
        v-if="settings.company?.name && !connectStatus.chargesEnabled && !settingsLoading"
        class="stripe-warning-banner mb-4"
      >
        <div class="banner-content">
          <div class="banner-text-wrapper">
            <v-icon color="#635bff" class="banner-icon mr-3">mdi-credit-card-outline</v-icon>
            <div class="banner-text">
              <span class="banner-title">Online Payments Not Connected</span>
              <p class="banner-desc">You won't be able to accept credit cards, Apple Pay, or ACH payments on your invoices until you connect a payment account.</p>
            </div>
          </div>
          <v-btn 
            to="/onboarding?step=2" 
            color="#635bff" 
            variant="flat" 
            class="connect-btn-banner"
          >
            Connect Now
          </v-btn>
        </div>
      </div>

      <!-- Dashboard Tab System -->
      <v-tabs v-model="activeTab" bg-color="transparent" color="primary" class="mb-4" align-tabs="center">
        <v-tab value="invoices" class="text-capitalize font-weight-bold">
          <v-icon start class="mr-1">mdi-file-document-outline</v-icon>
          Invoices
        </v-tab>
        <v-tab value="analytics" class="text-capitalize font-weight-bold">
          <v-icon start class="mr-1">mdi-chart-line</v-icon>
          Analytics
        </v-tab>
      </v-tabs>

      <v-window v-model="activeTab">
        <!-- Invoices Workspace -->
        <v-window-item value="invoices">
          <main class="dashboard-content">
            <div v-if="hasError" class="error-container">
              <v-alert type="error" dense outlined>
                There was an error loading your dashboard. Please refresh the page.
              </v-alert>
            </div>

            <div v-else>
              <div v-if="invoicesLoading && !invoices.length" class="loading-container">
                <v-progress-circular indeterminate size="48" color="primary"></v-progress-circular>
                <p>Loading invoices...</p>
              </div>
              <div v-else-if="!invoices.length && !isDataLoading" class="no-invoices-container">
                <img src="/no_invoices.svg" alt="No Invoices Illustration" class="no-invoices-illustration" />
                <h3 class="text-h5 font-weight-medium">Start Your Journey</h3>
                <p class="text-body-1 text-grey-darken-1 mt-2 mb-6">Ready to get paid? Create your first invoice and take control of your billing.</p>
                <v-btn color="primary" @click="createNewInvoice" size="large" class="mt-4" rounded="lg">
                  <v-icon start>mdi-plus</v-icon>
                  Create Your First Invoice
                </v-btn>
              </div>

              <InvoiceTable v-else :invoices="invoices" @delete-invoice="openDeleteDialog" @edit-invoice="editInvoice"/>
            </div>
          </main>
        </v-window-item>

        <!-- Analytics Overview -->
        <v-window-item value="analytics">
          <div class="analytics-content pa-2">
            <DashboardChart :invoices="invoices" class="mt-2" />
          </div>
        </v-window-item>
      </v-window>

      <v-fab icon="mdi-plus" location="bottom right" size="64" color="primary" app appear @click="createNewInvoice" title="Create New Invoice" class="fab-button" :disabled="isDataLoading || invoiceLimitReached"></v-fab>

      <v-dialog v-model="dialogDelete" max-width="500px">
        <v-card>
          <v-card-title class="text-h5">Are you sure?</v-card-title>
          <v-card-text>Do you really want to delete this invoice? This action cannot be undone.</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue-darken-1" variant="text" @click="closeDeleteDialog">Cancel</v-btn>
            <v-btn color="red-darken-1" variant="text" @click="confirmDelete">Delete</v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <footer class="dashboard-footer">
        <p>&copy; 2026 ScanGo Invoice. All rights reserved. | <a href="mailto:support@scangoinvoice.com">support@scangoinvoice.com</a></p>
      </footer>
    </div>
  </div>
</template>


<style scoped>
.page-loading-container { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; gap: 1.5rem; background-color: #111d2f; color: #f1f5f9; }
.dashboard-container { padding: 1rem; background-color: #111d2f; min-height: 100vh; color: #f1f5f9; }
.dashboard-header { padding: 1rem 1rem 0 1rem; }
.welcome-message { font-size: 2.2rem; font-weight: 700; color: #fff; }
.date-display { font-size: 1rem; color: #94A3B8; }
.no-invoices-container { text-align: center; padding: 4rem 2rem; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); backdrop-filter: blur(16px); border-radius: 24px; margin-top: 2rem; color: #f1f5f9; }
.no-invoices-illustration { max-width: 220px; margin-bottom: 2rem; }
.invoices-header-desktop { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding: 0 1rem; }
.fab-button { transition: transform 0.3s ease; }
.fab-button:hover { transform: scale(1.1); box-shadow: 0 10px 30px rgba(25, 118, 210, 0.5); }
.dashboard-footer { text-align: center; padding: 3rem 1rem 1rem; font-size: 0.9rem; color: #64748B; }
.dashboard-footer a { color: #f1f5f9; text-decoration: none; }
.dashboard-footer a:hover { text-decoration: underline; }
.loading-container, .error-container { text-align: center; padding: 3rem; }

:deep(.v-card:not(.stat-card)) {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(16px);
  color: #f1f5f9 !important;
}
:deep(.text-grey-darken-1), :deep(.text-grey-darken-3), :deep(.text-grey-darken-4) {
  color: #f1f5f9 !important;
}
:deep(.text-medium-emphasis) {
  color: #94a3b8 !important;
}

.stripe-warning-banner {
  background: rgba(99, 91, 255, 0.04);
  border: 1px solid rgba(99, 91, 255, 0.2);
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(12px);
  text-align: left;
}

.banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
}

.banner-text-wrapper {
  display: flex;
  align-items: flex-start;
  text-align: left;
}

.banner-icon {
  margin-top: 0.15rem;
  font-size: 28px;
}

.banner-text {
  display: flex;
  flex-direction: column;
}

.banner-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.25rem;
}

.banner-desc {
  font-size: 0.95rem;
  color: #94a3b8;
  margin: 0;
  line-height: 1.4;
}

.connect-btn-banner {
  text-transform: none;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

@media (max-width: 600px) {
    .dashboard-container { padding: 0.5rem; }
    .dashboard-header { text-align: center; padding: 1.5rem 0.5rem 0 0.5rem; }
    .welcome-message { font-size: 1.8rem; }
    .invoices-header-desktop { display: none; }
    .dashboard-footer { padding: 2rem 0.5rem 1rem; }

    /* Warning banner mobile adjustments */
    .stripe-warning-banner {
      padding: 1.25rem;
    }
    .banner-content {
      flex-direction: column;
      align-items: stretch;
      gap: 1.25rem;
    }
    .banner-text-wrapper {
      align-items: flex-start;
    }
    .banner-icon {
      font-size: 24px;
      margin-right: 0.5rem !important;
    }
    .banner-title {
      font-size: 1rem;
    }
    .banner-desc {
      font-size: 0.875rem;
    }
    .connect-btn-banner {
      width: 100%;
    }
}
</style>
