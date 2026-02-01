<script setup>
import { computed, onMounted } from 'vue';
import useUserSettings from '../composables/useUserSettings';
import { format, isValid } from 'date-fns';

const props = defineProps({
  invoice: {
    type: Object,
    required: true,
  },
  settings: {
    type: Object,
    required: true,
  },
});

const subtotal = computed(() => props.invoice.subtotal || 0);
const taxAmount = computed(() => props.invoice.taxAmount || 0);
const total = computed(() => props.invoice.total || 0);

const formatDate = (date) => {
  if (!date) return 'N/A';
  // Check if date is a Firestore timestamp and convert it
  const d = date.toDate ? date.toDate() : new Date(date);
  return isValid(d) ? format(d, 'MMMM d, yyyy') : 'N/A';
};

const formatAddress = (address) => {
  if (!address) return '';
  const parts = [address.address1, address.address2, `${address.city}, ${address.state} ${address.zip}`];
  return parts.filter(Boolean).join(', ');
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
};
</script>

<template>
  <div class="invoice-paper">
    <section class="invoice-main-header">
        <div class="invoice-brand">
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
            <p><strong>Invoice #:</strong> {{ invoice.invoiceNumber || '(Generated upon save)' }}</p>
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
                    <td data-label="Description"><span>{{ item.description }}</span></td>
                    <td data-label="Qty"><span>{{ item.quantity }}</span></td>
                    <td data-label="Unit Price"><span>{{ formatCurrency(item.price) }}</span></td>
                    <td data-label="Total"><span>{{ formatCurrency(item.quantity * item.price) }}</span></td>
                </tr>
            </tbody>
        </table>
    </section>

    <section class="invoice-summary-and-notes">
        <div class="notes-and-qr">
          <div v-if="invoice.notes" class="invoice-notes">
              <h2>Notes</h2>
              <p>{{ invoice.notes }}</p>
          </div>
          <div v-if="invoice.includeVenmoQr && settings.company.venmoQrUrl" class="venmo-qr-code">
            <h2>Scan to Pay</h2>
            <img :src="settings.company.venmoQrUrl" alt="Venmo QR Code" />
            <p>Venmo</p>
          </div>
        </div>
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

    <footer class="promo-footer">
      <p>Create your own professional invoices at <a href="https://swiftinvoice.biz" target="_blank">swiftinvoice.biz</a></p>
    </footer>
  </div>
</template>

<style scoped>
.invoice-paper {
  background: var(--white-color, #fff);
  border-radius: 12px;
  padding: 2.5rem; 
  box-shadow: var(--shadow-md);
  font-family: 'Poppins', sans-serif;
  color: #333;
  font-size: 10px;
  line-height: 1.6;
}

.company-logo {
  max-height: 60px;
  max-width: 180px;
  margin-bottom: 1rem;
}

.invoice-main-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 2px solid #eee;
  padding-bottom: 2rem;
  margin-bottom: 2rem;
}

.invoice-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color, #111827);
  margin: 0;
}

.invoice-status {
  padding: 0.3rem 0.8rem;
  border-radius: 14px;
  font-size: 0.75rem;
  font-weight: 600;
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
  font-size: 0.85rem;
}
.sender-details p { margin: 0; }

.invoice-meta-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2.5rem;
  font-size: 0.85rem;
}

.client-details h2, .invoice-notes h2, .venmo-qr-code h2 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color, #111827);
  margin-bottom: 0.7rem;
}

.client-details p { margin: 0; }

.invoice-dates {
  text-align: right;
}
.invoice-dates p {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0.3rem 0;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
  font-size: 0.85rem;
}

.items-table th, .items-table td {
  padding: 0.8rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.items-table th {
  background-color: #f9f9f9;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.items-table td:nth-child(2),
.items-table th:nth-child(2),
.items-table td:nth-child(3),
.items-table th:nth-child(3),
.items-table td:nth-child(4),
.items-table th:nth-child(4) {
  text-align: right;
}

.invoice-summary-and-notes {
    display: flex;
    justify-content: space-between;
    gap: 2rem;
    margin-top: 2rem;
    border-top: 2px solid #eee;
    padding-top: 2rem;
}

.notes-and-qr {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.invoice-notes p {
  margin: 0;
  font-size: 0.85rem;
  color: #555;
}

.venmo-qr-code {
  text-align: center;
}

.venmo-qr-code img {
  max-width: 120px; /* Adjust size as needed */
  margin-bottom: 0.5rem;
}

.venmo-qr-code p {
    font-weight: 600;
    font-size: 0.9rem;
    color: #007bff; /* Venmo blue */
}

.totals {
  width: 100%;
  max-width: 280px;
  align-self: flex-start;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: 0.6rem 0;
  font-size: 0.9rem;
  font-weight: 600;
}

.total-row.grand-total {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--primary-color, #4A90E2);
  border-top: 2px solid #eee;
  margin-top: 0.6rem;
  padding-top: 0.8rem;
}

.promo-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
  font-size: 0.7rem;
  color: #888;
}

.promo-footer a {
  color: var(--primary-color, #4A90E2);
  text-decoration: none;
  font-weight: 600;
}

.promo-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
    .invoice-summary-and-notes {
        flex-direction: column-reverse;
    }
    .totals { max-width: none; }
}

/* Responsive Styles for table */
@media (max-width: 768px) {
  .invoice-paper { padding: 1.5rem; }
  .invoice-main-header, .invoice-meta-details {
    flex-direction: column;
    gap: 1.5rem;
  }
  .sender-details, .invoice-dates {
    text-align: left;
    width: 100%;
  }
  .items-table thead { display: none; }
  .items-table tr { 
    display: block; 
    margin-bottom: 1rem; 
    border-bottom: 2px solid #eee; 
    padding-bottom: 1rem; 
  }
  .items-table tr:last-of-type { border-bottom: none; }

  .items-table td {
    display: grid;
    grid-template-columns: 100px 1fr;
    gap: 1rem;
    align-items: start;
    padding: 0.4rem 0;
    font-size: 0.9rem;
    border-bottom: none;
  }
  .items-table td::before {
    content: attr(data-label);
    font-weight: 700;
    text-align: left;
    grid-column: 1 / 2;
  }
  .items-table td span {
    text-align: right;
    word-break: break-all;
    grid-column: 2 / 3;
  }
}
</style>
