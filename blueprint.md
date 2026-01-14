# Swift Invoice Application Blueprint

## Overview

Swift Invoice is a web application designed to simplify the invoicing process for freelancers and small businesses. It allows users to create, manage, and track invoices, while also providing a seamless payment experience through Stripe integration. The application is built with Vue.js and Firebase, offering a modern and reactive user interface.

## Core Features

- **User Authentication**: Secure user registration and login functionality using Firebase Authentication.
- **Invoice Management**: Create, edit, and view invoices with a user-friendly interface.
- **Real-time Calculations**: The invoice editor provides real-time calculations for subtotals, taxes, and totals.
- **PDF Generation**: Users can download PDF versions of their invoices for their records.
- **Stripe Integration**: A seamless payment flow that charges a $1 fee for creating a new invoice.
- **Dashboard**: A central dashboard to view and manage all invoices.
- **User Settings**: A dedicated page for users to manage their company information and default settings.

## Design and Styling

- **Layout**: A clean and modern two-column layout for the invoice editor, with a responsive design that adapts to mobile devices.
- **Color Scheme**: A professional color palette with a primary color of `#4F46E5` and a clean, white background.
- **Typography**: Clear and legible typography with a focus on readability.
- **Components**: Custom-styled components for buttons, forms, and modals to ensure a consistent user experience.

## Technical Stack

- **Frontend**: Vue.js with the Composition API
- **Backend**: Firebase (Authentication, Firestore, Cloud Functions)
- **Payment Processing**: Stripe
- **PDF Generation**: jsPDF, html2canvas

## Current Implementation Plan

- **Objective**: Standardize navigation and styling for a consistent user experience.
- **Key Changes**:
    - Updated the "Back to Dashboard" button in the `InvoiceEditor` to use a named route for more robust navigation.
    - Applied consistent styling to the "Back to Dashboard" buttons in both `UserSettings` and `InvoiceEditor` components.
- **Status**: Completed.
