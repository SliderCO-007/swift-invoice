<script setup>
// Demo payment page — static mock data, no Firebase or Stripe calls.
// Used as a scannable demo for the features page QR code.
const invoice = {
  companyName: 'Acme Landscaping Co.',
  invoiceNumber: 'INV-0042',
  clientName: 'Jordan Williams',
  totalAmount: 875.00,
  currency: 'USD',
  status: 'pending',
  dueDate: 'May 15, 2026',
};

const formattedTotal = '$875.00';
</script>

<template>
  <div class="payment-container">
    <div class="demo-ribbon">
      <span>✦ Demo Preview ✦</span>
    </div>

    <div class="payment-card">
      <div class="company-header">
        <h2>{{ invoice.companyName }}</h2>
        <p class="header-sub">Secure Payment Portal</p>
      </div>

      <div class="invoice-summary">
        <h3>Invoice #{{ invoice.invoiceNumber }}</h3>
        <p class="client-name">Billed to: {{ invoice.clientName }}</p>

        <div class="amount-display">
          <span class="currency-symbol">$</span>
          <span class="amount-value">875.00</span>
          <span class="currency-code">USD</span>
        </div>

        <div class="details-grid">
          <div class="detail-item">
            <span class="label">Status</span>
            <span class="value status-badge pending">PENDING</span>
          </div>
          <div class="detail-item">
            <span class="label">Due Date</span>
            <span class="value">{{ invoice.dueDate }}</span>
          </div>
        </div>
      </div>

      <div class="action-section">
        <div class="pay-action">
          <v-btn
            color="#635bff"
            size="x-large"
            block
            class="pay-btn"
            @click="() => {}"
          >
            Pay {{ formattedTotal }}
          </v-btn>
          <div class="method-icons">
            <v-icon size="28" class="method-icon">mdi-credit-card-outline</v-icon>
            <v-icon size="28" class="method-icon">mdi-apple</v-icon>
            <v-icon size="28" class="method-icon">mdi-google</v-icon>
            <v-icon size="28" class="method-icon">mdi-bank-outline</v-icon>
          </div>
          <div class="secure-badge">
            <v-icon size="small" class="mr-1">mdi-lock</v-icon>
            Payments are securely processed
          </div>
        </div>
      </div>

      <div class="demo-footer">
        <p>This is a demo — no payment will be charged.</p>
        <router-link to="/" class="cta-link">Create your own invoices with ScanGo →</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.payment-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  padding: 2rem;
  font-family: 'Inter', sans-serif;
  position: relative;
}

.demo-ribbon {
  position: fixed;
  top: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(90deg, #4ade80, #06b6d4);
  color: #0f172a;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 0.35rem 1.25rem;
  border-radius: 50px;
  z-index: 100;
  white-space: nowrap;
  box-shadow: 0 4px 15px rgba(74, 222, 128, 0.35);
}

.payment-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  width: 100%;
  max-width: 460px;
  overflow: hidden;
}

.company-header {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: white;
  padding: 2rem;
  text-align: center;
}

.company-header h2 {
  margin: 0 0 0.25rem;
  font-size: 1.35rem;
  font-weight: 700;
}

.header-sub {
  margin: 0;
  font-size: 0.8rem;
  color: #94a3b8;
  letter-spacing: 0.05em;
}

.invoice-summary {
  padding: 2rem;
  text-align: center;
  border-bottom: 1px solid #e2e8f0;
}

.invoice-summary h3 {
  margin: 0;
  color: #334155;
  font-size: 1.1rem;
  font-weight: 600;
}

.client-name {
  color: #64748b;
  margin-top: 0.4rem;
  font-size: 0.9rem;
}

.amount-display {
  margin: 1.75rem 0;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.25rem;
  color: #0f172a;
}

.amount-value {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1;
}

.currency-symbol {
  font-size: 1.5rem;
  font-weight: 600;
  position: relative;
  top: -1rem;
}

.currency-code {
  font-size: 1rem;
  font-weight: 600;
  color: #64748b;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  text-align: left;
  background: #f8fafc;
  padding: 1rem;
  border-radius: 10px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
  font-weight: 600;
}

.value {
  font-weight: 600;
  color: #334155;
  font-size: 0.95rem;
}

.status-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 50px;
  font-size: 0.7rem;
  font-weight: 700;
  width: fit-content;
}

.status-badge.pending {
  background: #fef9c3;
  color: #854d0e;
}

.action-section {
  padding: 2rem;
  text-align: center;
}

.pay-btn {
  text-transform: none;
  font-weight: 700;
  letter-spacing: 0;
  font-size: 1.1rem;
  border-radius: 10px !important;
}

.method-icons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 0.75rem;
}

.method-icon {
  color: #94a3b8;
}

.secure-badge {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 0.8rem;
}

.demo-footer {
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  padding: 1.25rem 2rem;
  text-align: center;
}

.demo-footer p {
  margin: 0 0 0.5rem;
  font-size: 0.8rem;
  color: #94a3b8;
}

.cta-link {
  font-size: 0.875rem;
  font-weight: 600;
  color: #635bff;
  text-decoration: none;
}

.cta-link:hover {
  text-decoration: underline;
}
</style>
