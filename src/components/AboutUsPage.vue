<template>
  <div class="about-us-container">
    <v-container class="about-us-content py-12">
      <!-- Hero Section -->
      <section class="hero-section text-center mb-16">
        <h1 class="hero-title mb-4">Behind the Screens of ScanGo Invoice</h1>
        <p class="hero-subtitle mx-auto">
          We are on a mission to dismantle billing complexity, combining elite security engineering with intuitive user design.
        </p>
      </section>

      <!-- Hybrid Brand Story -->
      <section class="story-section mb-16">
        <v-card class="story-card pa-6 pa-md-10">
          <v-row align="center">
            <v-col cols="12" md="7">
              <h2 class="section-title mb-6">Our Story & Commitment</h2>
              <p class="story-text mb-4">
                ScanGo Invoice was born out of shared frustration. As freelancers and system designers, we spent hours every month dealing with bloated, sluggish invoicing software. The tools were either too simple to handle complex project time-tracking or so complex they felt like a second job.
              </p>
              <p class="story-text mb-4">
                We set out to build the tool we always wanted: a lightning-fast, glassmorphic invoicing app that connects directly with Stripe for secure, 1-click customer payments, while seamlessly tracking every billable minute in the background.
              </p>
              <p class="story-text">
                Today, we support thousands of independent professionals, designers, and scaling systems. Our commitment is simple: absolute software reliability, ironclad encryption for your transactional data, and a frictionless experience for your clients.
              </p>
            </v-col>
            <v-col cols="12" md="5" class="d-flex justify-center">
              <div class="story-glow-container">
                <svg width="240" height="240" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <!-- Abstract Glowing Shield/Network Connection -->
                  <defs>
                    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#00F2FE" />
                      <stop offset="100%" stop-color="#4FACFE" />
                    </linearGradient>
                    <filter id="glowBlur" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="8" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                  <!-- Background Glow Circle -->
                  <circle cx="100" cy="100" r="60" fill="url(#glowGrad)" fill-opacity="0.05" filter="url(#glowBlur)" />
                  <!-- Network Lines -->
                  <path d="M50 100 L100 50 L150 100 L100 150 Z" stroke="url(#glowGrad)" stroke-width="1.5" stroke-opacity="0.3" />
                  <line x1="50" y1="100" x2="150" y2="100" stroke="url(#glowGrad)" stroke-width="1" stroke-opacity="0.2" />
                  <line x1="100" y1="50" x2="100" y2="150" stroke="url(#glowGrad)" stroke-width="1" stroke-opacity="0.2" />
                  <!-- Network Nodes -->
                  <circle cx="100" cy="50" r="6" fill="#00F2FE" filter="url(#glowBlur)" />
                  <circle cx="50" cy="100" r="6" fill="#4FACFE" />
                  <circle cx="150" cy="100" r="6" fill="#4FACFE" />
                  <circle cx="100" cy="150" r="6" fill="#00F2FE" filter="url(#glowBlur)" />
                  <circle cx="100" cy="100" r="12" fill="url(#glowGrad)" />
                  <!-- Shield Overlay -->
                  <path d="M92 90 H108 V105 C108 112 100 117 100 117 C100 117 92 112 92 105 V90 Z" fill="#ffffff" />
                </svg>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </section>

      <!-- Core Values Section -->
      <section class="values-section mb-16">
        <h2 class="section-title text-center mb-10">Our Three Core Pillars</h2>
        <v-row>
          <!-- Value 1: Simplicity -->
          <v-col cols="12" md="4">
            <v-card class="value-card pa-6 text-center">
              <div class="value-icon mb-4">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="teal-icon">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <h3 class="value-title mb-3">Absolute Simplicity</h3>
              <p class="value-description">
                Invoicing shouldn't require an accounting degree. We remove clutter to let you generate, preview, and send beautiful invoices in under 30 seconds.
              </p>
            </v-card>
          </v-col>

          <!-- Value 2: Security -->
          <v-col cols="12" md="4">
            <v-card class="value-card pa-6 text-center">
              <div class="value-icon mb-4">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="blue-icon">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3 class="value-title mb-3">Ironclad Security</h3>
              <p class="value-description">
                With PCI-compliant Stripe integrations, secure HTTPS data transfers, and protected Firestore databases, your transactions and client details are completely safe.
              </p>
            </v-card>
          </v-col>

          <!-- Value 3: Speed -->
          <v-col cols="12" md="4">
            <v-card class="value-card pa-6 text-center">
              <div class="value-icon mb-4">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="green-icon">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h3 class="value-title mb-3">Velocity & Payouts</h3>
              <p class="value-description">
                Fast invoices mean fast payouts. Our Stripe Connect integration enables your clients to pay in 1-click via Apple Pay, Google Pay, or Credit Card directly.
              </p>
            </v-card>
          </v-col>
        </v-row>
      </section>

      <!-- Operating Commitments Section -->
      <section class="commitments-section mb-16">
        <h2 class="section-title text-center mb-10">Our Operating Commitments</h2>
        <v-row class="justify-center">
          <!-- Commitment 1: 100% Independent & Bootstrapped -->
          <v-col cols="12" sm="6" md="4">
            <v-card class="commitment-card pa-6 text-center">
              <div class="commitment-icon-wrapper mb-4 mx-auto">
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="commitment-svg">
                  <defs>
                    <linearGradient id="commGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#00F2FE" />
                      <stop offset="100%" stop-color="#4FACFE" />
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="48" stroke="url(#commGrad1)" stroke-width="2" fill="rgba(255,255,255,0.02)" />
                  <!-- Rocket/Independence icon -->
                  <path d="M50 25 C50 25 35 45 35 60 C35 70 42 75 50 75 C58 75 65 70 65 60 C65 45 50 25 50 25 Z" fill="url(#commGrad1)" />
                  <path d="M45 68 C45 68 48 78 50 82 C52 78 55 68 55 68 Z" fill="#4FACFE" />
                  <circle cx="50" cy="52" r="4" fill="#ffffff" />
                </svg>
              </div>
              <h3 class="commitment-name">100% Independent</h3>
              <p class="commitment-role mb-3">Bootstrapped & User-First</p>
              <p class="commitment-desc">
                We are entirely self-funded and self-sustained. Because we answer to our community rather than outside investors or venture capitalists, we only focus on features that help you run your business.
              </p>
            </v-card>
          </v-col>

          <!-- Commitment 2: Direct Support -->
          <v-col cols="12" sm="6" md="4">
            <v-card class="commitment-card pa-6 text-center">
              <div class="commitment-icon-wrapper mb-4 mx-auto">
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="commitment-svg">
                  <defs>
                    <linearGradient id="commGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#10B981" />
                      <stop offset="100%" stop-color="#059669" />
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="48" stroke="url(#commGrad2)" stroke-width="2" fill="rgba(255,255,255,0.02)" />
                  <!-- Speech bubbles/support icon -->
                  <rect x="28" y="32" width="34" height="24" rx="6" fill="url(#commGrad2)" />
                  <rect x="42" y="44" width="32" height="22" rx="6" fill="#059669" stroke="rgba(17,29,47,0.8)" stroke-width="2" />
                  <circle cx="45" cy="44" r="2" fill="#ffffff" />
                  <circle cx="50" cy="44" r="2" fill="#ffffff" />
                  <path d="M38 56 L34 62 L42 62 Z" fill="url(#commGrad2)" />
                </svg>
              </div>
              <h3 class="commitment-name">Direct Support</h3>
              <p class="commitment-role mb-3">Zero Bots. Real People.</p>
              <p class="commitment-desc">
                We do not hide behind automated support bots or layers of junior ticket routers. When you need help or request a feature, you deal directly with the engineer who builds the platform.
              </p>
            </v-card>
          </v-col>

          <!-- Commitment 3: Privacy & Integrity -->
          <v-col cols="12" sm="6" md="4">
            <v-card class="commitment-card pa-6 text-center">
              <div class="commitment-icon-wrapper mb-4 mx-auto">
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="commitment-svg">
                  <defs>
                    <linearGradient id="commGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#F59E0B" />
                      <stop offset="100%" stop-color="#D97706" />
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="48" stroke="url(#commGrad3)" stroke-width="2" fill="rgba(255,255,255,0.02)" />
                  <!-- Shield/Key privacy icon -->
                  <path d="M50 26 L68 32 V50 C68 62 50 72 50 72 C50 72 32 62 32 50 V32 L50 26 Z" fill="url(#commGrad3)" />
                  <circle cx="50" cy="44" r="5" fill="#ffffff" />
                  <path d="M50 49 L50 60 H53" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" />
                </svg>
              </div>
              <h3 class="commitment-name">Privacy First</h3>
              <p class="commitment-role mb-3">No Monetized Invoice Data</p>
              <p class="commitment-desc">
                Our business model is simple: we charge a transparent subscription for premium features. We do not track you across the web, nor will we ever sell, rent, or trade your invoicing data.
              </p>
            </v-card>
          </v-col>
        </v-row>
      </section>

      <!-- Contact Section -->
      <section id="contact" class="contact-section text-center">
        <h2 class="section-title mb-2">Get in Touch</h2>
        <p class="hero-subtitle mx-auto mb-8">
          Have questions or need support? Reach out to us directly or connect with us online.
        </p>
        <v-card class="contact-card mx-auto pa-6" style="max-width: 500px;">
          <div class="d-flex flex-column align-center ga-4">
            <a href="mailto:support@scangoinvoice.com" class="contact-email-link d-flex align-center ga-2 text-decoration-none">
              <v-icon color="primary" size="24">mdi-email-outline</v-icon>
              <span class="text-white font-weight-medium">support@scangoinvoice.com</span>
            </a>
            <a href="https://m.me/913313295207738" target="_blank" rel="noopener noreferrer" class="messenger-cta-btn d-flex align-center justify-center ga-2 text-decoration-none">
              <v-icon size="20">mdi-facebook-messenger</v-icon>
              <span>Message us on Facebook</span>
            </a>
            <v-divider class="w-100 border-opacity-10 my-2" color="white"></v-divider>
            <div class="d-flex align-center justify-center ga-6">
              <a href="https://www.facebook.com/scangoinvoice" target="_blank" rel="noopener noreferrer" class="social-link-facebook" title="Facebook">
                <v-icon size="24">mdi-facebook</v-icon>
              </a>
              <a href="https://m.me/913313295207738" target="_blank" rel="noopener noreferrer" class="social-link-messenger" title="Facebook Messenger">
                <v-icon size="24">mdi-facebook-messenger</v-icon>
              </a>
              <a href="https://www.instagram.com/scangoinvoice" target="_blank" rel="noopener noreferrer" class="social-link-instagram" title="Instagram">
                <v-icon size="24">mdi-instagram</v-icon>
              </a>
            </div>
          </div>
        </v-card>
      </section>

      <!-- CTA Section -->
      <section class="cta-section text-center">
        <v-card class="cta-card pa-8 pa-md-12">
          <h2 class="cta-title mb-4">Start Smarter Billing Today</h2>
          <p class="cta-subtitle mb-8 mx-auto">
            Join thousands of independent contractors and creators who trust ScanGo Invoice to manage their billable tracking and online payouts.
          </p>
          <v-btn to="/register" color="primary" class="cta-btn font-weight-bold px-8 py-4" size="large" rounded="pill">
            Create Free Account
          </v-btn>
        </v-card>
      </section>
    </v-container>

    <footer class="footer">
      <div class="footer-container">
        <p>&copy; 2026 ScanGo Invoice. All rights reserved. | <a
            href="mailto:support@scangoinvoice.com">support@scangoinvoice.com</a> | <router-link to="/about">About Us</router-link> | <router-link to="/guide">User Guide</router-link> | <router-link to="/privacy">Privacy
            Policy</router-link> | <router-link to="/terms">Terms of Service</router-link></p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useMeta } from '../composables/useMeta';

useMeta(
  'About Us | ScanGo Invoice',
  'Learn about the team, mission, and secure technology behind ScanGo Invoice. Discover how we make invoicing fast, secure, and simple.',
);
</script>

<style scoped>
.about-us-container {
  min-height: 100vh;
  background-color: #111d2f;
  color: #f1f5f9;
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
}

.about-us-content {
  max-width: 1100px;
  margin: 0 auto;
}

/* Glassmorphism base cards */
:deep(.v-card) {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(16px);
  color: #f1f5f9 !important;
  border-radius: 20px !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1) !important;
}

/* Titles */
.hero-title {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.2;
  color: #ffffff;
  background: linear-gradient(135deg, #ffffff 30%, #a5b4fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

@media (max-width: 600px) {
  .hero-title {
    font-size: 2.2rem;
  }
}

.hero-subtitle {
  font-size: 1.25rem;
  line-height: 1.6;
  color: #94a3b8;
  max-width: 700px;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
}

/* Brand Story Card */
.story-card {
  box-shadow: 0 15px 40px rgba(0, 242, 254, 0.03) !important;
}

.story-text {
  font-size: 1.05rem;
  line-height: 1.7;
  color: #cbd5e1;
}

.story-glow-container {
  padding: 1.5rem;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 242, 254, 0.06) 0%, transparent 70%);
}

/* Core Values Grid */
.value-card {
  height: 100%;
}

.value-card:hover {
  transform: translateY(-8px);
  border-color: rgba(0, 242, 254, 0.3) !important;
  box-shadow: 0 15px 35px rgba(0, 242, 254, 0.1) !important;
}

.value-icon {
  display: inline-flex;
  padding: 1rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.teal-icon {
  color: #00f2fe;
  filter: drop-shadow(0 0 6px rgba(0, 242, 254, 0.4));
}

.blue-icon {
  color: #60a5fa;
  filter: drop-shadow(0 0 6px rgba(96, 165, 250, 0.4));
}

.green-icon {
  color: #10b981;
  filter: drop-shadow(0 0 6px rgba(16, 185, 129, 0.4));
}

.value-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #ffffff;
}

.value-description {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #94a3b8;
}

/* Operating Commitments */
.commitment-card {
  height: 100%;
  border-color: rgba(255, 255, 255, 0.05) !important;
}

.commitment-card:hover {
  transform: translateY(-6px);
  border-color: rgba(255, 255, 255, 0.15) !important;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4) !important;
}

.commitment-icon-wrapper {
  width: 100px;
  height: 100px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.commitment-svg {
  transition: transform 0.4s ease;
}

.commitment-card:hover .commitment-svg {
  transform: scale(1.05) rotate(3deg);
}

.commitment-name {
  font-size: 1.4rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.25rem;
}

.commitment-role {
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #38bdf8;
}

.commitment-desc {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #cbd5e1;
}

/* Call to Action */
.cta-card {
  background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%) !important;
  border-color: rgba(0, 242, 254, 0.15) !important;
  box-shadow: 0 20px 50px rgba(0, 242, 254, 0.05) !important;
}

.cta-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: #ffffff;
}

.cta-subtitle {
  font-size: 1.1rem;
  color: #94a3b8;
  max-width: 600px;
  line-height: 1.6;
}

.cta-btn {
  text-transform: none;
  font-size: 1.05rem !important;
  box-shadow: 0 0 20px rgba(0, 242, 254, 0.3) !important;
  background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%) !important;
  color: #0b1524 !important;
  transition: all 0.3s ease !important;
}

.cta-btn:hover {
  transform: scale(1.03);
  box-shadow: 0 0 30px rgba(0, 242, 254, 0.5) !important;
}

.contact-section {
  margin-top: 4rem;
  margin-bottom: 4rem;
}

@media (max-width: 600px) {
  .commitments-section {
    margin-bottom: 1.5rem !important;
  }
  .contact-section {
    margin-top: 0.5rem !important;
    margin-bottom: 1.5rem !important;
  }
  .footer {
    margin-top: 2rem !important;
  }
}

/* Contact & Social Footer Styles */
.contact-card {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(16px);
  border-radius: 20px !important;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3) !important;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.contact-card:hover {
  border-color: rgba(0, 242, 254, 0.2) !important;
  box-shadow: 0 20px 45px rgba(0, 242, 254, 0.05) !important;
}

.contact-email-link {
  color: #94a3b8;
  transition: all 0.3s ease;
  font-size: 1.1rem;
}

.contact-email-link:hover {
  color: #ffffff;
  text-shadow: 0 0 8px rgba(0, 242, 254, 0.4);
}

.social-link-facebook {
  text-decoration: none !important;
  color: #1877f2 !important;
  background: rgba(24, 119, 242, 0.05) !important;
  border: 1px solid rgba(24, 119, 242, 0.15) !important;
  backdrop-filter: blur(8px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  padding: 10px;
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.social-link-facebook:hover {
  background: rgba(24, 119, 242, 0.15) !important;
  border-color: rgba(24, 119, 242, 0.45) !important;
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 0 15px rgba(24, 119, 242, 0.4) !important;
}

/* Branded Messenger CTA Button & Social Icon */
.messenger-cta-btn {
  background: linear-gradient(135deg, #0084ff 0%, #00c6ff 100%) !important;
  color: #ffffff !important;
  padding: 10px 22px;
  border-radius: 24px;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
  box-shadow: 0 4px 15px rgba(0, 132, 255, 0.35);
  width: 100%;
  max-width: 320px;
}

.messenger-cta-btn:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 22px rgba(0, 132, 255, 0.55);
  filter: brightness(1.08);
}

.social-link-messenger {
  text-decoration: none !important;
  color: #0084ff !important;
  background: rgba(0, 132, 255, 0.05) !important;
  border: 1px solid rgba(0, 132, 255, 0.15) !important;
  backdrop-filter: blur(8px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  padding: 10px;
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.social-link-messenger:hover {
  background: rgba(0, 132, 255, 0.15) !important;
  border-color: rgba(0, 132, 255, 0.45) !important;
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 0 15px rgba(0, 132, 255, 0.4) !important;
}

.social-link-instagram {
  text-decoration: none !important;
  color: #e1306c !important;
  background: rgba(225, 48, 108, 0.05) !important;
  border: 1px solid rgba(225, 48, 108, 0.15) !important;
  backdrop-filter: blur(8px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  padding: 10px;
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.social-link-instagram:hover {
  background: rgba(225, 48, 108, 0.15) !important;
  border-color: rgba(225, 48, 108, 0.45) !important;
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 0 15px rgba(225, 48, 108, 0.4) !important;
}

.footer {
  background-color: #0a111c;
  color: #94a3b8;
  padding: 2rem 0;
  text-align: center;
  margin-top: 4rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.footer-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1rem;
}

.footer a {
  color: #f1f5f9;
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}
</style>
