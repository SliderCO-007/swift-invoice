<script setup>
defineProps({ receiptUrl: { type: String, default: '' } });
const emit = defineEmits(['update:modelValue']);
defineOptions({ inheritAttrs: false });
</script>

<template>
  <v-dialog
    :model-value="$attrs['modelValue']"
    @update:model-value="emit('update:modelValue', $event)"
    max-width="90vw"
    max-height="90vh"
  >
    <v-card style="background:#0d1929; border-radius:12px; overflow:hidden;">
      <v-toolbar density="compact" color="transparent" style="border-bottom:1px solid rgba(255,255,255,0.08);">
        <v-toolbar-title style="color:#f1f5f9; font-size:0.95rem;">Receipt</v-toolbar-title>
        <v-spacer />
        <v-btn
          :href="receiptUrl"
          target="_blank"
          download
          icon
          variant="text"
          color="white"
          title="Download"
        >
          <v-icon icon="mdi-download" />
        </v-btn>
        <v-btn icon variant="text" color="white" @click="emit('update:modelValue', false)">
          <v-icon icon="mdi-close" />
        </v-btn>
      </v-toolbar>
      <div class="viewer-body">
        <img v-if="receiptUrl" :src="receiptUrl" alt="Receipt" class="receipt-img" />
        <p v-else style="color:#94a3b8; padding:2rem;">No receipt available.</p>
      </div>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.viewer-body {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
  max-height: 80vh;
  overflow: auto;
}
.receipt-img {
  max-width: 100%;
  max-height: 75vh;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
}
</style>
