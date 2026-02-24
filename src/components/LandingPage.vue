<template>
  <div class="landing-page">
    <main>
      <section class="hero">
        <div class="container">
          <div class="hero-grid">
            <div class="hero-content">
              <span class="font-weight-bold d-sm-none hero-title text-blue-darken-4">Swift Invoice</span>
              <h1 class="hero-title">Stop Chasing Payments.</h1>
              <h1 class="hero-title">Start Getting Paid in Seconds.</h1>
              <p class="hero-subtitle">Create, send, and track professional invoices in minutes. Focus on your work, not your paperwork.</p>
              <v-btn to="/register" color="primary" size="x-large" rounded="pill" class="mt-8">Get Started</v-btn>
              <div class="mt-4 d-none d-md-block">
                <v-btn density="comfortable" @click="openDemo">
                  Take a tour
                </v-btn>
              </div>
            </div>
            <div class="hero-image">
              <img src="/hero_woman.png" alt="A woman smiling while using a laptop, representing a satisfied Swift Invoice user.">
            </div>
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
                <IconPricing />
              </div>
              <h3 class="feature-title">Start for Free</h3>
              <p class="feature-description">Get started with a generous free plan, including 2 invoices and unlimited customers. Scale up when you're ready.</p>
              <v-btn to="/register" color="secondary" rounded="pill" class="mt-4">Start for Free</v-btn>
            </div>
             <div class="feature-card">
                <div class="feature-icon">
                  <IconVenmo />
                </div>
                <h3 class="feature-title">Instant Venmo Payments</h3>
                <p class="feature-description">Add your Venmo QR code to invoices so clients can pay you in a snap. Faster payments, happier you.</p>
                <v-btn href="https://help.venmo.com/cs/articles/how-to-sign-up-for-a-business-profile-vhel163" target="_blank" color="secondary" rounded="pill" class="mt-4">Create Venmo</v-btn>
            </div>
            <div class="feature-card">
              <div class="feature-icon">
                <IconEmail />
              </div>
              <h3 class="feature-title">Create & Send Instantly</h3>
              <p class="feature-description">Generate a professional invoice and email it to your client in seconds. No need to download, attach, or switch apps.</p>
              <v-btn @click="showInvoicePreview = true" color="secondary" rounded="pill" class="mt-4">Preview Invoice</v-btn>
            </div>
            <div class="feature-card">
              <div class="feature-icon">
                <IconAnalytics />
              </div>
              <h3 class="feature-title">At-a-Glance Tracking</h3>
              <p class="feature-description">The dashboard gives you a clear overview of all your invoices. See which invoices are paid, pending, or overdue in a single glance.</p>
              <v-btn @click="showDashboardPreview = true" color="secondary" rounded="pill" class="mt-4">Preview Dashboard</v-btn>
            </div>
          </div>
        </div>
      </section>
    </main>
    
    <footer class="footer">
      <div class="container">
        <p>&copy; 2026 Swift Invoice. All rights reserved. | <a href="mailto:support@swiftinvoice.biz">support@swiftinvoice.biz</a> | <router-link to="/privacy">Privacy Policy</router-link></p>
        <div class="badge-container">
          <a href='https://www.saashub.com/swift-invoice?utm_source=badge&utm_campaign=badge&utm_content=swift-invoice&badge_variant=color&badge_kind=approved' target='_blank'><img src="https://cdn-b.saashub.com/img/badges/approved-color.png?v=1" alt="SwiftInvoice.biz badge"/></a>
          <TrustpilotWidget />
          <a href="https://www.producthunt.com/products/swift-invoice-2?embed=true&amp;utm_source=badge-featured&amp;utm_medium=badge&amp;utm_campaign=badge-swift-invoice-2" target="_blank" rel="noopener noreferrer"><img alt="Swift Invoice - Stop Chasing Payments. Start Getting Paid in Seconds. | Product Hunt" src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1070834&amp;theme=neutral&amp;t=1769917049866"></a>
        </div>
        </div>
    </footer>

    <!-- Dashboard Preview Modal -->
    <div v-if="showDashboardPreview" class="modal-overlay" @click.self="showDashboardPreview = false">
      <div class="modal-content">
        <img src="/dashboardPreview.png" alt="Dashboard Preview" />
        <v-btn @click="showDashboardPreview = false" icon class="modal-close">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"/></svg>
        </v-btn>
      </div>
    </div>
    
    <!-- Invoice Preview Modal -->
    <div v-if="showInvoicePreview" class="modal-overlay" @click.self="showInvoicePreview = false">
      <div class="modal-content">
        <!--<embed src="/Invoice-00000009.pdf" type="application/pdf" width="100%" height="100%"> -->
        <img src="/Invoice-00000009.png" alt="Invoice Preview" />
        <v-btn @click="showInvoicePreview = false" icon class="modal-close">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"/></svg>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useMeta } from '../composables/useMeta';
import IconPricing from './IconPricing.vue';
import IconEmail from './IconEmail.vue';
import IconAnalytics from './IconAnalytics.vue';
import IconVenmo from './IconVenmo.vue';
import TrustpilotWidget from './TrustpilotWidget.vue'

const showDashboardPreview = ref(false);
const showInvoicePreview = ref(false);

useMeta(
  'Swift Invoice | Simple Subscription Invoicing',
  'Create, download, and track professional invoices for a simple monthly or yearly price. Swift Invoice is packed with features to help you get paid faster. Perfect tool for small businesses and individuals looking to streamline their invoice management.',
);

// In your methods
const openDemo = () => {
  Supademo.open('cmlrgxmfi0guf1189s8jkvkfm');
}

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

main section[id] {
  scroll-margin-top: 100px; /* Adjust this value to match your header height */
}

.landing-page {
  font-family: 'Poppins', sans-serif;
  background-color: #FFFFFF;
  color: #333;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Hero Section */
.hero {
  padding: 6rem 0;
  background-color: #FFFFFF;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 4rem;
}

.hero-content {
  text-align: left;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2.5rem;
  color: #555;
}

.hero-image img {
  max-width: 100%;
  height: auto;
  border-radius: 16px;
}

/* Features Section */
.features {
  padding: 6rem 0;
  background-color: #f8f9fa;
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

.pdf-modal {
  width: 80vw;
  height: 90vh;
  padding: 0;
  overflow: hidden;
}

.pdf-modal embed {
  border: none;
}

.modal-close {
    position: absolute;
    top: -10px;
    right: -10px;
    background-color: #fff;
    color: #555;
    border-radius: 50%;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    z-index: 10;
}


/* Responsive Styles */
@media (max-width: 960px) {
  .hero-grid {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .hero-content {
    text-align: center;
  }

  .hero-image {
    margin-bottom: 2rem;
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .container {
      padding: 0 1rem;
  }

  .hero {
    padding: 2rem 1rem;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
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
}
</style>