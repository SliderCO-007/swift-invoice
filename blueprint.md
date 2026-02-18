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
*   **WYSIWYG PDF Generation:** Users can download or email a pixel-perfect PDF of any invoice that exactly matches the in-browser preview.
*   **Email Invoices:** Users can send PDF invoices directly to clients. The sender is set to `no-reply@swiftinvoice.biz`.
*   **QR Code Payments:** The invoice editor allows users to toggle the inclusion of a QR code for payments.

### User Management

*   **Authentication:** Users can sign up and log in using email/password or their Google account.
*   **User Profiles:** Each user has a profile in Firestore that stores their name, email, and subscription status.

### Subscriptions

*   **Subscription Plans:** The application offers a "Free" plan and paid "Pro" and "Business" plans.
*   **Stripe Integration:** Stripe Checkout is used to handle subscription payments.
*   **Webhook Handling:** A cloud function handles Stripe webhooks to update user subscription status in Firestore.

### Analytics & Privacy

*   **Google Consent Mode v2:** The application correctly implements Google's consent mode. Consent is set to 'denied' by default, and tracking is only enabled after the user explicitly accepts.
*   **Cookie Consent Banner:** A banner is displayed to new users to obtain consent. The choice is stored in `localStorage` to persist the setting across sessions.
*   **Cookie Policy Modal:** A detailed Cookie Policy is available to users directly from the consent banner via a modal dialog, ensuring easy access without navigating away from the page.

### Design and Styling

*   **Component-Based:** The UI is built with Vue.js Single File Components.
*   **Scoped Styles:** Each component has its own scoped styles to prevent CSS conflicts.
*   **Modern Design:** The application features a clean, modern design with a focus on user experience.
*   **Consistent Styling:** The delete button for line items has a consistent, prominent style across all screen sizes for clear user affordance.

## Current Task: Implement Cookie Policy Modal

### Goal

Provide users with clear, accessible information about the website's cookie usage.

### Implementation

1.  **Create `CookiePolicy.vue` Component:** A new, static component was created at `src/components/CookiePolicy.vue` to house the detailed text of the cookie policy.

2.  **Integrate as a Modal:** Instead of creating a separate page and route, the decision was made to present the policy in a modal dialog for a better user experience.

3.  **Update `TheCookieBanner.vue`:**
    *   The `CookiePolicy.vue` component was imported into the banner.
    *   A Vuetify `v-dialog` component was added to act as the modal container.
    *   The "View our Cookie Policy" text was converted from a `<router-link>` to a standard `<a>` tag with a click handler that toggles the visibility of the modal.
    *   This approach keeps the user in the same context while allowing them to view detailed policy information.

## Previous Tasks

### Fix Cookie Consent Banner

*   **Problem:** The effort to implement a cookie consent banner was beset by a series of cascading errors, including `useGtag is not a function` and failures to access the `gtag` object.
*   **Solution:** The user correctly identified that the `vue-gtag` composable was `useConsent`, not `useGtag`. The final, correct solution also involved addressing an incorrect plugin initialization in `src/main.js`.

### Refactor Privacy Policy Component Location

*   **Problem:** The `PrivacyPolicy.vue` component was located in the `src/views` directory but was better suited for `src/components`.
*   **Solution:** The component was moved, and the router was updated to reflect the new path.

### Add Privacy Policy Link to Footer

*   **Problem:** The privacy policy page needed to be easily accessible.
*   **Solution:** A `<router-link>` was added to the footer in `LandingPage.vue`.

### Create Privacy Policy Page

*   **Problem:** The application needed a dedicated page for its privacy policy.
*   **Solution:** A new component, `src/components/PrivacyPolicy.vue`, was created and a route was added.
