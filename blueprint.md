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
