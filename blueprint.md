# Swift Invoice Blueprint

## Overview

Swift Invoice is a modern, web-based invoicing application designed for freelancers and small businesses. It simplifies the process of creating, sending, and managing invoices, allowing users to get paid faster. The application is built with Vue.js, Vuetify, and Firebase, providing a fast, responsive, and secure user experience.

## Project Outline

### Style & Design

*   **Framework:** Vuetify 3
*   **Layout:** Clean and modern, with a focus on usability.
*   **Color Scheme:** A professional and trustworthy palette with shades of blue and grey.
*   **Typography:** Clear and legible fonts for easy reading.
*   **Iconography:** Material Design Icons for intuitive navigation.

### Features

*   **Landing Page:** A visually appealing entry point with a clear call-to-action.
*   **User Authentication & Billing:**
    *   User registration with a $50 one-time fee via Stripe.
    *   Email/Password and Google Sign-In options.
    *   Payment success and cancellation handling.
*   **User Settings:** Users can save their business information, including company name, address, phone number, and logo.
*   **Dashboard:** A central hub for users to manage their invoices and view analytics after logging in.
*   **Invoice Creation:** A powerful editor with live preview for creating professional invoices.
*   **Invoice Management:** A real-time list of all invoices with their current status.

## Completed Plans

### Phase 1: User Settings

*   **Create `UserSettings.vue` component:** Design a form for users to input their company name, address, phone number, and upload a logo.
*   **Create `useUserSettings.js` composable:** Implement the logic to save and retrieve user settings from Firebase (Firestore and Storage).
*   **Add `/settings` route:** Create a new route for the User Settings page and protect it with authentication.
*   **Update Dashboard:** Add a link to the User Settings page from the main dashboard.

### Phase 2: Invoicing Core

*   **Design the Invoice Template:** Create a professional and visually appealing invoice template that will be populated with invoice data.
*   **Create the Invoice Editor:** Build a form where users can create new invoices, which automatically uses the user's saved business information and provides a live preview.
*   **Build the Invoice List:** Create a page where users can see a list of all their invoices and their current statuses.
*   **Create `useInvoices.js` Composable:** Implement the logic for fetching, creating, and managing invoices in Firestore.
*   **Integrate with UI:** Connect the `InvoiceEditor` and `InvoiceList` components to the `useInvoices` composable to provide a seamless, real-time experience.

### Phase 3: Firebase Initialization Bug Fix

*   **Problem:** The application was experiencing a persistent "No Firebase App" error, indicating a race condition or improper initialization of Firebase services.
*   **Investigation:**
    *   Analyzed the application's startup process in `main.js`.
    *   Audited all composables (`useAuth.js`, `useInvoices.js`, `useUserSettings.js`) that interact with Firebase.
*   **Root Cause Analysis:** Discovered that multiple composables were independently initializing their own Firebase services (`getAuth()`, `getFirestore()`, `getStorage()`) instead of using the centralized `app` instance. This created rogue, unconfigured services.
*   **Solution:**
    1.  **Centralized Services:** Refactored `src/firebase.js` to initialize and export all necessary Firebase services (`auth`, `db`, `storage`).
    2.  **Corrected Composables:** Modified `useAuth.js`, `useInvoices.js`, and `useUserSettings.js` to import the pre-initialized services from `src/firebase.js` instead of creating their own.
    3.  **Robust Startup:** Converted `src/main.js` to an asynchronous module that explicitly `await`s the full initialization of the `firebase.js` module before mounting the Vue application, completely eliminating any potential for race conditions.
*   **Outcome:** The Firebase initialization errors were resolved, resulting in a stable and reliable application build.
