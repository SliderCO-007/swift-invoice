<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import useUserSettings from '../composables/useUserSettings';
import useInvoices from '../composables/useInvoices';
import InvoiceTemplate from './InvoiceTemplate.vue';

const { settings, fetchUserSettings } = useUserSettings();
const { createInvoice, getInvoice, updateInvoice, loading: isSaving } = useInvoices();
const router = useRouter();
const route = useRoute();

const invoiceId = ref(route.params.id);
const invoice = ref({
  status: 'pending',
  sender: { name: '', address: '', email: '' }, // Initialize with empty object
  client: { name: '', address: '', email: '' },
  items: [],
  issueDate: new Date(),
  dueDate: new Date(),
  notes: '',
  taxRate: 0,
});

onMounted(async () => {
  await fetchUserSettings();
  // Check if settings and companyInfo exist before assigning
  if (settings.value && settings.value.companyInfo) {
    invoice.value.sender = settings.value.companyInfo;
  }
  if (settings.value && settings.value.defaultTaxRate) {
    invoice.value.taxRate = settings.value.defaultTaxRate;
  }

  if (invoiceId.value && invoiceId.value !== 'new') {
    const fetchedInvoice = await getInvoice(invoiceId.value);
    if(fetchedInvoice) invoice.value = fetchedInvoice;
  } else {
    invoice.value.issueDate = new Date();
    invoice.value.dueDate = new Date();
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
    await updateInvoice(invoice.value.id, invoice.value);
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
            <input type="text" placeholder="Your Address" v-model="invoice.sender.address">
            <input type="email" placeholder="Your Email" v-model="invoice.sender.email">
          </div>
          <div>
            <h3>To</h3>
            <input type="text" placeholder="Client's Name" v-model="invoice.client.name">
            <input type="text" placeholder="Client's Address" v-model="invoice.client.address">
            <input type="email" placeholder="Client's Email" v-model="invoice.client.email">
          </div>
        </div>

        <!-- Dates -->
        <div class="form-section grid-2">
          <div>
            <h3>Issue Date</h3>
            <input type="date" v-model="invoice.issueDate">
          </div>
          <div>
            <h3>Due Date</h3>
            <input type="date" v-model="invoice.dueDate">
          </div>
        </div>

        <!-- Items -->
        <div class="form-section">
          <h3>Items</h3>
          <div v-for="(item, index) in invoice.items" :key="index" class="item-row">
            <input type="text" class="item-desc" placeholder="Item Description" v-model="item.description">
            <input type="number" class="item-qty" placeholder="Qty" v-model="item.quantity">
            <input type="number" class="item-price" placeholder="Price" v-model="item.price">
            <span class="item-total">${{ (item.quantity * item.price).toFixed(2) }}</span>
            <button class="remove-item-btn" @click="removeItem(index)">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#E74C3C"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
            </button>
          </div>
          <button class="add-item-btn" @click="addItem">+ Add Item</button>
        </div>

        <!-- Tax & Notes -->
        <div class="form-section grid-2">
          <div>
            <h3>Tax Rate (%)</h3>
            <input type="number" placeholder="Tax Rate" v-model="invoice.taxRate">
          </div>
          <div>
            <h3>Notes</h3>
            <textarea placeholder="Optional notes..." v-model="invoice.notes"></textarea>
          </div>
        </div>

      </div>

      <footer class="editor-footer">
        <button class="save-btn" @click="saveAndExit('pending')" :disabled="isSaving">
          <span v-if="isSaving">Saving...</span>
          <span v-else>Save as Draft</span>
        </button>
        <button class="primary-btn" @click="saveAndExit('paid')" :disabled="isSaving">
          <span v-if="isSaving">Saving...</span>
          <span v-else>Save and Send</span>
        </button>
      </footer>

    </div>
    <div class="preview-pane">
      <InvoiceTemplate :invoice="invoice" />
    </div>
  </div>
</template>

<style scoped>
.editor-container {
  display: flex;
  min-height: 100vh;
  background-color: var(--background-color, #F9FAFB);
}

.editor-form-card {
  flex: 1;
  background: var(--white-color, #fff);
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
}

.editor-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color, #111827);
}

.back-btn {
  background: none;
  border: 1px solid #ccc;
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--primary-color);
}

.back-btn:hover {
  background: #f0f0f0;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--primary-color, #4F46E5);
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

input[type="text"],
input[type="email"],
input[type="number"],
input[type="date"],
textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: var(--primary-color, #4F46E5);
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.item-desc { flex: 3; }
.item-qty, .item-price { flex: 1; }
.item-total { font-weight: 600; }

.remove-item-btn {
  background: none;
  border: none;
  cursor: pointer;
}

.add-item-btn {
  background: none;
  border: 1px dashed var(--primary-color, #4F46E5);
  color: var(--primary-color, #4F46E5);
  padding: 0.6rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-item-btn:hover {
  background: var(--primary-color, #4F46E5);
  color: var(--white-color, #fff);
}

.editor-footer {
  margin-top: auto;
  padding-top: 2rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.save-btn,
.primary-btn {
  padding: 0.8rem 1.5rem;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.save-btn {
  background: #eee;
  color: #555;
}
.save-btn:hover { background: #ddd; }

.primary-btn {
  background: var(--primary-color, #4F46E5);
  color: var(--white-color, #fff);
}

.primary-btn:hover { opacity: 0.9; }

.primary-btn:disabled,
.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.preview-pane {
  flex: 1;
  padding: 2.5rem;
}

/* Responsive Styles */
@media (max-width: 1200px) {
  .editor-container {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .grid-2 {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .editor-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .editor-form-card, .preview-pane {
    padding: 1.5rem;
  }

  .item-row {
      flex-wrap: wrap;
      gap: 0.75rem;
  }

  .item-desc {
      flex-basis: 100%;
  }

  .item-qty, .item-price {
      flex: 1;
  }

  .editor-footer {
      flex-direction: column;
  }

  .save-btn, .primary-btn {
      width: 100%;
      justify-content: center;
  }
}
</style>
