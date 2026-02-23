import { createApp, watch } from 'vue';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';
import { createHead } from '@vueuse/head';
import { isAuthReady } from './composables/useAuth.js';
import '@mdi/font/css/materialdesignicons.css';
import { createGtag } from "vue-gtag";

const app = createApp(App);
const head = createHead();

app.use(head);
app.use(vuetify);
app.use(router);

// Correctly configure vue-gtag with Google Consent Mode v2
app.use(createGtag({
  tagId: import.meta.env.VITE_GA_MEASUREMENT_ID,
  // Let the plugin handle storage and consent state
  storage: localStorage,
  storageKey: 'cookie_consent_given',
  // Set default consent to 'denied' as required
  consent: {
    default: {
      ad_storage: 'denied',
      analytics_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    },
  },
}));

// Wait for Firebase auth to be ready before mounting the app.
let isAppMounted = false;
watch(isAuthReady, (ready) => {
  if (ready && !isAppMounted) {
    app.mount('#app');
    isAppMounted = true;
  }
}, { immediate: true });
