<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import useStripeConnect from '../composables/useStripeConnect';
import { format } from 'date-fns';

const route = useRoute();
const { getInvoiceForPayment, createPaymentSession, loading: stripeLoading } = useStripeConnect();

const invoiceId = route.params.invoiceId;
const invoice = ref(null);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const data = await getInvoiceForPayment(invoiceId);
    if (!data) {
      error.value = "Invoice not found or unavailable.";
    } else {
      invoice.value = data;
    }
  } catch (err) {
    error.value = err.message || "Failed to load invoice.";
  } finally {
    loading.value = false;
  }
});

const formattedTotal = computed(() => {
  if (!invoice.value) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: invoice.value.currency || 'USD',
  }).format(invoice.value.totalAmount);
});

const formattedDueDate = computed(() => {
  if (!invoice.value || !invoice.value.dueDate) return '';
  
  let dateObj;
  const dueDate = invoice.value.dueDate;
  
  // Handle Firestore Timestamp object (if returned raw from functions)
  if (dueDate._seconds !== undefined) {
    dateObj = new Date(dueDate._seconds * 1000);
  } else if (dueDate.seconds !== undefined) {
    dateObj = new Date(dueDate.seconds * 1000);
  } else {
    dateObj = new Date(dueDate);
  }
  
  // Prevent Invalid time value error
  if (isNaN(dateObj.getTime())) return 'Invalid Date';
  
  return format(dateObj, 'MMM dd, yyyy');
});

const handlePay = async () => {
  await createPaymentSession(invoiceId);
};
</script>

<template>
  <div class="payment-container">
    <div v-if="loading" class="loading-state">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p>Loading invoice details...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <v-icon color="error" size="64" class="mb-4">mdi-alert-circle-outline</v-icon>
      <h2>Oops!</h2>
      <p>{{ error }}</p>
    </div>
    
    <div v-else-if="invoice" class="payment-card">
      <div class="company-header">
        <h2>{{ invoice.companyName }}</h2>
      </div>
      
      <div class="invoice-summary">
        <h3>Invoice #{{ invoice.invoiceNumber }}</h3>
        <p class="client-name">Billed to: {{ invoice.clientName }}</p>
        
        <div class="amount-display">
          <span class="currency-symbol">{{ formattedTotal.charAt(0) }}</span>
          <span class="amount-value">{{ formattedTotal.substring(1) }}</span>
          <span class="currency-code">{{ invoice.currency.toUpperCase() }}</span>
        </div>
        
        <div class="details-grid">
          <div class="detail-item">
            <span class="label">Status</span>
            <span class="value status-badge" :class="invoice.status.toLowerCase()">
              {{ invoice.status.toUpperCase() }}
            </span>
          </div>
          <div class="detail-item" v-if="invoice.dueDate">
            <span class="label">Due Date</span>
            <span class="value">{{ formattedDueDate }}</span>
          </div>
        </div>
      </div>
      
      <div class="action-section">
        <div v-if="invoice.status.toLowerCase() === 'paid'" class="paid-message">
          <v-icon color="success" size="48">mdi-check-circle</v-icon>
          <h3>Payment Complete</h3>
          <p>This invoice has already been paid in full.</p>
        </div>
        
        <div v-else-if="!invoice.hasStripeConnect" class="no-payment-message">
          <v-icon color="warning" size="48">mdi-information-outline</v-icon>
          <h3>Online Payment Unavailable</h3>
          <p>The merchant has not enabled online payments for this invoice.</p>
        </div>
        
        <div v-else class="pay-action">
          <v-btn 
            @click="handlePay" 
            :loading="stripeLoading" 
            color="#635bff" 
            size="x-large" 
            block
            class="pay-btn"
          >
            Pay {{ formattedTotal }}
          </v-btn>
          <div class="secure-badge">
            <v-icon size="small" class="mr-1">mdi-lock</v-icon>
            Payments are securely processed by Stripe
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.payment-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8fafc;
  padding: 2rem;
  font-family: 'Inter', sans-serif;
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: #64748b;
}

.payment-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 480px;
  overflow: hidden;
}

.company-header {
  background: #1e293b;
  color: white;
  padding: 2rem;
  text-align: center;
}

.company-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.invoice-summary {
  padding: 2rem;
  text-align: center;
  border-bottom: 1px solid #e2e8f0;
}

.invoice-summary h3 {
  margin: 0;
  color: #334155;
  font-size: 1.25rem;
}

.client-name {
  color: #64748b;
  margin-top: 0.5rem;
  font-size: 0.95rem;
}

.amount-display {
  margin: 2rem 0;
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
  border-radius: 8px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  font-weight: 600;
}

.value {
  font-weight: 500;
  color: #334155;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-align: center;
  background: #f1f5f9;
  color: #64748b;
}

.status-badge.paid {
  background: #dcfce7;
  color: #166534;
}

.status-badge.pending, .status-badge.sent {
  background: #fef9c3;
  color: #854d0e;
}

.action-section {
  padding: 2rem;
  text-align: center;
}

.pay-btn {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0;
  font-size: 1.1rem;
  border-radius: 8px;
}

.secure-badge {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 0.85rem;
}

.paid-message, .no-payment-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #334155;
}

.paid-message h3, .no-payment-message h3 {
  margin: 0;
  font-size: 1.2rem;
}

.paid-message p, .no-payment-message p {
  margin: 0;
  color: #64748b;
  font-size: 0.95rem;
}
</style>
