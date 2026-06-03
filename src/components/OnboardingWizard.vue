<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import useUserSettings from '../composables/useUserSettings';
import useStripeConnect from '../composables/useStripeConnect';
import { currentUser, isAuthReady } from '../composables/useAuth.js';

const router = useRouter();
const route = useRoute();

const { 
  settings, 
  loading: settingsLoading, 
  error: settingsError, 
  saveUserSettings,
} = useUserSettings();

const { 
  connectStatus, 
  fetchConnectStatus, 
  createConnectAccount, 
  loading: stripeLoading 
} = useStripeConnect();

const currentStep = ref(1);
const logoFile = ref(null);
const logoPreview = ref(null);
const saveError = ref('');
const isSaving = ref(false);

const localSettings = ref({
  company: { name: '', email: '', phone: '', address1: '', address2: '', city: '', state: '', zip: '', logoUrl: '', primaryColor: '#1a3a52' },
  taxRate: 0,
  currency: 'USD',
});

// Watch settings and populate local state
watch(settings, (newSettings) => {
  if (newSettings) {
    localSettings.value = {
      company: {
        name: newSettings.company?.name || '',
        email: newSettings.company?.email || '',
        phone: newSettings.company?.phone || '',
        address1: newSettings.company?.address1 || '',
        address2: newSettings.company?.address2 || '',
        city: newSettings.company?.city || '',
        state: newSettings.company?.state || '',
        zip: newSettings.company?.zip || '',
        logoUrl: newSettings.company?.logoUrl || '',
        primaryColor: newSettings.company?.primaryColor || '#1a3a52',
      },
      taxRate: newSettings.taxRate || 0,
      currency: newSettings.currency || 'USD',
    };
    logoPreview.value = newSettings.company?.logoUrl;
  }
}, { deep: true, immediate: true });

onMounted(async () => {
  await isAuthReady;
  if (currentUser.value) {
    const status = await fetchConnectStatus();
    
    // Determine initial step based on query params or settings state
    if (route.query.step) {
      currentStep.value = parseInt(route.query.step);
    } else if (status?.chargesEnabled) {
      // If payment is already connected, show congratulations page
      currentStep.value = 3;
    } else if (settings.value?.company?.name) {
      // If company info is filled but payments are not, show Step 2
      currentStep.value = 2;
    } else {
      currentStep.value = 1;
    }
  }
});

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    logoFile.value = file;
    logoPreview.value = event.target.result;
  };
  reader.readAsDataURL(file);
};

const handleSaveCompany = async () => {
  if (!localSettings.value.company.name) {
    saveError.value = 'Company Name is required.';
    return;
  }
  
  isSaving.value = true;
  saveError.value = '';
  
  try {
    await saveUserSettings(localSettings.value, logoFile.value);
    if (!settingsError.value) {
      currentStep.value = 2;
    } else {
      saveError.value = settingsError.value;
    }
  } catch (err) {
    saveError.value = err.message || 'Failed to save settings.';
  } finally {
    isSaving.value = false;
  }
};

const handleSkipCompany = () => {
  currentStep.value = 2;
};

const handleStripeConnect = async () => {
  await createConnectAccount();
};

const handleSkipPayment = () => {
  router.push('/dashboard');
};

const goToDashboard = () => {
  router.push('/dashboard');
};
</script>

<template>
  <div class="onboarding-container">
    <div v-if="settingsLoading" class="page-loading-container">
      <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
      <p>Loading onboarding wizard...</p>
    </div>
    
    <div v-else class="onboarding-card">
      <!-- Steps Indicators -->
      <div v-if="currentStep <= 2" class="steps-indicator">
        <div class="step-item" :class="{ 'active': currentStep === 1, 'completed': currentStep > 1 }">
          <div class="step-number">1</div>
          <div class="step-label">Company Details</div>
        </div>
        <div class="step-line" :class="{ 'completed': currentStep > 1 }"></div>
        <div class="step-item" :class="{ 'active': currentStep === 2, 'completed': currentStep > 2 }">
          <div class="step-number">2</div>
          <div class="step-label">Payment Settings</div>
        </div>
      </div>

      <!-- STEP 1: COMPANY DETAILS -->
      <div v-if="currentStep === 1" class="step-content">
        <header class="step-header">
          <h1>Tell us about your business</h1>
          <p>This information will appear on your invoices. You can always change it later in settings.</p>
        </header>

        <form @submit.prevent="handleSaveCompany" class="onboarding-form">
          <div class="logo-upload-wrapper">
            <h3>Business Logo</h3>
            <div class="logo-uploader">
              <label for="logoUpload" class="logo-preview-wrapper">
                <img :src="logoPreview || '/placeholder-logo.png'" alt="Company Logo" class="logo-img"/>
                <div class="upload-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
                    <path d="M0 0h24v24H0V0z" fill="none"/><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                  </svg>
                </div>
              </label>
              <input id="logoUpload" type="file" @change="onFileChange" accept="image/*" hidden>
            </div>
          </div>

          <div class="form-grid">
            <v-text-field 
              label="Company Name *" 
              v-model="localSettings.company.name" 
              placeholder="e.g., ScanGo Creations Inc." 
              variant="solo"
              required
            ></v-text-field>
            <v-text-field 
              label="Contact Email" 
              v-model="localSettings.company.email" 
              placeholder="e.g., billing@company.com" 
              variant="solo"
            ></v-text-field>
            <v-text-field 
              label="Company Phone" 
              v-model="localSettings.company.phone" 
              placeholder="e.g., +1 (555) 019-2834" 
              variant="solo"
            ></v-text-field>
            
            <v-text-field 
              label="Address Line 1" 
              v-model="localSettings.company.address1" 
              placeholder="e.g., 123 Main St" 
              variant="solo" 
              class="full-width"
            ></v-text-field>
            <v-text-field 
              label="Address Line 2 (Optional)" 
              v-model="localSettings.company.address2" 
              placeholder="e.g., Suite 100" 
              variant="solo" 
              class="full-width"
            ></v-text-field>
            
            <v-text-field 
              label="City" 
              v-model="localSettings.company.city" 
              placeholder="e.g., Austin" 
              variant="solo"
            ></v-text-field>
            <v-text-field 
              label="State/Province" 
              v-model="localSettings.company.state" 
              placeholder="e.g., TX" 
              variant="solo"
            ></v-text-field>
            <v-text-field 
              label="Zip/Postal Code" 
              v-model="localSettings.company.zip" 
              placeholder="e.g., 78701" 
              variant="solo"
            ></v-text-field>
            <v-text-field 
              label="Default Tax Rate (%)" 
              type="number" 
              v-model.number="localSettings.taxRate" 
              placeholder="0" 
              variant="solo"
            ></v-text-field>
            
            <v-select 
              label="Invoice Currency" 
              :items="['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR', 'BRL', 'MXN', 'ZAR', 'SGD', 'NZD', 'CHF', 'HKD']" 
              v-model="localSettings.currency" 
              variant="solo"
            ></v-select>
            
            <div class="form-group branding-group">
              <div class="color-input-wrapper">
                <div class="color-label-inside">
                  <label class="color-label">Brand Color</label>
                  <span class="color-hex">{{ localSettings.company.primaryColor }}</span>
                </div>
                <input type="color" v-model="localSettings.company.primaryColor" class="color-picker" />
              </div>
            </div>
          </div>

          <div v-if="saveError" class="error-notification">{{ saveError }}</div>

          <footer class="wizard-footer">
            <v-btn type="button" variant="text" class="skip-btn" @click="handleSkipCompany">Skip for now</v-btn>
            <v-btn type="submit" class="continue-btn" :loading="isSaving" color="indigo-darken-3">Save & Continue</v-btn>
          </footer>
        </form>
      </div>

      <!-- STEP 2: CONNECT PAYMENT ACCOUNT -->
      <div v-else-if="currentStep === 2" class="step-content">
        <header class="step-header text-center">
          <h1>Connect Payment Account</h1>
          <p>Directly accept secure debit, credit card, Apple Pay, and ACH payments from your invoices.</p>
        </header>

        <div class="stripe-connect-flow">
          <div class="stripe-large-badge">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" class="stripe-badge-img" crossorigin="anonymous" />
            <div class="stripe-features">
              <div class="feature-item">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#4ade80"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                <span>Accept Visa, Mastercard, AMEX, Apple Pay, Google Pay & ACH</span>
              </div>
              <div class="feature-item">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#4ade80"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                <span>Payments deposited directly into your bank account</span>
              </div>
              <div class="feature-item">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#4ade80"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                <span>Instant "Scan to Pay" QR Code embedded in invoice PDFs</span>
              </div>
            </div>
          </div>

          <div v-if="connectStatus.connected && !connectStatus.chargesEnabled" class="stripe-status-banner warning">
            <span class="pulse-indicator orange"></span>
            <div>
              <strong>Pending Verification:</strong> Stripe needs a bit more information to verify your identity before enabling charge processing.
            </div>
          </div>

          <div v-if="!connectStatus.connected" class="stripe-warning-callout">
            <div class="callout-icon">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            </div>
            <div class="callout-text">
              <strong>Important:</strong> You will not be able to accept online payments on your invoices until you create or connect a payment account.
            </div>
          </div>

          <div class="action-wrapper text-center">
            <v-btn 
              @click="handleStripeConnect" 
              :loading="stripeLoading" 
              color="#635bff" 
              class="stripe-connect-btn" 
              size="large"
              prepend-icon="mdi-credit-card-outline"
            >
              {{ connectStatus.connected ? 'Resume Stripe Setup' : 'Connect with Stripe' }}
            </v-btn>
            
            <p class="terms-text">You will be redirected securely to Stripe to set up your payment routing. Platform fee of 0.5% applies to payments collected.</p>
          </div>

          <footer class="wizard-footer justify-center mt-6">
            <v-btn variant="text" class="skip-btn" @click="handleSkipPayment">
              {{ connectStatus.connected ? 'Go to Dashboard' : 'Skip payment setup for now' }}
            </v-btn>
          </footer>
        </div>
      </div>

      <!-- STEP 3: CONGRATULATIONS SCREEN -->
      <div v-else-if="currentStep === 3" class="step-content congratulations-step text-center">
        <div class="celebration-icon">
          <div class="glow-ring"></div>
          <svg xmlns="http://www.w3.org/2000/svg" height="64px" viewBox="0 0 24 24" width="64px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
        </div>

        <header class="step-header">
          <h1>You're Ready to Roll!</h1>
          <p class="congrats-message">Congratulations! You have completed the onboarding flow.</p>
          <p class="sub-congrats">Your business details are saved and your Stripe account is connected. You can now build beautiful invoices and accept instant online payments.</p>
        </header>

        <footer class="wizard-footer justify-center mt-6">
          <v-btn class="dashboard-btn" color="indigo-darken-3" size="large" @click="goToDashboard">
            Go to Dashboard &rarr;
          </v-btn>
        </footer>
      </div>

    </div>
  </div>
</template>

<style scoped>
.page-loading-container { 
  display: flex; 
  flex-direction: column; 
  justify-content: center; 
  align-items: center; 
  height: 50vh; 
  gap: 1.5rem; 
  color: #f1f5f9; 
}

.onboarding-container { 
  padding: 2rem 1rem; 
  background-color: #111d2f; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  min-height: 100vh; 
  color: #f1f5f9; 
}

.onboarding-card { 
  width: 100%; 
  max-width: 750px; 
  background: rgba(255, 255, 255, 0.03); 
  border: 1px solid rgba(255, 255, 255, 0.08); 
  backdrop-filter: blur(16px); 
  border-radius: 16px; 
  box-shadow: 0 20px 60px rgba(0,0,0,0.5); 
  padding: 3rem; 
}

/* Steps indicator */
.steps-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 3rem;
  max-width: 450px;
  margin-left: auto;
  margin-right: auto;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
}

.step-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.15);
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  color: #94a3b8;
  transition: all 0.3s ease;
}

.step-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #94a3b8;
  margin-top: 0.5rem;
  transition: all 0.3s ease;
}

.step-line {
  flex-grow: 1;
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
  margin-left: 1rem;
  margin-right: 1rem;
  margin-top: -1.5rem;
  z-index: 1;
  transition: all 0.3s ease;
}

.step-item.active .step-number {
  background: #3f51b5;
  border-color: #5c6bc0;
  color: #fff;
  box-shadow: 0 0 15px rgba(92, 107, 192, 0.4);
}

.step-item.active .step-label {
  color: #fff;
}

.step-item.completed .step-number {
  background: #4ade80;
  border-color: #4ade80;
  color: #111d2f;
}

.step-item.completed .step-label {
  color: #4ade80;
}

.step-line.completed {
  background: #4ade80;
}

/* Step Header */
.step-header {
  margin-bottom: 2.5rem;
}

.step-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.5rem;
}

.step-header p {
  color: #94a3b8;
  font-size: 1.05rem;
}

/* Logo Upload */
.logo-upload-wrapper {
  margin-bottom: 2rem;
  text-align: center;
}

.logo-upload-wrapper h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.logo-uploader { 
  display: flex; 
  justify-content: center; 
  align-items: center; 
}

.logo-preview-wrapper { 
  position: relative; 
  width: 130px; 
  height: 130px; 
  border-radius: 12px; 
  cursor: pointer; 
  overflow: hidden; 
  border: 3px solid rgba(255, 255, 255, 0.1); 
  box-shadow: 0 4px 8px rgba(0,0,0,0.2); 
  background: rgba(255,255,255,0.02);
}

.logo-img { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
}

.upload-icon { 
  position: absolute; 
  top: 0; 
  left: 0; 
  right: 0; 
  bottom: 0; 
  background: rgba(0,0,0,0.5); 
  color: white; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  opacity: 0; 
  transition: opacity 0.3s ease; 
}

.logo-preview-wrapper:hover .upload-icon { 
  opacity: 1; 
}

/* Form layout */
.form-grid { 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 1rem; 
}

.full-width { 
  grid-column: 1 / -1; 
}

.branding-group { 
  padding: 0; 
}

.color-label-inside { 
  display: flex; 
  flex-direction: column; 
  text-align: left; 
}

.color-label { 
  font-size: 0.75rem; 
  color: #94a3b8; 
  margin-bottom: 2px; 
  font-weight: 500; 
}

.color-input-wrapper { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  background: rgba(255, 255, 255, 0.03); 
  padding: 0 1rem; 
  border-radius: 8px; 
  border: 1px solid rgba(255, 255, 255, 0.08); 
  height: 56px; 
  box-sizing: border-box; 
}

.color-picker { 
  width: 85px; 
  height: 38px; 
  border: none; 
  cursor: pointer; 
  background: transparent; 
  padding: 0; 
  border-radius: 6px; 
  overflow: hidden; 
}

.color-picker::-webkit-color-swatch-wrapper { 
  padding: 0; 
}

.color-picker::-webkit-color-swatch { 
  border: 1px solid rgba(255,255,255,0.25); 
  border-radius: 6px; 
}

.color-hex { 
  font-family: monospace; 
  font-size: 0.95rem; 
  color: #fff; 
  line-height: 1.2; 
}

.error-notification { 
  color: #f87171; 
  font-weight: 600;
  margin-top: 1rem;
  text-align: center;
}

/* Footer buttons */
.wizard-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.continue-btn {
  text-transform: none;
  font-weight: 600;
}

.skip-btn {
  text-transform: none;
  color: #94a3b8 !important;
}

/* Step 2 Payment Connection CSS */
.stripe-connect-flow {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.stripe-large-badge {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(99, 91, 255, 0.2);
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.stripe-badge-img {
  height: 40px;
  width: auto;
}

.stripe-features {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1rem;
  color: #e2e8f0;
}

.stripe-status-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  font-size: 0.95rem;
  line-height: 1.5;
}

.stripe-status-banner.warning {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #fbbf24;
}

.stripe-warning-callout {
  display: flex;
  gap: 1rem;
  background: rgba(248, 113, 113, 0.08);
  border: 1px solid rgba(248, 113, 113, 0.25);
  border-radius: 8px;
  padding: 1rem 1.5rem;
  color: #f87171;
}

.callout-icon {
  flex-shrink: 0;
  color: #f87171;
}

.callout-text {
  font-size: 0.95rem;
  line-height: 1.5;
}

.action-wrapper {
  margin-top: 1rem;
}

.stripe-connect-btn {
  text-transform: none;
  font-weight: 700;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 15px rgba(99, 91, 255, 0.3);
  transition: all 0.3s ease;
}

.stripe-connect-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 91, 255, 0.4);
}

.terms-text {
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 1rem;
}

.pulse-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.pulse-indicator.orange {
  background-color: #fbbf24;
  animation: pulse-orange 2s infinite;
}

@keyframes pulse-orange {
  0% {
    box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.7);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(251, 191, 36, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(251, 191, 36, 0);
  }
}

/* Step 3 Congratulations Step */
.congratulations-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 2rem 0;
}

.celebration-icon {
  position: relative;
  width: 120px;
  height: 120px;
  background: rgba(74, 222, 128, 0.1);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #4ade80;
  border: 2px solid rgba(74, 222, 128, 0.3);
}

.glow-ring {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border-radius: 50%;
  border: 2px solid rgba(74, 222, 128, 0.15);
  animation: radar-ring 2.5s infinite linear;
}

@keyframes radar-ring {
  0% {
    transform: scale(0.9);
    opacity: 1;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

.congrats-message {
  font-size: 1.5rem;
  font-weight: 700;
  color: #4ade80;
  margin-top: 1rem;
}

.sub-congrats {
  max-width: 550px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.dashboard-btn {
  text-transform: none;
  font-weight: 700;
  padding-left: 2rem !important;
  padding-right: 2rem !important;
  box-shadow: 0 4px 15px rgba(92, 107, 192, 0.3);
}

.dashboard-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(92, 107, 192, 0.4);
}

@media (max-width: 768px) {
  .onboarding-card { padding: 2rem 1.5rem; }
  .form-grid { grid-template-columns: 1fr; }
  .wizard-footer { flex-direction: column-reverse; gap: 1rem; }
  .continue-btn, .skip-btn { width: 100%; }
}
</style>
