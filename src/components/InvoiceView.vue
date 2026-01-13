<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import useInvoices from '../composables/useInvoices';
import InvoiceTemplate from './InvoiceTemplate.vue';

const route = useRoute();
const router = useRouter();
const { getInvoice, markAsPaid, loading, error } = useInvoices();

const invoice = ref(null);
const invoicePaper = ref(null);

onMounted(async () => {
  const invoiceId = route.params.id;
  try {
    // The getInvoice function now returns clean, reliable data.
    invoice.value = await getInvoice(invoiceId);
  } catch (err) {
    console.error(`Failed to load invoice ${invoiceId}:`, err.message);
  }
});

const goBack = () => {
  router.push('/dashboard');
};

const handleMarkAsPaid = async () => {
  if (!invoice.value || invoice.value.status === 'Paid') return;
  await markAsPaid(invoice.value.id);
  invoice.value = await getInvoice(invoice.value.id); // Refresh data
};

const downloadPDF = async () => {
  const templateEl = invoicePaper.value?.$el;
  if (!templateEl) {
    console.error("Invoice template element not found for PDF generation.");
    return;
  }

  try {
    const canvas = await html2canvas(templateEl, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasAspectRatio = canvas.height / canvas.width;
    
    let imgWidth = pdfWidth - 40; // Padding
    let imgHeight = imgWidth * canvasAspectRatio;

    if (imgHeight > pdfHeight - 40) {
        imgHeight = pdfHeight - 40;
        imgWidth = imgHeight / canvasAspectRatio;
    }

    const x = (pdfWidth - imgWidth) / 2;
    const y = 20;

    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight, undefined, 'FAST');
    pdf.save(`Invoice-${invoice.value?.invoiceNumber || 'details'}.pdf`);

  } catch (err) {
    console.error("Error generating PDF:", err);
  }
};

// The computed is now dramatically simplified, as it no longer needs to clean up the data.
const safeInvoice = computed(() => {
  if (!invoice.value) return null;

  // Basic calculations can remain, but data massaging is gone.
  const subtotal = (invoice.value.items || []).reduce((acc, item) => acc + (item.quantity || 0) * (item.price || 0), 0);
  const taxRate = Number(invoice.value.taxRate) || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  return {
    ...invoice.value,
    subtotal, // Add calculated fields
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
    <div v-else-if="error" class="error-container">
      <v-alert type="error" dense outlined>{{ error }}</v-alert>
    </div>
    <div v-else-if="safeInvoice">
      <header class="invoice-view-header">
        <v-btn @click="goBack" text class="back-btn">
          <v-icon left>mdi-arrow-left</v-icon>
          Back to Dashboard
        </v-btn>
        <div class="actions">
          <v-btn @click="downloadPDF" outlined color="primary">
            <v-icon left>mdi-download</v-icon>
            Download PDF
          </v-btn>
          <v-btn 
            @click="handleMarkAsPaid"
            :disabled="safeInvoice.status === 'Paid'"
            color="primary"
            class="ml-4"
          >
            <v-icon left>mdi-check-circle</v-icon>
            {{ safeInvoice.status === 'Paid' ? 'Paid' : 'Mark as Paid' }}
          </v-btn>
        </div>
      </header>

      <!-- The InvoiceTemplate now receives the clean invoice data directly -->
      <InvoiceTemplate ref="invoicePaper" :invoice="safeInvoice" />

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
}

.invoice-view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.back-btn {
  text-transform: none;
  font-weight: 600;
}

.actions {
  display: flex;
}

.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  gap: 1rem;
  font-size: 1.2rem;
  color: var(--text-color);
}

.error-container {
    padding: 3rem;
    text-align: center;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .invoice-view-container {
    padding: 1rem;
  }
  .invoice-view-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
  }
  .actions {
    flex-direction: column;
    gap: 1rem;
  }
  .actions .v-btn {
      margin-left: 0 !important;
  }
}
</style>