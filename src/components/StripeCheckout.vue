<script setup>
import { ref, onMounted, watch } from 'vue';
import { loadStripe } from '@stripe/stripe-js';

const props = defineProps({
  clientSecret: {
    type: String,
    required: true,
  },
  invoiceId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['close']);

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
let stripe = null;
let elements = null;

const paymentElementRef = ref(null);
const isProcessing = ref(false);
const errorMessage = ref(null);

const setupStripeElements = async () => {
  if (!props.clientSecret) return;

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
      return_url: `${window.location.origin}/invoice/${props.invoiceId}`,
    },
  });

  if (error) {
    errorMessage.value = error.message || 'An unexpected error occurred.';
    isProcessing.value = false;
  } 
};

watch(() => props.clientSecret, (newSecret) => {
  if (newSecret) {
    setupStripeElements();
  }
}, { immediate: true });

</script>

<template>
  <div class="stripe-checkout-card">
    <h3 class="title">Complete Your Payment</h3>
    <div ref="paymentElementRef" class="payment-element"></div>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    <div class="actions">
      <button @click="emit('close')" class="cancel-btn">Cancel</button>
      <button :disabled="isProcessing" @click="handleSubmit" class="pay-btn">
        {{ isProcessing ? 'Processing...' : 'Pay Now' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.stripe-checkout-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
}

.payment-element {
  margin-bottom: 1.5rem;
}

.error-message {
  color: #dc2626;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.cancel-btn, .pay-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.cancel-btn {
  background-color: #e5e7eb;
  color: #1f2937;
}

.cancel-btn:hover {
  background-color: #d1d5db;
}

.pay-btn {
  background-color: var(--primary-color, #4F46E5);
  color: white;
}

.pay-btn:disabled {
  background-color: #a5b4fc;
  cursor: not-allowed;
}

.pay-btn:hover:not(:disabled) {
  background-color: #4338ca;
}
</style>
