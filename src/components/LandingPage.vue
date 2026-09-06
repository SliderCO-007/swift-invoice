<template>
  <div class="landing-page">
    <main>
      <section class="hero">
        <div class="container">
          <div class="hero-grid">
            <div class="hero-content">
              <div class="d-sm-none mb-8 d-flex align-center justify-center">
                <img
                  src="/Logo.webp"
                  alt="ScanGo Logo"
                  width="44"
                  height="44"
                  style="
                    height: 44px;
                    width: auto;
                    filter: drop-shadow(0 4px 8px rgba(6, 182, 212, 0.3));
                  "
                  class="mr-1"
                />
                <span class="mobile-brand" style="letter-spacing: -1px"
                  ><span class="text-gradient">ScanGo</span> Invoice</span
                >
              </div>
              <h1 class="hero-title">{{ heroTitleText }}</h1>
              <h1 class="hero-title"><span class="text-gradient">{{ heroTitleHighlight }}</span></h1>
              <p class="hero-subtitle mt-4 mb-6">
                {{ heroSubtitleText }}
              </p>
              <div
                class="d-flex flex-column flex-sm-row flex-wrap ga-4 mt-8 align-center justify-center justify-md-start"
              >
                <!-- Google Button (Primary) -->
                <v-btn
                  @click="handleGoogleSignIn"
                  :loading="loading"
                  class="font-weight-bold px-10 cta-btn cta-btn-primary"
                  size="x-large"
                  rounded="xl"
                  :block="mobile"
                >
                  <svg
                    class="mr-2"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Start Free with Google
                </v-btn>

                <!-- Create Free Account (Secondary Outline) -->
                <v-btn
                  to="/register"
                  class="font-weight-bold px-10 cta-btn cta-btn-secondary"
                  size="x-large"
                  rounded="xl"
                  :block="mobile"
                >
                  <v-icon left size="24" class="mr-2">mdi-account-plus-outline</v-icon>
                  Create Free Account
                </v-btn>
              </div>

              <!-- Email Link & Demo Button Row -->
              <div class="mt-6 d-flex flex-column flex-sm-row align-center justify-center justify-md-start ga-6">
                <router-link to="/login" class="email-signup-link text-body-2 text-blue-grey-lighten-2 text-decoration-none">
                  <v-icon size="16" class="mr-1">mdi-login</v-icon>
                  Already have an account? Log In
                </router-link>

                <div class="d-none d-sm-block text-blue-grey-darken-3">|</div>

                <a
                  @click="openVideoModal"
                  class="play-demo-link text-body-2 text-blue-grey-lighten-2 text-decoration-none cursor-pointer d-flex align-center"
                >
                  <v-icon size="18" class="mr-1">mdi-play-circle-outline</v-icon>
                  Watch 2-Min Demo
                </a>
              </div>

              <!-- Risk-reduction info -->
              <p
                class="mt-6 text-caption text-sm-body-2 text-blue-grey-lighten-2 d-flex align-center justify-center justify-md-start"
              >
                <v-icon size="small" class="mr-1" color="success">mdi-shield-check-outline</v-icon>
                {{ riskReductionText }}
              </p>
              <div
                class="mt-8 d-flex flex-column flex-sm-row align-center justify-center justify-md-start ga-4"
              >
                <div
                  class="d-flex align-center cursor-pointer"
                  @click="router.push('/reviews')"
                >
                  <div class="avatar-group mr-4">
                    <v-avatar
                      size="36"
                      class="avatar-item font-weight-bold text-white bg-indigo-darken-1"
                      >S</v-avatar
                    >
                    <v-avatar
                      size="36"
                      class="avatar-item font-weight-bold text-white bg-pink-darken-1"
                      >M</v-avatar
                    >
                    <v-avatar
                      size="36"
                      class="avatar-item font-weight-bold text-white bg-teal-darken-1"
                      >A</v-avatar
                    >
                    <v-avatar
                      size="36"
                      class="avatar-item font-weight-bold text-white bg-orange-darken-1"
                      >J</v-avatar
                    >
                    <v-avatar
                      size="36"
                      class="avatar-item last-avatar text-white bg-grey-darken-3"
                      ><span class="text-caption font-weight-bold">20k+</span></v-avatar
                    >
                  </div>
                  <div class="text-left">
                    <div class="d-flex align-center">
                      <v-icon color="warning" size="small" v-for="n in 5" :key="n"
                        >mdi-star</v-icon
                      >
                    </div>
                    <div class="text-caption text-grey-lighten-1 mt-1 font-weight-medium">
                      Loved by 20,000+ users
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div class="hero-image">
              <div class="phone-frame shadow-glow big-phone">
                <div class="phone-notch"></div>
                <div class="phone-screen position-relative overflow-hidden">
                  <!-- Base Hero Image restored for all landing pages -->
                  <img
                    src="/branded_hero_v7.webp"
                    alt="ScanGo Invoice Application Preview"
                    class="base-hero-img"
                    fetchpriority="high"
                    decoding="async"
                  />

                  <!-- Overlay Animated GIF: loops 3 times then gently fades out -->
                  <Transition name="fade-overlay">
                    <img
                      v-if="showGifOverlay"
                      :src="gifSrc"
                      alt="ScanGo Invoice Feature Demo"
                      class="gif-overlay-img"
                    />
                  </Transition>

                  <!-- Replay Demo Button Overlay at bottom of screen when PNG is active -->
                  <Transition name="fade-overlay">
                    <button
                      v-if="!showGifOverlay"
                      class="replay-btn"
                      @click="replayGifAnimation"
                    >
                      <v-icon size="small" color="teal-accent-3">mdi-replay</v-icon>
                      <span>Replay Demo</span>
                    </button>
                  </Transition>
                </div>
              </div>
            </div>
          </div>

          <!-- Hero Benefits Badges v7 -->
          <div class="hero-benefits-badges d-flex flex-column ga-3 mb-0 mt-8 ml-0">
            <div class="benefit-badge" v-for="badge in badges" :key="badge.title">
              <div class="badge-icon-container">
                <svg v-if="badge.type === 'invoice'" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="grad-invoice" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#34d399" />
                      <stop offset="100%" stop-color="#059669" />
                    </linearGradient>
                  </defs>
                  <rect x="5" y="2" width="14" height="20" rx="3" stroke="url(#grad-invoice)" stroke-width="2" />
                  <line x1="10" y1="20" x2="14" y2="20" stroke="url(#grad-invoice)" stroke-width="2" stroke-linecap="round" />
                  <rect x="8" y="5" width="8" height="10" rx="1" fill="rgba(52, 211, 153, 0.15)" stroke="url(#grad-invoice)" stroke-width="1.5" />
                  <line x1="10" y1="8" x2="14" y2="8" stroke="url(#grad-invoice)" stroke-width="1.2" />
                  <line x1="10" y1="11" x2="13" y2="11" stroke="url(#grad-invoice)" stroke-width="1.2" />
                </svg>
                <svg v-else-if="badge.type === 'tracking'" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="grad-tracking" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#06b6d4" />
                      <stop offset="100%" stop-color="#0891b2" />
                    </linearGradient>
                  </defs>
                  <circle cx="12" cy="12" r="9" stroke="url(#grad-tracking)" stroke-width="2" />
                  <path d="M12 7V12L15 13.5" stroke="url(#grad-tracking)" stroke-width="2" stroke-linecap="round" />
                  <path d="M14 13.5H19V20.5H14V13.5Z" fill="rgba(6, 182, 212, 0.2)" stroke="url(#grad-tracking)" stroke-width="1.5" stroke-linejoin="round" />
                  <path d="M15 16H18" stroke="url(#grad-tracking)" stroke-width="1" />
                  <path d="M15 18H17" stroke="url(#grad-tracking)" stroke-width="1" />
                </svg>
                <svg v-else-if="badge.type === 'convert'" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="grad-convert" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#fbbf24" />
                      <stop offset="100%" stop-color="#ea580c" />
                    </linearGradient>
                  </defs>
                  <path d="M4 17V7C4 5.89543 4.89543 5 6 5H14L19 10V17C19 18.1046 18.1046 19 17 19H6C4.89543 19 4 18.1046 4 17Z" stroke="url(#grad-convert)" stroke-width="2" />
                  <path d="M14 5V10H19" stroke="url(#grad-convert)" stroke-width="2" stroke-linejoin="round" />
                  <path d="M11 9L7 13H11L9 17L13 13H9L11 9Z" stroke="url(#grad-convert)" stroke-width="1.5" stroke-linejoin="round" fill="rgba(251, 191, 36, 0.2)" />
                </svg>
                <svg v-else-if="badge.type === 'sms'" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="grad-sms" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#2dd4bf" />
                      <stop offset="100%" stop-color="#0d9488" />
                    </linearGradient>
                  </defs>
                  <rect x="6" y="2" width="12" height="20" rx="3" stroke="url(#grad-sms)" stroke-width="2" />
                  <path d="M9 7H15M9 10H13" stroke="url(#grad-sms)" stroke-width="1.5" stroke-linecap="round" />
                  <circle cx="12" cy="17" r="1" fill="#2dd4bf" />
                </svg>
              </div>
              <div class="badge-content">
                <div class="badge-title">{{ badge.title }}</div>
                <div class="badge-subtitle">{{ badge.subtitle }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Social Proof Section -->
      <section class="social-proof">
        <div class="container">
          <div class="social-proof-wrapper">
            <div class="trust-score-block">
              <div class="d-flex align-center justify-center justify-md-start mb-2">
                <span class="text-h4 font-weight-bold text-white mr-3">4.8</span>
                <div>
                  <div class="d-flex align-center">
                    <v-icon color="warning" size="small" v-for="n in 5" :key="n">mdi-star</v-icon>
                  </div>
                  <div class="text-caption text-grey-lighten-1 mt-0.5">Trustpilot Rating</div>
                </div>
              </div>
              <p class="text-body-2 text-blue-grey-lighten-2 mb-0">
                {{ trustRatingText }}
              </p>
            </div>
            
            <div class="proof-divider d-none d-md-block"></div>
            
            <div class="testimonials-grid">
              <div class="testimonial-card" v-for="t in testimonials" :key="t.author">
                <p class="testimonial-text">
                  {{ t.text }}
                </p>
                <div class="d-flex align-center">
                  <v-avatar size="28" :class="['mr-2', t.bgClass, 'text-white', 'text-caption', 'font-weight-bold']">
                    {{ t.author[0] }}
                  </v-avatar>
                  <span class="testimonial-author">
                    {{ t.author }} <span class="author-role">• {{ t.role }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" class="how-it-works">
        <div class="container">
          <div class="text-center mb-16">
            <h2 class="section-title">How It Works</h2>
            <p class="section-subtitle">
              A simpler workflow designed for speed and fast payments.
            </p>
          </div>

          <div class="how-it-works-grid">
            <!-- Step 1 -->
            <div class="step-card d-flex flex-column text-center">
              <div class="step-number">1</div>
              <div class="step-icon-wrapper mx-auto mb-6">
                <v-icon size="48" color="primary">mdi-file-document-edit-outline</v-icon>
              </div>
              <h3 class="text-h5 font-weight-bold text-white mb-4">
                Enable Instant Online Payments
              </h3>
              <p class="text-body-1 text-grey-lighten-1 mb-0">
                Connect or create your payment account in minutes and start accepting
                cards, Apple Pay, Google Pay, and ACH — all through ScanGo Invoice.
              </p>
            </div>

            <!-- Step 2 -->
            <div class="step-card d-flex flex-column text-center">
              <div class="step-number">2</div>
              <div class="step-icon-wrapper mx-auto mb-6">
                <v-icon size="48" color="primary">mdi-account-multiple-outline</v-icon>
              </div>
              <h3 class="text-h5 font-weight-bold text-white mb-4">
                Add Customers & Products
              </h3>
              <p class="text-body-1 text-grey-lighten-1 mb-0">
                Save time by setting up your client details and frequently sold items or
                services in advance. Select them from a dropdown to generate future
                invoices in seconds.
              </p>
            </div>

            <!-- Step 3 (Pro) -->
            <div class="step-card feature-step-card d-flex flex-column text-center">
              <div class="step-number highlight-number">3</div>
              <div class="step-icon-wrapper highlight-wrapper mx-auto mb-6">
                <v-icon size="48" color="white">mdi-folder-clock-outline</v-icon>
              </div>
              <h3 class="text-h5 font-weight-bold text-white mb-4">
                Track Work, Invoice Instantly
              </h3>
              <p class="text-body-1 text-grey-lighten-1 mb-8">
                Log billable hours and expenses under a project. Photograph and attach receipts to keep your expense records digital. When the work is done, convert it to a pre-filled invoice in one click — no manual data entry.
              </p>
              <div
                class="payment-methods d-flex justify-center align-center ga-4 flex-wrap"
              >
                <div class="payment-pill pro-pill">
                  <v-icon left size="small">mdi-clock-outline</v-icon> Time Tracking
                </div>
                <div class="payment-pill pro-pill">
                  <v-icon left size="small">mdi-receipt-outline</v-icon> Expense Receipts
                </div>
                <div class="payment-pill pro-pill">
                  <v-icon left size="small">mdi-lightning-bolt</v-icon> 1-Click Invoice
                </div>
              </div>
            </div>

            <!-- Step 4 -->
            <div class="step-card feature-step-card d-flex flex-column text-center">
              <div class="step-number highlight-number">4</div>
              <div class="step-icon-wrapper highlight-wrapper mx-auto mb-6">
                <v-icon size="48" color="white">mdi-cash-fast</v-icon>
              </div>
              <h3 class="text-h5 font-weight-bold text-white mb-4">Get Paid Your Way</h3>
              <p class="text-body-1 text-grey-lighten-1 mb-8">
                Customers choose their preferred method. You get paid fast — funds land
                directly into your account.
              </p>
              <div
                class="payment-methods d-flex justify-center align-center ga-4 flex-wrap"
              >
                <div class="payment-pill stripe">
                  <v-icon left size="small">mdi-credit-card-outline</v-icon> Credit Card
                </div>
                <div class="payment-pill stripe">
                  <v-icon left size="small">mdi-bank-outline</v-icon> ACH / Bank
                </div>
                <div class="payment-pill sms-pill">
                  <v-icon left size="small" color="teal-accent-3">mdi-cellphone-text</v-icon> Text-2-Pay SMS
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" class="faq-section">
        <div class="container">
          <h2 class="section-title">Frequently Asked Questions</h2>
          <p class="section-subtitle">Got questions? We've got answers.</p>
          <div class="faq-container">
            <v-expansion-panels variant="accordion" class="custom-panels">
              <v-expansion-panel
                v-for="(faq, i) in faqs"
                :key="i"
                class="glass-panel text-left"
              >
                <v-expansion-panel-title class="faq-title font-weight-bold">
                  {{ faq.question }}
                </v-expansion-panel-title>
                <v-expansion-panel-text class="faq-text text-grey-lighten-1">
                  <div v-html="faq.answer"></div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>

          <div class="text-center mt-12 mb-12">
            <v-btn
              to="/pricing"
              color="primary"
              size="x-large"
              rounded="pill"
              class="glow-btn"
              >See All Features & Pricing</v-btn
            >
          </div>
        </div>
      </section>

      <section class="final-cta pb-16 pt-8">
        <div class="container">
          <div class="cta-card text-center mx-auto pa-2 pa-md-8">
            <h2 class="text-h3 font-weight-bold text-white mb-4">
              Start Getting Paid Faster Today
            </h2>
            <p class="text-h6 text-grey-lighten-1 mb-10 mx-auto" style="max-width: 600px">
              Create your first invoice in under 60 seconds and give your customers a
              fast, secure way to pay online — no accounts required.
            </p>
            <div
              class="d-flex flex-column flex-sm-row flex-wrap ga-4 mt-8 align-center justify-center"
            >
              <!-- Google Button (Primary) -->
              <v-btn
                @click="handleGoogleSignIn"
                :loading="loading"
                class="font-weight-bold px-10 cta-btn cta-btn-primary"
                size="x-large"
                rounded="xl"
                :block="mobile"
              >
                <svg
                  class="mr-2"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Start Free with Google
              </v-btn>

              <!-- Email Button (Secondary) -->
              <v-btn
                to="/register"
                class="font-weight-bold px-10 cta-btn cta-btn-secondary"
                size="x-large"
                rounded="xl"
                :block="mobile"
              >
                <v-icon left size="24" class="mr-2">mdi-email-outline</v-icon>
                Create Account with Email
              </v-btn>
            </div>
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
        <p>
          &copy; 2026 ScanGo Invoice. All rights reserved. |
          <a href="mailto:support@scangoinvoice.com">support@scangoinvoice.com</a> |
          <router-link to="/about">About Us</router-link> |
          <router-link to="/guide">User Guide</router-link> |
          <router-link to="/privacy">Privacy Policy</router-link> |
          <router-link to="/terms">Terms of Service</router-link> |
          <a
            @click="trackDownload('footer_link')"
            href="/__ScanGo Invoice + Stripe Connect.pdf"
            target="_blank"
            rel="noopener noreferrer"
            >Setup Guide</a
          >
        </p>
      </div>
    </footer>

    <!-- Video Modal Lightbox -->
    <v-dialog
      v-model="videoDialogOpen"
      max-width="900px"
      transition="dialog-bottom-transition"
      z-index="2000"
    >
      <v-card class="video-modal-card">
        <div
          class="video-modal-header d-flex align-center justify-space-between px-6 py-4"
        >
          <div class="d-flex align-center">
            <v-icon color="primary" class="mr-2" size="28"
              >mdi-play-circle-outline</v-icon
            >
            <span class="text-h6 font-weight-bold text-white"
              >Getting Started with ScanGo</span
            >
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            color="white"
            size="small"
            @click="closeVideoModal"
          ></v-btn>
        </div>
        <v-card-text class="pa-0 bg-black">
          <div class="video-container">
            <iframe
              v-if="videoDialogOpen"
              :src="`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`"
              title="ScanGo Invoice Getting Started Video"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            ></iframe>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth, currentUser } from '../composables/useAuth.js'
import { useMeta } from '../composables/useMeta'
import { useDisplay } from 'vuetify'
import { event } from 'vue-gtag'
import Trustpilot from './TrustpilotWidget.vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'standard'
  }
})

const { mobile } = useDisplay()
const router = useRouter()
const { loading, googleLogin } = useAuth()

const trackDownload = (location) => {
  event('download_setup_guide', {
    event_category: 'engagement',
    event_label: location,
  })
}

// Copy content customization
const heroTitleText = computed(() => {
  if (props.variant === 'contractor') {
    return 'The 5-Step Blueprint to'
  } else if (props.variant === 'weekend') {
    return 'Keep Your Weekends for Yourself.'
  } else if (props.variant === 'time_is_money') {
    return 'Because Time is Money.'
  } else if (props.variant === 'no_paywall') {
    return "What's a Paywall?"
  }
  return 'Turn Tracked Work into Paid Invoices'
})

const heroTitleHighlight = computed(() => {
  if (props.variant === 'contractor') {
    return 'Get Paid in Minutes.'
  } else if (props.variant === 'weekend') {
    return 'Reclaim Your Sundays.'
  } else if (props.variant === 'time_is_money') {
    return 'Stop Giving Yours Away.'
  } else if (props.variant === 'no_paywall') {
    return 'Send Invoices for $0.'
  }
  return 'in One Click.'
})

const heroSubtitleText = computed(() => {
  if (props.variant === 'contractor') {
    return 'As featured in AllBusiness: stop waiting 30+ days for clients to pay. Shorten payment terms, collect on-site with Scan-to-Pay QR codes, and text 1-click payment links directly from your phone in under 60 seconds.'
  } else if (props.variant === 'weekend') {
    return 'Stop spending your Saturdays and Sundays writing invoices and sorting crumpled receipts. Invoice your clients directly from the field in under 60 seconds and let the cash flow automatically.'
  } else if (props.variant === 'time_is_money') {
    return 'Stop losing billable hours and forgetting project expenses. ScanGo Invoice tracks time, receipts, and expenses on the go for you and your team—all from your phone.'
  } else if (props.variant === 'no_paywall') {
    return 'Stop paying $40/mo subscriptions just to bill your clients. ScanGo unlocks direct Email & Text-2-Pay SMS, instant Stripe QR checkout, and jobsite tracking—with zero paywalls to get started.'
  }
  return 'Digitize your workflow on the go. Snap receipts to track expenses, log project hours, and get paid instantly via customer "Scan-to-Pay" QR codes.'
})

const riskReductionText = computed(() => {
  if (props.variant === 'contractor') {
    return 'Free tier includes 3 free invoices per month & unlimited projects. No credit card required.'
  } else if (props.variant === 'weekend') {
    return 'Free up your weekends today. No credit card required.'
  } else if (props.variant === 'no_paywall') {
    return '100% Free Starter Plan. No credit card required.'
  }
  return 'Free tier includes unlimited projects and 3 free invoices per month. No credit card required.'
})

const badges = computed(() => {
  if (props.variant === 'contractor') {
    return [
      {
        type: 'convert',
        title: '1. Shorten Payment Terms',
        subtitle: 'Switch terms to "Due Upon Receipt" or Net 10 with 1 click to get paid first'
      },
      {
        type: 'tracking',
        title: '2. On-Site Scan-to-Pay',
        subtitle: 'Let clients scan your QR code with their phone camera before you drive away'
      },
      {
        type: 'invoice',
        title: '3. 60-Sec Truck Invoicing',
        subtitle: 'Convert logged job hours and material receipts into a PDF invoice on the spot'
      },
      {
        type: 'sms',
        title: '4. Frictionless Text-2-Pay',
        subtitle: 'Text secure payment links for instant 1-tap Apple Pay or Card checkout'
      }
    ]
  } else if (props.variant === 'weekend') {
    return [
      {
        type: 'invoice',
        title: 'Zero Weekend Paperwork',
        subtitle: 'Never spend another Sunday night formatting templates or chasing client payments'
      },
      {
        type: 'tracking',
        title: 'Instant On-Site Billing',
        subtitle: 'Send professional invoices before you leave the job site in under 60 seconds'
      },
      {
        type: 'convert',
        title: 'Secure Direct Payouts',
        subtitle: 'Let clients scan to pay with Apple Pay, cards, or ACH, landing directly in your bank account'
      },
      {
        type: 'sms',
        title: 'Instant Text-2-Pay SMS',
        subtitle: 'Deliver instant SMS invoice links and automated payment receipts on the go'
      }
    ]
  } else if (props.variant === 'time_is_money') {
    return [
      {
        type: 'tracking',
        title: 'Team Time Tracking',
        subtitle: 'Track billable hours and labor rates on the job site for you and your entire crew'
      },
      {
        type: 'invoice',
        title: 'Receipt & Expense Capture',
        subtitle: 'Snap receipt photos and categorize expenses instantly to prevent leaked costs'
      },
      {
        type: 'convert',
        title: '1-Click Client Billing',
        subtitle: 'Seamlessly roll logged time and expenses into clean, professional invoices in seconds'
      },
      {
        type: 'sms',
        title: 'Text-2-Pay SMS Invoicing',
        subtitle: 'Send billing links and auto-receipts directly to client smartphones via text message'
      }
    ]
  } else if (props.variant === 'no_paywall') {
    return [
      {
        type: 'sms',
        title: 'Free SMS & Email Invoicing',
        subtitle: 'Send invoices directly to client inboxes or text instant payment links to their phones'
      },
      {
        type: 'convert',
        title: 'Instant Stripe QR Checkout',
        subtitle: 'Clients scan to pay on the spot via Apple Pay, Google Pay, Cards, or ACH'
      },
      {
        type: 'tracking',
        title: 'Receipt & Hours Tracking',
        subtitle: 'Snap jobsite receipt photos and log billable project hours without extra app fees'
      },
      {
        type: 'invoice',
        title: '3 Invoices Every Month',
        subtitle: 'Your free allowance resets automatically on the 1st of every month as your business grows'
      }
    ]
  }
  return [
    {
      type: 'invoice',
      title: '60s Mobile Invoicing',
      subtitle: 'Create & send professional invoices from your phone in under 60 seconds'
    },
    {
      type: 'tracking',
      title: 'On-the-Go Tracking',
      subtitle: 'Track billable hours & project expenses on-the-go (with receipt photos)'
    },
    {
      type: 'convert',
      title: '1-Click Conversion',
      subtitle: '1-Click conversion from project work directly into pre-filled invoices'
    },
    {
      type: 'sms',
      title: 'Text-2-Pay SMS Invoicing',
      subtitle: 'Send instant payment link texts directly to client smartphones'
    }
  ]
})

const trustRatingText = computed(() => {
  if (props.variant === 'contractor') {
    return 'Loved by 1,000+ local service pros worldwide.'
  } else if (props.variant === 'weekend') {
    return 'Loved by hundreds of busy business owners.'
  } else if (props.variant === 'time_is_money') {
    return 'Loved by hundreds of field crews and service professionals.'
  } else if (props.variant === 'no_paywall') {
    return 'Loved by hundreds of contractors, freelancers, and small business owners.'
  }
  return 'Loved by 20,000+ freelancers and agency owners worldwide.'
})

const testimonials = computed(() => {
  return [
    {
      text: '"ScanGo cut my invoicing time by 80%. Now I bill clients right from the job site and get paid before I even drive home."',
      author: 'David K.',
      role: 'HVAC & Plumbing Pro',
      bgClass: 'bg-indigo-darken-1'
    },
    {
      text: '"Text-2-Pay SMS is a game changer! I text the invoice link directly to my client\'s phone while at their office and they pay with Apple Pay right there."',
      author: 'Marcus T.',
      role: 'Service Specialist',
      bgClass: 'bg-teal-darken-1'
    },
    {
      text: '"Being able to log hours and take photos of supply receipts under a project, then turn it into an invoice with one click saved my weekend."',
      author: 'Sarah M.',
      role: 'Independent Contractor',
      bgClass: 'bg-pink-darken-1'
    }
  ]
})

const faqs = ref([
  {
    question: 'How do customers pay on ScanGo?',
    answer:
      'Customers receive a payment link via email or Text-2-Pay SMS, or scan a QR code on the invoice. They pay using credit/debit cards, Apple Pay, Google Pay, or ACH — no app or account needed.',
  },
  {
    question: 'How does Text-2-Pay SMS invoicing work?',
    answer:
      'With Text-2-Pay, you can send an SMS payment link directly to your client\'s mobile phone from any invoice. Your client taps the link, pays online instantly via Apple Pay or Credit Card, and an automated SMS payment receipt is dispatched right away.',
  },
  {
    question: 'Do I need a separate payment account?',
    answer:
      'Yes — ScanGo connects to your existing payment account or helps you set one up. It only takes a few minutes from your Settings page.',
  },
  {
    question: 'Do customers need a ScanGo account to pay?',
    answer: 'No. They simply click the payment link or scan the QR code on the invoice.',
  },
  {
    question: 'Where do payouts go?',
    answer: 'Directly into your bank account, typically within 2 business days.',
  },
  {
    question: 'Can I track project time and expenses?',
    answer:
      'Yes — you can create projects, log billable hours and expenses (with receipt photos), and convert them directly to a pre-filled invoice with one click. Labor and expenses are automatically rolled up into clean line items.',
  },
  {
    question: 'Is ScanGo secure?',
    answer:
      'Yes. All payments are processed through Stripe and all invoice data is encrypted.',
  },
])

const showGifOverlay = ref(true)
const gifSrc = ref('/new_hero.webp')
const videoDialogOpen = ref(false)
const youtubeId = 'q_ebv_earos'
let gifTimer = null

const startGifTimer = () => {
  if (gifTimer) clearTimeout(gifTimer)
  gifSrc.value = `/new_hero.webp?t=${Date.now()}`
  showGifOverlay.value = true
  gifTimer = setTimeout(() => {
    showGifOverlay.value = false
  }, 19200)
}

const replayGifAnimation = () => {
  startGifTimer()
}

const openVideoModal = () => {
  videoDialogOpen.value = true
  event('play_getting_started_video', {
    event_category: 'engagement',
    event_label: 'hero_button',
  })
}

const closeVideoModal = () => {
  videoDialogOpen.value = false
}

onMounted(() => {
  // Start playing new_hero.gif from frame 0 with 19.2s timer (3 loops)
  startGifTimer()

  // Set default signup_source if standard variant is hit and not already set
  if (props.variant === 'standard' && !sessionStorage.getItem('signup_source')) {
    sessionStorage.setItem('signup_source', 'lp_standard')
  }

  // Track landing page content view in Meta Pixel
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'ViewContent', {
      content_name: props.variant === 'standard' ? 'Landing Page' : `LP - ${props.variant}`,
      content_category: 'Meta Ads'
    })
  }
})

const handleGoogleSignIn = async () => {
  await googleLogin()
}

watch(
  currentUser,
  (user) => {
    if (user) {
      router.push('/dashboard')
    }
  },
  { immediate: true }
)

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.value.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
}

const metaTitle = props.variant === 'contractor'
  ? 'Get Paid 3x Faster | ScanGo Invoice for Contractors & Local Pros'
  : props.variant === 'weekend'
    ? 'Reclaim Your Weekends | ScanGo Invoice Simple On-Site Billing'
    : props.variant === 'time_is_money'
      ? 'ScanGo Invoice - Time is Money | Professional Mobile Invoicing'
      : props.variant === 'no_paywall'
        ? "What's a Paywall? | ScanGo Free Invoicing & Instant Mobile Payments"
        : 'ScanGo Invoice | Simple Digital Invoicing';

const metaDescription = props.variant === 'contractor'
  ? 'The ultimate mobile invoicing tool for plumbers, contractors, and local service providers. Send professional invoices on the job in under 60 seconds and accept cards/ACH instantly.'
  : props.variant === 'weekend'
    ? 'Stop wasting Sunday nights on paperwork. Track project time, snap receipt photos on the go, and convert to invoices in one click. Free up your weekends.'
    : props.variant === 'time_is_money'
      ? 'Track time and expenses on your phone for you and your team. Stop losing billable hours and turn tracked work into paid client invoices instantly.'
      : props.variant === 'no_paywall'
        ? 'Stop paying monthly subscriptions just to bill clients. ScanGo unlocks free email & Text-2-Pay SMS invoicing, instant Stripe QR codes, and jobsite tracking with no credit card required.'
        : 'Create, download, and track professional invoices for a simple monthly or yearly price. ScanGo Invoice generates branded payment links and QR codes so customers can pay instantly.';

useMeta(
  metaTitle,
  metaDescription,
  faqSchema
)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

main section[id] {
  scroll-margin-top: 100px;
  /* Adjust this value to match your header height */
}

.landing-page {
  font-family: 'Poppins', sans-serif;
  color: #f1f5f9;
  position: relative;
  z-index: 1;
  background-color: #111d2f;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Hero Section */
.hero {
  padding: 2rem 0 6rem 0;
  background-color: transparent;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: start;
  gap: 4rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
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

.text-gradient {
  background: linear-gradient(to right, #4ade80, #06b6d4) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
  color: transparent !important;
  display: inline;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2.5rem;
  color: #94a3b8;
}

/* Hero Benefits Badges v7 Style */
.hero-benefits-badges {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 960px) {
  .hero-benefits-badges {
    flex-direction: row !important;
    gap: 1.5rem !important;
    margin-top: 3rem !important;
  }
  .benefit-badge {
    flex: 1 1 0px;
    width: auto !important;
  }
}

.benefit-badge {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 0.95rem 1.25rem;
  border-radius: 16px;
  width: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.benefit-badge:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 12px 30px rgba(6, 182, 212, 0.08), 0 0 1px 1px rgba(255, 255, 255, 0.15) !important;
}

.badge-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
  transition: all 0.3s ease;
  box-shadow: inset 0 0 8px rgba(255, 255, 255, 0.02);
}

.benefit-badge:hover .badge-icon-container {
  background: rgba(255, 255, 255, 0.06);
  transform: scale(1.05);
  border-color: rgba(255, 255, 255, 0.18);
  box-shadow: inset 0 0 12px rgba(255, 255, 255, 0.05), 0 4px 12px rgba(0, 0, 0, 0.2);
}

.badge-content {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.badge-title {
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.15rem;
  letter-spacing: -0.2px;
}

.badge-subtitle {
  font-size: 0.85rem;
  color: #94a3b8;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .hero-benefits-badges {
    gap: 0.75rem !important;
    margin-top: 1rem !important;
    margin-bottom: 1.5rem !important;
  }
  .benefit-badge {
    padding: 0.75rem 1rem;
    border-radius: 12px;
    gap: 0.85rem;
  }
  .badge-icon-container {
    width: 38px;
    height: 38px;
    border-radius: 8px;
  }
  .badge-icon-container svg {
    width: 20px;
    height: 20px;
  }
  .badge-title {
    font-size: 0.9rem;
  }
  .badge-subtitle {
    font-size: 0.75rem;
  }
}

.cta-btn {
  transition: transform 0.3s ease, box-shadow 0.3s ease !important;
}

.cta-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 25px rgba(255, 255, 255, 0.2) !important;
}

.outline-btn:hover {
  box-shadow: 0 12px 25px rgba(255, 255, 255, 0.08) !important;
}

.hero-image {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.phone-frame.big-phone {
  position: relative;
  width: 340px;
  max-width: 100%;
  aspect-ratio: 1080 / 2289;
  background: #090e17;
  border-radius: 44px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    0 0 0 3px #182235,
    0 30px 80px rgba(0, 0, 0, 0.6), 
    0 0 40px rgba(20, 184, 166, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.phone-screen {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 32px;
  overflow: hidden;
  background: #111d2f;
}

.base-hero-img {
  width: 100%;
  max-width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  border-radius: 32px;
}

.gif-overlay-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  display: block;
  border-radius: 32px;
  z-index: 2;
}

.fade-overlay-leave-active {
  transition: opacity 1.5s ease-in-out;
}

.fade-overlay-leave-to {
  opacity: 0;
}

.replay-btn {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(17, 29, 47, 0.85);
  border: 1px solid rgba(20, 184, 166, 0.4);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 20px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4), 0 0 12px rgba(20, 184, 166, 0.2);
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  z-index: 5;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.replay-btn:hover {
  background: rgba(20, 184, 166, 0.25);
  border-color: rgba(20, 184, 166, 0.8);
  box-shadow: 0 6px 20px rgba(20, 184, 166, 0.35);
  transform: translateX(-50%) scale(1.05);
}

/* Browser Frame */
.browser-phone-composite {
  position: relative;
  width: 100%;
  max-width: 580px;
  height: auto;
  aspect-ratio: 4/3;
  margin-top: 1rem;
}

.browser-frame.glassmorphic-frame {
  width: 90%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  backdrop-filter: blur(16px);
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
  text-align: left;
}

.browser-header {
  background: rgba(255, 255, 255, 0.05);
  padding: 10px 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.browser-dots {
  display: flex;
  gap: 6px;
  margin-right: 16px;
}

.browser-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.browser-dot.red { background: #ff5f56; }
.browser-dot.yellow { background: #ffbd2e; }
.browser-dot.green { background: #27c93f; }

.browser-address {
  font-family: monospace;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
  background: rgba(0, 0, 0, 0.2);
  padding: 2px 16px;
  border-radius: 4px;
  flex-grow: 1;
  text-align: center;
  max-width: 250px;
  margin: 0 auto;
}

.browser-content {
  padding: 24px;
}

.trend-badge {
  background: rgba(52, 211, 153, 0.1);
  padding: 4px 8px;
  border-radius: 20px;
  border: 1px solid rgba(52, 211, 153, 0.2);
}

.chart-bar {
  flex: 1;
  border-radius: 4px 4px 0 0;
  transition: height 0.5s ease;
}

/* Glassmorphic boxes & helpers */
.bg-glass {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(8px);
}

.border-glass {
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.border-bottom {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
}

.border-top {
  border-top: 1px solid rgba(255, 255, 255, 0.06) !important;
}

/* Floating Mockups */
.floating-phone-mockup {
  position: absolute;
  bottom: -30px;
  right: -10px;
  width: 38%;
  max-width: 220px;
  min-width: 170px;
  z-index: 5;
}

/* General Phone Mockup Frame */
.phone-frame {
  position: relative;
  background: #090e17;
  border-radius: 40px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    0 0 0 3px #182235,
    0 30px 80px rgba(0, 0, 0, 0.6), 
    0 0 40px rgba(20, 184, 166, 0.15);
  overflow: hidden;
  aspect-ratio: 9 / 19.5;
  display: flex;
  flex-direction: column;
}

.phone-frame.big-phone {
  width: 320px;
  max-width: 100%;
}

/* Classic iPhone 11/12 Notch */
.phone-notch {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 18px;
  background: #000;
  border-bottom-left-radius: 14px;
  border-bottom-right-radius: 14px;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
}

.phone-notch::before {
  content: '';
  position: absolute;
  top: 3px;
  width: 32px;
  height: 2px;
  background: #2c2c2c;
  border-radius: 1px;
}

.phone-notch::after {
  content: '';
  position: absolute;
  right: 22px;
  top: 5px;
  width: 5px;
  height: 5px;
  background: #0d1a2d;
  border-radius: 50%;
  box-shadow: inset 0 0 2px rgba(6, 182, 212, 0.8);
}

/* Responsive scale for floating phone notch */
.floating-phone-mockup .phone-notch {
  width: 75px;
  height: 12px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  top: 12px;
}

.floating-phone-mockup .phone-notch::before {
  width: 20px;
  height: 1px;
  top: 2px;
}

.floating-phone-mockup .phone-notch::after {
  width: 3px;
  height: 3px;
  right: 14px;
  top: 3px;
}

.phone-screen {
  border-radius: 28px;
  height: 100%;
  width: 100%;
  flex-grow: 1;
  overflow: hidden;
  padding-top: 24px !important;
  color: #fff;
  position: relative;
  display: flex;
  flex-direction: column;
}

.phone-screen::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.08) 0%,
    rgba(255, 255, 255, 0.02) 40%,
    transparent 40.1%
  );
  pointer-events: none;
  z-index: 9;
}

.phone-frame.big-phone .phone-screen {
  display: flex;
  flex-direction: column;
}

.bg-navy {
  background-color: #111d2f !important;
}

.bg-glass-dark {
  background: rgba(10, 18, 30, 0.6) !important;
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.mockup-bottom-nav {
  padding-bottom: 12px !important;
}

/* Scanner Animation */
.qr-scanner-visual {
  position: relative;
  width: 100px;
  height: 100px;
  border: 2px solid rgba(20, 184, 166, 0.3);
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.02);
  overflow: hidden;
}

.scan-laser {
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  background: #2dd4bf;
  box-shadow: 0 0 8px #2dd4bf;
  animation: scanning 2s linear infinite;
  z-index: 2;
}

@keyframes scanning {
  0% { top: 0%; }
  50% { top: 100%; }
  100% { top: 0%; }
}

/* Live Timer pulse and styling */
.pulse-wrapper {
  background: rgba(239, 68, 68, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  box-shadow: 0 0 8px #ef4444;
  animation: pulsing 1.5s infinite;
}

.mini-pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #14b8a6;
  box-shadow: 0 0 6px #14b8a6;
  animation: pulsing 1.5s infinite;
  display: inline-block;
}

@keyframes pulsing {
  0% { transform: scale(0.9); opacity: 0.6; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.6; }
}

.text-glow {
  text-shadow: 0 0 10px rgba(20, 184, 166, 0.5);
}

.font-mono {
  font-family: monospace;
}

.icon-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Action button inside mockup */
.bg-emerald {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.mockup-action-btn {
  border: none;
  font-size: 13px;
  transition: all 0.3s ease;
  margin-top: auto;
}

/* Testimonial success icon wrapper */
.success-icon-wrapper {
  background: rgba(20, 184, 166, 0.1);
  border-radius: 50%;
  padding: 16px;
  display: inline-flex;
  box-shadow: 0 0 30px rgba(20, 184, 166, 0.15);
}

/* Floating Glass Badges */
.floating-badge {
  position: absolute;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.04) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(12px);
  padding: 10px 14px;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  z-index: 12;
  text-align: left;
}

.badge-top-left {
  top: 10%;
  left: -20px;
}

.badge-bottom-right {
  bottom: 12%;
  right: -20px;
}

.badge-top-right {
  top: 12%;
  right: -20px;
}

.badge-bottom-left {
  bottom: 10%;
  left: -20px;
}

.badge-title {
  font-size: 12px;
  font-weight: bold;
  color: #fff;
  line-height: 1.2;
}

.badge-subtitle {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.2;
  margin-top: 1px;
}

/* Animations for depth */
.pulse-hover {
  animation: float-anim 6s ease-in-out infinite;
}

.badge-top-left.pulse-hover {
  animation-delay: 0s;
}

.badge-bottom-right.pulse-hover {
  animation-delay: 3s;
}

.badge-top-right.pulse-hover {
  animation-delay: 1.5s;
}

.badge-bottom-left.pulse-hover {
  animation-delay: 4.5s;
}

@keyframes float-anim {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

/* How It Works Section */
.how-it-works {
  padding: 4rem 0;
  background-color: #0c1522;
}

.how-it-works-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-top: 3rem;
}

@media (min-width: 960px) {
  .how-it-works-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
}

.step-card {
  position: relative;
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(10px) !important;
  border-radius: 12px !important;
  color: #fff !important;
  transition: transform 0.3s ease, box-shadow 0.3s ease !important;
  overflow: visible !important;
  margin-top: 2rem !important;
  padding: 3rem 2rem 2rem 2rem !important;
  height: 100%;
}

.step-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4) !important;
}

.step-number {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  width: 48px;
  height: 48px;
  background: #1e293b;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: bold;
  color: #fff;
  z-index: 2;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.highlight-number {
  background: linear-gradient(135deg, #4ade80, #06b6d4);
  border: none;
  box-shadow: 0 4px 15px rgba(74, 222, 128, 0.4);
}

.step-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.highlight-wrapper {
  background: linear-gradient(135deg, rgba(74, 222, 128, 0.2), rgba(6, 182, 212, 0.2));
  border: 1px solid rgba(74, 222, 128, 0.3);
}

.feature-step-card {
  border: 1px solid rgba(74, 222, 128, 0.3) !important;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(74, 222, 128, 0.05) 100%
  ) !important;
}

.payment-methods {
  margin-top: auto;
}

.payment-pill {
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.payment-pill.stripe {
  background: rgba(99, 91, 255, 0.15);
  color: #a5a0ff;
  border: 1px solid rgba(99, 91, 255, 0.3);
}

.payment-pill.pro-pill {
  background: rgba(74, 222, 128, 0.1);
  color: #86efac;
  border: 1px solid rgba(74, 222, 128, 0.3);
}

.payment-pill.sms-pill {
  background: rgba(20, 184, 166, 0.15);
  color: #2dd4bf;
  border: 1px solid rgba(20, 184, 166, 0.4);
}

/* FAQ Section */
.faq-section {
  padding: 6rem 0 3rem 0;
  background-color: transparent;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
  color: #fff;
}

.section-subtitle {
  font-size: 1.2rem;
  color: #94a3b8;
  text-align: center;
  margin-bottom: 4rem;
}

.faq-container {
  max-width: 800px;
  margin: 0 auto;
}

.custom-panels {
  background: transparent !important;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(10px) !important;
  border-radius: 12px !important;
  margin-bottom: 1rem !important;
  color: #fff !important;
}

.glass-panel:not(:first-child) {
  margin-top: 1rem !important;
}

.faq-title {
  font-size: 1.15rem;
  padding: 1.5rem !important;
}
.faq-text {
  font-size: 1.05rem;
  line-height: 1.6;
  padding: 0 1.5rem 1.5rem 1.5rem !important;
}

.glow-btn {
  box-shadow: 0 8px 25px rgba(25, 118, 210, 0.4);
  transition: all 0.3s ease;
}

.glow-btn:hover {
  box-shadow: 0 12px 35px rgba(25, 118, 210, 0.6);
  transform: translateY(-2px);
}

/* Final CTA */
.final-cta {
  background-color: transparent;
}

.cta-card {
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.7));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
}

.cta-link {
  transition: color 0.3s ease;
}

.cta-link:hover {
  color: #fff !important;
}

/* Footer */
.footer {
  background-color: #0a111c;
  color: #94a3b8;
  padding: 2rem 0;
  text-align: center;
}

.footer a {
  color: #f1f5f9;
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}

.avatar-group {
  display: flex;
  align-items: center;
}

.avatar-item {
  border: 2px solid #111d2f !important;
  margin-left: -12px;
  transition: transform 0.2s ease;
}

.avatar-item:first-child {
  margin-left: 0;
}

.avatar-item:hover {
  transform: translateY(-3px);
  z-index: 10;
}

.cursor-pointer {
  cursor: pointer;
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
  background: #111d2f;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
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
  background-color: #111d2f;
  color: #f1f5f9;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  z-index: 10;
}

/* Responsive Styles */
@media (max-width: 960px) {
  .hero-grid {
    grid-template-columns: 1fr;
    text-align: center;
    padding: 0;
    background: transparent;
    border: none;
    backdrop-filter: none;
    box-shadow: none;
  }

  .hero-content {
    text-align: center;
  }

  .hero-image {
    margin-bottom: 2rem;
  }

  .iphone-overlay {
    width: 220px;
    bottom: -20px;
    left: -10px;
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
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
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
    padding: 0 1rem;
  }

  .hero-grid {
    padding: 0;
    gap: 1.5rem;
  }

  .hero {
    padding: 1rem 0 2rem 0;
  }

  .hero-title {
    font-size: 2.2rem;
    line-height: 1.2;
    margin-bottom: 0.8rem;
  }

  .hero-subtitle {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }

  .iphone-overlay {
    display: block;
    width: 240px;
    top: 50%;
    left: 50%;
    bottom: auto;
    transform: translate(-50%, -50%);
  }

  .iphone-frame {
    transform: rotate(3deg); /* Less angle on mobile */
    padding: 8px; /* Slightly thinner bezel for small screens */
    border-radius: 32px;
  }

  .iphone-gif {
    border-radius: 24px;
  }

  .how-it-works {
    padding: 3rem 0;
  }

  .faq-section {
    padding: 1rem 0;
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

  .mobile-brand {
    font-size: 3.5rem;
    font-weight: 800;
    line-height: 1.2;
  }

  .modal-content {
    margin-top: 64px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.8rem;
  }

  .mobile-brand {
    font-size: 2.2rem;
    letter-spacing: -0.5px !important;
  }

  .hero-subtitle {
    font-size: 0.95rem;
    padding: 0 0.5rem;
  }

  .cta-btn {
    width: 100%;
    max-width: 280px;
    margin: 0 auto;
    padding-left: 1rem !important;
    padding-right: 1rem !important;
  }
}

/* Premium Video Dialog Styles */
.video-modal-card {
  background: rgba(15, 23, 42, 0.95) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  backdrop-filter: blur(20px) !important;
  border-radius: 16px !important;
  overflow: hidden !important;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6) !important;
}

.video-modal-header {
  background: rgba(30, 41, 59, 0.5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.video-container {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;
  background: #000;
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.play-demo-btn {
  background: transparent !important;
  color: #f1f5f9 !important;
  border: 1px solid rgba(255, 255, 255, 0.25) !important;
  font-weight: 600 !important;
  box-shadow: none !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.play-demo-btn:hover {
  background: rgba(255, 255, 255, 0.06) !important;
  border-color: rgba(255, 255, 255, 0.45) !important;
  transform: translateY(-2px) !important;
}

.cta-btn-primary {
  background: linear-gradient(135deg, #4ade80 0%, #06b6d4 100%) !important;
  color: #0f172a !important;
  font-weight: 700 !important;
  border: none !important;
  box-shadow: 0 8px 30px rgba(6, 182, 212, 0.4), 0 0 15px rgba(74, 222, 128, 0.2) !important;
}

.cta-btn-primary:hover {
  background: linear-gradient(135deg, #34d399 0%, #22d3ee 100%) !important;
  box-shadow: 0 12px 35px rgba(6, 182, 212, 0.6), 0 0 20px rgba(74, 222, 128, 0.3) !important;
  transform: translateY(-3px) !important;
}

.cta-btn-secondary {
  background: rgba(255, 255, 255, 0.02) !important;
  color: #f1f5f9 !important;
  border: 1px solid rgba(255, 255, 255, 0.25) !important;
  box-shadow: none !important;
}

.cta-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.08) !important;
  border-color: rgba(255, 255, 255, 0.45) !important;
  transform: translateY(-3px) !important;
}

.email-signup-link, .play-demo-link {
  color: #94a3b8 !important;
  font-weight: 500 !important;
  transition: all 0.2s ease !important;
}

.email-signup-link:hover, .play-demo-link:hover {
  color: #ffffff !important;
  text-shadow: 0 0 8px rgba(6, 182, 212, 0.4) !important;
}

/* Social Proof Styles */
.social-proof {
  padding: 3rem 0;
  background-color: #111d2f;
  border-top: 1px solid rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.social-proof-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

@media (min-width: 960px) {
  .social-proof-wrapper {
    flex-direction: row;
    align-items: center;
  }
  .trust-score-block {
    flex: 0 0 280px;
  }
  .testimonials-grid {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
}

.trust-score-block {
  text-align: center;
}

@media (min-width: 960px) {
  .trust-score-block {
    text-align: left;
  }
}

.proof-divider {
  width: 1px;
  background: rgba(255, 255, 255, 0.08);
  align-self: stretch;
  margin: 0 1.5rem;
}

.testimonials-grid {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.testimonial-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.25rem;
  text-align: left;
  transition: all 0.3s ease;
}

.testimonial-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.12);
}

.testimonial-text {
  font-size: 0.9rem;
  line-height: 1.5;
  color: #cbd5e1;
  margin-bottom: 0.75rem !important;
  font-style: italic;
}

.testimonial-author {
  font-size: 0.8rem;
  font-weight: 600;
  color: #f8fafc;
}

.author-role {
  color: #64748b;
  font-weight: 400;
}

/* Compact Step Cards for Mobile Scroll Optimization */
@media (max-width: 768px) {
  .step-card {
    padding: 2.25rem 1.25rem 1.25rem 1.25rem !important;
    margin-top: 1.5rem !important;
  }
  .step-icon-wrapper {
    width: 60px !important;
    height: 60px !important;
    border-radius: 16px !important;
    margin-bottom: 1rem !important;
  }
  .step-icon-wrapper :deep(.v-icon) {
    font-size: 36px !important;
  }
}

/* Branded Glassmorphic Social Links & Footer Trust Layout */
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
</style>
