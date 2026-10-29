<script setup>
import { ref, computed, watch } from 'vue'
import { format, isValid, differenceInCalendarDays, startOfToday } from 'date-fns'
import useInvoices from '../composables/useInvoices'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  invoice: {
    type: Object,
    default: null,
  },
  settings: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue', 'sent'])

const { sendPaymentReminder } = useInvoices()

const recipientEmail = ref('')
const subject = ref('')
const message = ref('')
const isCustomizing = ref(false)
const isSending = ref(false)
const errorMsg = ref('')

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const parseDate = (val) => {
  if (!val) return null
  if (typeof val.toDate === 'function') return val.toDate()
  if (val._seconds !== undefined) return new Date(val._seconds * 1000)
  if (val.seconds !== undefined) return new Date(val.seconds * 1000)
  const d = new Date(val)
  return isValid(d) ? d : null
}

const dueDateObj = computed(() => parseDate(props.invoice?.dueDate))

const daysOverdue = computed(() => {
  if (!dueDateObj.value) return 0
  return Math.max(0, differenceInCalendarDays(startOfToday(), dueDateObj.value))
})

const companyName = computed(() => {
  return (
    props.invoice?.sender?.name ||
    props.settings?.company?.name ||
    'Our Team'
  )
})

const clientName = computed(() => {
  return props.invoice?.client?.name || 'Valued Customer'
})

const invoiceNumber = computed(() => {
  return props.invoice?.invoiceNumber || props.invoice?.id || ''
})

const formattedTotal = computed(() => {
  const currency = props.invoice?.currency || props.settings?.currency || 'USD'
  const totalVal = props.invoice?.total || 0
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(totalVal)
})

const formattedDueDate = computed(() => {
  if (!dueDateObj.value) return 'Past Due'
  return format(dueDateObj.value, 'MMMM d, yyyy')
})

const reminderCount = computed(() => {
  return Number(props.invoice?.reminderCount) || 0
})

const formattedLastReminder = computed(() => {
  const lastDate = parseDate(props.invoice?.lastReminderSentAt)
  if (!lastDate) return null
  return format(lastDate, "MMM d, yyyy 'at' h:mm a")
})

const buildDefaultSubject = () => {
  return `Friendly Payment Reminder: Invoice #${invoiceNumber.value} from ${companyName.value}`
}

const buildDefaultMessage = () => {
  const overduePhrase =
    daysOverdue.value > 0
      ? ` (${daysOverdue.value} ${daysOverdue.value === 1 ? 'day' : 'days'} past due)`
      : ''

  return `Dear ${clientName.value},

I hope you are having a great week.

I am writing to share a courteous reminder regarding Invoice #${invoiceNumber.value} for ${formattedTotal.value}, which was due on ${formattedDueDate.value}${overduePhrase}.

We truly appreciate your business and understand how easily an invoice can be overlooked during a busy week. At your convenience, you can review and securely settle this balance online using the payment button below. If payment has already been sent, please disregard this notice and accept our thanks!

Please don't hesitate to reply directly to this email if you have any questions about this invoice or need any assistance.

Warm regards,
${companyName.value}`
}

const resetToDefault = () => {
  subject.value = buildDefaultSubject()
  message.value = buildDefaultMessage()
}

const initializeModalState = () => {
  if (!props.invoice) return
  errorMsg.value = ''
  recipientEmail.value = props.invoice.client?.email || ''
  isCustomizing.value = !recipientEmail.value
  resetToDefault()
}

watch(
  () => [props.modelValue, props.invoice?.id],
  ([open]) => {
    if (open && props.invoice) {
      initializeModalState()
    }
  },
  { immediate: true }
)

const handleSendReminder = async () => {
  if (!props.invoice || isSending.value) return
  errorMsg.value = ''

  const cleanEmail = (recipientEmail.value || '').trim()
  if (!cleanEmail || !cleanEmail.includes('@')) {
    errorMsg.value = 'Please provide a valid customer email address.'
    isCustomizing.value = true
    return
  }

  if (!subject.value.trim() || !message.value.trim()) {
    errorMsg.value = 'Subject and message cannot be empty.'
    isCustomizing.value = true
    return
  }

  isSending.value = true
  try {
    const res = await sendPaymentReminder({
      invoiceId: props.invoice.id,
      recipientEmail: cleanEmail,
      subject: subject.value.trim(),
      message: message.value.trim(),
    })

    emit('sent', {
      invoiceId: props.invoice.id,
      reminderCount: res.reminderCount ?? reminderCount.value + 1,
      lastReminderSentAt: res.lastReminderSentAt ? new Date(res.lastReminderSentAt) : new Date(),
      recipientEmail: cleanEmail,
      message: res.message || `Payment reminder sent to ${cleanEmail}!`,
    })
    isOpen.value = false
  } catch (err) {
    console.error('Failed to send payment reminder:', err)
    errorMsg.value = err.message || 'Failed to send payment reminder. Please try again.'
  } finally {
    isSending.value = false
  }
}
</script>

<template>
  <v-dialog v-model="isOpen" max-width="620px" scrollable>
    <v-card v-if="invoice" class="reminder-modal-card">
      <!-- Modal Header -->
      <div class="reminder-modal-header">
        <div class="d-flex align-center ga-3">
          <div class="header-icon-badge">
            <v-icon color="#f87171" size="24">mdi-bell-ring-outline</v-icon>
          </div>
          <div>
            <div class="d-flex align-center flex-wrap ga-2">
              <h3 class="modal-title">Send Payment Reminder</h3>
              <span class="overdue-pill">
                OVERDUE{{ daysOverdue > 0 ? ` • ${daysOverdue}d` : '' }}
              </span>
            </div>
            <p class="modal-subtitle">
              Invoice #{{ invoiceNumber }} • {{ clientName }} • <strong>{{ formattedTotal }}</strong>
            </p>
          </div>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          color="grey-lighten-1"
          @click="isOpen = false"
        ></v-btn>
      </div>

      <v-card-text class="reminder-modal-body">
        <!-- Error Alert -->
        <v-alert
          v-if="errorMsg"
          type="error"
          variant="tonal"
          density="compact"
          class="mb-4 rounded-lg"
          closable
          @click:close="errorMsg = ''"
        >
          {{ errorMsg }}
        </v-alert>

        <!-- Reminder Tracking History Banner -->
        <div v-if="reminderCount > 0" class="reminder-history-banner mb-4">
          <v-icon color="#fbbf24" size="20" class="flex-shrink-0 mt-0.5">mdi-history</v-icon>
          <div class="history-banner-text">
            <span class="font-weight-bold text-white">
              {{ reminderCount }} {{ reminderCount === 1 ? 'reminder has' : 'reminders have' }} already been sent
            </span>
            <span v-if="formattedLastReminder" class="d-block text-caption text-grey-lighten-1">
              Last reminder sent on {{ formattedLastReminder }}
            </span>
          </div>
        </div>

        <!-- Toolbar: Ready-to-Send Preview vs Customize Toggle -->
        <div class="preview-toolbar mb-3">
          <div class="d-flex align-center ga-2">
            <v-icon size="18" color="#38bdf8">mdi-email-check-outline</v-icon>
            <span class="toolbar-label">
              {{ isCustomizing ? 'Customize Reminder Email' : 'Ready-to-Send Professional Message' }}
            </span>
          </div>
          <div class="d-flex align-center ga-2">
            <v-btn
              v-if="isCustomizing"
              variant="text"
              size="x-small"
              color="grey-lighten-1"
              class="text-none font-weight-medium"
              prepend-icon="mdi-restore"
              @click="resetToDefault"
            >
              Reset Default
            </v-btn>
            <v-btn
              variant="tonal"
              size="small"
              :color="isCustomizing ? 'teal-accent-3' : 'blue-lighten-2'"
              class="text-none font-weight-bold rounded-lg"
              :prepend-icon="isCustomizing ? 'mdi-eye-outline' : 'mdi-pencil-outline'"
              @click="isCustomizing = !isCustomizing"
            >
              {{ isCustomizing ? 'Preview Message' : 'Customize Message' }}
            </v-btn>
          </div>
        </div>

        <!-- Mode 1: Clean Read-Only Confirmation Preview (1-Click Ready) -->
        <div v-if="!isCustomizing" class="email-preview-container">
          <div class="email-meta-bar">
            <div class="meta-row">
              <span class="meta-key">To:</span>
              <span class="meta-val">{{ recipientEmail }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-key">Subject:</span>
              <span class="meta-val font-weight-bold text-white">{{ subject }}</span>
            </div>
          </div>

          <div class="email-body-preview">
            <div class="message-text-render">{{ message }}</div>

            <!-- Automatic Invoice Summary & Payment CTA Preview -->
            <div class="auto-summary-preview mt-4">
              <div class="d-flex justify-space-between text-caption mb-1">
                <span class="text-grey-lighten-1">Invoice #{{ invoiceNumber }}</span>
                <span class="text-red-lighten-2 font-weight-bold">Due {{ formattedDueDate }}</span>
              </div>
              <div class="d-flex justify-space-between align-center pt-2 border-top-subtle">
                <span class="text-body-2 font-weight-bold text-white">Amount Due</span>
                <span class="text-subtitle-1 font-weight-bold text-light-blue-accent-2">{{ formattedTotal }}</span>
              </div>
              <div class="pay-cta-pill mt-3">
                <v-icon size="16" class="mr-1">mdi-lock-check-outline</v-icon>
                Includes 1-Click "View &amp; Pay Invoice Online" Button
              </div>
            </div>
          </div>
        </div>

        <!-- Mode 2: Customize Subject, Recipient & Message -->
        <div v-else class="customize-form-container">
          <v-text-field
            v-model="recipientEmail"
            label="Customer Email Address"
            placeholder="client@example.com"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-email-outline"
            color="primary"
            class="mb-3"
            hide-details="auto"
          ></v-text-field>

          <v-text-field
            v-model="subject"
            label="Email Subject Line"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-format-title"
            color="primary"
            class="mb-3"
            hide-details="auto"
          ></v-text-field>

          <v-textarea
            v-model="message"
            label="Reminder Message"
            variant="outlined"
            rows="9"
            auto-grow
            color="primary"
            hide-details="auto"
            class="mb-2"
          ></v-textarea>

          <div class="text-caption text-grey-lighten-1 d-flex align-center ga-1 mt-2">
            <v-icon size="16" color="#38bdf8">mdi-information-outline</v-icon>
            <span>
              An itemized summary box ({{ formattedTotal }} due {{ formattedDueDate }}) and direct online payment button will automatically be included below your message.
            </span>
          </div>
        </div>
      </v-card-text>

      <!-- Modal Footer Actions -->
      <div class="reminder-modal-footer">
        <v-btn
          variant="outlined"
          color="grey-lighten-1"
          size="large"
          class="text-none rounded-lg footer-cancel-btn"
          :disabled="isSending"
          @click="isOpen = false"
        >
          Cancel
        </v-btn>
        <v-btn
          color="#ef4444"
          variant="flat"
          size="large"
          class="text-white text-none font-weight-bold rounded-lg footer-send-btn elevation-3"
          :loading="isSending"
          prepend-icon="mdi-send-check"
          @click="handleSendReminder"
        >
          Send Payment Reminder
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.reminder-modal-card {
  background: #111d2f !important;
  color: #f1f5f9 !important;
  border: 1px solid rgba(248, 113, 113, 0.3) !important;
  border-radius: 20px !important;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.65) !important;
  overflow: hidden;
}

.reminder-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.header-icon-badge {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  line-height: 1.3;
}

.overdue-pill {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.4);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  letter-spacing: 0.5px;
}

.modal-subtitle {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0.2rem 0 0 0;
}

.reminder-modal-body {
  padding: 1.25rem 1.5rem !important;
}

.reminder-history-banner {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
}

.preview-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.toolbar-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #cbd5e1;
}

.email-preview-container {
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  overflow: hidden;
}

.email-meta-bar {
  padding: 0.85rem 1.15rem;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.meta-row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.meta-key {
  color: #94a3b8;
  min-width: 58px;
  font-weight: 500;
}

.meta-val {
  color: #e2e8f0;
  word-break: break-word;
}

.email-body-preview {
  padding: 1.15rem;
}

.message-text-render {
  white-space: pre-wrap;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #e2e8f0;
  font-family: 'Inter', sans-serif;
}

.auto-summary-preview {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 0.85rem 1rem;
}

.border-top-subtle {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.pay-cta-pill {
  background: rgba(37, 99, 235, 0.18);
  border: 1px solid rgba(59, 130, 246, 0.35);
  color: #93c5fd;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 8px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reminder-modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(15, 23, 42, 0.4);
}

@media (max-width: 600px) {
  .reminder-modal-header {
    padding: 1rem;
  }
  .reminder-modal-body {
    padding: 1rem !important;
  }
  .reminder-modal-footer {
    flex-direction: column-reverse;
    align-items: stretch;
    padding: 1rem;
  }
  .footer-send-btn,
  .footer-cancel-btn {
    width: 100%;
  }
}
</style>
