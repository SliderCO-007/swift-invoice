<template>
  <v-container fluid>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h5 font-weight-bold">Invoices</span>
        <v-btn color="primary" to="/invoice/new">Create Invoice</v-btn>
      </v-card-title>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="invoices"
          :loading="loading"
          class="elevation-1"
        >
          <template v-slot:item.status="{ item }">
            <v-chip :color="getStatusColor(item.status)" dark>{{ item.status }}</v-chip>
          </template>
          <template v-slot:item.total="{ item }">
            {{ formatCurrency(calculateTotal(item.items, item.taxRate)) }}
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn icon="mdi-pencil" variant="text" @click="editInvoice(item.id)"></v-btn>
            <v-btn icon="mdi-delete" variant="text" color="red" @click="deleteInvoice(item.id)"></v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import useInvoices from '../composables/useInvoices';

const router = useRouter();
const { invoices, loading, fetchInvoices } = useInvoices();

onMounted(() => {
  fetchInvoices();
});

const headers = ref([
  { title: 'Invoice #', key: 'invoiceNumber', sortable: true },
  { title: 'Client', key: 'client.name', sortable: true },
  { title: 'Date Issued', key: 'dateIssued', sortable: true },
  { title: 'Date Due', key: 'dateDue', sortable: true },
  { title: 'Total', key: 'total', sortable: false }, // It's calculated, so no sorting
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false },
]);

const calculateTotal = (items, taxRate) => {
  if (!items) return 0;
  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const tax = subtotal * ((taxRate || 0) / 100);
  return subtotal + tax;
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Paid': return 'green';
    case 'Sent': return 'blue';
    case 'Draft': return 'grey';
    default: return 'grey';
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

const editInvoice = (id) => {
  router.push(`/invoice/${id}/edit`);
};

const deleteInvoice = (id) => {
  // Logic to delete the invoice will be added later using the composable
  console.log(`Deleting invoice ${id}`);
};

</script>
