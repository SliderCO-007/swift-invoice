# Swift Invoice Blueprint

## Overview

Swift Invoice is a modern, web-based invoicing application designed for freelancers and small businesses. It provides a simple and efficient way to create, manage, and send professional invoices. The application is built with Vue.js, Vite, and Firebase, and it leverages modern design principles to provide a clean and intuitive user experience.

## Features

### Invoicing

*   **Create Invoices:** Users can create new invoices with details such as client information, line items, tax rates, and due dates.
*   **Invoice Numbering:** Invoices are automatically assigned a unique, sequential invoice number.
*   **Status Tracking:** Invoices can be marked as "Paid," and the status is visually reflected in the UI.
*   **WYSIWYG PDF Generation:** Users can download or email a pixel-perfect PDF of any invoice that exactly matches the in-browser preview.
*   **Email Invoices:** Users with a Pro or Business plan can send these high-fidelity PDF invoices directly to clients via email. The email subject line and body are dynamically personalized with the invoice number and client details for a professional touch. The sender email is set to `no-reply@swiftinvoice.biz`.

### User Management

*   **Authentication:** Users can sign up and log in using email/password or their Google account.
*   **User Profiles:** Each user has a profile in Firestore that stores their name, email, and subscription status.

### Subscriptions

*   **Subscription Plans:** The application offers a "Free" plan and paid "Pro" and "Business" plans.
*   **Stripe Integration:** Stripe Checkout is used to handle subscription payments.
*   **Webhook Handling:** A cloud function handles Stripe webhooks to update user subscription status in Firestore.

### Design and Styling

*   **Component-Based:** The UI is built with Vue.js Single File Components.
*   **Scoped Styles:** Each component has its own scoped styles to prevent CSS conflicts.
*   **Modern Design:** The application features a clean, modern design with a focus on user experience.

## Current Task: Fix Build Error and Improve Reactivity in InvoiceEditor

### Problem

The application was failing to build for production due to an incorrect import in `src/components/InvoiceEditor.vue`. The component was attempting to import `authReady`, a variable that is not exported from `src/composables/useAuth.js`. This also highlighted a fragile data-loading strategy.

### Solution

The incorrect import was removed, and the component's initialization logic was re-engineered to be more robust. Instead of a one-time check, a reactive `watch` effect was implemented to monitor the `currentUser` state, ensuring data is always in sync with the user's authentication status.

### Steps Taken

1.  **Identify Error:** Traced the build failure to the `import { authReady, ... }` line in `InvoiceEditor.vue`.
2.  **Correct Import:** Removed the non-existent `authReady` from the import statement.
3.  **Improve Reactivity:** Replaced the old `authReady.then(...)` block with a `watch` effect that observes the `currentUser` ref from `useAuth.js`.
4.  **Robust Initialization:** The new watcher triggers the necessary data fetching (`initializeInvoice`, `fetchCustomers`, `fetchItems`) whenever the user logs in, ensuring the editor is always populated with the correct data.
5.  **Update Blueprint:** Documented the fix and the improved reactivity pattern.

## Previous Tasks

### Update Sender Email Address

*   **Problem:** The sender email for invoices was `invoices@swiftinvoice.biz`, which could be confusing for recipients.
*   **Solution:** Changed the sender address to `no-reply@swiftinvoice.biz` in the `sendInvoiceEmail` Cloud Function.
*   **Steps Taken:** Updated the `from` field in `functions/index.js` and deployed the function.

### Refine Email Body Content

*   **Problem:** The email body was a generic, one-line message.
*   **Solution:** Expanded the email body into a detailed, multi-line HTML message with dynamic content.
*   **Steps Taken:** Constructed a dynamic `emailBody` in `InvoiceView.vue` and passed it to the `sendInvoiceEmail` function.

### Enhance Email Subject Line

*   **Problem:** The email subject line was generic, making it hard for clients to identify invoices.
*   **Solution:** Updated the subject line to dynamically include the invoice number.
*   **Steps Taken:** Modified the `subject` parameter in the `sendInvoiceEmail` function call.

### Unify PDF Generation for a WYSIWYG Experience

*   **Problem:** Server-side PDF generation was inconsistent with the browser preview.
*   **Solution:** Moved all PDF generation to the client-side using `html2canvas` and `jspdf`.
*   **Steps Taken:** Refactored `InvoiceView.vue` and simplified the `sendInvoiceEmail` cloud function.
