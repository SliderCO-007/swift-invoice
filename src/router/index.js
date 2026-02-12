import { createRouter, createWebHistory } from 'vue-router';
import { currentUser } from '../composables/useAuth.js';
import LandingPage from '../components/LandingPage.vue';
import CustomersView from '../components/CustomersView.vue';

const routes = [
  {
    path: '/',
    name: 'LandingPage',
    component: LandingPage,
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../components/RegisterPage.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../components/LoginPage.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/payment-success',
    name: 'PaymentSuccess',
    component: () => import('../components/PaymentSuccess.vue'),
  },
  {
    path: '/create-invoice-success',
    name: 'CreateInvoiceSuccess',
    component: () => import('../components/CreateInvoiceSuccess.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../components/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
    {
    path: '/customers',
    name: 'Customers',
    component: CustomersView,
    meta: { requiresAuth: true }
  },
  {
    path: '/items',
    name: 'Items',
    component: () => import('../components/ItemsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../components/UserSettings.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/invoice/new',
    name: 'InvoiceNew',
    component: () => import('../components/InvoiceEditor.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/invoice/:id',
    name: 'InvoiceView',
    component: () => import('../components/InvoiceView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/invoices',
    name: 'InvoiceList',
    component: () => import('../components/InvoiceList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../components/NotFound.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const user = currentUser.value;
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);

  if (requiresAuth && !user) {
    next({ name: 'Login' });
  } else if (requiresGuest && user) {
    next({ name: 'Dashboard' });
  } else {
    next();
  }
});

export default router;
