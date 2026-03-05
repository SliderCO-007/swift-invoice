# ScanGo Invoice Application Blueprint

## Overview

ScanGo Invoice is a web-based application designed to simplify the invoicing process for freelancers and small businesses. It allows users to create, send, and manage invoices efficiently. The application is built with Vue.js and Vite, focusing on a fast, responsive, and user-friendly experience.

## Project Outline

### Design & Style

*   **Color Palette:** A modern and vibrant color scheme is used to create a visually appealing interface.
*   **Typography:** Clean and readable fonts are used to ensure a clear hierarchy and legibility.
*   **Layout:** The application uses a responsive layout that adapts to different screen sizes, ensuring a seamless experience on both desktop and mobile devices.
*   **Iconography:** Icons are used to enhance usability and provide visual cues for various actions.

### Features

*   **User Authentication:** Secure user registration and login functionality.
*   **Invoice Management:**
    *   Create, edit, and delete invoices.
    *   View a list of all invoices with their status.
    *   Real-time updates for invoice status.
*   **Customer Management:**
    *   Add, edit, and delete customer information.
    *   Assign customers to invoices.
*   **Item Management:**
    *   Add, edit, and delete line items for invoices.
    *   Save frequently used items for quick reuse.
*   **PDF Generation:** Generate PDF versions of invoices for printing or sending to clients.
*   **Stripe Integration:** Process payments securely through Stripe.
*   **Dashboard:** An overview of key invoice statistics, such as total revenue, outstanding payments, and overdue invoices.

## Current Task: Mobile Demo on Landing Page

### Plan

1.  **Mobile Detection:**
    *   Implement a mechanism in `src/components/LandingPage.vue` to detect if the user is accessing the application on a mobile device.

2.  **"See it in Action" Button:**
    *   Add a new button to the landing page, labeled "See it in Action".
    *   This button will only be visible to users on mobile devices.
    *   The button will be placed under the existing "Create a free invoice" call-to-action.

3.  **Mobile Preview Modal:**
    *   Reuse the existing `InvoicePreview` modal to display a GIF showcasing the mobile experience.
    *   When a user clicks the "See it in Action" button, the modal will appear.
    *   The modal will display the `ScanGo_mobile_newInvoice.gif` file, which is located in the `public` folder.
    *   **Add a loading indicator that is displayed while the GIF is loading.**
