<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { currentUser, userProfile } from '../composables/useAuth.js';
import { useMeta } from '../composables/useMeta.js';
import Logo from './Logo.vue';

const router = useRouter();

useMeta(
  'Instant Online Invoice Payments Guide | ScanGo Invoice',
  'Learn how ScanGo Invoice lets your clients pay in seconds via QR code, Apple Pay, Google Pay, Credit Card, and ACH direct debit powered by Stripe.'
);

const isAuthenticated = computed(() => !!currentUser.value);
const isConnected = computed(() => !!userProfile.value?.chargesEnabled);

const advantages = [
  {
    icon: 'mdi-lightning-bolt',
    color: '#34d399',
    bg: 'rgba(52, 211, 153, 0.12)',
    title: 'Get Paid 3x Faster On-Site or Online',
    desc: 'Stop waiting 30 days for paper checks. Clients simply scan the QR code on your PDF invoice or tap the link in their email/SMS to pay in under 10 seconds.'
  },
  {
    icon: 'mdi-apple',
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.12)',
    title: 'Apple Pay, Google Pay, Cards & ACH Bank Transfers',
    desc: 'Give customers every modern way to pay—from one-tap mobile wallets (Face ID / Touch ID) and all major credit/debit cards to low-fee ACH bank transfers.'
  },
  {
    icon: 'mdi-check-decagram',
    color: '#818cf8',
    bg: 'rgba(129, 140, 248, 0.12)',
    title: 'Zero Manual Bookkeeping & Instant Receipts',
    desc: 'The moment your client pays, ScanGo automatically marks the invoice as PAID on your dashboard and dispatches a payment confirmation receipt.'
  },
  {
    icon: 'mdi-bank-transfer-in',
    color: '#fbbf24',
    bg: 'rgba(251, 191, 36, 0.12)',
    title: 'Direct Bank Payouts & Bank-Grade Security',
    desc: 'Funds are deposited straight into your linked business or personal checking account on a rolling 2-day payout schedule, protected by Stripe encryption.'
  }
];

const setupSteps = [
  {
    step: '1',
    title: 'Open Settings & Click "Connect with Stripe"',
    time: '30 Seconds',
    desc: 'From your ScanGo Invoice dashboard, head to Settings and click the Connect with Stripe button. You can link an existing Stripe account or create a new one.'
  },
  {
    step: '2',
    title: 'Verify Your Business or Sole Proprietor Info',
    time: '2 Minutes',
    desc: 'Stripe’s guided Express onboarding asks for basic contact details and where you want your payouts deposited (works for LLCs, corporations, and solo freelancers).'
  },
  {
    step: '3',
    title: 'Automatic Live QR Codes & Payment Links',
    time: 'Instant',
    desc: 'Once verified, every invoice you generate automatically embeds a live, secure "Scan or Click to Pay" QR code and checkout link tailored to that exact invoice total!'
  }
];

const goToSetup = () => {
  if (isAuthenticated.value) {
    router.push('/settings#stripe-connect');
  } else {
    router.push('/register');
  }
};

const goToDashboard = () => {
  router.push('/dashboard');
};
</script>

<template>
  <div class="sample-guide-page">
    <div class="guide-container">
      <!-- Top Badge Banner -->
      <div class="text-center mb-6">
        <div class="sample-pill-badge">
          <v-icon size="16" color="#34d399" class="mr-1">mdi-qrcode-scan</v-icon>
          <span>Interactive Sample QR Code Destination</span>
        </div>
      </div>

      <!-- Hero Card -->
      <div class="glass-hero-card mb-8">
        <div class="hero-header-row">
          <div class="logo-box">
            <Logo />
          </div>
          <v-chip color="teal-accent-3" variant="tonal" size="small" class="font-weight-bold">
            <v-icon start size="14">mdi-check-circle</v-icon>
            Test Drive Success!
          </v-chip>
        </div>

        <h1 class="hero-title mt-4">
          You Just Experienced How Easy It Is for Your Clients to Pay You!
        </h1>
        <p class="hero-subtitle mt-3">
          On a real invoice with your payment account connected, scanning or clicking that QR code takes your customer directly to a secure, mobile-ready <strong>Stripe Checkout Portal</strong> pre-filled with their exact invoice balance.
        </p>

        <!-- Visual Comparison Mockup Strip -->
        <div class="checkout-preview-strip mt-6">
          <div class="preview-step">
            <div class="preview-icon-circle">
              <v-icon color="#38bdf8" size="24">mdi-qrcode-scan</v-icon>
            </div>
            <div>
              <div class="preview-step-title">1. Client Scans or Clicks</div>
              <div class="preview-step-sub">From PDF, Email, or SMS</div>
            </div>
          </div>
          <v-icon color="grey-darken-1" class="d-none d-sm-flex">mdi-arrow-right</v-icon>
          <div class="preview-step">
            <div class="preview-icon-circle">
              <v-icon color="#818cf8" size="24">mdi-cellphone-check</v-icon>
            </div>
            <div>
              <div class="preview-step-title">2. 1-Tap Checkout</div>
              <div class="preview-step-sub">Apple Pay, Google Pay, Card, ACH</div>
            </div>
          </div>
          <v-icon color="grey-darken-1" class="d-none d-sm-flex">mdi-arrow-right</v-icon>
          <div class="preview-step">
            <div class="preview-icon-circle">
              <v-icon color="#34d399" size="24">mdi-cash-fast</v-icon>
            </div>
            <div>
              <div class="preview-step-title">3. Marked Paid Automatically</div>
              <div class="preview-step-sub">Deposited to your bank</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 1: Advantages of Setting Up Stripe -->
      <section class="mb-10">
        <div class="section-heading mb-6">
          <span class="section-eyebrow">WHY CONNECT STRIPE?</span>
          <h2 class="section-title">The Advantages of Enabling Instant Online Payments</h2>
          <p class="section-desc">
            Connecting your Stripe account turns static PDF bills into instant cash-collection machines.
          </p>
        </div>

        <div class="advantages-grid">
          <div v-for="(adv, i) in advantages" :key="i" class="advantage-card">
            <div class="adv-icon-wrap" :style="{ backgroundColor: adv.bg }">
              <v-icon :color="adv.color" size="28">{{ adv.icon }}</v-icon>
            </div>
            <div class="adv-content">
              <h3 class="adv-title">{{ adv.title }}</h3>
              <p class="adv-desc">{{ adv.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 2: High-Level Setup Steps -->
      <section class="mb-10">
        <div class="glass-steps-card">
          <div class="section-heading mb-6">
            <span class="section-eyebrow text-teal-accent-3">QUICK 3-STEP SETUP</span>
            <h2 class="section-title">How to Activate Your Payment QR Codes</h2>
            <p class="section-desc">
              No coding, no monthly gateway fees from ScanGo, and no hardware required. Set it up once in about 2 minutes:
            </p>
          </div>

          <div class="steps-list">
            <div v-for="item in setupSteps" :key="item.step" class="step-row">
              <div class="step-badge">{{ item.step }}</div>
              <div class="step-body">
                <div class="step-title-line">
                  <h3 class="step-title">{{ item.title }}</h3>
                  <span class="step-time-pill">{{ item.time }}</span>
                </div>
                <p class="step-desc">{{ item.desc }}</p>
              </div>
            </div>
          </div>

          <!-- Action CTA Footer -->
          <div class="cta-footer-box mt-8">
            <div v-if="isConnected" class="text-center">
              <v-chip color="success" variant="flat" class="mb-4 font-weight-bold">
                <v-icon start>mdi-check-circle</v-icon>
                Your Stripe Account is Already Connected!
              </v-chip>
              <div>
                <v-btn
                  color="primary"
                  size="x-large"
                  rounded="xl"
                  class="font-weight-bold text-none px-8"
                  @click="goToDashboard"
                >
                  Return to Dashboard
                </v-btn>
              </div>
            </div>

            <div v-else class="cta-actions-wrap">
              <div class="cta-text-col">
                <h4 class="cta-heading">Ready to accept instant payments on your invoices?</h4>
                <p class="cta-subtext">
                  Connect your Stripe account in Settings or head back to your Dashboard to create your first real client invoice.
                </p>
              </div>
              <div class="cta-buttons-col">
                <v-btn
                  color="#635bff"
                  size="large"
                  rounded="lg"
                  class="font-weight-bold text-none px-6 stripe-cta-btn"
                  prepend-icon="mdi-credit-card-check-outline"
                  @click="goToSetup"
                >
                  {{ isAuthenticated ? 'Connect Stripe in Settings' : 'Create Free Account' }}
                </v-btn>
                <v-btn
                  v-if="isAuthenticated"
                  variant="outlined"
                  color="grey-lighten-1"
                  size="large"
                  rounded="lg"
                  class="font-weight-bold text-none px-5"
                  @click="goToDashboard"
                >
                  Back to Dashboard
                </v-btn>
                <v-btn
                  v-else
                  to="/pay/demo"
                  variant="outlined"
                  color="teal-accent-3"
                  size="large"
                  rounded="lg"
                  class="font-weight-bold text-none px-5"
                >
                  View Client Payment Portal Demo
                </v-btn>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.sample-guide-page {
  min-height: 100vh;
  background-color: #111d2f;
  color: #f1f5f9;
  padding: 2.5rem 1.25rem 5rem;
  font-family: 'Inter', 'Poppins', sans-serif;
}

.guide-container {
  max-width: 920px;
  margin: 0 auto;
}

.sample-pill-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid rgba(52, 211, 153, 0.3);
  color: #34d399;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 6px 16px;
  border-radius: 999px;
  box-shadow: 0 4px 20px rgba(52, 211, 153, 0.15);
}

.glass-hero-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
}

.hero-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.hero-title {
  font-size: 2rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.25;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: 1.05rem;
  color: #cbd5e1;
  line-height: 1.6;
}

.checkout-preview-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  flex-wrap: wrap;
}

.preview-step {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.preview-icon-circle {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.preview-step-title {
  font-weight: 700;
  font-size: 0.92rem;
  color: #f8fafc;
}

.preview-step-sub {
  font-size: 0.78rem;
  color: #94a3b8;
}

.section-heading {
  text-align: left;
}

.section-eyebrow {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #38bdf8;
  text-transform: uppercase;
  margin-bottom: 0.35rem;
}

.section-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.4rem;
}

.section-desc {
  color: #94a3b8;
  font-size: 0.98rem;
  margin: 0;
}

.advantages-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.advantage-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.advantage-card:hover {
  transform: translateY(-2px);
  border-color: rgba(56, 189, 248, 0.3);
}

.adv-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.adv-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 0.4rem 0;
}

.adv-desc {
  font-size: 0.9rem;
  color: #94a3b8;
  line-height: 1.5;
  margin: 0;
}

.glass-steps-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2.5rem;
  backdrop-filter: blur(16px);
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.step-row {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
}

.step-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
  color: #0f172a;
  font-weight: 800;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.step-body {
  flex: 1;
}

.step-title-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}

.step-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.step-time-pill {
  font-size: 0.75rem;
  font-weight: 700;
  color: #2dd4bf;
  background: rgba(45, 212, 191, 0.12);
  border: 1px solid rgba(45, 212, 191, 0.25);
  padding: 2px 10px;
  border-radius: 999px;
}

.step-desc {
  font-size: 0.92rem;
  color: #cbd5e1;
  line-height: 1.5;
  margin: 0;
}

.cta-footer-box {
  background: linear-gradient(135deg, rgba(99, 91, 255, 0.12) 0%, rgba(56, 189, 248, 0.08) 100%);
  border: 1px solid rgba(99, 91, 255, 0.3);
  border-radius: 16px;
  padding: 1.75rem;
}

.cta-actions-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.cta-text-col {
  flex: 1;
  min-width: 0;
}

.cta-heading {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.35rem 0;
}

.cta-subtext {
  font-size: 0.9rem;
  color: #cbd5e1;
  margin: 0;
  line-height: 1.45;
}

.cta-buttons-col {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.cta-buttons-col .v-btn {
  height: auto !important;
  min-height: 48px !important;
  padding: 12px 20px !important;
  white-space: normal !important;
}

:deep(.cta-buttons-col .v-btn .v-btn__content) {
  white-space: normal !important;
  text-align: center;
  line-height: 1.3;
  overflow-wrap: break-word;
}

.stripe-cta-btn {
  color: #ffffff !important;
  box-shadow: 0 8px 24px rgba(99, 91, 255, 0.35);
}

@media (max-width: 768px) {
  .sample-guide-page {
    padding: 1.25rem 0.85rem 4rem;
  }
  .glass-hero-card,
  .glass-steps-card {
    padding: 1.25rem;
  }
  .hero-title {
    font-size: 1.4rem;
  }
  .section-title {
    font-size: 1.35rem;
  }
  .advantages-grid {
    grid-template-columns: 1fr;
  }
  .advantage-card,
  .step-row,
  .cta-footer-box {
    padding: 1.15rem;
  }
  .checkout-preview-strip {
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem;
  }
  .cta-actions-wrap {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  .cta-buttons-col {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }
  .cta-buttons-col .v-btn {
    width: 100% !important;
  }
}
</style>
