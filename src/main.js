import { createApp, watch } from 'vue';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';
import { createHead } from '@vueuse/head';
import { isAuthReady } from './composables/useAuth.js';
import '@mdi/font/css/materialdesignicons.css';
// Correctly import the plugin as a default export for the 'next' version
import { createGtag } from "vue-gtag";


const app = createApp(App);
const head = createHead();

app.use(head);
app.use(vuetify);
app.use(router);
app.use(createGtag({
  tagId: import.meta.env.VITE_GA_MEASUREMENT_ID,
  initMode: 'manual'
}))

// Wait for Firebase auth to be ready before mounting the app.
let isAppMounted = false;
watch(isAuthReady, (ready) => {
  if (ready && !isAppMounted) {
    app.mount('#app');
    isAppMounted = true;
  }
}, { immediate: true });
