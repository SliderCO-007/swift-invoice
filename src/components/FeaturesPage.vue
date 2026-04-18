<template>
  <div class="features-page">
    <main class="page-content">
      <section id="features" class="features-alternating">
        <div class="container">
          <h1 class="page-title text-center mb-4">Platform Features</h1>
          <p class="section-subtitle text-center mb-12">Everything you need to invoice professionally and get paid faster.</p>

          <div class="feature-row">
            <div class="feature-text">
              <h2>Modern Payment Integration</h2>
              <p>Accelerate your cash flow. Embed branded Venmo QR codes directly into your invoices, offering your clients a seamless, modern payment experience.</p>
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
              <h2>Agency-Quality Templates</h2>
              <p>Make a lasting impression. Select from our library of versatile designs and fully customize them to align with your professional brand standards.</p>
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
              <h2>Integrated PDF & Email</h2>
              <p>Centralize your workflow. Generate high-fidelity PDFs and deliver them directly to your clients' inboxes with a single click.</p>
              <ul class="feature-bullets">
                <li><v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>Flawless PDF rendering</li>
                <li><v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>Automated email delivery</li>
              </ul>
            </div>
            <div class="feature-image">
               <div class="mockup-card pdf-mockup">
                 <img src="/ScanGo_click_send_4.gif" alt="Send PDF Animation" class="pdf-img" />
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
            Policy</router-link> | <router-link to="/terms">Terms of Service</router-link></p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useMeta } from '../composables/useMeta';
import Trustpilot from './TrustpilotWidget.vue';

useMeta(
  'Features | ScanGo Invoice',
  'Discover all the powerful features of ScanGo Invoice. Professional templates, Venmo QR codes, PDF downloads, and integrated email delivery.',
);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

.features-page {
  font-family: 'Poppins', sans-serif;
  color: #f1f5f9;
  background-color: #111d2f;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-content {
  flex: 1;
  padding-top: 100px; /* Offset for AppBar */
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  margin-top: 2rem;
}

.section-subtitle {
  font-size: 1.2rem;
  color: #94a3b8;
}

/* Features Alternating Section */
.features-alternating {
  padding: 3rem 0 6rem 0;
  background-color: transparent;
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
  color: #fff;
  line-height: 1.2;
}

.feature-text p {
  font-size: 1.1rem;
  color: #e2e8f0;
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
  color: #f1f5f9;
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
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
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
  box-shadow: 0 30px 60px rgba(0,0,0,0.5);
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
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
  position: absolute;
  transition: all 0.4s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
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
  background-color: #0a111c;
  color: #94a3b8;
  padding: 2rem 0;
  text-align: center;
  margin-top: auto;
}

.footer a {
  color: #f1f5f9;
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}

@media (max-width: 900px) {
  .feature-row {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .feature-row.reverse {
    direction: ltr;
  }
}
</style>
