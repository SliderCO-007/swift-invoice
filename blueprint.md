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
*   **Responsive Navigation:** A fully responsive app bar that provides a consistent and intuitive user experience across all devices.

## Current Task: Enhance Navigation Menus

### Goal

Improve the navigation menus to be more intuitive and visually appealing across all screen sizes.

### Implementation

1.  **Refine Mobile Menu:**
    *   **Replace Drawer with Menu:** The initial `v-navigation-drawer` was replaced with a `v-menu` component to provide a more direct, dropdown-style interaction on mobile.
    *   **Anchor to Icon:** The new `v-menu` is anchored to the `v-app-bar-nav-icon` (the hamburger icon), making the menu appear to drop down directly from the icon.
    *   **Right-Aligned Position:** The hamburger icon is positioned on the far right of the app bar on mobile screens, following modern mobile UI conventions.

2.  **Add Icons to Menus:**
    *   **Data-Driven Icons:** An `icon` property was added to the `guestNav` and `authNav` data arrays in `AppBar.vue`.
    *   **Visual Enhancement:** `v-icon` components were added to the `v-list-item`s in both the mobile dropdown and the desktop user menu, providing clear visual cues for each navigation link.
    *   **Consistent Logout Icon:** An icon was also added to the "Logout" action for consistency.

3.  **Conditional Content:** The menu content remains dynamic, showing appropriate links and icons for both guest and authenticated users.

## Previous Tasks

### Implement Cookie Policy Modal

*   **Problem:** The application needed to display a cookie policy.
*   **Solution:** A `CookiePolicy.vue` component was created and displayed in a `v-dialog` modal from the cookie consent banner, avoiding the need for a separate route.

### Fix Cookie Consent Banner

*   **Problem:** The cookie consent banner was not functioning due to errors with the `vue-gtag` library.
*   **Solution:** Corrected the composable used to `useConsent` and fixed the plugin initialization in `main.js`.

### Refactor Privacy Policy Component Location

*   **Problem:** The `PrivacyPolicy.vue` component was in an incorrect directory.
*   **Solution:** The component was moved from `src/views` to `src/components` and the router was updated.
