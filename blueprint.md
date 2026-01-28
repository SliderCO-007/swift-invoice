# Swift Invoice Application Blueprint

## Overview

Swift Invoice is a web application designed to simplify the invoicing process for freelancers and small businesses. It allows users to create, manage, and track invoices with a simple, pay-per-invoice pricing model. The application is built with Vue.js and Firebase, offering a modern and reactive user interface with a seamless payment experience through Stripe integration. Registration is completely free.

## Core Features

- **User Authentication**: Secure and free user registration and login functionality using Firebase Authentication.
- **Google One-Click Sign-In**: Users can register and log in using their Google account for a faster and more convenient experience.
- **Dashboard with Switchable Views**: A central dashboard to view and manage all invoices, featuring both a visual card layout and a data-rich table view for efficient management of large invoice volumes.
- **Invoice Management**: Create, edit, and view invoices with a user-friendly interface.
- **Delete Invoices**: Users can delete invoices from the dashboard with a confirmation step.
- **Payment Failure Handling**: Invoices are automatically deleted from the database if the corresponding Stripe payment fails or is canceled, preventing unpaid invoices.
- **Real-time Calculations**: The invoice editor provides real-time calculations for subtotals, taxes, and totals.
- **High-Quality PDF Generation**: Users can download crystal-clear, professionally styled PDF versions of their invoices. The rendering process is fine-tuned for maximum resolution (4x scale) and sharpness, with compact font sizes to accommodate detailed descriptions.
- **Stripe Integration**: A seamless payment flow that charges a $1 fee for creating a new invoice.
- **User Settings**: A dedicated page for users to manage their company information and default settings.
- **Support Link**: A support email is available in the footer of the landing page and dashboard for easy access.
- **SEO-Friendly Meta Tags**: Dynamic meta tags for improved search engine visibility, managed with `@vueuse/head`.

## Onboarding and User Flow

The user journey is designed to be simple and straightforward:
1.  **Create a Free Account**: Users sign up quickly with just their email and password or by using the one-click Google Sign-In option. No credit card is required at sign-up.
2.  **Set Up Business Details**: After registering, users are guided to the user settings page to input their company information, which will be used to personalize invoices.
3.  **Create First Invoice**: Users can then create their first professional invoice and pay the $1 fee upon creation.

## Design and Styling

- **Layout**: A clean and modern design with a responsive layout that works on both desktop and mobile devices.
- **PDF Invoice Template**: The invoice PDF has been meticulously styled with reduced padding and compact font sizes for a polished, space-efficient layout. The rendering quality has been maximized for exceptionally sharp text.
- **Data Table Styling**: The `v-data-table` component has been custom-styled with a professional and clean aesthetic. The header has a distinct background color, uppercase, bolded text, and a bottom border to separate it from the table data. Table rows have a subtle hover effect to improve user experience.
- **Landing Page**: 
    - The landing page has been updated to reflect the free registration model and includes a "How It Works" section to guide new users. Animated GIFs have been added to each step of the "How It Works" section to visually demonstrate the process.
    - The hero section now features a background image (`hero_background.png`) with a semi-transparent overlay to ensure text readability. The hero text is now white with a subtle shadow to make it stand out against the new background.
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

- **Objective**: Add a table view to the dashboard for more efficient invoice management and apply custom styling.
- **Key Changes**:
    - **Create `InvoiceTable.vue`**: A new component was created to display invoices in a `v-data-table`.
    - **Update `Dashboard.vue`**: The dashboard was modified to include a view switcher (`v-btn-toggle`).
    - **Conditional Rendering**: The dashboard conditionally renders either the card layout or the `InvoiceTable.vue` component.
    - **Style `InvoiceTable.vue`**: Custom CSS has been applied to the data table for a more polished and professional appearance.
- **Status**: Completed.
