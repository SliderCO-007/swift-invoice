<template>
  <div class="features-page">
    <main class="page-content">
      <section id="features" class="features-alternating">
        <div class="container">
          <h1 class="page-title text-center mb-4">Platform Features</h1>
          <p class="section-subtitle text-center mb-12">Everything you need to invoice professionally, track billable work, and get paid faster.</p>

          <!-- 1. AI Voice Invoice Creation (First Feature) -->
          <div class="feature-row">
            <div class="feature-text">
              <div class="feature-ai-badge mb-3">
                <v-icon size="16" color="#2dd4bf" class="mr-1">mdi-microphone</v-icon>
                <span>NEW • AI-POWERED VOICE INVOICING</span>
              </div>
              <h2>Create Invoices by Voice</h2>
              <p>Hands full on the job site or sitting in your truck? Just tap the microphone and speak naturally into your phone. ScanGo's AI listens to your voice command, fuzzy-matches your saved clients and catalog item rates, and populates the invoice editor in seconds for review.</p>
              <ul class="feature-bullets">
                <li><v-icon color="teal-accent-3" class="mr-2 flex-shrink-0">mdi-check-circle</v-icon><span>Speak client name, hours, items, rates, and due date in one shot</span></li>
                <li><v-icon color="teal-accent-3" class="mr-2 flex-shrink-0">mdi-check-circle</v-icon><span>Smart AI fuzzy-matching against your saved Customers &amp; Catalog Items</span></li>
                <li><v-icon color="teal-accent-3" class="mr-2 flex-shrink-0">mdi-check-circle</v-icon><span>Pre-fills the Invoice Editor for instant review before sending</span></li>
              </ul>
              <v-chip color="teal-accent-3" variant="tonal" size="small" class="mt-4 font-weight-bold" prepend-icon="mdi-check-decagram">Included on All Plans (Free &amp; Pro)</v-chip>
            </div>
            <div class="feature-image">
              <div class="voice-mockup-card">
                <div class="voice-mockup-header">
                  <div class="voice-mockup-mic-icon">
                    <v-icon color="#2dd4bf" size="22">mdi-microphone</v-icon>
                  </div>
                  <div class="voice-mockup-title-group">
                    <span class="voice-mockup-title">Voice Invoice</span>
                    <span class="voice-mockup-pill">AI Powered</span>
                  </div>
                </div>

                <div class="voice-mockup-wave-row">
                  <div class="voice-mockup-mic-circle">
                    <v-icon color="white" size="24">mdi-microphone</v-icon>
                  </div>
                  <div class="voice-mockup-bars" aria-hidden="true">
                    <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                  </div>
                  <span class="voice-mockup-status">Listening...</span>
                </div>

                <div class="voice-mockup-transcript-well">
                  <div class="voice-well-label">
                    <v-icon size="13" color="#38bdf8" class="mr-1">mdi-text-box-edit-outline</v-icon>
                    <span>Voice Transcript</span>
                    <span class="voice-well-tag">Tap to Edit</span>
                  </div>
                  <p class="voice-well-text">
                    “Invoice <strong>John Smith</strong> for <strong>4 hours</strong> of <strong>plumbing repair at $95/hr</strong> and a <strong>$45 valve</strong>, due next Friday”
                  </p>
                </div>

                <div class="voice-mockup-matched-chips">
                  <div class="matched-chip">
                    <v-icon size="14" color="#2dd4bf" class="mr-1">mdi-account-check-outline</v-icon>
                    <span>Matched: <strong>John Smith</strong></span>
                  </div>
                  <div class="matched-chip">
                    <v-icon size="14" color="#38bdf8" class="mr-1">mdi-format-list-checks</v-icon>
                    <span>2 Line Items • <strong>$425.00</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="feature-row reverse">
            <div class="feature-text">
              <h2>Direct Online Payments</h2>
              <p>Accelerate your cash flow. Accept credit card payments, Apple Pay, Google Pay, and ACH directly through ScanGo Invoice's secure checkout — no redirect, no third-party app required.</p>
              <ul class="feature-bullets">
                <li><v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>Secure credit card checkout</li>
                <li><v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>Clickable payment links & QR codes</li>
              </ul>
            </div>
            <div class="feature-image">
              <div class="mockup-card qr-mockup">
                <div class="qr-wrapper">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&ecc=H&data=https%3A%2F%2Fscangoinvoice.com%2Fpay%2Fdemo"
                    alt="Scan to see a demo payment page"
                    class="qr-img"
                    crossorigin="anonymous"
                  />
                  <img
                    src="/Logo.webp"
                    alt="ScanGo Logo"
                    class="qr-logo-overlay"
                    loading="lazy"
                    width="44"
                    height="44"
                  />
                </div>
                <p class="qr-caption">Scan to see a live demo</p>
              </div>
            </div>
          </div>

          <div class="feature-row">
            <div class="feature-text">
              <h2>Agency-Quality Templates</h2>
              <p>Make a lasting impression. Select from our library of versatile designs and fully customize them to align with your professional brand standards.</p>
              <ul class="feature-bullets">
                <li><v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>6 High-conversion designs</li>
                <li><v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>Preview full version of your invoice</li>
                <li><v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>Customized to your brand</li>
              </ul>
            </div>
            <div class="feature-image">
              <div class="template-gallery">
                <img src="/template_classic.webp" class="template-card" alt="Classic Template" tabindex="0" loading="lazy" width="280" height="396" />
                <img src="/template_modern.webp" class="template-card modern" alt="Modern Template" tabindex="0" loading="lazy" width="280" height="396" />
                <img src="/template_corporate.webp" class="template-card corp" alt="Corporate Template" tabindex="0" loading="lazy" width="280" height="396" />
              </div>
            </div>
          </div>

          <div class="feature-row reverse">
            <div class="feature-text">
              <h2>Project Tracking &amp; Instant Invoicing</h2>
              <p>Stop guessing what to bill. Log billable hours and job expenses under a named project, then convert all your work into a professional invoice with a single click. Receipts, rates, and categories stay organized — so you don’t have to.</p>
              <ul class="feature-bullets">
                <li><v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>Log time with a default hourly rate per project</li>
                <li><v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>Capture expense receipts with your phone camera</li>
                <li><v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>One-click conversion to a pre-filled invoice</li>
              </ul>
              <v-chip color="success" variant="tonal" size="small" class="mt-4" prepend-icon="mdi-lock-outline">Monthly &amp; Annual plans</v-chip>
            </div>
            <div class="feature-image">
              <div class="flow-diagram">
                <div class="flow-step">
                  <div class="flow-icon">
                    <v-icon size="32" color="white">mdi-folder-outline</v-icon>
                  </div>
                  <span class="flow-label">Create Project</span>
                </div>
                <v-icon class="flow-arrow" color="rgba(255,255,255,0.3)">mdi-arrow-right</v-icon>
                <div class="flow-step">
                  <div class="flow-icon">
                    <v-icon size="32" color="white">mdi-clock-plus-outline</v-icon>
                  </div>
                  <span class="flow-label">Log Time &amp; Expenses</span>
                </div>
                <v-icon class="flow-arrow" color="rgba(255,255,255,0.3)">mdi-arrow-right</v-icon>
                <div class="flow-step flow-step-highlight">
                  <div class="flow-icon flow-icon-highlight">
                    <v-icon size="32" color="white">mdi-file-document-arrow-right</v-icon>
                  </div>
                  <span class="flow-label">Invoice Sent</span>
                </div>
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

          <div class="feature-row reverse">
            <div class="feature-text">
              <h2>Instant Text-2-Pay SMS Invoicing</h2>
              <p>Accelerate payments with SMS. Text invoice payment links directly to your client's smartphone so they can pay online in seconds with Apple Pay, Google Pay, or Credit Card.</p>
              <ul class="feature-bullets">
                <li><v-icon color="primary" class="mr-2 flex-shrink-0">mdi-check-circle</v-icon><span>1-Click Text-2-Pay SMS delivery to client mobile phones</span></li>
                <li><v-icon color="primary" class="mr-2 flex-shrink-0">mdi-check-circle</v-icon><span>Automated payment confirmation text receipts</span></li>
                <li><v-icon color="primary" class="mr-2 flex-shrink-0">mdi-check-circle</v-icon><span>CTIA &amp; A2P 10DLC carrier compliant messaging</span></li>
              </ul>
            </div>
            <div class="feature-image">
              <div class="sms-mockup-card">
                <div class="sms-header">
                  <v-icon color="teal-accent-4" size="24">mdi-cellphone-text</v-icon>
                  <span class="sms-title">Text-2-Pay SMS</span>
                </div>
                <div class="sms-bubble">
                  <p class="sms-text">ScanGo Invoice #1042 for $450.00 from Acme Studio is ready. Pay online here: https://scangoinvoice.com/pay/demo - Reply STOP to opt out, HELP for info.</p>
                  <span class="sms-time">Delivered • Just now</span>
                </div>
                <div class="sms-receipt-badge mt-3">
                  <v-icon size="small" color="success">mdi-check-all</v-icon>
                  <span>Auto-Receipt Sent Upon Payment</span>
                </div>
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
        <div class="footer-trust-social">
          <a
            href="https://www.facebook.com/scangoinvoice"
            target="_blank"
            rel="noopener noreferrer"
            class="social-link-facebook"
            title="Facebook"
            aria-label="Facebook"
          >
            <v-icon size="22">mdi-facebook</v-icon>
          </a>
          <div class="footer-trustpilot-wrapper">
            <Trustpilot />
          </div>
          <a
            href="https://www.instagram.com/scangoinvoice"
            target="_blank"
            rel="noopener noreferrer"
            class="social-link-instagram"
            title="Instagram"
            aria-label="Instagram"
          >
            <v-icon size="22">mdi-instagram</v-icon>
          </a>
        </div>
        <p>&copy; 2026 ScanGo Invoice. All rights reserved. | <a
            href="mailto:support@scangoinvoice.com">support@scangoinvoice.com</a> | <router-link to="/about">About Us</router-link> | <router-link to="/blog">Blog</router-link> | <router-link to="/privacy">Privacy
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
  'Discover all the powerful features of ScanGo Invoice. AI Voice-to-Invoice creation, professional templates, direct online payments, project time and expense tracking, one-click invoice conversion, PDF downloads, and integrated email & SMS delivery.',
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

.qr-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}

.qr-img {
  width: 100%;
  height: auto;
  border-radius: 12px;
  display: block;
}

.qr-logo-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 22%;
  height: 22%;
  object-fit: contain;
  background: white;
  border-radius: 6px;
  padding: 3px;
}

.qr-caption {
  margin-top: 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #94a3b8;
  text-align: center;
  letter-spacing: 0.04em;
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

/* Flow Diagram (Project Tracking feature) */
.flow-diagram {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 2.5rem 2rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 420px;
}

.flow-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.flow-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.flow-icon-highlight {
  background: linear-gradient(135deg, rgba(74, 222, 128, 0.25), rgba(6, 182, 212, 0.25));
  border-color: rgba(74, 222, 128, 0.4);
  box-shadow: 0 0 20px rgba(74, 222, 128, 0.2);
}

.flow-diagram:hover .flow-icon {
  transform: translateY(-4px);
}

.flow-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  text-align: center;
  letter-spacing: 0.03em;
}

.flow-step-highlight .flow-label {
  color: #86efac;
}

.flow-arrow {
  flex-shrink: 0;
  margin-bottom: 1.5rem;
}

/* Voice Invoice Feature Styles */
.feature-ai-badge {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, rgba(45, 212, 191, 0.16), rgba(56, 189, 248, 0.16));
  border: 1px solid rgba(45, 212, 191, 0.45);
  color: #2dd4bf;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  box-shadow: 0 0 18px rgba(45, 212, 191, 0.18);
}

.voice-mockup-card {
  background: linear-gradient(180deg, #111d2f 0%, #0d1726 100%);
  border: 1px solid rgba(45, 212, 191, 0.4);
  border-radius: 22px;
  padding: 1.5rem;
  box-shadow:
    0 24px 55px rgba(0, 0, 0, 0.5),
    0 0 35px rgba(45, 212, 191, 0.15);
  width: 100%;
  max-width: 410px;
  box-sizing: border-box;
  text-align: left;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
}

.voice-mockup-card:hover {
  transform: scale(1.04) translateY(-4px);
  box-shadow:
    0 30px 65px rgba(0, 0, 0, 0.6),
    0 0 45px rgba(45, 212, 191, 0.28);
}

.voice-mockup-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 0.9rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.voice-mockup-mic-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(45, 212, 191, 0.14);
  border: 1px solid rgba(45, 212, 191, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}

.voice-mockup-title-group {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.voice-mockup-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #ffffff;
}

.voice-mockup-pill {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.14);
  border: 1px solid rgba(56, 189, 248, 0.35);
  padding: 2px 8px;
  border-radius: 999px;
}

.voice-mockup-wave-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
}

.voice-mockup-mic-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 0 6px rgba(239, 68, 68, 0.18), 0 6px 16px rgba(239, 68, 68, 0.35);
  animation: voicePulseMockup 2s infinite ease-in-out;
}

@keyframes voicePulseMockup {
  0%, 100% {
    box-shadow: 0 0 0 5px rgba(239, 68, 68, 0.18), 0 6px 16px rgba(239, 68, 68, 0.35);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(239, 68, 68, 0.08), 0 8px 22px rgba(239, 68, 68, 0.5);
  }
}

.voice-mockup-bars {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 26px;
}

.voice-mockup-bars span {
  width: 4px;
  border-radius: 999px;
  background: linear-gradient(180deg, #2dd4bf, #38bdf8);
  animation: voiceWaveBar 1.15s infinite ease-in-out;
}

.voice-mockup-bars span:nth-child(1) { height: 10px; animation-delay: 0s; }
.voice-mockup-bars span:nth-child(2) { height: 20px; animation-delay: 0.15s; }
.voice-mockup-bars span:nth-child(3) { height: 14px; animation-delay: 0.3s; }
.voice-mockup-bars span:nth-child(4) { height: 24px; animation-delay: 0.1s; }
.voice-mockup-bars span:nth-child(5) { height: 16px; animation-delay: 0.25s; }
.voice-mockup-bars span:nth-child(6) { height: 22px; animation-delay: 0.4s; }
.voice-mockup-bars span:nth-child(7) { height: 11px; animation-delay: 0.2s; }

@keyframes voiceWaveBar {
  0%, 100% { transform: scaleY(0.65); opacity: 0.75; }
  50% { transform: scaleY(1.15); opacity: 1; }
}

.voice-mockup-status {
  margin-left: auto;
  font-size: 0.78rem;
  font-weight: 600;
  color: #fca5a5;
  letter-spacing: 0.02em;
}

.voice-mockup-transcript-well {
  background: #1e293b;
  border: 1.5px solid rgba(56, 189, 248, 0.38);
  border-radius: 14px;
  padding: 0.85rem 1rem;
  box-shadow: inset 0 2px 6px rgba(2, 6, 23, 0.4), 0 4px 12px rgba(2, 6, 23, 0.25);
  margin-bottom: 0.9rem;
}

.voice-well-label {
  display: flex;
  align-items: center;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #e2e8f0;
  margin-bottom: 0.45rem;
}

.voice-well-tag {
  margin-left: auto;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.01em;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.28);
  padding: 1px 7px;
  border-radius: 999px;
}

.voice-well-text {
  font-size: 0.88rem !important;
  line-height: 1.5 !important;
  color: #f8fafc !important;
  margin-bottom: 0 !important;
}

.voice-well-text strong {
  color: #5eead4;
  font-weight: 700;
}

.voice-mockup-matched-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.matched-chip {
  display: inline-flex;
  align-items: center;
  font-size: 0.76rem;
  color: #e2e8f0;
  background: rgba(45, 212, 191, 0.1);
  border: 1px solid rgba(45, 212, 191, 0.3);
  padding: 0.35rem 0.65rem;
  border-radius: 9px;
}

.matched-chip strong {
  color: #ffffff;
  margin-left: 3px;
}

/* SMS Mockup Card */
.sms-mockup-card {
  background: rgba(17, 29, 47, 0.95);
  border: 1px solid rgba(20, 184, 166, 0.4);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4), 0 0 30px rgba(20, 184, 166, 0.15);
  width: 100%;
  max-width: 380px;
  box-sizing: border-box;
  text-align: left;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.sms-mockup-card:hover {
  transform: scale(1.05);
  box-shadow: 0 30px 60px rgba(0,0,0,0.5), 0 0 40px rgba(20, 184, 166, 0.25);
}

.sms-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0.75rem;
}

.sms-bubble {
  background: rgba(20, 184, 166, 0.12);
  border: 1px solid rgba(20, 184, 166, 0.3);
  border-radius: 16px 16px 16px 4px;
  padding: 1rem;
  color: #f1f5f9;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.sms-text {
  font-size: 0.85rem;
  line-height: 1.45;
  margin-bottom: 0.5rem;
  color: #e2e8f0;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.sms-time {
  font-size: 0.7rem;
  color: #2dd4bf;
  font-weight: 600;
  display: block;
}

.sms-receipt-badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #4ade80;
  background: rgba(74, 222, 128, 0.1);
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(74, 222, 128, 0.2);
}

/* Footer */
.footer {
  background-color: #0a111c;
  color: #94a3b8;
  padding: 2.5rem 1rem 2rem;
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

/* Footer Trust & Social Layout */
.footer-trust-social {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.footer-trustpilot-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.social-link-facebook {
  text-decoration: none !important;
  color: #1877f2 !important;
  background: rgba(24, 119, 242, 0.08) !important;
  border: 1px solid rgba(24, 119, 242, 0.25) !important;
  backdrop-filter: blur(8px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  padding: 10px;
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.social-link-facebook:hover {
  background: rgba(24, 119, 242, 0.2) !important;
  border-color: rgba(24, 119, 242, 0.5) !important;
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 0 15px rgba(24, 119, 242, 0.4) !important;
}

.social-link-instagram {
  text-decoration: none !important;
  color: #e1306c !important;
  background: rgba(225, 48, 108, 0.08) !important;
  border: 1px solid rgba(225, 48, 108, 0.25) !important;
  backdrop-filter: blur(8px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  padding: 10px;
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.social-link-instagram:hover {
  background: rgba(225, 48, 108, 0.2) !important;
  border-color: rgba(225, 48, 108, 0.5) !important;
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 0 15px rgba(225, 48, 108, 0.4) !important;
}

@media (max-width: 600px) {
  .footer-trust-social {
    flex-wrap: wrap;
    gap: 1rem 1.25rem;
  }

  .social-link-facebook {
    order: 1;
  }

  .social-link-instagram {
    order: 2;
  }

  .footer-trustpilot-wrapper {
    order: 3;
    width: 100%;
    margin-top: 0.25rem;
  }
}

@media (max-width: 900px) {
  .page-content {
    padding-top: 70px;
  }
  .features-alternating {
    padding: 1rem 0 4rem 0;
  }
  .page-title {
    margin-top: 0;
    font-size: 2.2rem;
  }
  .section-subtitle {
    margin-bottom: 2.5rem !important;
  }
  .feature-row {
    grid-template-columns: 1fr;
    gap: 2.5rem;
    margin-bottom: 4rem;
  }
  .feature-row.reverse {
    direction: ltr;
  }
  .feature-text h2 {
    font-size: 1.75rem;
    margin-bottom: 1rem;
  }
  .sms-mockup-card {
    padding: 1.25rem;
    max-width: 100%;
    border-radius: 16px;
  }
}

</style>
