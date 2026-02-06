import { createRouter, createWebHistory } from 'vue-router';
// CORRECTED: Removed 'waitForAuth' and 'useAuth'. We only need the reactive 'currentUser'.
import { currentUser } from '../composables/useAuth.js';
import LandingPage from '../components/LandingPage.vue';

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
    meta: { requiresGuest: true } // For routes that should not be seen by logged-in users
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../components/LoginPage.vue'),
    meta: { requiresGuest: true } // For routes that should not be seen by logged-in users
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

// --- Simplified Navigation Guard ---
router.beforeEach((to, from, next) => {
  // No longer need to 'await waitForAuth()' here.
  // main.js ensures this code only runs after the initial auth state is known.
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
