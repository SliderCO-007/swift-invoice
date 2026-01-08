<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
      <h2 class="text-2xl font-bold text-center mb-8">Register for Swift Invoice</h2>
      <form @submit.prevent="handleRegister">
        <div class="mb-4">
          <label for="name" class="block text-gray-700 font-bold mb-2">Name</label>
          <input type="text" id="name" v-model="name" class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600" required>
        </div>
        <div class="mb-4">
          <label for="email" class="block text-gray-700 font-bold mb-2">Email</label>
          <input type="email" id="email" v-model="email" class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600" required>
        </div>
        <div class="mb-6">
          <label for="password" class="block text-gray-700 font-bold mb-2">Password</label>
          <input type="password" id="password" v-model="password" class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600" required>
        </div>
        <div v-if="error" class="text-red-500 mb-4">{{ error }}</div>
        <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600">Register and Pay</button>
      </form>
    </div>
  </div>
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
