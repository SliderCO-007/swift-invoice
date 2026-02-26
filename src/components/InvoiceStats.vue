<script setup>
import { computed } from 'vue';
import useInvoices from '../composables/useInvoices';

const { invoices } = useInvoices();

const outstandingTotal = computed(() => {
  return invoices.value
    .filter(i => i.status === 'pending' || i.status === 'overdue')
    .reduce((total, i) => total + i.total, 0);
});

const overdueTotal = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return invoices.value
        .filter(i => {
            const dueDate = i.dueDate && typeof i.dueDate.toDate === 'function' ? i.dueDate.toDate() : new Date(i.dueDate);
            return (i.status === 'pending' || i.status === 'overdue') && dueDate < today;
        })
        .reduce((total, i) => total + i.total, 0);
});


const paidTotal = computed(() => {
  return invoices.value
    .filter(i => i.status === 'paid')
    .reduce((total, i) => total + i.total, 0);
});

</script>

<template>
  <v-row>
    <v-col cols="12" sm="6" lg="3">
      <v-card class="stat-card text-center" color="blue-lighten-4">
        <v-card-text>
          <p class="text-caption mb-1 stat-title">Total Outstanding</p>
          <p class="text-h6 font-weight-bold mb-2 stat-value">${{ outstandingTotal.toFixed(2) }}</p>
          <v-icon size="36" color="blue-darken-2">mdi-cash-clock</v-icon>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" sm="6" lg="3">
      <v-card class="stat-card text-center" color="red-lighten-4">
        <v-card-text>
          <p class="text-caption mb-1 stat-title">Total Overdue</p>
          <p class="text-h6 font-weight-bold mb-2 stat-value">${{ overdueTotal.toFixed(2) }}</p>
          <v-icon size="36" color="red-darken-2">mdi-alert-circle-outline</v-icon>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" sm="6" lg="3">
      <v-card class="stat-card text-center" color="green-lighten-4">
        <v-card-text>
          <p class="text-caption mb-1 stat-title">Total Paid</p>
          <p class="text-h6 font-weight-bold mb-2 stat-value">${{ paidTotal.toFixed(2) }}</p>
          <v-icon size="36" color="green-darken-2">mdi-check-circle-outline</v-icon>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" sm="6" lg="3">
      <v-card class="stat-card text-center" color="purple-lighten-4">
        <v-card-text>
          <p class="text-caption mb-1 stat-title">Total Invoices</p>
          <p class="text-h6 font-weight-bold mb-2 stat-value">{{ invoices.length }}</p>
          <v-icon size="36" color="purple-darken-2">mdi-file-document-outline</v-icon>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<style scoped>
.stat-card {
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  height: 100%; /* Ensure cards are the same height */
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}
.stat-title, .stat-value {
  white-space: nowrap;
}
</style>
