<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { format } from 'date-fns';
import useInvoices from '../composables/useInvoices';

const route = useRoute();
const router = useRouter();
const { getInvoice, loading, error } = useInvoices();

const invoice = ref(null);

onMounted(async () => {
  const invoiceId = route.params.id;
  invoice.value = await getInvoice(invoiceId);
});

const goBack = () => {
  router.push('/dashboard');
};

const formatDate = (date) => {
  if (date instanceof Date && !isNaN(date)) {
    return format(date, 'MMMM d, yyyy');
  }
  return 'No date provided';
};

// This computed property is now more robust, ensuring all numbers are correctly handled.
const safeInvoice = computed(() => {
  if (!invoice.value) return null;

  // Sanitize items to prevent rendering errors
  const items = (invoice.value.items || []).map(item => ({
    ...item,
    description: item.description || 'No description',
    quantity: Number(item.quantity) || 0,
    price: Number(item.price) || 0,
  }));

  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.price, 0);
  const taxRate = Number(invoice.value.taxRate) || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  return {
    ...invoice.value,
    id: invoice.value.id || 'N/A',
    invoiceNumber: invoice.value.invoiceNumber || invoice.value.id.substring(0, 6), // Fallback to old ID format
    status: invoice.value.status || 'pending',
    sender: invoice.value.sender || { name: 'N/A', address: '', email: '' },
    client: invoice.value.client || { name: 'N/A', address: '', email: '' },
    items: items,
    taxRate: taxRate,
    notes: invoice.value.notes || '',
    subtotal: subtotal,
    taxAmount: taxAmount,
    total: total
  };
});

</script>

<template>
  <div class="invoice-view-container">
    <div v-if="loading && !invoice" class="loading-container">
      <p>Loading invoice...</p>
    </div>
    <div v-else-if="error" class="error-container">
      <p>Error: {{ error }}</p>
    </div>
    <div v-else-if="safeInvoice">
      <header class="invoice-view-header">
        <button @click="goBack" class="back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Back to Dashboard
        </button>
        <div class="actions">
          <button class="action-btn">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
            Download PDF
          </button>
          <button class="action-btn primary">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            Mark as Paid
          </button>
        </div>
      </header>

      <div class="invoice-paper">
        <section class="invoice-main-header">
          <div class="invoice-brand">
            <!-- Display the new, user-friendly invoice number -->
            <h1 class="invoice-title">Invoice #{{ safeInvoice.invoiceNumber }}</h1>
            <p :class="['invoice-status', `status-${safeInvoice.status.toLowerCase()}`]">{{ safeInvoice.status }}</p>
          </div>
          <div class="sender-details">
            <p><strong>{{ safeInvoice.sender.name }}</strong></p>
            <p>{{ safeInvoice.sender.address }}</p>
            <p>{{ safeInvoice.sender.email }}</p>
          </div>
        </section>

        <section class="invoice-meta-details">
          <div class="client-details">
            <h2>Bill To</h2>
            <p><strong>{{ safeInvoice.client.name }}</strong></p>
            <p>{{ safeInvoice.client.address }}</p>
            <p>{{ safeInvoice.client.email }}</p>
          </div>
          <div class="invoice-dates">
            <p><strong>Issue Date:</strong> {{ formatDate(safeInvoice.issueDate) }}</p>
            <p><strong>Due Date:</strong> {{ formatDate(safeInvoice.dueDate) }}</p>
          </div>
        </section>

        <section class="invoice-items">
          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <!-- This will now render correctly and safely -->
              <tr v-for="(item, index) in safeInvoice.items" :key="index">
                <td>{{ item.description }}</td>
                <td>{{ item.quantity }}</td>
                <td>${{ item.price.toFixed(2) }}</td>
                <td>${{ (item.quantity * item.price).toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="invoice-summary">
          <div class="totals">
            <div class="total-row">
              <span>Subtotal</span>
              <span>${{ safeInvoice.subtotal.toFixed(2) }}</span>
            </div>
            <div class="total-row" v-if="safeInvoice.taxRate > 0">
              <span>Tax ({{ safeInvoice.taxRate }}%)</span>
              <span>${{ safeInvoice.taxAmount.toFixed(2) }}</span>
            </div>
            <div class="total-row grand-total">
              <span>Total</span>
              <span>${{ safeInvoice.total.toFixed(2) }}</span>
            </div>
          </div>
        </section>

        <footer class="invoice-footer">
          <h2>Notes</h2>
          <p>{{ safeInvoice.notes }}</p>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
.invoice-view-container {
  padding: 2rem;
  background-color: var(--background-color, #F9FAFB);
  min-height: 100vh;
}

.invoice-view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.back-btn {
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary-color, #4F46E5);
  cursor: pointer;
  padding: 0.5rem 0;
  display: flex;
  align-items: center;
}

.back-btn svg {
  margin-right: 0.5rem;
}

.actions .action-btn {
  border: 1px solid var(--primary-color, #4F46E5);
  background-color: var(--white-color, #fff);
  color: var(--primary-color, #4F46E5);
  padding: 0.7rem 1.2rem;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  margin-left: 1rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.actions .action-btn svg {
  margin-right: 0.5rem;
}

.actions .action-btn.primary {
  background-color: var(--primary-color, #4F46E5);
  color: var(--white-color, #fff);
}

.actions .action-btn:hover {
  opacity: 0.8;
}

.invoice-paper {
  background: var(--white-color, #fff);
  border-radius: 15px;
  padding: 3rem;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
}

.invoice-main-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 2px solid #eee;
  padding-bottom: 2rem;
}

.invoice-title {
  font-size: 2.8rem;
  font-weight: 700;
  color: var(--text-color, #111827);
  margin: 0;
  font-family: 'monospace';
}

.invoice-status {
  padding: 0.4rem 1rem;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-top: 1rem;
  display: inline-block;
  letter-spacing: 0.5px;
}

.status-paid { background-color: #D4EDDA; color: #155724; }
.status-pending { background-color: #FFF3CD; color: #856404; }
.status-overdue { background-color: #F8D7DA; color: #721C24; }

.sender-details {
  text-align: right;
  color: #555;
}
.sender-details p {
  margin: 0;
  font-size: 0.95rem;
}

.invoice-meta-details {
  display: flex;
  justify-content: space-between;
  margin: 2.5rem 0;
}

.client-details h2, .invoice-footer h2 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-color, #111827);
  margin-bottom: 1rem;
}

.client-details p {
  margin: 0;
  color: #555;
}

.invoice-dates {
  text-align: right;
}
.invoice-dates p {
  font-size: 1rem;
  font-weight: 600;
  margin: 0.5rem 0;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin: 2.5rem 0;
}

.items-table th, .items-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.items-table th {
  background-color: #f9f9f9;
  font-weight: 600;
  color: #555;
}

.items-table td:nth-child(2),
.items-table th:nth-child(2),
.items-table td:nth-child(3),
.items-table th:nth-child(3),
.items-table td:nth-child(4),
.items-table th:nth-child(4) {
  text-align: right;
}

.invoice-summary {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
}

.totals {
  width: 100%;
  max-width: 350px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: 0.8rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.total-row.grand-total {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color, #4F46E5);
  border-top: 2px solid #eee;
  margin-top: 0.5rem;
  padding-top: 1rem;
}

.invoice-footer {
  border-top: 2px solid #eee;
  margin-top: 2.5rem;
  padding-top: 2rem;
  color: #555;
}

.invoice-footer p {
  margin: 0;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  font-size: 1.2rem;
  color: var(--text-color, #111827);
}

.error-container {
    text-align: center;
    padding: 3rem;
    color: #E74C3C;
}
</style>
