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

const hexToRgb = (hex) => {
  if (!hex) return { r: 26, g: 58, b: 82 }
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b)
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 26, g: 58, b: 82 }
}

const primaryColor = computed(() => props.invoice.primaryColor || props.settings?.company?.primaryColor || '#1a3a52')
const primaryRgb = computed(() => {
  const rgb = hexToRgb(primaryColor.value)
  return `${rgb.r}, ${rgb.g}, ${rgb.b}`
})
</script>

<template>
  <div class="invoice-sidebar-layout" v-if="invoice && settings">
    <!-- Left Sidebar Column -->
    <aside class="sidebar" :style="{ backgroundColor: `rgba(${primaryRgb}, 0.04)`, borderRight: `2px solid rgba(${primaryRgb}, 0.08)` }">
      <div class="sidebar-logo">
        <img
          v-if="settings?.company?.logoUrl"
          :src="settings.company.logoUrl"
          alt="Company Logo"
          class="logo"
        />
        <h1 v-else class="company-name" :style="{ color: primaryColor }">{{ invoice.sender.name }}</h1>
      </div>

      <div class="sidebar-section status-section">
        <p class="section-label" :style="{ color: primaryColor }">STATUS</p>
        <span :class="['status-badge', `status-${invoice.status.toLowerCase()}`]">
          {{ invoice.status }}
        </span>
      </div>

      <div class="sidebar-section info-section">
        <p class="section-label" :style="{ color: primaryColor }">INVOICE DETAILS</p>
        <div class="info-item">
          <span class="info-label">Invoice #:</span>
          <span class="info-value font-weight-bold">{{ invoice.invoiceNumber }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Issued:</span>
          <span class="info-value">{{ formatDate(invoice.issueDate) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Due Date:</span>
          <span class="info-value font-weight-bold">{{ formatDate(invoice.dueDate) }}</span>
        </div>
      </div>

      <div class="sidebar-section billing-section">
        <p class="section-label" :style="{ color: primaryColor }">BILL TO</p>
        <p class="client-name font-weight-bold">{{ invoice.client.name }}</p>
        <p class="client-detail">{{ formatAddress(invoice.client) }}</p>
        <p class="client-detail">{{ invoice.client.email }}</p>
      </div>

      <div
        v-if="userProfile?.chargesEnabled && paymentQrImageUrl"
        class="sidebar-section payment-section payment-qr-code"
      >
        <p class="section-label" :style="{ color: primaryColor }">SECURE PAYMENT</p>
        <div class="qr-wrapper">
          <a :href="paymentUrl" target="_blank" rel="noopener noreferrer" style="position: relative; display: inline-block;">
            <img :src="paymentQrImageUrl" alt="Pay via Stripe" class="qr-img" crossorigin="anonymous" style="display: block;" />
            <img v-if="userProfile?.chargesEnabled && settings?.company?.logoUrl" :src="settings.company.logoUrl" crossorigin="anonymous" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 28%; height: 28%; object-fit: contain; background: white; border-radius: 4px; padding: 2px;" />
          </a>
        </div>
        <p class="payment-cta" :style="{ color: primaryColor }">Scan or click to pay</p>
      </div>
    </aside>

    <!-- Right Main Column -->
    <main class="main-content">
      <header class="main-header">
        <div class="invoice-title-block">
          <h2 :style="{ color: primaryColor }">INVOICE</h2>
        </div>
        <div class="sender-details text-right">
          <p class="sender-name font-weight-bold">{{ invoice.sender.name }}</p>
          <p class="sender-info">{{ formatAddress(invoice.sender) }}</p>
          <p class="sender-info">{{ invoice.sender.email }}</p>
        </div>
      </header>

      <section class="items-section">
        <table class="items-table">
          <thead>
            <tr :style="{ backgroundColor: primaryColor, color: '#fff' }">
              <th>Description</th>
              <th class="col-qty">Qty</th>
              <th class="col-price">Unit Price</th>
              <th class="col-total">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in invoice.items" :key="index">
              <td data-label="Description">{{ item.description }}</td>
              <td class="col-qty" data-label="Qty">{{ item.quantity }}</td>
              <td class="col-price" data-label="Unit Price">{{ formatCurrency(item.price) }}</td>
              <td class="col-total font-weight-bold" data-label="Total">{{ formatCurrency(item.quantity * item.price) }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <footer class="main-footer-section">
        <div class="notes-and-totals">
          <div class="notes-block">
            <div v-if="invoice.notes" class="invoice-notes">
              <h3 :style="{ color: primaryColor }">Notes</h3>
              <p>{{ invoice.notes }}</p>
            </div>
          </div>

          <div class="totals-block">
            <div class="total-row">
              <span class="label">Subtotal</span>
              <span class="val">{{ formatCurrency(subtotal) }}</span>
            </div>
            <div class="total-row discount" v-if="discountAmount > 0">
              <span class="label">Discount</span>
              <span class="val">-{{ formatCurrency(discountAmount) }}</span>
            </div>
            <div class="total-row tax" v-if="invoice.taxRate > 0">
              <span class="label">Tax ({{ invoice.taxRate }}%)</span>
              <span class="val">{{ formatCurrency(taxAmount) }}</span>
            </div>
            <div class="total-row grand-total" :style="{ backgroundColor: `rgba(${primaryRgb}, 0.06)`, borderLeft: `4px solid ${primaryColor}` }">
              <span class="label font-weight-bold">Total Due</span>
              <span class="val font-weight-bold" :style="{ color: primaryColor }">{{ formatCurrency(total) }}</span>
            </div>
          </div>
        </div>

        <div class="promo-footer">
          <p>Create your own professional invoices at <span class="promo-link" :style="{ color: primaryColor }">scangoinvoice.com</span></p>
        </div>
      </footer>
    </main>
  </div>
</template>

<style scoped>
.invoice-sidebar-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 840px;
  background: var(--white-color, #fff);
  border-radius: 12px;
  box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.05));
  font-family: 'Poppins', sans-serif;
  color: #333;
  overflow: hidden;
  position: relative;
  max-width: 900px;
  margin: 0 auto;
}

.sidebar {
  padding: 2.5rem 1.8rem;
  display: flex;
  flex-direction: column;
  gap: 2.2rem;
  box-sizing: border-box;
}

.sidebar-logo {
  margin-bottom: 0.5rem;
}

.logo {
  max-height: 55px;
  max-width: 100%;
  object-fit: contain;
  display: block;
}

.company-name {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}

.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-label {
  font-size: 0.7em;
  font-weight: 700;
  letter-spacing: 1.2px;
  margin: 0;
  opacity: 0.85;
}

.status-badge {
  padding: 0.35rem 0.8rem;
  border-radius: 12px;
  font-size: 0.72em;
  font-weight: 600;
  text-transform: uppercase;
  display: inline-block;
  align-self: flex-start;
  letter-spacing: 0.5px;
}

.status-paid {
  background-color: #e2fbe8;
  color: #0d6820;
}
.status-pending {
  background-color: #fff9db;
  color: #8c6b00;
}
.status-overdue {
  background-color: #ffeef0;
  color: #b81d24;
}
.status-estimate {
  background-color: #e3f2fd;
  color: #0d47a1;
}

.info-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.82em;
}

.info-label {
  color: #666;
}

.client-name {
  font-size: 0.9em;
  margin: 0;
}

.client-detail {
  font-size: 0.8em;
  color: #555;
  margin: 0;
  line-height: 1.4;
}

.qr-wrapper {
  margin-top: 0.3rem;
}

.qr-img {
  max-width: 120px;
  width: 120px;
  height: 120px;
  display: block;
  border-radius: 6px;
  border: 1px solid #ddd;
  padding: 4px;
  background: white;
}

.payment-cta {
  font-size: 0.78em;
  font-weight: 600;
  margin: 0;
  cursor: pointer;
}

.main-content {
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 1.5rem;
  margin-bottom: 2rem;
}

.invoice-title-block h2 {
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.5px;
}

.sender-details p {
  margin: 0;
  line-height: 1.4;
}

.sender-name {
  font-size: 0.95em;
}

.sender-info {
  font-size: 0.82em;
  color: #555;
}

.items-section {
  flex-grow: 1;
  margin-bottom: 2rem;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85em;
}

.items-table th {
  padding: 0.9rem 1rem;
  font-weight: 600;
  font-size: 0.8em;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: left;
}

.items-table td {
  padding: 0.9rem 1rem;
  border-bottom: 1px solid #f0f0f0;
  color: #444;
}

.items-table tr:hover td {
  background-color: #fafafa;
}

.col-qty, .col-price, .col-total {
  text-align: right;
}

.items-table th.col-qty, .items-table th.col-price, .items-table th.col-total {
  text-align: right;
}

.main-footer-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.notes-and-totals {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
}

.notes-block {
  flex: 1;
}

.invoice-notes h3 {
  font-size: 0.95em;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.invoice-notes p {
  margin: 0;
  font-size: 0.82em;
  color: #666;
  line-height: 1.5;
}

.totals-block {
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.total-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85em;
  padding: 0 0.5rem;
}

.total-row.grand-total {
  padding: 0.8rem;
  border-radius: 6px;
  font-size: 1.15em;
  margin-top: 0.4rem;
}

.promo-footer {
  text-align: center;
  border-top: 1px solid #f0f0f0;
  padding-top: 1rem;
  font-size: 0.7em;
  color: #888;
}

.promo-link {
  text-decoration: none;
  font-weight: 600;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .invoice-sidebar-layout {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .sidebar {
    border-right: none !important;
    border-bottom: 2px solid #f0f0f0;
    padding: 2rem;
    gap: 1.5rem;
  }

  .main-content {
    padding: 2rem;
  }

  .main-header {
    flex-direction: column;
    gap: 1rem;
  }

  .sender-details {
    text-align: left;
  }

  .notes-and-totals {
    flex-direction: column-reverse;
  }

  .totals-block {
    width: 100%;
  }

  /* Table cards on mobile */
  .items-table thead {
    display: none;
  }

  .items-table tr {
    display: block;
    border-bottom: 2px solid #eee;
    padding: 0.8rem 0;
    margin-bottom: 1rem;
  }

  .items-table td {
    display: flex;
    justify-content: space-between;
    padding: 0.4rem 0;
    border-bottom: none;
  }

  .items-table td::before {
    content: attr(data-label);
    font-weight: 700;
  }

  .col-qty, .col-price, .col-total {
    text-align: right;
  }
}
</style>
