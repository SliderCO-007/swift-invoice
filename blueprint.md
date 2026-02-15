# Blueprint: SwiftInvoice

## Overview

SwiftInvoice is a Vue.js-based invoicing application designed for freelancers and small businesses. It simplifies the process of creating and managing invoices. The application leverages Firebase for backend services (Authentication, Firestore, Storage) and Cloud Functions. It integrates with Stripe to manage **monthly and yearly subscriptions**.

## Core Features

*   **User Authentication:** Secure user registration and login using Firebase Authentication.
*   **Subscription Model:** A simple "6/60" pricing plan. Users can choose a $6/month or $60/year subscription for unlimited access.
*   **Invoice Management:** Create, view, update, and delete invoices.
*   **Customer Management:** A dedicated section to add, edit, and delete customer information.
*   **PDF Generation & Download:** Generate and download professional PDF invoices.
*   **Email Invoicing:** Send generated PDF invoices to clients directly from the application.
*   **Dashboard:** An intuitive dashboard that provides an at-a-glance overview of invoice statuses and key metrics.

## Design and Styling

*   **Framework:** Vuetify for a pre-built library of Material Design components.
*   **Layout:** A clean and modern interface with a focus on user experience.
*   **Responsiveness:** The application is fully responsive and optimized for both desktop and mobile devices.

## Current Task: Implement New Pricing Model

*   **[X] Update blueprint.md to reflect the new subscription model.**
*   **[X] Create a new `PricingPage.vue` component.**
*   **[X] Add a `/pricing` route.**
*   **[X] Update `LandingPage.vue` with new pricing information.**
*   **[X] Add a "Pricing" link to the main navigation.**
