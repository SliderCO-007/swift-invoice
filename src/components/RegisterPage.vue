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
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useStripe } from '../composables/useStripe';

const name = ref('');
const email = ref('');
const password = ref('');

const { redirectToCheckout, error } = useStripe();

const handleRegister = async () => {
  // Here you would typically perform form validation
  // and create the user on your backend.

  // For now, we will just proceed to checkout.
  await redirectToCheckout();
};
</script>
