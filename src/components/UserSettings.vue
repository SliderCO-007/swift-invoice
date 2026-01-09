<template>
  <v-container>
    <v-card class="pa-4">
      <v-card-title class="text-h5 font-weight-bold mb-4">Business Information</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="saveSettings">
          <v-text-field
            v-model="settings.companyName"
            label="Company Name"
            variant="outlined"
            class="mb-4"
          ></v-text-field>
          <v-textarea
            v-model="settings.address"
            label="Address"
            variant="outlined"
            class="mb-4"
          ></v-textarea>
          <v-text-field
            v-model="settings.phoneNumber"
            label="Phone Number"
            variant="outlined"
            class="mb-4"
          ></v-text-field>
          <v-file-input
            v-model="logoFile"
            label="Company Logo"
            accept="image/*"
            variant="outlined"
            class="mb-4"
            @change="onFileChange"
          ></v-file-input>
          <v-img v-if="logoPreview" :src="logoPreview" height="100" class="mb-4"></v-img>
          <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
          <v-alert v-if="success" type="success" class="mb-4">Settings saved successfully!</v-alert>
          <v-btn type="submit" color="primary" :loading="loading">Save Settings</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import useUserSettings from '../composables/useUserSettings';

const { settings, loading, error, success, fetchUserSettings, saveUserSettings } = useUserSettings();

const logoFile = ref(null);
const logoPreview = ref(null);

// Fetch existing settings when the component mounts
onMounted(async () => {
  await fetchUserSettings();
  if (settings.value.logoUrl) {
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
    logoPreview.value = settings.value.logoUrl || null;
  }
};

const saveSettings = async () => {
  await saveUserSettings(logoFile.value);
};
</script>
