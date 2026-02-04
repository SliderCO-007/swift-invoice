
import { createRouter, createWebHistory } from 'vue-router';
// Import the new utility function and the useAuth composable
import { waitForAuth, useAuth } from '../composables/useAuth.js';
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
    meta: { requiresAuth: true }
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

// --- Robust, Asynchronous Navigation Guard ---
router.beforeEach(async (to, from, next) => {
  // Wait for the initial Firebase auth check to complete.
  await waitForAuth();
  const { user } = useAuth(); // Now it's safe to get the user.

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);

  if (requiresAuth && !user.value) {
    // If the route requires authentication and the user is not logged in, redirect to the login page.
    console.log(`Navigation blocked: ${to.path} requires auth. User not found. Redirecting to /login.`);
    next({ name: 'Login' });
  } else if (requiresGuest && user.value) {
    // If the route is for guests (like login/register) and the user is already logged in, redirect to the dashboard.
    console.log(`Navigation blocked: ${to.path} is for guests. User is logged in. Redirecting to /dashboard.`);
    next({ name: 'Dashboard' });
  } else {
    // In all other cases, allow the navigation.
    next();
  }
});

export default router;
