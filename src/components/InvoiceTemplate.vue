<template>
  <v-card class="invoice-template pa-8" elevation="3">
    <v-row justify="space-between" align="center" class="mb-8">
      <v-col cols="6">
        <img v-if="invoice.sender.logoUrl" :src="invoice.sender.logoUrl" alt="Company Logo" class="company-logo" />
        <h1 v-else class="text-h4 font-weight-bold">{{ invoice.sender.companyName }}</h1>
      </v-col>
      <v-col cols="6" class="text-right">
        <h2 class="text-h5 font-weight-bold">INVOICE</h2>
        <p class="text-body-1">#{{ invoice.invoiceNumber }}</p>
      </v-col>
    </v-row>

    <v-row class="mb-8">
      <v-col cols="6">
        <h3 class="text-h6 font-weight-bold mb-2">Billed To:</h3>
        <p>{{ invoice.client.name }}</p>
        <p>{{ invoice.client.address }}</p>
        <p>{{ invoice.client.email }}</p>
      </v-col>
      <v-col cols="6" class="text-right">
        <h3 class="text-h6 font-weight-bold mb-2">From:</h3>
        <p>{{ invoice.sender.companyName }}</p>
        <p>{{ invoice.sender.address }}</p>
        <p>{{ invoice.sender.phoneNumber }}</p>
      </v-col>
    </v-row>

    <v-row class="mb-8">
      <v-col cols="6">
        <p><span class="font-weight-bold">Date Issued:</span> {{ invoice.dateIssued }}</p>
      </v-col>
      <v-col cols="6" class="text-right">
        <p><span class="font-weight-bold">Date Due:</span> {{ invoice.dateDue }}</p>
      </v-col>
    </v-row>

    <v-table class="mb-8">
      <thead>
        <tr>
          <th class="text-left">Description</th>
          <th class="text-center">Quantity</th>
          <th class="text-right">Unit Price</th>
          <th class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in invoice.items" :key="index">
          <td>{{ item.description }}</td>
          <td class="text-center">{{ item.quantity }}</td>
          <td class="text-right">{{ formatCurrency(item.price) }}</td>
          <td class="text-right">{{ formatCurrency(item.quantity * item.price) }}</td>
        </tr>
      </tbody>
    </v-table>

    <v-row justify="end" class="mb-8">
      <v-col cols="4">
        <v-row>
          <v-col>Subtotal:</v-col>
          <v-col class="text-right">{{ formatCurrency(subtotal) }}</v-col>
        </v-row>
        <v-row>
          <v-col>Tax ({{ invoice.taxRate }}%):</v-col>
          <v-col class="text-right">{{ formatCurrency(taxAmount) }}</v-col>
        </v-row>
        <v-divider class="my-2"></v-divider>
        <v-row class="font-weight-bold text-h6">
          <v-col>Total:</v-col>
          <v-col class="text-right">{{ formatCurrency(total) }}</v-col>
        </v-row>
      </v-col>
    </v-row>

    <div>
      <h3 class="text-h6 font-weight-bold mb-2">Notes</h3>
      <p>{{ invoice.notes }}</p>
    </div>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue';

const invoice = ref({
  sender: {
    companyName: 'Swift Invoice Inc.',
    address: '123 Main Street, Anytown, USA 12345',
    phoneNumber: '555-123-4567',
    logoUrl: 'https://via.placeholder.com/150x50.png?text=Your+Logo'
  },
  client: {
    name: 'John Doe',
    address: '456 Oak Avenue, Sometown, USA 54321',
    email: 'john.doe@example.com'
  },
  invoiceNumber: 'INV-001',
  dateIssued: '2024-07-29',
  dateDue: '2024-08-12',
  items: [
    { description: 'Web Design Services', quantity: 1, price: 2500 },
    { description: 'Hosting (1 Year)', quantity: 1, price: 300 },
    { description: 'Domain Name (1 Year)', quantity: 1, price: 15 }
  ],
  taxRate: 8,
  notes: 'Thank you for your business!'
});

const subtotal = computed(() => {
  return invoice.value.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
});

const taxAmount = computed(() => {
  return subtotal.value * (invoice.value.taxRate / 100);
});

const total = computed(() => {
  return subtotal.value + taxAmount.value;
});

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};
</script>

<style scoped>
.invoice-template {
  font-family: 'Roboto', sans-serif;
}
.company-logo {
  max-height: 70px;
  max-width: 200px;
}
</style>
