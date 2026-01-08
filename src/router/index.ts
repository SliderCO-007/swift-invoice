import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../components/LandingPage.vue'

const routes = [
  {
    path: '/',
    name: 'LandingPage',
    component: LandingPage
  },
  // We will create this component in the next step
  {
    path: '/register',
    name: 'Register',
    component: () => import('../components/RegisterPage.vue') 
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
