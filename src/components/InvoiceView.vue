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
import InvoiceTemplate5 from './InvoiceTemplate5.vue'
import InvoiceTemplate6 from './InvoiceTemplate6.vue'

const route = useRoute()
const router = useRouter()
const { getInvoice, updateInvoiceStatus, updateInvoice, sendInvoiceSms, getSmsLogs, loading, error } = useInvoices()
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

const smsModal = ref(false)
const smsPhone = ref('')
const isSendingSms = ref(false)
const smsLogs = ref([])
const smsConsentAttested = ref(false)

const openSmsModal = async () => {
  smsPhone.value = invoice.value?.client?.phone || ''
  smsConsentAttested.value = false
  smsModal.value = true
  if (invoice.value?.id) {
    smsLogs.value = await getSmsLogs(invoice.value.id)
  }
}

const sendSms = async () => {
  if (!invoice.value || isSendingSms.value) return
  if (!smsPhone.value) {
    snackbarText.value = 'Please provide a valid client phone number.'
    snackbar.value = true
    return
  }
  if (!smsConsentAttested.value) {
    snackbarText.value = 'You must confirm customer consent before sending SMS messages.'
    snackbar.value = true
    return
  }

  isSendingSms.value = true
  try {
    const res = await sendInvoiceSms(invoice.value.id, smsPhone.value)
    snackbarText.value = `Text-2-Pay SMS sent to ${res.phone}!`
    snackbar.value = true
    smsModal.value = false
    smsLogs.value = await getSmsLogs(invoice.value.id)
  } catch (err) {
    console.error('Failed to send SMS:', err)
    snackbarText.value = err.message || 'Failed to send Text-2-Pay SMS.'
    snackbar.value = true
  } finally {
    isSendingSms.value = false
  }
}

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

    // Injected print & layout normalization styles for clean PDF output
    const pdfNormStyles = iframeDoc.createElement('style')
    pdfNormStyles.textContent = `
      .invoice-paper, .invoice-corporate, .invoice-modern, .invoice-sidebar-layout, .tech-invoice-container, .solid-invoice-container {
        box-shadow: none !important;
        border-radius: 0 !important;
      }
      .pdf-page-break-spacer {
        display: block !important;
        width: 100% !important;
        clear: both !important;
        background: transparent !important;
        border: none !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      tr.pdf-page-break-spacer {
        display: table-row !important;
      }
      tr.pdf-page-break-spacer td {
        border: none !important;
        padding: 0 !important;
        margin: 0 !important;
        background: transparent !important;
      }
    `
    iframeDoc.head.appendChild(pdfNormStyles)

    const contentElement = iframeDoc.body.firstElementChild
    if (!contentElement) throw new Error('No content element found in iframe.')

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' })
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const margin = 40
    const imgWidth = pdfWidth - margin

    let contentRect = contentElement.getBoundingClientRect()
    let scaleFactor = imgWidth / contentRect.width
    let pageHeightPx = pdfHeight / scaleFactor

    // 1. Single-Page Tolerance Optimization:
    // If the invoice overflows 1 page by less than ~15%, apply a subtle compacting rule
    // so that an invoice with ~8 items fits on 1 single cohesive page rather than stranding a near-empty 2nd page.
    if (contentRect.height > pageHeightPx && contentRect.height <= pageHeightPx * 1.15) {
      const compactStyle = iframeDoc.createElement('style')
      compactStyle.id = 'pdf-compact-override'
      compactStyle.textContent = `
        .header-banner { padding: 1.6rem 2.5rem !important; }
        .status-bar { padding: 0.6rem 2.5rem !important; }
        .content-wrapper { padding: 1.6rem 2.5rem !important; }
        .top-section { margin-bottom: 1.4rem !important; }
        .items-table { margin-bottom: 1.4rem !important; }
        .items-table th, .items-table td { padding: 0.65rem 1rem !important; }
        .summary-container, .invoice-summary-and-notes, .summary-section, .notes-and-totals {
          margin-top: 1.2rem !important;
          padding-top: 1.2rem !important;
          gap: 1.2rem !important;
        }
        .payment-qr-code img, .qr-section img, .qr-code {
          max-width: 105px !important;
          max-height: 105px !important;
        }
        .footer-section, .promo-footer, .footer {
          margin-top: 1.2rem !important;
          padding-top: 1rem !important;
        }
      `
      iframeDoc.head.appendChild(compactStyle)
      contentRect = contentElement.getBoundingClientRect()
      scaleFactor = imgWidth / contentRect.width
      pageHeightPx = pdfHeight / scaleFactor

      // If it still overflows after compacting, remove compact styles and let multi-page pagination handle it cleanly
      if (contentRect.height > pageHeightPx) {
        compactStyle.remove()
        contentRect = contentElement.getBoundingClientRect()
        scaleFactor = imgWidth / contentRect.width
        pageHeightPx = pdfHeight / scaleFactor
      }
    }

    // 2. Multi-Page Pagination & Page-Break Avoidance:
    // Ensures table rows, the summary/totals container, and especially the QR code are NEVER split across pages.
    if (contentRect.height > pageHeightPx) {
      const pageTopMarginPx = 36 / scaleFactor // ~25pt top clearance on subsequent pages
      const pageBottomMarginPx = 36 / scaleFactor // ~25pt bottom clearance before page break
      const maxAllowedSectionHeight = pageHeightPx - pageTopMarginPx - pageBottomMarginPx

      const pushElementToNextPage = (el, targetTop) => {
        const elRect = el.getBoundingClientRect()
        const currentTop = elRect.top - contentElement.getBoundingClientRect().top
        const spacerHeight = Math.ceil(targetTop - currentTop)
        if (spacerHeight <= 0) return 0

        if (el.tagName === 'TR') {
          const spacerTr = iframeDoc.createElement('tr')
          spacerTr.className = 'pdf-page-break-spacer'
          const td = iframeDoc.createElement('td')
          td.colSpan = 100
          td.style.height = `${spacerHeight}px`
          td.style.padding = '0'
          td.style.margin = '0'
          td.style.border = 'none'
          td.style.background = 'transparent'
          spacerTr.appendChild(td)
          el.parentNode.insertBefore(spacerTr, el)
        } else {
          const spacerDiv = iframeDoc.createElement('div')
          spacerDiv.className = 'pdf-page-break-spacer'
          spacerDiv.style.height = `${spacerHeight}px`
          spacerDiv.style.width = '100%'
          spacerDiv.style.clear = 'both'
          spacerDiv.style.margin = '0'
          spacerDiv.style.padding = '0'
          spacerDiv.style.border = 'none'
          spacerDiv.style.background = 'transparent'
          el.parentNode.insertBefore(spacerDiv, el)
        }
        return spacerHeight
      }

      // Check table rows in tbody so individual rows are not cut horizontally
      const tableRows = Array.from(contentElement.querySelectorAll('.items-table tbody tr, table tbody tr'))
      for (const row of tableRows) {
        if (row.classList.contains('pdf-page-break-spacer')) continue
        const cTop = contentElement.getBoundingClientRect().top
        const rowRect = row.getBoundingClientRect()
        const rowTop = rowRect.top - cTop
        const rowBottom = rowRect.bottom - cTop
        const rowHeight = rowRect.height

        const pageIndex = Math.floor(rowTop / pageHeightPx) + 1
        const pageBreakY = pageIndex * pageHeightPx
        const pageCutoffY = pageBreakY - pageBottomMarginPx

        if ((rowTop < pageCutoffY && rowBottom > pageCutoffY) || (rowTop >= pageCutoffY && rowTop < pageBreakY)) {
          if (rowHeight <= maxAllowedSectionHeight) {
            const targetY = pageBreakY + pageTopMarginPx
            pushElementToNextPage(row, targetY)
          }
        }
      }

      // Check compound summary containers so Notes, QR Code, and Totals remain unified on the next page
      const summarySelectors = [
        '.summary-container',
        '.invoice-summary-and-notes',
        '.summary-section',
        '.notes-and-totals',
        '.tech-bottom-section'
      ]
      const summaryContainer = contentElement.querySelector(summarySelectors.join(','))
      if (summaryContainer) {
        const cTop = contentElement.getBoundingClientRect().top
        const sRect = summaryContainer.getBoundingClientRect()
        const sTop = sRect.top - cTop
        const sBottom = sRect.bottom - cTop
        const sHeight = sRect.height

        const pageIndex = Math.floor(sTop / pageHeightPx) + 1
        const pageBreakY = pageIndex * pageHeightPx
        const pageCutoffY = pageBreakY - pageBottomMarginPx

        if ((sTop < pageCutoffY && sBottom > pageCutoffY) || (sTop >= pageCutoffY && sTop < pageBreakY)) {
          if (sHeight <= maxAllowedSectionHeight) {
            const targetY = pageBreakY + pageTopMarginPx
            pushElementToNextPage(summaryContainer, targetY)
          }
        }
      }

      // Explicit QR Code Safety Barrier: verify QR code container never crosses page break
      const qrContainerSelectors = ['.payment-qr-code', '.qr-section', '.tech-payment-box', '.sidebar-section.payment-section']
      const qrContainers = Array.from(contentElement.querySelectorAll(qrContainerSelectors.join(',')))
      for (const qrBox of qrContainers) {
        const cTop = contentElement.getBoundingClientRect().top
        const qrBoxRect = qrBox.getBoundingClientRect()
        const qrTop = qrBoxRect.top - cTop
        const qrBottom = qrBoxRect.bottom - cTop
        const qrHeight = qrBoxRect.height

        const pageIndex = Math.floor(qrTop / pageHeightPx) + 1
        const pageBreakY = pageIndex * pageHeightPx
        const pageCutoffY = pageBreakY - pageBottomMarginPx

        if ((qrTop < pageCutoffY && qrBottom > pageCutoffY) || (qrTop >= pageCutoffY && qrTop < pageBreakY)) {
          if (qrHeight <= maxAllowedSectionHeight) {
            const targetY = pageBreakY + pageTopMarginPx
            pushElementToNextPage(qrBox, targetY)
          }
        }
      }

      // Check Totals container if standalone
      const totalsSelectors = ['.totals', '.totals-section', '.totals-column', '.tech-totals-table', '.tech-bottom-right']
      const totalsContainers = Array.from(contentElement.querySelectorAll(totalsSelectors.join(',')))
      for (const totBox of totalsContainers) {
        const cTop = contentElement.getBoundingClientRect().top
        const totRect = totBox.getBoundingClientRect()
        const totTop = totRect.top - cTop
        const totBottom = totRect.bottom - cTop
        const totHeight = totRect.height

        const pageIndex = Math.floor(totTop / pageHeightPx) + 1
        const pageBreakY = pageIndex * pageHeightPx
        const pageCutoffY = pageBreakY - pageBottomMarginPx

        if ((totTop < pageCutoffY && totBottom > pageCutoffY) || (totTop >= pageCutoffY && totTop < pageBreakY)) {
          if (totHeight <= maxAllowedSectionHeight) {
            const targetY = pageBreakY + pageTopMarginPx
            pushElementToNextPage(totBox, targetY)
          }
        }
      }

      // Check footer container
      const footerSelectors = ['.promo-footer', '.footer', '.tech-footer', '.footer-section']
      const footers = Array.from(contentElement.querySelectorAll(footerSelectors.join(',')))
      for (const footer of footers) {
        const cTop = contentElement.getBoundingClientRect().top
        const fRect = footer.getBoundingClientRect()
        const fTop = fRect.top - cTop
        const fBottom = fRect.bottom - cTop
        const fHeight = fRect.height

        const pageIndex = Math.floor(fTop / pageHeightPx) + 1
        const pageBreakY = pageIndex * pageHeightPx
        const pageCutoffY = pageBreakY - pageBottomMarginPx

        if ((fTop < pageCutoffY && fBottom > pageCutoffY) || (fTop >= pageCutoffY && fTop < pageBreakY)) {
          if (fHeight <= maxAllowedSectionHeight) {
            const targetY = pageBreakY + pageTopMarginPx
            pushElementToNextPage(footer, targetY)
          }
        }
      }
    }

    // Re-measure updated dimensions after pagination spacers
    contentRect = contentElement.getBoundingClientRect()
    const contentHeight = contentRect.height
    const heightBuffer = 150
    iframe.style.height = `${contentHeight + heightBuffer}px`

    const canvas = await html2canvas(contentElement, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff',
    })

    const imgData = canvas.toDataURL('image/png')
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    scaleFactor = imgWidth / contentRect.width

    // Locate the QR code and its payment URL anchor after layout
    let qrRect = null
    let qrUrl = null
    const qrCodeEl = iframeDoc.querySelector('.qr-section img, .payment-qr-code img, .tech-payment-box img')
    const qrAnchorEl = iframeDoc.querySelector('.qr-section a, .payment-qr-code a, .tech-payment-box a')

    if (qrAnchorEl && qrAnchorEl.href) {
      qrUrl = qrAnchorEl.href
      const targetEl = qrCodeEl || qrAnchorEl
      qrRect = targetEl.getBoundingClientRect()
    }

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

      // Place link on this page only if the QR code is located on this page
      if (qrPageY >= -1 && qrPageY + qrPdfH <= pdfHeight + 1) {
        pdf.setPage(pageNumber)
        pdf.link(qrPdfX, Math.max(0, qrPageY), qrPdfW, qrPdfH, { url: qrUrl })
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

    // Avoid trailing blank page due to sub-pixel rounding (threshold of 10pt)
    while (heightLeft > 10) {
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
  const taxableSubtotal = (invoice.value.items || []).reduce(
    (acc, item) => acc + (item.taxable !== false ? (item.quantity || 0) * (item.price || 0) : 0),
    0
  )

  let discountAmount = 0
  if (invoice.value.discount) {
    if (invoice.value.discountType === 'percentage') {
      discountAmount = subtotal * (Number(invoice.value.discount) / 100)
    } else {
      discountAmount = Number(invoice.value.discount)
    }
  }

  const postDiscountSubtotal = subtotal - discountAmount
  const taxRate = Number(invoice.value.taxRate) || 0
  
  let taxAmount = 0
  if (taxRate > 0 && subtotal > 0) {
    const ratio = taxableSubtotal / subtotal
    const postDiscountTaxableSubtotal = taxableSubtotal - (discountAmount * ratio)
    taxAmount = Math.max(0, postDiscountTaxableSubtotal) * (taxRate / 100)
  }

  const total = postDiscountSubtotal + taxAmount

  let status = invoice.value.status || ''
  status = status.charAt(0).toUpperCase() + status.slice(1)

  return {
    ...invoice.value,
    subtotal,
    discountAmount,
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
            <label class="style-option">
              <input
                type="radio"
                value="creative"
                v-model="invoice.style"
                @change="updateStyle"
              />
              <span>Creative Sidebar</span>
            </label>
            <label class="style-option">
              <input
                type="radio"
                value="tech"
                v-model="invoice.style"
                @change="updateStyle"
              />
              <span>Tech Grid</span>
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

            <v-btn
              @click="sendInvoiceEmail"
              :loading="isSendingEmail"
              color="primary"
              large
              prepend-icon="mdi-email"
            >
              Send Email
            </v-btn>

            <!-- Send via SMS (Text-2-Pay) -->
            <v-btn
              @click="openSmsModal"
              color="teal-accent-4"
              large
              class="text-white"
              prepend-icon="mdi-cellphone-text"
            >
              Send via SMS
            </v-btn>
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

      <!-- Small Print Logo Hint for Invoice Owner -->
      <div v-if="isOwner && (!settings?.company?.logoUrl || settings?.company?.logoUrl === '/Logo.png')" class="logo-preview-banner no-print mb-4" data-html2canvas-ignore="true">
        <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 0 24 24" width="18px" fill="#4facfe" class="banner-hint-icon">
          <path d="M0 0h24v24H0V0z" fill="none"/>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
        <span class="preview-hint-text">💡 <em>Tip: You can upload your custom business logo anytime in <router-link to="/settings" class="hint-settings-link">Settings</router-link>.</em></span>
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
      <InvoiceTemplate5
        v-else-if="safeInvoice.style === 'creative'"
        ref="invoicePaper"
        :invoice="safeInvoice"
        :settings="settings"
        :userProfile="userProfile"
      />
      <InvoiceTemplate6
        v-else-if="safeInvoice.style === 'tech'"
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

    <!-- Text-2-Pay SMS Dialog -->
    <v-dialog v-model="smsModal" max-width="540px">
      <v-card class="sms-dialog-card pa-2">
        <v-card-title class="d-flex align-center justify-space-between text-h6 font-weight-bold pt-4 px-4 text-white">
          <div class="d-flex align-center ga-2">
            <v-icon color="teal-accent-4">mdi-cellphone-text</v-icon>
            <span>Send Text-2-Pay SMS</span>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" color="grey-lighten-1" @click="smsModal = false"></v-btn>
        </v-card-title>

        <v-card-text class="px-4 py-2">
          <p class="text-body-2 text-grey-lighten-1 mb-4">
            Send an instant payment link text message directly to your client's mobile phone.
          </p>

          <v-text-field
            v-model="smsPhone"
            label="Client Mobile Phone"
            placeholder="e.g. (555) 000-0000"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-phone"
            color="teal-accent-4"
            class="mb-3 sms-phone-input"
          ></v-text-field>

          <!-- SMS Message Preview Box -->
          <div class="sms-preview-card mb-4 pa-3">
            <div class="text-caption text-teal-accent-3 mb-1 font-weight-bold d-flex align-center ga-1">
              <v-icon size="x-small" color="teal-accent-3">mdi-message-text-outline</v-icon>
              <span>SMS MESSAGE PREVIEW:</span>
            </div>
            <div class="text-body-2 text-white font-mono" style="word-break: break-word; line-height: 1.4;">
              ScanGo Invoice #{{ safeInvoice?.invoiceNumber }} for ${{ safeInvoice?.total?.toFixed(2) }} from {{ settings?.company?.name || 'ScanGo Merchant' }} is ready. Pay online here: https://scangoinvoice.com/pay/{{ safeInvoice?.id }} - Reply STOP to opt out, HELP for info.
            </div>
          </div>

          <!-- Merchant Opt-In / Consent Attestation Checkbox -->
          <div class="sms-consent-box mb-3 pa-3">
            <v-checkbox
              v-model="smsConsentAttested"
              color="teal-accent-4"
              density="compact"
              hide-details
            >
              <template v-slot:label>
                <div class="consent-label-text">
                  <strong class="text-teal-accent-3 d-block mb-1 font-weight-bold">Consent Attestation Required</strong>
                  <span>I confirm that this recipient has explicitly agreed to receive text messages and billing notifications from my business.</span>
                </div>
              </template>
            </v-checkbox>
          </div>

          <div class="text-caption text-grey-lighten-1 mb-3 d-flex align-center ga-1">
            <v-icon size="small" color="teal-accent-3">mdi-shield-check-outline</v-icon>
            <span>Carrier Compliant (CTIA & A2P 10DLC Verified). Standard msg & data rates apply.</span>
          </div>

          <!-- SMS History Log -->
          <div v-if="smsLogs && smsLogs.length > 0" class="mt-4 pt-3 sms-logs-wrapper">
            <div class="text-caption text-grey-lighten-1 font-weight-bold mb-2 d-flex align-center ga-1">
              <v-icon size="small" color="teal-accent-4">mdi-history</v-icon>
              <span>Recent SMS Deliveries:</span>
            </div>
            <div class="d-flex flex-column ga-2 max-h-36 overflow-y-auto pr-1">
              <div v-for="log in smsLogs" :key="log.id" class="d-flex justify-space-between align-center text-caption pa-2 rounded sms-log-item">
                <div>
                  <span class="font-weight-bold text-white">{{ log.phone }}</span>
                  <span class="text-grey-lighten-1 ms-2">({{ log.type === 'payment_receipt' ? 'Receipt Confirmation' : 'Invoice Payment Link' }})</span>
                </div>
                <v-chip size="x-small" :color="log.type === 'payment_receipt' ? 'success' : 'info'" class="font-weight-bold">
                  {{ log.sentAt ? new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sent' }}
                </v-chip>
              </div>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="px-4 pb-4 pt-2 sms-modal-actions">
          <v-btn
            color="teal-accent-4"
            variant="elevated"
            size="large"
            class="text-white font-weight-bold sms-send-btn elevation-3"
            :loading="isSendingSms"
            :disabled="!smsConsentAttested || isSendingSms"
            @click="sendSms"
            prepend-icon="mdi-send"
          >
            Send Text-2-Pay SMS
          </v-btn>
          <v-btn
            variant="outlined"
            color="grey-lighten-1"
            size="large"
            class="sms-cancel-btn"
            @click="smsModal = false"
          >
            Cancel
          </v-btn>
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

/* SMS Modal Styling & Responsiveness */
.sms-dialog-card {
  background: #111d2f !important;
  color: #f1f5f9 !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 20px !important;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6) !important;
}

.sms-preview-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.sms-consent-box {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(20, 184, 166, 0.4);
  border-radius: 12px;
}

.consent-label-text {
  color: #e2e8f0 !important;
  font-size: 0.82rem;
  line-height: 1.35;
}

.sms-logs-wrapper {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.sms-log-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.sms-modal-actions {
  display: flex;
  flex-direction: row-reverse;
  justify-content: flex-start;
  gap: 0.75rem;
}

.sms-send-btn,
.sms-cancel-btn {
  text-transform: none !important;
  letter-spacing: 0 !important;
  border-radius: 10px !important;
}

@media (max-width: 600px) {
  .sms-modal-actions {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 0.75rem !important;
  }
  .sms-send-btn,
  .sms-cancel-btn {
    width: 100% !important;
    margin: 0 !important;
  }
}

/* Logo Preview Banner */
.logo-preview-banner {
  background: rgba(79, 172, 254, 0.1);
  border: 1px solid rgba(79, 172, 254, 0.25);
  border-radius: 12px;
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.88rem;
  color: #e2e8f0;
  backdrop-filter: blur(12px);
}

.hint-settings-link {
  color: #00f2fe;
  text-decoration: underline;
  font-weight: 600;
}

.hint-settings-link:hover {
  color: #38bdf8;
}

@media print {
  .no-print {
    display: none !important;
  }
}
</style>
