import { createRouter, createWebHistory } from 'vue-router';
import { currentUser, isAuthReady } from '../composables/useAuth.js'; // Import the promise `authIsReady`
import LandingPage from '../components/LandingPage.vue';
import CustomersView from '../components/CustomersView.vue';

const routes = [
  {
    path: '/',
    name: 'LandingPage',
    component: LandingPage,
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: () => import('../components/PrivacyPolicy.vue'),
  },
  {
    path: '/terms',
    name: 'Terms',
    component: () => import('../components/TermsOfService.vue'),
  },
  {
    path: '/pricing',
    name: 'Pricing',
    component: () => import('../components/PricingPage.vue'),
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
    path: '/payment-cancel',
    name: 'PaymentCancel',
    component: () => import('../components/PaymentCancel.vue'),
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
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    if (to.hash) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ el: to.hash, behavior: 'smooth' });
        }, 300); // A short delay to allow the page to render
      });
    }
    return { top: 0 };
  },
});

// --- NAVIGATION GUARD ---
// This guard is now much cleaner. It waits for the initial auth check to complete
// before making any decisions about routing.
router.beforeEach(async (to, from, next) => {
  // Wait for the authIsReady promise to resolve.
  await isAuthReady;

  const user = currentUser.value; // Now this value is guaranteed to be correct.
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);

  if (requiresAuth && !user) {
    // If a route requires authentication and the user is not logged in, redirect to login.
    next({ name: 'Login' });
  } else if (requiresGuest && user) {
    // If a route is for guests only (like login/register) and the user is logged in, redirect to the dashboard.
    next({ name: 'Dashboard' });
  } else {
    // Otherwise, allow navigation.
    next();
  }
});

export default router;
