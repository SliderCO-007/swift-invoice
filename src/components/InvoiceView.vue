<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../composables/useFirebase.js'
import { currentUser, userProfile } from '../composables/useAuth.js'
import useInvoices from '../composables/useInvoices'
import useUserSettings from '../composables/useUserSettings'
import InvoiceTemplate from './InvoiceTemplate.vue'
import InvoiceTemplate2 from './InvoiceTemplate2.vue'
import InvoiceTemplate3 from './InvoiceTemplate3.vue'
import InvoiceTemplate4 from './InvoiceTemplate4.vue'

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
const confirmPendingDialog = ref(false)
const isLoading = ref(true)
const emailError = ref(null)

onMounted(async () => {
  const invoiceId = route.params.id
  try {
    invoice.value = await getInvoice(invoiceId)
    if (invoice.value) {
      await fetchUserSettings()
    }
  } catch (err) {
    console.error('Error in InvoiceView onMounted:', err)
  } finally {
    isLoading.value = false
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
    await updateInvoiceStatus(invoice.value.id, 'paid')
    invoice.value.status = 'paid'
    snackbarText.value = 'Invoice marked as Paid'
    snackbar.value = true
  } catch (err) {
    snackbarText.value = 'Error updating invoice status.'
    snackbar.value = true
  }
  confirmDialog.value = false
}

const markAsPending = async () => {
  if (!invoice.value) return
  try {
    await updateInvoiceStatus(invoice.value.id, 'pending')
    invoice.value.status = 'pending'
    snackbarText.value = 'Invoice marked as Pending'
    snackbar.value = true
  } catch (err) {
    snackbarText.value = 'Error updating invoice status.'
    snackbar.value = true
  }
  confirmPendingDialog.value = false
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
  const invoiceComponent = invoicePaper.value
  if (!invoiceComponent || !invoiceComponent.$el) {
    console.error('Invoice template element not found.')
    snackbarText.value = 'Error: Could not find invoice content to generate PDF.'
    snackbar.value = true
    return null
  }

  const originalEl = invoiceComponent.$el
  let pdfOutput = null

  const iframe = document.createElement('iframe')
  iframe.style.position = 'absolute'
  iframe.style.left = '-9999px'
  iframe.style.top = '0'
  iframe.style.width = '1024px'

  document.body.appendChild(iframe)

  try {
    const iframeDoc = iframe.contentWindow.document

    const stylesheets = Array.from(document.styleSheets)
    stylesheets.forEach((sheet) => {
      try {
        if (sheet.href) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = sheet.href
          iframeDoc.head.appendChild(link)
        } else if (sheet.cssRules) {
          const style = document.createElement('style')
          style.textContent = Array.from(sheet.cssRules)
            .map((rule) => rule.cssText)
            .join('\n')
          iframeDoc.head.appendChild(style)
        }
      } catch (e) {
        console.warn('Could not load stylesheet into iframe:', e)
      }
    })

    const clone = originalEl.cloneNode(true)
    iframeDoc.body.style.margin = '0'
    iframeDoc.body.style.backgroundColor = 'white'
    iframeDoc.body.appendChild(clone)

    await new Promise((resolve) => {
      const linkElements = iframeDoc.head.querySelectorAll('link')
      if (linkElements.length === 0) {
        resolve()
        return
      }
      let loadedCount = 0
      const totalLinks = linkElements.length
      linkElements.forEach((link) => {
        link.onload = link.onerror = () => {
          loadedCount++
          if (loadedCount === totalLinks) resolve()
        }
      })
    })

    await document.fonts.ready
    await new Promise((resolve) => setTimeout(resolve, 500))

    const contentElement = iframeDoc.body.firstElementChild
    const contentRect = contentElement.getBoundingClientRect()
    const contentHeight = contentRect.height
    const heightBuffer = 150
    iframe.style.height = `${contentHeight + heightBuffer}px`

    const canvas = await html2canvas(contentElement, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff',
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const margin = 40
    const imgWidth = pdfWidth - margin
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    let qrRect = null
    let qrUrl = null
    const qrCodeEl = iframeDoc.querySelector('.qr-section img, .payment-qr-code img')
    const qrAnchorEl = iframeDoc.querySelector('.qr-section a, .payment-qr-code a')
    
    if (qrCodeEl && qrAnchorEl && qrAnchorEl.href) {
      qrRect = qrCodeEl.getBoundingClientRect()
      qrUrl = qrAnchorEl.href
    }
    const scaleFactor = imgWidth / contentRect.width

    let heightLeft = imgHeight
    let position = 0
    let pageNumber = 1

    const addQrLinkIfOnPage = (currentPos) => {
      if (!qrRect || !qrUrl) return
      const qrPdfYTotal = (qrRect.top - contentRect.top) * scaleFactor
      const qrPdfX = margin / 2 + (qrRect.left - contentRect.left) * scaleFactor
      const qrPdfW = qrRect.width * scaleFactor
      const qrPdfH = qrRect.height * scaleFactor
      
      const qrPageY = qrPdfYTotal + currentPos
      
      if (qrPageY + qrPdfH > 0 && qrPageY < pdfHeight) {
        pdf.setPage(pageNumber)
        pdf.link(qrPdfX, qrPageY, qrPdfW, qrPdfH, { url: qrUrl })
      }
    }

    pdf.addImage(
      imgData,
      'PNG',
      margin / 2,
      position,
      imgWidth,
      imgHeight,
      undefined,
      'FAST'
    )
    addQrLinkIfOnPage(position)
    heightLeft -= pdfHeight

    while (heightLeft > 0) {
      position -= pdfHeight
      pageNumber++
      pdf.addPage()
      pdf.addImage(
        imgData,
        'PNG',
        margin / 2,
        position,
        imgWidth,
        imgHeight,
        undefined,
        'FAST'
      )
      addQrLinkIfOnPage(position)
      heightLeft -= pdfHeight
    }

    if (outputType === 'save') {
      pdf.save(`Invoice-${invoice.value?.invoiceNumber || invoice.value?.id}.pdf`)
    } else if (outputType === 'datauristring') {
      pdfOutput = pdf.output('datauristring')
    }
  } catch (err) {
    console.error('Error during PDF generation with iframe:', err)
    snackbarText.value = 'An error occurred while generating the PDF.'
    snackbar.value = true
  } finally {
    document.body.removeChild(iframe)
  }

  return pdfOutput
}

const downloadPDF = () => {
  generatePDF('save')
}

const sendInvoiceEmail = async () => {
  if (!invoice.value || isSendingEmail.value) return

  isSendingEmail.value = true
  emailError.value = null // Reset on new attempt
  snackbarText.value = 'Generating PDF and sending email...'
  snackbar.value = true

  try {
    if (isFreePlan.value) {
      throw { code: 'permission-denied', message: 'Subscription required.' }
    }

    const pdfDataUri = await generatePDF('datauristring')
    if (!pdfDataUri) {
      throw new Error('Failed to generate PDF for email.')
    }

    const pdfBase64 = pdfDataUri.substring(pdfDataUri.indexOf(',') + 1)

    const companyName = settings.value?.company?.name || 'Your Company'
    const clientName = invoice.value.client?.name || 'Valued Client'

    const emailBody = `
      <div style="font-family: 'Inter', Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background-color: #111d2f; color: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #1e293b;">
        <h1 style="color: #60a5fa; margin-bottom: 24px;">Invoice from ${companyName}</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #e2e8f0;">
          Dear ${clientName},
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: #e2e8f0;">
          Thank you for your business! Your invoice #${invoice.value.invoiceNumber} is attached to this email.
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: #e2e8f0;">
          Please review the attached PDF for payment details, including available payment options.
        </p>
        <hr style="border: none; border-top: 1px solid #334155; margin: 40px 0;">
        <p style="font-size: 14px; color: #94a3b8; text-align: center; margin: 0;">
          <i>This is an automated email. Please do not reply.</i><br>
          — ${companyName}
        </p>
      </div>
    `

    const sendEmailFunction = httpsCallable(functions, 'sendInvoiceEmail')
    const result = await sendEmailFunction({
      invoiceId: invoice.value.id,
      recipientEmail: invoice.value.client?.email,
      subject: `Invoice #${invoice.value.invoiceNumber} from ${companyName}`,
      message: emailBody,
      pdfBase64: pdfBase64,
    })

    if (result.data.success === false) {
      throw new Error(result.data.message || 'The email could not be sent.')
    }

    snackbarText.value = result.data.message
  } catch (error) {
    console.error('Error sending email:', error)

    if (
      error.code === 'permission-denied' ||
      (error.message && error.message.toLowerCase().includes('subscription'))
    ) {
      emailError.value = 'A paid subscription is required to send emails.'
      snackbarText.value = 'Subscription Required'
    } else {
      emailError.value = `Failed to send email: ${error.message}`
      snackbarText.value = 'Error sending email.'
    }
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

  let status = invoice.value.status || ''
  status = status.charAt(0).toUpperCase() + status.slice(1)

  return {
    ...invoice.value,
    subtotal,
    taxAmount,
    total,
    status,
  }
})
</script>

<template>
  <div class="invoice-view-container">
    <div v-if="isLoading" class="loading-container">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <p>Loading invoice...</p>
    </div>
    <div v-else-if="error" class="error-container">
      <v-alert type="error" dense outlined>{{ error }}</v-alert>
    </div>
    <div v-else-if="safeInvoice">
      <header class="invoice-view-header">
        <div class="header-top-row">
          <v-btn
            v-if="isOwner"
            @click="goBack"
            class="back-btn"
            prepend-icon="mdi-arrow-left"
            color="white"
            variant="elevated"
          >
            Dashboard
          </v-btn>
        </div>

        <div class="header-title-row">
          <h1 class="invoice-title">Invoice #{{ safeInvoice.invoiceNumber }}</h1>
        </div>

        <div v-if="isOwner" class="header-controls-row">
          <div class="style-selector-container">
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
            <label class="style-option">
              <input
                type="radio"
                value="solid"
                v-model="invoice.style"
                @change="updateStyle"
              />
              <span>Solid</span>
            </label>
          </div>

          <div class="actions">
            <v-btn
              v-if="safeInvoice.status === 'Estimate'"
              @click="confirmPendingDialog = true"
              color="orange"
              large
              class="mr-4"
              prepend-icon="mdi-file-check"
            >
              Mark as Pending
            </v-btn>
            <v-btn
              v-if="safeInvoice.status === 'Pending'"
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

            <template v-if="isFreePlan">
              <v-tooltip
                location="top"
                :text="
                  isFreePlan ? 'Upgrade to a paid plan to send invoices via email.' : ''
                "
              >
                <template v-slot:activator="{ props }">
                  <div v-bind="props">
                    <v-btn
                      :disabled="isFreePlan"
                      color="primary"
                      large
                      prepend-icon="mdi-email"
                    >
                      Send Email
                    </v-btn>
                  </div>
                </template>
              </v-tooltip>
            </template>
            <template v-else>
              <v-btn
                @click="sendInvoiceEmail"
                :loading="isSendingEmail"
                color="primary"
                large
                prepend-icon="mdi-email"
              >
                Send Email
              </v-btn>
            </template>
          </div>
        </div>
      </header>

      <div v-if="emailError" class="email-error-notification">
        <v-alert
          type="error"
          elevation="2"
          closable
          @click:close="emailError = null"
          :icon="false"
        >
          {{ emailError }}
          <v-btn @click="goToPricing" color="secondary" class="ml-4">Upgrade Plan</v-btn>
        </v-alert>
      </div>

      <div v-if="safeInvoice.status === 'Paid'" class="paid-watermark">
        <h2>PAID</h2>
      </div>

      <InvoiceTemplate
        v-if="safeInvoice.style === 'classic' || !safeInvoice.style"
        ref="invoicePaper"
        :invoice="safeInvoice"
        :settings="settings"
        :userProfile="userProfile"
      />
      <InvoiceTemplate2
        v-else-if="safeInvoice.style === 'modern'"
        ref="invoicePaper"
        :invoice="safeInvoice"
        :settings="settings"
        :userProfile="userProfile"
      />
      <InvoiceTemplate3
        v-else-if="safeInvoice.style === 'corporate'"
        ref="invoicePaper"
        :invoice="safeInvoice"
        :settings="settings"
        :userProfile="userProfile"
      />
      <InvoiceTemplate4
        v-else-if="safeInvoice.style === 'solid'"
        ref="invoicePaper"
        :invoice="safeInvoice"
        :settings="settings"
        :userProfile="userProfile"
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

    <v-dialog v-model="confirmPendingDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Confirm</v-card-title>
        <v-card-text
          >Are you sure you want to convert this estimate to a pending invoice?</v-card-text
        >
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="confirmPendingDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="blue darken-1" text @click="markAsPending">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.invoice-view-container {
  padding: 2rem;
  background-color: #111d2f;
  min-height: 100vh;
  position: relative;
  color: #f1f5f9;
}

.invoice-view-header {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.header-top-row {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.header-title-row {
  width: 100%;
}

.header-controls-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.invoice-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #fff;
  word-break: break-word;
  overflow-wrap: break-word;
}

.back-btn {
  text-transform: none;
  font-weight: 600;
  color: #1e293b !important;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: flex-end;
  flex-grow: 1;
}

.email-error-notification {
  width: 100%;
  margin-bottom: 2rem;
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
  flex-wrap: wrap;
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

@media (max-width: 960px) {
  .header-controls-row {
    flex-direction: column;
    align-items: stretch;
  }
  .actions {
    justify-content: flex-start;
  }
}
</style>
