<template>
  <div class="landing-container">
    <header class="main-header">
      <div class="header-content">
        <Logo />
        <nav class="desktop-nav">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#" @click.prevent="openDemo">Watch Demo</a>
          <router-link to="/dashboard" class="cta-button">Get Started</router-link>
        </nav>
        <button class="mobile-nav-toggle" @click="isMobileNavOpen = !isMobileNavOpen">
          <IconMenu />
        </button>
      </div>
    </header>

    <div v-if="isMobileNavOpen" class="mobile-nav">
      <a href="#features" @click="isMobileNavOpen = false">Features</a>
      <a href="#pricing" @click="isMobileNavOpen = false">Pricing</a>
      <a href="#" @click.prevent="openDemo(); isMobileNavOpen = false">Watch Demo</a>
      <router-link to="/dashboard" class="cta-button" @click="isMobileNavOpen = false">Get Started</router-link>
    </div>

    <main>
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">Stop Chasing Payments.</h1>
          <h1 class="hero-title">Start Getting Paid in Seconds.</h1>
          <p class="hero-subtitle">Create, download, and track professional invoices in minutes. No subscriptions, no hidden fees. Just simple, pay-per-invoice pricing.</p>
          <div class="hero-actions">
            <router-link to="/dashboard" class="cta-button-large">Create First Invoice</router-link>
          </div>
        </div>

      </section>
      
      <section id="features" class="features-section">
        <h2 class="section-title">Everything You Need, Nothing You Don't</h2>
        <div class="features-grid">
          <div class="feature-card">
            <IconPDF />
            <h3>PDF Invoices</h3>
            <p>Generate professional, pixel-perfect PDF invoices that you can download or send directly to your clients.</p>
          </div>
          <div class="feature-card">
            <IconEmail />
            <h3>Email Tracking</h3>
            <p>Know when your invoice has been viewed with our simple email tracking feature, helping you stay on top of payments.</p>
          </div>
          <div class="feature-card">
            <IconAnalytics />
            <h3>Simple Analytics</h3>
            <p>Keep track of your income and paid invoices with a clean and simple dashboard. No complex accounting software needed.</p>
          </div>
        </div>
      </section>

      <section id="pricing" class="pricing-section">
        <div class="pricing-content">
          <h2 class="section-title">Simple, Transparent Pricing</h2>
          <p class="section-subtitle">Only pay for what you use. Perfect for freelancers and small businesses.</p>
          <div class="price-card">
            <span class="price-amount">$1</span>
            <span class="price-description">per invoice sent</span>
          </div>
          <router-link to="/dashboard" class="cta-button-large">Start Invoicing Now</router-link>
        </div>
      </section>
    </main>

    <footer class="main-footer-bottom">
      <p>&copy; {{ new Date().getFullYear() }} Swift Invoice. All Rights Reserved.</p>
    </footer>
    
    <div v-if="showDashboardPreview" class="preview-modal" @click="showDashboardPreview = false">
      <div class="modal-content" @click.stop>
        <header class="modal-header">
          <h3>Dashboard Preview</h3>
          <button @click="showDashboardPreview = false" class="close-modal-btn">&times;</button>
        </header>
        <img src="https://storage.googleapis.com/proud-booth-333423.appspot.com/static/invoice-hero-image.png" alt="Dashboard Preview" class="dashboard-preview-image"/>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useMeta } from '../composables/useMeta';
import Logo from './Logo.vue';
import IconPDF from './IconPDF.vue';
import IconEmail from './IconEmail.vue';
import IconAnalytics from './IconAnalytics.vue';
import IconMenu from './IconMenu.vue';

const isMobileNavOpen = ref(false);
const showDashboardPreview = ref(false);

// --- Mobile detection logic ---
const windowWidth = ref(window.innerWidth);

const onResize = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener('resize', onResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', onResize);
});

const isMobile = computed(() => windowWidth.value < 768);

useMeta(
  'Swift Invoice | Invoicing Made Effortless',
  'Create, download, and track professional invoices in minutes with Swift Invoice. No subscriptions, no hidden fees. Just simple, pay-per-invoice pricing.'
);

</script>


<style scoped>
/* General Styles */
.landing-container {
  font-family: 'Inter', sans-serif;
  background-color: #ffffff;
  color: #111827;
}

a {
  text-decoration: none;
  color: #374151;
  transition: color 0.2s ease;
}

a:hover {
  color: #4F46E5;
}

/* Header */
.main-header {
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #E5E7EB;
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 1rem 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1280px;
  margin: 0 auto;
}

.desktop-nav {
  display: none;
  align-items: center;
  gap: 1.5rem;
  font-weight: 500;
}

@media (min-width: 768px) {
  .desktop-nav { display: flex; }
}

.cta-button {
  background-color: #4F46E5;
  color: #ffffff;
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  font-weight: 500;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.cta-button:hover {
  background-color: #4338CA;
  color: #ffffff;
  transform: translateY(-2px);
}

.mobile-nav-toggle {
  display: block;
  background: none;
  border: none;
  cursor: pointer;
  color: #111827;
}

@media (min-width: 768px) {
  .mobile-nav-toggle { display: none; }
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 2rem 2rem;
  border-bottom: 1px solid #E5E7EB;
  background-color: #ffffff;
  position: absolute;
  top: 69px;
  left: 0;
  right: 0;
  z-index: 9;
}

.mobile-nav a {
  font-weight: 500;
  padding: 0.5rem;
  border-radius: 6px;
}

.mobile-nav .cta-button {
  text-align: center;
  margin-top: 0.5rem;
}

/* Hero Section */
.hero-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  align-items: center;
  padding: 4rem 2rem;
  max-width: 1280px;
  margin: 0 auto;
}

@media (min-width: 1024px) {
  .hero-section {
    grid-template-columns: 1fr 1fr;
    padding: 6rem 2rem;
  }
}

.hero-content {
  text-align: center;
}

@media (min-width: 1024px) {
  .hero-content { text-align: left; }
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1rem;
  color: #111827;
}

@media (min-width: 768px) {
  .hero-title {
    font-size: 3.5rem;
  }
}

.hero-subtitle {
  font-size: 1.1rem;
  color: #4B5563;
  max-width: 600px;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  .hero-subtitle { margin: 0 0 2rem; }
}

.hero-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

@media (min-width: 768px) {
  .hero-actions { 
    flex-direction: row;
    justify-content: center;
  }
}

@media (min-width: 1024px) {
  .hero-actions { justify-content: flex-start; }
}

.cta-button-large {
  background-color: #4F46E5;
  color: #ffffff;
  padding: 1rem 2rem;
  border-radius: 30px;
  font-weight: 600;
  font-size: 1rem;
  transition: background-color 0.2s ease, transform 0.2s ease;
  width: 100%;
  text-align: center;
}

@media (min-width: 768px) {
  .cta-button-large { width: auto; }
}

.cta-button-large:hover {
  background-color: #4338CA;
  color: #ffffff;
  transform: translateY(-2px);
}

.secondary-button-large {
  background-color: transparent;
  color: #4F46E5;
  border: 1px solid #E5E7EB;
  padding: 1rem 2rem;
  border-radius: 30px;
  font-weight: 600;
  font-size: 1rem;
  transition: background-color 0.2s ease, transform 0.2s ease;
  cursor: pointer;
  width: 100%;
}

@media (min-width: 768px) {
  .secondary-button-large { width: auto; }
}

.secondary-button-large:hover {
  background-color: #F3F4F6;
  transform: translateY(-2px);
}

.hero-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-image {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  transition: transform 0.3s ease-in-out;
}

.hero-image:hover {
  transform: scale(1.03);
}

/* Features Section */
.features-section {
  padding: 4rem 2rem;
  background-color: #F9FAFB;
  text-align: center;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
}

.features-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  max-width: 1024px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .features-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.feature-card {
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.feature-card svg {
  color: #4F46E5;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.feature-card p {
  color: #6B7280;
}

/* Pricing Section */
.pricing-section {
  padding: 4rem 2rem;
  text-align: center;
}

.section-subtitle {
  font-size: 1.1rem;
  color: #6B7280;
  margin-bottom: 2rem;
}

.price-card {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  background-color: #F9FAFB;
  padding: 2rem 4rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.price-amount {
  font-size: 3rem;
  font-weight: 800;
  color: #4F46E5;
}

.price-description {
  font-size: 1rem;
  color: #6B7280;
  font-weight: 500;
}

/* Footer */
.main-footer-bottom {
  padding: 2rem;
  text-align: center;
  background-color: #F9FAFB;
  color: #6B7280;
  border-top: 1px solid #E5E7EB;
}

/* Preview Modal */
.preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  padding: 1rem;
  border-radius: 12px;
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
}

.close-modal-btn {
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #333;
}

.dashboard-preview-image {
  width: 100%;
  border-radius: 8px;
}

</style>
