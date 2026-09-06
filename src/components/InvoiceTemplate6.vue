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
  return isValid(d) ? format(d, 'yyyy.MM.dd') : 'N/A' // Tech format: YYYY.MM.DD
}

const formatAddress = (address) => {
  if (!address) return ''
  const parts = [
    address.address1,
    address.address2,
    `${address.city}, ${address.state} ${address.zip}`,
  ]
  return parts.filter(Boolean).join(' // ')
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
  <div class="invoice-tech-layout" v-if="invoice && settings">
    <!-- Top Grid Header -->
    <header class="tech-header" :style="{ borderBottom: `2px double ${primaryColor}` }">
      <div class="header-left">
        <div class="tech-logo-container">
          <img
            v-if="settings?.company?.logoUrl"
            :src="settings.company.logoUrl"
            alt="Company Logo"
            class="tech-logo"
          />
          <h1 v-else class="tech-company-name" :style="{ color: primaryColor }">{{ invoice.sender.name }}</h1>
          <p v-if="!settings?.company?.logoUrl || settings?.company?.logoUrl === '/Logo.png'" class="logo-upload-hint no-print" data-html2canvas-ignore="true">
            * Upload custom logo in <router-link to="/settings">Settings</router-link>
          </p>
        </div>
        <div class="tech-sys-status" :style="{ color: `rgba(${primaryRgb}, 0.7)` }">
          <span>[ STATUS ]   : {{ invoice.status.toUpperCase() }}</span>
        </div>
      </div>

      <div class="header-right">
        <table class="meta-grid-table" :style="{ borderColor: primaryColor }">
          <tbody>
            <tr>
              <td class="meta-grid-label" :style="{ backgroundColor: `rgba(${primaryRgb}, 0.05)`, color: primaryColor, borderColor: primaryColor }">INVOICE ID</td>
              <td class="meta-grid-val font-mono" :style="{ borderColor: primaryColor }">#{{ invoice.invoiceNumber }}</td>
            </tr>
            <tr>
              <td class="meta-grid-label" :style="{ backgroundColor: `rgba(${primaryRgb}, 0.05)`, color: primaryColor, borderColor: primaryColor }">DATE_ISSUED</td>
              <td class="meta-grid-val font-mono" :style="{ borderColor: primaryColor }">{{ formatDate(invoice.issueDate) }}</td>
            </tr>
            <tr>
              <td class="meta-grid-label" :style="{ backgroundColor: `rgba(${primaryRgb}, 0.05)`, color: primaryColor, borderColor: primaryColor }">DATE_LIMIT</td>
              <td class="meta-grid-val font-mono" :style="{ borderColor: primaryColor }">{{ formatDate(invoice.dueDate) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </header>

    <!-- Mid Section - Sender & Client details -->
    <section class="tech-parties-section">
      <div class="tech-box sender-box" :style="{ borderColor: `rgba(${primaryRgb}, 0.25)` }">
        <div class="box-tag" :style="{ color: primaryColor, backgroundColor: `rgba(${primaryRgb}, 0.05)` }">// SENDER_ENTITY</div>
        <div class="box-content">
          <p class="entity-name font-weight-bold">{{ invoice.sender.name }}</p>
          <p class="entity-detail">{{ formatAddress(invoice.sender) }}</p>
          <p class="entity-detail">{{ invoice.sender.email }}</p>
        </div>
      </div>

      <div class="tech-box client-box" :style="{ borderColor: `rgba(${primaryRgb}, 0.25)` }">
        <div class="box-tag" :style="{ color: primaryColor, backgroundColor: `rgba(${primaryRgb}, 0.05)` }">// CLIENT_ENTITY</div>
        <div class="box-content">
          <p class="entity-name font-weight-bold">{{ invoice.client.name }}</p>
          <p class="entity-detail">{{ formatAddress(invoice.client) }}</p>
          <p class="entity-detail">{{ invoice.client.email }}</p>
        </div>
      </div>
    </section>



    <!-- Items Section -->
    <section class="tech-items-section">
      <table class="tech-items-table" :style="{ borderColor: `rgba(${primaryRgb}, 0.2)` }">
        <thead>
          <tr :style="{ backgroundColor: primaryColor, color: '#fff' }">
            <th class="col-desc">ITEM_DESCRIPTION</th>
            <th class="col-qty text-center">QTY</th>
            <th class="col-price text-right">UNIT_VAL</th>
            <th class="col-total text-right">NET_VAL</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in invoice.items" :key="index" :style="{ borderBottom: `1px solid rgba(${primaryRgb}, 0.1)` }">
            <td class="col-desc">
              {{ item.description }}
              <span v-if="invoice.taxRate > 0 && item.taxable === false" style="font-size: 0.7rem; opacity: 0.65; margin-left: 0.25rem; border: 1px solid rgba(128,128,128,0.3); padding: 1px 4px; border-radius: 3px; font-weight: normal; display: inline-block; vertical-align: middle;">No Tax</span>
            </td>
            <td class="col-qty text-center font-mono">{{ item.quantity }}</td>
            <td class="col-price text-right font-mono">{{ formatCurrency(item.price) }}</td>
            <td class="col-total text-right font-mono font-weight-bold">{{ formatCurrency(item.quantity * item.price) }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Bottom Section - Notes, Pay, Totals -->
    <section class="tech-bottom-section">
      <div class="tech-bottom-left">
        <div v-if="invoice.notes" class="tech-box notes-box" :style="{ borderColor: `rgba(${primaryRgb}, 0.2)` }">
          <div class="box-tag" :style="{ color: primaryColor, backgroundColor: `rgba(${primaryRgb}, 0.05)` }">// SYSTEM_NOTES</div>
          <div class="box-content notes-text">{{ invoice.notes }}</div>
        </div>

        <div
          v-if="userProfile?.chargesEnabled && paymentQrImageUrl"
          class="tech-payment-box payment-qr-code"
          :style="{ borderColor: `rgba(${primaryRgb}, 0.25)` }"
        >
          <a :href="paymentUrl" target="_blank" rel="noopener noreferrer" class="payment-link" style="text-decoration: none; color: inherit; display: block;">
            <div class="tech-payment-grid">
              <div class="qr-code-holder">
                <div style="position: relative; display: inline-block;">
                  <img :src="paymentQrImageUrl" alt="Pay via Stripe" class="tech-qr-img" crossorigin="anonymous" style="display: block;" />
                  <img v-if="userProfile?.chargesEnabled && settings?.company?.logoUrl" :src="settings.company.logoUrl" crossorigin="anonymous" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 28%; height: 28%; object-fit: contain; background: white; border-radius: 4px; padding: 2px;" />
                </div>
              </div>
              <div class="payment-instructions">
                <p class="instr-header" :style="{ color: primaryColor }">[ SECURE_PAYMENT_NODE ]</p>
                <p class="instr-body">Stripe secure transfer protocols initialized. Scan QR code or click image to finalize invoice transaction online.</p>
              </div>
            </div>
          </a>
        </div>
      </div>

      <div class="tech-bottom-right">
        <table class="tech-totals-table" :style="{ borderColor: `rgba(${primaryRgb}, 0.3)` }">
          <tbody>
            <tr>
              <td class="total-label">SUBTOTAL</td>
              <td class="total-val font-mono">{{ formatCurrency(subtotal) }}</td>
            </tr>
            <tr v-if="discountAmount > 0">
              <td class="total-label">DISCOUNT</td>
              <td class="total-val font-mono">-{{ formatCurrency(discountAmount) }}</td>
            </tr>
            <tr v-if="invoice.taxRate > 0">
              <td class="total-label">TAX ({{ invoice.taxRate }}%)</td>
              <td class="total-val font-mono">{{ formatCurrency(taxAmount) }}</td>
            </tr>
            <tr class="grand-total-row" :style="{ backgroundColor: primaryColor, color: '#fff' }">
              <td class="total-label font-weight-bold">TOTAL_DUE</td>
              <td class="total-val font-mono font-weight-bold">{{ formatCurrency(total) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Tech Footer -->
    <footer class="tech-footer" :style="{ borderTop: `1px dashed rgba(${primaryRgb}, 0.2)` }">
      <p>// SCAN_GO_INVOICE // NODE_URL: scangoinvoice.com // TRANSACTIONS ENCRYPTED SECURELY</p>
    </footer>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Space+Grotesk:wght@400;500;700&display=swap');

.invoice-tech-layout {
  padding: 3rem;
  background: var(--white-color, #fff);
  border-radius: 12px;
  box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.05));
  font-family: 'Space Grotesk', sans-serif;
  color: #1a1a24;
  max-width: 900px;
  margin: 0 auto;
  box-sizing: border-box;
}

.font-mono {
  font-family: 'Share Tech Mono', monospace !important;
}

.tech-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 2rem;
  margin-bottom: 2rem;
}

.tech-logo-container {
  margin-bottom: 0.8rem;
}

.tech-logo {
  max-height: 60px;
  max-width: 220px;
  object-fit: contain;
  display: block;
}

.tech-company-name {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -1px;
  line-height: 1.1;
  text-transform: uppercase;
}

.tech-sys-status {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.72em;
  letter-spacing: 0.5px;
}

.meta-grid-table {
  border-collapse: collapse;
  border: 1px solid;
}

.meta-grid-table td {
  padding: 0.5rem 1rem;
  font-size: 0.8em;
  border: 1px solid;
}

.meta-grid-label {
  font-weight: 700;
  letter-spacing: 0.5px;
}

.meta-grid-val {
  text-align: right;
  min-width: 120px;
}

.tech-parties-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.tech-box {
  border: 1px solid;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.box-tag {
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.7em;
  font-weight: 700;
  padding: 0.3rem 0.8rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.box-content {
  padding: 1rem;
  font-size: 0.82em;
  line-height: 1.5;
}

.entity-name {
  font-size: 1.1em;
  margin: 0 0 0.4rem 0;
}

.entity-detail {
  margin: 0;
  color: #555;
}

.tech-status-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid;
  border-bottom: 1px solid;
  padding: 0.4rem 1rem;
  margin-bottom: 2rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: block;
}

.status-text {
  font-size: 0.75em;
  font-weight: 700;
}

.deco-strip {
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.65em;
  overflow: hidden;
  white-space: nowrap;
  max-width: 60%;
}

.tech-items-section {
  margin-bottom: 2rem;
}

.tech-items-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85em;
}

.tech-items-table th {
  padding: 0.8rem 1rem;
  font-weight: 700;
  font-size: 0.8em;
  letter-spacing: 0.5px;
  text-align: left;
}

.tech-items-table th.text-center,
.tech-items-table td.text-center {
  text-align: center;
}

.tech-items-table th.text-right,
.tech-items-table td.text-right {
  text-align: right;
}

.tech-items-table tbody tr {
  break-inside: avoid;
  page-break-inside: avoid;
}

.tech-items-table td {
  padding: 1rem;
  color: #2c2c35;
}

.tech-bottom-section {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  break-inside: avoid;
  page-break-inside: avoid;
}

.tech-bottom-left {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.notes-text {
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.85em;
  color: #444;
}

.tech-payment-box {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  break-inside: avoid;
  page-break-inside: avoid;
}

.tech-payment-grid {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 1.2rem;
  align-items: center;
}

.tech-qr-img {
  width: 100px;
  height: 100px;
  border: 1px solid #ccc;
  padding: 3px;
  background: white;
  border-radius: 4px;
}

.payment-instructions {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.instr-header {
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.78em;
  font-weight: 700;
  margin: 0;
}

.instr-body {
  font-size: 0.72em;
  color: #555;
  margin: 0;
  line-height: 1.4;
}

.tech-totals-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid;
}

.tech-totals-table td {
  padding: 0.8rem 1rem;
  font-size: 0.82em;
  border-bottom: 1px solid #eee;
}

.total-label {
  font-weight: 700;
  color: #555;
}

.total-val {
  text-align: right;
}

.grand-total-row td {
  font-size: 1.1em;
  border-bottom: none;
}

.tech-footer {
  text-align: center;
  padding-top: 1.5rem;
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.65em;
  color: #777;
  letter-spacing: 0.5px;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .invoice-tech-layout {
    padding: 1.5rem;
  }

  .tech-header {
    flex-direction: column;
    gap: 1.5rem;
  }

  .tech-parties-section {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .tech-bottom-section {
    grid-template-columns: 1fr;
  }

  /* Table cards on mobile */
  .tech-items-table thead {
    display: none;
  }

  .tech-items-table tr {
    display: block;
    border-bottom: 2px solid #eee;
    padding: 0.8rem 0;
    margin-bottom: 1rem;
  }

  .tech-items-table td {
    display: flex;
    justify-content: space-between;
    padding: 0.4rem 0;
    border-bottom: none;
  }

  .tech-items-table td::before {
    content: attr(data-label);
    font-weight: 700;
  }

  .tech-items-table td.col-qty,
  .tech-items-table td.col-price,
  .tech-items-table td.col-total {
    text-align: right;
  }
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
