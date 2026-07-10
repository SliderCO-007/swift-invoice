import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';
import { createHead } from '@vueuse/head';
import { isAuthReady } from './composables/useAuth.js';
import '@mdi/font/css/materialdesignicons.css';
import { createGtag } from "vue-gtag";
import './style.css';

const app = createApp(App);
const head = createHead();

app.use(head);
app.use(vuetify);
app.use(router);

// Correctly configure vue-gtag with Google Consent Mode v2 and enable Router tracking
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
}, router));

// Asynchronously mount the app only after Firebase auth is ready.
async function mountApp() {
  // This will pause the function until the isAuthReady promise resolves.
  await isAuthReady;
  
  // Now that auth is confirmed, mount the app.
  app.mount('#app');
}

// Call the async function to start the mounting process.
mountApp();
