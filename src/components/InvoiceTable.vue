<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { format, isValid } from 'date-fns';

const props = defineProps({
  invoices: {
    type: Array,
    required: true,
  },
});

const router = useRouter();

const headers = ref([
  { title: 'Invoice #', key: 'invoiceNumber', sortable: true },
  { title: 'Client', key: 'client.name', sortable: true },
  { title: 'Issue Date', key: 'issueDate', sortable: true },
  { title: 'Due Date', key: 'dueDate', sortable: true },
  { title: 'Total', key: 'total', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false },
]);

const formatDate = (date) => {
  if (date && isValid(new Date(date))) {
    return format(new Date(date), 'MMM d, yyyy');
  }
  return 'N/A';
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

const viewInvoice = (invoiceId) => {
  router.push(`/invoice/${invoiceId}`);
};

</script>

<template>
  <v-card class="invoice-table-card">
    <v-data-table
      :headers="headers"
      :items="invoices"
      item-key="id"
      class="elevation-1 invoice-data-table"
    >
      <template v-slot:item.issueDate="{ item }">
        {{ formatDate(item.issueDate) }}
      </template>
      <template v-slot:item.dueDate="{ item }">
        {{ formatDate(item.dueDate) }}
      </template>
      <template v-slot:item.total="{ item }">
        {{ formatCurrency(item.total) }}
      </template>
      <template v-slot:item.status="{ item }">
        <v-chip :color="item.status === 'Paid' ? 'green' : 'orange'" dark small>
          {{ item.status }}
        </v-chip>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn small color="primary" @click="viewInvoice(item.id)">
          View
        </v-btn>
      </template>
    </v-data-table>
  </v-card>
</template>

<style scoped>
.invoice-table-card {
  margin-top: 2rem;
  border-radius: 15px;
  overflow: hidden;
}

.invoice-table-card :deep(.v-data-table-header__cell) {
  background-color: #F8F9FA;
  border-bottom: 2px solid white;
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
  color: #333;
}

.invoice-table-card :deep(tbody tr:hover) {
  background-color: #F1F3F5;
}

.invoice-table-card :deep(tbody td) {
  border-bottom: 1px solid #E9ECEF;
  font-size: 0.9rem;
  color: #6c757d;
}

.invoice-table-card :deep(tbody tr:last-child td) {
  border-bottom: none;
}
</style>
