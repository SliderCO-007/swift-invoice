<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import useInvoices from '../composables/useInvoices';
import useUserSettings from '../composables/useUserSettings';
import InvoiceTable from './InvoiceTable.vue';
import InvoiceStats from './InvoiceStats.vue';
import CompanyInfoPrompt from './CompanyInfoPrompt.vue';

const router = useRouter();
const { mobile } = useDisplay();

const { invoices, loading: invoicesLoading, error: invoicesError, deleteInvoice, getInvoices } = useInvoices();
const { settings, loading: settingsLoading, error: settingsError, fetchUserSettings } = useUserSettings();

onMounted(async () => {
  await Promise.all([
    fetchUserSettings(),
    getInvoices()
  ]);
});

const isDataLoading = computed(() => {
  return invoicesLoading.value || settingsLoading.value;
});

const hasError = computed(() => {
  return invoicesError.value || settingsError.value;
});

const isInitialLoad = computed(() => {
    return isDataLoading.value && !invoices.value.length;
});

const createNewInvoice = () => {
  if (!settings.value.company?.name) {
    alert('Please set up your company information before creating an invoice.');
    router.push('/settings');
  } else {
    router.push('/invoice/new');
  }
};

const editInvoice = (invoiceId) => {
  router.push(`/invoice/${invoiceId}`);
};

const handleDeleteInvoice = async (invoiceId) => {
  if (confirm('Are you sure you want to delete this invoice? This cannot be undone.')) {
    try {
      await deleteInvoice(invoiceId);
    } catch (err) {
      console.error("Failed to delete invoice:", err);
      alert(`Error deleting invoice: ${err.message}`);
    }
  }
};

const getStatusInfo = (status) => {
  const s = status ? status.toLowerCase() : 'pending';
  switch (s) {
    case 'paid':
      return { color: '#4CAF50', icon: 'mdi-check-circle-outline' }; // Green
    case 'overdue':
      return { color: '#F44336', icon: 'mdi-alert-circle-outline' }; // Red
    case 'pending':
      return { color: '#2196F3', icon: 'mdi-cash-clock' }; // Blue
    default:
      return { color: '#9E9E9E', icon: 'mdi-help-circle-outline' }; // Grey
  }
};

const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
};

const formatInvoiceNumber = (num) => {
  return `#${num}`;
};

</script>

<template>
  <div v-show="isInitialLoad" class="page-loading-container">
    <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
    <p>Loading your workspace...</p>
  </div>

  <div v-show="!isInitialLoad" class="dashboard-container">
    <header class="dashboard-header">
      <div>
        <h1 class="welcome-message">Your Invoices</h1>
        <p class="date-display">A summary of your recent invoices.</p>
      </div>
    </header>

    <CompanyInfoPrompt v-if="!settings.company?.name && !settingsLoading" />

    <InvoiceStats :invoices="invoices" />

    <main class="dashboard-content">
      <div class="invoices-header-desktop">
        <div class="invoices-header-title">
          <h2>Your Invoices</h2>
          <p class="text-grey-darken-1">A summary of your recent invoices.</p>
        </div>
      </div>

      <div v-if="hasError" class="error-container">
        <v-alert type="error" dense outlined>
          There was an error loading your dashboard. Please refresh the page or contact support if the problem persists.
        </v-alert>
      </div>

      <div v-else>
        <div v-if="invoicesLoading && !invoices.length" class="loading-container">
          <v-progress-circular indeterminate size="48" color="primary"></v-progress-circular>
          <p>Loading invoices...</p>
        </div>
        <div v-else-if="!invoices.length && !invoicesLoading" class="no-invoices-container">
          <img src="/no_invoices.svg" alt="No Invoices Illustration" class="no-invoices-illustration" />
          <h3 class="text-h5 font-weight-medium">No invoices yet</h3>
          <p class="text-body-1 text-grey-darken-1 mt-2 mb-6">Click the button to create your first invoice.</p>
        </div>

        <!-- Desktop View: Data Table -->
        <InvoiceTable v-else-if="!mobile" :invoices="invoices" @delete-invoice="handleDeleteInvoice" @edit-invoice="editInvoice"/>

        <!-- Mobile View: Card List -->
        <div v-else class="pa-2">
            <v-card v-for="invoice in invoices" :key="invoice.id" class="mb-4" elevation="2" rounded="xl">
                <v-card-text class="pa-4">
                    <div class="d-flex justify-space-between align-center mb-4">
                        <span class="text-h6 font-weight-bold text-grey-darken-3">{{ invoice.client?.name || 'N/A' }}</span>
                        <v-chip :color="getStatusInfo(invoice.status).color" text-color="white" label small>
                            <v-icon start :icon="getStatusInfo(invoice.status).icon" size="small"></v-icon>
                            {{ invoice.status ? invoice.status.toLowerCase() : '' }}
                        </v-chip>
                    </div>
                    <div class="d-flex justify-space-between align-end mb-3">
                        <div class="text-medium-emphasis">
                            <span>Invoice {{ formatInvoiceNumber(invoice.invoiceNumber) }}</span>
                            <br>
                            <span>Due: {{ formatDate(invoice.dueDate) }}</span>
                        </div>
                        <span class="font-weight-bold text-h5 text-grey-darken-4">${{ invoice.total.toFixed(2) }}</span>
                    </div>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions class="pa-3">
                    <v-spacer></v-spacer>
                    <v-btn variant="text" class="text-capitalize" @click="editInvoice(invoice.id)">
                        View / Edit
                    </v-btn>
                    <v-btn color="red-darken-1" variant="text" class="text-capitalize" @click="handleDeleteInvoice(invoice.id)">
                        Delete
                    </v-btn>
                </v-card-actions>
            </v-card>
        </div>

      </div>

    </main>

    <v-fab icon="mdi-plus" location="bottom right" size="64" color="primary" app appear @click="createNewInvoice"
      title="Create New Invoice" class="fab-button" :disabled="isDataLoading"></v-fab>

    <footer class="dashboard-footer">
      <p>&copy; 2026 ScanGo Invoice. All rights reserved. | <a
          href="mailto:support@scangoinvoice.com">support@scangoinvoice.com</a></p>
    </footer>
  </div>
</template>

<style scoped>
.page-loading-container { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; gap: 1.5rem; }
.dashboard-container { padding: 1rem; background-color: #F4F7FE; min-height: 100vh; }
.dashboard-header { padding: 1rem 1rem 0 1rem; }
.welcome-message { font-size: 2.2rem; font-weight: 700; color: #1E293B; }
.date-display { font-size: 1rem; color: #64748B; }
.no-invoices-container { text-align: center; padding: 4rem 2rem; background-color: white; border-radius: 24px; margin-top: 2rem; }
.no-invoices-illustration { max-width: 220px; margin-bottom: 2rem; }
.invoices-header-desktop { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding: 0 1rem; }
.fab-button { transition: transform 0.3s ease; }
.fab-button:hover { transform: scale(1.1); }
.dashboard-footer { text-align: center; padding: 3rem 1rem 1rem; font-size: 0.9rem; color: #94A3B8; }
.loading-container, .error-container { text-align: center; padding: 3rem; }

/* Mobile-specific adjustments */
@media (max-width: 600px) {
    .dashboard-container { padding: 0.5rem; }
    .dashboard-header { text-align: center; padding: 1.5rem 0.5rem 0 0.5rem; }
    .welcome-message { font-size: 1.8rem; }
    .invoices-header-desktop { display: none; } /* Hide the desktop header on mobile */
    .dashboard-footer { padding: 2rem 0.5rem 1rem; }
}
</style>
