# Swift Invoice Blueprint

## Overview

Swift Invoice is a web-based application designed to simplify the process of creating, managing, and tracking professional invoices. It provides a user-friendly interface for freelancers, small businesses, and contractors to generate beautiful, customized invoices, manage client information, and keep track of payments. The application is built with Vue.js and Firebase, offering a fast, secure, and real-time experience.

## Features & Design

### Core Functionality

*   **Invoice Management:**
    *   Create, edit, and delete invoices.
    *   View a list of all invoices with their status (Paid, Pending, Draft).
    *   View a complete and detailed invoice, including all line items.
    *   **Mark as Paid:** Users can mark an invoice as "Paid" with a single click from the invoice view. The status is updated in real-time, and the button is disabled if the invoice is already paid to prevent accidental updates.
    *   Responsive invoice editor with a live preview.
    *   **User-Specific Sequential Invoice Numbers:** Each user has their own independent invoice counter, ensuring a professional and sequential numbering system that is unique to their account.
    *   **Invoice Editor Enhancements:**
        *   **Auto-population:** The "From" address and tax rate are automatically and reliably populated from user settings when creating a new invoice.
        *   **Date Formatting:** Fixed a bug where dates were not being correctly formatted in the invoice editor, ensuring a smooth user experience.
    *   **Dashboard Improvements:**
        *   The invoice card header on the dashboard now displays the `invoiceNumber` for better readability, rather than the internal document ID.
        *   Fixed a bug where the due date on the dashboard was incorrectly displayed as "No due date." The date formatting logic has been improved to correctly handle multiple date formats.
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

### Design & Styling

*   **Layout:**
    *   Modern, two-column layouts for both the invoice editor and user settings pages, providing a clear and organized user experience.
    *   All pages are fully responsive, stacking layouts on smaller screens for excellent mobile usability.
    *   **Responsive Landing Page:** The landing page is now fully responsive, with a mobile-first design that includes a hamburger menu for easy navigation on smaller screens.
    *   **Responsive Invoice View:** The `InvoiceView` is now fully responsive, with a mobile-first design that adapts the layout, font sizes, and table structure for a clear and user-friendly experience on all screen sizes.
    *   Clean dashboard for viewing and managing invoices.
    *   **Improved Address Fields:** The layout of address fields in both the invoice editor and user settings has been improved by placing the zip code on a new line for better visibility and user experience.
*   **UI Libraries:** The project utilizes a hybrid approach to its UI. While most of the application features a custom design system, some components, such as the main app layout (`App.vue`) and the invoice template (`InvoiceTemplate.vue`), are built with **Vuetify** to leverage its rich component library.
*   **Theme:**
    *   A primary color of `#4A90E2` is used for branding and interactive elements within Vuetify components.
    *   A light background (`#F9FAFB`) with white cards provides a clean and professional look.
    *   Scoped styles are used within Vue components to prevent style conflicts.
