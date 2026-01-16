import { createApp } from 'vue';
import { createHead } from '@vueuse/head';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';
import './firebase';
import './style.css';
import '@mdi/font/css/materialdesignicons.css'; // Import MDI font

const app = createApp(App);
const head = createHead();

app.use(router);
app.use(vuetify);
app.use(head);

app.mount('#app');
