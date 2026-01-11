<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import useUserSettings from '../composables/useUserSettings';
import useInvoices from '../composables/useInvoices';
import { getAuthReady } from '../composables/useAuth'; // Import the new utility
import InvoiceTemplate from './InvoiceTemplate.vue';
import { format, parseISO } from 'date-fns';

const { settings, fetchUserSettings } = useUserSettings();
const { createInvoice, getInvoice, updateInvoice, loading: isSaving } = useInvoices();
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

// Computed properties to handle date formatting for input[type="date"]
const formattedIssueDate = computed({
  get: () => invoice.value.issueDate ? format(new Date(invoice.value.issueDate), 'yyyy-MM-dd') : '',
  set: (val) => invoice.value.issueDate = new Date(val),
});

const formattedDueDate = computed({
  get: () => invoice.value.dueDate ? format(new Date(invoice.value.dueDate), 'yyyy-MM-dd') : '',
  set: (val) => invoice.value.dueDate = new Date(val),
});


onMounted(async () => {
  // 1. Wait for Firebase to confirm the authentication state.
  await getAuthReady();

  // 2. Now that we know who the user is, fetch their settings.
  await fetchUserSettings();

  const id = route.params.id;
  if (id && id !== 'new') {
    // Editing an existing invoice
    const existingInvoice = await getInvoice(id);
    if (existingInvoice) {
      invoice.value = existingInvoice;
    }
    invoiceId.value = id;
  } else {
    // 3. For a new invoice, pre-populate with the now-guaranteed settings.
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

const saveAndExit = async (status) => {
  invoice.value.status = status;
  if (invoiceId.value && invoiceId.value !== 'new') {
    await updateInvoice(invoiceId.value, invoice.value);
  } else {
    await createInvoice(invoice.value);
  }
  router.push('/dashboard');
};

</script>

<template>
  <div class="editor-container">
    <div class="editor-form-card">
      <header class="editor-header">
        <h1>{{ invoiceId === 'new' ? 'Create Invoice' : 'Edit Invoice' }}</h1>
        <button class="back-btn" @click="router.push('/dashboard')">Back to Dashboard</button>
      </header>

      <div v-if="invoice" class="invoice-form-content">
        <!-- Sender & Client Details -->
        <div class="form-section grid-2">
          <div>
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

        <!-- Dates -->
        <div class="form-section grid-2">
          <div>
            <label for="issueDate">Issue Date</label>
            <input type="date" id="issueDate" v-model="formattedIssueDate">
          </div>
          <div>
            <label for="dueDate">Due Date</label>
            <input type="date" id="dueDate" v-model="formattedDueDate">
          </div>
        </div>

        <!-- Line Items -->
        <div class="form-section">
          <h3>Items</h3>
          <div class="items-list">
            <div v-for="(item, index) in invoice.items" :key="index" class="item-row">
              <input type="text" placeholder="Description" v-model="item.description">
              <input type="number" placeholder="Qty" v-model.number="item.quantity">
              <input type="number" placeholder="Price" v-model.number="item.price">
              <button class="delete-item-btn" @click="removeItem(index)">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/></svg>
              </button>
            </div>
          </div>
          <button class="add-item-btn" @click="addItem">+ Add New Item</button>
        </div>

        <!-- Notes and Tax -->
        <div class="form-section grid-2">
            <div>
                <label for="notes">Notes</label>
                <textarea id="notes" placeholder="Add any notes..." v-model="invoice.notes"></textarea>
            </div>
            <div>
                <label for="taxRate">Tax Rate (%)</label>
                <input type="number" id="taxRate" placeholder="0" v-model.number="invoice.taxRate">
            </div>
        </div>

        <!-- Actions -->
        <footer class="editor-footer">
          <button class="save-btn draft" @click="saveAndExit('draft')" :disabled="isSaving">
            {{ isSaving ? 'Saving...' : 'Save as Draft' }}
          </button>
          <button class="save-btn" @click="saveAndExit('pending')" :disabled="isSaving">
            {{ isSaving ? 'Saving...' : 'Save & Send' }}
          </button>
        </footer>
      </div>
    </div>
    <div class="preview-card">
      <InvoiceTemplate :invoice="invoice" />
    </div>
  </div>
</template>

<style scoped>
.editor-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 2rem;
  background-color: var(--background-color, #f9fafb);
  height: 100vh;
  overflow: hidden;
}

.editor-form-card, .preview-card {
  background-color: var(--white-color, #fff);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  padding: 2rem;
  overflow-y: auto;
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
  color: var(--text-color, #111827);
  margin: 0;
}

.back-btn {
  background: none;
  border: none;
  color: var(--primary-color, #4F46E5);
  font-weight: 600;
  cursor: pointer;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.address-grid-city-state {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

input[type="text"], input[type="email"], input[type="number"], input[type="date"], textarea {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.3s ease;
}

input:focus, textarea:focus {
  outline: none;
  border-color: var(--primary-color, #4F46E5);
}

input, textarea {
    margin-bottom: 0.5rem;
}

label {
    font-weight: 600;
    font-size: 0.9rem;
    color: #555;
    margin-bottom: 0.5rem;
    display: block;
}

.items-list .item-row {
  display: grid;
  grid-template-columns: 3fr 1fr 1fr auto;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.delete-item-btn, .add-item-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #888;
  transition: color 0.3s ease;
}

.delete-item-btn:hover { color: #E74C3C; }
.add-item-btn { 
    color: var(--primary-color, #4F46E5); 
    font-weight: 600; 
    margin-top: 1rem;
    border: 1px dashed var(--primary-color, #4F46E5);
    border-radius: 8px;
    padding: 0.8rem;
    width: 100%;
}

.editor-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  border-top: 2px solid #eee;
  padding-top: 1.5rem;
}

.save-btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  background-color: var(--primary-color, #4F46E5);
  color: var(--white-color, #fff);
}
.save-btn.draft {
  background-color: #777;
}

.save-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

@media (max-width: 1024px) {
  .editor-container {
    grid-template-columns: 1fr;
    height: auto;
  }
  .preview-card {
      display: none; /* Hide preview on smaller screens */
  }
}
</style>
