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
import { addGtag, consentGrantedAll } from 'vue-gtag';

app.use(createGtag({
  tagId: import.meta.env.VITE_GA_MEASUREMENT_ID,
  initMode: 'manual',
  pageTracker: {
    router: router
  }
}));

// If consent was previously granted, initialize Google Analytics immediately
if (localStorage.getItem('cookie_consent_given') === 'true') {
  addGtag();
  consentGrantedAll('update');
}

// Asynchronously mount the app only after Firebase auth is ready.
async function mountApp() {
  // This will pause the function until the isAuthReady promise resolves.
  await isAuthReady;
  
  // Now that auth is confirmed, mount the app.
  app.mount('#app');
}

// Call the async function to start the mounting process.
mountApp();
