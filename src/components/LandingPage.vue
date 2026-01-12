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
              <h3 class="feature-title">Professional Templates</h3>
              <p class="feature-description">A professional invoice template. Add your logo and branding in a few clicks.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">
                <IconEmail />
              </div>
              <h3 class="feature-title">Downloadable PDF Invoices</h3>
              <p class="feature-description">Easily download invoices as PDFs to send to your clients.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">
                <IconAnalytics />
              </div>
              <h3 class="feature-title">Invoice Status Tracking</h3>
              <p class="feature-description">Keep track of your cash flow by viewing the status of all your invoices, whether they're pending or paid.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" class="pricing">
        <div class="container">
          <h2 class="section-title">Simple, transparent pricing.</h2>
          <p class="section-subtitle">One simple plan to cover all your invoicing needs.</p>
          <div class="pricing-card">
            <h3 class="pricing-plan">Pay-as-you-go</h3>
            <div class="pricing-cost">
              <p class="pricing-price">$50</p>
              <p class="pricing-period">One-time setup fee</p>
            </div>
            <div class="pricing-cost-secondary">
              <p class="pricing-price">$1</p>
              <p class="pricing-period">per invoice</p>
            </div>
            <p class="pricing-description">A one-time fee gives you lifetime access. Then, only pay for the invoices you create.</p>
            <ul class="pricing-features">
              <li>Unlimited clients</li>
              <li>Unlimited projects</li>
              <li>Professional invoice templates</li>
              <li>Downloadable PDF invoices</li>
              <li>Invoice status tracking</li>
            </ul>
            <v-btn to="/register" color="primary" large rounded class="mt-8">Get Started</v-btn>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="container">
        <p>&copy; 2024 Swift Invoice. All rights reserved.</p>
      </div>
    </footer>
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
}

/* Pricing Section */
.pricing {
    padding: 6rem 0;
    background-color: #fff;
}

.pricing-card {
    background-color: #fff;
    padding: 3rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    max-width: 400px;
    margin: 0 auto;
    text-align: center;
}

.pricing-plan {
    font-size: 1.2rem;
    font-weight: 600;
    color: #555;
}

.pricing-cost {
    margin-bottom: 1rem;
}

.pricing-cost-secondary {
    margin-bottom: 2rem;
}

.pricing-price {
    font-size: 3.5rem;
    font-weight: 700;
    color: #007bff;
    line-height: 1;
}

.pricing-cost-secondary .pricing-price {
    font-size: 2.5rem;
}

.pricing-period {
    font-size: 1rem;
    color: #555;
}

.pricing-description {
    margin-bottom: 2rem;
    font-size: 1.1rem;
    color: #333;
}

.pricing-features {
    list-style: none;
    padding: 0;
    margin-bottom: 2rem;
}

.pricing-features li {
    margin-bottom: 0.5rem;
}


/* Footer */
.footer {
  background-color: #333;
  color: #fff;
  padding: 2rem 0;
  text-align: center;
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
}
</style>