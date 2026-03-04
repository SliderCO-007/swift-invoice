<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth, currentUser } from '../composables/useAuth';
import useStripe from '../composables/useStripe';

const router = useRouter();
const route = useRoute();
const user = currentUser;

const { createCheckoutSession, loading, error } = useStripe();

const selectedPlan = ref(null);

// Mapping of plan names to their corresponding Price IDs
const priceIds = {
  monthly: 'price_1T0Zf0AuWeuwQet6AHC0Owwn',
  yearly: 'price_1Spgg9AuWeuwQet65ynWRtb7',
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
                @click="handleSubscribe('monthly', priceIds.monthly)"
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
                @click="handleSubscribe('yearly', priceIds.yearly)"
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