<template>
  <v-row>
    <v-col cols="12" sm="6" md="3">
      <v-card class="stat-card text-center" color="blue-lighten-4">
        <v-card-text>
          <p class="text-caption mb-1">Total Outstanding</p>
          <p class="text-h4 font-weight-bold mb-2">${{ outstandingTotal.toFixed(2) }}</p>
          <v-icon size="36" color="blue-darken-2">mdi-cash-clock</v-icon>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" sm="6" md="3">
      <v-card class="stat-card text-center" color="red-lighten-4">
        <v-card-text>
          <p class="text-caption mb-1">Total Overdue</p>
          <p class="text-h4 font-weight-bold mb-2">${{ overdueTotal.toFixed(2) }}</p>
          <v-icon size="36" color="red-darken-2">mdi-alert-circle-outline</v-icon>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" sm="6" md="3">
      <v-card class="stat-card text-center" color="green-lighten-4">
        <v-card-text>
          <p class="text-caption mb-1">Total Paid</p>
          <p class="text-h4 font-weight-bold mb-2">${{ paidTotal.toFixed(2) }}</p>
          <v-icon size="36" color="green-darken-2">mdi-check-circle-outline</v-icon>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" sm="6" md="3">
      <v-card class="stat-card text-center" color="purple-lighten-4">
        <v-card-text>
          <p class="text-caption mb-1">Total Invoices</p>
          <p class="text-h4 font-weight-bold mb-2">{{ invoices.length }}</p>
          <v-icon size="36" color="purple-darken-2">mdi-file-document-outline</v-icon>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  invoices: {
    type: Array,
    required: true,
    default: () => []
  }
});

const calculateTotalByStatus = (status) => {
  return props.invoices
    .filter(inv => inv.status === status)
    .reduce((sum, inv) => sum + (inv.total || 0), 0);
};

const outstandingTotal = computed(() => {
    return props.invoices
        .filter(inv => inv.status === 'pending' || inv.status === 'draft' || inv.status === 'overdue')
        .reduce((sum, inv) => sum + (inv.total || 0), 0);
});

const overdueTotal = computed(() => calculateTotalByStatus('overdue'));

const paidTotal = computed(() => calculateTotalByStatus('paid'));

</script>

<style scoped>
.stat-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05) !important;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.1) !important;
}

.text-caption {
    color: #555;
    font-weight: 500;
}

.text-h4 {
    color: #1E293B;
}
</style>
