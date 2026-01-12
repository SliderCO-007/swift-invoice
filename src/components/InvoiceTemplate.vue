<script setup>
import { computed, onMounted } from 'vue';
import useUserSettings from '../composables/useUserSettings';
import { format } from 'date-fns';

const props = defineProps({
  invoice: {
    type: Object,
    required: true,
  },
});

const { settings, fetchUserSettings } = useUserSettings();

onMounted(fetchUserSettings);

const subtotal = computed(() => props.invoice.subtotal || 0);
const taxAmount = computed(() => props.invoice.taxAmount || 0);
const total = computed(() => props.invoice.total || 0);

const formatDate = (date) => {
  if (!date) return 'N/A';
  // Handle both Firebase Timestamps and JS Date objects
  const dateObj = date.toDate ? date.toDate() : date;
  if (dateObj instanceof Date && !isNaN(dateObj)) {
    return format(dateObj, 'MMMM d, yyyy');
  }
  return 'Invalid Date';
};

const formatAddress = (address) => {
  if (!address) return '';
  const parts = [address.address1, address.address2, `${address.city}, ${address.state} ${address.zip}`];
  return parts.filter(Boolean).join(', ');
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};
</script>

<template>
  <div class="invoice-paper">
    <section class="invoice-main-header">
        <div class="invoice-brand">
            <!-- Company Logo and Name -->
            <img v-if="settings?.company?.logoUrl" :src="settings.company.logoUrl" alt="Company Logo" class="company-logo" />
            <h1 v-else class="invoice-title">{{ invoice.sender.name }}</h1>
            <p :class="['invoice-status', `status-${invoice.status.toLowerCase()}`]">{{ invoice.status }}</p>
        </div>
        <div class="sender-details">
            <p><strong>{{ invoice.sender.name }}</strong></p>
            <p>{{ formatAddress(invoice.sender) }}</p>
            <p>{{ invoice.sender.email }}</p>
        </div>
    </section>

    <section class="invoice-meta-details">
        <div class="client-details">
            <h2>Bill To</h2>
            <p><strong>{{ invoice.client.name }}</strong></p>
            <p>{{ formatAddress(invoice.client) }}</p>
            <p>{{ invoice.client.email }}</p>
        </div>
        <div class="invoice-dates">
            <p><strong>Invoice #:</strong> {{ invoice.invoiceNumber }}</p>
            <p><strong>Issue Date:</strong> {{ formatDate(invoice.issueDate) }}</p>
            <p><strong>Due Date:</strong> {{ formatDate(invoice.dueDate) }}</p>
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
                <tr v-for="(item, index) in invoice.items" :key="index">
                    <td data-label="Description">{{ item.description }}</td>
                    <td data-label="Qty">{{ item.quantity }}</td>
                    <td data-label="Unit Price">{{ formatCurrency(item.price) }}</td>
                    <td data-label="Total">{{ formatCurrency(item.quantity * item.price) }}</td>
                </tr>
            </tbody>
        </table>
    </section>

    <section class="invoice-summary">
        <div class="totals">
            <div class="total-row">
                <span>Subtotal</span>
                <span>{{ formatCurrency(subtotal) }}</span>
            </div>
            <div class="total-row" v-if="invoice.taxRate > 0">
                <span>Tax ({{ invoice.taxRate }}%)</span>
                <span>{{ formatCurrency(taxAmount) }}</span>
            </div>
            <div class="total-row grand-total">
                <span>Total</span>
                <span>{{ formatCurrency(total) }}</span>
            </div>
        </div>
    </section>

    <footer v-if="invoice.notes" class="invoice-footer">
        <h2>Notes</h2>
        <p>{{ invoice.notes }}</p>
    </footer>
  </div>
</template>

<style scoped>
.invoice-paper {
  background: var(--white-color, #fff);
  border-radius: 15px;
  padding: 4rem; /* Increased padding */
  box-shadow: var(--shadow-md);
  font-family: 'Poppins', sans-serif;
  color: #333; /* Darker text for readability */
  font-size: 16px; /* Increased base font size */
  line-height: 1.7; /* Increased line height */
}

.company-logo {
  max-height: 100px; /* Increased size */
  max-width: 250px; /* Increased size */
  margin-bottom: 1.5rem;
}

.invoice-main-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 3px solid #eee;
  padding-bottom: 2.5rem;
  margin-bottom: 3rem;
}

.invoice-title {
  font-size: 3.5rem; /* Significantly larger */
  font-weight: 700;
  color: var(--text-color, #111827);
  margin: 0;
}

.invoice-status {
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  font-size: 1rem; /* Larger status */
  font-weight: 700;
  text-transform: uppercase;
  margin-top: 1.5rem;
  display: inline-block;
  letter-spacing: 0.8px;
}

.status-paid { background-color: #D4EDDA; color: #155724; }
.status-pending { background-color: #FFF3CD; color: #856404; }
.status-overdue { background-color: #F8D7DA; color: #721C24; }

.sender-details {
  text-align: right;
  font-size: 1.1rem; /* Larger sender details */
}
.sender-details p { margin: 0; }

.invoice-meta-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3rem;
  font-size: 1.1rem; /* Increased font size */
}

.client-details h2, .invoice-footer h2 {
  font-size: 1.8rem; /* Much larger section heads */
  font-weight: 600;
  color: var(--text-color, #111827);
  margin-bottom: 1rem;
}

.client-details p { margin: 0; }

.invoice-dates {
  text-align: right;
}
.invoice-dates p {
  font-size: 1.2rem; /* Larger dates */
  font-weight: 600;
  margin: 0.5rem 0;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 3rem;
  font-size: 1.2rem; /* Significantly larger item text */
}

.items-table th, .items-table td {
  padding: 1.5rem; /* More padding for rows */
  text-align: left;
  border-bottom: 1px solid #eee;
}

.items-table th {
  background-color: #f9f9f9;
  font-weight: 700;
  font-size: 1rem; /* Bolder headers */
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
}

.totals {
  width: 100%;
  max-width: 400px; /* Wider totals section */
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: 1rem 0; /* More padding */
  font-size: 1.3rem; /* Larger totals text */
  font-weight: 600;
}

.total-row.grand-total {
  font-size: 2.2rem; /* Much larger grand total */
  font-weight: 700;
  color: var(--primary-color, #4A90E2);
  border-top: 3px solid #eee;
  margin-top: 1rem;
  padding-top: 1.5rem;
}

.invoice-footer {
  border-top: 3px solid #eee;
  margin-top: 3rem;
  padding-top: 2.5rem;
  color: #555;
}

.invoice-footer p {
  margin: 0;
  font-size: 1.1rem; /* Larger notes */
}

/* Responsive Styles - Adjusted for better readability */
@media (max-width: 768px) {
  .invoice-paper { padding: 2rem; }
  .invoice-main-header, .invoice-meta-details {
    flex-direction: column;
    gap: 2rem;
  }
  .sender-details, .invoice-dates {
    text-align: left;
    width: 100%;
  }
  .items-table thead { display: none; }
  .items-table tr { display: block; margin-bottom: 2rem; border-bottom: 3px solid #eee; padding-bottom: 1.5rem; }
  .items-table td { display: flex; justify-content: space-between; text-align: right; padding: 0.8rem 0; border-bottom: 1px solid #f9f9f9; font-size: 1.1rem; }
  .items-table td::before { content: attr(data-label); font-weight: 700; text-align: left; margin-right: 1rem; color: #333; }
  .totals { max-width: none; }
}
</style>