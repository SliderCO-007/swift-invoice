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
})

const subtotal = computed(() => props.invoice.subtotal || 0)
const taxAmount = computed(() => props.invoice.taxAmount || 0)
const total = computed(() => props.invoice.total || 0)

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
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    value || 0
  )
}
</script>

<template>
  <div class="invoice-corporate" v-if="invoice && settings">
    <!-- Header with Blue Banner -->
    <div class="header-banner">
      <div class="header-content">
        <div class="header-left">
          <img
            v-if="settings?.company?.logoUrl"
            :src="settings.company.logoUrl"
            alt="Company Logo"
            class="logo"
          />
          <div v-else class="company-info">
            <h1>{{ invoice.sender.name }}</h1>
          </div>
        </div>
        <div class="header-right">
          <p class="label">INVOICE</p>
          <p class="large-text">#{{ invoice.invoiceNumber }}</p>
        </div>
      </div>
    </div>

    <!-- Status Badge -->
    <div class="status-bar">
      <span :class="['status-badge', `status-${invoice.status.toLowerCase()}`]">
        Status: {{ invoice.status }}
      </span>
    </div>

    <!-- Dates and Party Information -->
    <div class="content-wrapper">
      <div class="top-section">
        <div class="party-section from">
          <h2>FROM</h2>
          <p class="party-name">{{ invoice.sender.name }}</p>
          <p class="party-info">{{ formatAddress(invoice.sender) }}</p>
          <p class="party-info">{{ invoice.sender.email }}</p>
        </div>

        <div class="party-section to">
          <h2>BILL TO</h2>
          <p class="party-name">{{ invoice.client.name }}</p>
          <p class="party-info">{{ formatAddress(invoice.client) }}</p>
          <p class="party-info">{{ invoice.client.email }}</p>
        </div>

        <div class="dates-section">
          <div class="date-item">
            <p class="date-label">INVOICE DATE</p>
            <p class="date-value">{{ formatDate(invoice.issueDate) }}</p>
          </div>
          <div class="date-item">
            <p class="date-label">DUE DATE</p>
            <p class="date-value">{{ formatDate(invoice.dueDate) }}</p>
          </div>
        </div>
      </div>

      <!-- Items Table -->
      <table class="items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th class="col-qty">Qty</th>
            <th class="col-price">Unit Price</th>
            <th class="col-total">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in invoice.items" :key="index">
            <td>{{ item.description }}</td>
            <td class="col-qty">{{ item.quantity }}</td>
            <td class="col-price">{{ formatCurrency(item.price) }}</td>
            <td class="col-total">{{ formatCurrency(item.quantity * item.price) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Summary Section -->
      <div class="summary-container">
        <div class="notes-section">
          <div v-if="invoice.notes" class="notes">
            <h3>NOTES</h3>
            <p>{{ invoice.notes }}</p>
          </div>
          <div
            v-if="invoice.includeVenmoQr && settings?.company?.venmoQrUrl"
            class="qr-section"
          >
            <h3>PAYMENT QR CODE</h3>
            <img :src="settings.company.venmoQrUrl" alt="Venmo QR Code" class="qr-code" />
          </div>
        </div>

        <div class="totals-section">
          <div class="total-row">
            <span>Subtotal</span>
            <span>{{ formatCurrency(subtotal) }}</span>
          </div>
          <div v-if="invoice.taxRate > 0" class="total-row">
            <span>Tax ({{ invoice.taxRate }}%)</span>
            <span>{{ formatCurrency(taxAmount) }}</span>
          </div>
          <div class="total-row final-total">
            <span>TOTAL DUE</span>
            <span>{{ formatCurrency(total) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer-section">
      <p class="footer-text">Thank you for your business.</p>
      <p class="footer-small">Prepared by {{ invoice.sender.name }} | swiftinvoice.biz</p>
    </div>
  </div>
</template>

<style scoped>
.invoice-corporate {
  background: #ffffff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
  max-width: 900px;
  margin: 0 auto;
}

/* Header Banner */
.header-banner {
  background: linear-gradient(135deg, #1a3a52 0%, #2c5aa0 100%);
  color: white;
  padding: 2.5rem;
  border-bottom: 4px solid #1a3a52;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  max-width: 1000px;
}

.header-left {
  flex: 1;
}

.logo {
  max-height: 80px;
  max-width: 220px;
  margin-bottom: 1rem;
  filter: brightness(0) invert(1);
}

.company-info h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.header-right {
  text-align: right;
}

.label {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  opacity: 0.9;
  letter-spacing: 1px;
}

.large-text {
  margin: 0.5rem 0 0 0;
  font-size: 1.6rem;
  font-weight: 700;
}

/* Status Bar */
.status-bar {
  background: #f8f9fa;
  padding: 1rem 2.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
}

.status-badge {
  padding: 0.5rem 1.2rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-paid {
  background-color: #d4edda;
  color: #155724;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-overdue {
  background-color: #f8d7da;
  color: #721c24;
}

/* Content Wrapper */
.content-wrapper {
  padding: 2.5rem;
  max-width: 1000px;
}

/* Top Section */
.top-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #e9ecef;
}

.party-section,
.dates-section {
  display: flex;
  flex-direction: column;
}

.party-section h2,
.dates-section h2 {
  margin: 0 0 0.8rem 0;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #1a3a52;
  letter-spacing: 1px;
}

.party-name {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #2c3e50;
}

.party-info {
  margin: 0.3rem 0;
  font-size: 0.9rem;
  color: #555;
  line-height: 1.6;
}

.dates-section {
  text-align: right;
}

.date-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.date-item:last-child {
  margin-bottom: 0;
}

.date-label {
  margin: 0 0 0.3rem 0;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #1a3a52;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.date-value {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

/* Items Table */
.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
  background: white;
}

.items-table thead tr {
  background-color: #f0f4f8;
  border-bottom: 2px solid #1a3a52;
}

.items-table th {
  padding: 1rem;
  text-align: left;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #1a3a52;
  letter-spacing: 0.5px;
}

.items-table td {
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  font-size: 0.95rem;
  color: #333;
}

.col-qty,
.col-price,
.col-total {
  text-align: right;
}

.items-table th.col-qty,
.items-table th.col-price,
.items-table th.col-total {
  text-align: right;
}

.items-table tbody tr:last-child td {
  border-bottom: none;
}

/* Summary Container */
.summary-container {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 2rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e9ecef;
}

.notes-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.notes h3,
.qr-section h3 {
  margin: 0 0 0.8rem 0;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #1a3a52;
  letter-spacing: 0.5px;
}

.notes p {
  margin: 0;
  font-size: 0.9rem;
  color: #555;
  line-height: 1.6;
}

.qr-section {
  text-align: center;
}

.qr-code {
  max-width: 130px;
  border: 2px solid #e9ecef;
  padding: 0.5rem;
  background: #fafbfc;
}

/* Totals Section */
.totals-section {
  padding: 1.5rem;
  background-color: #f0f4f8;
  border: 2px solid #1a3a52;
  border-radius: 4px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: 0.7rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 1px solid #d4dce6;
}

.total-row:last-child {
  border-bottom: none;
}

.final-total {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1a3a52;
  padding-top: 1rem;
  margin-top: 0.5rem;
  border-top: 2px solid #1a3a52;
}

/* Footer */
.footer-section {
  text-align: center;
  padding: 2rem;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.footer-text {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 600;
}

.footer-small {
  margin: 0;
  font-size: 0.75rem;
  color: #999;
}

@media (max-width: 768px) {
  .header-banner {
    padding: 1.5rem;
  }

  .header-content {
    flex-direction: column;
  }

  .header-right {
    text-align: left;
  }

  .content-wrapper {
    padding: 1.5rem;
  }

  .top-section {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
  }

  .dates-section {
    text-align: left;
  }

  .summary-container {
    grid-template-columns: 1fr;
  }

  .items-table {
    font-size: 0.85rem;
    border: none;
  }

  .items-table thead {
    display: none;
  }

  .items-table tr {
    display: block;
    margin-bottom: 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1rem;
    background-color: #fafafa;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .items-table td {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid #eee;
    text-align: right;
  }

  .items-table td:last-child {
    border-bottom: none;
    font-weight: bold;
  }

  .items-table td::before {
    content: attr(data-label);
    font-weight: 600;
    text-align: left;
    margin-right: 1rem;
    color: #555;
  }

  .items-table .col-description {
    justify-content: flex-start;
    text-align: left;
    font-size: 1rem;
    font-weight: bold;
    color: #1a1a1a;
    padding-bottom: 0.75rem;
  }

  .items-table .col-description::before {
    display: none;
  }

  .items-table .col-qty::before {
    content: 'Qty';
  }

  .items-table .col-price::before {
    content: 'Unit Price';
  }

  .items-table .col-total::before {
    content: 'Total';
  }
}
</style>
