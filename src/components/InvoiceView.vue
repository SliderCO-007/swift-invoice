<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { currentUser, userProfile } from '../composables/useAuth.js';
import useInvoices from '../composables/useInvoices';
import useUserSettings from '../composables/useUserSettings';
import InvoiceTemplate from './InvoiceTemplate.vue';

const route = useRoute();
const router = useRouter();
const { getInvoice, updateInvoiceStatus, loading, error } = useInvoices();
const { settings, fetchUserSettings } = useUserSettings();

const invoice = ref(null);
const invoicePaper = ref(null);
const isSendingEmail = ref(false);
const snackbar = ref(false);
const snackbarText = ref('');
const confirmDialog = ref(false);

const functions = getFunctions();

onMounted(async () => {
  const invoiceId = route.params.id;
  try {
    invoice.value = await getInvoice(invoiceId);
    await fetchUserSettings();
  } catch (err) {
    error.value = `Failed to load invoice: ${err.message}`;
    console.error(err);
  }
});

const isOwner = computed(() => {
  if (!invoice.value || !currentUser.value) return false;
  return invoice.value.userId === currentUser.value.uid;
});

const isFreePlan = computed(() => userProfile.value?.subscriptionStatus === 'free');

const goBack = () => router.push('/dashboard');
const goToPricing = () => router.push('/pricing');

const markAsPaid = async () => {
  if (!invoice.value) return;
  try {
    await updateInvoiceStatus(invoice.value.id, 'Paid');
    invoice.value.status = 'Paid'; // Immediately update local state
    snackbarText.value = 'Invoice marked as Paid';
    snackbar.value = true;
  } catch (err) {
    snackbarText.value = 'Error updating invoice status.';
    snackbar.value = true;
  }
  confirmDialog.value = false;
};

// Reusable PDF generation function
const generatePDF = async (outputType = 'save') => {
  const templateEl = invoicePaper.value?.$el;
  if (!templateEl) return null;

  // Clone the element to avoid side effects
  const clone = templateEl.cloneNode(true);
  const pdfContainer = document.createElement('div');
  pdfContainer.style.position = 'fixed';
  pdfContainer.style.left = '-9999px';
  pdfContainer.style.top = '0';
  pdfContainer.style.width = '816px'; 
  pdfContainer.style.backgroundColor = 'white';
  pdfContainer.appendChild(clone);
  document.body.appendChild(pdfContainer);

  let pdfOutput = null;

  try {
    // Wait for web fonts to load before rendering the canvas
    await document.fonts.ready;
    
    const canvas = await html2canvas(clone, { scale: 4, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasAspectRatio = canvas.height / canvas.width;
    let imgWidth = pdfWidth - 40; // Margin
    let imgHeight = imgWidth * canvasAspectRatio;

    if (imgHeight > pdfHeight - 40) {
        imgHeight = pdfHeight - 40;
        imgWidth = imgHeight / canvasAspectRatio;
    }

    const x = (pdfWidth - imgWidth) / 2;
    const y = 20;

    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight, undefined, 'FAST');

    if (outputType === 'save') {
      pdf.save(`Invoice-${invoice.value?.invoiceNumber || invoice.value?.id}.pdf`);
    } else if (outputType === 'datauristring') {
      pdfOutput = pdf.output('datauristring');
    }
  } finally {
    document.body.removeChild(pdfContainer);
  }

  return pdfOutput;
};

const downloadPDF = () => {
  generatePDF('save');
};

const sendInvoiceEmail = async () => {
  if (!invoice.value || isSendingEmail.value || isFreePlan.value) return;

  isSendingEmail.value = true;
  snackbarText.value = 'Generating PDF and sending email...';
  snackbar.value = true;

  try {
    const pdfDataUri = await generatePDF('datauristring');
    if (!pdfDataUri) {
      throw new Error("Failed to generate PDF for email.");
    }

    const pdfBase64 = pdfDataUri.substring(pdfDataUri.indexOf(',') + 1);
    
    const companyName = settings.value?.company?.name || 'Your Company';
    const clientName = invoice.value.client?.name || 'Valued Client';

    const emailBody = `
      <p><b>Invoice from ${companyName}</b></p>
      <p>Dear ${clientName},</p>
      <p>Thank you for your business! Your invoice #${invoice.value.invoiceNumber} is attached to this email.</p>
      <p>Please review the attached PDF for payment details, including available payment options.</p>
      <br>
      <p><i>This is an automated email. Please do not reply.</i></p>
    `;

    const sendEmailFunction = httpsCallable(functions, 'sendInvoiceEmail');
    const result = await sendEmailFunction({
      invoiceId: invoice.value.id,
      recipientEmail: invoice.value.client?.email,
      subject: `Invoice #${invoice.value.invoiceNumber} from ${companyName}`,
      message: emailBody, 
      pdfBase64: pdfBase64,
    });

    snackbarText.value = result.data.message;
  } catch (error) {
    console.error('Error sending email:', error);
    snackbarText.value = `Error: ${error.message}`;
  } finally {
    isSendingEmail.value = false;
    snackbar.value = true;
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
    <div v-else-if="error" class="error-container">
      <v-alert type="error" dense outlined>{{ error }}</v-alert>
    </div>
    <div v-else-if="safeInvoice">
      <header class="invoice-view-header">
        <div class="header-left">
          <v-btn v-if="isOwner" @click="goBack" text class="back-btn" prepend-icon="mdi-arrow-left">
            Dashboard
          </v-btn>
          <h1 class="invoice-title">Invoice #{{ safeInvoice.invoiceNumber }}</h1>
        </div>
        <!-- Actions for Invoice Owner -->
        <div v-if="isOwner" class="actions">
            <v-btn
                v-if="isFreePlan"
                @click="goToPricing"
                color="secondary"
                large
                class="mr-4"
                prepend-icon="mdi-arrow-up-bold-circle"
            >
                Upgrade to Send Emails
            </v-btn>
             <v-btn
              v-if="safeInvoice.status !== 'Paid'"
              @click="confirmDialog = true"
              color="green"
              large
              class="mr-4"
              prepend-icon="mdi-check-circle"
            >
              Mark as Paid
            </v-btn>
            <v-btn 
                @click="downloadPDF" 
                outlined color="primary"
                large
                class="mr-4"
                prepend-icon="mdi-download"
            >
                Download PDF
            </v-btn>
            <v-btn
                @click="sendInvoiceEmail"
                :loading="isSendingEmail"
                :disabled="isFreePlan"
                color="primary"
                large
                prepend-icon="mdi-email"
            >
                Send Email
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

    <v-snackbar v-model="snackbar" :timeout="4000" color="primary" location="top right">
      {{ snackbarText }}
    </v-snackbar>

     <v-dialog v-model="confirmDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Confirm</v-card-title>
        <v-card-text>Are you sure you want to mark this invoice as paid?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="confirmDialog = false">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="markAsPaid">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
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
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: flex-end;
  flex-grow: 1;
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
@media (max-width: 960px) {
  .invoice-view-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
  }
  .actions {
    justify-content: flex-start;
  }
}
</style>
