# Project Blueprint

## Overview

This project is a Vue.js application that allows users to create, manage, and send invoices. It is built with the Composition API, TypeScript, and Vite, and it uses Firebase for authentication and database services. The application provides a free tier for users to create a limited number of invoices and paid tiers for unlimited invoices and additional features.

## Implemented Features

*   **Authentication:** Users can register and log in to the application.
*   **Invoice Management:** Users can create, edit, and view invoices.
*   **Customer Management:** Users can add and manage customer information.
*   **Item Management:** Users can save and manage frequently used invoice items.
*   **PDF Generation:** Users can download invoices as PDF files.
*   **Stripe Integration:** The application uses Stripe for subscription payments.
*   **Multiple Invoice Templates:** The application now includes three professionally designed invoice templates for paid subscribers.

## Current Task: Refine Feature Section Styles

**Goal:** To enhance the design of the categorized feature list on the landing page.

**Plan:**

1.  **Add Icons to Titles:** A decorative `v-icon` has been added before each category title to add visual interest.
2.  **Center Titles on Mobile:** The category titles are now centered on mobile viewports for a more balanced layout.
3.  **Align Title Content:** The category titles now use flexbox to ensure proper alignment between the icon and the text.
