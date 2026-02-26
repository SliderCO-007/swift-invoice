# Project Blueprint

## Overview

This project is a Vue.js application that allows users to create, manage, and send invoices. It is built with the Composition API, TypeScript, and Vite, and it uses Firebase for authentication and database services. The application provides a free tier for users to create a limited number of invoices and paid tiers for unlimited invoices and additional features.

## Implemented Features

*   **Authentication:** Users can register and log in to the application.
*   **Professional User Interface:** The user interface maintains a professional tone. Personalized greetings and emojis have been removed from the dashboard to align with this standard.
*   **Dashboard Layout:**
    *   The `InvoiceStats` component is located in the main content area of the dashboard, providing a clear, responsive overview of key invoice metrics.
*   **Advanced Invoice List:**
    *   The main dashboard features a powerful data table for listing all invoices and quotes.
    *   All columns are sortable, including a custom, logical sort order for the "Status" column (Overdue > Pending > Quote > Paid > Draft).
*   **Invoice & Quote Management:**
    *   Users can create, edit, and view invoices with "Pending," "Paid," or "Overdue" statuses.
    *   Users can create quotes, which can be converted into "Pending" invoices.
*   **Customer Management:** Users can add and manage customer information.
*   **Item Management:** Users can save and manage frequently used invoice items.
*   **Robust PDF Generation:**
    *   Users can download invoices and quotes as multi-page PDF files.
    *   The generation logic dynamically sizes the output to prevent content from being truncated.
*   **Email Integration:** Paid users can email invoices directly to clients.
*   **Stripe Integration:** The application uses Stripe for subscription payments.
*   **Multiple Invoice Templates:** The application includes three professionally designed invoice templates: 'Classic', 'Modern', and 'Corporate'.

## Current Task

All recent tasks are complete. Ready for the next request.
