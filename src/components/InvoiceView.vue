<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { currentUser, userProfile } from '../composables/useAuth.js'
import useInvoices from '../composables/useInvoices'
import useUserSettings from '../composables/useUserSettings'
import InvoiceTemplate from './InvoiceTemplate.vue'
import InvoiceTemplate2 from './InvoiceTemplate2.vue'
import InvoiceTemplate3 from './InvoiceTemplate3.vue'

const route = useRoute()
const router = useRouter()
const { getInvoice, updateInvoiceStatus, updateInvoice, loading, error } = useInvoices()
const { settings, fetchUserSettings } = useUserSettings()

const invoice = ref(null)
const invoicePaper = ref(null)
const isSendingEmail = ref(false)
const snackbar = ref(false)
const snackbarText = ref('')
const confirmDialog = ref(false)

const functions = getFunctions()

onMounted(async () => {
  const invoiceId = route.params.id
  try {
    invoice.value = await getInvoice(invoiceId)
    await fetchUserSettings()
  } catch (err) {
    error.value = `Failed to load invoice: ${err.message}`
    console.error(err)
  }
})

const isOwner = computed(() => {
  if (!invoice.value || !currentUser.value) return false
  return invoice.value.userId === currentUser.value.uid
})

const isFreePlan = computed(() => userProfile.value?.subscriptionStatus === 'free')

const goBack = () => router.push('/dashboard')
const goToPricing = () => router.push('/pricing')

const markAsPaid = async () => {
  if (!invoice.value) return
  try {
    await updateInvoiceStatus(invoice.value.id, 'Paid')
    invoice.value.status = 'Paid' // Immediately update local state
    snackbarText.value = 'Invoice marked as Paid'
    snackbar.value = true
  } catch (err) {
    snackbarText.value = 'Error updating invoice status.'
    snackbar.value = true
  }
  confirmDialog.value = false
}

const updateStyle = async () => {
  if (!invoice.value) return
  try {
    await updateInvoice(invoice.value.id, { style: invoice.value.style })
    snackbarText.value = `Style changed to ${invoice.value.style}`
    snackbar.value = true
  } catch (err) {
    snackbarText.value = 'Error updating invoice style.'
    snackbar.value = true
  }
}

const generatePDF = async (outputType = 'save') => {
  const invoiceComponent = invoicePaper.value;
  if (!invoiceComponent || !invoiceComponent.$el) {
    console.error("Invoice template element not found.");
    snackbarText.value = "Error: Could not find invoice content to generate PDF.";
    snackbar.value = true;
    return null;
  }

  const originalEl = invoiceComponent.$el;
  let pdfOutput = null;

  // 1. Create a hidden iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.left = '-9999px';
  iframe.style.top = '0';
  iframe.style.width = '1024px'; // Force a desktop-like viewport width
  iframe.style.height = '768px'; // A reasonable height

  document.body.appendChild(iframe);

  try {
    const iframeDoc = iframe.contentWindow.document;

    // 2. Clone stylesheets into the iframe
    const stylesheets = Array.from(document.styleSheets);
    stylesheets.forEach(sheet => {
      try {
        if (sheet.href) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = sheet.href;
          iframeDoc.head.appendChild(link);
        } else if (sheet.cssRules) {
          const style = document.createElement('style');
          style.textContent = Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
          iframeDoc.head.appendChild(style);
        }
      } catch (e) {
        console.warn('Could not load stylesheet into iframe:', e);
      }
    });

    // 3. Clone the invoice element into the iframe
    const clone = originalEl.cloneNode(true);
    iframeDoc.body.style.margin = '0'; // Reset body margin
    iframeDoc.body.style.backgroundColor = 'white';
    iframeDoc.body.appendChild(clone);

    // 4. Wait for everything to render correctly
    await new Promise(resolve => {
        const linkElements = iframeDoc.head.querySelectorAll('link');
        if (linkElements.length === 0) {
            resolve();
            return;
        }
        let loadedCount = 0;
        const totalLinks = linkElements.length;
        linkElements.forEach(link => {
            link.onload = () => {
                loadedCount++;
                if (loadedCount === totalLinks) {
                    resolve();
                }
            };
            link.onerror = () => {
                loadedCount++;
                console.warn('Stylesheet failed to load in iframe:', link.href);
                if (loadedCount === totalLinks) {
                    resolve();
                }
            };
        });
    });

    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 500)); // Extra delay for rendering


    // 5. Generate the canvas from the iframe's content
    const canvas = await html2canvas(iframeDoc.body, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: iframeDoc.body.scrollWidth,
      height: iframeDoc.body.scrollHeight,
      windowWidth: iframeDoc.documentElement.scrollWidth,
      windowHeight: iframeDoc.documentElement.scrollHeight,
    });

    // 6. Create and format the PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - 40; // 20pt margin
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight, undefined, 'FAST');

    // 7. Handle output
    if (outputType === 'save') {
      pdf.save(`Invoice-${invoice.value?.invoiceNumber || invoice.value?.id}.pdf`);
    } else if (outputType === 'datauristring') {
      pdfOutput = pdf.output('datauristring');
    }

  } catch (err) {
    console.error("Error during PDF generation with iframe:", err);
    snackbarText.value = "An error occurred while generating the PDF.";
    snackbar.value = true;
  } finally {
    // 8. Cleanup
    document.body.removeChild(iframe);
  }

  return pdfOutput;
};


const downloadPDF = () => {
  generatePDF('save')
}

const sendInvoiceEmail = async () => {
  if (!invoice.value || isSendingEmail.value || isFreePlan.value) return

  isSendingEmail.value = true
  snackbarText.value = 'Generating PDF and sending email...'
  snackbar.value = true

  try {
    const pdfDataUri = await generatePDF('datauristring')
    if (!pdfDataUri) {
      throw new Error('Failed to generate PDF for email.')
    }

    const pdfBase64 = pdfDataUri.substring(pdfDataUri.indexOf(',') + 1)

    const companyName = settings.value?.company?.name || 'Your Company'
    const clientName = invoice.value.client?.name || 'Valued Client'

    const emailBody = `
      <p><b>Invoice from ${companyName}</b></p>
      <p>Dear ${clientName},</p>
      <p>Thank you for your business! Your invoice #${invoice.value.invoiceNumber} is attached to this email.</p>
      <p>Please review the attached PDF for payment details, including available payment options.</p>
      <br>
      <p><i>This is an automated email. Please do not reply.</i></p>
    `

    const sendEmailFunction = httpsCallable(functions, 'sendInvoiceEmail')
    const result = await sendEmailFunction({
      invoiceId: invoice.value.id,
      recipientEmail: invoice.value.client?.email,
      subject: `Invoice #${invoice.value.invoiceNumber} from ${companyName}`,
      message: emailBody,
      pdfBase64: pdfBase64,
    })

    snackbarText.value = result.data.message
  } catch (error) {
    console.error('Error sending email:', error)
    snackbarText.value = `Error: ${error.message}`
  } finally {
    isSendingEmail.value = false
    snackbar.value = true
  }
}

const safeInvoice = computed(() => {
  if (!invoice.value) return null

  const subtotal = (invoice.value.items || []).reduce(
    (acc, item) => acc + (item.quantity || 0) * (item.price || 0),
    0
  )
  const taxRate = Number(invoice.value.taxRate) || 0
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount

  return {
    ...invoice.value,
    subtotal,
    taxAmount,
    total,
  }
})
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
          <v-btn
            v-if="isOwner"
            @click="goBack"
            text
            class="back-btn"
            prepend-icon="mdi-arrow-left"
          >
            Dashboard
          </v-btn>
          <h1 class="invoice-title">Invoice #{{ safeInvoice.invoiceNumber }}</h1>
        </div>

        <!-- Style Selector -->
        <div v-if="isOwner" class="style-selector-container">
          <label class="style-option">
            <input
              type="radio"
              value="classic"
              v-model="invoice.style"
              @change="updateStyle"
            />
            <span>Classic</span>
          </label>
          <label class="style-option">
            <input
              type="radio"
              value="modern"
              v-model="invoice.style"
              @change="updateStyle"
            />
            <span>Modern</span>
          </label>
          <label class="style-option">
            <input
              type="radio"
              value="corporate"
              v-model="invoice.style"
              @change="updateStyle"
            />
            <span>Corporate</span>
          </label>
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
            outlined
            color="primary"
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

      <InvoiceTemplate
        v-if="safeInvoice.style === 'classic' || !safeInvoice.style"
        ref="invoicePaper"
        :invoice="safeInvoice"
        :settings="settings"
      />
      <InvoiceTemplate2
        v-else-if="safeInvoice.style === 'modern'"
        ref="invoicePaper"
        :invoice="safeInvoice"
        :settings="settings"
      />
      <InvoiceTemplate3
        v-else-if="safeInvoice.style === 'corporate'"
        ref="invoicePaper"
        :invoice="safeInvoice"
        :settings="settings"
      />
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
  background-color: var(--background-color, #f4f7f9);
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

.loading-container,
.error-container {
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

.style-selector-container {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.style-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
}

.style-option input[type='radio'] {
  cursor: pointer;
  width: 16px;
  height: 16px;
  accent-color: var(--primary-color, #4f46e5);
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
