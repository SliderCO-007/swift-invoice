<script setup>
import { computed, watch, onMounted } from 'vue';
import { useVoiceInvoice, mergeTwoTranscripts } from '../composables/useVoiceInvoice';
import { useCustomers } from '../composables/useCustomers';
import { useItems } from '../composables/useItems';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'parsed']);

const { customers } = useCustomers();
const { items, fetchItems } = useItems();

const {
  isListening,
  isParsing,
  transcript,
  interimTranscript,
  error,
  isSpeechSupported,
  toggleListening,
  stopListening,
  clearTranscript,
  parseVoiceCommand,
} = useVoiceInvoice();

onMounted(() => {
  fetchItems();
});

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => {
    if (!val) {
      stopListening();
    }
    emit('update:modelValue', val);
  },
});

watch(
  () => props.modelValue,
  (open) => {
    if (!open) {
      stopListening();
    } else {
      fetchItems();
    }
  }
);

const catalogCount = computed(
  () => (items.value || []).filter((i) => i.type !== 'expense-category' && i.description).length
);
const customerCount = computed(() => (customers.value || []).length);

const samplePrompts = computed(() => {
  const firstCustomer = customers.value?.[0]?.name || 'John Smith';
  const firstItem =
    (items.value || []).find((i) => i.type !== 'expense-category' && i.description)?.description ||
    'Service Call & Labor';
  return [
    `Invoice ${firstCustomer} for 3 hours of ${firstItem} at $95 an hour and a $45 replacement valve, due next Friday`,
    `Create an invoice for Apex Properties for 5 hours of electrical troubleshooting at $110 per hour, due in 14 days`,
    `Create an estimate for Sarah Miller for kitchen remodel materials at $850 and 8 hours of installation at $85 an hour`,
  ];
});

const applySamplePrompt = (sample) => {
  stopListening();
  transcript.value = sample;
};

const handleGenerate = async () => {
  const combined = mergeTwoTranscripts(transcript.value, interimTranscript.value);
  const parsed = await parseVoiceCommand(combined, {
    customers: customers.value || [],
    items: items.value || [],
  });
  if (parsed) {
    emit('parsed', parsed);
    isOpen.value = false;
  }
};

const closeModal = () => {
  stopListening();
  isOpen.value = false;
};
</script>

<template>
  <v-dialog v-model="isOpen" max-width="580" persistent scrollable>
    <v-card class="voice-invoice-card" rounded="xl">
      <!-- Top Header -->
      <div class="voice-modal-header">
        <div class="d-flex align-center ga-3">
          <div class="header-mic-badge">
            <v-icon icon="mdi-microphone" size="22" color="#2dd4bf"></v-icon>
          </div>
          <div>
            <div class="d-flex align-center ga-2 flex-wrap">
              <h2 class="voice-modal-title">Voice Invoice</h2>
              <span class="ai-pill">AI Powered</span>
            </div>
            <p class="voice-modal-subtitle">
              Speak your invoice details in one shot—AI matches your clients &amp; catalog items.
            </p>
          </div>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          color="grey-lighten-1"
          @click="closeModal"
          :disabled="isParsing"
          aria-label="Close Voice Invoice dialog"
        ></v-btn>
      </div>

      <v-divider class="border-opacity-15" color="white"></v-divider>

      <!-- Main Body -->
      <v-card-text class="voice-modal-body pa-4 pa-sm-5">
        <!-- Fuzzy Match Context Pill -->
        <div class="fuzzy-context-bar mb-3">
          <v-icon icon="mdi-account-search-outline" size="16" color="#38bdf8" class="mr-1 flex-shrink-0"></v-icon>
          <span>
            Fuzzy matching active against
            <strong class="text-white">{{ customerCount }} saved customer{{ customerCount === 1 ? '' : 's' }}</strong>
            &amp;
            <strong class="text-white">{{ catalogCount }} catalog item{{ catalogCount === 1 ? '' : 's' }}</strong>
          </span>
        </div>

        <!-- Central Microphone Capture Stage -->
        <div class="mic-stage" :class="{ 'is-listening': isListening }">
          <button
            type="button"
            class="mic-trigger-btn"
            :class="{ 'listening-pulse': isListening }"
            @click="toggleListening"
            :disabled="isParsing"
            :aria-label="isListening ? 'Stop listening' : 'Tap to speak invoice command'"
          >
            <v-icon
              :icon="isListening ? 'mdi-stop' : 'mdi-microphone'"
              size="34"
              color="white"
            ></v-icon>
          </button>

          <div class="mic-status-text mt-3">
            <template v-if="isListening">
              <div class="soundwave-bars" aria-hidden="true">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
              </div>
              <span class="listening-label">Listening... (auto-stops after 5s pause, or tap to stop)</span>
            </template>
            <template v-else>
              <span class="idle-label">
                {{ isSpeechSupported ? 'Tap the mic and speak your invoice' : 'Use keyboard dictation or type below' }}
              </span>
              <span class="idle-subhint">
                Include client name, items, hours/quantities, rates, and due date
              </span>
            </template>
          </div>
        </div>

        <!-- Live Interim Speech Preview -->
        <div v-if="interimTranscript" class="interim-preview-box mb-3">
          <span class="interim-tag">Hearing:</span>
          <span class="interim-text">{{ interimTranscript }}</span>
        </div>

        <!-- Error Alert -->
        <v-alert
          v-if="error"
          type="warning"
          variant="tonal"
          density="compact"
          class="mb-3 rounded-lg text-body-2"
          closable
          @click:close="error = null"
        >
          {{ error }}
        </v-alert>

        <!-- Editable Dark-Mode Transcript Box -->
        <div class="transcript-section">
          <div class="d-flex align-center justify-space-between mb-1">
            <label class="transcript-label">Voice Transcript (Editable)</label>
            <button
              v-if="transcript"
              type="button"
              class="clear-text-btn"
              @click="clearTranscript"
              :disabled="isParsing"
            >
              <v-icon icon="mdi-refresh" size="14" class="mr-1"></v-icon>
              Clear
            </button>
          </div>
          <v-textarea
            v-model="transcript"
            rows="3"
            no-resize
            variant="outlined"
            bg-color="rgba(15, 23, 42, 0.9)"
            color="#2dd4bf"
            density="comfortable"
            placeholder="e.g., &quot;Create an invoice for John Smith for 4 hours of plumbing repair at $95 an hour and $60 for parts, due next Friday&quot;"
            hide-details
            class="transcript-textarea-dark"
            :disabled="isParsing"
          ></v-textarea>
        </div>

        <!-- Tap-to-Try Example Prompts -->
        <div class="sample-prompts-section mt-4">
          <span class="sample-prompts-title">
            <v-icon icon="mdi-lightbulb-on-outline" size="15" color="#fbbf24" class="mr-1"></v-icon>
            Try an example command (tap to fill):
          </span>
          <div class="sample-chips-list mt-2">
            <button
              v-for="(sample, idx) in samplePrompts"
              :key="idx"
              type="button"
              class="sample-prompt-chip"
              @click="applySamplePrompt(sample)"
              :disabled="isParsing"
            >
              “{{ sample }}”
            </button>
          </div>
        </div>
      </v-card-text>

      <v-divider class="border-opacity-15" color="white"></v-divider>

      <!-- Bottom Action Bar (Thumb Zone Optimized) -->
      <div class="voice-modal-footer pa-4">
        <v-btn
          variant="text"
          color="grey-lighten-1"
          rounded="lg"
          size="large"
          class="text-none font-weight-bold cancel-btn"
          @click="closeModal"
          :disabled="isParsing"
        >
          Cancel
        </v-btn>

        <v-btn
          color="#0284c7"
          variant="flat"
          rounded="lg"
          size="large"
          class="text-none font-weight-bold text-white populate-btn"
          :loading="isParsing"
          :disabled="!transcript.trim() && !interimTranscript.trim()"
          @click="handleGenerate"
        >
          <v-icon start class="mr-2">mdi-auto-fix</v-icon>
          {{ isParsing ? 'Populating Editor...' : 'Populate Invoice Editor' }}
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.voice-invoice-card {
  background: #111d2f !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6) !important;
  color: #f1f5f9 !important;
}

.voice-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 20px 12px;
  gap: 12px;
}

.header-mic-badge {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(45, 212, 191, 0.12);
  border: 1px solid rgba(45, 212, 191, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.voice-modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  line-height: 1.2;
}

.ai-pill {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #2dd4bf;
  background: rgba(45, 212, 191, 0.14);
  border: 1px solid rgba(45, 212, 191, 0.3);
  padding: 2px 8px;
  border-radius: 999px;
}

.voice-modal-subtitle {
  font-size: 0.84rem;
  color: #94a3b8;
  margin: 4px 0 0;
  line-height: 1.35;
}

.fuzzy-context-bar {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: #cbd5e1;
  background: rgba(56, 189, 248, 0.08);
  border: 1px solid rgba(56, 189, 248, 0.22);
  border-radius: 10px;
  padding: 8px 12px;
}

/* Central Mic Stage */
.mic-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 14px;
  margin-bottom: 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px dashed rgba(255, 255, 255, 0.14);
  transition: all 0.25s ease;
}

.mic-stage.is-listening {
  background: rgba(45, 212, 191, 0.06);
  border-color: rgba(45, 212, 191, 0.45);
  border-style: solid;
}

.mic-trigger-btn {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #0284c7 0%, #0d9488 100%);
  box-shadow: 0 8px 24px rgba(13, 148, 136, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.mic-trigger-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.mic-trigger-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.mic-trigger-btn.listening-pulse {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  animation: pulseRing 1.5s infinite;
}

@keyframes pulseRing {
  0% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.65);
  }
  70% {
    box-shadow: 0 0 0 18px rgba(239, 68, 68, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}

.mic-status-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.idle-label {
  font-size: 0.92rem;
  font-weight: 600;
  color: #f1f5f9;
}

.idle-subhint {
  font-size: 0.76rem;
  color: #94a3b8;
  margin-top: 2px;
}

.listening-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #2dd4bf;
  margin-top: 6px;
}

/* Soundwave Animation */
.soundwave-bars {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 18px;
}

.soundwave-bars .bar {
  width: 4px;
  height: 8px;
  border-radius: 2px;
  background: #2dd4bf;
  animation: soundBounce 0.9s infinite ease-in-out;
}

.soundwave-bars .bar:nth-child(1) { animation-delay: 0.0s; }
.soundwave-bars .bar:nth-child(2) { animation-delay: 0.15s; }
.soundwave-bars .bar:nth-child(3) { animation-delay: 0.3s; }
.soundwave-bars .bar:nth-child(4) { animation-delay: 0.15s; }
.soundwave-bars .bar:nth-child(5) { animation-delay: 0.0s; }

@keyframes soundBounce {
  0%, 100% {
    height: 6px;
    opacity: 0.6;
  }
  50% {
    height: 18px;
    opacity: 1;
  }
}

.interim-preview-box {
  background: rgba(45, 212, 191, 0.08);
  border: 1px solid rgba(45, 212, 191, 0.25);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.85rem;
}

.interim-tag {
  font-weight: 700;
  color: #2dd4bf;
  margin-right: 6px;
}

.interim-text {
  color: #e2e8f0;
  font-style: italic;
}

.transcript-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #cbd5e1;
}

/* Dark Mode Transcript Textarea */
.transcript-textarea-dark :deep(.v-field) {
  background: rgba(15, 23, 42, 0.9) !important;
  border-radius: 12px !important;
  color: #f8fafc !important;
}

.transcript-textarea-dark :deep(.v-field__outline) {
  --v-field-border-opacity: 0.22;
  color: rgba(148, 163, 184, 0.5) !important;
}

.transcript-textarea-dark :deep(.v-field--focused .v-field__outline) {
  --v-field-border-opacity: 1;
  color: #2dd4bf !important;
}

.transcript-textarea-dark :deep(textarea),
.transcript-textarea-dark :deep(.v-field__input) {
  color: #f8fafc !important;
  -webkit-text-fill-color: #f8fafc !important;
  caret-color: #2dd4bf !important;
  font-size: 0.92rem;
  line-height: 1.45;
  max-height: 110px;
  overflow-y: auto;
}

.transcript-textarea-dark :deep(textarea::placeholder) {
  color: #64748b !important;
  -webkit-text-fill-color: #64748b !important;
  opacity: 1;
}

.clear-text-btn {
  display: inline-flex;
  align-items: center;
  background: transparent;
  border: none;
  color: #38bdf8;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 6px;
}

.clear-text-btn:hover {
  background: rgba(56, 189, 248, 0.12);
}

.sample-prompts-title {
  display: flex;
  align-items: center;
  font-size: 0.78rem;
  font-weight: 600;
  color: #94a3b8;
}

.sample-chips-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sample-prompt-chip {
  text-align: left;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 10px;
  padding: 8px 12px;
  color: #cbd5e1;
  font-size: 0.8rem;
  line-height: 1.35;
  cursor: pointer;
  transition: all 0.18s ease;
}

.sample-prompt-chip:hover:not(:disabled),
.sample-prompt-chip:active:not(:disabled) {
  background: rgba(56, 189, 248, 0.1);
  border-color: rgba(56, 189, 248, 0.35);
  color: #ffffff;
}

.voice-modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.populate-btn {
  box-shadow: 0 4px 16px rgba(2, 132, 199, 0.4);
}

@media (max-width: 600px) {
  .voice-modal-footer {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .populate-btn,
  .cancel-btn {
    width: 100%;
    min-height: 48px;
  }
}
</style>
