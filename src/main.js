import { createApp, watch } from 'vue';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';
import { createHead } from '@vueuse/head';
import { isAuthReady } from './composables/useAuth.js';
import '@mdi/font/css/materialdesignicons.css';
import { createGtag } from "vue-gtag";

const gtag = createGtag({
  tagId: import.meta.env.VITE_GA_MEASUREMENT_ID
})

const app = createApp(App);
const head = createHead();

app.use(head);
app.use(vuetify);
app.use(router);
app.use(gtag);

// Wait for Firebase auth to be ready before mounting the app.
// This prevents race conditions on page load.
let isAppMounted = false;
watch(isAuthReady, (ready) => {
  // isAuthReady can become false when a user logs out.
  // We only want to mount the app on the initial true state.
  if (ready && !isAppMounted) {
    app.mount('#app');
    isAppMounted = true;
  }
}, { immediate: true });
