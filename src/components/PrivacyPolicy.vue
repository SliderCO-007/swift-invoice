<template>
  <div class="privacy-policy-container">
    <v-card class="pa-4 pa-md-8">
        <h1>Privacy Policy</h1>
        <p><strong>Effective Date:</strong> February 2, 2026</p>
        <p><strong>Last Updated:</strong> July 20, 2026</p>

        <section>
        <h2>1. Introduction</h2>
        <p>At ScanGo Invoice ("we," "our," or "us"), your privacy is our priority. This Privacy Policy explains how we collect, use, and protect your personal information when you use our software and services located at https://scangoinvoice.com.</p>
        </section>

        <section>
        <h2>2. Information We Collect</h2>
        <p>We may collect the following categories of information:</p>
        <ul>
            <li><strong>Account Data:</strong> Name, email address, and password created during registration.</li>
            <li><strong>Billing Information:</strong> Credit card details and billing addresses processed through our secure payment providers.</li>
            <li><strong>Usage Data:</strong> IP addresses, browser type, and information on how you interact with our software.</li>
        </ul>
        </section>

        <section>
        <h2>3. Service Providers</h2>
        <p>To provide and improve our services, we share limited information with trusted third-party providers. We ensure these providers adhere to strict confidentiality and security standards and only use your data to perform specific tasks on our behalf.</p>
        <h3>Payment Processing (Stripe)</h3>
        <p>We use Stripe for payment, analytics, and other business services. Stripe collects identifying information about the devices that connect to its services and uses this data to operate and improve the services it provides to us, including for fraud detection and prevention. Note: We do not store your full credit card numbers or CVV codes on our servers; this data is handled directly by Stripe.</p>
        <h3>Analytics (Google Analytics)</h3>
        <p>We use Google Analytics to help us understand how visitors interact with our software. Google Analytics uses cookies and other identifiers to collect information such as IP addresses, browser type, and on-site behavior. You can opt out of this tracking at any time by using the Google Analytics Opt-out Browser Add-on.</p>
        </section>

        <section>
        <h2>4. Our Commitment to Your Privacy</h2>
        <p>We are committed to transparency. To that end, we provide the following guarantees:</p>
        <ul>
            <li><strong>No Sale of Data:</strong> We do not sell, rent, or trade your personal information to any third parties for any purpose, including marketing or commercial gain.</li>
            <li><strong>No Unauthorized Sharing:</strong> We do not give out your information to other providers, except for essential service providers (e.g., payment processors) strictly necessary to deliver our services to you.</li>
            <li><strong>SMS & Mobile Data Privacy:</strong> Mobile phone numbers, text messaging originator opt-in data, and SMS consent will not be sold, rented, or shared with any third parties or affiliates for marketing or promotional purposes. All sharing categories mentioned in this policy exclude text messaging originator opt-in data and consent.</li>
        </ul>
        </section>

        <section>
        <h2>5. Data Security</h2>
        <p>We implement industry-standard technical and organizational measures to secure your data against unauthorized access, loss, or misuse.
        These include:</p>
        <ul>
            <li><strong>Encryption:</strong> Data is encrypted both in transit (SSL/HTTPS) and at rest.</li>
            <li><strong>Access Controls:</strong> Internal access to customer data is strictly limited to authorized personnel only.</li>
            <li><strong>Regular Audits:</strong> We conduct periodic security assessments to ensure the ongoing integrity of our systems.</li>
        </ul>
        </section>

        <section>
        <h2>6. Your Rights</h2>
        <p>Depending on your location, you may have rights under laws like the GDPR or CCPA, including:</p>
        <ul>
            <li>The right to access or delete the personal information we hold about you.</li>
            <li>The right to correct inaccurate information.</li>
            <li>The right to withdraw consent at any time.</li>
        </ul>
        </section>

        <section>
        <h2>7. Changes to This Policy</h2>
        <p>We may update this policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the new policy on this page.</p>
        </section>

        <section>
        <h2>8. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at:</p>
        <p>Email: <a href="mailto:support@scangoinvoice.com">support@scangoinvoice.com</a></p>
        <p>Address: Lafayette, CO 80026</p>
        </section>
    </v-card>
  </div>
</template>

<script setup>
import { useMeta } from '../composables/useMeta';

useMeta(
  'Privacy Policy | ScanGo Invoice',
  'This Privacy Policy explains how ScanGo Invoice collects, uses, and protects your personal information when you use our software and services.',
);
</script>

<style scoped>
.privacy-policy-container {
  max-width: 100%;
  min-height: 100vh;
  padding: 2rem;
  background-color: #111d2f;
  color: #f1f5f9;
}

:deep(.v-card) {
  max-width: 900px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(16px);
  color: #f1f5f9 !important;
}

section { margin-bottom: 2rem; }
h1, h2, h3 { font-family: 'Inter', 'Poppins', sans-serif; font-weight: 600; color: #fff; }
h1 { font-size: 2.5rem; margin-bottom: 1.5rem; }
h2 { font-size: 1.75rem; margin-top: 2rem; margin-bottom: 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 0.5rem; }
h3 { font-size: 1.2rem; margin-top: 1.5rem; margin-bottom: 1rem; }
ul { list-style-position: inside; padding-left: 1rem; }
li { margin-bottom: 0.5rem; color: #e2e8f0; }
p { color: #e2e8f0; line-height: 1.6; }
a { color: #64B5F6; text-decoration: none; font-weight: 500; }
a:hover { text-decoration: underline; color: #90CAF9; }
</style>