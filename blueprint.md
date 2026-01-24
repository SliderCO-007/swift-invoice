# Swift Invoice Application Blueprint

## Overview

Swift Invoice is a web application designed to simplify the invoicing process for freelancers and small businesses. It allows users to create, manage, and track invoices with a simple, pay-per-invoice pricing model. The application is built with Vue.js and Firebase, offering a modern and reactive user interface with a seamless payment experience through Stripe integration. Registration is completely free.

## Core Features

- **User Authentication**: Secure and free user registration and login functionality using Firebase Authentication.
- **Invoice Management**: Create, edit, and view invoices with a user-friendly interface.
- **Delete Invoices**: Users can delete invoices from the dashboard with a confirmation step.
- **Payment Failure Handling**: Invoices are automatically deleted from the database if the corresponding Stripe payment fails or is canceled, preventing unpaid invoices.
- **Real-time Calculations**: The invoice editor provides real-time calculations for subtotals, taxes, and totals.
- **PDF Generation**: Users can download PDF versions of their invoices for their records. The PDF generation is now fixed to always render in a letter-sized format.
- **Stripe Integration**: A seamless payment flow that charges a $1 fee for creating a new invoice.
- **Dashboard**: A central dashboard to view and manage all invoices.
- **User Settings**: A dedicated page for users to manage their company information and default settings.
- **Support Link**: A support email is available in the footer of the landing page and dashboard for easy access.
- **SEO-Friendly Meta Tags**: Dynamic meta tags for improved search engine visibility, managed with `@vueuse/head`.

## Onboarding and User Flow

The user journey is designed to be simple and straightforward:
1.  **Create a Free Account**: Users sign up quickly with just an email and password. No credit card is required at sign-up.
2.  **Set Up Business Details**: After registering, users are guided to the user settings page to input their company information, which will be used to personalize invoices.
3.  **Create First Invoice**: Users can then create their first professional invoice and pay the $1 fee upon creation.

## Design and Styling

- **Layout**: A clean and modern design with a responsive layout that works on both desktop and mobile devices.
- **Landing Page**: The landing page has been updated to reflect the free registration model and includes a "How It Works" section to guide new users. Animated GIFs have been added to each step of the "How It Works" section to visually demonstrate the process.
- **Color Scheme**: A professional color palette with a primary color of `#4F46E5` and a clean, white background.
- **Typography**: Clear and legible typography with a focus on readability.
- **Components**: Custom-styled components for buttons, forms, and modals to ensure a consistent user experience.
	
## Technical Stack

- **Frontend**: Vue.js with the Composition API
- **Backend**: Firebase (Authentication, Firestore, Cloud Functions)
- **Payment Processing**: Stripe
- **PDF Generation**: jsPDF, html2canvas
- **Meta Tag Management**: `@vueuse/head`

## Current Implementation Plan

- **Objective**: Add an animated GIF to each step of the "How It Works" section on the landing page to visually guide users.
- **Key Changes**:
    - **Updated `LandingPage.vue`**: `<img>` tags were added to the `LandingPage.vue` component under the "Step 1", "Step 2", and "Step 3" cards.
    - **Image Sources**: The GIFs are located at `/click_getStarted.gif` (for Step 1), `/click_manageSettings.gif` (for Step 2), and `/click_firstInvoice.gif` (for Step 3).
    - **Styling**: The `.step-card` and `.step-description` classes were updated to ensure the GIFs are horizontally aligned at the bottom of each card.
- **Status**: Completed.
