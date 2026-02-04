
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

const emit = defineEmits(['delete-invoice']);

const router = useRouter();

const headers = ref([
  { title: 'Invoice #', key: 'invoiceNumber', sortable: true },
  { title: 'Client', key: 'client.name', sortable: true },
  { title: 'Issue Date', key: 'issueDate', sortable: true },
  { title: 'Due Date', key: 'dueDate', sortable: true },
  { title: 'Total', key: 'total', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
]);

const dialogDelete = ref(false);
const itemToDelete = ref(null);

const formatDate = (date) => {
  if (date && isValid(new Date(date))) {
    return format(new Date(date), 'MMM d, yyyy');
  }
  return 'N/A';
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
};

const viewInvoice = (invoiceId) => {
  router.push(`/invoice/${invoiceId}`);
};

const openDeleteDialog = (item) => {
  itemToDelete.value = item;
  dialogDelete.value = true;
};

const closeDeleteDialog = () => {
  itemToDelete.value = null;
  dialogDelete.value = false;
};

const confirmDelete = () => {
  if (itemToDelete.value) {
    emit('delete-invoice', itemToDelete.value.id);
    closeDeleteDialog();
  }
};

const getStatusColor = (status) => {
    switch (status) {
        case 'Paid': return 'green';
        case 'draft': return 'blue-grey';
        case 'pending': return 'orange';
        default: return 'grey';
    }
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
        <v-chip :color="getStatusColor(item.status)" size="small">
          {{ item.status }}
        </v-chip>
      </template>
      <template v-slot:item.actions="{ item }">
        <div class="d-flex justify-end align-center">
            <v-btn size="small" color="primary" @click="viewInvoice(item.id)" class="mr-2">
                View
            </v-btn>
            <v-btn variant="plain" size="small" @click="openDeleteDialog(item)" title="Delete Invoice">
              <v-icon color="red-lighten-1">mdi-delete</v-icon>
            </v-btn>
        </div>
      </template>
    </v-data-table>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="dialogDelete" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Are you sure?</v-card-title>
        <v-card-text>
          Do you really want to delete this invoice? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="closeDeleteDialog">Cancel</v-btn>
          <v-btn color="red-darken-1" variant="text" @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-card>
</template>

<style scoped>
.invoice-table-card {
  margin-top: 2rem;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.05);
}

.invoice-table-card :deep(.v-data-table-header__cell) {
  background-color: #F8F9FA;
  border-bottom: none;
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
  color: #333;
}

.invoice-table-card :deep(tbody tr) {
    transition: background-color 0.2s ease;
}

.invoice-table-card :deep(tbody tr:hover) {
  background-color: #F1F3F5 !important; 
}

.invoice-table-card :deep(tbody td) {
  border-bottom: 1px solid #E9ECEF;
  font-size: 0.9rem;
  color: #495057;
}

.invoice-table-card :deep(tbody tr:last-child td) {
  border-bottom: none;
}

</style>
