# Swift Invoice - Blueprint

## Overview

Swift Invoice is a web application that allows users to create professional invoices, download them as PDFs, and email them. It features a user registration system with a one-time fee and a per-invoice charge.

## Style, Design, and Features

### Style & Design

*   **Framework:** Vue.js with Vite
*   **Language:** TypeScript and JavaScript
*   **Styling:** Tailwind CSS for a utility-first approach.
*   **Database:** Firebase Firestore for data storage.
*   **Color Palette:** A modern and professional color scheme with a wide range of hues to create a vibrant look. The background has a light gray color (`#f0f2f5`).
*   **Typography:** Expressive and relevant typography to emphasize key information.
*   **Iconography:** Modern, interactive icons to enhance usability (Logo, PDF, Email, Analytics).
*   **Visual Effects:** Multi-layered drop shadows for depth and a "lifted" look for cards. Interactive elements have a "glow" effect and transition effects on hover.
*   **Accessibility:** The application will be designed with accessibility in mind, following A11Y standards.

### Features

*   **Landing Page:**
    *   Header with logo and "Register" button that navigates to the registration page.
    *   Hero section with a clear call-to-action.
    *   Features section highlighting PDF Generation, Email Invoices, and Payment Tracking.
    *   Footer with copyright information.
*   **User Authentication & Billing:**
    *   User registration with a $50 one-time fee.
    *   $1 charge per invoice created.
*   **User Profile:**
    *   Users can set up their business name, address, and logo.
*   **Client & Invoice Management:**
    *   Create, Read, Update, and Delete (CRUD) operations for clients.
    *   CRUD operations for invoices.
    *   Invoices are associated with clients.
    *   Generate invoices in PDF format.
    *   Email invoices to the user.

## Current Plan

### Phase 1: Landing Page and Initial Setup (Completed)

1.  **Project Setup:** Initialized a Vue.js project with Vite and TypeScript.
2.  **Install Tailwind CSS:** Installed and configured Tailwind CSS for styling.
3.  **Create `LandingPage.vue`:** Designed a visually appealing landing page.
4.  **Component Structure:**
    *   Created a `LandingPage.vue` component with Header, Main Content, Features, and Footer sections.
    *   Created a `Logo.vue` component for the brand logo.
    *   Created icon components for the features section (`IconPDF.vue`, `IconEmail.vue`, `IconAnalytics.vue`).
5.  **Refine UI:** Applied modern design principles, including shadows, hover effects, and a professional color palette.

### Phase 2: User Authentication and Registration Flow (In Progress)

1.  **Create Registration Page:** Designed and built a registration page (`RegisterPage.vue`) with a form for name, email, and password.
2.  **Set up Routing (Completed):**
    *   Installed `vue-router`.
    *   Created `src/router/index.ts` to define routes for the landing page and registration page.
    *   Updated `src/main.js` to use the router.
    *   Modified `App.vue` to use `<router-view>`.
    *   Updated the "Register" button in `LandingPage.vue` to be a `<router-link>`.
3.  **Implement Stripe Checkout (In Progress):**
    *   Installed `@stripe/stripe-js`.
    *   Created a `useStripe.ts` composable to handle Stripe logic.
    *   Updated the pricing model to a $50 one-time registration fee.
    *   Integrated a mock Stripe checkout flow for the registration fee.
4.  **Backend Logic (Mock):** Create mock functions to simulate user creation and subscription status updates.

### Phase 3: Database Integration with Firebase (In Progress)

1.  **Install Firebase:** Installed the `firebase` library.
2.  **Firebase Configuration:** Created a `src/firebase.ts` file to initialize the Firebase app and Firestore.
3.  **Create Firestore Composable:** Created a `src/composables/useFirestore.ts` composable to manage interactions with the 'clients' and 'invoices' collections in Firestore. This includes functions for adding and retrieving data.
