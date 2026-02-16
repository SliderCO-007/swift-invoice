# Blueprint: SwiftInvoice

## Overview

SwiftInvoice is a Vue.js-based invoicing application designed for freelancers and small businesses. It simplifies the process of creating and managing invoices. The application leverages Firebase for backend services (Authentication, Firestore, Storage) and Cloud Functions. It now features a **freemium pricing model** to attract a wider user base, with paid plans for unlimited invoicing managed through Stripe.

## Core Features

*   **User Authentication:** Secure user registration and login using Firebase Authentication.
*   **Freemium Subscription Model:**
    *   **Free Plan:** Allows users to create up to 2 invoices and manage unlimited customers and items at no cost. This serves as a perfect entry point to the application.
    *   **Paid Plans:** Monthly ($6/month) and Yearly ($60/year) subscriptions that unlock unlimited invoicing and priority support.
*   **Invoice Management:** Create, view, update, and delete invoices.
*   **Customer Management:** A dedicated section to add, edit, and delete customer information.
*   **Item Management:** A dedicated section to add, edit, and delete frequently used items or services.
*   **PDF Generation & Download:** Generate and download professional PDF invoices.
*   **Email Invoicing:** Send generated PDF invoices to clients directly from the application.
*   **Dashboard:** An intuitive dashboard that provides an at-a-glance overview of invoice statuses and key metrics.

## Design and Styling

*   **Framework:** Vuetify for a pre-built library of Material Design components.
*   **Layout:** A clean and modern interface with a focus on user experience.
*   **Responsiveness:** The application is fully responsive and optimized for both desktop and mobile devices.

## Current Task: Implement "Freemium" Pricing Model

*   **[X] Update `PricingPage.vue` to a three-card layout.**
*   **[X] Add a new "Free" tier to the pricing page.**
    *   Top Label: No Credit Card Required
    *   Price Display: $0 / month
    *   Features: 2 free invoices, Unlimited Customers, Unlimited Items
    *   Button: "Start Invoicing for Free" linking to the registration page.
*   **[X] Update `blueprint.md` to reflect the new freemium strategy.**
