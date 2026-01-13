<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Finalizing Invoice</v-toolbar-title>
          </v-toolbar>
          <v-card-text class="text-center">
            <p class="text-h6">Please wait while we process your invoice...</p>
            <v-progress-circular indeterminate color="primary" class="my-4"></v-progress-circular>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAuthReady, getCurrentUser } from '../composables/useAuth';
import useInvoices from '../composables/useInvoices';

const router = useRouter();
const { createInvoice, updateInvoice } = useInvoices();

onMounted(async () => {
  await getAuthReady(); // Wait for Firebase Auth to initialize
  const user = getCurrentUser();

  if (!user) {
    // If no user is logged in after waiting, redirect to login
    router.push('/login');
    return;
  }

  const pendingInvoiceJSON = localStorage.getItem('pendingInvoice');
  
  if (pendingInvoiceJSON) {
    const pendingInvoice = JSON.parse(pendingInvoiceJSON);
    
    try {
      if (pendingInvoice.id) {
        // This was an existing draft, update it
        await updateInvoice(pendingInvoice.id, pendingInvoice);
      } else {
        // This is a brand new invoice, create it
        await createInvoice(pendingInvoice);
      }
      
      // Clean up local storage and redirect
      localStorage.removeItem('pendingInvoice');
      router.push('/dashboard');

    } catch (error) {
      console.error("Error finalizing invoice:", error);
      // Optional: Redirect to an error page or show a message
      router.push('/dashboard'); // Redirect anyway, so user is not stuck
    }
  } else {
    // No pending invoice found, just go to dashboard
    router.push('/dashboard');
  }
});
</script>

<style scoped>
/* Add any specific styles if needed */
</style>