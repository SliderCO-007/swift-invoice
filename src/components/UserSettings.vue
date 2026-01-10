<script setup>
import { ref, onMounted } from 'vue';
import useUserSettings from '../composables/useUserSettings';

const { settings, loading, error, success, fetchUserSettings, saveUserSettings } = useUserSettings();

const logoFile = ref(null);
const logoPreview = ref(null);

// Fetch existing settings when the component mounts
onMounted(async () => {
  await fetchUserSettings();
  if (settings.value && settings.value.logoUrl) {
    logoPreview.value = settings.value.logoUrl;
  }
});

const onFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    logoFile.value = file;
    // Create a local URL for image preview
    logoPreview.value = URL.createObjectURL(file);
  } else {
    logoFile.value = null;
    logoPreview.value = (settings.value && settings.value.logoUrl) || null;
  }
};

const saveSettings = async () => {
  await saveUserSettings(logoFile.value);
};

</script>

<template>
  <div class="settings-container">
    <div class="settings-card">
      <header class="settings-header">
        <h1>Settings</h1>
        <button class="back-btn" @click="$router.push('/dashboard')">Back to Dashboard</button>
      </header>

      <form @submit.prevent="saveSettings" class="settings-form">
        <h2>Business Information</h2>
        <p class="subtitle">Update your company details and logo.</p>

        <div class="form-grid">
          <!-- Company Info -->
          <div class="form-section">
            <div class="form-group">
              <label for="companyName">Company Name</label>
              <input id="companyName" type="text" v-model="settings.companyInfo.name" placeholder="e.g., Swift Inc.">
            </div>
            <div class="form-group">
              <label for="email">Email Address</label>
              <input id="email" type="email" v-model="settings.companyInfo.email" placeholder="e.g., contact@swift.com">
            </div>
            <div class="form-group">
              <label for="address">Address</label>
              <textarea id="address" v-model="settings.companyInfo.address" placeholder="e.g., 123 Main St, Anytown, USA"></textarea>
            </div>
             <div class="form-group">
              <label for="taxRate">Default Tax Rate (%)</label>
              <input id="taxRate" type="number" v-model.number="settings.defaultTaxRate" placeholder="e.g., 8.5">
            </div>
          </div>

          <!-- Logo Upload -->
          <div class="form-section logo-section">
             <label>Company Logo</label>
            <div class="logo-uploader">
              <img v-if="logoPreview" :src="logoPreview" alt="Logo Preview" class="logo-preview" />
              <div v-else class="logo-placeholder">
                 <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 0 24 24" width="48px" fill="#9e9e9e"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                 <span>Upload Logo</span>
              </div>
              <input type="file" @change="onFileChange" accept="image/*" class="file-input">
            </div>
          </div>
        </div>

        <div v-if="error" class="alert alert-error">{{ error }}</div>
        <div v-if="success" class="alert alert-success">Settings saved successfully!</div>

        <footer class="settings-footer">
          <button type="submit" class="primary-btn" :disabled="loading">
            <span v-if="loading">Saving...</span>
            <span v-else>Save Settings</span>
          </button>
        </footer>
      </form>
    </div>
  </div>
</template>


<style scoped>
.settings-container {
  padding: 2rem;
  background-color: var(--background-color, #F9FAFB);
  min-height: 100vh;
}

.settings-card {
  max-width: 1000px;
  margin: 0 auto;
  background: var(--white-color, #fff);
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
  margin-bottom: 1.5rem;
}

.settings-header h1 {
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
}
.back-btn:hover { background: #f0f0f0; }

.settings-form h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #6B7280;
  margin-bottom: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
}

input[type="text"],
input[type="email"],
input[type="number"],
textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

input:focus, textarea:focus {
  outline: none;
  border-color: var(--primary-color, #4F46E5);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

textarea {
  min-height: 120px;
  resize: vertical;
}

/* Logo Uploader */
.logo-section {
  align-items: center;
}
.logo-uploader {
  position: relative;
  width: 200px;
  height: 200px;
  border: 2px dashed #ddd;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.3s ease;
}
.logo-uploader:hover { border-color: var(--primary-color, #4F46E5); }

.logo-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-placeholder {
  text-align: center;
  color: #9e9e9e;
}
.logo-placeholder span {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.file-input {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1.5rem;
  text-align: center;
}
.alert-error { background-color: #FEE2E2; color: #B91C1C; }
.alert-success { background-color: #D1FAE5; color: #065F46; }


.settings-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

.primary-btn {
  padding: 0.8rem 2rem;
  border-radius: 20px;
  border: none;
  background: var(--primary-color, #4F46E5);
  color: var(--white-color, #fff);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}
.primary-btn:hover { opacity: 0.9; }
.primary-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Responsive */
@media(max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .logo-section {
    order: -1; /* move logo to top on mobile */
  }
  .settings-card {
    padding: 1.5rem;
  }
}

</style>
