import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';
import { createHead } from '@vueuse/head';
import { authReady } from './composables/useAuth.js';
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

// Wait for Firebase to confirm the auth state before mounting the app
authReady.then(() => {
  app.mount('#app');
});
