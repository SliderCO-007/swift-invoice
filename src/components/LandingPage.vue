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
              <div class="d-flex flex-wrap ga-4 mt-8 align-center justify-center justify-md-start">
                <v-btn to="/register" color="primary" size="x-large" rounded="pill">GET STARTED</v-btn>
                <v-btn v-if="mobile" @click="openMobilePreview" color="secondary" size="large" rounded="pill">See it in
                  Action</v-btn>
                <v-btn v-else
                  onclick="Storylane.Play({type: 'popup', demo_type: 'image', width: 2560, height: 1215, scale: '0.95', demo_url: 'https://app.storylane.io/demo/qmii40zks2hl?embed=popup', padding_bottom: 'calc(47.46% + 25px)'})"
                  color="secondary" size="large" rounded="pill">TAKE A TOUR</v-btn>
              </div>
            </div>
            <div class="hero-image">
              <img src="/hero_image.png"
                alt="A woman smiling while using a laptop, representing a satisfied ScanGo Invoice user.">
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" class="how-it-works">
        <div class="container">
          <h2 class="section-title">How It Works</h2>
          <p class="section-subtitle">Get paid faster in 3 simple steps.</p>
          <div class="steps-grid">
            <div class="step-card">
              <div class="step-number">1</div>
              <h3 class="step-title">Add Client & Items</h3>
              <p>Quickly build your invoice with reusable clients and line items.</p>
            </div>
            <div class="step-card">
              <div class="step-number">2</div>
              <h3 class="step-title">Choose Template</h3>
              <p>Select from our beautifully designed templates and add your branding.</p>
            </div>
            <div class="step-card">
              <div class="step-number">3</div>
              <h3 class="step-title">Send & Get Paid</h3>
              <p>Email the PDF instantly with a clickable Venmo QR code for fast payment.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" class="features-alternating">
        <div class="container">
          <div class="feature-row">
            <div class="feature-text">
              <h2>Instant Payments with Venmo QR</h2>
              <p>Stop waiting for checks to arrive in the mail. Every invoice generated can include a custom branded Venmo QR code that your clients can scan or click to pay you instantly.</p>
              <ul class="feature-bullets">
                <li><v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>Clickable QR codes on PDF</li>
                <li><v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>Seamless mobile payment flow</li>
              </ul>
            </div>
            <div class="feature-image">
              <div class="mockup-card qr-mockup">
                <img src="/venmo-qr-with-logo.png" alt="Venmo QR Code with Logo" class="qr-img" />
              </div>
            </div>
          </div>

          <div class="feature-row reverse">
            <div class="feature-text">
              <h2>Versatile Professional Templates</h2>
              <p>Your brand matters. Choose between Classic, Modern, or Corporate templates. Customize colors and add your logo to make every invoice look incredible.</p>
              <ul class="feature-bullets">
                <li><v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>3 High-conversion designs</li>
                <li><v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>Live preview while editing</li>
              </ul>
            </div>
            <div class="feature-image">
              <div class="template-gallery">
                <img src="/template_classic.png" class="template-card" alt="Classic Template" tabindex="0" />
                <img src="/template_modern.png" class="template-card modern" alt="Modern Template" tabindex="0" />
                <img src="/template_corporate.png" class="template-card corp" alt="Corporate Template" tabindex="0" />
              </div>
            </div>
          </div>

          <div class="feature-row">
            <div class="feature-text">
              <h2>One-Click PDF & Emailing</h2>
              <p>Generate precise, high-quality PDFs with a single click. Email them directly to your clients from within the dashboard—no need to juggle apps.</p>
              <ul class="feature-bullets">
                <li><v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>Flawless PDF rendering</li>
                <li><v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>Automated email delivery</li>
              </ul>
            </div>
            <div class="feature-image">
               <div class="mockup-card pdf-mockup">
                 <img src="/ScanGo_click_send_3.gif" alt="Send PDF Animation" class="pdf-img" />
               </div>
            </div>
          </div>
          
          <div class="text-center mt-12 mb-12">
            <v-btn to="/pricing" color="primary" size="x-large" rounded="pill" class="glow-btn">See All Features & Pricing</v-btn>
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

/* How It Works Section */
.how-it-works {
  padding: 6rem 0 3rem 0;
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

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2.5rem;
  margin-top: 3rem;
}

.step-card {
  background: white;
  padding: 2.5rem 2rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
}

.step-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0,0,0,0.08);
}

.step-number {
  width: 50px;
  height: 50px;
  background: var(--v-primary-base, #1976D2);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 auto 1.5rem auto;
  box-shadow: 0 4px 15px rgba(25, 118, 210, 0.3);
}

.step-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #111;
}

.step-card p {
  color: #555;
  font-size: 0.95rem;
  line-height: 1.6;
}

/* Features Alternating Section */
.features-alternating {
  padding: 3rem 0 6rem 0;
  background-color: #f8f9fa;
}

.feature-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 4rem;
  margin-bottom: 6rem;
}

.feature-row.reverse {
  direction: rtl;
}

.feature-row.reverse > * {
  direction: ltr;
}

.feature-text h2 {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #111;
  line-height: 1.2;
}

.feature-text p {
  font-size: 1.1rem;
  color: #555;
  line-height: 1.7;
  margin-bottom: 1.5rem;
}

.feature-bullets {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-bullets li {
  display: flex;
  align-items: center;
  font-size: 1.05rem;
  color: #333;
  margin-bottom: 0.8rem;
  font-weight: 600;
}

.feature-image {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

/* Mockups & Animations */
.mockup-card {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 50px rgba(0,0,0,0.08);
  text-align: center;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  width: 100%;
  max-width: 360px;
  position: relative;
  z-index: 1;
}

.mockup-card:hover {
  transform: scale(1.05);
  z-index: 2;
  box-shadow: 0 30px 60px rgba(0,0,0,0.15);
}

.pdf-mockup {
  padding: 0;
  overflow: hidden;
}

.pdf-img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 20px;
}

.qr-mockup {
  padding: 1.5rem;
  max-width: 250px;
}

.qr-img {
  width: 100%;
  height: auto;
  border-radius: 12px;
  display: block;
}

.qr-mockup:hover {
  transform: scale(1.3) translateY(-10px) rotate(0deg);
  z-index: 10;
  box-shadow: 0 30px 60px rgba(0,0,0,0.25);
}

.template-gallery {
  display: flex;
  gap: 1rem;
  position: relative;
  height: 300px;
  width: 100%;
  justify-content: center;
  align-items: center;
}

.template-card {
  width: 140px;
  height: 200px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  position: absolute;
  transition: all 0.4s ease;
  border: 1px solid #eee;
  object-fit: cover;
  object-position: top;
}

.template-card {
  transform: translateX(-80px) rotate(-10deg) scale(0.9);
  z-index: 1;
}

.template-card.modern {
  transform: translateX(0) scale(1.1);
  z-index: 3;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}

.template-card.corp {
  transform: translateX(80px) rotate(10deg) scale(0.9);
  z-index: 2;
}

.template-gallery:hover .template-card {
  transform: translateX(-120px) rotate(-15deg) scale(0.95);
  opacity: 0.6;
}
.template-gallery:hover .template-card.modern {
  transform: translateX(0) translateY(-20px) scale(1.15);
  opacity: 0.6;
}
.template-gallery:hover .template-card.corp {
  transform: translateX(120px) rotate(15deg) scale(0.95);
  opacity: 0.6;
}

.template-gallery:hover .template-card:hover,
.template-card:focus {
  transform: translateX(-40px) translateY(-30px) rotate(0deg) scale(2.3);
  z-index: 10;
  opacity: 1;
  box-shadow: 0 25px 60px rgba(0,0,0,0.3);
  outline: none;
}
.template-gallery:hover .template-card.modern:hover,
.template-card.modern:focus {
  transform: translateX(0) translateY(-30px) rotate(0deg) scale(2.3);
  z-index: 10;
  opacity: 1;
  box-shadow: 0 25px 60px rgba(0,0,0,0.3);
  outline: none;
}
.template-gallery:hover .template-card.corp:hover,
.template-card.corp:focus {
  transform: translateX(40px) translateY(-30px) rotate(0deg) scale(2.3);
  z-index: 10;
  opacity: 1;
  box-shadow: 0 25px 60px rgba(0,0,0,0.3);
  outline: none;
}

.glow-btn {
  box-shadow: 0 8px 25px rgba(25, 118, 210, 0.4);
  transition: all 0.3s ease;
}

.glow-btn:hover {
  box-shadow: 0 12px 35px rgba(25, 118, 210, 0.6);
  transform: translateY(-2px);
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

  .feature-row {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 3rem;
  }
  .feature-row.reverse {
    direction: ltr;
  }
  .feature-bullets li {
    justify-content: center;
  }

  .qr-mockup:hover {
    transform: scale(1.05);
    z-index: 2;
    box-shadow: 0 30px 60px rgba(0,0,0,0.15);
  }

  .template-gallery:hover .template-card:hover,
  .template-card:focus,
  .template-gallery:hover .template-card.modern:hover,
  .template-card.modern:focus,
  .template-gallery:hover .template-card.corp:hover,
  .template-card.corp:focus {
    transform: translateX(0) translateY(-20px) rotate(0deg) scale(2.2);
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

  .how-it-works, .features-alternating {
    padding: 3rem 0;
  }

  .steps-grid {
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