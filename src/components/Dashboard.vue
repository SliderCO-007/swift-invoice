<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth, userProfile } from '../composables/useAuth.js';
import useInvoices from '../composables/useInvoices';
import useUserSettings from '../composables/useUserSettings';
import { useMeta } from '../composables/useMeta';
import { format, isValid, isBefore, startOfToday } from 'date-fns';
import InvoiceTable from './InvoiceTable.vue';
import CompanyInfoPrompt from './CompanyInfoPrompt.vue';
import InvoiceStats from './InvoiceStats.vue';

// --- Composables ---
const { loading: authLoading } = useAuth();
const { invoices, getInvoices, loading: invoicesLoading, error: invoicesError, deleteInvoice } = useInvoices();
const { settings, fetchUserSettings } = useUserSettings();
const router = useRouter();

// --- Local State ---
const viewMode = ref('table'); // 'card' or 'table'
const today = format(new Date(), 'MMMM d, yyyy');

// --- Metadata ---
useMeta(
  'Dashboard | Swift Invoice',
  'Manage your invoices, view payment statuses, and track your business finances with the Swift Invoice dashboard.',
  'Best small business invoice online application.'
);

// --- DATA FETCHING ---
onMounted(async () => {
  if (userProfile.value) {
    await fetchUserSettings();
    await getInvoices();
  }
});

// --- Computed Properties ---
const showCompanyInfoPrompt = computed(() => {
  return settings.value && !settings.value.company?.name;
});

const getInvoiceStatus = (invoice) => {
  let status = invoice.status || 'pending';
  const dueDate = invoice.dueDate && typeof invoice.dueDate.toDate === 'function'
    ? invoice.dueDate.toDate()
    : new Date(invoice.dueDate);

  if (status.toLowerCase() === 'pending' && isValid(dueDate) && isBefore(dueDate, startOfToday())) {
    return 'Overdue';
  }
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
        case 'paid': return 'success';
        case 'pending': return 'warning';
        case 'overdue': return 'error';
        case 'quote': return 'info';
        default: return 'grey';
    }
};

// --- Methods ---
const createNewInvoice = () => {
  if (showCompanyInfoPrompt.value) {
    alert('Please complete your company profile in the settings before creating an invoice.');
    router.push('/settings');
  } else {
    router.push('/invoice/new');
  }
};

const goToInvoiceDetails = (id) => {
  if (!id) {
    console.error("Navigation failed: Invoice ID is null.");
    return;
  }
  router.push(`/invoice/${id}`);
};

const handleDeleteInvoice = async (invoiceId) => {
  try {
    await deleteInvoice(invoiceId);
    // No need to manually splice, the list will be reactive
  } catch (err) {
    console.error("Failed to delete invoice:", err);
    alert(`Error deleting invoice: ${err.message}`);
  }
};

const formatDate = (date) => {
    if (!date) return 'No due date';
    const d = date && typeof date.toDate === 'function' ? date.toDate() : new Date(date);
    return isValid(d) ? format(d, 'MMM d, yyyy') : 'Invalid Date';
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
};

</script>

<template>
  <div v-if="authLoading && !userProfile" class="page-loading-container">
    <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
    <p>Loading your workspace...</p>
  </div>

  <div v-else class="dashboard-container">
    <header class="dashboard-header">
      <div>
        <h1 class="welcome-message">Welcome Back!</h1>
        <p class="date-display">Today is {{ today }}</p>
      </div>
    </header>

    <!-- Invoice Stats Section -->
    <div class="mb-8">
      <InvoiceStats />
    </div>

    <CompanyInfoPrompt v-if="showCompanyInfoPrompt" />

    <main class="dashboard-content">
      <div class="invoices-header">
        <div class="invoices-header-title">
            <h2>Your Invoices</h2>
            <p class="text-grey-darken-1">A summary of your recent invoices.</p>
        </div>
        <v-btn-toggle v-model="viewMode" mandatory variant="outlined" density="compact">
            <v-btn value="card">
                <v-icon>mdi-view-grid-outline</v-icon>
            </v-btn>
            <v-btn value="table">
                <v-icon>mdi-view-list-outline</v-icon>
            </v-btn>
        </v-btn-toggle>
      </div>

      <div v-if="invoicesLoading" class="loading-container">
        <v-progress-circular indeterminate size="48" color="primary"></v-progress-circular>
        <p>Loading invoices...</p>
      </div>
      <div v-else-if="invoicesError" class="error-container">
        <p>Error loading invoices: {{ invoicesError }}</p>
      </div>
      <div v-else-if="!invoices || invoices.length === 0" class="no-invoices-container">
        <img src="/no_invoices.svg" alt="No Invoices Illustration" class="no-invoices-illustration" />
        <h3 class="text-h5 font-weight-medium">No invoices yet</h3>
        <p class="text-body-1 text-grey-darken-1 mt-2 mb-6">Create your first invoice to get started.</p>
        <v-btn color="primary" size="large" @click="createNewInvoice" rounded="pill" class="elevation-2">
          <v-icon left>mdi-plus</v-icon>
          Create Invoice
        </v-btn>
      </div>
      <div v-else>
        <InvoiceTable
          v-if="viewMode === 'table'"
          :invoices="invoices"
           @delete-invoice="handleDeleteInvoice"
        />
        <v-row v-else dense>
          <v-col v-for="invoice in invoices" :key="invoice.id" cols="12" sm="6" md="4">
            <v-card class="invoice-card" @click="goToInvoiceDetails(invoice.id)">
              <v-card-text>
                <div class="d-flex justify-space-between align-start mb-4">
                  <span class="font-weight-bold text-blue-grey-darken-3">#{{ invoice.invoiceNumber || 'N/A' }}</span>
                  <v-chip :color="getStatusColor(getInvoiceStatus(invoice))" size="small" label class="font-weight-bold">
                    {{ getInvoiceStatus(invoice) }}
                  </v-chip>
                </div>
                
                <div class="mb-4">
                    <p class="text-h6 font-weight-bold text-blue-grey-darken-4 mb-1">{{ formatCurrency(invoice.total) }}</p>
                    <p class="text-body-2 text-grey-darken-1">{{ invoice.client?.name || 'N/A' }}</p>
                </div>

                <div class="d-flex justify-space-between align-center text-caption text-grey-darken-1">
                  <span class="d-flex align-center">
                    <v-icon size="sm" class="mr-1">mdi-calendar-month-outline</v-icon>
                    Due: {{ formatDate(invoice.dueDate) }}
                  </span>
                  <v-btn
                    icon="mdi-delete-outline"
                    variant="text"
                    size="small"
                    color="red-lighten-1"
                    @click.stop="handleDeleteInvoice(invoice.id)"
                    title="Delete Invoice"
                  ></v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </main>

    <v-fab
      icon="mdi-plus"
      location="bottom right"
      size="64"
      color="primary"
      app
      appear
      @click="createNewInvoice"
      title="Create New Invoice"
      class="fab-button"
    ></v-fab>

    <footer class="dashboard-footer">
      <p>&copy; 2026 Swift Invoice. All rights reserved. | <a href="mailto:support@swiftinvoice.biz">support@swiftinvoice.biz</a></p>
    </footer>
  </div>
</template>

<style scoped>
.page-loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  gap: 1rem;
}

.dashboard-container {
  padding: 2rem;
  background-color: #F4F7FE;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.welcome-message {
  font-size: 2.2rem;
  font-weight: 700;
  color: #1E293B;
}

.date-display {
  font-size: 1rem;
  color: #64748B;
}

.no-invoices-container {
  text-align: center;
  padding: 4rem 2rem;
  background-color: white;
  border-radius: 24px;
  margin-top: 2rem;
}

.no-invoices-illustration {
  max-width: 220px;
  margin-bottom: 2rem;
  opacity: 0.8;
}

.invoice-card {
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  border-radius: 16px !important;
  height: 100%;
}

.invoice-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.07) !important;
  border-color: #4F46E5;
}

.invoices-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.fab-button {
  transition: transform 0.3s ease;
}

.fab-button:hover {
  transform: scale(1.1);
}

.dashboard-footer {
  text-align: center;
  padding: 3rem 0 1rem;
  font-size: 0.9rem;
  color: #94A3B8;
}
</style>
