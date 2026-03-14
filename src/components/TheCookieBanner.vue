<template>
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
        <v-btn color="primary" variant="text" @click="dialog = false"> Close </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <transition name="fade-slide">
    <div v-if="showBanner" class="cookie-banner-wrapper">
      <v-card class="cookie-banner" elevation="12" tile color="grey-lighten-4">
        <div class="cookie-banner-inner">
          <v-row no-gutters align="center">
            <v-col class="px-3">
              <div class="text-body-1">We use cookies to enhance your experience.</div>
              <div class="text-caption text-grey">
                By clicking "Accept", you agree to our cookie policy.
              </div>
              <div>
                <p class="text-caption mt-2">
                  <a @click.prevent="dialog = true" href="#" class="text-grey-darken-1" style="cursor: pointer">View our
                    Cookie Policy</a>
                </p>
              </div>
            </v-col>
            <v-col cols="auto" class="px-3">
              <v-btn color="primary" variant="flat" @click="handleAccept" class="mr-2"> Accept </v-btn>
              <v-btn @click="handleDecline" color="grey-darken-1" variant="flat">Decline</v-btn>
            </v-col>
          </v-row>
        </div>
      </v-card>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useConsent } from 'vue-gtag';
import CookiePolicy from './CookiePolicy.vue';

const dialog = ref(false);
const showBanner = ref(false);
// Correctly destructure the functions from useConsent
const { acceptAll, rejectAll } = useConsent();
const CONSENT_STORAGE_KEY = 'cookie_consent_given';

onMounted(() => {
  // Show the banner only if the user has never made a choice.
  // The vue-gtag plugin will automatically handle applying the stored consent state.
  if (!localStorage.getItem(CONSENT_STORAGE_KEY)) {
    showBanner.value = true;
  }
});

const handleAccept = () => {
  // Use the correct function to grant consent.
  acceptAll();
  console.log('Google Analytics consent granted.');
  localStorage.setItem(CONSENT_STORAGE_KEY, 'true')
  showBanner.value = false;
};

const handleDecline = () => {
  // Use the correct function to deny consent.
  rejectAll();
  console.log('Google Analytics consent denied.');
  localStorage.setItem(CONSENT_STORAGE_KEY, 'false')
  showBanner.value = false;
};
</script>

<style scoped>
/* 1. Outer wrapper: full-width at bottom, never animated */
.cookie-banner-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 1500;
}

/* 2. Card: Vuetify can do whatever it wants here */
.cookie-banner {
  width: 100%;
  padding: 16px 24px; /* Increased padding for a more spacious look */
}

/* 3. Inner container: animation only */
.cookie-banner-inner {
  transform: translateY(0);
}

/* Transition */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.fade-slide-enter-from .cookie-banner-inner,
.fade-slide-leave-to .cookie-banner-inner {
  opacity: 0;
  transform: translateY(20px);
}

a.text-grey-darken-1 {
  text-decoration: none;
}

a.text-grey-darken-1:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
    .cookie-banner {
        padding: 12px;
    }

  .cookie-banner-inner {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .cookie-banner-inner .v-row {
    flex-direction: column;
    text-align: center;
  }

  .cookie-banner-inner .v-col {
    width: 100%;
  }

  /* Buttons stack vertically on mobile */
  .cookie-banner-inner .v-col[cols="auto"] {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .cookie-banner-inner .v-btn {
    width: 80%;
    margin-bottom: 8px;
    margin-left: auto;
    margin-right: auto;
  }

  .cookie-banner-inner .v-btn:last-child {
    margin-bottom: 0;
  }
}
</style>
