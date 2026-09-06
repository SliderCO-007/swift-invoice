<script setup>
import { computed, ref } from 'vue';
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

const expandedRows = ref([]);

const toggleRow = (id) => {
  const index = expandedRows.value.indexOf(id);
  if (index > -1) {
    expandedRows.value.splice(index, 1);
  } else {
    expandedRows.value.push(id);
  }
};

const statusOrder = {
  'Overdue': 1,
  'Pending': 2,
  'Estimate': 3,
  'Paid': 4,
  'Draft': 5,
};

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

const sortedInvoices = computed(() => {
  return [...processedInvoices.value].sort((a, b) => {
    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
    return dateB - dateA; // Newest first
  });
});

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return isValid(date) ? format(date, 'MMM d, yyyy') : 'N/A';
};

const formatCurrency = (value) => new Intl.NumberFormat(undefined, { style: 'currency', currency: settings.value.currency || 'USD' }).format(value || 0);

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'paid': return 'green-darken-2';
    case 'payment_processing': return 'indigo-darken-1';
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
  <div class="invoice-list-container" v-if="invoices && invoices.length">
    <!-- Desktop Table View -->
    <div class="desktop-view d-none d-sm-block">
      <div class="table-header-row mb-3">
        <h3>Invoices</h3>
        <v-btn color="primary" variant="flat" size="small" @click="exportToCSV" rounded="lg">
          <v-icon start class="mr-1">mdi-export</v-icon>
          Export CSV
        </v-btn>
      </div>
      <div class="desktop-table-wrapper">
        <table class="custom-desktop-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Client</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Total</th>
              <th>Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="invoice in sortedInvoices" :key="invoice.id">
              <td class="font-weight-bold font-mono">#{{ invoice.invoiceNumber }}</td>
              <td>{{ invoice.client?.name || 'N/A' }}</td>
              <td>{{ formatDate(invoice.createdAt) }}</td>
              <td>{{ formatDate(invoice.dueDate) }}</td>
              <td class="font-weight-bold">{{ formatCurrency(invoice.total) }}</td>
              <td>
                <v-chip :color="getStatusColor(invoice.status)" size="small" text-color="white" label class="text-capitalize font-weight-medium">
                  {{ invoice.status }}
                </v-chip>
              </td>
              <td class="text-right">
                <div class="d-flex justify-end align-center">
                  <v-btn size="small" color="primary" variant="flat" @click="$emit('edit-invoice', invoice.id)" class="mr-2 rounded-lg text-capitalize">
                    Edit
                  </v-btn>
                  <v-btn variant="plain" icon size="small" @click="$emit('delete-invoice', invoice.id)" title="Delete Invoice" class="delete-btn">
                    <v-icon color="red-lighten-1">mdi-delete</v-icon>
                  </v-btn>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mobile Accordion View -->
    <div class="mobile-view d-block d-sm-none">
      <div class="table-header-row mb-4">
        <h3>Invoices</h3>
        <v-btn color="primary" variant="outlined" size="small" @click="exportToCSV" rounded="lg">
          <v-icon start class="mr-1">mdi-export</v-icon>
          Export CSV
        </v-btn>
      </div>

      <div class="accordion-list">
        <div 
          v-for="invoice in sortedInvoices" 
          :key="invoice.id" 
          class="accordion-item"
          :class="{ 'item-expanded': expandedRows.includes(invoice.id) }"
          @click="toggleRow(invoice.id)"
        >
          <!-- Compact Header Row (Always Visible) -->
          <div class="accordion-header d-flex justify-space-between align-center py-4 px-4">
            <div class="header-left">
              <span class="client-name font-weight-bold d-block">{{ invoice.client?.name || 'N/A' }}</span>
              <span class="invoice-num text-grey-lighten-1 font-mono">#{{ invoice.invoiceNumber }}</span>
            </div>
            <div class="header-right d-flex align-center ga-3">
              <span class="invoice-total font-weight-bold">{{ formatCurrency(invoice.total) }}</span>
              <v-chip :color="getStatusColor(invoice.status)" size="x-small" label class="text-capitalize">
                {{ invoice.status }}
              </v-chip>
              <v-icon size="small" class="chevron-icon" :class="{ 'chevron-rotated': expandedRows.includes(invoice.id) }">
                mdi-chevron-down
              </v-icon>
            </div>
          </div>

          <!-- Expanded Content Block -->
          <v-expand-transition>
            <div v-show="expandedRows.includes(invoice.id)" class="accordion-body px-4 pb-4 pt-1" @click.stop>
              <v-divider class="mb-3 border-opacity-25" color="white"></v-divider>
              <div class="detail-grid mb-4">
                <div class="detail-field">
                  <span class="detail-label">Issue Date</span>
                  <span class="detail-value">{{ formatDate(invoice.createdAt) }}</span>
                </div>
                <div class="detail-field">
                  <span class="detail-label">Due Date</span>
                  <span class="detail-value font-weight-bold">{{ formatDate(invoice.dueDate) }}</span>
                </div>
              </div>
              <div class="action-buttons d-flex justify-end ga-2">
                <v-btn size="small" color="primary" variant="flat" class="text-capitalize rounded-lg" @click="$emit('edit-invoice', invoice.id)">
                  View / Edit
                </v-btn>
                <v-btn size="small" color="red-lighten-1" variant="outlined" class="text-capitalize rounded-lg" @click="$emit('delete-invoice', invoice.id)">
                  Delete
                </v-btn>
              </div>
            </div>
          </v-expand-transition>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.invoice-list-container {
  margin-top: 1rem;
}

.table-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0.25rem;
}

.table-header-row h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

/* Desktop Styles */
.desktop-table-wrapper {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
  backdrop-filter: blur(16px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

.custom-desktop-table {
  width: 100%;
  border-collapse: collapse;
}

.custom-desktop-table th {
  background: rgba(255, 255, 255, 0.04);
  padding: 1rem 1.25rem;
  text-align: left;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #94a3b8;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  letter-spacing: 0.5px;
}

.custom-desktop-table td {
  padding: 1rem 1.25rem;
  font-size: 0.92rem;
  color: #f1f5f9;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.custom-desktop-table tr:last-child td {
  border-bottom: none;
}

.custom-desktop-table tr:hover td {
  background: rgba(255, 255, 255, 0.02);
}

.font-mono {
  font-family: monospace;
}

.delete-btn {
  opacity: 0.7;
  transition: opacity 0.2s;
}

.delete-btn:hover {
  opacity: 1;
}

/* Mobile Accordion Styles */
.accordion-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.accordion-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
  backdrop-filter: blur(16px);
  transition: background-color 0.25s, border-color 0.25s, transform 0.2s;
  cursor: pointer;
}

.accordion-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.12);
}

.accordion-header {
  user-select: none;
}

.client-name {
  font-size: 0.95rem;
  color: #fff;
  letter-spacing: -0.2px;
}

.invoice-num {
  font-size: 0.78rem;
  opacity: 0.8;
}

.invoice-total {
  font-size: 0.95rem;
  color: #fff;
}

.chevron-icon {
  color: #94a3b8;
  transition: transform 0.25s ease;
}

.chevron-rotated {
  transform: rotate(180deg);
}

.item-expanded {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.15);
}

.accordion-body {
  cursor: default;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.detail-field {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.detail-label {
  font-size: 0.7rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 0.88rem;
  color: #f1f5f9;
}

.ga-2 {
  gap: 0.5rem;
}
.ga-3 {
  gap: 0.75rem;
}
</style>
