<template>
  <v-container fluid class="fill-height bg-grey-lighten-4">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="pa-4">
          <v-card-title class="text-h4 font-weight-bold text-center mb-4">Register for Swift Invoice</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleRegister">
              <v-text-field v-model="name" label="Name" required variant="outlined" class="mb-4"></v-text-field>
              <v-text-field v-model="email" label="Email" type="email" required variant="outlined" class="mb-4"></v-text-field>
              <v-text-field v-model="password" label="Password" type="password" required variant="outlined" class="mb-4"></v-text-field>
              <v-alert v-if="error" type="error" dense class="mb-4">{{ error }}</v-alert>
              <v-btn type="submit" color="primary" block x-large>Register and Pay</v-btn>
            </v-form>
            <v-btn @click="handleGoogleSignIn" color="red" block x-large class="mt-4">Sign in with Google</v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import useAuth from '../composables/useAuth';
import { useStripe } from '../composables/useStripe';

const name = ref('');
const email = ref('');
const password = ref('');

const { error: authError, signUp, signInWithGoogle } = useAuth();
const { redirectToCheckout, error: stripeError } = useStripe();

const error = ref(null);

const handleRegister = async () => {
  error.value = null; // Reset error before trying

  // First, sign up the user with Firebase
  await signUp(email.value, password.value);

  // Check for an error from Firebase Auth
  if (authError.value) {
    error.value = authError.value;
    return; // Stop the process if registration fails
  }

  // If sign up is successful, proceed to Stripe checkout
  await redirectToCheckout();

  // Check for an error from Stripe
  if (stripeError.value) {
    error.value = stripeError.value;
  }
};

const handleGoogleSignIn = async () => {
  error.value = null; // Reset error before trying

  // First, sign in the user with Google
  await signInWithGoogle();

  // Check for an error from Firebase Auth
  if (authError.value) {
    error.value = authError.value;
    return; // Stop the process if registration fails
  }

  // If sign in is successful, proceed to Stripe checkout
  await redirectToCheckout();

  // Check for an error from Stripe
  if (stripeError.value) {
    error.value = stripeError.value;
  }
};
</script>
