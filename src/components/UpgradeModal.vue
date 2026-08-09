<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="540" persistent>
    <v-card rounded="xl" class="pa-6 text-center limit-modal-card">
      <div class="d-flex justify-center mb-4">
        <v-avatar color="amber-lighten-5" size="64" class="crown-avatar">
          <v-icon icon="mdi-crown-outline" color="amber-darken-3" size="36"></v-icon>
        </v-avatar>
      </div>

      <h2 class="text-h5 font-weight-bold text-slate-900 mb-2">Free Invoice Limit Reached</h2>

      <p class="text-body-1 text-grey-darken-1 mb-5">
        You’ve created <strong>3 invoices this month</strong>, which is the maximum allowed on the Free Starter plan. Your 3 free invoices will automatically reset on the 1st of next month, or you can upgrade to Pro today for unlimited invoicing!
      </p>

      <v-card variant="tonal" color="primary" class="pa-4 mb-6 text-left rounded-lg feature-highlights-card">
        <div class="d-flex align-center mb-2">
          <v-icon color="primary" class="mr-2" size="small">mdi-check-circle</v-icon>
          <span class="text-body-2 font-weight-medium text-slate-800">Unlimited Monthly Invoices & Receipts</span>
        </div>
        <div class="d-flex align-center mb-2">
          <v-icon color="primary" class="mr-2" size="small">mdi-check-circle</v-icon>
          <span class="text-body-2 font-weight-medium text-slate-800">Direct Email & Text-2-Pay SMS Delivery</span>
        </div>
        <div class="d-flex align-center mb-2">
          <v-icon color="primary" class="mr-2" size="small">mdi-check-circle</v-icon>
          <span class="text-body-2 font-weight-medium text-slate-800">Reduced 0.25% ScanGo Fee</span>
        </div>
        <div class="d-flex align-center">
          <v-icon color="primary" class="mr-2" size="small">mdi-check-circle</v-icon>
          <span class="text-body-2 font-weight-medium text-slate-800">Expense Photo Scanning & Custom Branding</span>
        </div>
      </v-card>

      <div class="d-flex flex-column flex-sm-row gap-3 justify-center">
        <v-btn
          color="primary"
          size="large"
          rounded="pill"
          class="font-weight-bold px-6 text-none"
          elevation="2"
          to="/pricing"
          @click="$emit('update:modelValue', false)"
        >
          <v-icon start class="mr-1">mdi-rocket-launch</v-icon>
          Upgrade to Pro ($9/mo)
        </v-btn>
        <v-btn
          variant="text"
          size="large"
          rounded="pill"
          color="grey-darken-1"
          class="text-none"
          @click="$emit('update:modelValue', false)"
        >
          Close
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.limit-modal-card {
  background: #ffffff;
}
.crown-avatar {
  border: 2px solid #fef3c7;
}
.feature-highlights-card {
  background-color: rgba(26, 58, 82, 0.04) !important;
  border: 1px solid rgba(26, 58, 82, 0.12) !important;
}
.gap-3 {
  gap: 12px;
}
</style>
