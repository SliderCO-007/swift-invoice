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
    path: '/features',
    name: 'Features',
    component: () => import('../components/FeaturesPage.vue'),
  },
  {
    path: '/reviews',
    name: 'Reviews',
    component: () => import('../components/ReviewsPage.vue'),
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: () => import('../components/PrivacyPolicy.vue'),
  },
  {
    path: '/about',
    name: 'AboutUs',
    component: () => import('../components/AboutUsPage.vue'),
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
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('../components/ResetPasswordPage.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/auth/action',
    name: 'AuthAction',
    component: () => import('../components/ActionHandlerPage.vue'),
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
    path: '/onboarding',
    name: 'Onboarding',
    component: () => import('../components/OnboardingWizard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/invoice/new',
    name: 'InvoiceNew',
    component: () => import('../components/InvoiceEditor.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/invoice/:id',
    name: 'InvoiceView',
    component: () => import('../components/InvoiceView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pay/demo',
    name: 'DemoPayment',
    component: () => import('../components/DemoPayment.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/pay/:invoiceId',
    name: 'PublicPayment',
    component: () => import('../components/PublicPayment.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/invoices',
    name: 'InvoiceList',
    component: () => import('../components/InvoiceList.vue'),
    meta: { requiresAuth: true }
  },
  { path: '/projects',          name: 'Projects',      component: () => import('../components/ProjectsView.vue'),  meta: { requiresAuth: true } },
  { path: '/projects/new',      name: 'ProjectNew',    component: () => import('../components/ProjectEditor.vue'), meta: { requiresAuth: true } },
  { path: '/projects/:id',      name: 'ProjectDetail', component: () => import('../components/ProjectDetail.vue'), meta: { requiresAuth: true } },
  { path: '/projects/:id/edit', name: 'ProjectEdit',   component: () => import('../components/ProjectEditor.vue'), meta: { requiresAuth: true } },
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

router.afterEach((to, from) => {
  // Clear the chunk reload target on successful navigation
  try {
    sessionStorage.removeItem('chunk-reload-target');
  } catch (e) {
    console.error('sessionStorage is not available:', e);
  }

  // Track page views with Meta Pixel on route changes
  if (typeof fbq !== 'undefined') {
    fbq('track', 'PageView');
  }
});

router.onError((error, to) => {
  const isChunkError = /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(error.message);
  
  if (isChunkError) {
    try {
      const reloadTarget = sessionStorage.getItem('chunk-reload-target');
      if (reloadTarget !== to.fullPath) {
        sessionStorage.setItem('chunk-reload-target', to.fullPath);
        window.location.reload();
      } else {
        console.error('Failed to load chunk after reload:', error);
        alert("We had trouble loading the latest updates. Please check your internet connection and try refreshing the page.");
      }
    } catch (e) {
      // Fallback if sessionStorage is disabled or blocked (e.g., incognito security policy)
      console.error('sessionStorage is not available for reload guard:', e);
      window.location.reload();
    }
  }
});

export default router;

