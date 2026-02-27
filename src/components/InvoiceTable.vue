<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { format, isValid, isBefore, startOfToday } from 'date-fns';

const props = defineProps({
  invoices: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['delete-invoice']);

const router = useRouter();

// Define the logical sort order for statuses
const statusOrder = {
  'Overdue': 1,
  'Pending': 2,
  'Quote': 3,
  'Paid': 4,
  'Draft': 5,
};

const headers = ref([
  { title: 'Invoice #', key: 'invoiceNumber', sortable: true },
  { title: 'Client', key: 'client.name', sortable: true },
  { title: 'Issue Date', key: 'issueDate', sortable: true },
  { title: 'Due Date', key: 'dueDate', sortable: true },
  { title: 'Total', key: 'total', sortable: true },
  // Sort by the numeric rank, not the status name
  { title: 'Status', key: 'statusSortKey', sortable: true }, 
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
]);

const dialogDelete = ref(false);
const itemToDelete = ref(null);

// Determines the correct status string for an invoice
const getInvoiceStatus = (invoice) => {
  const status = (invoice.status || 'pending').toLowerCase();
  
  if (status !== 'pending') {
    return invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1);
  }

  const dueDate = invoice.dueDate && typeof invoice.dueDate.toDate === 'function'
    ? invoice.dueDate.toDate()
    : new Date(invoice.dueDate);

  if (isValid(dueDate) && isBefore(dueDate, startOfToday())) {
    return 'Overdue';
  }
  return 'Pending';
};

// Processes invoices to add a sortable key for the status
const processedInvoices = computed(() => {
  return props.invoices.map(invoice => {
    const status = getInvoiceStatus(invoice);
    return {
      ...invoice,
      status: status, // The status string for display
      statusSortKey: statusOrder[status] || 99, // The numeric rank for sorting
    };
  });
});

const formatDate = (date) => {
  if (date && isValid(new Date(date))) {
    return format(new Date(date), 'MMM d, yyyy');
  }
  return 'N/A';
};

const formatDateForCSV = (date) => {
  if (!date) return '';
  const d = (date && typeof date.toDate === 'function') ? date.toDate() : new Date(date);
  if (isValid(d)) {
    return format(d, 'MM/dd/yyyy');
  }
  return '';
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
    switch (status.toLowerCase()) {
        case 'paid': return 'green-darken-2';
        case 'pending': return 'orange-darken-2';
        case 'overdue': return 'red-darken-2';
        case 'quote': return 'blue-darken-1';
        case 'draft': return 'grey-darken-1';
        default: return 'grey';
    }
};

const escapeCSV = (str) => {
  if (str === null || str === undefined) {
    return '';
  }
  let result = String(str);
  // Escape quotes and wrap in quotes if it contains commas, quotes, or newlines
  if (result.includes(',') || result.includes('"') || result.includes('\n')) {
    result = '"' + result.replace(/"/g, '""') + '"';
  }
  return result;
};

const exportToCSV = () => {
  const headers = [
    'Invoice #', 'Client', 'Issue Date', 'Due Date', 'Invoice Total', 'Invoice Status',
    'Item Description', 'Item Quantity', 'Item Unit Price', 'Item Line Total'
  ];

  const csvRows = [];
  csvRows.push(headers.join(','));

  processedInvoices.value.forEach(invoice => {
    const commonData = [
      escapeCSV(invoice.invoiceNumber),
      escapeCSV(invoice.client?.name),
      escapeCSV(formatDateForCSV(invoice.issueDate)),
      escapeCSV(formatDateForCSV(invoice.dueDate)),
      escapeCSV(invoice.total || 0),
      escapeCSV(invoice.status),
    ];

    if (invoice.items && invoice.items.length > 0) {
      invoice.items.forEach(item => {
        const itemData = [
          escapeCSV(item.description),
          escapeCSV(item.quantity || 0),
          escapeCSV(item.price || 0),
          escapeCSV((item.quantity || 0) * (item.price || 0))
        ];
        csvRows.push([...commonData, ...itemData].join(','));
      });
    } else {
      // For invoices with no items, add empty item fields
      csvRows.push([...commonData, '', '', '', ''].join(','));
    }
  });

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', 'invoices.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

</script>

<template>
  <v-card class="invoice-table-card">
    <v-data-table
      :headers="headers"
      :items="processedInvoices"
      item-key="id"
      class="elevation-1 invoice-data-table"
      :sort-by="[{ key: 'invoiceNumber', order: 'desc' }]"
    >
      <template v-slot:top>
        <v-toolbar flat>
            <v-toolbar-title>Invoices</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="exportToCSV">Export to CSV</v-btn>
        </v-toolbar>
      </template>
      <template v-slot:item.issueDate="{ item }">
        {{ formatDate(item.issueDate) }}
      </template>
      <template v-slot:item.dueDate="{ item }">
        {{ formatDate(item.dueDate) }}
      </template>
      <template v-slot:item.total="{ item }">
        {{ formatCurrency(item.total) }}
      </template>
      <template v-slot:item.statusSortKey="{ item }">
        <v-chip :color="getStatusColor(item.status)" size="small" text-color="white">
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
