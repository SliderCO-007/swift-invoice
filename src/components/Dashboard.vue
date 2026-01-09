<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Dashboard</span>
            <div>
              <v-btn color="primary" class="mr-2" @click="goToInvoices">View Invoices</v-btn>
              <v-btn color="primary" class="mr-2" @click="goToInvoiceEditor">Create Invoice</v-btn>
              <v-btn color="primary" class="mr-2" @click="goToSettings">Settings</v-btn>
              <v-btn color="primary" @click="handleLogout">Logout</v-btn>
            </div>
          </v-card-title>
          <v-card-text>
            Welcome to your dashboard! Here you can manage your invoices, view analytics, and more.
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Manage Invoices</v-card-title>
          <v-card-text>
            <p>Create a new invoice or view your existing invoices.</p>
            <v-btn color="primary" class="mt-4" @click="goToInvoices">Go to Invoices</v-btn>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Analytics Overview</v-card-title>
          <v-card-text>
            <!-- Placeholder for analytics -->
            <p>Analytics data is not yet available.</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useRouter } from 'vue-router';
import useAuth from '../composables/useAuth';

const { logout } = useAuth();
const router = useRouter();

const handleLogout = async () => {
  await logout();
  router.push('/login');
};

const goToSettings = () => {
  router.push('/settings');
};

const goToInvoiceEditor = () => {
  router.push('/invoice/new');
};

const goToInvoices = () => {
  router.push('/invoices');
};
</script>

<style scoped>
/* Add any specific styles for the dashboard here */
</style>
