# Swift Invoice Blueprint

## Overview

Swift Invoice is a web-based application designed to simplify the process of creating, managing, and tracking professional invoices. It provides a user-friendly interface for freelancers, small businesses, and contractors to generate beautiful, customized invoices, manage client information, and keep track of payments. The application is built with Vue.js and Firebase, offering a fast, secure, and real-time experience.

## Features & Design

### Core Functionality

*   **Invoice Management:**
    *   Create, edit, and delete invoices.
    *   View a list of all invoices with their status (Paid, Pending, Draft).
    *   Mark invoices as paid.
    *   Responsive invoice editor with a live preview.
*   **User Settings:**
    *   Save company information (name, address, email).
    *   Set a default tax rate.
    *   Upload a company logo through a stylish, circular uploader with a live preview.
    *   A dedicated, responsive settings page with a clean and modern design.
*   **Authentication:**
    *   Secure user authentication with Firebase Auth.
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

## Current Plan: User Settings Page Redesign

*   **Objective:** Redesign the `UserSettings.vue` component to align with the application's light theme and improve user experience.
*   **Changes Implemented:**
    *   Replaced the previous Vuetify-based design with a custom-built layout using standard HTML elements.
    *   Applied the application's established light theme, using consistent CSS variables for colors, fonts, and spacing.
    *   Structured the form in a responsive two-column grid, which collapses to a single column on smaller screens for better accessibility.
    *   Introduced a visually appealing circular logo uploader with a preview, which moves to the top of the page on mobile devices for a better workflow.
    *   Ensured the overall design is now consistent with the `InvoiceEditor.vue` and other parts of the application, creating a more cohesive user experience.
