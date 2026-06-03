<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import useUserSettings from '../composables/useUserSettings';
import useStripeConnect from '../composables/useStripeConnect';
import { currentUser, userProfile, isAuthReady } from '../composables/useAuth.js';

const router = useRouter();

const { 
  settings, 
  loading, 
  error, 
  saveUserSettings, 
  sendPreviewEmail,
} = useUserSettings();

const { 
  connectStatus, 
  fetchConnectStatus 
} = useStripeConnect();

onMounted(async () => {
  await isAuthReady;
  if (currentUser.value) {
    await fetchConnectStatus();
  }
});


const logoFile = ref(null);
const logoPreview = ref(null);
const successMessage = ref('');
const previewLoading = ref(false);
const previewMessage = ref('');
const previewError = ref('');

const localSettings = ref({
  company: { name: '', email: '', phone: '', address1: '', address2: '', city: '', state: '', zip: '', logoUrl: '', primaryColor: '#1a3a52' },
  taxRate: 0,
  currency: 'USD',
});

const isSubscribed = computed(() => {
  return userProfile.value?.subscriptionStatus === 'active';
});

watch(settings, (newSettings) => {
  if (newSettings) {
    localSettings.value = JSON.parse(JSON.stringify(newSettings));
    logoPreview.value = newSettings.company.logoUrl;
  }
}, { deep: true, immediate: true });

const onFileChange = (e, type) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    if (type === 'logo') {
      logoFile.value = file;
      logoPreview.value = event.target.result;
    }
  };
  reader.readAsDataURL(file);
};

const handleSave = async () => {
  await saveUserSettings(localSettings.value, logoFile.value);
  if (!error.value) {
    successMessage.value = 'Settings saved successfully!';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => { successMessage.value = '' }, 5000);
  }
};

// CORRECTED: This function now uses the composable
const handleSendPreview = async () => {
  previewLoading.value = true;
  previewMessage.value = '';
  previewError.value = '';

  const recipientEmail = localSettings.value.company?.email || currentUser.value?.email;

  if (!recipientEmail) {
    previewError.value = 'Company email is not set. Please add a company email.';
    previewLoading.value = false;
    return;
  }

  try {
    const message = await sendPreviewEmail(recipientEmail);
    previewMessage.value = message;
  } catch (err) {
    previewError.value = err.message;
  } finally {
    previewLoading.value = false;
  }
};



const goToPricing = () => {
  router.push({ name: 'Pricing' });
};

</script>

<template>
  <div class="settings-container">
    <div v-if="loading && !settings.company.name" class="page-loading-container">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
        <p>Loading settings...</p>
    </div>
    <div v-else class="settings-card">
      <header class="settings-header">
        <div>
          <h1>User Settings</h1>
          <p>Manage your company information, logo, and payment details.</p>
        </div>
        <v-btn @click="router.push({ name: 'Dashboard' })" class="back-btn" color="white" variant="flat">
          &larr; Back to Dashboard
        </v-btn>
      </header>
      <div v-if="successMessage" class="success-notification">{{ successMessage }}</div>
      
      <div class="preview-section">
        <h3>Weekly Report</h3>
        <div v-if="isSubscribed">
          <p>As a subscriber, you get a weekly report emailed to you. Send a preview of the report to your email.</p>
          <v-btn @click="handleSendPreview" :loading="previewLoading" class="preview-btn" color="indigo-darken-3">
            Send Preview
          </v-btn>
          <div v-if="previewMessage" class="preview-message success-notification">{{ previewMessage }}</div>
          <div v-if="previewError" class="preview-message error-notification">{{ previewError }}</div>
        </div>
        <div v-else>
          <p>Upgrade to a premium plan to receive automated weekly reports summarizing your invoice activity.</p>
          <v-btn @click="goToPricing" class="subscribe-btn" color="green-darken-1">Subscribe Now</v-btn>
        </div>
      </div>

      <form @submit.prevent="handleSave" class="settings-form">
        
        <div class="uploaders-section">
          <div class="uploader-item">
              <h3>Company Logo</h3>
              <div class="logo-uploader">
                  <label for="logoUpload" class="logo-preview-wrapper">
                      <img :src="logoPreview || '/placeholder-logo.png'" alt="Company Logo" class="logo-img"/>
                      <div class="upload-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>
                      </div>
                  </label>
                  <input id="logoUpload" type="file" @change="onFileChange($event, 'logo')" accept="image/*" hidden>
              </div>
          </div>
        </div>

        <div class="company-info-section">
          <h3>Company Information</h3>
          <div class="form-grid">
            <v-text-field label="Company Name" v-model="localSettings.company.name" placeholder="e.g., ScanGo Creations Inc." variant="solo"></v-text-field>
            <v-text-field label="Email" v-model="localSettings.company.email" placeholder="e.g., contact@scango.com" variant="solo"></v-text-field>
            <v-text-field label="Address Line 1" v-model="localSettings.company.address1" placeholder="e.g., 123 Innovation Drive" variant="solo" class="full-width"></v-text-field>
            <v-text-field label="Address Line 2 (Optional)" v-model="localSettings.company.address2" placeholder="e.g., Suite 500" variant="solo" class="full-width"></v-text-field>
            <v-text-field label="City" v-model="localSettings.company.city" placeholder="e.g., Tech City" variant="solo"></v-text-field>
            <v-text-field label="State" v-model="localSettings.company.state" placeholder="e.g., CA" variant="solo"></v-text-field>
            <v-text-field label="Zip Code" v-model="localSettings.company.zip" placeholder="e.g., 94016" variant="solo" class="full-width"></v-text-field>
            <v-text-field label="Default Tax Rate (%)" type="number" v-model.number="localSettings.taxRate" placeholder="e.g., 10" variant="solo"></v-text-field>
            <v-text-field label="Company Phone" v-model="localSettings.company.phone" placeholder="e.g., +1 (555) 019-2834" variant="solo"></v-text-field>
            <v-select label="Currency" :items="['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR', 'BRL', 'MXN', 'ZAR', 'SGD', 'NZD', 'CHF', 'HKD']" v-model="localSettings.currency" variant="solo"></v-select>
            <div class="form-group branding-group">
                <label class="color-label">Brand Primary Color</label>
                <div class="color-input-wrapper">
                    <input type="color" v-model="localSettings.company.primaryColor" class="color-picker" />
                    <span class="color-hex">{{ localSettings.company.primaryColor }}</span>
                </div>
            </div>
          </div>
        </div>
        
        <div class="payment-info-section">
            <h3>Payments & Integrations</h3>
            
            <!-- Stripe Connect Section -->
            <div class="stripe-connect-card">
              <div class="stripe-header">
                <div class="stripe-title-wrapper">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" class="stripe-logo" crossorigin="anonymous" />
                  <h4>Online Payment Collection</h4>
                </div>
                <div class="stripe-status" :class="{ 'connected': connectStatus.chargesEnabled }">
                  <span class="status-indicator"></span>
                  {{ connectStatus.chargesEnabled ? 'Connected & Verified' : (connectStatus.connected ? 'Pending Verification' : 'Not Connected') }}
                </div>
              </div>
              
              <div class="stripe-body">
                <p>
                  Stripe Connect is used to securely accept credit cards, Apple Pay, Google Pay, and bank payments directly on your invoices.
                </p>
                
                <v-btn 
                  to="/onboarding?step=2" 
                  color="indigo-darken-3" 
                  class="stripe-btn mt-4" 
                  prepend-icon="mdi-credit-card-outline"
                >
                  Manage Payment Account
                </v-btn>
              </div>
            </div>
        </div>

        <footer class="settings-footer">
          <div v-if="error" class="error-notification">{{ error }}</div>
          <v-btn type="submit" class="save-btn" :loading="loading" color="indigo-darken-3">Save Settings</v-btn>
        </footer>
      </form>
    </div>


  </div>
</template>

<style scoped>
.page-loading-container { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; gap: 1.5rem; color: #f1f5f9; }
.settings-container { padding: 1rem; background-color: #111d2f; display: flex; justify-content: center; align-items: flex-start; min-height: 100vh; color: #f1f5f9; }
.settings-card { width: 100%; max-width: 800px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); backdrop-filter: blur(16px); border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.4); padding: 2.5rem; color: #f1f5f9; }
.settings-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
.settings-header h1 { font-size: 2.2rem; font-weight: 700; color: #fff; }
.settings-header p { color: #94a3b8; font-size: 1.1rem; }
.preview-section { margin-bottom: 2.5rem; padding: 1.5rem; background: rgba(255, 255, 255, 0.02); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); }
.preview-section h3 { font-size: 1.3rem; font-weight: 600; margin-bottom: 0.5rem; color: #fff; }
.preview-section p { margin-bottom: 1rem; color: #e2e8f0; }
.preview-btn, .subscribe-btn { text-transform: none; }
.preview-message { margin-top: 1rem; font-weight: 600; }
.back-btn { text-transform: none; font-weight: 600; color: #1e293b !important; }
.settings-form h3 { font-size: 1.3rem; font-weight: 600; margin-bottom: 1.5rem; color: #fff; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
.uploaders-section { display: flex; gap: 3rem; margin-bottom: 2.5rem; justify-content: center; align-items: flex-start; text-align: center; }
.uploader-item h3 { margin-bottom: 1.5rem; }
.logo-uploader { display: flex; justify-content: center; align-items: center; }
.logo-preview-wrapper { position: relative; width: 150px; height: 150px; border-radius: 12px; cursor: pointer; overflow: hidden; border: 3px solid rgba(255, 255, 255, 0.1); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
.logo-img { width: 100%; height: 100%; object-fit: cover; }
.upload-icon { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); color: white; display: flex; justify-content: center; align-items: center; opacity: 0; transition: opacity 0.3s ease; }
.logo-preview-wrapper:hover .upload-icon { opacity: 1; }
.company-info-section, .payment-info-section { margin-top: 2.5rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group.full-width, .full-width { grid-column: 1 / -1; }
.form-group label { font-weight: 600; display: block; margin-bottom: 0.5rem; color: #e2e8f0; }
.settings-footer { display: flex; justify-content: flex-end; align-items: center; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.save-btn { text-transform: none; font-weight: 600; }
.success-notification, .error-notification { margin-right: 1.5rem; font-weight: 600; }
.success-notification { width: 100%; text-align: center; color: #4ade80; margin-bottom: 1.5rem; }
.error-notification { color: #f87171; }

.help-icon { color: #94a3b8; }
.help-dialog-card { padding: 1rem; background-color: #1e293b; color: #f1f5f9; }
.help-dialog-card .headline { font-weight: 600; color: #fff; }

.branding-group { padding: 0.5rem 0; }
.color-label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #e2e8f0; font-size: 0.875rem; }
.color-input-wrapper { display: flex; align-items: center; gap: 1rem; background: rgba(255, 255, 255, 0.05); padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); }
.color-picker { width: 40px; height: 40px; border: none; cursor: pointer; background: transparent; padding: 0; border-radius: 4px; overflow: hidden; }
.color-picker::-webkit-color-swatch-wrapper { padding: 0; }
.color-picker::-webkit-color-swatch { border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; }
.color-hex { font-family: monospace; font-size: 1.1rem; color: #fff; }

.stripe-connect-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(99, 91, 255, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1rem;
}
.stripe-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}
.stripe-title-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.stripe-logo {
  height: 26px;
  width: auto;
}
.stripe-title-wrapper h4 {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  color: #fff;
}
.stripe-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #f87171; /* red for not connected */
  background: rgba(248, 113, 113, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
}
.stripe-status.connected {
  color: #4ade80; /* green for connected */
  background: rgba(74, 222, 128, 0.1);
}
.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
}
.stripe-body p {
  color: #e2e8f0;
  line-height: 1.5;
}
.stripe-btn {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0;
}


@media (max-width: 768px) {
  .settings-card { padding: 1.5rem; }
  .settings-header { flex-direction: column; align-items: flex-start; }
  .settings-header h1 { font-size: 1.8rem; }
  .back-btn { margin-top: 1rem; width: 100%; text-align: center; }
  .uploaders-section { flex-direction: column; align-items: center; gap: 2rem; }
  .form-grid { grid-template-columns: 1fr; }
  .settings-footer { flex-direction: column; }
  .save-btn { width: 100%; }
  .success-notification, .error-notification { width: 100%; text-align: center; margin-bottom: 1rem; margin-right: 0; }
}
</style>