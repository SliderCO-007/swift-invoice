
# Blueprint: SwiftInvoice

## Overview

SwiftInvoice is a Vue.js-based invoicing application designed for freelancers and small businesses. It simplifies the process of creating, managing, and tracking invoices. The application leverages Firebase for backend services, including authentication, database, and cloud functions, and integrates with Stripe for seamless payment processing.

## Core Features

*   **User Authentication:** Secure user registration and login using Firebase Authentication.
*   **Invoice Management:** Create, view, update, and delete invoices.
*   **Client Management:** Store and manage client information.
*   **PDF Generation:** Generate professional PDF invoices for clients.
*   **Stripe Integration:** Accept online payments for invoices through Stripe.
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

## Next Steps

*   **Improve Mobile Payment Reliability:** Address an issue where the Stripe payment window is blocked by mobile browsers due to popup-blocking behavior.
    *   **Plan:**
        1.  **Create `StripeCheckout.vue` Component:** Develop a new component to render an embedded Stripe payment form within a modal dialog.
        2.  **Modify Cloud Function (`createCheckoutSession`):** Update the function to create a Stripe `PaymentIntent`, which provides a `clientSecret`.
        3.  **Update `InvoiceView.vue`:** Modify the payment flow to use the new component, passing the `clientSecret` to it to securely initialize the embedded form.

*   **UI/UX Validation:** Continue to test and validate additional UI features and functionality across the application.
