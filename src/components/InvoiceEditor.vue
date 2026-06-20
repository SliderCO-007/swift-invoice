<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import useUserSettings from '../composables/useUserSettings';
import useInvoices from '../composables/useInvoices';
import { useCustomers } from '../composables/useCustomers';
import { useItems } from '../composables/useItems';
import { useAuth, currentUser as user } from '../composables/useAuth.js';
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

// --- Composables ---
const { settings, loading: settingsLoading, fetchUserSettings } = useUserSettings();
const { createInvoice, getInvoice, updateInvoice } = useInvoices();
const { customers } = useCustomers(); // Automatically fetches and updates based on auth
const { items, fetchItems, stopFetching: stopFetchingItems } = useItems();
const { signup: apiSignup, login: apiLogin, googleLogin: apiGoogleLogin } = useAuth();
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
const stripeStatusHaveLoaded = ref(false);

// --- Auth Modal & Guest State ---
const showAuthModal = ref(false);
const authMode = ref('signup');
const authEmail = ref('');
const authPassword = ref('');
const authError = ref(null);
const authLoading = ref(false);
const isMigrating = ref(false);

const openAuthModal = (mode = 'signup') => {
  authMode.value = mode;
  authError.value = null;
  authEmail.value = '';
  authPassword.value = '';
  showAuthModal.value = true;
};

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
  
  if (!user.value?.uid) {
    isProcessing.value = false;
    openAuthModal('signup');
    return;
  }

  const invoiceData = { ...invoice.value, subtotal: subtotal.value, discountAmount: discountAmount.value, taxAmount: taxAmount.value, total: total.value };

  try {
    const finalInvoiceId = invoiceId.value === 'new' 
      ? await createInvoice(invoiceData, user.value.uid) 
      : (await updateInvoice(invoiceId.value, invoiceData, user.value.uid), invoiceId.value);
      
    localStorage.removeItem('swift_invoice_guest_draft');
    router.push({ name: 'InvoiceView', params: { id: finalInvoiceId } });
  } catch (error) {
    console.error("Failed to save invoice:", error);
    saveError.value = error.message || 'An unexpected error occurred.';
  } finally {
    isProcessing.value = false;
  }
};

const migrateDraft = async () => {
  if (!user.value) return;
  
  isMigrating.value = true;
  isProcessing.value = true;
  saveError.value = null;
  
  const invoiceData = { 
    ...invoice.value, 
    subtotal: subtotal.value, 
    discountAmount: discountAmount.value, 
    taxAmount: taxAmount.value, 
    total: total.value 
  };

  try {
    const finalInvoiceId = await createInvoice(invoiceData, user.value.uid);
    localStorage.removeItem('swift_invoice_guest_draft');
    showAuthModal.value = false;
    router.push({ name: 'InvoiceView', params: { id: finalInvoiceId } });
  } catch (err) {
    console.error("Draft migration failed:", err);
    saveError.value = err.message || "Failed to save migrated invoice.";
  } finally {
    isProcessing.value = false;
    isMigrating.value = false;
  }
};

const handleAuth = async () => {
  authLoading.value = true;
  authError.value = null;
  try {
    if (authMode.value === 'signup') {
      await apiSignup(authEmail.value, authPassword.value);
    } else {
      await apiLogin(authEmail.value, authPassword.value);
    }
    await migrateDraft();
  } catch (err) {
    console.error("Authentication failed:", err);
    authError.value = err.message || "Authentication failed. Please check your credentials.";
  } finally {
    authLoading.value = false;
  }
};

const handleGoogleAuth = async () => {
  authLoading.value = true;
  authError.value = null;
  try {
    await apiGoogleLogin();
    await migrateDraft();
  } catch (err) {
    console.error("Google login failed:", err);
    authError.value = err.message || "Google Sign-In failed.";
  } finally {
    authLoading.value = false;
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
  
  if (!user.value) {
    invoiceId.value = 'new';
    const draftJson = localStorage.getItem('swift_invoice_guest_draft');
    if (draftJson) {
      try {
        const parsed = JSON.parse(draftJson);
        if (parsed.issueDate) parsed.issueDate = new Date(parsed.issueDate);
        if (parsed.dueDate) parsed.dueDate = new Date(parsed.dueDate);
        if (parsed.items) {
          parsed.items.forEach(item => {
            if (item.taxable === undefined) item.taxable = true;
          });
        }
        invoice.value = parsed;
        return;
      } catch (err) {
        console.error("Error parsing guest draft:", err);
      }
    }
    invoice.value = createFreshInvoice();
    addItem();
    return;
  }

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

    if (settings.value) {
      invoice.value.sender = { ...invoice.value.sender, ...(settings.value.company || {}) };
      invoice.value.taxRate = settings.value.taxRate || 0;
      invoice.value.discount = settings.value.defaultDiscount || 0;
      invoice.value.discountType = settings.value.defaultDiscountType || 'percentage';
      invoice.value.notes = settings.value.defaultNotes || invoice.value.notes;
      invoice.value.style = settings.value.defaultStyle || invoice.value.style;
      invoice.value.primaryColor = settings.value.company?.primaryColor || '#1a3a52';
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
watch(user, async (newUser, oldUser) => {
  if (newUser) {
    if (isMigrating.value) {
      return;
    }
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
  } else {
    initializeInvoice();
    stripeStatusHaveLoaded.value = true; // Guest users do not need payment status loading
    if (oldUser && route.name !== 'Home' && route.name !== 'Login') {
      router.push('/');
    }
  }
}, { immediate: true });

watch(invoice, (newInvoice) => {
  if (!user.value) {
    localStorage.setItem('swift_invoice_guest_draft', JSON.stringify(newInvoice));
  }
}, { deep: true });

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
    <!-- Guest Alert Banner -->
    <div v-if="!user" class="guest-banner mb-6">
      <div class="banner-glow-effect"></div>
      <div class="d-flex align-center flex-grow-1 flex-wrap ga-2">
        <v-icon color="cyan-accent-3" class="mr-2" size="28">mdi-alert-circle-outline</v-icon>
        <span class="text-body-1 font-weight-medium">
          <strong>Guest Preview:</strong> You are in guest mode. Your progress is saved locally.
          <strong>Sign up to save permanently, export PDF, or send to clients!</strong>
        </span>
      </div>
      <v-btn
        color="cyan-accent-3"
        class="text-indigo-darken-4 font-weight-bold px-6 ml-auto"
        rounded="xl"
        size="large"
        @click="openAuthModal('signup')"
      >
        Sign Up & Save
      </v-btn>
    </div>

    <div class="editor-form-card">
      <header class="editor-header">
        <h1>{{ invoiceId === 'new' ? 'Create Invoice' : `Invoice #${invoice.invoiceNumber}` }}</h1>
        <v-btn v-if="user" :to="{ name: 'Dashboard' }" color="white" variant="flat" class="text-indigo-darken-4 font-weight-bold">Back to Dashboard</v-btn>
        <v-btn v-else to="/" color="white" variant="flat" class="text-indigo-darken-4 font-weight-bold">Back to Home</v-btn>
      </header>

      <!-- Stripe Connect Warning Alert for Authenticated Users -->
      <v-alert
        v-if="user && !connectStatus.chargesEnabled && !settingsLoading && stripeStatusHaveLoaded"
        type="warning"
        variant="tonal"
        class="mb-6 text-left"
        border="start"
        style="background: rgba(245, 158, 11, 0.08) !important; border-color: #fbbf24 !important; color: #f1f5f9 !important;"
        prominent
      >
        <template v-slot:prepend>
          <v-icon color="#fbbf24">mdi-credit-card-outline</v-icon>
        </template>
        <template v-slot:text>
          <div style="color: #f1f5f9;">
            You will not be able to accept online payments until your payment account connection is completed.
          </div>
        </template>
        <template v-slot:append>
          <v-btn to="/onboarding?step=2" color="#fbbf24" variant="flat" class="text-black font-weight-bold" style="text-transform: none;">Connect Now</v-btn>
        </template>
      </v-alert>

      <div v-if="saveError" class="error-container">
        <v-alert type="error" dense outlined closable @click:close="saveError = null">{{ saveError }}</v-alert>
      </div>

      <div v-if="invoice" class="invoice-form-content">
        <div class="form-section responsive-grid">
          <div class="from-fields">
            <h3 class="mb-2 d-flex align-center">
              From
              <v-tooltip v-if="!user" location="top" text="Register to have your company name, email, and address auto-populated here on every invoice.">
                <template v-slot:activator="{ props }">
                  <v-icon v-bind="props" size="x-small" color="cyan" class="ml-2 cursor-pointer">mdi-information-outline</v-icon>
                </template>
              </v-tooltip>
            </h3>
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
          <div><v-textarea label="Notes" v-model="invoice.notes" variant="solo"></v-textarea></div>
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
        
        <!-- Guest Preview Alert Bar -->
        <div v-if="!user" class="guest-preview-banner py-4 px-6 text-center text-white bg-indigo-darken-4 d-flex align-center justify-center flex-wrap ga-4">
          <span class="text-body-1 font-weight-medium">✨ You are previewing this invoice. Sign up to download this PDF, send it to clients, or save it permanently!</span>
          <v-btn size="large" color="cyan-accent-3" class="text-indigo-darken-4 font-weight-bold px-6" rounded="xl" @click="showPreview = false; openAuthModal('signup')">Sign Up & Save</v-btn>
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

    <!-- Glassmorphic Auth Modal -->
    <v-dialog v-model="showAuthModal" max-width="500px" persistent>
      <v-card class="auth-modal-card">
        <header class="auth-modal-header d-flex align-center justify-between">
          <div class="d-flex align-center">
            <Logo style="height: 36px; width: auto;" />
            <span class="font-weight-bold ml-2 text-white" style="font-size: 1.15rem; letter-spacing: -0.5px">ScanGo Invoice</span>
          </div>
          <v-btn icon @click="showAuthModal = false" variant="text" color="grey-lighten-1" size="small">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0z" fill="none"/><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </v-btn>
        </header>

        <div class="auth-modal-content px-6 py-6">
          <h2 class="text-h5 font-weight-bold text-white mb-2 text-center">
            {{ authMode === 'signup' ? 'Create an Account' : 'Welcome Back' }}
          </h2>
          <p class="text-body-2 text-grey-lighten-1 mb-6 text-center">
            {{ authMode === 'signup' ? 'Sign up in seconds to save your invoice and access all premium features.' : 'Sign in to sync and save your guest invoice.' }}
          </p>

          <!-- Benefits Checklist -->
          <div class="benefits-list mb-6" v-if="authMode === 'signup'">
            <div class="benefit-item d-flex align-center mb-3">
              <v-icon color="cyan-accent-3" class="mr-2" size="small">mdi-check-circle-outline</v-icon>
              <span class="text-body-2 text-grey-lighten-2 font-weight-medium">Save invoice permanently to dashboard</span>
            </div>
            <div class="benefit-item d-flex align-center mb-3">
              <v-icon color="cyan-accent-3" class="mr-2" size="small">mdi-check-circle-outline</v-icon>
              <span class="text-body-2 text-grey-lighten-2 font-weight-medium">Export beautifully formatted PDFs</span>
            </div>
            <div class="benefit-item d-flex align-center mb-3">
              <v-icon color="cyan-accent-3" class="mr-2" size="small">mdi-check-circle-outline</v-icon>
              <span class="text-body-2 text-grey-lighten-2 font-weight-medium">Send invoices directly to clients via email</span>
            </div>
            <div class="benefit-item d-flex align-center mb-3">
              <v-icon color="cyan-accent-3" class="mr-2" size="small">mdi-check-circle-outline</v-icon>
              <span class="text-body-2 text-grey-lighten-2 font-weight-medium">Accept credit cards, Google Pay & ACH via Stripe</span>
            </div>
          </div>

          <!-- Social Signup -->
          <v-btn
            @click="handleGoogleAuth"
            :loading="authLoading"
            class="google-auth-btn font-weight-bold w-100 mb-6"
            size="large"
            rounded="xl"
          >
            <svg class="mr-2" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {{ authMode === 'signup' ? 'Sign up with Google' : 'Sign in with Google' }}
          </v-btn>

          <div class="separator-text text-center text-caption text-grey-lighten-1 mb-6">
            <span>OR CONTINUE WITH EMAIL</span>
          </div>

          <!-- Email/Password Form -->
          <v-form @submit.prevent="handleAuth">
            <v-text-field
              label="Email Address"
              v-model="authEmail"
              type="email"
              required
              variant="solo"
              density="comfortable"
              class="mb-3"
            ></v-text-field>

            <v-text-field
              label="Password"
              v-model="authPassword"
              type="password"
              required
              variant="solo"
              density="comfortable"
              class="mb-4"
            ></v-text-field>

            <v-alert v-if="authError" type="error" dense outlined class="mb-4">{{ authError }}</v-alert>

            <v-btn
              type="submit"
              color="primary"
              class="font-weight-bold w-100"
              size="large"
              rounded="xl"
              :loading="authLoading"
            >
              {{ authMode === 'signup' ? 'Create Account & Save' : 'Sign In & Save' }}
            </v-btn>
          </v-form>

          <div class="text-center mt-6">
            <p class="text-body-2 text-grey-lighten-2 mb-0">
              {{ authMode === 'signup' ? 'Already have an account?' : "Don't have an account?" }}
              <a
                href="#"
                class="text-cyan font-weight-bold text-decoration-none ml-1"
                @click.prevent="authMode = authMode === 'signup' ? 'login' : 'signup'"
              >
                {{ authMode === 'signup' ? 'Log In' : 'Sign Up' }}
              </a>
            </p>
          </div>
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

/* Guest & Auth Modal Premium Styles */
.guest-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(6, 182, 212, 0.08);
  border: 1px solid rgba(6, 182, 212, 0.2);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  color: #e2e8f0;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(6, 182, 212, 0.15);
}

.banner-glow-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 10% 20%, rgba(6, 182, 212, 0.1) 0%, transparent 60%);
  pointer-events: none;
}

.guest-preview-banner {
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.auth-modal-card {
  background: rgba(17, 29, 47, 0.95) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(24px) !important;
  border-radius: 16px !important;
  box-shadow: 0 25px 70px rgba(0,0,0,0.6) !important;
  color: #f1f5f9 !important;
}

.auth-modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.google-auth-btn {
  background: #ffffff !important;
  color: #1e293b !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  transition: all 0.3s ease !important;
}

.google-auth-btn:hover {
  background: #f8fafc !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15) !important;
}

.separator-text {
  position: relative;
}

.separator-text::before,
.separator-text::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 20%;
  height: 1px;
  background: rgba(255,255,255,0.1);
}

.separator-text::before {
  left: 5%;
}

.separator-text::after {
  right: 5%;
}

.text-cyan {
  color: #06b6d4 !important;
}

.text-navy {
  color: #111d2f !important;
}

@media (max-width: 768px) {
  .guest-banner {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  .guest-banner .v-btn {
    width: 100%;
    margin-left: 0 !important;
  }
}
</style>
