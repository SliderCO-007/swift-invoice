<script setup>
import { ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth, currentUser } from '../composables/useAuth.js';
import useInvoices from '../composables/useInvoices';
import useUserSettings from '../composables/useUserSettings';
import { useMeta } from '../composables/useMeta';
import { format, isValid } from 'date-fns';
import InvoiceTable from './InvoiceTable.vue';
import CompanyInfoPrompt from './CompanyInfoPrompt.vue';
import InvoiceStats from './InvoiceStats.vue';

// --- Composables ---
const { loading: authLoading, logout } = useAuth();
const { invoices, getInvoices, loading: invoicesLoading, error: invoicesError, deleteInvoice } = useInvoices();
const { settings, fetchUserSettings } = useUserSettings();
const router = useRouter();

// Use the globally shared currentUser ref for reactivity
const user = currentUser;

// --- Local State ---
const viewMode = ref('table'); // 'card' or 'table'
const today = format(new Date(), 'MMMM d, yyyy');

// --- Metadata ---
useMeta(
  'Dashboard | Swift Invoice',
  'Manage your invoices, view payment statuses, and track your business finances with the Swift Invoice dashboard.',
  'Perfect for small businesses and individuals looking to streamline their invoice management.'
);

// --- Data Fetching ---
// Watch the globally shared user object. When it changes (on login), fetch data.
watch(user, (newUser) => {
  if (newUser) {
    getInvoices();
    fetchUserSettings();
  }
}, { immediate: true });

// --- Computed Properties ---
const showCompanyInfoPrompt = computed(() => {
  return settings.value && !settings.value.company?.name;
});

const safeInvoices = computed(() => {
  if (!invoices.value) return [];
  return invoices.value.slice().sort((a, b) => {
      const numA = String(a.invoiceNumber || '');
      const numB = String(b.invoiceNumber || '');
      return numB.localeCompare(numA, undefined, { numeric: true });
    });
});

// --- Methods ---
const handleLogout = async () => {
  await logout();
  router.push('/login');
};

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
  } catch (err) {
    console.error("Failed to delete invoice:", err);
    alert(`Error deleting invoice: ${err.message}`);
  }
};

const handleDeleteFromCard = (event, invoiceId) => {
  event.stopPropagation();
  if (confirm(`Are you sure you want to delete this invoice? This action cannot be undone.`)) {
    handleDeleteInvoice(invoiceId);
  }
};

const formatDate = (date) => {
  if (date && isValid(date)) {
    return format(date, 'MMM d, yyyy');
  }
  return 'No due date';
};
</script>

<template>
  <!-- Show a global loader while the initial authentication is happening -->
  <div v-if="authLoading" class="page-loading-container">
    <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
    <p>Authenticating...</p>
  </div>

  <!-- Show the main dashboard content once authentication is resolved -->
  <div v-else class="dashboard-container">
    <header class="dashboard-header">
      <div>
        <h1 class="welcome-message">Welcome Back!</h1>
        <p class="date-display">Today is {{ today }}</p>
      </div>
      <div class="header-stats">
        <InvoiceStats :invoices="safeInvoices" />
      </div>
    </header>

    <CompanyInfoPrompt v-if="showCompanyInfoPrompt" />

    <main class="dashboard-content">
      <div class="invoices-header">
        <div class="invoices-header-title">
            <h2>Your Invoices</h2>
            <p>A summary of your recent invoices.</p>
        </div>
        <v-btn-toggle v-model="viewMode" mandatory dense background-color="transparent">
            <v-btn value="card">
                <v-icon>mdi-view-grid</v-icon>
            </v-btn>
            <v-btn value="table">
                <v-icon>mdi-view-list</v-icon>
            </v-btn>
        </v-btn-toggle>
      </div>

      <!-- Show loader specific to invoice data fetching -->
      <div v-if="invoicesLoading" class="loading-container">
        <v-progress-circular indeterminate size="48" color="primary"></v-progress-circular>
        <p>Loading invoices...</p>
      </div>
      <div v-else-if="invoicesError" class="error-container">
        <p>Error loading invoices: {{ invoicesError }}</p>
      </div>
      <div v-else-if="!safeInvoices || safeInvoices.length === 0" class="no-invoices-container">
        <img src="/no_invoices.svg" alt="No Invoices Illustration" class="no-invoices-illustration" />
        <p class="no-invoices-text">You haven't created any invoices yet.</p>
        <button class="primary-btn" @click="createNewInvoice">
          Create Your First Invoice
        </button>
      </div>
      <div v-else>
        <InvoiceTable 
          v-if="viewMode === 'table'" 
          :invoices="safeInvoices"
          @delete-invoice="handleDeleteInvoice"
        />
        <div v-else class="invoice-list">
          <div v-for="invoice in safeInvoices" :key="invoice.id" class="invoice-card" @click="goToInvoiceDetails(invoice.id)">
            <div class="invoice-card-header">
              <span class="invoice-id">#{{ invoice.invoiceNumber || 'N/A' }}</span>
              <span :class="['invoice-status', `status-${(invoice.status || 'pending').toLowerCase()}`]">{{ invoice.status || 'pending' }}</span>
            </div>
            <div class="invoice-card-body">
              <p class="client-name">{{ invoice.client?.name || 'N/A' }}</p>
              <p class="invoice-total">${{ (invoice.total || 0).toFixed(2) }}</p>
            </div>
            <div class="invoice-card-footer">
              <span>
                  <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 0 24 24" width="16px" fill="#777"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>
                  Due: {{ formatDate(invoice.dueDate) }}
              </span>
              <button class="delete-btn" @click="handleDeleteFromCard($event, invoice.id)">
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <button class="fab" @click="createNewInvoice">
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
    </button>

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
  text-align: center;
}
.page-loading-container p {
  margin-top: 1rem;
  font-size: 1.2rem;
  color: #555;
}

.dashboard-container {
  padding: 2rem;
  background-color: var(--background-color);
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.welcome-message {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-color);
}

.date-display {
  font-size: 1.1rem;
  color: #777;
}

.header-stats {
  width: 60%;
}

.invoices-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.invoices-header-title h2 {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.invoices-header-title p {
  color: #777;
  margin: 0;
}

.loading-container,
.error-container {
    text-align: center;
    padding: 3rem;
    color: var(--text-color);
}

.loading-container p {
  margin-top: 1rem;
}

.no-invoices-container {
  text-align: center;
  padding: 4rem 2rem;
  background-color: var(--white-color);
  border-radius: 15px;
  box-shadow: var(--shadow-md);
}

.no-invoices-illustration {
  max-width: 200px;
  margin-bottom: 2rem;
}

.no-invoices-text {
  font-size: 1.2rem;
  color: #555;
  margin-bottom: 1.5rem;
}

.invoice-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.invoice-card {
  background: var(--white-color);
  border-radius: 15px;
  padding: 1.5rem;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
}

.invoice-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.invoice-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
}

.invoice-id {
  font-weight: 700;
  color: var(--primary-color);
  font-family: 'monospace';
}

.invoice-status {
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-paid {
  background-color: #D4EDDA;
  color: #155724;
}

.status-pending {
  background-color: #FFF3CD;
  color: #856404;
}

.status-overdue {
  background-color: #F8D7DA;
  color: #721C24;
}

.invoice-card-body {
  flex-grow: 1;
}

.invoice-card-body .client-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.invoice-card-body .invoice-total {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary-color);
}

.invoice-card-footer {
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #777;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.invoice-card-footer span {
  display: flex;
  align-items: center;
}

.invoice-card-footer svg {
  margin-right: 0.5rem;
}

.delete-btn {
    background: none;
    border: none;
    color: #E74C3C;
    cursor: pointer;
    padding: 5px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s ease, color 0.3s ease;
}

.delete-btn:hover {
    background-color: #F8D7DA;
    color: #721C24;
}

.primary-btn {
    background-color: var(--primary-color);
    color: white;
    padding: 0.8rem 1.5rem;
    border-radius: 20px;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s ease;
    font-weight: 600;
}

.primary-btn:hover {
    background-color: #3A80D2;
}

.fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  border: none;
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.fab:hover {
  background-color: #3A80D2;
  box-shadow: 0 12px 25px rgba(74, 144, 226,.4);
  transform: scale(1.05);
}

.dashboard-footer {
  text-align: center;
  padding: 2rem 0 1rem;
  font-size: 0.9rem;
  color: #888;
}

.dashboard-footer a {
  color: var(--primary-color, #4A90E2);
  text-decoration: none;
  font-weight: 600;
}

.dashboard-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-wrap: wrap;
  }
  .header-stats {
    width: 100%;
    margin-top: 1rem;
  }
}
</style>