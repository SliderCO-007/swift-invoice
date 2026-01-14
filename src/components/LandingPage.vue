<template>
  <div class="landing-page">
    <header class="header">
      <div class="container">
        <div class="logo">
          <Logo />
          <span>Swift Invoice</span>
        </div>
        <nav class="nav desktop-nav">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <router-link to="/login">Login</router-link>
        </nav>
        <v-btn to="/register" color="primary" large rounded class="desktop-nav">Get Started</v-btn>
        <button class="mobile-nav-toggle" @click="isMobileNavOpen = !isMobileNavOpen">
          <IconMenu />
        </button>
      </div>
      <nav class="mobile-nav" :class="{ 'is-open': isMobileNavOpen }">
        <a href="#features" @click="isMobileNavOpen = false">Features</a>
        <a href="#pricing" @click="isMobileNavOpen = false">Pricing</a>
        <router-link to="/login" @click="isMobileNavOpen = false">Login</router-link>
        <v-btn to="/register" color="primary" large rounded>Get Started</v-btn>
      </nav>
    </header>

    <main>
      <section class="hero">
        <div class="container">
          <div class="hero-content">
            <h1 class="hero-title">Invoicing Made Effortless</h1>
            <p class="hero-subtitle">Create, download, and track professional invoices in minutes. Focus on your work, not your paperwork.</p>
            <v-btn to="/register" color="primary" x-large rounded class="mt-8">Get Started with Swift Invoice</v-btn>
            <p class="hero-caption">Transparent pricing. No subscriptions.</p>
          </div>
        </div>
      </section>

      <section id="features" class="features">
        <div class="container">
          <h2 class="section-title">Everything you need, nothing you don't.</h2>
          <p class="section-subtitle">Swift Invoice is packed with features to help you get paid faster.</p>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">
                <IconPDF />
              </div>
              <h3 class="feature-title">Simple Pricing</h3>
              <p class="feature-description">A one-time $50 setup fee, then just $1 per invoice. No subscriptions or hidden costs. Ever.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">
                <IconEmail />
              </div>
              <h3 class="feature-title">Download & Share Instantly</h3>
              <p class="feature-description">Generate and download a professional, high-resolution PDF of your invoice the moment you create it. Ready to send to your clients immediately.</p>
              <v-btn href="/Invoice-00000009.pdf" download color="secondary" rounded class="mt-4">Download Sample</v-btn>
            </div>
            <div class="feature-card">
              <div class="feature-icon">
                <IconAnalytics />
              </div>
              <h3 class="feature-title">At-a-Glance Tracking</h3>
              <p class="feature-description">The dashboard gives you a clear overview of all your invoices. See which invoices are paid, pending, or overdue in a single glance.</p>
              <v-btn @click="showDashboardPreview = true" color="secondary" rounded class="mt-4">Preview Dashboard</v-btn>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" class="pricing">
        <div class="container">
          <h2 class="section-title">Simple, transparent pricing.</h2>
          <p class="section-subtitle">No subscriptions, no monthly commitments. Just a simple pay-as-you-go model.</p>
          <div class="pricing-card-container">
            <div class="pricing-card">
                <h3 class="pricing-plan">One-Time Setup</h3>
                <div class="pricing-cost">
                <p class="pricing-price">$50</p>
                <p class="pricing-period">one-time fee</p>
                </div>
                <p class="pricing-description">A single payment to get your account set up and ready to go.</p>
                <ul class="pricing-features">
                    <li>Lifetime account access</li>
                    <li>Unlimited clients & projects</li>
                    <li>Secure cloud storage</li>
                </ul>
            </div>
            <div class="pricing-card">
                <h3 class="pricing-plan">Pay-per-Invoice</h3>
                <div class="pricing-cost">
                <p class="pricing-price">$1</p>
                <p class="pricing-period">per invoice created</p>
                </div>
                <p class="pricing-description">Only pay for what you use. Perfect for businesses of all sizes.</p>
                <ul class="pricing-features">
                    <li>Professional invoice templates</li>
                    <li>Downloadable PDF invoices</li>
                    <li>Invoice status tracking</li>
                </ul>
            </div>
          </div>
          <div class="get-started-cta">
             <v-btn to="/register" color="primary" x-large rounded class="mt-8">Get Started for $50</v-btn>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="container">
        <p>&copy; 2026 Swift Invoice. All rights reserved.</p>
      </div>
    </footer>

    <div v-if="showDashboardPreview" class="modal-overlay" @click.self="showDashboardPreview = false">
      <div class="modal-content">
        <img src="/dashboardPreview.png" alt="Dashboard Preview" />
        <v-btn @click="showDashboardPreview = false" icon class="modal-close">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"/></svg>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Logo from './Logo.vue';
import IconPDF from './IconPDF.vue';
import IconEmail from './IconEmail.vue';
import IconAnalytics from './IconAnalytics.vue';
import IconMenu from './IconMenu.vue';

const isMobileNavOpen = ref(false);
const showDashboardPreview = ref(false);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

main section[id] {
  scroll-margin-top: 100px; /* Adjust this value to match your header height */
}

.landing-page {
  font-family: 'Poppins', sans-serif;
  background-color: #f8f9fa;
  color: #333;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Header */
.header {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 700;
}

.logo span {
  margin-left: 0.5rem;
}

.nav a {
  margin: 0 1rem;
  text-decoration: none;
  color: #555;
  font-weight: 600;
  transition: color 0.3s ease;
}

.nav a:hover {
  color: #007bff;
}

/* Mobile Navigation */
.mobile-nav-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: #333;
  font-size: 1.5rem;
}

.mobile-nav {
  display: none;
  flex-direction: column;
  background-color: #fff;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  padding: 1rem;
}

.mobile-nav.is-open {
  display: flex;
}

.mobile-nav a {
  padding: 1rem;
  text-align: center;
  text-decoration: none;
  color: #333;
  font-weight: 600;
}

.mobile-nav .v-btn {
  margin-top: 1rem;
}


/* Hero Section */
.hero {
  padding: 6rem 0;
  background-color: #fff;
  text-align: center;
}

.hero .container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-content {
  max-width: 600px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: #555;
  margin-bottom: 2rem;
}

.hero-caption {
    font-size: 0.9rem;
    color: #777;
    margin-top: 1rem;
}

/* Features Section */
.features {
  padding: 6rem 0;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.2rem;
  color: #555;
  text-align: center;
  margin-bottom: 4rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.feature-card {
  background-color: #fff;
  padding: 2.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.feature-icon {
    font-size: 3rem;
    margin-bottom: 1.5rem;
    color: #007bff;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.feature-description {
  color: #555;
  margin-bottom: auto;
}

/* Pricing Section */
.pricing {
    padding: 6rem 0;
    background-color: #fff;
}

.pricing-card-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    max-width: 900px;
    margin: 0 auto 4rem auto;
}

.pricing-card {
    background-color: #fff;
    padding: 3rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    text-align: center;
    display: flex;
    flex-direction: column;
}

.pricing-plan {
    font-size: 1.2rem;
    font-weight: 600;
    color: #555;
}

.pricing-cost {
    margin-bottom: 2rem;
}

.pricing-price {
    font-size: 3.5rem;
    font-weight: 700;
    color: #007bff;
    line-height: 1;
}

.pricing-period {
    font-size: 1rem;
    color: #555;
}

.pricing-description {
    margin-bottom: 2rem;
    font-size: 1.1rem;
    color: #333;
    flex-grow: 1;
}

.pricing-features {
    list-style: none;
    padding: 0;
    margin-bottom: 2rem;
}

.pricing-features li {
    margin-bottom: 0.5rem;
}

.get-started-cta {
    text-align: center;
}


/* Footer */
.footer {
  background-color: #333;
  color: #fff;
  padding: 2rem 0;
  text-align: center;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.modal-content img {
  max-width: 100%;
  max-height: 80vh;
  display: block;
}

.modal-close {
    position: absolute;
    top: -10px;
    right: -10px;
    background-color: #fff;
    color: #555;
    border-radius: 50%;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}


/* Responsive Styles */
@media (max-width: 768px) {
  .desktop-nav {
    display: none;
  }

  .mobile-nav-toggle {
    display: block;
  }
  
  .container {
      padding: 0 1rem;
  }

  .hero {
    padding: 4rem 0;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .features {
    padding: 4rem 0;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 2rem;
  }
  
  .section-subtitle {
      font-size: 1rem;
      margin-bottom: 2rem;
  }
  
  .pricing {
      padding: 4rem 0;
  }

  .pricing-card-container {
      grid-template-columns: 1fr;
  }
}
</style>
