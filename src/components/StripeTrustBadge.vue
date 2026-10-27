<script setup>
import { computed } from 'vue';
import useUserSettings from '../composables/useUserSettings';
import { userProfile } from '../composables/useAuth.js';

const props = defineProps({
  companyName: {
    type: String,
    default: ''
  },
  compact: {
    type: Boolean,
    default: false
  },
  showMicrocopy: {
    type: Boolean,
    default: true
  }
});

const { settings } = useUserSettings();

const displayCompany = computed(() => {
  const raw = (
    props.companyName ||
    settings.value?.company?.name ||
    userProfile.value?.name ||
    ''
  ).trim();
  // Strip sample suffix if present from sample invoice sender/client
  const cleaned = raw.replace(/\s*\(Sample.*?\)/i, '').trim();
  return cleaned || 'Your Bank Account';
});
</script>

<template>
  <div class="stripe-trust-badge" :class="{ 'is-compact': compact }">
    <!-- Primary Trust Strip -->
    <div class="trust-main-row">
      <div class="trust-pill stripe-brand-pill">
        <v-icon size="15" color="#34d399" class="mr-1 flex-shrink-0">mdi-lock-check</v-icon>
        <span>Secured by <strong>Stripe</strong></span>
      </div>

      <span class="trust-dot d-none d-sm-inline">•</span>

      <div class="trust-pill">
        <v-icon size="15" color="#38bdf8" class="mr-1 flex-shrink-0">mdi-shield-lock-outline</v-icon>
        <span>256-Bit SSL Encryption</span>
      </div>

      <span class="trust-dot d-none d-sm-inline">•</span>

      <div class="trust-pill payout-pill">
        <v-icon size="15" color="#fbbf24" class="mr-1 flex-shrink-0">mdi-bank-check</v-icon>
        <span>Direct Payouts to <strong class="company-highlight">{{ displayCompany }}</strong></span>
      </div>
    </div>

    <!-- Accepted Payment Methods Strip -->
    <div class="payment-methods-row">
      <span class="methods-label">Instant Client Checkout:</span>
      <div class="methods-pills-wrap">
        <span class="method-chip">
          <v-icon size="14" color="#ffffff" class="mr-1">mdi-apple</v-icon>
          Apple Pay
        </span>
        <span class="method-chip">
          <v-icon size="13" color="#38bdf8" class="mr-1">mdi-google</v-icon>
          Google Pay
        </span>
        <span class="method-chip">
          <v-icon size="14" color="#a5b4fc" class="mr-1">mdi-credit-card-check-outline</v-icon>
          Visa / Mastercard / Amex
        </span>
        <span class="method-chip">
          <v-icon size="14" color="#34d399" class="mr-1">mdi-bank-transfer</v-icon>
          ACH Bank Transfer
        </span>
      </div>
    </div>

    <!-- Reassurance Microcopy -->
    <p v-if="showMicrocopy && !compact" class="trust-microcopy">
      <v-icon size="13" color="#94a3b8" class="mr-1">mdi-information-outline</v-icon>
      ScanGo never stores your banking credentials or holds your funds. Payouts deposit directly from Stripe to your bank account.
    </p>
  </div>
</template>

<style scoped>
.stripe-trust-badge {
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(99, 91, 255, 0.28);
  border-radius: 12px;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
}

.stripe-trust-badge.is-compact {
  padding: 0.65rem 0.85rem;
  gap: 0.45rem;
  background: rgba(15, 23, 42, 0.45);
}

.trust-main-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem 0.6rem;
  font-size: 0.8rem;
  color: #e2e8f0;
  line-height: 1.35;
}

.trust-pill {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  overflow-wrap: break-word;
  word-break: break-word;
}

.stripe-brand-pill strong {
  color: #a5b4fc;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.company-highlight {
  color: #ffffff;
  font-weight: 700;
}

.trust-dot {
  color: rgba(148, 163, 184, 0.5);
  font-weight: 700;
}

.payment-methods-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem 0.5rem;
  padding-top: 0.35rem;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}

.methods-label {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #94a3b8;
  margin-right: 0.15rem;
  max-width: 100%;
  overflow-wrap: break-word;
}

.methods-pills-wrap {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem;
  max-width: 100%;
  min-width: 0;
}

.method-chip {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 0.73rem;
  font-weight: 600;
  color: #f1f5f9;
  white-space: nowrap;
  max-width: 100%;
  box-sizing: border-box;
}

.trust-microcopy {
  margin: 0.15rem 0 0 0;
  font-size: 0.74rem;
  color: #94a3b8;
  line-height: 1.4;
  display: flex;
  align-items: flex-start;
}

@media (max-width: 600px) {
  .stripe-trust-badge {
    padding: 0.75rem;
  }
  .trust-main-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }
  .payment-methods-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.35rem;
  }
}

@media (max-width: 360px) {
  .method-chip {
    white-space: normal;
    word-break: break-word;
  }
}
</style>
