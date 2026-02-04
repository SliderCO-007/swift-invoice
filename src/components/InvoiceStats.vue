
<template>
  <v-row>
    <v-col cols="12" sm="6" md="3">
      <v-card class="stat-card" color="blue-lighten-4">
        <v-card-text>
          <div class="d-flex justify-space-between align-center">
            <div>
              <p class="text-caption mb-0">Total Outstanding</p>
              <p class="text-h4 font-weight-bold">${{ outstandingTotal.toFixed(2) }}</p>
            </div>
            <v-icon size="40" color="blue-darken-2">mdi-cash-clock</v-icon>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" sm="6" md="3">
      <v-card class="stat-card" color="red-lighten-4">
        <v-card-text>
          <div class="d-flex justify-space-between align-center">
            <div>
              <p class="text-caption mb-0">Total Overdue</p>
              <p class="text-h4 font-weight-bold">${{ overdueTotal.toFixed(2) }}</p>
            </div>
            <v-icon size="40" color="red-darken-2">mdi-alert-circle-outline</v-icon>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" sm="6" md="3">
      <v-card class="stat-card" color="green-lighten-4">
        <v-card-text>
          <div class="d-flex justify-space-between align-center">
            <div>
              <p class="text-caption mb-0">Total Paid</p>
              <p class="text-h4 font-weight-bold">${{ paidTotal.toFixed(2) }}</p>
            </div>
            <v-icon size="40" color="green-darken-2">mdi-check-circle-outline</v-icon>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" sm="6" md="3">
      <v-card class="stat-card" color="purple-lighten-4">
        <v-card-text>
          <div class="d-flex justify-space-between align-center">
            <div>
              <p class="text-caption mb-0">Total Invoices</p>
              <p class="text-h4 font-weight-bold">{{ invoices.length }}</p>
            </div>
             <v-icon size="40" color="purple-darken-2">mdi-file-document-outline</v-icon>
          </div>
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
