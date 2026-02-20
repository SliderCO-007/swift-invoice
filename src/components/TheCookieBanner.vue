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
      <v-card class="cookie-banner" elevation="8" rounded="lg">
        <div class="cookie-banner-inner">
          <v-row no-gutters align="center">
            <v-col cols="auto" class="px-3">
              <v-icon size="36" color="amber-darken-2">mdi-cookie</v-icon>
            </v-col>
            <v-col>
              <div class="text-body-1">We use cookies to enhance your experience.</div>
              <div class="text-caption text-grey">
                By clicking "Accept", you agree to our cookie policy.
              </div>
              <div>
                <p class="text-caption mt-2">
                  <a
                    @click.prevent="dialog = true"
                    href="#"
                    class="text-grey-darken-1"
                    style="cursor: pointer"
                    >View our Cookie Policy</a
                  >
                </p>
              </div>
            </v-col>
            <v-col cols="auto" class="px-3">
              <v-btn @click="handleDecline" color="grey-darken-1" variant="flat"
                >Decline</v-btn
              >
              <v-btn color="primary" variant="flat" @click="handleAccept"> Accept </v-btn>
            </v-col>
          </v-row>
        </div>
      </v-card>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// Correct composable provided by the user
import { useConsent } from 'vue-gtag'
import CookiePolicy from './CookiePolicy.vue' // Import the policy component

const dialog = ref(false) // Reactive state for the dialog

const showBanner = ref(false)
const CONSENT_COOKIE_KEY = 'cookie_consent_given'

const { acceptAll, rejectAll } = useConsent()

onMounted(() => {
  // Only show the banner if no choice has been made before.
  if (!localStorage.getItem(CONSENT_COOKIE_KEY)) {
    showBanner.value = true
  }
})

const handleAccept = () => {
  // Use the library's built-in function to grant consent.
  acceptAll()

  console.log('Google Analytics consent granted.')
  localStorage.setItem(CONSENT_COOKIE_KEY, 'true')
  showBanner.value = false
}

const handleDecline = () => {
  // Use the library's built-in function to deny consent.
  rejectAll()

  console.log('Google Analytics consent denied.')
  localStorage.setItem(CONSENT_COOKIE_KEY, 'false')
  showBanner.value = false
}
</script>

<style scoped>
/* 1. Outer wrapper: centering only, never animated */
.cookie-banner-wrapper {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 500px;
  z-index: 1500;
}

/* 2. Card: Vuetify can do whatever it wants here */
.cookie-banner {
  width: 100%;
  background-color: white;
  padding: 12px;
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
</style>
