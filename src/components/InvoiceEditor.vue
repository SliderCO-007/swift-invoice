<template>
  <v-container fluid>
    <v-row>
      <!-- Editor Form -->
      <v-col cols="12" md="6">
        <v-card class="pa-4">
          <v-card-title class="text-h5 font-weight-bold mb-4">Create Invoice</v-card-title>
          <v-form @submit.prevent="saveInvoice">
            <!-- Client Information -->
            <h3 class="text-h6 font-weight-bold mb-2">Bill To:</h3>
            <v-text-field v-model="invoice.client.name" label="Client Name" variant="outlined" class="mb-2"></v-text-field>
            <v-textarea v-model="invoice.client.address" label="Client Address" variant="outlined" class="mb-2"></v-textarea>
            <v-text-field v-model="invoice.client.email" label="Client Email" variant="outlined" class="mb-4"></v-text-field>

            <!-- Invoice Details -->
            <h3 class="text-h6 font-weight-bold mb-2">Invoice Details:</h3>
            <v-row>
              <v-col><v-text-field v-model="invoice.invoiceNumber" label="Invoice #" variant="outlined"></v-text-field></v-col>
              <v-col><v-text-field v-model="invoice.dateIssued" label="Date Issued" type="date" variant="outlined"></v-text-field></v-col>
              <v-col><v-text-field v-model="invoice.dateDue" label="Date Due" type="date" variant="outlined"></v-text-field></v-col>
            </v-row>
            
            <!-- Line Items -->
            <h3 class="text-h6 font-weight-bold mt-4 mb-2">Items:</h3>
            <div v-for="(item, index) in invoice.items" :key="index" class="d-flex align-center mb-2">
              <v-text-field v-model="item.description" label="Description" variant="outlined" class="mr-2"></v-text-field>
              <v-text-field v-model.number="item.quantity" label="Qty" type="number" variant="outlined" style="max-width: 80px;" class="mr-2"></v-text-field>
              <v-text-field v-model.number="item.price" label="Price" type="number" variant="outlined" style="max-width: 120px;" class="mr-2"></v-text-field>
              <v-btn icon="mdi-delete" variant="text" color="red" @click="removeItem(index)"></v-btn>
            </div>
            <v-btn color="primary" @click="addItem">Add Item</v-btn>

            <!-- Notes and Tax -->
            <h3 class="text-h6 font-weight-bold mt-4 mb-2">Notes & Tax:</h3>
            <v-textarea v-model="invoice.notes" label="Notes" variant="outlined" class="mb-2"></v-textarea>
            <v-text-field v-model.number="invoice.taxRate" label="Tax Rate (%)" type="number" variant="outlined" style="max-width: 150px;"></v-text-field>

            <v-btn color="primary" size="large" class="mt-4" type="submit" :loading="isSaving">Save Invoice</v-btn>
          </v-form>
        </v-card>
      </v-col>

      <!-- Live Preview -->
      <v-col cols="12" md="6">
        <h3 class="text-h6 font-weight-bold mb-2">Live Preview</h3>
        <InvoiceTemplate :invoice="invoice" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import useUserSettings from '../composables/useUserSettings';
import useInvoices from '../composables/useInvoices';
import InvoiceTemplate from './InvoiceTemplate.vue';

const { settings, fetchUserSettings } = useUserSettings();
const { addInvoice } = useInvoices();
const router = useRouter();

const isSaving = ref(false);

const invoice = ref({
  sender: {
    companyName: '',
    address: '',
    phoneNumber: '',
    logoUrl: ''
  },
  client: {
    name: '',
    address: '',
    email: ''
  },
  invoiceNumber: `INV-${Date.now().toString().slice(-4)}`,
  dateIssued: new Date().toISOString().substr(0, 10),
  dateDue: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().substr(0, 10),
  items: [
    { description: '', quantity: 1, price: 0 },
  ],
  taxRate: 0,
  notes: 'Thank you for your business!',
  status: 'Draft' // Default status
});

onMounted(async () => {
  await fetchUserSettings();
  if (settings.value) {
    invoice.value.sender = { ...settings.value };
  }
});

const addItem = () => {
  invoice.value.items.push({ description: '', quantity: 1, price: 0 });
};

const removeItem = (index) => {
  invoice.value.items.splice(index, 1);
};

const saveInvoice = async () => {
  isSaving.value = true;
  await addInvoice(invoice.value);
  isSaving.value = false;
  router.push('/invoices');
};

</script>
