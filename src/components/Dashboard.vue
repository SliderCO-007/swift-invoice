<script setup>
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import useAuth from '../composables/useAuth';
import useInvoices from '../composables/useInvoices';
import { format } from 'date-fns';

const { logout } = useAuth();
const { invoices, getInvoices, loading, error } = useInvoices();
const router = useRouter();

const today = format(new Date(), 'MMMM d, yyyy');

onMounted(getInvoices);

const handleLogout = async () => {
  await logout();
  router.push('/login');
};

const goToSettings = () => router.push('/settings');
const goToInvoiceEditor = () => router.push('/invoice/new');
const goToInvoiceDetails = (id) => router.push(`/invoice/${id}`);

// Safely format dates
const formatDate = (date) => {
  if (date && typeof date.toDate === 'function') {
    return format(date.toDate(), 'MMM d, yyyy');
  }
  return 'No due date';
};

// Computed property to safely prepare invoices for display
const safeInvoices = computed(() => {
  if (!invoices.value) return [];
  return invoices.value.map(inv => ({
    ...inv,
    status: inv.status || 'pending',
    total: inv.total || 0,
    client: inv.client || { name: 'N/A' },
    dueDate: inv.dueDate // keep as is, formatDate will handle it
  }));
});

</script>

<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <div>
        <h1 class="welcome-message">Welcome Back!</h1>
        <p class="date-display">Today is {{ today }}</p>
      </div>
      <div class="header-actions">
        <button class="settings-btn" @click="goToSettings">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>
          Manage Settings
        </button>
        <button class="logout-btn" @click="handleLogout">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
          Logout
        </button>
      </div>
    </header>

    <main class="dashboard-content">
      <div class="invoices-header">
        <h2>Your Invoices</h2>
        <p>A summary of your recent invoices.</p>
      </div>

      <div v-if="loading" class="loading-container">
        <p>Loading invoices...</p>
      </div>
      <div v-else-if="error" class="error-container">
        <p>Error loading invoices: {{ error }}</p>
      </div>
      <div v-else-if="safeInvoices.length === 0" class="no-invoices-container">
        <img src="/no_invoices.svg" alt="No Invoices Illustration" class="no-invoices-illustration" />
        <p class="no-invoices-text">You haven't created any invoices yet.</p>
        <button class="primary-btn" @click="goToInvoiceEditor">
          Create Your First Invoice
        </button>
      </div>
      <div v-else class="invoice-list">
        <div v-for="invoice in safeInvoices" :key="invoice.id" class="invoice-card" @click="goToInvoiceDetails(invoice.id)">
          <div class="invoice-card-header">
            <span class="invoice-id">#{{ invoice.id.substring(0, 6) }}</span>
            <span :class="['invoice-status', `status-${invoice.status.toLowerCase()}`]">{{ invoice.status }}</span>
          </div>
          <div class="invoice-card-body">
            <p class="client-name">{{ invoice.client.name }}</p>
            <p class="invoice-total">${{ invoice.total.toFixed(2) }}</p>
          </div>
          <div class="invoice-card-footer">
            <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 0 24 24" width="16px" fill="#777"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>
            <span>Due: {{ formatDate(invoice.dueDate) }}</span>
          </div>
        </div>
      </div>
    </main>

    <button class="fab" @click="goToInvoiceEditor">
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
    </button>

  </div>
</template>

<style scoped>
/* ... existing styles ... */
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

.header-actions button {
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 1rem;
  display: flex;
  align-items: center;
}

.header-actions svg {
  margin-right: 0.5rem;
}

.settings-btn {
  background-color: var(--white-color);
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}

.settings-btn:hover {
  background-color: var(--primary-color);
  color: var(--white-color);
}

.logout-btn {
  background-color: #E74C3C;
  color: var(--white-color);
}

.logout-btn:hover {
  opacity: 0.9;
}

.invoices-header {
  margin-bottom: 2rem;
}

.invoices-header h2 {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-color);
}

.invoices-header p {
  color: #777;
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
}

.invoice-card-footer svg {
  margin-right: 0.5rem;
}

.loading-container,
.error-container {
    text-align: center;
    padding: 3rem;
    color: var(--text-color);
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
  background-color: #3A80D2; /* Darker blue on hover */
  box-shadow: 0 12px 25px rgba(74, 144, 226, 0.4);
  transform: scale(1.05);
}
</style>
