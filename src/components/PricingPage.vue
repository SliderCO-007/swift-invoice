<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth, currentUser } from '../composables/useAuth';
import { useMeta } from '../composables/useMeta';
import useStripe from '../composables/useStripe';

const router = useRouter();
const route = useRoute();
const user = currentUser;

const { createCheckoutSession, loading, error } = useStripe();

const selectedPlan = ref(null);

useMeta(
  'ScanGo Invoice | Pricing',
  'ScanGo Invoice offers flexible pricing plans to fit your needs. Start for free with 3 invoices per month, or upgrade to Pro ($9/mo) or Agency ($90/yr) plans for unlimited invoicing and advanced features. All plans include professional invoice templates, client management, and secure payment options.',
);

// Mapping of plan names to their corresponding Price IDs
const priceIds = {
  monthly: 'price_1TICRCAuWeuwQet6OACgdcin',
  yearly: 'price_1TICSfAuWeuwQet6d3x2jHZ6',
};

const handleSubscribe = async (plan, priceId) => {
  error.value = null;
  selectedPlan.value = plan;

  if (!user.value) {
    router.push({ path: '/register', query: { redirect: `/pricing?plan=${plan}` } });
    return;
  }
  
  try {
    const successUrl = `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${window.location.origin}/payment-cancel`;

    await createCheckoutSession({
      priceId: priceId,
      successUrl: successUrl,
      cancelUrl: cancelUrl
    });
  } catch (err) {
    console.error('Subscription error:', err);
    error.value = err.message || 'An unexpected error occurred. Please try again.';
  } finally {
    selectedPlan.value = null;
  }
};

// When the component mounts, check for a plan in the URL
onMounted(() => {
  const plan = route.query.plan;
  if (plan && user.value) {
    const priceId = priceIds[plan];
    if (priceId) {
      handleSubscribe(plan, priceId);
    }
  }
});

</script>

<template>
  <div class="pricing-page">
    <v-container class="px-4 py-2 px-md-8 py-md-6">
      <v-responsive max-width="1000" class="mx-auto text-center">
        <h1 class="text-h4 text-sm-h3 text-md-h2 font-weight-bold mb-3 mt-1 mt-md-0">Choose Your Plan</h1>
        <p class="text-body-1 text-medium-emphasis mb-6">
          Start for free and scale up as you grow. No hidden fees, no surprises.
        </p>
        <v-alert
          v-if="error"
          type="error"
          class="mb-8"
          closable
          @click:close="error = null"
        >
          {{ error }}
        </v-alert>
      </v-responsive>

      <v-row justify="center" align="stretch">

        <!-- ── FREE PLAN ─────────────────────────────────────────── -->
        <v-col cols="12" md="4">
          <v-card class="pricing-card d-flex flex-column h-100" outlined>
            <div class="plan-badge-row">
              <v-chip color="secondary" label size="small">No Credit Card Required</v-chip>
            </div>
            <v-card-title class="plan-name text-center mt-2">Free</v-card-title>
            <v-card-subtitle class="plan-tagline text-center">A perfect start for freelancers</v-card-subtitle>

            <div class="plan-price text-center my-4">
              <span class="price-amount">$0</span>
              <span class="price-period">/month</span>
            </div>

            <v-divider class="my-2 mx-4" style="border-color:rgba(255,255,255,0.08);" />

            <v-card-text class="flex-grow-1 pt-4">
              <p class="feature-section-label">Invoicing</p>
              <div class="feature-item">
                <v-icon size="18" color="success">mdi-check-circle</v-icon>
                <span><strong>3 invoices</strong> per month (resets monthly)</span>
              </div>
              <div class="feature-item">
                <v-icon size="18" color="success">mdi-check-circle</v-icon>
                <span>Unlimited customers</span>
              </div>
              <div class="feature-item">
                <v-icon size="18" color="success">mdi-check-circle</v-icon>
                <span>Unlimited saved line items</span>
              </div>
              <div class="feature-item">
                <v-icon size="18" color="success">mdi-check-circle</v-icon>
                <span>6 professional templates</span>
              </div>
              <div class="feature-item">
                <v-icon size="18" color="success">mdi-check-circle</v-icon>
                <span>Download invoices as PDF</span>
              </div>
              <div class="feature-item">
                <v-icon size="18" color="success">mdi-check-circle</v-icon>
                <span>Custom branding &amp; logo</span>
              </div>
              <div class="feature-item">
                <v-icon size="18" color="success">mdi-check-circle</v-icon>
                <span>Tax rate &amp; discount fields</span>
              </div>

              <p class="feature-section-label mt-4">Payments</p>
              <div class="feature-item">
                <v-icon size="18" color="success">mdi-check-circle</v-icon>
                <span>Stripe Connect integration</span>
              </div>
              <div class="feature-item">
                <v-icon size="18" color="success">mdi-check-circle</v-icon>
                <span>0.50% platform fee</span>
              </div>
              <div class="feature-item">
                <v-icon size="18" color="success">mdi-check-circle</v-icon>
                <span>Credit card, Apple &amp; Google Pay</span>
              </div>
              <div class="feature-item">
                <v-icon size="18" color="success">mdi-check-circle</v-icon>
                <span>ACH bank transfer</span>
              </div>
              <div class="feature-item">
                <v-icon size="18" color="success">mdi-check-circle</v-icon>
                <span>Scannable QR code on invoice</span>
              </div>

              <p class="feature-section-label mt-4">Communication</p>
              <div class="feature-item">
                <v-icon size="18" color="success">mdi-check-circle</v-icon>
                <span>Email invoices directly to clients</span>
              </div>
              <div class="feature-item">
                <v-icon size="18" color="success">mdi-check-circle</v-icon>
                <span>Text-2-Pay SMS invoicing</span>
              </div>

              <p class="feature-section-label mt-4">Project Tracking</p>
              <div class="feature-item">
                <v-icon size="18" color="success">mdi-check-circle</v-icon>
                <span>Project &amp; time tracking</span>
              </div>
              <div class="feature-item muted">
                <v-icon size="18" color="rgba(255,255,255,0.2)">mdi-close-circle</v-icon>
                <span>Expense capture with receipt photos</span>
              </div>
              <div class="feature-item">
                <v-icon size="18" color="success">mdi-check-circle</v-icon>
                <span>One-click project-to-invoice</span>
              </div>
              <div class="feature-item muted">
                <v-icon size="18" color="rgba(255,255,255,0.2)">mdi-close-circle</v-icon>
                <span>Multi-user team seats &amp; collaboration</span>
              </div>

              <p class="feature-section-label mt-4">Support</p>
              <div class="feature-item">
                <v-icon size="18" color="success">mdi-check-circle</v-icon>
                <span>Standard email support</span>
              </div>
            </v-card-text>

            <v-card-actions class="pa-4">
              <v-btn block variant="outlined" color="primary" size="large" to="/register">
                Start Invoicing for Free
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <!-- ── MONTHLY PLAN ───────────────────────────────────────── -->
        <v-col cols="12" md="4">
          <v-card class="pricing-card d-flex flex-column h-100" outlined>
            <div class="plan-badge-row">
              <v-chip color="secondary" label size="small">Same cost as a Latte</v-chip>
            </div>
            <v-card-title class="plan-name text-center mt-2">Monthly</v-card-title>
            <v-card-subtitle class="plan-tagline text-center">For maximum flexibility</v-card-subtitle>

            <div class="plan-price text-center my-4">
              <span class="price-amount">$9</span>
              <span class="price-period">/month</span>
            </div>

            <v-divider class="my-2 mx-4" style="border-color:rgba(255,255,255,0.08);" />

            <v-card-text class="flex-grow-1 pt-4">
              <p class="feature-section-label">Invoicing</p>
              <div class="feature-item">
                <v-icon size="18" color="success">mdi-check-circle</v-icon>
                <span><strong>Unlimited</strong> invoices</span>
              </div>
              <div class="feature-item">
                <v-icon size="18" color="success">mdi-check-circle</v-icon>
                <span>Unlimited customers</span>
              </div>
              <div class="feature-item">
                <v-icon size="18" color="success">mdi-check-circle</v-icon>
                <span>Unlimited saved line items</span>
              </div>
              <div class="feature-item">
                <v-icon size="18" color="success">mdi-check-circle</v-icon>
                <span>6 professional templates</span>
              </div>
              <div class="feature-item">
                <v-icon size="18" color="success">mdi-check-circle</v-icon>
                <span>Download invoices as PDF</span>
              </div>
              <div class="feature-item">
                <v-icon size="18" color="success">mdi-check-circle</v-icon>
                <span>Custom branding &amp; logo</span>
              </div>
              <div class="feature-item">
                <v-icon size="18" color="success">mdi-check-circle</v-icon>
                <span>Tax rate &amp; discount fields</span>
              </div>

              <p class="feature-section-label mt-4">Payments</p>
              <div class="feature-item">
                <v-icon size="18" color="success">mdi-check-circle</v-icon>
                <span>Stripe Connect integration</span>
              </div>
              <div class="feature-item">
                <v-icon size="18" color="success">mdi-check-circle</v-icon>
                <span>Ultra-low 0.25% platform fee</span>
              </div>
              <div class="feature-item">
                <v-icon size="18" color="success">mdi-check-circle</v-icon>
                <span>Credit card, Apple &amp; Google Pay</span>
              </div>
              <div class="feature-item">
                <v-icon size="18" color="success">mdi-check-circle</v-icon>
                <span>ACH bank transfer</span>
              </div>
              <div class="feature-item">
                <v-icon size="18" color="success">mdi-check-circle</v-icon>
                <span>Scannable QR code on invoice</span>
              </div>

              <p class="feature-section-label mt-4">Communication</p>
              <div class="feature-item highlight-feature">
                <v-icon size="18" color="primary">mdi-check-circle</v-icon>
                <span>Email invoices directly to clients</span>
              </div>
              <div class="feature-item highlight-feature">
                <v-icon size="18" color="teal-accent-4">mdi-cellphone-text</v-icon>
                <span><strong>Text-2-Pay SMS invoicing</strong> &amp; receipts</span>
              </div>
              <div class="feature-item highlight-feature">
                <v-icon size="18" color="primary">mdi-check-circle</v-icon>
                <span>Weekly revenue summary reports</span>
              </div>

              <p class="feature-section-label mt-4">Project Tracking</p>
              <div class="feature-item highlight-feature">
                <v-icon size="18" color="primary">mdi-check-circle</v-icon>
                <span>Unlimited projects</span>
              </div>
              <div class="feature-item highlight-feature">
                <v-icon size="18" color="primary">mdi-check-circle</v-icon>
                <span>Time logging with hourly rates</span>
              </div>
              <div class="feature-item highlight-feature">
                <v-icon size="18" color="primary">mdi-check-circle</v-icon>
                <span>Expense capture with receipt photos</span>
              </div>
              <div class="feature-item highlight-feature">
                <v-icon size="18" color="primary">mdi-check-circle</v-icon>
                <span>One-click project-to-invoice</span>
              </div>
              <div class="feature-item highlight-feature">
                <v-icon size="18" color="primary">mdi-check-circle</v-icon>
                <span>Billable / non-billable entry tracking</span>
              </div>
              <div class="feature-item highlight-feature">
                <v-icon size="18" color="primary">mdi-check-circle</v-icon>
                <span>Multi-user team seats &amp; collaboration</span>
              </div>

              <p class="feature-section-label mt-4">Support</p>
              <div class="feature-item">
                <v-icon size="18" color="success">mdi-check-circle</v-icon>
                <span>Priority email support</span>
              </div>
            </v-card-text>

            <v-card-actions class="pa-4">
              <v-btn
                block
                variant="outlined"
                size="large"
                :loading="loading && selectedPlan === 'monthly'"
                :disabled="loading"
                @click="handleSubscribe('monthly', priceIds.monthly)"
              >
                Get Started
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <!-- ── YEARLY PLAN ────────────────────────────────────────── -->
        <v-col cols="12" md="4">
          <v-card class="pricing-card pricing-card-featured d-flex flex-column h-100" color="primary" dark>
            <div class="plan-badge-row">
              <v-chip color="white" text-color="primary" label size="small">Save 2 months</v-chip>
            </div>
            <v-card-title class="plan-name text-center mt-2">Yearly</v-card-title>
            <v-card-subtitle class="plan-tagline text-center" style="color:rgba(255,255,255,0.75);">Best value for your business</v-card-subtitle>

            <div class="plan-price text-center my-4">
              <span class="price-amount">$90</span>
              <span class="price-period">/year</span>
              <p class="price-note">equivalent to $7.50/mo</p>
            </div>

            <v-divider class="my-2 mx-4" style="border-color:rgba(255,255,255,0.2);" />

            <v-card-text class="flex-grow-1 pt-4">
              <div class="feature-item">
                <v-icon size="18" color="white">mdi-check-circle</v-icon>
                <span><strong>Everything in Monthly</strong></span>
              </div>

              <p class="feature-section-label mt-4" style="color:rgba(255,255,255,0.5);">Invoicing</p>
              <div class="feature-item">
                <v-icon size="18" color="white">mdi-check-circle</v-icon>
                <span>Unlimited invoices &amp; estimates</span>
              </div>
              <div class="feature-item">
                <v-icon size="18" color="white">mdi-check-circle</v-icon>
                <span>Unlimited customers &amp; line items</span>
              </div>
              <div class="feature-item">
                <v-icon size="18" color="white">mdi-check-circle</v-icon>
                <span>Custom branding &amp; logo</span>
              </div>
              <div class="feature-item">
                <v-icon size="18" color="white">mdi-check-circle</v-icon>
                <span>Export all invoices (CSV)</span>
              </div>

              <p class="feature-section-label mt-4" style="color:rgba(255,255,255,0.5);">Payments</p>
              <div class="feature-item">
                <v-icon size="18" color="white">mdi-check-circle</v-icon>
                <span>Stripe Connect — all payment methods</span>
              </div>
              <div class="feature-item">
                <v-icon size="18" color="white">mdi-check-circle</v-icon>
                <span>Branded QR code on every invoice</span>
              </div>

              <p class="feature-section-label mt-4" style="color:rgba(255,255,255,0.5);">Communication</p>
              <div class="feature-item">
                <v-icon size="18" color="white">mdi-check-circle</v-icon>
                <span>Email invoices directly to clients</span>
              </div>
              <div class="feature-item">
                <v-icon size="18" color="teal-accent-2">mdi-cellphone-text</v-icon>
                <span><strong>Text-2-Pay SMS invoicing</strong> &amp; receipts</span>
              </div>
              <div class="feature-item">
                <v-icon size="18" color="white">mdi-check-circle</v-icon>
                <span>Weekly revenue summary reports</span>
              </div>

              <p class="feature-section-label mt-4" style="color:rgba(255,255,255,0.5);">Project Tracking</p>
              <div class="feature-item">
                <v-icon size="18" color="white">mdi-check-circle</v-icon>
                <span>Unlimited projects</span>
              </div>
              <div class="feature-item">
                <v-icon size="18" color="white">mdi-check-circle</v-icon>
                <span>Time logging with hourly rates</span>
              </div>
              <div class="feature-item">
                <v-icon size="18" color="white">mdi-check-circle</v-icon>
                <span>Expense capture with receipt photos</span>
              </div>
              <div class="feature-item">
                <v-icon size="18" color="white">mdi-check-circle</v-icon>
                <span>One-click project-to-invoice</span>
              </div>
              <div class="feature-item">
                <v-icon size="18" color="white">mdi-check-circle</v-icon>
                <span>Billable / non-billable tracking</span>
              </div>
              <div class="feature-item">
                <v-icon size="18" color="white">mdi-check-circle</v-icon>
                <span>Multi-user team seats &amp; collaboration</span>
              </div>

              <p class="feature-section-label mt-4" style="color:rgba(255,255,255,0.5);">Support</p>
              <div class="feature-item">
                <v-icon size="18" color="white">mdi-check-circle</v-icon>
                <span>Priority support</span>
              </div>
              <div class="feature-item">
                <v-icon size="18" color="white">mdi-check-circle</v-icon>
                <span>Early access to new features</span>
              </div>
            </v-card-text>

            <v-card-actions class="pa-4">
              <v-btn
                block
                variant="outlined"
                size="large"
                :loading="loading && selectedPlan === 'yearly'"
                :disabled="loading"
                @click="handleSubscribe('yearly', priceIds.yearly)"
              >
                Choose Yearly &amp; Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.pricing-page {
  font-family: 'Poppins', sans-serif;
  background-color: #111d2f;
  color: #f1f5f9;
  min-height: 100vh;
  padding-top: 1rem;
}

@media (max-width: 900px) {
  .pricing-page {
    padding-top: 0.25rem !important;
  }
}

.pricing-page .text-medium-emphasis {
  color: #94a3b8 !important;
}

/* Card base */
.pricing-card {
  border-radius: 16px !important;
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(16px);
  color: #f1f5f9 !important;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2) !important;
  transition: all 0.3s ease-in-out !important;
  padding: 1.25rem;
}

.pricing-card:hover {
  transform: translateY(-6px) !important;
  box-shadow: 0 20px 50px rgba(0,0,0,0.4) !important;
}

.pricing-card-featured {
  border: 1px solid rgba(255,255,255,0.25) !important;
  box-shadow: 0 20px 60px rgba(25, 118, 210, 0.25) !important;
}

/* Plan header */
.plan-badge-row {
  display: flex;
  justify-content: center;
  padding-top: 0.75rem;
}

.plan-name {
  font-size: 1.75rem !important;
  font-weight: 700 !important;
  color: #fff !important;
  justify-content: center;
}

.plan-tagline {
  font-size: 0.9rem !important;
  color: #94a3b8 !important;
  opacity: 1 !important;
}

/* Price display */
.plan-price {
  padding: 0.5rem 0;
}

.price-amount {
  font-size: 3rem;
  font-weight: 800;
  color: #fff;
  line-height: 1;
}

.price-period {
  font-size: 1.1rem;
  color: #94a3b8;
  margin-left: 0.25rem;
}

.price-note {
  font-size: 0.78rem;
  color: rgba(255,255,255,0.5);
  margin: 0.25rem 0 0;
}

/* Feature list */
.feature-section-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
  margin: 0 0 0.5rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.3rem 0;
  font-size: 0.9rem;
  color: #e2e8f0;
}

.feature-item.muted {
  color: rgba(255,255,255,0.25);
  text-decoration: line-through;
  text-decoration-color: rgba(255,255,255,0.1);
}

.feature-item.highlight-feature {
  color: #fff;
  font-weight: 500;
}

:deep(.v-btn) {
  transition: box-shadow 0.2s ease-in-out !important;
}

:deep(.v-btn:hover) {
  box-shadow: 0px 4px 8px -2px rgba(25, 118, 210, 0.3),
              0px 2px 2px 0px rgba(25, 118, 210, 0.2),
              0px 1px 5px 0px rgba(25, 118, 210, 0.2) !important;
}
</style>