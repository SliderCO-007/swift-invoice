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
  invoice.value = await getInvoice(invoiceId);
});

const goBack = () => {
  router.push('/dashboard');
};

const handleMarkAsPaid = async () => {
  if (!invoice.value || invoice.value.status === 'Paid') return;
  await markAsPaid(invoice.value.id);
  invoice.value = await getInvoice(invoice.value.id);
};

const downloadPDF = async () => {
  // Access the DOM element of the InvoiceTemplate component
  const templateEl = invoicePaper.value?.$el;
  if (!templateEl) {
    console.error("Invoice template element not found for PDF generation.");
    return;
  }

  try {
    const canvas = await html2canvas(templateEl, { 
      scale: 2, // Higher scale for better quality
      useCORS: true, // Needed for external images like the logo
    });
    
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasAspectRatio = canvas.height / canvas.width;
    
    let imgWidth = pdfWidth - 40; // 20pt padding on each side
    let imgHeight = imgWidth * canvasAspectRatio;

    // If image is too tall for the page, scale it down and adjust width proportionally
    if (imgHeight > pdfHeight - 40) {
        imgHeight = pdfHeight - 40; // 20pt padding top/bottom
        imgWidth = imgHeight / canvasAspectRatio;
    }

    const x = (pdfWidth - imgWidth) / 2; // Center horizontally
    const y = 20; // Top margin

    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight, undefined, 'FAST');
    pdf.save(`Invoice-${safeInvoice.value.invoiceNumber}.pdf`);

  } catch (err) {
    console.error("Error generating PDF:", err);
  }
};

const safeInvoice = computed(() => {
  if (!invoice.value) return null;

  const items = (invoice.value.items || []).map(item => ({
    ...item,
    description: item.description || 'No description',
    quantity: Number(item.quantity) || 0,
    price: Number(item.price) || 0,
  }));

  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.price, 0);
  const taxRate = Number(invoice.value.taxRate) || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  // Convert Firestore Timestamps to JS Date objects
  const issueDate = invoice.value.issueDate?.toDate ? invoice.value.issueDate.toDate() : new Date(invoice.value.issueDate);
  const dueDate = invoice.value.dueDate?.toDate ? invoice.value.dueDate.toDate() : new Date(invoice.value.dueDate);

  return {
    ...invoice.value,
    id: invoice.value.id || 'N/A',
    invoiceNumber: invoice.value.invoiceNumber || invoice.value.id?.substring(0, 6) || 'N/A',
    status: invoice.value.status || 'pending',
    sender: invoice.value.sender || { name: 'N/A', email: '' },
    client: invoice.value.client || { name: 'N/A', email: '' },
    items: items,
    taxRate: taxRate,
    notes: invoice.value.notes || '',
    subtotal: subtotal,
    taxAmount: taxAmount,
    total: total,
    issueDate: issueDate,
    dueDate: dueDate,
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

      <!-- The InvoiceTemplate is now the single source of truth for presentation -->
      <InvoiceTemplate ref="invoicePaper" :invoice="safeInvoice" />

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