<template>
  <div class="landing-page">
    <main>
      <section class="hero">
        <div class="container">
          <div class="hero-grid">
            <div class="hero-content">
              <span class="font-weight-bold d-sm-none hero-title text-blue-darken-4">ScanGo Invoice</span>
              <h1 class="hero-title">Stop Chasing Payments.</h1>
              <h1 class="hero-title">Start Getting Paid in Seconds.</h1>
              <p class="hero-subtitle">Create, send, and track professional invoices in minutes. Focus on your work, not
                your paperwork.</p>
              <v-btn to="/register" color="primary" size="x-large" rounded="pill" class="mt-8">Get Started</v-btn>
              <v-btn v-if="mobile" @click="openMobilePreview" color="secondary" size="large" rounded="pill"
                class="mt-4">See it in Action</v-btn>
            </div>
            <div class="hero-image">
              <img src="/hero_woman.png"
                alt="A woman smiling while using a laptop, representing a satisfied ScanGo Invoice user.">
            </div>
          </div>
        </div>
      </section>

      <section id="features" class="features">
        <div class="container">
          <h2 class="section-title">A Feature Set That Works For You</h2>
          <p class="section-subtitle">From freelancers to small businesses, ScanGo Invoice has the tools you need to
            succeed.</p>
          <div class="feature-list-grid">
            <div class="feature-category">
              <h3 class="category-title"><v-icon color="blue" class="mr-2">mdi-text-box-check-outline</v-icon>Invoicing
              </h3>
              <ul class="feature-list">
                <li><v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>Create & Send Invoices Instantly</li>
                <li><v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>At-a-Glance Invoice Tracking</li>
                <li><v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>Download Invoices as PDF</li>
                <li><v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>Generous Free Plan (2 Invoices)</li>
              </ul>
            </div>
            <div class="feature-category">
              <h3 class="category-title"><v-icon color="blue" class="mr-2">mdi-palette-outline</v-icon>Customization
              </h3>
              <ul class="feature-list">
                <li><v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>Professionally Designed Templates</li>
                <li><v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>Add Your Company Logo & Info</li>
                <li><v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>Reusable Item Library</li>
              </ul>
            </div>
            <div class="feature-category">
              <h3 class="category-title"><v-icon color="blue" class="mr-2">mdi-credit-card-outline</v-icon>Payments</h3>
              <ul class="feature-list">
                <li><v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>Instant Payments with custom QR Code</li>
                <li><v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>Secure Subscription Payments with
                  Stripe</li>
                <li><v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>Clear Payment Status Tracking</li>
              </ul>
            </div>
            <div class="feature-category">
              <h3 class="category-title"><v-icon color="blue" class="mr-2">mdi-account-group-outline</v-icon>Clients &
                Management</h3>
              <ul class="feature-list">
                <li><v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>Unlimited Customers</li>
                <li><v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>Unlimited Items</li>
                <li><v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>Simple Client Management</li>
              </ul>
            </div>
          </div>
          <div class="text-center mt-12">
            <v-btn to="/pricing" color="primary" size="x-large" rounded="pill">See All Features & Pricing</v-btn>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="container">
        <Trustpilot />
        <p>&copy; 2026 ScanGo Invoice. All rights reserved. | <a
            href="mailto:support@scangoinvoice.com">support@scangoinvoice.com</a> | <router-link to="/privacy">Privacy
            Policy</router-link></p>
      </div>
    </footer>

    <!-- Dashboard Preview Modal -->
    <div v-if="showDashboardPreview" class="modal-overlay" @click.self="showDashboardPreview = false">
      <div class="modal-content">
        <img src="/dashboardPreview.png" alt="Dashboard Preview" />
        <v-btn @click="showDashboardPreview = false" icon class="modal-close">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor"
              d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z" />
          </svg>
        </v-btn>
      </div>
    </div>

    <!-- Mobile Preview Modal -->
    <div v-if="showMobilePreview" class="modal-overlay" @click.self="closeMobilePreview">
      <div class="modal-content">
        <div v-if="isMobilePreviewLoading" class="loader-container">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        </div>
        <img v-show="!isMobilePreviewLoading" src="/ScanGo_mobile_newInvoice.gif" alt="Mobile Preview"
          @load="isMobilePreviewLoading = false" />
        <v-btn @click="closeMobilePreview" icon class="modal-close">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor"
              d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z" />
          </svg>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useMeta } from '../composables/useMeta';
import { useDisplay } from 'vuetify';
import Trustpilot from './TrustpilotWidget.vue';

const { mobile } = useDisplay();
const showDashboardPreview = ref(false);
const showMobilePreview = ref(false);
const isMobilePreviewLoading = ref(false);

const openMobilePreview = () => {
  isMobilePreviewLoading.value = true;
  showMobilePreview.value = true;
};

const closeMobilePreview = () => {
  showMobilePreview.value = false;
};

useMeta(
  'ScanGo Invoice | Simple Digital Invoicing',
  'Create, download, and track professional invoices for a simple monthly or yearly price. ScanGo Invoice is packed with features to help you get paid faster. Perfect tool for small businesses and individuals looking to streamline their invoice management.',
);

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

main section[id] {
  scroll-margin-top: 100px;
  /* Adjust this value to match your header height */
}

.landing-page {
  font-family: 'Poppins', sans-serif;
  color: #333;
  position: relative;
  z-index: 1;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Hero Section */
.hero {
  padding: 6rem 0;
  background-color: #0069A1;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 4rem;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 2rem;
  border-radius: 16px;
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

.feature-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2.5rem;
}

.feature-category {
  text-align: left;
}

.category-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--v-primary-base);
  display: flex;
  align-items: center;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-list li {
  display: flex;
  align-items: center;
  font-size: 1rem;
  color: #555;
  margin-bottom: 1rem;
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

.loader-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 300px;
  height: 600px;
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
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
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
    padding: 0 .5rem;
  }

  .hero {
    padding: 1rem 1rem;
  }

  .hero-title {
    font-size: 2.5rem;
    line-height: 1.1;
    margin-bottom: 1rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
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

  .category-title {
    justify-content: center;
  }
}
</style>