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
import { watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import useInvoices from '@/composables/useInvoices';

const router = useRouter();
const { createInvoice, updateInvoice } = useInvoices();
// Correctly import from the refactored useAuth composable
const { user, isAuthReady } = useAuth();

const processInvoice = async () => {
  // If no user is logged in after auth state is resolved, redirect to login.
  if (!user.value) {
    console.log('Auth ready, but no user found. Redirecting to login.');
    router.push('/login');
    return;
  }

  const pendingInvoiceJSON = localStorage.getItem('pendingInvoice');
  
  if (pendingInvoiceJSON) {
    const pendingInvoice = JSON.parse(pendingInvoiceJSON);
    
    try {
      // Ensure the invoice is associated with the logged-in user
      pendingInvoice.userId = user.value.uid;

      if (pendingInvoice.id) {
        await updateInvoice(pendingInvoice.id, pendingInvoice);
      } else {
        await createInvoice(pendingInvoice);
      }
      
      localStorage.removeItem('pendingInvoice');
      router.push('/dashboard');

    } catch (error) {
      console.error("Error finalizing invoice:", error);
      router.push('/dashboard'); 
    }
  } else {
    console.log('No pending invoice found in local storage.');
    router.push('/dashboard');
  }
};

// Watch for the isAuthReady state to become true.
// This ensures we don't try to process the invoice until Firebase has confirmed the auth state.
const unwatch = watch(isAuthReady, (ready) => {
  if (ready) {
    console.log('Authentication is ready. Processing invoice...');
    processInvoice();
    unwatch(); // Clean up the watcher once it has run.
  }
}, { immediate: true });

</script>

<style scoped>
/* Add any specific styles if needed */
</style>
