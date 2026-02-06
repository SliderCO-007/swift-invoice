import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';
import { createHead } from '@vueuse/head';
import { authReady } from './composables/useAuth.js'; // Corrected: Import authReady
import '@mdi/font/css/materialdesignicons.css';

const app = createApp(App);
const head = createHead();

app.use(head);
app.use(vuetify);
app.use(router);

// Wait for Firebase to confirm the auth state before mounting the app
authReady.then(() => {
  app.mount('#app');
});
