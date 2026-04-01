<template>
  <v-container>
    <v-responsive class="mx-auto" max-width="800">
      <v-card class="pa-6 pa-md-8">
        <h1 class="text-h4 font-weight-bold mb-4">Cookie Policy</h1>
        <p class="text-medium-emphasis mb-6">Effective Date: February 17, 2026</p>

        <section class="mb-6">
          <h2 class="text-h5 font-weight-semibold mb-3">1. What Are Cookies?</h2>
          <p>Cookies are small text files stored on your device (computer, tablet, or mobile) when you visit a website. They help the website recognize your device and store information about your preferences or past actions.</p>
        </section>

        <section class="mb-6">
          <h2 class="text-h5 font-weight-semibold mb-3">2. How We Use Cookies</h2>
          <p>We use cookies to improve your experience, ensure our software functions securely, and analyze how our services are being used.</p>
        </section>

        <section class="mb-6">
          <h2 class="text-h5 font-weight-semibold mb-3">3. Specific Third-Party Cookies</h2>
          <p>We use the following third-party providers who set cookies on our site:</p>
          <ul class="pl-5 mt-3">
            <li class="mb-3">
              <strong>Stripe (Essential & Functional):</strong> Stripe uses cookies to process payments, remember your session, and perform fraud detection. These cookies are necessary for completing transactions securely. Learn more in <a href="https://stripe.com/legal/cookies" target="_blank" rel="noopener noreferrer">Stripe’s Cookie Policy</a>.
            </li>
            <li class="mb-3">
              <strong>Google Analytics (Analytics):</strong> Google Analytics sets cookies (such as _ga and _gid) to distinguish unique users and track site usage patterns. This data is aggregated and does not personally identify you. Learn more in <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer">Google’s Privacy & Terms</a>.
            </li>
          </ul>
        </section>

        <section class="mb-6">
          <h2 class="text-h5 font-weight-semibold mb-3">4. Managing Your Preferences</h2>
          <p>You have the right to decide whether to accept or reject non-essential cookies.</p>
          <ul class="pl-5 mt-3">
            <li class="mb-2">
              <strong>Cookie Banner:</strong> When you first visit our site, you can choose to "Accept" or "Decline" non-essential cookies via our consent banner.
            </li>
            <li class="mb-2">
              <strong>Browser Settings:</strong> Most web browsers allow you to control cookies through their settings. You can set your browser to block all cookies or to notify you when a cookie is being set.
            </li>
            <li>
              <strong>Google Opt-Out:</strong> You can specifically opt out of Google Analytics tracking across all websites by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a>.
            </li>
          </ul>
        </section>

        <section>
          <h2 class="text-h5 font-weight-semibold mb-3">5. Updates to This Policy</h2>
          <p>We may update this Cookie Policy from time to time to reflect changes in the cookies we use or for legal and regulatory reasons.</p>
        </section>
      </v-card>
    </v-responsive>
  </v-container>
</template>

<script setup>
// No script logic is needed for this static component.
</script>

<style scoped>
:deep(.v-container) {
  max-width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 2rem;
  background-color: #111d2f;
  color: #f1f5f9;
}

:deep(.v-card) {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(16px);
  color: #f1f5f9 !important;
}

h1, h2 { line-height: 1.3; color: #fff; }
.text-h4 { color: #fff; }
.text-h5 { color: #f1f5f9; }

p, li { font-size: 1rem; line-height: 1.7; color: #e2e8f0; }

a { color: #64B5F6; text-decoration: none; font-weight: 500; }
a:hover { text-decoration: underline; color: #90CAF9; }

section { border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 1.5rem; margin-bottom: 1.5rem; }
section:last-of-type { border-bottom: none; padding-bottom: 0; }

.text-medium-emphasis { color: #94a3b8 !important; }
</style>
