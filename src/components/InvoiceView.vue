<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import useInvoices from '../composables/useInvoices';
import useUserSettings from '../composables/useUserSettings';
import useStripe from '../composables/useStripe';
import InvoiceTemplate from './InvoiceTemplate.vue';

const route = useRoute();
const router = useRouter();
const { getInvoice, loading, error } = useInvoices();
const { settings, fetchUserSettings } = useUserSettings();
const { redirectToCheckout, error: stripeError } = useStripe();

const invoice = ref(null);
const invoicePaper = ref(null);
const isPaying = ref(false);

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
};

onMounted(async () => {
  const invoiceId = route.params.id;
  try {
    invoice.value = await getInvoice(invoiceId);
    await fetchUserSettings();
  } catch (err) {
    console.error(`Failed to load invoice ${invoiceId}:`, err.message);
  }
});

const goBack = () => {
  router.push('/dashboard');
};

const handlePayment = async () => {
    if (!invoice.value || isPaying.value) return;
    isPaying.value = true;
    try {
        // We pass a special flag to the backend to indicate a service fee payment
        await redirectToCheckout(invoice.value.id, true);
    } catch (err) {
        console.error("Stripe checkout failed:", err);
    } finally {
        isPaying.value = false;
    }
};

const downloadPDF = async () => {
  const templateEl = invoicePaper.value?.$el;
  if (!templateEl) return;

  const clone = templateEl.cloneNode(true);
  const pdfContainer = document.createElement('div');
  pdfContainer.style.position = 'fixed';
  pdfContainer.style.left = '-9999px';
  pdfContainer.style.top = '0';
  pdfContainer.style.width = '816px';
  pdfContainer.style.backgroundColor = 'white';
  pdfContainer.appendChild(clone);
  document.body.appendChild(pdfContainer);

  try {
    const canvas = await html2canvas(clone, { scale: 4, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasAspectRatio = canvas.height / canvas.width;
    let imgWidth = pdfWidth - 40;
    let imgHeight = imgWidth * canvasAspectRatio;
    if (imgHeight > pdfHeight - 40) {
        imgHeight = pdfHeight - 40;
        imgWidth = imgHeight / canvasAspectRatio;
    }
    const x = (pdfWidth - imgWidth) / 2;
    const y = 20;
    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight, undefined, 'FAST');
    pdf.save(`Invoice-${invoice.value?.invoiceNumber || invoice.value?.id}.pdf`);
  } finally {
    document.body.removeChild(pdfContainer);
  }
};

const safeInvoice = computed(() => {
  if (!invoice.value) return null;

  const subtotal = (invoice.value.items || []).reduce((acc, item) => acc + (item.quantity || 0) * (item.price || 0), 0);
  const taxRate = Number(invoice.value.taxRate) || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  return {
    ...invoice.value,
    subtotal,
    taxAmount,
    total
  };
});

</script>

<template>
  <div class="invoice-view-container">
    <div v-if="loading && !invoice" class="loading-container">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <p>Loading invoice...</p>
    </div>
    <div v-else-if="error || stripeError" class="error-container">
      <v-alert type="error" dense outlined>{{ error || stripeError }}</v-alert>
    </div>
    <div v-else-if="safeInvoice">
      <header class="invoice-view-header">
        <div class="header-left">
          <v-btn @click="goBack" text class="back-btn">
            <v-icon left>mdi-arrow-left</v-icon>
            Back to Dashboard
          </v-btn>
          <h1 class="invoice-title">Invoice #{{ safeInvoice.invoiceNumber }}</h1>
        </div>
        <div class="actions">
          <v-btn 
            v-if="!safeInvoice.svcFeePaid"
            @click="handlePayment"
            :loading="isPaying"
            color="success"
            large
          >
            <v-icon left>mdi-credit-card</v-icon>
            Pay Service Fee
          </v-btn>
          <v-btn 
            v-else
            @click="downloadPDF" 
            outlined color="primary"
            large
          >
            <v-icon left>mdi-download</v-icon>
            Download PDF
          </v-btn>
        </div>
      </header>

      <div v-if="safeInvoice.status === 'Paid'" class="paid-watermark">
        <h2>PAID</h2>
      </div>

      <InvoiceTemplate ref="invoicePaper" :invoice="safeInvoice" :settings="settings" />

    </div>
     <div v-else class="error-container">
      <v-alert type="warning" dense outlined>
        Invoice not found. It might have been deleted or there was an issue retrieving it.
      </v-alert>
    </div>
  </div>
</template>

<style scoped>
.invoice-view-container {
  padding: 2rem;
  background-color: var(--background-color, #F4F7F9);
  min-height: 100vh;
  position: relative;
}

.invoice-view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.invoice-title {
  font-size: 1.75rem;
  font-weight: 600;
}

.back-btn {
  text-transform: none;
  font-weight: 600;
}

.actions {
  display: flex;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  gap: 1rem;
}

.paid-watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-15deg);
  text-align: center;
  color: rgba(40, 167, 69, 0.1);
  z-index: 10;
  pointer-events: none;
}
.paid-watermark h2 {
  font-size: 8rem;
  font-weight: 900;
}


/* Responsive Styles */
@media (max-width: 768px) {
  .invoice-view-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
  }
  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
