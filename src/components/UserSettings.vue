<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import useUserSettings from '../composables/useUserSettings';

const router = useRouter();
const { settings, loading, error, fetchUserSettings, saveUserSettings } = useUserSettings();

const logoFile = ref(null);
const logoPreview = ref(null);
const venmoQrFile = ref(null);
const venmoQrPreview = ref(null);
const successMessage = ref('');

// A local ref to handle form data, initialized with the new structure
const localSettings = ref({
  company: {
    name: '',
    email: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    logoUrl: '',
    venmoQrUrl: ''
  },
  taxRate: 0,
});

onMounted(async () => {
  await fetchUserSettings();
  if (settings.value) {
    localSettings.value = JSON.parse(JSON.stringify(settings.value));
    logoPreview.value = localSettings.value.company.logoUrl;
    venmoQrPreview.value = localSettings.value.company.venmoQrUrl;
  }
});

watch(settings, (newSettings) => {
  if (newSettings) {
    localSettings.value = JSON.parse(JSON.stringify(newSettings));
    logoPreview.value = newSettings.company.logoUrl;
    venmoQrPreview.value = newSettings.company.venmoQrUrl;
  }
}, { deep: true });

const onFileChange = (e, type) => {
  const file = e.target.files[0];
  if (file) {
    if (type === 'logo') {
      logoFile.value = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        logoPreview.value = e.target.result;
      };
      reader.readAsDataURL(file);
    } else if (type === 'venmo') {
      venmoQrFile.value = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        venmoQrPreview.value = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
};

const handleSave = async () => {
  await saveUserSettings(localSettings.value, logoFile.value, venmoQrFile.value);
  if (!error.value) {
    successMessage.value = 'Settings saved successfully!';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => { successMessage.value = '' }, 5000);
  }
};

</script>

<template>
  <div class="settings-container">
    <div class="settings-card">
      <header class="settings-header">
        <div>
          <h1>User Settings</h1>
          <p>Manage your company information, logo, and payment QR codes.</p>
        </div>
        <button @click="router.push({ name: 'Dashboard' })" class="back-btn">
          &larr; Back to Dashboard
        </button>
      </header>
      <div v-if="successMessage" class="success-notification">{{ successMessage }}</div>
      <form @submit.prevent="handleSave" class="settings-form">
        
        <div class="uploaders-section">
          <!-- Logo Upload -->
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

          <!-- Venmo QR Code Upload -->
          <div class="uploader-item">
              <h3>Venmo QR Code</h3>
              <div class="logo-uploader">
                  <label for="venmoQrUpload" class="logo-preview-wrapper">
                      <img :src="venmoQrPreview || '/placeholder-qr.png'" alt="Venmo QR Code" class="logo-img"/>
                      <div class="upload-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>
                      </div>
                  </label>
                  <input id="venmoQrUpload" type="file" @change="onFileChange($event, 'venmo')" accept="image/*" hidden>
              </div>
          </div>
        </div>

        <!-- Company Info -->
        <div class="company-info-section">
          <h3>Company Information</h3>
          <div class="form-grid">
            <div class="form-group">
              <label for="companyName">Company Name</label>
              <input id="companyName" type="text" v-model="localSettings.company.name" placeholder="e.g., Swift Creations Inc.">
            </div>
            <div class="form-group">
              <label for="companyEmail">Email</label>
              <input id="companyEmail" type="email" v-model="localSettings.company.email" placeholder="e.g., contact@swift.com">
            </div>
            <div class="form-group full-width">
              <label for="companyAddress1">Address Line 1</label>
              <input id="companyAddress1" type="text" v-model="localSettings.company.address1" placeholder="e.g., 123 Innovation Drive">
            </div>
            <div class="form-group full-width">
              <label for="companyAddress2">Address Line 2 (Optional)</label>
              <input id="companyAddress2" type="text" v-model="localSettings.company.address2" placeholder="e.g., Suite 500">
            </div>
            <div class="form-group">
              <label for="companyCity">City</label>
              <input id="companyCity" type="text" v-model="localSettings.company.city" placeholder="e.g., Tech City">
            </div>
            <div class="form-group">
              <label for="companyState">State</label>
              <input id="companyState" type="text" v-model="localSettings.company.state" placeholder="e.g., CA">
            </div>
            <div class="form-group full-width">
              <label for="companyZip">Zip Code</label>
              <input id="companyZip" type="text" v-model="localSettings.company.zip" placeholder="e.g., 94016">
            </div>
            <div class="form-group">
              <label for="taxRate">Default Tax Rate (%)</label>
              <input id="taxRate" type="number" v-model.number="localSettings.taxRate" placeholder="e.g., 10">
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <footer class="settings-footer">
          <div v-if="error" class="error-notification">{{ error }}</div>
          <button type="submit" class="save-btn" :disabled="loading">
            {{ loading ? 'Saving...' : 'Save Settings' }}
          </button>
        </footer>
      </form>
    </div>
  </div>
</template>

<style scoped>
.settings-container {
  padding: 1rem;
  background-color: var(--background-color, #F9FAFB);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
}

.settings-card {
  width: 100%;
  max-width: 800px;
  background: var(--white-color, #fff);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  padding: 2.5rem;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
}

.settings-header h1 {
  font-size: 2.2rem;
  font-weight: 700;
}

.settings-header p {
  color: #666;
  font-size: 1.1rem;
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

.settings-form h3 {
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: var(--text-color, #111827);
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #eee;
}

.uploaders-section {
    display: flex;
    gap: 3rem;
    margin-bottom: 2.5rem;
    justify-content: center;
    align-items: flex-start;
    text-align: center;
}

.uploader-item h3 {
    margin-bottom: 1.5rem;
}

.logo-uploader {
    display: flex;
    justify-content: center;
    align-items: center;
}

.logo-preview-wrapper {
    position: relative;
    width: 150px;
    height: 150px;
    border-radius: 12px;
    cursor: pointer;
    overflow: hidden;
    border: 3px solid #eee;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.logo-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.upload-icon {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
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

.company-info-section {
    margin-top: 2.5rem;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.form-group.full-width {
    grid-column: 1 / -1;
}

.form-group label {
    font-weight: 600;
    display: block;
    margin-bottom: 0.5rem;
    color: #333;
}

.form-group input {
    width: 100%;
    padding: 0.8rem 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
}

.settings-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #eee;
}

.save-btn {
    padding: 0.9rem 2rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    background-color: var(--primary-color, #4F46E5);
    color: var(--white-color, #fff);
}

.success-notification, .error-notification {
    margin-right: 1.5rem;
    font-weight: 600;
}

.success-notification { 
  width: 100%;
  text-align: center;
  color: #28A745; 
  margin-bottom: 1.5rem;
}
.error-notification { color: #DC3545; }

@media (max-width: 768px) {
    .settings-card {
        padding: 1.5rem;
    }

    .settings-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .settings-header h1 {
        font-size: 1.8rem;
    }

    .back-btn {
        margin-top: 1rem;
        width: 100%;
        text-align: center;
    }

    .uploaders-section {
        flex-direction: column;
        align-items: center;
        gap: 2rem;
    }

    .form-grid {
        grid-template-columns: 1fr;
    }

    .settings-footer {
        flex-direction: column;
    }

    .save-btn {
        width: 100%;
    }

    .success-notification,
    .error-notification {
        width: 100%;
        text-align: center;
        margin-bottom: 1rem;
        margin-right: 0;
    }
}
</style>
