# Swift Invoice Blueprint

## Overview

Swift Invoice is a web-based application designed to simplify the process of creating, managing, and tracking professional invoices. It provides a user-friendly interface for freelancers, small businesses, and contractors to generate beautiful, customized invoices, manage client information, and keep track of payments. The application is built with Vue.js and Firebase, offering a fast, secure, and real-time experience.

## Features & Design

### Core Functionality

*   **Invoice Management:**
    *   Create, edit, and delete invoices.
    *   View a list of all invoices with their status (Paid, Pending, Draft).
    *   View a complete and detailed invoice, including all line items.
    *   Mark invoices as paid.
    *   Responsive invoice editor with a live preview.
    *   **User-Specific Sequential Invoice Numbers:** Each user has their own independent invoice counter, ensuring a professional and sequential numbering system that is unique to their account.
    *   **Invoice Editor Enhancements:**
        *   **Auto-population:** The "From" address and tax rate are automatically and reliably populated from user settings when creating a new invoice.
*   **User Settings:**
    *   Save company information (name, address, email).
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
    *   Clean dashboard for viewing and managing invoices.
*   **Theme:**
    *   A primary color of `#4F46E5` is used for branding and interactive elements.
    *   A light background (`#F9FAFB`) with white cards provides a clean and professional look.
    *   A consistent and unified design is maintained across all components, including forms, buttons, and layouts.
    *   Scoped styles are used within Vue components to prevent style conflicts.

## Current Plan: Multi-Tenant Invoice Counter

*   **Objective:** Refactor the application to support multiple users by moving the global invoice counter to a user-specific counter.
*   **Problem Diagnosis:** The previous implementation used a single, global counter for all invoices. This would cause conflicts and incorrect invoice numbers in a multi-user environment.
*   **Changes Implemented:**
    *   **Updated `useUserSettings.js`:** The `invoiceCounter` field was added to the default user settings structure, initializing it for each user.
    *   **Refactored `useInvoices.js`:** The `createInvoice` function was significantly updated. It now uses a Firestore transaction to safely read, increment, and write the `invoiceCounter` directly within the current user's settings document.
    *   **Removed Global Counter:** The old, global `counters` collection is no longer used, and all invoice number generation is now handled on a per-user basis.

This architectural change is critical for scalability and ensures that each user has a private and correct invoice numbering sequence.
