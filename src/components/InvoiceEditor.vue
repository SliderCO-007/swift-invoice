<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import useUserSettings from '../composables/useUserSettings';
import useInvoices from '../composables/useInvoices';
import useStripe from '../composables/useStripe';
import { getAuthReady } from '../composables/useAuth';
import InvoiceTemplate from './InvoiceTemplate.vue';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

const { settings, fetchUserSettings } = useUserSettings();
const { createInvoice, getInvoice } = useInvoices();
const { redirectToCheckout, error: stripeError } = useStripe();
const router = useRouter();
const route = useRoute();

const invoiceId = ref(route.params.id);
const invoice = ref({
  status: 'pending',
  sender: { name: '', address1: '', address2: '', city: '', state: '', zip: '', email: '' },
  client: { name: '', address1: '', address2: '', city: '', state: '', zip: '', email: '' },
  items: [],
  issueDate: new Date(),
  dueDate: new Date(),
  notes: '',
  taxRate: 0,
});

const showPreview = ref(false);
const isProcessing = ref(false);

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

onMounted(async () => {
  await getAuthReady();
  await fetchUserSettings();

  const id = route.params.id;
  if (id && id !== 'new') {
    const existingInvoice = await getInvoice(id);
    if (existingInvoice) {
      invoice.value = existingInvoice;
    }
    invoiceId.value = id;
  } else {
    if (settings.value && settings.value.company) {
      invoice.value.sender.name = settings.value.company.name || '';
      invoice.value.sender.address1 = settings.value.company.address1 || '';
      invoice.value.sender.address2 = settings.value.company.address2 || '';
      invoice.value.sender.city = settings.value.company.city || '';
      invoice.value.sender.state = settings.value.company.state || '';
      invoice.value.sender.zip = settings.value.company.zip || '';
      invoice.value.sender.email = settings.value.company.email || '';
    }
    if (settings.value && typeof settings.value.taxRate === 'number') {
      invoice.value.taxRate = settings.value.taxRate;
    }
  }
});

const addItem = () => {
  invoice.value.items.push({ description: '', quantity: 1, price: 0 });
};

const removeItem = (index) => {
  invoice.value.items.splice(index, 1);
};

const createAndCheckout = async () => {
  isProcessing.value = true;

  const invoiceToSave = {
    ...invoice.value,
    status: 'pending',
    subtotal: subtotal.value,
    taxAmount: taxAmount.value,
    total: total.value,
  };

  try {
    const savedId = await createInvoice(invoiceToSave);
    if (!savedId) {
      throw new Error('Failed to create invoice.');
    }

    const finalInvoice = { ...invoiceToSave, id: savedId };
    await redirectToCheckout(finalInvoice);

  } catch (error) {
    console.error("Checkout failed:", error);
    alert(stripeError.value || 'An unexpected error occurred during checkout.');
  } finally {
    isProcessing.value = false;
  }
};

</script>

<template>
  <div class="editor-container">
    <div class="editor-form-card">
      <header class="editor-header">
        <h1>{{ invoiceId === 'new' ? 'Create Invoice' : 'Edit Invoice' }}</h1>
        <button class="back-btn" @click="router.push({ name: 'Dashboard' })">Back to Dashboard</button>
      </header>

      <div v-if="stripeError" class="error-container">
        <v-alert type="error" dense outlined>{{ stripeError }}</v-alert>
      </div>

      <div v-if="invoice" class="invoice-form-content">
        <div class="form-section responsive-grid">
          <div class="from-fields">
            <h3>From</h3>
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
            <h3>To</h3>
            <input type="text" placeholder="Client's Name" v-model="invoice.client.name">
            <input type="email" placeholder="Client's Email" v-model="invoice.client.email">
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
              <div class="item-field">
                <label :for="`item-description-${index}`" class="item-label">Description</label>
                <input :id="`item-description-${index}`" type="text" placeholder="Description" v-model="item.description">
              </div>
              <div class="item-field">
                <label :for="`item-quantity-${index}`" class="item-label">Quantity</label>
                <input :id="`item-quantity-${index}`" type="number" placeholder="Quantity" v-model.number="item.quantity">
              </div>
              <div class="item-field">
                <label :for="`item-price-${index}`" class="item-label">Price</label>
                <input :id="`item-price-${index}`" type="number" placeholder="Price" v-model.number="item.price">
              </div>
              <button class="delete-item-btn" @click="removeItem(index)">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/></svg>
              </button>
            </div>
          </div>
          <button class="add-item-btn" @click="addItem">+ Add New Item</button>
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
          <button class="save-btn" @click="createAndCheckout" :disabled="isProcessing">
            {{ isProcessing ? 'Processing...' : 'Save & Continue to Payment' }}
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
    <InvoiceTemplate :invoice="{...invoice, subtotal, taxAmount, total}" />
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

input, textarea { 
    width: 100%; 
    padding: 0.8rem 1rem; 
    border: 1px solid #ddd; 
    border-radius: 8px; 
    margin-bottom: 0.5rem; 
}

.items-list .item-row {
  display: grid;
  grid-template-columns: 3fr 1fr 1fr auto;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}
.item-field {
    display: contents;
}

/* By default, item labels are for screen readers only */
.item-label {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.delete-item-btn, .add-item-btn {
  background: none; border: none; cursor: pointer; color: #555;
}

.add-item-btn { 
    color: var(--primary-color, #4F46E5); 
    font-weight: 600; 
    margin-top: 1rem;
    border: 1px dashed var(--primary-color, #4F46E5);
    padding: 0.8rem; width: 100%;
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

/* Responsive Adjustments */
@media (min-width: 1024px) {
    .modal-content {
        width: 90%;
        max-width: 900px;
    }
}

@media (max-width: 1023px) {
  .from-fields { display: none; }
  .responsive-grid { grid-template-columns: 1fr; }
  .items-list .item-row {
    grid-template-columns: 2fr 1fr 1fr auto;
  }
}

@media (max-width: 768px) {
  .item-field {
    display: block;
  }
  
  /* On mobile, make the labels visible */
  .item-label {
    position: static;
    width: auto;
    height: auto;
    padding: 0;
    margin: 0 0 0.25rem 0;
    overflow: visible;
    clip: auto;
    white-space: normal;
    display: block;
    font-weight: 500;
    font-size: 0.875rem;
    color: #555;
  }

  .items-list .item-row {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;
    margin-bottom: 1rem;
  }

  .items-list .item-row:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .items-list .item-row input {
    margin-bottom: 0;
  }
  
  .delete-item-btn {
    grid-row: 4;
    justify-self: end;
    background-color: #fce8e8;
    color: #c53030;
    padding: 0.5rem 1rem;
    border-radius: 6px;
  }

  .delete-item-btn svg {
      color: #c53030;
  }
}

</style>
