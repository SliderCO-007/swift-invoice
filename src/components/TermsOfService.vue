<template>
  <div class="terms-container">
    <v-card class="pa-4 pa-md-8">
        <h1>Terms of Service</h1>
        <p><strong>Effective Date:</strong> February 2, 2026</p>
        <p><strong>Last Updated:</strong> April 1, 2026</p>

        <section>
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using ScanGo Invoice (the "Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>
        </section>

        <section>
        <h2>2. Description of Service</h2>
        <p>ScanGo Invoice provides a platform for users to create, manage, and send invoices. We reserve the right to modify, suspend, or discontinue any part of the Service at any time without prior notice.</p>
        </section>

        <section>
        <h2>3. User Accounts</h2>
        <p>To use certain features of the Service, you must register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate and complete information during registration and to keep this information up to date.</p>
        </section>

        <section>
        <h2>4. User Content</h2>
        <p>You retain all rights to any data, information, or material you submit to the Service ("User Content"). By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and display such content solely for the purpose of providing the Service.</p>
        <p>You agree not to upload any content that is illegal, defamatory, or infringes on the intellectual property rights of others.</p>
        </section>

        <section>
        <h2>5. Prohibited Activities</h2>
        <p>You agree not to:</p>
        <ul>
            <li>Use the Service for any unlawful purpose.</li>
            <li>Attempt to gain unauthorized access to our systems or networks.</li>
            <li>Interfere with or disrupt the integrity or performance of the Service.</li>
            <li>Reproduce, duplicate, copy, sell, or resell any portion of the Service without our express written permission.</li>
        </ul>
        </section>

        <section>
        <h2>6. Intellectual Property</h2>
        <p>All content, features, and functionality of the Service, including but not limited to text, graphics, logos, and software, are the exclusive property of ScanGo Invoice and are protected by international copyright, trademark, and other intellectual property laws.</p>
        </section>

        <section>
        <h2>7. Limitation of Liability</h2>
        <p>In no event shall ScanGo Invoice, its directors, employees, or agents be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Service. Our total liability for any claims arising under these terms shall not exceed the amount you paid us for the Service in the past twelve (12) months.</p>
        </section>

        <section>
        <h2>8. Termination</h2>
        <p>We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, if you breach any of these Terms of Service. Upon termination, your right to use the Service will immediately cease.</p>
        </section>

        <section>
        <h2>9. Governing Law</h2>
        <p>These Terms shall be governed and construed in accordance with the laws of the State of Colorado, United States, without regard to its conflict of law provisions.</p>
        </section>

        <section>
        <h2>10. Changes to Terms</h2>
        <p>We reserve the right to modify or replace these Terms at any time. We will provide notice of any significant changes by posting the new Terms on this page. Your continued use of the Service after such changes constitutes acceptance of the new Terms.</p>
        </section>

        <section>
        <h2>11. Contact Us</h2>
        <p>If you have any questions about these Terms, please contact us at:</p>
        <p>Email: <a href="mailto:support@scangoinvoice.com">support@scangoinvoice.com</a></p>
        <p>Address: Lafayette, CO 80026</p>
        </section>
    </v-card>
  </div>
</template>

<script setup>
import { useMeta } from '../composables/useMeta';

useMeta(
  'Terms of Service | ScanGo Invoice',
  'These Terms of Service govern your use of the ScanGo Invoice platform and services.',
);
</script>

<style scoped>
.terms-container {
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
