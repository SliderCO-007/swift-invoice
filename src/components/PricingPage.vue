<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(false);

const handleSubscription = async (plan) => {
  loading.value = true;
  // Here you would typically handle the subscription logic,
  // for example, by calling a Firebase Cloud Function that creates a Stripe Checkout session.
  console.log(`Subscribing to ${plan} plan...`);
  
  // For now, we'll just simulate a delay and then redirect to the dashboard.
  setTimeout(() => {
    loading.value = false;
    router.push('/dashboard');
  }, 2000);
};
</script>

<template>
  <div class="pricing-page">
    <v-container class="pa-4 pa-md-8">
      <v-responsive max-width="900" class="mx-auto text-center">
        <h1 class="text-h3 text-md-h2 font-weight-bold mb-4">Choose Your Plan</h1>
        <p class="text-body-1 text-medium-emphasis mb-8">
          Unlock unlimited invoicing with our simple and affordable pricing. No hidden fees, no surprises.
        </p>
      </v-responsive>

      <v-row justify="center" align="stretch">
        <!-- Monthly Plan -->
        <v-col cols="12" md="5">
          <v-card class="d-flex flex-column h-100 pa-4" outlined>
            <v-card-title class="text-h4 font-weight-medium text-center">Monthly</v-card-title>
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
                :loading="loading"
                @click="handleSubscription('monthly')"
              >
                Get Started
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <!-- Yearly Plan -->
        <v-col cols="12" md="5">
          <v-card class="d-flex flex-column h-100 pa-4" color="primary" dark>
            <v-card-title class="text-h4 font-weight-medium text-center">Yearly</v-card-title>
            <v-card-subtitle class="text-center text-body-1 mb-4">Save 2 months!</v-card-subtitle>

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
                :loading="loading"
                @click="handleSubscription('yearly')"
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
  transition: none !important;
}

.v-card:hover {
  transform: none !important;
  box-shadow: 0 5px 15px rgba(0,0,0,0.08) !important;
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
