<script setup>
import { computed } from 'vue'
import { format, isValid } from 'date-fns'

const props = defineProps({
  invoice: {
    type: Object,
    required: true,
  },
  settings: {
    type: Object,
    required: true,
  },
  userProfile: {
    type: Object,
    default: null,
  }
})

const subtotal = computed(() => props.invoice.subtotal || 0)
const discountAmount = computed(() => props.invoice.discountAmount || 0)
const taxAmount = computed(() => props.invoice.taxAmount || 0)
const total = computed(() => props.invoice.total || 0)

const paymentUrl = computed(() => {
  if (props.userProfile?.chargesEnabled && props.invoice?.id) {
    return `${window.location.origin}/pay/${props.invoice.id}`
  }
  return null
})

const paymentQrImageUrl = computed(() => {
  if (props.userProfile?.chargesEnabled && props.invoice?.id) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&ecc=H&data=${encodeURIComponent(paymentUrl.value)}`
  }
  return null
})


const formatDate = (date) => {
  if (!date) return 'N/A'
  const d = date.toDate ? date.toDate() : new Date(date)
  return isValid(d) ? format(d, 'MMMM d, yyyy') : 'N/A'
}

const formatAddress = (address) => {
  if (!address) return ''
  const parts = [
    address.address1,
    address.address2,
    `${address.city}, ${address.state} ${address.zip}`,
  ]
  return parts.filter(Boolean).join(', ')
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: props.settings?.currency || 'USD' }).format(
    value || 0
  )
}
</script>

<template>
  <div class="invoice-modern" v-if="invoice && settings">
    <header class="header">
      <div class="header-left">
        <img
          v-if="settings?.company?.logoUrl"
          :src="settings.company.logoUrl"
          alt="Company Logo"
          class="logo"
        />
        <h1 v-else class="company-name">{{ invoice.sender.name }}</h1>
        <p v-if="!settings?.company?.logoUrl || settings?.company?.logoUrl === '/Logo.png'" class="logo-upload-hint no-print" data-html2canvas-ignore="true">
          * Upload custom logo in <router-link to="/settings">Settings</router-link>
        </p>
      </div>
      <div class="header-right">
        <div :class="['invoice-badge', `status-${invoice.status.toLowerCase()}`]">
          {{ invoice.status }}
        </div>
      </div>
    </header>

    <div class="invoice-title-section">
      <div>
        <h2>INVOICE</h2>
        <p class="invoice-number">#{{ invoice.invoiceNumber }}</p>
      </div>
      <div class="invoice-meta">
        <div class="meta-item">
          <span class="meta-label">Issue Date</span>
          <span class="meta-value">{{ formatDate(invoice.issueDate) }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Due Date</span>
          <span class="meta-value">{{ formatDate(invoice.dueDate) }}</span>
        </div>
      </div>
    </div>

    <div class="parties-section">
      <div class="party from">
        <p class="party-label">From</p>
        <p class="party-name">{{ invoice.sender.name }}</p>
        <p class="party-detail">{{ formatAddress(invoice.sender) }}</p>
        <p class="party-detail">{{ invoice.sender.email }}</p>
      </div>
      <div class="party to">
        <p class="party-label">Bill To</p>
        <p class="party-name">{{ invoice.client.name }}</p>
        <p class="party-detail">{{ formatAddress(invoice.client) }}</p>
        <p class="party-detail">{{ invoice.client.email }}</p>
      </div>
    </div>

    <div class="items-container">
      <table class="items-table">
        <thead>
          <tr>
            <th class="col-description">Description</th>
            <th class="col-qty">Qty</th>
            <th class="col-price">Unit Price</th>
            <th class="col-total">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in invoice.items" :key="index">
            <td class="col-description">
              {{ item.description }}
              <span v-if="invoice.taxRate > 0 && item.taxable === false" style="font-size: 0.7rem; opacity: 0.65; margin-left: 0.25rem; border: 1px solid rgba(128,128,128,0.3); padding: 1px 4px; border-radius: 3px; font-weight: normal; display: inline-block; vertical-align: middle;">No Tax</span>
            </td>
            <td class="col-qty">{{ item.quantity }}</td>
            <td class="col-price">{{ formatCurrency(item.price) }}</td>
            <td class="col-total">{{ formatCurrency(item.quantity * item.price) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="summary-section">
       <div class="notes-and-qr-modern">
        <div v-if="invoice.notes" class="invoice-notes-modern">
          <p class="notes-title">Notes</p>
          <p class="notes-content">{{ invoice.notes }}</p>
        </div>
        <div
          v-if="userProfile?.chargesEnabled && paymentQrImageUrl"
          class="payment-qr-code payment-qr-code-modern"
        >
          <a :href="paymentUrl" target="_blank" rel="noopener noreferrer" class="payment-link" style="text-decoration: none; color: inherit; display: inline-block;">
            <p class="qr-label">Scan or click to pay Online Securely</p>
            <div style="position: relative; display: inline-block;">
              <img :src="paymentQrImageUrl" alt="Pay via Stripe" class="qr-img" crossorigin="anonymous" style="display: block;" />
              <img v-if="userProfile?.chargesEnabled && settings?.company?.logoUrl" :src="settings.company.logoUrl" crossorigin="anonymous" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 28%; height: 28%; object-fit: contain; background: white; border-radius: 4px; padding: 2px;" />
            </div>
          </a>
        </div>
      </div>

      <div class="totals-column">
        <div class="total-item">
          <span>Subtotal</span>
          <span>{{ formatCurrency(subtotal) }}</span>
        </div>
        <div class="total-item" v-if="discountAmount > 0">
          <span>Discount</span>
          <span>-{{ formatCurrency(discountAmount) }}</span>
        </div>
        <div class="total-item" v-if="invoice.taxRate > 0">
          <span>Tax ({{ invoice.taxRate }}%)</span>
          <span>{{ formatCurrency(taxAmount) }}</span>
        </div>
        <div class="total-item total-grand">
          <span>Total</span>
          <span>{{ formatCurrency(total) }}</span>
        </div>
      </div>
    </div>

    <footer class="footer">
      <p>scangoinvoice.com</p>
    </footer>
  </div>
</template>

<style scoped>
.invoice-modern {
  background: #ffffff;
  padding: 3rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #1a1a1a;
  max-width: 900px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 3rem;
  gap: 2rem;
}

.header-left {
  flex: 1;
}

.logo {
  max-height: 70px;
  max-width: 200px;
  margin-bottom: 0.5rem;
  object-fit: contain;
}

.company-name {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  color: #1a1a1a;
}

.header-right {
  display: flex;
  justify-content: flex-end;
}

.invoice-badge {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-paid {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-pending {
  background-color: #fff3e0;
  color: #e65100;
}

.status-overdue {
  background-color: #ffebee;
  color: #c62828;
}

.invoice-title-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 3rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 2rem;
}

.invoice-title-section h2 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: 2px;
}

.invoice-number {
  margin: 0.5rem 0 0 0;
  font-size: 1rem;
  color: #666;
  font-weight: 600;
}

.invoice-meta {
  display: flex;
  gap: 2rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
  text-align: right;
}

.meta-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #999;
  margin-bottom: 0.3rem;
  letter-spacing: 0.5px;
}

.meta-value {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
}

.parties-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
}

.party-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #999;
  margin: 0 0 1rem 0;
  letter-spacing: 0.5px;
  font-weight: 700;
}

.party-name {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a1a;
}

.party-detail {
  margin: 0.3rem 0;
  font-size: 0.9rem;
  color: #555;
  line-height: 1.5;
}

.items-container {
  margin-bottom: 2rem;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 0;
}

.items-table thead {
  background-color: #f5f5f5;
  border-top: 2px solid #e0e0e0;
  border-bottom: 2px solid #e0e0e0;
}

.items-table th {
  padding: 1rem;
  text-align: left;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #666;
  letter-spacing: 0.5px;
}

.items-table td {
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.95rem;
  color: #333;
}

.col-qty, .col-price, .col-total {
  text-align: right;
}

.items-table tbody tr {
  break-inside: avoid;
  page-break-inside: avoid;
}

.items-table th.col-qty, .items-table th.col-price, .items-table th.col-total {
  text-align: right;
}

.summary-section {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 3rem;
  border-top: 2px solid #f0f0f0;
  padding-top: 2rem;
  margin-top: 2rem;
  break-inside: avoid;
  page-break-inside: avoid;
}

.notes-and-qr-modern {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  justify-content: space-between;
}

.invoice-notes-modern .notes-title {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #1a1a1a;
  letter-spacing: 0.5px;
}

.invoice-notes-modern .notes-content {
  margin: 0;
  font-size: 0.9rem;
  color: #555;
  line-height: 1.6;
}

.payment-qr-code-modern {
  text-align: center;
  margin-top: auto;
  break-inside: avoid;
  page-break-inside: avoid;
}

.qr-label {
  margin: 0 0 1rem 0;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #1a1a1a;
  letter-spacing: 0.5px;
}

.qr-img {
  max-width: 120px;
  border: 1px solid #e0e0e0;
  padding: 0.5rem;
  background: #fafafa;
  border-radius: 4px;
}

.totals-column {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.total-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1a1a;
}

.total-grand {
  border-top: 2px solid #1a1a1a;
  padding-top: 1rem;
  margin-top: 0.5rem;
  font-size: 1.3rem;
  color: #1a1a1a;
}

.footer {
  text-align: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #e0e0e0;
  font-size: 0.8rem;
  color: #999;
}

@media (max-width: 768px) {
  .invoice-modern { padding: 1.5rem; }
  .header, .invoice-title-section, .parties-section, .summary-section {
    flex-direction: column;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  .invoice-meta { flex-direction: column; gap: 1rem; width: 100%; }
  .meta-item { text-align: left; }
  .items-table { font-size: 0.85rem; border: none; }
  .items-table thead { display: none; }
  .items-table tr { display: block; margin-bottom: 1rem; border: 1px solid #e0e0e0; border-radius: 8px; padding: 1rem; background-color: #fafafa; }
  .items-table td { display: flex; justify-content: space-between; padding: 0.5rem 0; text-align: right; }
  .items-table td:last-child { border-bottom: none; font-weight: bold; }
  .items-table td::before { font-weight: 600; text-align: left; margin-right: 1rem; color: #555; }
  .items-table .col-description { justify-content: flex-start; text-align: left; font-size: 1rem; font-weight: bold; color: #1a1a1a; padding-bottom: 0.75rem; }
  .items-table .col-description::before { display: none; }
  .items-table .col-qty::before { content: 'Qty'; }
  .items-table .col-price::before { content: 'Unit Price'; }
  .items-table .col-total::before { content: 'Amount'; }
}

.logo-upload-hint {
  font-size: 0.72rem;
  color: #64748b;
  font-style: italic;
  margin-top: 4px;
}
.logo-upload-hint a {
  color: #0284c7;
  text-decoration: underline;
}

@media print {
  .no-print {
    display: none !important;
  }
}
</style>
