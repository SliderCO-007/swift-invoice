<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { format, isValid, isBefore, startOfToday } from 'date-fns';
import useUserSettings from '../composables/useUserSettings';

const props = defineProps({
  invoices: {
    type: Array,
    required: true,
  },
});

const { settings } = useUserSettings();

const emit = defineEmits(['delete-invoice', 'edit-invoice']);

const router = useRouter();

const statusOrder = {
  'Overdue': 1,
  'Pending': 2,
  'Estimate': 3,
  'Paid': 4,
  'Draft': 5,
};

const headers = [
  { title: 'Invoice #', key: 'invoiceNumber', sortable: true },
  { title: 'Client', key: 'client.name', sortable: true },
  { title: 'Issue Date', key: 'createdAt', sortable: true },
  { title: 'Due Date', key: 'dueDate', sortable: true },
  { title: 'Total', key: 'total', sortable: true },
  { title: 'Status', key: 'statusSortKey', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
];

const getInvoiceStatus = (invoice) => {
  if (invoice.status.toLowerCase() === 'paid') return 'Paid';
  const dueDate = invoice.dueDate?.toDate ? invoice.dueDate.toDate() : new Date(invoice.dueDate);
  if (isValid(dueDate) && isBefore(dueDate, startOfToday())) return 'Overdue';
  return invoice.status || 'Pending';
};

const processedInvoices = computed(() => props.invoices.map(invoice => {
  const status = getInvoiceStatus(invoice);
  return {
    ...invoice,
    status: status,
    statusSortKey: statusOrder[status] || 99,
  };
}));

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return isValid(date) ? format(date, 'MMM d, yyyy') : 'N/A';
};

const formatCurrency = (value) => new Intl.NumberFormat(undefined, { style: 'currency', currency: settings.value.currency || 'USD' }).format(value || 0);

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'paid': return 'green-darken-2';
    case 'pending': return 'orange-darken-2';
    case 'overdue': return 'red-darken-2';
    case 'estimate': return 'blue-darken-1';
    case 'draft': return 'grey-darken-1';
    default: return 'grey';
  }
};

const escapeCSV = (str) => {
  if (str === null || str === undefined) return '';
  let result = String(str);
  if (result.includes(',') || result.includes('"') || result.includes('\n')) {
    result = '"' + result.replace(/"/g, '""') + '"';
  }
  return result;
};

const exportToCSV = () => {
  const csvHeaders = [
    'Invoice #', 'Client', 'Issue Date', 'Due Date', 'Invoice Total', 'Invoice Status',
    'Item Description', 'Item Quantity', 'Item Unit Price', 'Item Line Total'
  ];
  const csvRows = [csvHeaders.join(',')];

  processedInvoices.value.forEach(invoice => {
    const commonData = [
      escapeCSV(invoice.invoiceNumber), escapeCSV(invoice.client?.name),
      escapeCSV(formatDate(invoice.createdAt)), escapeCSV(formatDate(invoice.dueDate)),
      escapeCSV(invoice.total || 0), escapeCSV(invoice.status),
    ];
    if (invoice.items && invoice.items.length > 0) {
      invoice.items.forEach(item => {
        const itemData = [
          escapeCSV(item.description), escapeCSV(item.quantity || 0),
          escapeCSV(item.price || 0), escapeCSV((item.quantity || 0) * (item.price || 0))
        ];
        csvRows.push([...commonData, ...itemData].join(','));
      });
    } else {
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
      :sort-by="[{ key: 'createdAt', order: 'desc' }]"
    >
      <template v-slot:top>
        <v-toolbar flat>
            <v-toolbar-title>Invoices</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="exportToCSV">Export to CSV</v-btn>
        </v-toolbar>
      </template>
      <template v-slot:item.createdAt="{ item }">
        {{ formatDate(item.createdAt) }}
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
            <v-btn size="small" color="primary" @click="$emit('edit-invoice', item.id)" class="mr-2">
                View
            </v-btn>
            <v-btn variant="plain" size="small" @click="$emit('delete-invoice', item.id)" title="Delete Invoice">
              <v-icon color="red-lighten-1">mdi-delete</v-icon>
            </v-btn>
        </div>
      </template>
    </v-data-table>
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
