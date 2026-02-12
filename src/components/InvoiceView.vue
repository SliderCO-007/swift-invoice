<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';
import { getStorage, ref as storageRef, uploadBytes } from "firebase/storage";
import useInvoices from '../composables/useInvoices';
import useUserSettings from '../composables/useUserSettings';
import useStripe from '../composables/useStripe';
import InvoiceTemplate from './InvoiceTemplate.vue';
import StripeCheckout from './StripeCheckout.vue';

const route = useRoute();
const router = useRouter();
const { getInvoice, loading, error } = useInvoices();
const { settings, fetchUserSettings } = useUserSettings();
const { createPaymentIntent, error: stripeError } = useStripe();

const invoice = ref(null);
const invoicePaper = ref(null);
const isPaying = ref(false);
const isSendingEmail = ref(false);
const snackbar = ref(false);
const snackbarText = ref('');
const isCheckoutVisible = ref(false);
const clientSecret = ref(null);

const storage = getStorage();

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
    const result = await createPaymentIntent(invoice.value.id);
    if (result && result.clientSecret) {
      clientSecret.value = result.clientSecret;
      isCheckoutVisible.value = true;
    } else {
      throw new Error('Could not initiate payment. Please try again.');
    }
  } catch (err) {
    console.error("Payment initiation failed:", err);
    snackbarText.value = err.message;
    snackbar.value = true;
  } finally {
    isPaying.value = false;
  }
};

const onPaymentSuccess = () => {
  isCheckoutVisible.value = false;
  snackbarText.value = 'Service fee paid successfully!';
  snackbar.value = true;
  if(invoice.value) {
      invoice.value.svcFeePaid = true;
  }
};

const onPaymentError = (errorMsg) => {
  isCheckoutVisible.value = false;
  snackbarText.value = `Payment failed: ${errorMsg}`;
  snackbar.value = true;
};

const generateAndUploadPDF = async () => {
  if (!invoice.value) throw new Error("Invoice data is not available.");
  const templateEl = invoicePaper.value?.$el;
  if (!templateEl) throw new Error("Invoice template is not rendered.");

  const clone = templateEl.cloneNode(true);
  const pdfContainer = document.createElement('div');
  pdfContainer.style.position = 'fixed';
  pdfContainer.style.left = '-9999px';
  pdfContainer.style.top = '0';
  pdfContainer.style.width = '816px';
  pdfContainer.style.backgroundColor = 'white';
  pdfContainer.appendChild(clone);
  document.body.appendChild(pdfContainer);

  let pdfBlob;
  try {
    const canvas = await html2canvas(clone, { scale: 4, useCORS: true });
    pdfBlob = await new Promise(resolve => {
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
        resolve(pdf.output('blob'));
    });
  } finally {
    document.body.removeChild(pdfContainer);
  }

  if (!pdfBlob) throw new Error("Failed to generate PDF blob.");

  const pdfRef = storageRef(storage, `invoice_pdfs/${invoice.value.id}.pdf`);
  await uploadBytes(pdfRef, pdfBlob);
};

const sendInvoiceEmail = async () => {
  if (!invoice.value || isSendingEmail.value) return;

  isSendingEmail.value = true;
  snackbarText.value = 'Generating PDF and preparing email...';
  snackbar.value = true;

  try {
    const companyName = settings.value?.company?.name;
    if (!invoice.value.client?.email || !invoice.value.client?.name || !companyName) {
      throw new Error('Client details or company name are missing.');
    }

    await generateAndUploadPDF();

    await axios.post('https://us-central1-swift-invoice-9124f.cloudfunctions.net/sendInvoiceEmail', {
      invoiceId: invoice.value.id,
      clientEmail: invoice.value.client.email,
      clientName: invoice.value.client.name,
      companyName: companyName,
    });

    snackbarText.value = 'Invoice sent successfully!';
  } catch (error) {
    console.error('Error sending email:', error);
    snackbarText.value = `Error: ${error.response?.data || error.message}`;
  } finally {
    isSendingEmail.value = false;
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

const paymentReturnUrl = computed(() => `${window.location.origin}/invoice/${invoice.value?.id}`);

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
          <v-btn @click="goBack" text class="back-btn" prepend-icon="mdi-arrow-left">
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
            prepend-icon="mdi-credit-card"
          >
            Pay Service Fee
          </v-btn>
          <div v-else class="d-flex">
            <v-btn 
              @click="downloadPDF" 
              outlined color="primary"
              large
              prepend-icon="mdi-download"
            >
              Download PDF
            </v-btn>
             <v-btn
              @click="sendInvoiceEmail"
              :loading="isSendingEmail"
              color="primary"
              large
              class="ml-4"
              prepend-icon="mdi-email"
            >
              Send Email
            </v-btn>
          </div>
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

    <v-dialog v-model="isCheckoutVisible" max-width="500px">
      <StripeCheckout 
        v-if="clientSecret"
        :client-secret="clientSecret" 
        :return-url="paymentReturnUrl"
        @payment-success="onPaymentSuccess"
        @payment-error="onPaymentError"
        @close-dialog="isCheckoutVisible = false"
      />
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
