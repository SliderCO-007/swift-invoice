<script setup>
import { computed } from 'vue';
import useInvoices from '../composables/useInvoices';

import useUserSettings from '../composables/useUserSettings';

// --- Composables ---
const { invoices } = useInvoices();
const { settings } = useUserSettings();

// --- Helpers ---
const formatCurrency = (value) => new Intl.NumberFormat(undefined, { style: 'currency', currency: settings.value?.currency || 'USD' }).format(value || 0);

// --- Computed Properties ---
// Adding .toLowerCase() to all status checks to handle data inconsistencies like 'Paid' vs 'paid'.

const paidTotal = computed(() =>
  invoices.value
    .filter(i => i.status && i.status.toLowerCase() === 'paid')
    .reduce((sum, i) => sum + (i.total || 0), 0)
);

const overdueTotal = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    return invoices.value
        .filter(i => {
            const status = i.status ? i.status.toLowerCase() : '';
            const dueDate = i.dueDate && typeof i.dueDate.toDate === 'function' ? i.dueDate.toDate() : new Date(i.dueDate);
            return status === 'overdue' || (status === 'pending' && dueDate < today);
        })
        .reduce((sum, i) => sum + (i.total || 0), 0);
});

const outstandingTotal = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    return invoices.value
        .filter(i => {
            const status = i.status ? i.status.toLowerCase() : '';
            const dueDate = i.dueDate && typeof i.dueDate.toDate === 'function' ? i.dueDate.toDate() : new Date(i.dueDate);
            return status === 'pending' && dueDate >= today;
        })
        .reduce((sum, i) => sum + (i.total || 0), 0);
});

const totalInvoicesCount = computed(() => 
    invoices.value.filter(i => i.status && i.status.toLowerCase() !== 'estimate').length
);


const stats = computed(() => [
  { 
    title: 'Total Outstanding', 
    value: formatCurrency(outstandingTotal.value), 
    icon: 'mdi-cash-clock', 
    color: '#E3F2FD',
    iconColor: '#2196F3'
  },
  { 
    title: 'Total Overdue', 
    value: formatCurrency(overdueTotal.value), 
    icon: 'mdi-alert-circle-outline', 
    color: '#FFEBEE',
    iconColor: '#F44336'
  },
  { 
    title: 'Total Paid', 
    value: formatCurrency(paidTotal.value), 
    icon: 'mdi-check-circle-outline', 
    color: '#E8F5E9',
    iconColor: '#4CAF50'
  },
  { 
    title: 'Total Invoices', 
    value: totalInvoicesCount.value, 
    icon: 'mdi-file-document-outline', 
    color: '#F3E5F5',
    iconColor: '#9C27B0'
  }
]);
</script>

<template>
  <v-row>
    <v-col
      v-for="stat in stats"
      :key="stat.title"
      cols="12"
      sm="6"
      md="3"
    >
      <v-card class="stat-card" :color="stat.color" flat>
        <v-card-text class="text-center">
          <p class="stat-title">{{ stat.title }}</p>
          <p class="stat-value">{{ stat.value }}</p>
          <v-icon class="stat-icon" :icon="stat.icon" :color="stat.iconColor" size="x-large"></v-icon>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<style scoped>
.stat-card {
  border-radius: 16px !important;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  padding-top: 1rem;
  padding-bottom: 0.5rem;
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.stat-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: #555;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2.2rem;
  font-weight: 700;
  color: #1E293B;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.stat-icon {
  opacity: 0.9;
}
</style>
