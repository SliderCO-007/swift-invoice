<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import useInvoices from '../composables/useInvoices.js';
import { useAuth } from '../composables/useAuth.js';

const router = useRouter();
const { currentUser } = useAuth();
const { createCheckoutSession } = useInvoices();

const loading = ref(false);
const error = ref(null);
const selectedPlan = ref(null);

const selectPlan = async (plan, priceId) => {
  error.value = null;
  selectedPlan.value = plan;

  // 1. Check if user is logged in
  if (!currentUser.value) {
    // Redirect to login, but pass along the intended plan so we can come back
    router.push({ path: '/login', query: { redirect: `/pricing?plan=${plan}` } });
    return;
  }
  
  loading.value = true;

  try {
    // 2. Define success and cancel URLs
    const successUrl = `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${window.location.origin}/pricing`;

    // 3. Call the Cloud Function to create a checkout session
    const result = await createCheckoutSession({ 
      priceId: priceId,
      successUrl: successUrl,
      cancelUrl: cancelUrl
    });

    // 4. Redirect to Stripe Checkout
    if (result.data && result.data.url) {
      window.location.href = result.data.url;
    } else {
      throw new Error('Could not create a checkout session.');
    }
  } catch (err) {
    console.error(err);
    error.value = 'An unexpected error occurred. Please try again.';
  } finally {
    loading.value = false;
    selectedPlan.value = null;
  }
};
</script>

<template>
  <div class="pricing-page">
    <v-container class="pa-4 pa-md-8">
      <v-responsive max-width="900" class="mx-auto text-center">
        <h1 class="text-h3 text-md-h2 font-weight-bold mb-4">Choose Your Plan</h1>
        <p class="text-body-1 text-medium-emphasis mb-8">
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
        <!-- Free Plan -->
        <v-col cols="12" md="4">
          <v-card class="d-flex flex-column h-100 pa-4" outlined>
             <v-chip color="secondary" class="align-self-center" label>
                No Credit Card Required
              </v-chip>
            <v-card-title class="text-h4 font-weight-medium text-center mt-2">Free</v-card-title>
            <v-card-subtitle class="text-center text-body-1 mb-4">A perfect start for freelancers</v-card-subtitle>
            
            <v-card-text class="flex-grow-1 text-center">
              <div class="d-flex justify-center align-start mb-6">
                <span class="text-h2 font-weight-bold">$0</span>
                <span class="text-h5 font-weight-medium mt-2">/month</span>
              </div>
              <v-list-item>
                <v-list-item-title class="text-body-1">2 free invoices</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <v-list-item-title class="text-body-1">Unlimited Customers</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <v-list-item-title class="text-body-1">Unlimited Items</v-list-item-title>
              </v-list-item>
            </v-card-text>

            <v-card-actions class="pa-4">
              <v-btn
                block
                variant="outlined"
                color="primary"
                size="large"
                to="/register"
              >
                Start Invoicing for Free
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <!-- Monthly Plan -->
        <v-col cols="12" md="4">
          <v-card class="d-flex flex-column h-100 pa-4" outlined>
            <v-chip color="secondary" class="align-self-center" label>
                Same cost as a Latte
            </v-chip>
            <v-card-title class="text-h4 font-weight-medium text-center mt-2">Monthly</v-card-title>
            <v-card-subtitle class="text-center text-body-1 mb-4">For maximum flexibility</v-card-subtitle>
            
            <v-card-text class="flex-grow-1 text-center">
              <div class="d-flex justify-center align-start mb-6">
                <span class="text-h2 font-weight-bold">$6</span>
                <span class="text-h5 font-weight-medium mt-2">/month</span>
              </div>
              <v-list-item>
                <v-list-item-title class="text-body-1">Unlimited Invoices</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <v-list-item-title class="text-body-1">Unlimited Customers</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <v-list-item-title class="text-body-1">Cancel Anytime</v-list-item-title>
              </v-list-item>
            </v-card-text>

            <v-card-actions class="pa-4">
              <v-btn
                block
                variant="outlined"
                size="large"
                :loading="loading && selectedPlan === 'monthly'"
                :disabled="loading"
                @click="selectPlan('monthly', 'price_1T0Zf0AuWeuwQet6AHC0Owwn')"
              >
                Get Started
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <!-- Yearly Plan -->
        <v-col cols="12" md="4">
          <v-card class="d-flex flex-column h-100 pa-4" color="primary" dark>
             <v-chip color="white" text-color="primary" class="align-self-center" label>
                Save 2 months
              </v-chip>
            <v-card-title class="text-h4 font-weight-medium text-center mt-2">Yearly</v-card-title>
            <v-card-subtitle class="text-center text-body-1 mb-4">Best value for your business</v-card-subtitle>

            <v-card-text class="flex-grow-1 text-center">
              <div class="d-flex justify-center align-start mb-6">
                <span class="text-h2 font-weight-bold">$60</span>
                <span class="text-h5 font-weight-medium mt-2">/year</span>
              </div>
              <v-list-item>
                <v-list-item-title class="text-body-1">Unlimited Invoices</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <v-list-item-title class="text-body-1">Unlimited Customers</v-list-item-title>
              </v-list-item>
               <v-list-item>
                <v-list-item-title class="text-body-1">Priority Support</v-list-item-title>
              </v-list-item>
            </v-card-text>
            
            <v-card-actions class="pa-4">
              <v-btn
                block
                variant="outlined"
                size="large"
                :loading="loading && selectedPlan === 'yearly'"
                :disabled="loading"
                @click="selectPlan('yearly', 'price_1Spgg9AuWeuwQet65ynWRtb7')"
              >
                Choose Yearly
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
  background-color: #f8f9fa;
  color: #333;
  min-height: 100vh;
}

.v-card {
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.08) !important;
  transition: all 0.3s ease-in-out !important;
}

.v-card:hover {
  transform: translateY(-5px) !important;
  box-shadow: 0 12px 25px rgba(0,0,0,0.12) !important;
}

:deep(.v-btn) {
  transition: box-shadow 0.2s ease-in-out !important;
}

:deep(.v-btn:hover) {
  box-shadow: 0px 4px 8px -2px rgba(0, 0, 0, 0.2),
              0px 2px 2px 0px rgba(0, 0, 0, 0.14),
              0px 1px 5px 0px rgba(0, 0, 0, 0.12) !important;
}
</style>