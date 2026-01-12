# Swift Invoice Blueprint

## Overview

Swift Invoice is a web-based application designed to simplify the process of creating, managing, and tracking professional invoices. It provides a user-friendly interface for freelancers, small businesses, and contractors to generate beautiful, customized invoices, manage client information, and keep track of payments. The application is built with Vue.js and Firebase, offering a fast, secure, and real-time experience.

## Features & Design

### Core Functionality

*   **Invoice Management:**
    *   Create, edit, and delete invoices.
    *   View a list of all invoices with their status (Paid, Pending, Draft).
    *   View a complete and detailed invoice, including all line items.
    *   **Company Logo on Invoice:** The invoice template now prominently displays the company logo in the center of the header, providing a professional and branded look. The logo is fetched from the user's settings.
    *   **Mark as Paid:** Users can mark an invoice as "Paid" with a single click from the invoice view. The status is updated in real-time, and the button is disabled if the invoice is already paid to prevent accidental updates.
    *   Responsive invoice editor with a live preview on desktop.
    *   **User-Specific Sequential Invoice Numbers:** Each user has their own independent invoice counter, ensuring a professional and sequential numbering system that is unique to their account.
    *   **Invoice Editor Enhancements:**
        *   **Auto-population:** The "From" address and tax rate are automatically and reliably populated from user settings when creating a new invoice.
        *   **Date Formatting:** Fixed a bug where dates were not being correctly formatted in the invoice editor, ensuring a smooth user experience.
    *   **Dashboard Improvements:**
        *   The invoice card header on the dashboard now displays the `invoiceNumber` for better readability, rather than the internal document ID.
        *   Fixed a bug where the due date on the dashboard was incorrectly displayed as "No due date." The date formatting logic has been improved to correctly handle multiple date formats.
        *   **Edit Button:** An "Edit" button has been added to each invoice card, allowing users to quickly navigate to the edit page for an existing invoice.
*   **User Settings:**
    *   Save company information (name, email, and a structured address with `address1`, `address2`, `city`, `state`, and `zip`).
    *   Set a default tax rate and an initial invoice counter.
    *   Upload a company logo through a stylish, circular uploader with a live preview.
    *   A dedicated, responsive settings page with a clean and modern design.
*   **Authentication:**
    *   Secure user authentication with Firebase Auth, with persistent login sessions.
*   **Data Persistence:**
    *   Invoices and user settings are saved to a Firestore database.
    *   Company logos are stored in Firebase Storage.
*   **Payment System ($1 Per-Invoice Fee):**
    *   **Stripe Integration:** The application is integrated with Stripe to process a $1 fee for each new invoice created.
    *   **Backend Cloud Function:** A `createInvoiceCheckoutSession` Cloud Function securely creates a Stripe Checkout session.
    *   **Payment Flow:** When a user finalizes a new invoice, they are redirected to a Stripe Checkout page to complete the payment.
    *   **Success Page:** After a successful payment, the user is redirected to a success page that finalizes the invoice creation process and then automatically redirects them to the dashboard.

### Design & Styling

*   **Layout:**
    *   Modern, two-column layouts for both the invoice editor and user settings pages, providing a clear and organized user experience.
    *   All pages are fully responsive, stacking layouts on smaller screens for excellent mobile usability.
    *   **Responsive Invoice Editor:** The invoice editor is optimized for mobile devices. The "From" address fields are hidden to save space, as this information is automatically populated from user settings. A "Preview Invoice" button is available, which opens a modal to display a live preview of the invoice.
    *   **Responsive Landing Page:** The landing page is now fully responsive, with a mobile-first design that includes a hamburger menu for easy navigation on smaller screens.
    *   **Responsive Invoice View:** The `InvoiceView` is now fully responsive, with a mobile-first design that adapts the layout, font sizes, and table structure for a clear and user-friendly experience on all screen sizes.
    *   Clean dashboard for viewing and managing invoices.
    *   **Improved Address Fields:** The layout of address fields in both the invoice editor and user settings has been improved by placing the zip code on a new line for better visibility and user experience.
*   **UI Libraries:** The project utilizes a hybrid approach to its UI. While most of the application features a custom design system, some components, such as the main app layout (`App.vue`) and the invoice template (`InvoiceTemplate.vue`), are built with **Vuetify** to leverage its rich component library.
*   **Theme:**
    *   A primary color of `#4A90E2` is used for branding and interactive elements within Vuetify components.
    *   A light background (`#F9FAFB`) with white cards provides a clean and professional look.
    *   Scoped styles are used within Vue components to prevent style conflicts.

### Meta Tags & SEO

*   **Meta Title:** Swift Invoice | Effortless Invoicing for Freelancers & Small Businesses
*   **Meta Description:** "Swift Invoice is a simple, pay-as-you-go invoicing solution for freelancers and small businesses. Create, customize, and download professional PDF invoices for just $1 per invoice. No subscriptions, no hidden fees. Track payments and manage your cash flow effortlessly. Get started today!"
*   **Keywords:** small business invoicing, freelance invoicing, invoice generator, online invoicing software, create invoices online, pay-per-invoice, invoice tracking, professional invoices, Vue.js invoice app, Firebase invoicing.

## Current Task: Final Deployment

### Plan

1.  **PDF Readability:** The font sizes within the `InvoiceTemplate.vue` component have been increased to improve the readability of the generated PDFs.
2.  **Build Application:** The application will be built for production using `npm run build`.
3.  **Deploy to Firebase:** The final application will be deployed to Firebase Hosting for public access.
