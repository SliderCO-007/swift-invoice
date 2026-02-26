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
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

const { settings, fetchUserSettings } = useUserSettings();
const { createInvoice, getInvoice, updateInvoice } = useInvoices();
const { customers, fetchCustomers, stopFetching: stopFetchingCustomers } = useCustomers();
const { items, fetchItems, stopFetching: stopFetchingItems } = useItems();
const router = useRouter();
const route = useRoute();

const invoiceId = ref(route.params.id);
const invoice = ref({
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
});

const selectedCustomer = ref(null);
const showPreview = ref(false);
const isProcessing = ref(false);
const saveError = ref(null);

// --- Computed Properties for Date Formatting & Totals ---
const formattedIssueDate = computed({
  get: () => invoice.value.issueDate ? format(new Date(invoice.value.issueDate), 'yyyy-MM-dd', { locale: enUS }) : '',
  set: (val) => {
    if (val) {
      const [year, month, day] = val.split('-').map(Number);
      invoice.value.issueDate = new Date(year, month - 1, day);
    } else {
      invoice.value.issueDate = null;
    }
  },
});

const formattedDueDate = computed({
  get: () => invoice.value.dueDate ? format(new Date(invoice.value.dueDate), 'yyyy-MM-dd', { locale: enUS }) : '',
  set: (val) => {
    if (val) {
      const [year, month, day] = val.split('-').map(Number);
      invoice.value.dueDate = new Date(year, month - 1, day);
    } else {
      invoice.value.dueDate = null;
    }
  },
});

const subtotal = computed(() => {
  return (invoice.value.items || []).reduce((acc, item) => acc + (item.quantity || 0) * (item.price || 0), 0);
});

const taxAmount = computed(() => {
  const rate = Number(invoice.value.taxRate) || 0;
  return subtotal.value * (rate / 100);
});

const total = computed(() => {
  return subtotal.value + taxAmount.value;
});

// --- Component Methods ---
const addItem = () => {
  invoice.value.items.push({ description: '', quantity: 1, price: 0 });
};

const removeItem = (index) => {
  invoice.value.items.splice(index, 1);
};

const saveInvoice = async () => {
  isProcessing.value = true;
  saveError.value = null;

  if (!user.value || !user.value.uid) {
    saveError.value = "Authentication error. Please log in and try again.";
    isProcessing.value = false;
    return;
  }

  // No more normalization needed, the model is simple.

  const invoiceData = {
    ...invoice.value,
    subtotal: subtotal.value,
    taxAmount: taxAmount.value,
    total: total.value,
    userId: user.value.uid,
  };

  try {
    let finalInvoiceId;
    if (invoiceId.value === 'new') {
      finalInvoiceId = await createInvoice(invoiceData);
    } else {
      await updateInvoice(invoiceId.value, invoiceData);
      finalInvoiceId = invoiceId.value;
    }
    
    router.push({ name: 'InvoiceView', params: { id: finalInvoiceId } });

  } catch (error) {
    console.error("Failed to save invoice:", error);
    saveError.value = error.message || 'An unexpected error occurred while saving.';
  } finally {
    isProcessing.value = false;
  }
};

// Watch for changes in the selected customer to auto-fill client info
watch(selectedCustomer, (newCustomer) => {
  if (newCustomer) {
    invoice.value.client = {
      name: newCustomer.name || '',
      email: newCustomer.email || '',
      phone: newCustomer.phone || '',
      address1: newCustomer.address1 || '',
      address2: newCustomer.address2 || '',
      city: newCustomer.city || '',
      state: newCustomer.state || '',
      zip: newCustomer.zip || '',
    };
  } else {
    invoice.value.client = { name: '', email: '', phone: '', address1: '', address2: '', city: '', state: '', zip: '' };
  }
});

const handleDescriptionUpdate = (item, newDescription) => {
  item.description = newDescription || '';
  const foundItem = items.value.find(i => i.description === newDescription);
  if (foundItem) {
    item.price = foundItem.price;
  }
};

const itemDescriptions = computed(() => items.value.map(i => i.description));

// --- Initialization Logic ---
const initializeInvoice = async () => {
  fetchUserSettings();
  
  const id = route.params.id;

  if (id && id !== 'new') {
    invoiceId.value = id;
    const existingInvoice = await getInvoice(id);
    if (existingInvoice) {
      invoice.value = existingInvoice;
      // No special item initialization needed anymore.
    }
  } else {
    invoiceId.value = 'new';
    if (!invoice.value.items || invoice.value.items.length === 0) {
        addItem();
    }
    fetchCustomers();
    fetchItems();
  }
};

watch(settings, (newSettings) => {
  if (invoiceId.value === 'new' && newSettings && newSettings.company) {
    invoice.value.sender = { ...newSettings.company };
    if (typeof newSettings.taxRate === 'number') {
      invoice.value.taxRate = newSettings.taxRate;
    }
  }
}, { deep: true });

watch(user, (newUser) => {
  if (newUser) {
    initializeInvoice();
  } else {
    invoice.value = { items: [], sender: {}, client: {}, issueDate: new Date(), dueDate: new Date(), notes: 'Thank you for your business!', taxRate: 0 };
  }
}, { immediate: true, deep: true });

onUnmounted(() => {
  stopFetchingCustomers();
  stopFetchingItems();
});

</script>
<template>
  <div class="editor-container">
    <div class="editor-form-card">
      <header class="editor-header">
        <h1>{{ invoice.invoiceNumber ? `Invoice #${invoice.invoiceNumber}` : 'Create Invoice' }}</h1>
        <button class="back-btn" @click="router.push({ name: 'Dashboard' })">Back to Dashboard</button>
      </header>

      <div v-if="saveError" class="error-container">
        <v-alert type="error" dense outlined closable @click:close="saveError = null">
          {{ saveError }}
        </v-alert>
      </div>

      <div v-if="invoice" class="invoice-form-content">
        <div class="form-section responsive-grid">
          <div class="from-fields">
            <h3 class="mb-2">From</h3>
            <input type="text" placeholder="Your Name/Company" v-model="invoice.sender.name">
            <input type="email" placeholder="Your Email" v-model="invoice.sender.email">
            <input type="text" placeholder="Address Line 1" v-model="invoice.sender.address1">
            <input type="text" placeholder="Address Line 2 (Optional)" v-model="invoice.sender.address2">
            <div class="address-grid-city-state">
              <input type="text" placeholder="City" v-model="invoice.sender.city">
              <input type="text" placeholder="State" v-model="invoice.sender.state">
            </div>
            <input type="text" placeholder="Zip Code" v-model="invoice.sender.zip">
          </div>
          <div>
            <h3 class="mb-2">To</h3>
            <v-autocomplete
              v-model="selectedCustomer"
              :items="customers"
              item-title="name"
              item-value="id"
              :item-props="(item) => ({ title: item.name, subtitle: item.email })"
              return-object
              label="Select a Customer"
              variant="outlined"
              class="mb-4"
              clearable
            >
              <template v-slot:no-data>
                <v-list-item>
                  <v-list-item-title>
                    No customers found. <router-link to="/customers">Add one?</router-link>
                  </v-list-item-title>
                </v-list-item>
              </template>
            </v-autocomplete>
            
            <v-text-field density="comfortable" class="mb-2" label="Client's Name" v-model="invoice.client.name" variant="outlined" required></v-text-field>
            <v-text-field density="comfortable" class="mb-2" label="Client's Email" v-model="invoice.client.email" variant="outlined" required type="email"></v-text-field>
            <v-text-field density="comfortable" class="mb-2" label="Client's Phone" v-model="invoice.client.phone" variant="outlined"></v-text-field>
            <input type="text" placeholder="Address Line 1" v-model="invoice.client.address1">
            <input type="text" placeholder="Address Line 2 (Optional)" v-model="invoice.client.address2">
            <div class="address-grid-city-state">
              <input type="text" placeholder="City" v-model="invoice.client.city">
              <input type="text" placeholder="State" v-model="invoice.client.state">
            </div>
            <input type="text" placeholder="Zip Code" v-model="invoice.client.zip">
          </div>
        </div>

        <div class="form-section responsive-grid">
          <div>
            <label for="issueDate">Issue Date</label>
            <input type="date" id="issueDate" v-model="formattedIssueDate">
          </div>
          <div>
            <label for="dueDate">Due Date</label>
            <input type="date" id="dueDate" v-model="formattedDueDate">
          </div>
        </div>

        <div class="form-section">
          <h3>Items</h3>
          <div class="items-list">
            <div v-for="(item, index) in invoice.items" :key="index" class="item-row">
              <v-row align="center">
                <v-col cols="12" md="6">
                  <v-combobox
                    v-model="item.description"
                    :items="itemDescriptions"
                    label="Select or type to add an item"
                    variant="outlined"
                    density="comfortable"
                    @update:model-value="(newDescription) => handleDescriptionUpdate(item, newDescription)"
                    clearable
                  >
                    <template v-slot:no-data>
                      <v-list-item>
                        <v-list-item-title>
                          No items found. <router-link to="/items">Add one?</router-link>
                        </v-list-item-title>
                      </v-list-item>
                    </template>
                  </v-combobox>
                </v-col>
                <v-col cols="6" md="2">
                  <v-text-field
                    :id="`item-quantity-${index}`"
                    type="number"
                    label="Quantity"
                    v-model.number="item.quantity"
                    density="comfortable"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
                <v-col cols="6" md="2">
                  <v-text-field
                    :id="`item-price-${index}`"
                    type="number"
                    label="Price"
                    v-model.number="item.price"
                    density="comfortable"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="2" class="d-flex align-center justify-center">
                  <button class="delete-item-btn" @click="removeItem(index)">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/></svg>
                  </button>
                </v-col>
              </v-row>
            </div>
          </div>
          <button class="add-item-btn" @click="addItem">+ Add New Item</button>
        </div>

        <div class="form-section">
          <h3>Invoice Status</h3>
          <div class="style-selector">
            <label>
              <input type="radio" value="pending" v-model="invoice.status">
              <span class="style-label">Pending</span>
            </label>
            <label>
              <input type="radio" value="quote" v-model="invoice.status">
              <span class="style-label">Quote</span>
            </label>
          </div>
        </div>

        <div class="form-section">
          <h3>Invoice Style</h3>
          <div class="style-selector">
            <label>
              <input type="radio" value="classic" v-model="invoice.style">
              <span class="style-label">Classic</span>
            </label>
            <label>
              <input type="radio" value="modern" v-model="invoice.style">
              <span class="style-label">Modern</span>
            </label>
            <label>
              <input type="radio" value="corporate" v-model="invoice.style">
              <span class="style-label">Corporate</span>
            </label>
          </div>
        </div>

        <div class="form-section">
          <h3>Payment Options</h3>
          <div class="payment-options-grid">
            <div class="switch-container">
              <label for="includeVenmoQr" class="switch-label">Include QR Code</label>
              <label class="switch">
                <input type="checkbox" id="includeVenmoQr" v-model="invoice.includeVenmoQr">
                <span class="slider round"></span>
              </label>
            </div>
          </div>
        </div>

        <div class="form-section responsive-grid">
            <div>
                <label for="notes">Notes</label>
                <textarea id="notes" placeholder="Add any notes..." v-model="invoice.notes"></textarea>
            </div>
            <div>
                <label for="taxRate">Tax Rate (%)</label>
                <input type="number" id="taxRate" placeholder="0" v-model.number="invoice.taxRate">
                <div class="totals-summary">
                    <p>Subtotal: <span>${{ subtotal.toFixed(2) }}</span></p>
                    <p>Tax: <span>${{ taxAmount.toFixed(2) }}</span></p>
                    <p>Total: <span>${{ total.toFixed(2) }}</span></p>
                </div>
            </div>
        </div>

        <footer class="editor-footer">
          <button class="preview-btn" @click="showPreview = true">Preview Invoice</button>
          <button class="save-btn" @click="saveInvoice" :disabled="isProcessing">
            {{ isProcessing ? 'Saving...' : 'Save Invoice' }}
          </button>
        </footer>
      </div>
    </div>

    <div v-if="showPreview" class="preview-modal">
      <div class="modal-content">
        <header class="modal-header">
          <h2>Invoice Preview</h2>
          <button @click="showPreview = false" class="close-modal-btn">&times;</button>
        </header>
        <InvoiceTemplate v-if="invoice.style === 'classic'" :invoice="{...invoice, subtotal, taxAmount, total}" :settings="settings" />
        <InvoiceTemplate2 v-else-if="invoice.style === 'modern'" :invoice="{...invoice, subtotal, taxAmount, total}" :settings="settings" />
        <InvoiceTemplate3 v-else-if="invoice.style === 'corporate'" :invoice="{...invoice, subtotal, taxAmount, total}" :settings="settings" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor-container {
  padding: 2rem;
  background-color: var(--background-color, #f9fafb);
  min-height: 100vh;
}

.editor-form-card {
  background-color: var(--white-color, #fff);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #eee;
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
}

.editor-header h1 {
  font-size: 1.8rem;
  font-weight: 700;
}

.back-btn {
    padding: 0.8rem 1.5rem;
    border: 1px solid #ddd;
    background-color: transparent;
    color: #333;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.back-btn:hover {
    background-color: #f7f7f7;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.form-section {
    margin-bottom: 2rem;
}

.form-section h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.responsive-grid { 
    display: grid; 
    grid-template-columns: 1fr 1fr; 
    gap: 2rem;
    color: #555;
}
.address-grid-city-state { 
    display: grid; 
    grid-template-columns: 1fr 1fr; 
    gap: 0.5rem; 
}

input, textarea,
.v-text-field, .v-textarea {
    width: 100%;
    margin-bottom: 0.5rem;
}

input, textarea {
    padding: 0.8rem 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
}

.item-row {
    margin-bottom: 1rem;
}

.delete-item-btn {
  background-color: #fce8e8;
  color: #c53030;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.delete-item-btn svg {
  color: #c53030;
}

.add-item-btn { 
    color: var(--primary-color, #4F46E5); 
    font-weight: 600; 
    margin-top: 1rem;
    border: 1px dashed var(--primary-color, #4F46E5);
    padding: 0.8rem; width: 100%;
    background: none;
    cursor: pointer;
}

.editor-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  border-top: 2px solid #eee;
  padding-top: 1.5rem;
}

.save-btn, .preview-btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
}

.save-btn { background-color: var(--primary-color, #4F46E5); color: white; }
.preview-btn { background-color: #6c757d; color: white; }

.preview-modal {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.6);
    display: flex; justify-content: center; align-items: center;
    z-index: 1000;
}
.modal-content { 
    background: white; 
    padding: 1.5rem; 
    border-radius: 12px; 
    width: 95%;
    max-height: 90vh; 
    overflow-y: auto; 
}

.payment-modal-content {
  padding: 0;
  max-width: 500px;
}

.modal-header { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    padding-bottom: 1rem; 
    margin-bottom: 1rem; 
    border-bottom: 1px solid #eee; 
}
.modal-header h2 { color: #333; }
.close-modal-btn { 
    background: none; 
    border: none; 
    font-size: 1.8rem; 
    cursor: pointer; 
    color: #333; 
}

.totals-summary {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
}

.totals-summary p {
    display: flex;
    justify-content: space-between;
    font-weight: 600;
    margin: 0.5rem 0;
}

.totals-summary span {
    font-weight: normal;
}

.error-container {
    padding: 1rem 0;
}

.payment-options-grid {
    display: flex;
    gap: 2rem;
}

.switch-container {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.switch-label {
    font-weight: 600;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input { 
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: var(--primary-color, #4F46E5);
}

input:focus + .slider {
  box-shadow: 0 0 1px var(--primary-color, #4F46E5);
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

@media (min-width: 1024px) {
    .modal-content {
        width: 90%;
        max-width: 900px;
    }
}

@media (max-width: 1023px) {
  .from-fields { display: none; }
  .responsive-grid { grid-template-columns: 1fr; }
}

.style-selector {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
}

.style-selector label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
}

.style-selector input[type="radio"] {
  cursor: pointer;
  width: 18px;
  height: 18px;
  accent-color: var(--primary-color, #4F46E5);
}

.style-label {
  user-select: none;
}
</style>