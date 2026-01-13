import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../components/LandingPage.vue'
import { getAuthReady, getCurrentUser } from '../composables/useAuth'

const routes = [
  {
    path: '/',
    name: 'LandingPage',
    component: LandingPage
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../components/RegisterPage.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../components/LoginPage.vue')
  },
  {
    path: '/payment-success',
    name: 'PaymentSuccess',
    component: () => import('../components/PaymentSuccess.vue')
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
    meta: { requiresAuth: true } // This route requires authentication
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
    path: '/invoice/edit/:id',
    name: 'InvoiceEdit',
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  await getAuthReady()
  const user = getCurrentUser()

  if (requiresAuth && !user) {
    next({ name: 'Login' })
  } else {
    next()
  }
})

export default router
