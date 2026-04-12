<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import useUserSettings from '../composables/useUserSettings';
import useInvoices from '../composables/useInvoices';
import { useCustomers } from '../composables/useCustomers';
import { useItems } from '../composables/useItems';
import { currentUser as user } from '../composables/useAuth.js';
import InvoiceTemplate from './InvoiceTemplate.vue';
import InvoiceTemplate2 from './InvoiceTemplate2.vue';
import InvoiceTemplate3 from './InvoiceTemplate3.vue';
import InvoiceTemplate4 from './InvoiceTemplate4.vue';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

// --- Composables ---
const { settings, fetchUserSettings } = useUserSettings();
const { createInvoice, getInvoice, updateInvoice } = useInvoices();
const { customers } = useCustomers(); // Automatically fetches and updates based on auth
const { items, fetchItems, stopFetching: stopFetchingItems } = useItems();
const router = useRouter();
const route = useRoute();

// --- Component State ---
const invoiceId = ref(route.params.id);
const invoice = ref(createFreshInvoice());
const selectedCustomer = ref(null);
const showPreview = ref(false);
const isProcessing = ref(false);
const saveError = ref(null);

// --- Utility Functions ---
function createFreshInvoice() {
  return {
    invoiceNumber: '',
    status: 'pending',
    sender: { name: '', address1: '', address2: '', city: '', state: '', zip: '', email: '' },
    client: { name: '', address1: '', address2: '', city: '', state: '', zip: '', email: '', phone: '' },
    items: [],
    issueDate: new Date(),
    dueDate: new Date(),
    notes: 'Thank you for your business!',
    taxRate: 0,
    includeVenmoQr: false,
    style: 'classic',
    primaryColor: '#1a3a52',
  };
}

// --- Computed Properties ---
const formattedIssueDate = computed({
  get: () => invoice.value.issueDate ? format(new Date(invoice.value.issueDate), 'yyyy-MM-dd', { locale: enUS }) : '',
  set: (val) => { invoice.value.issueDate = val ? new Date(val.replace(/-/g, '/')) : null; },
});

const formattedDueDate = computed({
  get: () => invoice.value.dueDate ? format(new Date(invoice.value.dueDate), 'yyyy-MM-dd', { locale: enUS }) : '',
  set: (val) => { invoice.value.dueDate = val ? new Date(val.replace(/-/g, '/')) : null; },
});

const subtotal = computed(() => (invoice.value.items || []).reduce((acc, item) => acc + (item.quantity || 0) * (item.price || 0), 0));
const taxAmount = computed(() => subtotal.value * ((Number(invoice.value.taxRate) || 0) / 100));
const total = computed(() => subtotal.value + taxAmount.value);
const itemDescriptions = computed(() => items.value.map(i => i.description));

// --- Methods ---
const addItem = () => invoice.value.items.push({ description: '', quantity: 1, price: 0 });
const removeItem = (index) => invoice.value.items.splice(index, 1);

const saveInvoice = async () => {
  isProcessing.value = true;
  saveError.value = null;
  if (!user.value?.uid) {
    saveError.value = "Authentication error. Please log in again.";
    isProcessing.value = false;
    return;
  }

  const invoiceData = { ...invoice.value, subtotal: subtotal.value, taxAmount: taxAmount.value, total: total.value };

  try {
    const finalInvoiceId = invoiceId.value === 'new' 
      ? await createInvoice(invoiceData, user.value.uid) 
      : (await updateInvoice(invoiceId.value, invoiceData, user.value.uid), invoiceId.value);
      
    router.push({ name: 'InvoiceView', params: { id: finalInvoiceId } });
  } catch (error) {
    console.error("Failed to save invoice:", error);
    saveError.value = error.message || 'An unexpected error occurred.';
  } finally {
    isProcessing.value = false;
  }
};

const handleDescriptionUpdate = (item, newDescription) => {
  item.description = newDescription || '';
  const foundItem = items.value.find(i => i.description === newDescription);
  if (foundItem) item.price = foundItem.price;
};

// --- Initialization Logic ---
const initializeInvoice = async () => {
  const id = route.params.id;
  await fetchUserSettings();
  fetchItems(); // Manually fetch items for the current user

  if (id && id !== 'new') {
    // EDIT MODE
    invoiceId.value = id;
    const existingInvoice = await getInvoice(id);
    if (existingInvoice) {
      invoice.value = existingInvoice;
      // Ensure Firestore Timestamps are converted to JS Date objects
      if (invoice.value.issueDate?.toDate) invoice.value.issueDate = invoice.value.issueDate.toDate();
      if (invoice.value.dueDate?.toDate) invoice.value.dueDate = invoice.value.dueDate.toDate();
    }
  } else {
    // NEW INVOICE MODE
    invoiceId.value = 'new';
    invoice.value = createFreshInvoice(); // Start with a clean slate

    if (settings.value) {
      invoice.value.sender = { ...invoice.value.sender, ...(settings.value.company || {}) };
      invoice.value.taxRate = settings.value.taxRate || 0;
      invoice.value.notes = settings.value.defaultNotes || invoice.value.notes;
      invoice.value.style = settings.value.defaultStyle || invoice.value.style;
      invoice.value.primaryColor = settings.value.company?.primaryColor || '#1a3a52';
    }

    if (!invoice.value.items.length) {
      addItem(); // Always start with one item line
    }
  }
};

// --- Watchers & Lifecycle ---
watch(user, (newUser, oldUser) => {
  if (newUser) {
    initializeInvoice();
  } else if (oldUser && !newUser) {
    // More robustly handle logout
    if (route.name !== 'Home' && route.name !== 'Login') {
      router.push('/');
    }
  }
}, { immediate: true });

watch(selectedCustomer, (newCustomer) => {
  if (newCustomer) {
    invoice.value.client = { ...createFreshInvoice().client, ...newCustomer };
  } else {
    invoice.value.client = createFreshInvoice().client;
  }
});

onUnmounted(() => {
  stopFetchingItems(); // Clean up item listener when component is destroyed
});
</script>

<template>
  <div class="editor-container">
    <div class="editor-form-card">
      <header class="editor-header">
        <h1>{{ invoiceId === 'new' ? 'Create Invoice' : `Invoice #${invoice.invoiceNumber}` }}</h1>
        <v-btn :to="{ name: 'Dashboard' }" color="white" variant="flat" class="text-indigo-darken-4 font-weight-bold">Back to Dashboard</v-btn>
      </header>

      <div v-if="saveError" class="error-container">
        <v-alert type="error" dense outlined closable @click:close="saveError = null">{{ saveError }}</v-alert>
      </div>

      <div v-if="invoice" class="invoice-form-content">
        <div class="form-section responsive-grid">
          <div class="from-fields">
            <h3 class="mb-2">From</h3>
            <v-text-field density="comfortable" class="mb-2" label="Your Name/Company" v-model="invoice.sender.name" variant="solo"></v-text-field>
            <v-text-field density="comfortable" class="mb-2" label="Your Email" v-model="invoice.sender.email" variant="solo" type="email"></v-text-field>
            <v-text-field density="comfortable" class="mb-2" label="Address Line 1" v-model="invoice.sender.address1" variant="solo"></v-text-field>
            <v-text-field density="comfortable" class="mb-2" label="Address Line 2 (Optional)" v-model="invoice.sender.address2" variant="solo"></v-text-field>
            <div class="address-grid-city-state">
              <v-text-field density="comfortable" label="City" v-model="invoice.sender.city" variant="solo"></v-text-field>
              <v-text-field density="comfortable" label="State" v-model="invoice.sender.state" variant="solo"></v-text-field>
            </div>
            <v-text-field density="comfortable" label="Zip Code" v-model="invoice.sender.zip" variant="solo"></v-text-field>
          </div>
          <div>
            <h3 class="mb-2">To</h3>
            <v-autocomplete
              v-model="selectedCustomer"
              :items="customers"
              item-title="name"
              return-object
              label="Select a Customer"
              variant="solo"
              class="mb-4"
              clearable
            >
              <template v-slot:no-data>
                <v-list-item>
                  <v-list-item-title>No customers found. <router-link to="/customers">Add one?</router-link></v-list-item-title>
                </v-list-item>
              </template>
            </v-autocomplete>
            <v-text-field density="comfortable" class="mb-2" label="Client's Name" v-model="invoice.client.name" variant="solo" required></v-text-field>
            <v-text-field density="comfortable" class="mb-2" label="Client's Email" v-model="invoice.client.email" variant="solo" required type="email"></v-text-field>
            <v-text-field density="comfortable" class="mb-2" label="Client's Phone" v-model="invoice.client.phone" variant="solo"></v-text-field>
            <v-text-field density="comfortable" class="mb-2" label="Address Line 1" v-model="invoice.client.address1" variant="solo"></v-text-field>
            <v-text-field density="comfortable" class="mb-2" label="Address Line 2 (Optional)" v-model="invoice.client.address2" variant="solo"></v-text-field>
            <div class="address-grid-city-state">
              <v-text-field density="comfortable" label="City" v-model="invoice.client.city" variant="solo"></v-text-field>
              <v-text-field density="comfortable" label="State" v-model="invoice.client.state" variant="solo"></v-text-field>
            </div>
            <v-text-field density="comfortable" label="Zip Code" v-model="invoice.client.zip" variant="solo"></v-text-field>
          </div>
        </div>

        <div class="form-section responsive-grid">
          <div>
            <v-text-field label="Issue Date" type="date" v-model="formattedIssueDate" variant="solo" density="comfortable"></v-text-field>
          </div>
          <div>
            <v-text-field label="Due Date" type="date" v-model="formattedDueDate" variant="solo" density="comfortable"></v-text-field>
          </div>
        </div>

        <div class="form-section">
          <h3>Items</h3>
          <div v-for="(item, index) in invoice.items" :key="index" class="item-row">
            <v-row align="center">
              <v-col cols="12" md="6">
                <v-combobox v-model="item.description" :items="itemDescriptions" label="Select or type to add an item" variant="solo" density="comfortable" @update:model-value="(desc) => handleDescriptionUpdate(item, desc)" clearable>
                  <template v-slot:no-data><v-list-item><v-list-item-title>No items found. <router-link to="/items">Add one?</router-link></v-list-item-title></v-list-item></template>
                </v-combobox>
              </v-col>
              <v-col cols="6" md="2"><v-text-field type="number" label="Quantity" v-model.number="item.quantity" density="comfortable" variant="solo"></v-text-field></v-col>
              <v-col cols="6" md="2"><v-text-field type="number" label="Price" v-model.number="item.price" density="comfortable" variant="solo"></v-text-field></v-col>
              <v-col cols="12" md="2" class="d-flex align-center justify-center"><v-btn icon @click="removeItem(index)" variant="text" color="red-lighten-2"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/></svg></v-btn></v-col>
            </v-row>
          </div>
          <v-btn @click="addItem" color="primary" variant="tonal" class="mt-4" block>+ Add New Item</v-btn>
        </div>

        <div class="form-section responsive-grid">
          <div>
            <h3>Invoice Status</h3>
            <v-radio-group v-model="invoice.status" inline><v-radio label="Pending" value="pending"></v-radio><v-radio label="Quote" value="quote"></v-radio></v-radio-group>
          </div>
          <div>
            <h3>Invoice Style</h3>
            <v-radio-group v-model="invoice.style" inline><v-radio label="Classic" value="classic"></v-radio><v-radio label="Modern" value="modern"></v-radio><v-radio label="Corporate" value="corporate"></v-radio><v-radio label="Solid" value="solid"></v-radio></v-radio-group>
            
            <div v-if="invoice.style === 'corporate' || invoice.style === 'solid'" class="custom-color-picker mt-2">
              <label class="color-label">Theme Color</label>
              <div class="color-input-wrapper">
                <input type="color" v-model="invoice.primaryColor" class="color-picker" />
                <span class="color-hex">{{ invoice.primaryColor }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Payment Options</h3>
          <v-switch v-model="invoice.includeVenmoQr" label="Include QR Code" color="primary"></v-switch>
        </div>

        <div class="form-section responsive-grid">
          <div><v-textarea label="Notes" v-model="invoice.notes" variant="solo"></v-textarea></div>
          <div>
            <v-text-field label="Tax Rate (%)" type="number" v-model.number="invoice.taxRate" variant="solo" density="comfortable"></v-text-field>
            <div class="totals-summary">
              <p>Subtotal: <span>${{ subtotal.toFixed(2) }}</span></p>
              <p>Tax: <span>${{ taxAmount.toFixed(2) }}</span></p>
              <p class="font-weight-bold">Total: <span class="font-weight-bold">${{ total.toFixed(2) }}</span></p>
            </div>
          </div>
        </div>

        <footer class="editor-footer">
          <v-btn @click="showPreview = true" color="secondary">Preview Invoice</v-btn>
          <v-btn @click="saveInvoice" :loading="isProcessing" color="primary">{{ isProcessing ? 'Saving...' : 'Save Invoice' }}</v-btn>
        </footer>
      </div>
    </div>

    <v-dialog v-model="showPreview" fullscreen transition="dialog-bottom-transition">
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="showPreview = false"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0z" fill="none"/><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></v-btn>
          <v-toolbar-title>Invoice Preview</v-toolbar-title>
        </v-toolbar>
        <div class="preview-content">
          <InvoiceTemplate v-if="invoice.style === 'classic'" :invoice="{...invoice, subtotal, taxAmount, total}" :settings="settings" />
          <InvoiceTemplate2 v-else-if="invoice.style === 'modern'" :invoice="{...invoice, subtotal, taxAmount, total}" :settings="settings" />
          <InvoiceTemplate3 v-else-if="invoice.style === 'corporate'" :invoice="{...invoice, subtotal, taxAmount, total}" :settings="settings" />
          <InvoiceTemplate4 v-else-if="invoice.style === 'solid'" :invoice="{...invoice, subtotal, taxAmount, total}" :settings="settings" />
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.editor-container { padding: 2rem; background-color: #111d2f; min-height: 100vh; color: #f1f5f9; }
.editor-form-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); backdrop-filter: blur(16px); border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.4); padding: 2rem; max-width: 1200px; margin: 0 auto; color: #f1f5f9; }
.editor-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid rgba(255,255,255,0.1); padding-bottom: 1.5rem; margin-bottom: 2rem; }
.editor-header h1 { font-size: 1.8rem; font-weight: 700; color: #fff; }
.form-section { margin-bottom: 2rem; }
.form-section h3 { font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem; color: #fff; }
.responsive-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
.address-grid-city-state { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.item-.row { margin-bottom: 1rem; }
.editor-footer { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; border-top: 2px solid rgba(255,255,255,0.1); padding-top: 1.5rem; }
.preview-content { background: #111d2f; padding: 2rem; height: 100%; overflow-y: auto; }
.totals-summary { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1); }
.totals-summary p { display: flex; justify-content: space-between; margin: 0.5rem 0; color: #e2e8f0; }
.error-container { padding: 1rem 0; }

.custom-color-picker { margin-top: 1rem; }
.color-label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #e2e8f0; font-size: 0.875rem; }
.color-input-wrapper { display: flex; align-items: center; gap: 1rem; background: rgba(255, 255, 255, 0.05); padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); width: cover; display: inline-flex; }
.color-picker { width: 40px; height: 40px; border: none; cursor: pointer; background: transparent; padding: 0; border-radius: 4px; overflow: hidden; }
.color-picker::-webkit-color-swatch-wrapper { padding: 0; }
.color-picker::-webkit-color-swatch { border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; }
.color-hex { font-family: monospace; font-size: 1.1rem; color: #fff; }

:deep(.v-list) { background: #fff !important; color: #1e293b !important; }
:deep(.v-list-item) { color: #1e293b !important; }

@media (max-width: 768px) {
  .editor-container, .editor-form-card { padding: 1rem; }
  .editor-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .responsive-grid { grid-template-columns: 1fr; }
  .from-.fields { display: none; } 
  .editor-footer { flex-direction: column; gap: 0.5rem; }
  .editor-footer .v-btn { width: 100%; margin: 0.25rem 0; }
}
</style>
