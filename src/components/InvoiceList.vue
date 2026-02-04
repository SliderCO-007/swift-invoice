<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import useInvoices from '@/composables/useInvoices';
import { format } from 'date-fns';

const router = useRouter();
const { invoices, loading, fetchInvoices, deleteInvoice: removeInvoice } = useInvoices();

onMounted(fetchInvoices);

const headers = [
  { title: 'Invoice #', key: 'invoiceNumber' },
  { title: 'Client', key: 'client.name' },
  { title: 'Date Issued', key: 'dateIssued' },
  { title: 'Date Due', key: 'dateDue' },
  { title: 'Total', key: 'total' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions' },
];

const formattedInvoices = computed(() => invoices.value.map(invoice => ({
  ...invoice,
  dateIssued: format(new Date(invoice.dateIssued), 'MMM d, yyyy'),
  dateDue: format(new Date(invoice.dateDue), 'MMM d, yyyy'),
  total: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    (invoice.items || []).reduce((acc, item) => acc + (item.quantity * item.price), 0) * (1 + (invoice.taxRate || 0) / 100)
  )
})));

const editInvoice = (id) => router.push(`/invoice/${id}/edit`);

const deleteInvoice = async (id) => {
  if (window.confirm('Are you sure you want to delete this invoice?')) {
    await removeInvoice(id);
  }
};
</script>

<template>
  <div class="invoice-list-container">
    <header class="list-header">
      <h1>Your Invoices</h1>
      <button class="create-btn" @click="router.push('/invoice/new')">
        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
        <span>Create Invoice</span>
      </button>
    </header>

    <div class="invoice-table-card">
      <div v-if="loading" class="loading-state">Loading invoices...</div>
      
      <div v-if="!loading && formattedInvoices.length === 0" class="empty-state">
        <h3>No invoices yet.</h3>
        <p>Click "Create Invoice" to get started.</p>
      </div>

      <table v-if="!loading && formattedInvoices.length > 0" class="invoice-table">
        <thead>
          <tr>
            <th v-for="header in headers" :key="header.key">{{ header.title }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="invoice in formattedInvoices" :key="invoice.id">
            <td>{{ invoice.invoiceNumber }}</td>
            <td>{{ invoice.client.name }}</td>
            <td>{{ invoice.dateIssued }}</td>
            <td>{{ invoice.dateDue }}</td>
            <td>{{ invoice.total }}</td>
            <td>
              <span :class="['status-badge', `status-${invoice.status.toLowerCase()}`]">{{ invoice.status }}</span>
            </td>
            <td class="action-buttons">
              <button class="edit-btn" @click="editInvoice(invoice.id)">Edit</button>
              <button class="delete-btn" @click="deleteInvoice(invoice.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.invoice-list-container {
  padding: 2rem;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.list-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
}

.create-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.create-btn:hover {
  background-color: #3A80D2;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.invoice-table-card {
  background: var(--white-color);
  border-radius: 15px;
  padding: 2rem;
  box-shadow: var(--shadow-lg);
  overflow-x: auto; /* Ensures table is responsive */
}

.loading-state, .empty-state {
  text-align: center;
  padding: 4rem;
  color: #777;
}

.invoice-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px; /* Ensures table looks good on smaller screens before scrolling */
}

.invoice-table th,
.invoice-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
  white-space: nowrap;
}

.invoice-table th {
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  color: #555;
}

.invoice-table tbody tr:hover {
  background-color: #f9f9f9;
}

.status-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.status-paid {
  background-color: #D4EDDA;
  color: #155724;
}

.status-sent {
  background-color: #D1E7FD;
  color: #0C5460;
}

.status-draft {
  background-color: #E2E3E5;
  color: #383D41;
}

.action-buttons button {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0.5rem;
  margin: 0 0.2rem;
  border-radius: 5px;
  transition: background-color 0.2s ease;
  font-weight: 600;
}

.edit-btn {
  color: var(--primary-color);
}

.edit-btn:hover {
  background-color: rgba(74, 144, 226, 0.1);
}

.delete-btn {
  color: #E74C3C;
}

.delete-btn:hover {
  background-color: rgba(231, 76, 60, 0.1);
}
</style>