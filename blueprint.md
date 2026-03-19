# Swift Invoice Blueprint

## 1. Overview

Swift Invoice is a web application designed to help users create, manage, and track invoices. It provides a simple and intuitive interface for managing customers, items, and invoices, with a focus on ease of use and a clean, modern design.

## 2. Project Outline

### 2.1. Styling and Design

*   **CSS Framework:** The project uses a custom design system built with CSS variables and global styles, defined in `src/style.css`.
*   **Component Library:** Vuetify is used for UI components, with custom styling to match the application's design system.
*   **Typography:** The primary font is Poppins, imported from Google Fonts.
*   **Color Palette:**
    *   Primary: `#4A90E2` (Modern Blue)
    *   Secondary: `#50E3C2` (Vibrant Teal)
    *   Text: `#333`
    *   Background: `#F4F7F9`
*   **Layout:** The application uses a responsive layout with a maximum width of 1200px.

### 2.2. Core Architecture: Reactive and Composable

This project is built on a modern, reactive architecture using Vue's Composition API.

*   **Authentication:** `src/composables/useAuth.js` is the single source of truth for user authentication. It provides a reactive `currentUser` object that the rest of the application listens to.
*   **Data Fetching:** Data is fetched using composable functions (`useUserSettings.js`, `useInvoices.js`, etc.). These composables use Vue's `watchEffect` to react to changes in the `currentUser`. When a user logs in, data is fetched automatically. When they log out, data is cleared.
*   **Real-time Updates:** The application uses `onSnapshot` from the Firebase SDK to listen for real-time updates to data, ensuring the UI is always in sync with the database.

### 2.3. Features

*   **Authentication:** Users can register and log in to their accounts.
*   **Invoice Management:** Users can create, view, and manage invoices.
*   **Customer Management:** Users can add and manage their customers.
*   **Item Management:** Users can create and manage a list of items for use in invoices.
*   **Settings:** Users can manage their profile and application settings.
*   **Upgrade Prompt:** A prompt is displayed on the dashboard for non-subscribed users, encouraging them to upgrade.
*   **Venmo QR Code Generation:** Users can enter their Venmo username to generate a custom QR code, which includes their company logo, for their invoices.

### 2.4. Server-Side Functions

*   **Cloud Functions:** The project uses Google Cloud Functions for backend logic.
*   **SDK Version:** All functions use the v2 Firebase Functions SDK for consistency and modern features.
*   **Initialization:** The Firebase Admin SDK is initialized *once* in `functions/index.js` to ensure all functions have the correct authentication context.
*   **`generateVenmoQR` Function:** This function is responsible for creating a Venmo QR code. It is an `onCall` function that requires authentication to be executed. The function fetches the user's company logo and composites it onto the center of the QR code. If a logo is not available, it generates a standard QR code.

### 2.5. Landing Page
*   **Call to Action Buttons:** The "Get Started" and "TAKE A TOUR" buttons in the hero section are wrapped in a flex container to ensure proper alignment and spacing. They are centered on mobile and aligned to the start on medium and larger screens.

## 3. Current Change: Fix Build Error

### 3.1. Plan

1.  **Analyze the issue:** The build is failing due to a CSS syntax error in `src/components/LandingPage.vue`.
2.  **Modify the style:** Correct the typo in the `align-items` property within the `.loader-container` class.
3.  **Update `blueprint.md`:** Document the change in the `blueprint.md` file.
