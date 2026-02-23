# Swift Invoice Blueprint

## Overview

Swift Invoice is a modern, web-based invoicing application designed for freelancers and small businesses. It provides a simple and efficient way to create, manage, and send professional invoices. The application is built with Vue.js, Vite, and Firebase, and it leverages modern design principles to provide a clean and intuitive user experience.

## Features

### Invoicing

*   **Create Invoices:** Users can create new invoices with details such as client information, line items, tax rates, and due dates.
*   **Dynamic Line Items:** The invoice editor supports both selecting from a list of saved items and entering new, custom line items on the fly. When a saved item is selected, its price is automatically populated.
*   **Invoice Numbering:** Invoices are automatically assigned a unique, sequential invoice number.
*   **Status Tracking:** Invoices can be marked as "Paid," and the status is visually reflected in the UI.
*   **Real-Time Updates:** Dashboard statistics update instantly when an invoice is deleted.
*   **WYSIWYG PDF Generation:** Users can download or email a pixel-perfect PDF of any invoice that exactly matches the in-browser preview. The PDF generation logic is carefully designed to wait for web fonts to load, ensuring a perfect render every time.
*   **Email Invoices:** Users can send PDF invoices directly to clients. The sender is set to `no-reply@swiftinvoice.biz`.
*   **QR Code Payments:** The invoice editor allows users to toggle the inclusion of a QR code for payments.

### User Management

*   **Authentication:** Users can sign up and log in using email/password or their Google account.
*   **User Profiles:** Each user has a profile in Firestore that stores their name, email, and subscription status.

### Subscriptions

*   **Subscription Plans:** The application offers a "Free" plan and paid "Pro" and "Business" plans.
*   **Stripe Integration:** Stripe Checkout is used to handle subscription payments.
*   **Webhook Handling:** A cloud function handles Stripe webhooks to update user subscription status in Firestore.
*   **Robust Payment Verification:** A resilient polling mechanism on the payment success page waits for backend confirmation of subscription status, providing dynamic user feedback and a generous timeout to prevent premature errors.

### Analytics & Privacy

*   **Google Consent Mode v2:** The application correctly implements Google's consent mode. Consent is set to 'denied' by default, and tracking is only enabled after the user explicitly accepts.
*   **Cookie Consent Banner:** A banner is displayed to new users to obtain consent. The choice is stored in `localStorage` to persist the setting across sessions.
*   **Cookie Policy Modal:** A detailed Cookie Policy is available to users directly from the consent banner via a modal dialog, ensuring easy access without navigating away from the page.

### Design and Styling

*   **Component-Based:** The UI is built with Vue.js Single File Components.
*   **Scoped Styles:** Each component has its own scoped styles to prevent CSS conflicts.
*   **Modern Design:** The application features a clean, modern design with a focus on user experience.
*   **Responsive Navigation:** A fully responsive app bar that provides a consistent and intuitive user experience across all devices.

## Current Task: Enhance Payment Verification

### Goal
Improve the reliability and user experience of the post-payment verification screen.

### Problem
The previous implementation used a short timeout (30 seconds) to verify a subscription update in Firestore after a Stripe payment. This could lead to a "Verification Timed Out" error message even if the payment was successful, simply because of webhook processing delays.

### Implementation
1.  **Extended Timeout:** The total timeout for verification has been increased to 60 seconds, providing a more generous window for the backend to process the payment and update the user's status.
2.  **Dynamic Loading Messages:** Instead of a static loading message, the component now displays a series of messages that change over time. This reassures the user that the process is ongoing and not stuck.
3.  **Flexible Status Check:** The verification logic now checks for any paid subscription status (e.g., 'pro', 'business') rather than just 'active'. This makes the system more robust and future-proof.
4.  **Improved Cleanup:** All timers are now tracked in an array and cleared reliably when the component is unmounted or verification succeeds, preventing potential memory leaks.

## Previous Tasks

### Fix PDF Font Rendering Issue

*   **Problem:** Text in generated PDFs was overlapping and unreadable because the rendering would occur before the "Roboto" web font had fully loaded.
*   **Solution:** Added `await document.fonts.ready;` to the `generatePDF` function in `InvoiceView.vue`. This simple line ensures that `html2canvas` does not attempt to render the invoice until all necessary fonts are available, resulting in a perfect, pixel-accurate PDF.

### Enhance Navigation Menus

*   **Goal:** Improve the navigation menus to be more intuitive and visually appealing across all screen sizes.
*   **Implementation:** Refined the mobile menu, added icons to all menu items for better visual guidance, and ensured the content remains dynamic for both guest and authenticated users.

### Implement Cookie Policy Modal

*   **Problem:** The application needed to display a cookie policy.
*   **Solution:** A `CookiePolicy.vue` component was created and displayed in a `v-dialog` modal from the cookie consent banner, avoiding the need for a separate route.

### Fix Cookie Consent Banner

*   **Problem:** The cookie consent banner was not functioning due to errors with the `vue-gtag` library.
*   **Solution:** Corrected the composable used to `useConsent` and fixed the plugin initialization in `main.js`.
