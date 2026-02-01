# Project Blueprint

## Overview

This project is a Vue.js application for managing invoices. It allows users to create, view, and manage invoices. The application is built with Vue.js, Vuetify for UI components, and Pinia for state management. It uses Firebase for authentication and database services.

## Implemented Features

### New User Onboarding via Dashboard Prompt

*   **Purpose:** To guide new users to complete their company profile in a non-disruptive way. This ensures that essential information is provided before core features, like invoice creation, are used.
*   **Onboarding Flow:**
    1.  After signing up, a new user is directed to the **Dashboard**.
    2.  The Dashboard checks if the user's company name has been saved in their settings.
    3.  If the company information is incomplete, a **`CompanyInfoPrompt.vue`** component is displayed at the top of the dashboard.
    4.  This prompt clearly explains that company details are needed and provides a direct button to navigate to the **Settings page (`/settings`)**.
    5.  The user can explore the dashboard, but they will be gently guided back to the settings page if they attempt to create an invoice before completing their profile.
*   **Key Components & Logic:**
    *   **`src/components/CompanyInfoPrompt.vue`**: A new, cleanly designed component that informs the user about the next step.
    *   **`src/components/Dashboard.vue`**: Conditionally renders the `CompanyInfoPrompt` based on the user's settings. It also prevents invoice creation until the profile is complete.
    *   **`src/components/UserSettings.vue`**: The central location for users to enter and manage their company details, including their logo and default tax rate.

### Instant Venmo Payments

*   **Purpose:** To provide a fast and convenient payment option for clients by allowing them to pay directly through Venmo.
*   **Feature Flow:**
    1.  **User Settings:** Users can upload their Venmo QR code in the **User Settings** page. The QR code is stored securely in Firebase Storage.
    2.  **Invoice Creation:** When creating a new invoice, users can choose to include the Venmo QR code by toggling a switch.
    3.  **Invoice Template:** If the option is enabled, the Venmo QR code is displayed on the final invoice, along with a "Scan to Pay" call to action.
*   **Key Components & Logic:**
    *   **`src/composables/useUserSettings.js`**: Updated to handle the upload and storage of the Venmo QR code URL.
    *   **`src/components/UserSettings.vue`**: Modified to include a new file input for the Venmo QR code, with a preview.
    *   **`src/components/InvoiceEditor.vue`**: Includes a new "Include Venmo QR Code" switch to control the visibility of the QR code on a per-invoice basis.
    *   **`src/components/InvoiceTemplate.vue`**: Conditionally renders the Venmo QR code and a "Scan to Pay" message.
    *   **`src/components/LandingPage.vue`**: A new feature card was added to the landing page to advertise the new feature to users.

## Current Request

### Add Venmo Payment Option

*   **Goal:** Allow users to add a Venmo QR code to their invoices for instant payments.
*   **Plan & Steps:**
    1.  **Update `useUserSettings.js`:** Add a `venmoQrUrl` field to the `settings` ref and update `saveUserSettings` to handle the QR code upload.
    2.  **Update `UserSettings.vue`:** Add a file input for the Venmo QR code with a preview.
    3.  **Create a placeholder QR code:** Add a placeholder SVG image for the QR code uploader.
    4.  **Update `InvoiceEditor.vue`:** Add an "Include Venmo QR Code" switch.
    5.  **Update `InvoiceTemplate.vue`:** Conditionally render the Venmo QR code on the invoice.
    6.  **Create `IconVenmo.vue`:** Add a new Venmo icon component.
    7.  **Update `LandingPage.vue`:** Add a feature card for the new Venmo payment option.
