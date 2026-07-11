<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import useUserSettings from '../composables/useUserSettings';
import { currentUser, isAuthReady } from '../composables/useAuth.js';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

const router = useRouter();

const { 
  settings, 
  loading: settingsLoading, 
  error: settingsError, 
  saveUserSettings,
} = useUserSettings();

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
      router.push('/dashboard');
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
      <!-- STEP 1: COMPANY DETAILS -->
      <div class="step-content">
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
            <v-btn type="submit" class="continue-btn" :loading="isSaving" color="indigo-darken-3">Save & Go to Dashboard</v-btn>
          </footer>
        </form>
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
  border-radius: 4px; 
  overflow: hidden; 
}

.color-picker::-webkit-color-swatch-wrapper { 
  padding: 0; 
}

.color-picker::-webkit-color-swatch { 
  border: 1px solid rgba(255,255,255,0.2); 
  border-radius: 4px; 
}

.color-hex { 
  font-family: monospace; 
  font-size: 1.1rem; 
  color: #fff; 
}

.error-notification { 
  background-color: rgba(239, 68, 68, 0.1); 
  border: 1px solid rgba(239, 68, 68, 0.2); 
  color: #f87171; 
  padding: 1rem; 
  border-radius: 8px; 
  margin-top: 1.5rem; 
  font-size: 0.95rem; 
}

.wizard-footer { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-top: 2.5rem; 
  padding-top: 1.5rem; 
  border-top: 1px solid rgba(255,255,255,0.08); 
}

.skip-btn { 
  color: #94a3b8 !important; 
  font-weight: 600; 
  text-transform: none; 
  letter-spacing: 0.5px; 
}

.continue-btn { 
  font-weight: 700 !important; 
  text-transform: none !important; 
  letter-spacing: 0.5px !important; 
  border-radius: 8px !important; 
  padding: 0 2rem !important; 
  height: 48px !important; 
  box-shadow: 0 4px 15px rgba(63, 81, 181, 0.3) !important; 
}

@media (max-width: 768px) {
  .onboarding-card { padding: 2rem 1.5rem; }
  .form-grid { grid-template-columns: 1fr; }
  .wizard-footer { flex-direction: column-reverse; gap: 1rem; }
  .wizard-footer button { width: 100%; }
}
</style>
