
# Blueprint: SwiftInvoice

## Overview

SwiftInvoice is a Vue.js-based invoicing application designed for freelancers and small businesses. It simplifies the process of creating and managing invoices. The application leverages Firebase for backend services (Authentication, Firestore, Storage) and Cloud Functions. It integrates with Stripe to charge a one-time **service fee** to enable PDF generation and email delivery of the invoices.

**Note:** This application is not a Customer Relationship Management (CRM) tool. Customer data is entered on a per-invoice basis and is not stored or managed separately.

## Core Features

*   **User Authentication:** Secure user registration and login using Firebase Authentication.
*   **Invoice Management:** Create, view, update, and delete invoices.
*   **Service Fee Payments:** Integrates with Stripe to securely process a one-time service fee that unlocks the PDF and email features for an invoice.
*   **PDF Generation & Download:** Generate and download professional PDF invoices for clients once the service fee is paid.
*   **Email Invoicing:** Send generated PDF invoices to clients directly from the application.
*   **Dashboard:** An intuitive dashboard that provides an at-a-glance overview of invoice statuses and key metrics.

## Design and Styling

*   **Framework:** Vuetify for a pre-built library of Material Design components.
*   **Layout:** A clean and modern interface with a focus on user experience.
*   **Responsiveness:** The application is fully responsive and optimized for both desktop and mobile devices.

## Current Implementation

### 1. **Payment Success Route (404 Error)**

*   **Problem:** The `/payment-success` route was configured to require authentication, causing a 404 error when users were redirected from Stripe after a successful payment.
*   **Solution:** Removed the `meta: { requiresAuth: true }` property from the `/payment-success` route definition in `src/router/index.js` to allow unauthenticated access.

### 2. **Webhook Not Updating `svcFeePaid`**

*   **Problem:** The `svcFeePaid` field in the Firestore database was not being updated to `true` after a successful service fee payment via Stripe.
*   **Root Cause:** The Stripe webhook endpoint URL was misconfigured in the Stripe dashboard.
*   **Solution:**
    1.  **Enhanced Logging:** Added detailed logging to the `stripeWebhook` function in `functions/index.js`.
    2.  **Deployment Fix:** Corrected a syntax error in `functions/index.js` that was preventing deployment.
    3.  **URL Correction:** Identified the correct webhook URL and updated it in the Stripe Dashboard, resolving the issue.

### 3. **Invoice Editor Mobile Layout Fix**

*   **Problem:** On mobile devices, the line item input fields (Description, Quantity, Price) in the `InvoiceEditor.vue` component were displayed in a single row, making them too small and difficult to use.
*   **Root Cause:** A CSS typo (`.item-.row` instead of `.item-row`) in a media query prevented the mobile-specific styles for stacking the fields from being applied.
*   **Solution:** Corrected the typo in the CSS selector within the `@media (max-width: 768px)` block in `src/components/InvoiceEditor.vue`. This enabled the intended responsive behavior, stacking the line item fields vertically on smaller screens.

### 4. **Email Invoice Functionality**

*   **Goal:** Implement a feature to send invoices to clients via email after the service fee is paid.
*   **Implementation:**
    1.  **PDF Storage:** The `sendInvoiceEmail` flow was updated to first generate a PDF of the invoice and upload it to Firebase Storage. This was necessary because the original email function did not handle PDF generation and attachment.
    2.  **`storage.rules`:** Security rules for Firebase Storage were implemented to allow authenticated users to upload PDF files to the `invoice_pdfs/` directory, with validation for content type and size.
    3.  **`sendInvoiceEmail` Cloud Function:** The Cloud Function (`sendmail/index.js`) was updated to be triggered after the PDF is generated and uploaded. It now uses the Resend API to send an email with a link to the stored PDF.
    4.  **Frontend Integration (`InvoiceView.vue`):** The "Send Email" button triggers the entire flow: PDF generation, upload to Storage, and finally, the call to the Cloud Function. The UI provides feedback via a snackbar.

### 5. **UI & Icon Fixes**

*   **Problem:** Icons on several buttons (`Send Email`, `Download PDF`, etc.) in `InvoiceView.vue` were not displaying.
*   **Root Cause:** The component was using a deprecated `left` prop on the `<v-icon>` element, which is no longer supported in Vuetify 3.
*   **Solution:** Refactored the buttons in `src/components/InvoiceView.vue` to use the correct `prepend-icon` prop directly on the `<v-btn>` component. Also updated the send email icon to `mdi-email` per user request.

## Next Steps

*   **Improve Mobile Payment Reliability:** Address an issue where the Stripe payment window is blocked by mobile browsers due to popup-blocking behavior when paying the service fee.
    *   **Plan:**
        1.  **Create `StripeCheckout.vue` Component:** Develop a new component to render an embedded Stripe payment form within a modal dialog.
        2.  **Modify Cloud Function (`createCheckoutSession` to `createPaymentIntent`):** Update the cloud function responsible for initiating a payment to create a Stripe `PaymentIntent` instead of a `CheckoutSession`. This provides a `clientSecret` that can be used on the frontend.
        3.  **Update `InvoiceView.vue`:** Modify the payment flow. When a user clicks "Pay Service Fee," the app will call the updated cloud function to get a `clientSecret`. This secret will then be passed as a prop to the new `StripeCheckout.vue` component, which will render the secure, embedded payment form inside a dialog, avoiding popup blockers.
