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
          <a href="#how-it-works">How It Works</a>
          <router-link to="/login">Login</router-link>
        </nav>
        <v-btn to="/register" color="primary" large rounded class="desktop-nav">Get Started for Free</v-btn>
        <button class="mobile-nav-toggle" @click="isMobileNavOpen = !isMobileNavOpen">
          <IconMenu />
        </button>
      </div>
      <nav class="mobile-nav" :class="{ 'is-open': isMobileNavOpen }">
        <a href="#features" @click="isMobileNavOpen = false">Features</a>
        <a href="#how-it-works" @click="isMobileNavOpen = false">How It Works</a>
        <router-link to="/login" @click="isMobileNavOpen = false">Login</router-link>
        <v-btn to="/register" color="primary" large rounded>Get Started for Free</v-btn>
      </nav>
    </header>

    <main>
      <section class="hero">
        <div class="container">
          <div class="hero-content">
            <h1 class="hero-title">Stop Chasing Payments.</h1>
            <h1 class="hero-title">Start Getting Paid in Seconds.</h1>
            <p class="hero-subtitle">Create, download, and track professional invoices in minutes. Focus on your work, not your paperwork.</p>
            <v-btn to="/register" color="primary" x-large rounded class="mt-8">Get Started for Free</v-btn>
            <p class="hero-caption">No subscriptions. No hidden fees.</p>
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
              <p class="feature-description">Just $1 per invoice. No subscriptions, no setup fees, and no hidden costs. Ever.</p>
            </div>
             <div class="feature-card">
                <div class="feature-icon">
                  <IconVenmo />
                </div>
                <h3 class="feature-title">Instant Venmo Payments</h3>
                <p class="feature-description">Add your Venmo QR code to invoices so clients can pay you in a snap. Faster payments, happier you.</p>
                <v-btn href="https://help.venmo.com/cs/articles/how-to-sign-up-for-a-business-profile-vhel163" target="_blank" color="secondary" rounded class="mt-4">Create Venmo</v-btn>
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

      <section id="how-it-works" class="how-it-works">
        <div class="container">
          <h2 class="section-title">Get Started in 3 Easy Steps</h2>
          <div class="steps-container">
            <div class="step-card">
              <div class="step-number">1</div>
              <h3 class="step-title">Create Your Free Account</h3>
              <p class="step-description">Sign up in seconds with just your email and password. No credit card required.</p>
              <img src="/click_getStarted.gif" alt="Get Started GIF" class="step-gif" />
            </div>
            <div class="step-card">
              <div class="step-number">2</div>
              <h3 class="step-title">Set Up Your Business</h3>
              <p class="step-description">Enter your company details and upload your logo in the user settings to personalize your invoices.</p>
              <img src="/click_manageSettings.gif" alt="Manage Settings GIF" class="step-gif" />
            </div>
            <div class="step-card">
              <div class="step-number">3</div>
              <h3 class="step-title">Create Your First Invoice</h3>
              <p class="step-description">Build and send your first professional invoice for just $1. It's that simple.</p>
              <img src="/click_firstInvoice.gif" alt="Create First Invoice GIF" class="step-gif" />
            </div>
          </div>
          <div class="get-started-cta">
             <v-btn to="/register" color="primary" x-large rounded class="mt-8">Sign Up Now</v-btn>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2026 Swift Invoice. All rights reserved. | <a href="mailto:support@swiftinvoice.biz">support@swiftinvoice.biz</a></p>
            <div class="badge-container">
            <a href='https://www.saashub.com/swift-invoice?utm_source=badge&utm_campaign=badge&utm_content=swift-invoice&badge_variant=color&badge_kind=approved' target='_blank'><img src="https://cdn-b.saashub.com/img/badges/approved-color.png?v=1" alt="SwiftInvoice.biz badge"/></a>
            <a href="https://www.producthunt.com/products/swift-invoice-2?embed=true&amp;utm_source=badge-featured&amp;utm_medium=badge&amp;utm_campaign=badge-swift-invoice-2" target="_blank" rel="noopener noreferrer"><img alt="Swift Invoice - Stop Chasing Payments. Start Getting Paid in Seconds. | Product Hunt" src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1070834&amp;theme=neutral&amp;t=1769917049866"></a>
            </div>
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
import { useMeta } from '../composables/useMeta';
import Logo from './Logo.vue';
import IconPDF from './IconPDF.vue';
import IconEmail from './IconEmail.vue';
import IconAnalytics from './IconAnalytics.vue';
import IconMenu from './IconMenu.vue';
import IconVenmo from './IconVenmo.vue';

const isMobileNavOpen = ref(false);
const showDashboardPreview = ref(false);

useMeta(
  'Swift Invoice | Invoicing Made Effortless',
  'Create, download, and track professional invoices in minutes with Swift Invoice. No subscriptions, no hidden fees. Just simple, pay-per-invoice pricing.',
  'Perfect tool for small businesses and individuals looking to streamline their invoice management.'
);

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
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/hero_background.png') no-repeat center center;
  background-size: cover;
  color: #fff;
  text-align: center;
  position: relative;
}

.hero .container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.hero-content {
  max-width: 800px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.hero-title {
  font-size: 4rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2.5rem;
}

.hero-caption {
    font-size: 1rem;
    margin-top: 1.5rem;
    opacity: 0.9;
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
  grid-template-columns: repeat(4, 1fr);
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
    display: flex;
    justify-content: center;
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

/* How It Works Section */
.how-it-works {
    padding: 6rem 0;
    background-color: #fff;
}

.steps-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 3rem;
    max-width: 1000px;
    margin: 4rem auto;
    text-align: center;
}

.step-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
}

.step-number {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: var(--primary-color);
    color: #fff;
    font-size: 2rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 10px rgba(74, 144, 226, 0.4);
}

.step-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.step-description {
    color: #555;
    max-width: 300px;
    margin-bottom: auto;
}

.step-gif {
  margin-top: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  max-width: 100%;
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

.footer a {
  color: #fff;
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}

.badge-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.badge-container img {
  max-height: 54px;
  width: auto;
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
@media (max-width: 1024px) {
    .features-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

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
    padding: 4rem 1rem;
  }

  .hero-title {
    font-size: 3rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .features, .how-it-works {
    padding: 4rem 0;
  }

  .features-grid, .steps-container {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 2rem;
  }
  
  .section-subtitle {
      font-size: 1rem;
      margin-bottom: 2rem;
  }
}
</style>
