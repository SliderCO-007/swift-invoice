<script setup>
import { ref, onMounted } from 'vue';
import { loadStripe } from '@stripe/stripe-js';

const props = defineProps({
  clientSecret: {
    type: String,
    required: true,
  },
  invoiceId: {
    type: String,
    required: true,
  }
});

const emits = defineEmits(['payment-success', 'close']);

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
const stripe = ref(null);
const elements = ref(null);
const message = ref(null);
const isLoading = ref(false);

onMounted(async () => {
  if (!props.clientSecret) {
    message.value = "Stripe client secret is missing. Cannot initialize payment form.";
    return;
  }

  stripe.value = await stripePromise;
  elements.value = stripe.value.elements({
    clientSecret: props.clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#4F46E5',
        colorBackground: '#ffffff',
        colorText: '#30313d',
        colorDanger: '#df1b41',
        fontFamily: 'Ideal Sans, system-ui, sans-serif',
        spacingUnit: '2px',
        borderRadius: '4px',
      }
    }
  });

  const paymentElement = elements.value.create("payment");
  paymentElement.mount("#payment-element");
});

const handleSubmit = async () => {
  if (isLoading.value) {
    return;
  }

  isLoading.value = true;
  message.value = null;

  const { error } = await stripe.value.confirmPayment({
    elements: elements.value,
    confirmParams: {
      return_url: `${window.location.origin}/payment-success?invoice_id=${props.invoiceId}`,
    },
  });

  if (error.type === "card_error" || error.type === "validation_error") {
    message.value = error.message;
  } else {
    message.value = "An unexpected error occurred.";
  }

  isLoading.value = false;
};

</script>

<template>
  <v-card class="stripe-checkout-card">
    <v-card-title>
      <span class="headline">Complete Your Payment</span>
    </v-card-title>
    <v-card-text>
      <form id="payment-form" @submit.prevent="handleSubmit">
        <div id="payment-element">
          <!-- A Stripe Element will be inserted here. -->
        </div>
        <v-btn
          :loading="isLoading"
          :disabled="isLoading || !stripe"
          type="submit"
          color="primary"
          block
          class="mt-4"
        >
          Pay Now
        </v-btn>
        <div v-if="message" id="payment-message" class="error-message">
          {{ message }}
        </div>
      </form>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn text @click="$emit('close')">Cancel</v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.stripe-checkout-card {
    border-radius: 12px;
}
#payment-element {
  margin-bottom: 24px;
}

.error-message {
  margin-top: 1rem;
  color: #df1b41;
  text-align: center;
  font-size: 0.875rem;
}
</style>