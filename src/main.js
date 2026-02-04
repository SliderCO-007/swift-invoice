import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';
import { createHead } from '@vueuse/head';
import { initializeAuthListener, waitForAuth } from './composables/useAuth.js';
import '@mdi/font/css/materialdesignicons.css';

// Initialize the global Firebase authentication listener.
initializeAuthListener();

const app = createApp(App);
const head = createHead();

app.use(head);
app.use(vuetify);
app.use(router);

// Wait for authentication to be ready before mounting the app
waitForAuth().then(() => {
  app.mount('#app');
});
