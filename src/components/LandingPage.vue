<template>
  <div class="landing-page">
    <main>
      <section class="hero">
        <div class="container">
          <div class="hero-grid">
            <div class="hero-content">
              <div class="d-sm-none mb-6">
                <span class="font-weight-bold text-blue-lighten-4 mobile-brand">ScanGo Invoice</span>
              </div>
              <h1 class="hero-title">Professional Invoicing,</h1>
              <h1 class="hero-title"><span class="text-gradient">Made Effortless</span></h1>
              <p class="hero-subtitle">Create polished invoices, streamline billing, and accept secure QR payments — all in one simple, modern platform.</p>
              <div class="d-flex flex-column flex-sm-row flex-wrap ga-4 mt-8 align-center justify-center justify-md-start">
                <v-btn to="/register" color="white" class="text-black font-weight-bold px-10 cta-btn" size="x-large" rounded="xl" :block="mobile">
                  <v-icon left size="24" class="mr-2">mdi-email-outline</v-icon>
                  Start Invoicing for Free
                </v-btn>
                <v-btn @click="handleGoogleSignIn" :loading="loading" variant="outlined" color="white" class="font-weight-bold px-10 cta-btn outline-btn" size="x-large" rounded="xl" :block="mobile">
                  <svg class="mr-2" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign up with Google
                </v-btn>
              </div>
              <p class="mt-4 text-caption text-sm-body-2 text-blue-grey-lighten-2 d-flex align-center justify-center justify-md-start">
                <v-icon size="small" class="mr-1">mdi-check-circle-outline</v-icon>
                Get started for free. No credit card required.
              </p>
            </div>
            <div class="hero-image">
              <img src="/branded_hero_v7.png"
                alt="A deconstructed workspace with an invoice and dashboard.">
            </div>
          </div>
        </div>
      </section>

      <!-- Social Proof / Reviews Section -->
      <section class="social-proof">
        <div class="container">
          <v-carousel
            hide-delimiters
            show-arrows="hover"
            cycle
            interval="5000"
            height="320"
            class="bg-transparent"
          >
            <v-carousel-item
              v-for="(review, index) in reviews"
              :key="index"
            >
              <div class="d-flex justify-center align-center fill-height pa-4">
                <div class="review-card" @click="openReview(review)">
                  <div class="review-header">
                    <v-avatar color="primary" size="48" class="mr-3 text-h6 font-weight-bold text-white">
                      {{ review.name.charAt(0) }}
                    </v-avatar>
                    <div>
                      <h4 class="reviewer-name text-h6">{{ review.name }}</h4>
                      <p class="reviewer-business">{{ review.business }}</p>
                    </div>
                  </div>
                  <div class="review-stars">
                    <v-icon color="warning" size="small" v-for="n in 5" :key="n">mdi-star</v-icon>
                  </div>
                  <p class="review-text">"{{ review.review }}"</p>
                </div>
              </div>
            </v-carousel-item>
          </v-carousel>
        </div>
      </section>

      <section id="how-it-works" class="how-it-works">
        <div class="container">
          <div class="compact-steps">
            <h2 class="compact-title">Get paid faster:</h2>
            <div class="steps-row">
              <span class="step-chip">
                <v-icon size="small" class="mr-2">mdi-pencil-outline</v-icon>
                Input Details
              </span>
              <v-icon color="grey-darken-1" class="mx-2 d-none d-sm-inline">mdi-arrow-right</v-icon>
              <span class="step-chip">
                <v-icon size="small" class="mr-2">mdi-palette-outline</v-icon>
                Customize Design
              </span>
              <v-icon color="grey-darken-1" class="mx-2 d-none d-sm-inline">mdi-arrow-right</v-icon>
              <span class="step-chip">
                <v-icon size="small" class="mr-2">mdi-email-outline</v-icon>
                Deliver & Track
              </span>
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

    <!-- Review Modal -->
    <div v-if="selectedReview" class="modal-overlay" @click.self="selectedReview = null">
      <div class="modal-content review-modal-content" @click="mobile ? selectedReview = null : null">
        <div class="review-header mb-4">
          <v-avatar color="primary" size="48" class="mr-3 text-h6 font-weight-bold text-white">
            {{ selectedReview.name.charAt(0) }}
          </v-avatar>
          <div>
            <h4 class="reviewer-name-large">{{ selectedReview.name }}</h4>
            <p class="reviewer-business-large">{{ selectedReview.business }}</p>
          </div>
        </div>
        <div class="review-stars mb-4">
          <v-icon color="warning" size="small" v-for="n in 5" :key="n">mdi-star</v-icon>
        </div>
        <p class="review-text-full">"{{ selectedReview.review }}"</p>
        <v-btn @click="selectedReview = null" icon class="modal-close">
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
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth, currentUser } from '../composables/useAuth.js';
import { useMeta } from '../composables/useMeta';
import { useDisplay } from 'vuetify';
import Trustpilot from './TrustpilotWidget.vue';
import reviewsData from '../assets/reviews.json';

const { mobile } = useDisplay();
const router = useRouter();
const { loading, googleLogin } = useAuth();
const reviews = ref(reviewsData);

const faqs = ref([
  { question: "How do I create a professional invoice quickly with ScanGo Invoice?", answer: "ScanGo Invoice lets you build a polished, branded invoice in minutes.<br/><br/>Choose a template, customize your colors and logo, and send a flawless PDF instantly — no design skills or setup required.<br/><br/>It’s built for freelancers, contractors, and small businesses who want clean, modern invoices without the complexity of traditional billing software." },
  { question: "Can I add a Venmo QR code to my invoices?", answer: "Yes. ScanGo Invoice automatically generates a branded Venmo QR code and embeds it directly into your invoice.<br/><br/>Clients can scan or click the QR code to pay instantly, giving you a fast, modern payment experience that accelerates cash flow." },
  { question: "Are the QR codes on ScanGo invoices clickable in the PDF?", answer: "They are. Every invoice includes a fully clickable QR code that works on desktop and mobile.<br/><br/>Clients can tap the code in the PDF or scan it with their phone — whichever is easier — making payment frictionless." },
  { question: "What’s the easiest way to accept mobile payments from clients?", answer: "ScanGo Invoice integrates Venmo QR payments directly into your invoice design.<br/><br/>Your clients don't need to manually type in your username or payment details — they simply scan the code with their phone to open Venmo and submit payment.<br/><br/>It’s one of the fastest ways to get paid for freelance work, services, or project‑based billing." },
  { question: "What invoice templates does ScanGo Invoice offer?", answer: "You get three agency‑quality templates — Classic, Modern, and Corporate.<br/><br/>Each template is fully customizable with your brand colors, logo, and layout preferences.<br/><br/>The live preview ensures your invoice looks exactly right before you send it." },
  { question: "Can I send invoices directly to clients from ScanGo Invoice?", answer: "Yes. With integrated PDF and email delivery, you can generate a high‑fidelity invoice and send it to your client’s inbox with a single click.<br/><br/>No exporting, no attachments to manage, no switching apps." },
  { question: "Will my invoices look clean and professional when printed?", answer: "Absolutely. ScanGo Invoice uses high‑fidelity PDF rendering, ensuring crisp text, accurate colors, and a polished layout whether viewed digitally or printed." },
  { question: "Is ScanGo Invoice good for freelancers and small businesses?", answer: "Yes. ScanGo Invoice is designed for freelancers, contractors, consultants, agencies, and service providers who want a simple, modern invoicing workflow.<br/><br/>You can create unlimited invoices for unlimited clients without dealing with bloated accounting software." },
  { question: "Do my clients need a Venmo account to pay me?", answer: "Only if they choose to pay through Venmo.<br/><br/>Your invoice still supports any payment method you normally accept — Venmo is simply an optional, fast, mobile‑friendly way to get paid." },
  { question: "Can I customize invoice colors to match my brand?", answer: "Yes. Every template supports full color customization, so your invoices always look consistent with your brand identity.<br/><br/>Your logo, colors, and layout stay intact across every invoice you send." },
  { question: "How does ScanGo Invoice handle email deliverability?", answer: "Invoices are sent using optimized email formatting to reduce spam‑filter issues.<br/><br/>If a client misses an invoice, you can resend it instantly from your dashboard." },
  { question: "Can I duplicate invoices for recurring clients?", answer: "Yes. You can duplicate any invoice with one click, making repeat billing fast and effortless." },
  { question: "How do I preview my invoice before sending it?", answer: "ScanGo Invoice includes a real‑time live preview, so you always know exactly what your client will see.<br/><br/>No surprises, no formatting issues, no guesswork." },
  { question: "Is my data secure when using ScanGo Invoice?", answer: "Your invoice data, client details, and payment links are handled using modern security best practices.<br/><br/>Nothing is shared or stored beyond what’s required to generate and deliver your invoices." },
  { question: "What makes ScanGo Invoice different from other invoice generators?", answer: "ScanGo Invoice focuses on speed, simplicity, and modern payment integration.<br/><br/>You get:<br/><ul class='mt-2 mb-2'><li class='ml-4'>Branded Venmo QR codes</li><li class='ml-4'>Clickable QR payments inside PDFs</li><li class='ml-4'>Agency‑quality templates</li><li class='ml-4'>One‑click email delivery</li><li class='ml-4'>A clean, minimal interface</li></ul>No clutter. No accounting bloat. Just beautiful invoices and faster payments." },
]);

const showDashboardPreview = ref(false);
const showMobilePreview = ref(false);
const isMobilePreviewLoading = ref(false);
const selectedReview = ref(null);

const openReview = (review) => {
  selectedReview.value = review;
};

const openMobilePreview = () => {
  isMobilePreviewLoading.value = true;
  showMobilePreview.value = true;
};

const closeMobilePreview = () => {
  showMobilePreview.value = false;
};

const handleGoogleSignIn = async () => {
  await googleLogin();
};

watch(currentUser, (user) => {
  if (user) {
    router.push('/dashboard');
  }
}, { immediate: true });

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
  padding: 6rem 0;
  background-color: transparent;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
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

.hero-image img {
  max-width: 100%;
  height: auto;
  border-radius: 32px;
  box-shadow: 0 30px 80px rgba(0,0,0,0.5);
}

/* Social Proof Section */
.social-proof {
  padding: 1rem 0 3rem 0;
  background-color: transparent;
  overflow: hidden;
  position: relative;
  z-index: 2;
  margin-top: -2rem; /* Pull up closer to the hero section */
}

.review-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  margin: 0 auto;
}

.review-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0,0,0,0.4);
}

.review-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.reviewer-name {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  line-height: 1.2;
}

.reviewer-business {
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 0;
  margin-top: 0.2rem;
}

.review-stars {
  margin-bottom: 0.8rem;
  display: flex;
  gap: 2px;
}

.review-text {
  font-size: 0.95rem;
  color: #e2e8f0;
  line-height: 1.5;
  font-style: italic;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Review Modal Styles */
.review-modal-content {
  max-width: 500px;
  width: 90%;
  padding: 2.5rem;
  text-align: left;
}

.reviewer-name-large {
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.reviewer-business-large {
  font-size: 0.9rem;
  color: #94a3b8;
  margin: 0;
}

.review-text-full {
  font-size: 1.1rem;
  color: #e2e8f0;
  line-height: 1.7;
  font-style: italic;
}

/* How It Works Section */
.how-it-works {
  padding: 4rem 0;
  background-color: #0c1522;
}

.compact-steps {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 32px;
  max-width: 900px;
  margin: 0 auto;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

@media (min-width: 768px) {
  .compact-steps {
    flex-direction: row;
    padding: 1.5rem 3rem;
    border-radius: 100px;
  }
}

.compact-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 1.5rem 0;
  white-space: nowrap;
}

@media (min-width: 768px) {
  .compact-title {
    margin: 0 2rem 0 0;
  }
}

.steps-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

@media (min-width: 768px) {
  .steps-row {
    flex-direction: row;
    gap: 0;
  }
}

.step-chip {
  display: flex;
  align-items: center;
  font-size: 1.05rem;
  color: #e2e8f0;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.6rem 1.25rem;
  border-radius: 50px;
  transition: all 0.3s ease;
}

.step-chip:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
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
  border: 1px solid rgba(255,255,255,0.1);
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
    font-size: 2rem;
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
    font-size: 1.6rem;
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
</style>