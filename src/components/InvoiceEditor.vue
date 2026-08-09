<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import useUserSettings from '../composables/useUserSettings';
import useInvoices from '../composables/useInvoices';
import { useCustomers } from '../composables/useCustomers';
import { useItems } from '../composables/useItems';
import { useAuth, currentUser as user, userProfile } from '../composables/useAuth.js';
import useStripeConnect from '../composables/useStripeConnect';
import InvoiceTemplate from './InvoiceTemplate.vue';
import InvoiceTemplate2 from './InvoiceTemplate2.vue';
import InvoiceTemplate3 from './InvoiceTemplate3.vue';
import InvoiceTemplate4 from './InvoiceTemplate4.vue';
import InvoiceTemplate5 from './InvoiceTemplate5.vue';
import InvoiceTemplate6 from './InvoiceTemplate6.vue';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import Logo from './Logo.vue';
import UpgradeModal from './UpgradeModal.vue';

// --- Composables ---
const { settings, loading: settingsLoading, fetchUserSettings, saveUserSettings } = useUserSettings();
const { createInvoice, getInvoice, updateInvoice } = useInvoices();
const { customers } = useCustomers(); // Automatically fetches and updates based on auth
const { items, fetchItems, stopFetching: stopFetchingItems } = useItems();
 
const { connectStatus, fetchConnectStatus } = useStripeConnect();
const router = useRouter();
const route = useRoute();

// --- Component State ---
const invoiceId = ref(route.params.id);
const invoice = ref(createFreshInvoice());
const selectedCustomer = ref(null);
const showPreview = ref(false);
const isProcessing = ref(false);
const saveError = ref(null);
const showLimitModal = ref(false);
const stripeStatusHaveLoaded = ref(false);
const saveAsDefaultCompany = ref(true);
const isStripeBannerDismissed = ref(localStorage.getItem('swift_invoice_editor_stripe_dismissed') === 'true');

const dismissStripeBanner = () => {
  isStripeBannerDismissed.value = true;
  localStorage.setItem('swift_invoice_editor_stripe_dismissed', 'true');
};

const isCompanyIncomplete = computed(() => {
  return !settings.value?.company?.name || !settings.value?.company?.address1;
});

 

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
    discount: 0,
    discountType: 'percentage',
    style: 'classic',
    primaryColor: '#1a3a52',
    remindersEnabled: true,
    remindersSent: [],
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
const taxableSubtotal = computed(() => (invoice.value.items || []).reduce((acc, item) => {
  const isTaxable = item.taxable !== false;
  return acc + (isTaxable ? (item.quantity || 0) * (item.price || 0) : 0);
}, 0));
const discountAmount = computed(() => {
  if (!invoice.value.discount) return 0;
  return invoice.value.discountType === 'percentage'
    ? subtotal.value * (Number(invoice.value.discount) / 100)
    : Number(invoice.value.discount);
});
const taxAmount = computed(() => {
  const rate = Number(invoice.value.taxRate) || 0;
  if (rate === 0) return 0;
  const sub = subtotal.value;
  if (sub === 0) return 0;
  const ratio = taxableSubtotal.value / sub;
  const postDiscountTaxableSubtotal = taxableSubtotal.value - (discountAmount.value * ratio);
  return Math.max(0, postDiscountTaxableSubtotal) * (rate / 100);
});
const total = computed(() => subtotal.value - discountAmount.value + taxAmount.value);
const itemDescriptions = computed(() => items.value.filter(i => i.type !== 'expense-category' && i.description).map(i => i.description));

// --- Methods ---
const addItem = () => invoice.value.items.push({ description: '', quantity: 1, price: 0, taxable: true });
const removeItem = (index) => invoice.value.items.splice(index, 1);

const saveInvoice = async () => {
  isProcessing.value = true;
  saveError.value = null;

  const invoiceData = { ...invoice.value, subtotal: subtotal.value, discountAmount: discountAmount.value, taxAmount: taxAmount.value, total: total.value };

  try {
    const finalInvoiceId = invoiceId.value === 'new' 
      ? await createInvoice(invoiceData, user.value.uid) 
      : (await updateInvoice(invoiceId.value, invoiceData, user.value.uid), invoiceId.value);
      
    // Auto-save user settings as background enrichment if checkbox is active
    if (saveAsDefaultCompany.value && invoice.value.sender && user.value) {
      try {
        await saveUserSettings({
          ...settings.value,
          company: {
            ...settings.value?.company,
            name: invoice.value.sender.name || '',
            email: invoice.value.sender.email || '',
            address1: invoice.value.sender.address1 || '',
            address2: invoice.value.sender.address2 || '',
            city: invoice.value.sender.city || '',
            state: invoice.value.sender.state || '',
            zip: invoice.value.sender.zip || ''
          }
        });
      } catch (profileErr) {
        console.warn("Progressive profile auto-save encountered a minor issue:", profileErr);
      }
    }

    router.push({ name: 'InvoiceView', params: { id: finalInvoiceId } });
  } catch (error) {
    console.error("Failed to save invoice:", error);
    saveError.value = error.message || 'An unexpected error occurred.';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (error.message && (error.message.includes('limit reached') || error.message.includes('free plan') || error.message.includes('3 invoices'))) {
      showLimitModal.value = true;
    }
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
      if (invoice.value.items) {
        invoice.value.items.forEach(item => {
          if (item.taxable === undefined) item.taxable = true;
        });
      }
    }
  } else {
    // NEW INVOICE MODE
    invoiceId.value = 'new';
    invoice.value = createFreshInvoice(); // Start with a clean slate

    if (userProfile.value?.subscriptionStatus === 'free' && userProfile.value?.invoiceCount >= 3) {
      showLimitModal.value = true;
    }

    if (settings.value) {
      invoice.value.sender = { ...invoice.value.sender, ...(settings.value.company || {}) };
      invoice.value.taxRate = settings.value.taxRate || 0;
      invoice.value.discount = settings.value.defaultDiscount || 0;
      invoice.value.discountType = settings.value.defaultDiscountType || 'percentage';
      invoice.value.notes = settings.value.defaultNotes || invoice.value.notes;
      invoice.value.style = settings.value.defaultStyle || invoice.value.style;
      invoice.value.primaryColor = settings.value.company?.primaryColor || '#1a3a52';
    }

    // Progressive Auto-Fallback for Google / Auth Profile
    if (!invoice.value.sender.name && user.value) {
      const displayName = userProfile.value?.name || user.value.displayName || (user.value.email ? user.value.email.split('@')[0] : '');
      if (displayName) {
        // Formulate smart business name for personal Gmail/OAuth users
        const formattedName = displayName.trim();
        invoice.value.sender.name = formattedName.toLowerCase().includes('services') || formattedName.toLowerCase().includes('consulting') || formattedName.toLowerCase().includes('inc') || formattedName.toLowerCase().includes('llc')
          ? formattedName
          : `${formattedName} Services`;
      }
    }
    if (!invoice.value.sender.email && user.value?.email) {
      invoice.value.sender.email = user.value.email;
    }

    // Invoice bridge: check for project prefill data passed via router state
    const prefill = history.state?.invoicePrefill;
    if (prefill) {
      if (prefill.client) Object.assign(invoice.value.client, prefill.client);
      if (prefill.items?.length) {
        invoice.value.items = prefill.items.map(item => ({
          ...item,
          taxable: item.taxable !== false
        }));
      }
      if (prefill.notes) invoice.value.notes = prefill.notes;
    }

    if (!invoice.value.items.length) {
      addItem(); // Always start with one item line
    }
  }
};

// --- Watchers & Lifecycle ---
watch(user, async (newUser) => {
  if (newUser) {
    initializeInvoice();
    
    // Fetch Stripe Connect status when user becomes defined/authenticated
    stripeStatusHaveLoaded.value = false;
    try {
      await fetchConnectStatus();
    } catch (err) {
      console.error("Error loading Stripe status:", err);
    } finally {
      stripeStatusHaveLoaded.value = true;
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

const openDatePicker = (event) => {
  const element = event.currentTarget || event.target;
  if (!element) return;
  const input = element.querySelector('input[type="date"]') || element.closest('.v-text-field')?.querySelector('input[type="date"]') || element;
  if (input && input.tagName === 'INPUT' && input.type === 'date') {
    if (typeof input.showPicker === 'function') {
      try {
        input.showPicker();
      } catch (err) {
        console.warn("showPicker failed, fallback to click:", err);
        try {
          input.click();
        } catch (e) {}
      }
    } else {
      try {
        input.click();
      } catch (e) {}
    }
  }
};

onUnmounted(() => {
  stopFetchingItems(); // Clean up item listener when component is destroyed
});
</script>

<template>
  <div class="editor-container">
    <UpgradeModal v-model="showLimitModal" />
    <div class="editor-form-card">
      <header class="editor-header">
        <h1>{{ invoiceId === 'new' ? 'Create Invoice' : `Invoice #${invoice.invoiceNumber}` }}</h1>
        <v-btn :to="{ name: 'Dashboard' }" color="white" variant="flat" class="text-indigo-darken-4 font-weight-bold">Back to Dashboard</v-btn>
      </header>

      <!-- Stripe Connect Tip Alert for Authenticated Users (Dismissable & Non-blocking) -->
      <div
        v-if="user && !connectStatus.chargesEnabled && !settingsLoading && stripeStatusHaveLoaded && !isStripeBannerDismissed"
        class="stripe-tip-card mb-6 pa-4 rounded-xl d-flex align-center justify-space-between flex-wrap gap-3"
      >
        <div class="d-flex align-center gap-3" style="flex: 1; min-width: 260px;">
          <div class="tip-icon-bg">
            <v-icon color="#635bff" size="22">mdi-credit-card-outline</v-icon>
          </div>
          <div>
            <div class="d-flex align-center gap-2">
              <span class="font-weight-bold text-white text-subtitle-2">Accept Payments Online</span>
              <span class="optional-pill text-caption">Optional</span>
            </div>
            <p class="text-caption text-grey-lighten-1 mb-0 mt-1" style="line-height: 1.4;">
              You can create & send invoices right now! Connect Stripe when you're ready to collect credit card, Apple Pay, or ACH payments.
            </p>
          </div>
        </div>

        <div class="d-flex align-center gap-2 flex-shrink-0">
          <v-btn 
            to="/settings#stripe-connect" 
            color="#635bff" 
            variant="flat" 
            size="small"
            class="text-none font-weight-bold rounded-lg px-4"
          >
            Connect Stripe
            <v-icon end size="14" class="ml-1">mdi-arrow-right</v-icon>
          </v-btn>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            color="grey-lighten-1"
            @click="dismissStripeBanner"
            title="Dismiss tip"
          ></v-btn>
        </div>
      </div>

      <div v-if="saveError" class="error-container">
        <v-alert type="error" dense outlined closable @click:close="saveError = null">{{ saveError }}</v-alert>
      </div>

      <div v-if="invoice" class="invoice-form-content">
        <!-- Progressive Profile Enrichment Banner for incomplete company setups -->
        <div v-if="isCompanyIncomplete" class="enrichment-banner mb-6">
          <div class="enrichment-content">
            <div class="enrichment-header">
              <span class="enrichment-chip">✨ Progressive Profile</span>
              <span class="enrichment-desc">Your profile details are pre-filled below. Edit as you draft your invoice!</span>
            </div>
            <div class="enrichment-toggle mt-2">
              <label class="save-default-checkbox">
                <input type="checkbox" v-model="saveAsDefaultCompany" />
                <span>Save business details as default profile for future invoices</span>
              </label>
            </div>
          </div>
        </div>

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
            <v-text-field label="Issue Date" type="date" v-model="formattedIssueDate" variant="solo" density="comfortable" @click="openDatePicker" @focus="openDatePicker"></v-text-field>
          </div>
          <div>
            <v-text-field label="Due Date" type="date" v-model="formattedDueDate" variant="solo" density="comfortable" @click="openDatePicker" @focus="openDatePicker"></v-text-field>
          </div>
        </div>

        <div class="form-section">
          <h3>Items</h3>
          <div v-for="(item, index) in invoice.items" :key="index" class="item-row">
            <v-row align="center">
              <v-col cols="12" md="5">
                <v-combobox v-model="item.description" :items="itemDescriptions" label="Select or type to add an item" variant="solo" density="comfortable" @update:model-value="(desc) => handleDescriptionUpdate(item, desc)" clearable>
                  <template v-slot:no-data><v-list-item><v-list-item-title>No items found. <router-link to="/items">Add one?</router-link></v-list-item-title></v-list-item></template>
                </v-combobox>
              </v-col>
              <v-col cols="4" md="2"><v-text-field type="number" label="Quantity" v-model.number="item.quantity" density="comfortable" variant="solo"></v-text-field></v-col>
              <v-col cols="4" md="2"><v-text-field type="number" label="Price" v-model.number="item.price" density="comfortable" variant="solo"></v-text-field></v-col>
              <v-col cols="4" md="2" class="d-flex align-center justify-center">
                <v-checkbox v-model="item.taxable" label="Tax" color="primary" density="comfortable" hide-details class="mt-0"></v-checkbox>
              </v-col>
              <v-col cols="12" md="1" class="d-flex align-center justify-center">
                <v-btn icon @click="removeItem(index)" variant="text" color="red-lighten-2">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/></svg>
                </v-btn>
              </v-col>
            </v-row>
          </div>
          <v-btn @click="addItem" color="primary" variant="tonal" class="mt-4" block>+ Add New Item</v-btn>
        </div>

        <div class="form-section responsive-grid">
          <div>
            <h3>Invoice Status</h3>
            <v-radio-group v-model="invoice.status" inline><v-radio label="Pending" value="pending"></v-radio><v-radio label="Estimate" value="estimate"></v-radio></v-radio-group>
          </div>
          <div>
            <h3>Invoice Style</h3>
            <v-radio-group v-model="invoice.style" inline><v-radio label="Classic" value="classic"></v-radio><v-radio label="Modern" value="modern"></v-radio><v-radio label="Corporate" value="corporate"></v-radio><v-radio label="Solid" value="solid"></v-radio><v-radio label="Creative Sidebar" value="creative"></v-radio><v-radio label="Tech Grid" value="tech"></v-radio></v-radio-group>
            
            <div v-if="['corporate', 'solid', 'creative', 'tech'].includes(invoice.style)" class="custom-color-picker mt-2">
              <label class="color-label">Theme Color</label>
              <div class="color-input-wrapper">
                <input type="color" v-model="invoice.primaryColor" class="color-picker" />
                <span class="color-hex">{{ invoice.primaryColor }}</span>
              </div>
            </div>
          </div>
        </div>


        <div class="form-section responsive-grid">
          <div>
            <v-textarea label="Notes" v-model="invoice.notes" variant="solo"></v-textarea>
            
            <div class="reminders-toggle-box mt-3 p-3 border-radius-8" style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.08); padding: 12px; border-radius: 8px;">
              <div v-if="userProfile?.subscriptionStatus === 'active'" class="d-flex align-center justify-space-between">
                <div>
                  <div class="font-weight-bold text-subtitle-2 text-white">Automated Payment Reminders</div>
                  <div class="text-caption text-medium-emphasis">Sends email reminders 3 days before, on due date, and 7 days overdue.</div>
                </div>
                <v-switch v-model="invoice.remindersEnabled" color="indigo-lighten-1" hide-details density="compact"></v-switch>
              </div>
              <div v-else class="d-flex align-center justify-space-between">
                <div>
                  <div class="font-weight-bold text-subtitle-2 text-white">Automated Payment Reminders <v-chip color="amber" size="x-small" variant="flat" class="ml-1">PRO</v-chip></div>
                  <div class="text-caption text-medium-emphasis">Upgrade to Pro to enable auto-reminders for this invoice.</div>
                </div>
                <v-btn size="small" variant="text" color="indigo-lighten-2" @click="showLimitModal = true">Unlock Pro</v-btn>
              </div>
            </div>
          </div>
          <div>
            <v-row>
              <v-col cols="6"><v-text-field label="Discount" type="number" v-model.number="invoice.discount" variant="solo" density="comfortable"></v-text-field></v-col>
              <v-col cols="6"><v-select label="Type" :items="[{title: '%', value: 'percentage'}, {title: '$', value: 'flat'}]" v-model="invoice.discountType" variant="solo" density="comfortable"></v-select></v-col>
            </v-row>
            <v-text-field label="Tax Rate (%)" type="number" v-model.number="invoice.taxRate" variant="solo" density="comfortable"></v-text-field>
            <div class="totals-summary">
              <p>Subtotal: <span>${{ subtotal.toFixed(2) }}</span></p>
              <p v-if="discountAmount > 0">Discount: <span>-${{ discountAmount.toFixed(2) }}</span></p>
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
      <v-card style="background: #111d2f; color: #f1f5f9;">
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="showPreview = false"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0z" fill="none"/><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></v-btn>
          <v-toolbar-title>Invoice Preview</v-toolbar-title>
        </v-toolbar>
        
        <div v-if="!settings?.company?.logoUrl || settings?.company?.logoUrl === '/Logo.png'" class="logo-preview-banner no-print" data-html2canvas-ignore="true">
          <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 0 24 24" width="18px" fill="#4facfe" class="banner-hint-icon">
            <path d="M0 0h24v24H0V0z" fill="none"/>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          <span class="preview-hint-text">💡 <em>Tip: You can upload your custom business logo anytime in <router-link to="/settings" class="hint-settings-link">Settings</router-link>.</em></span>
        </div>

        <div class="preview-content">
          <InvoiceTemplate v-if="invoice.style === 'classic'" :invoice="{...invoice, invoiceNumber: invoice.invoiceNumber || '000001', subtotal, discountAmount, taxAmount, total}" :settings="settings" />
          <InvoiceTemplate2 v-else-if="invoice.style === 'modern'" :invoice="{...invoice, invoiceNumber: invoice.invoiceNumber || '000001', subtotal, discountAmount, taxAmount, total}" :settings="settings" />
          <InvoiceTemplate3 v-else-if="invoice.style === 'corporate'" :invoice="{...invoice, invoiceNumber: invoice.invoiceNumber || '000001', subtotal, discountAmount, taxAmount, total}" :settings="settings" />
          <InvoiceTemplate4 v-else-if="invoice.style === 'solid'" :invoice="{...invoice, invoiceNumber: invoice.invoiceNumber || '000001', subtotal, discountAmount, taxAmount, total}" :settings="settings" />
          <InvoiceTemplate5 v-else-if="invoice.style === 'creative'" :invoice="{...invoice, invoiceNumber: invoice.invoiceNumber || '000001', subtotal, discountAmount, taxAmount, total}" :settings="settings" />
          <InvoiceTemplate6 v-else-if="invoice.style === 'tech'" :invoice="{...invoice, invoiceNumber: invoice.invoiceNumber || '000001', subtotal, discountAmount, taxAmount, total}" :settings="settings" />
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

.stripe-warning-banner {
  background: rgba(245, 158, 11, 0.04);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(12px);
  text-align: left;
}

.banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
}

.banner-text-wrapper {
  display: flex;
  align-items: flex-start;
  text-align: left;
}

.banner-icon {
  margin-top: 0.15rem;
  font-size: 28px;
}

.banner-text {
  display: flex;
  flex-direction: column;
}

.banner-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.25rem;
}

.banner-desc {
  font-size: 0.95rem;
  color: #94a3b8;
  margin: 0;
  line-height: 1.4;
}

.connect-btn-banner {
  text-transform: none;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

:deep(.v-list) { background: #fff !important; color: #1e293b !important; }
:deep(.v-list-item) { color: #1e293b !important; }

@media (max-width: 768px) {
  .editor-container, .editor-form-card { padding: 1rem; }
  .editor-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .responsive-grid { grid-template-columns: 1fr; }
  .from-.fields { display: none; } 
  .editor-footer { flex-direction: column; gap: 0.5rem; }
  .editor-footer .v-btn { width: 100%; margin: 0.25rem 0; }
  
  /* Warning banner mobile adjustments */
  .stripe-warning-banner {
    padding: 1.25rem;
  }
  .banner-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1.25rem;
  }
  .banner-text-wrapper {
    align-items: flex-start;
  }
  .banner-icon {
    font-size: 24px;
    margin-right: 0.5rem !important;
  }
  .connect-btn-banner {
    width: 100%;
  }
}

/* Progressive Profile Enrichment Banner */
.enrichment-banner {
  background: rgba(79, 172, 254, 0.08);
  border: 1px solid rgba(79, 172, 254, 0.25);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.enrichment-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.enrichment-chip {
  font-size: 0.75rem;
  font-weight: 700;
  color: #00f2fe;
  background: rgba(0, 242, 254, 0.15);
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 0.5px;
}

.enrichment-desc {
  font-size: 0.88rem;
  color: #cbd5e1;
}

.save-default-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #94a3b8;
  cursor: pointer;
  user-select: none;
}

.save-default-checkbox input[type="checkbox"] {
  accent-color: #4facfe;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

/* Logo Preview Banner */
.logo-preview-banner {
  background: rgba(79, 172, 254, 0.1);
  border-bottom: 1px solid rgba(79, 172, 254, 0.2);
  padding: 0.65rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #e2e8f0;
}

.hint-settings-link {
  color: #00f2fe;
  text-decoration: underline;
  font-weight: 600;
}

.hint-settings-link:hover {
  color: #38bdf8;
}

.stripe-tip-card {
  background: rgba(99, 91, 255, 0.06);
  border: 1px solid rgba(99, 91, 255, 0.2);
  backdrop-filter: blur(12px);
}

.tip-icon-bg {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(99, 91, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.optional-pill {
  background: rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  font-size: 0.7rem;
  padding: 2px 7px;
  border-radius: 6px;
  font-weight: 600;
}

@media print {
  .no-print {
    display: none !important;
  }
}
</style>
