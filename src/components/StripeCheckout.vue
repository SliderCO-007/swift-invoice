<script setup>
import { ref, onMounted, watch } from 'vue';
import { loadStripe } from '@stripe/stripe-js';
import { VCard, VCardTitle, VCardText, VCardActions, VBtn, VSpacer, VAlert } from 'vuetify/components';

const props = defineProps({
  clientSecret: {
    type: String,
    required: true,
  },
  returnUrl: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['payment-success', 'payment-error', 'close-dialog']);

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
let stripe = null;
let elements = null;

const paymentElementRef = ref(null);
const isProcessing = ref(false);
const errorMessage = ref(null);

const setupStripeElements = async () => {
  if (!props.clientSecret || !paymentElementRef.value) return;

  stripe = await stripePromise;
  elements = stripe.elements({ clientSecret: props.clientSecret });

  const paymentElement = elements.create('payment');
  paymentElement.mount(paymentElementRef.value);
};

const handleSubmit = async () => {
  if (isProcessing.value || !stripe || !elements) return;

  isProcessing.value = true;
  errorMessage.value = null;

  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: props.returnUrl,
    },
  });

  if (error) {
    errorMessage.value = error.message || 'An unexpected error occurred.';
    emit('payment-error', errorMessage.value);
    isProcessing.value = false;
  } else {
    emit('payment-success');
  }
};

watch(() => props.clientSecret, (newSecret) => {
  if (newSecret) {
    setupStripeElements();
  }
}, { immediate: true });

onMounted(setupStripeElements);

</script>

<template>
  <v-card class="stripe-checkout-card">
    <v-card-title class="text-h5 font-weight-bold">Complete Your Payment</v-card-title>
    <v-card-text>
      <div ref="paymentElementRef" class="payment-element"></div>
      <v-alert v-if="errorMessage" type="error" dense class="mt-4">{{ errorMessage }}</v-alert>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn text @click="emit('close-dialog')">Cancel</v-btn>
      <v-btn :loading="isProcessing" color="primary" @click="handleSubmit" large>
        Pay Now
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.stripe-checkout-card {
  padding: 1rem;
}
.payment-element {
  margin-bottom: 1.5rem;
}
</style>
