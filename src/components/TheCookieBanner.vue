<template>
  <div v-if="showBanner" class="cookie-banner">
    <v-banner lines="three" color="grey-lighten-4" class="pa-4">
      <template v-slot:prepend>
        <v-avatar color="primary" icon="mdi-cookie"></v-avatar>
      </template>

      <div>
        <p class="text-body-1">
          We use cookies to enhance your experience. By clicking "Accept," you agree to our use of cookies for analytics.
        </p>
        <p class="text-caption mt-2">
          <a @click.prevent="dialog = true" href="#" class="text-grey-darken-1" style="cursor: pointer;">View our Cookie Policy</a>
        </p>
      </div>

      <template v-slot:actions>
        <v-btn @click="handleDecline" color="grey-darken-1">Decline</v-btn>
        <v-btn @click="handleAccept" color="primary" variant="flat">Accept</v-btn>
      </template>
    </v-banner>
  </div>

  <v-dialog v-model="dialog" scrollable max-width="850px">
    <v-card>
        <v-toolbar color="grey-lighten-4">
            <v-toolbar-title class="font-weight-bold">Cookie Policy</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click="dialog = false">
                <v-icon>mdi-close</v-icon>
            </v-btn>
        </v-toolbar>
        <v-divider></v-divider>
        <v-card-text class="pa-0">
            <CookiePolicy />
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="dialog = false">
            Close
          </v-btn>
        </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue';
// Correct composable provided by the user
import { useConsent } from "vue-gtag";
import CookiePolicy from './CookiePolicy.vue'; // Import the policy component

const dialog = ref(false); // Reactive state for the dialog

const showBanner = ref(false);
const CONSENT_COOKIE_KEY = 'cookie_consent_given';

const { acceptAll, rejectAll } = useConsent();

onMounted(() => {
  // Only show the banner if no choice has been made before.
  if (!localStorage.getItem(CONSENT_COOKIE_KEY)) {
    showBanner.value = true;
  }
});

const handleAccept = () => {
  // Use the library's built-in function to grant consent.
  acceptAll();
  
  console.log('Google Analytics consent granted.');
  localStorage.setItem(CONSENT_COOKIE_KEY, 'true');
  showBanner.value = false;
};

const handleDecline = () => {
  // Use the library's built-in function to deny consent.
  rejectAll();

  console.log('Google Analytics consent denied.');
  localStorage.setItem(CONSENT_COOKIE_KEY, 'false');
  showBanner.value = false;
};
</script>

<style scoped>
.cookie-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

a.text-grey-darken-1 {
  text-decoration: none;
}

a.text-grey-darken-1:hover {
  text-decoration: underline;
}
</style>
