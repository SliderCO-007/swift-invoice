
# Project Blueprint: ScanGo Invoice

## 1. Overview

This document outlines the plan for rebranding the existing invoice management application to "ScanGo Invoice." The goal is to create a modern, intuitive, and visually appealing application for managing invoices.

## 2. Design and Style Guide

### 2.1. Visual Identity

*   **Logo:** The existing logo will be reused.
*   **Color Palette:** The existing color palette will be used.
*   **Typography:** Expressive and relevant typography will be used to emphasize key information and improve readability.
*   **Iconography:** Modern and interactive icons will be used to enhance usability and visual appeal.
*   **Visual Effects:** Subtle drop shadows and a "glow" effect on interactive elements will be used to create a sense of depth and interactivity.

### 2.2. Layout and Structure

*   **Responsive Design:** The application will be fully responsive and accessible on all devices.
*   **Intuitive Navigation:** A clear and intuitive navigation structure will be implemented to ensure a seamless user experience.
*   **Clean and Balanced Layout:** A clean and visually balanced layout with ample white space will be used to improve readability and reduce cognitive load.

## 3. Features

### 3.1. Core Features

*   **Invoice Management:** Create, edit, and manage invoices.
*   **Customer Management:** Add, edit, and manage customer information.
*   **Item Management:** Add, edit, and manage products and services.
*   **Stripe Integration:** Process payments securely through Stripe.
*   **User Authentication:** Secure user authentication and authorization.
*   **Dashboard:** A comprehensive dashboard with key metrics and insights.

### 3.2. New and Improved Features

*   **Redesigned User Interface:** A modern and intuitive user interface will be designed to improve the user experience.
*   **Improved Performance:** The application will be optimized for speed and performance.
*   **Enhanced Accessibility:** The application will be made more accessible to users with disabilities.
*   **New Branding:** The application will be rebranded as "ScanGo Invoice" with a new logo and visual identity.

## 4. Completed Tasks

The following tasks have been completed:

1.  **Update Subscription Flow:** The subscription flow was updated to improve user experience by handling redirects after registration and automatically applying subscription plans.
2.  **Fix Auth Race Conditions:** The authentication logic was refactored to prevent race conditions during redirects, ensuring a smoother user experience.

## 5. Current Task: Refactor Loading Logic in InvoiceView

The following steps will be taken to improve the loading user experience in `InvoiceView.vue` and prevent a flash of the "Not Found" message:

1.  **Refactor Loading State:** The previous `isDisplayLoading` and `Promise.all` logic will be removed.
2.  **Implement Local Loading State:** A new reactive state variable, `isLoading`, will be introduced and initialized to `true`.
3.  **Ensure `isLoading` is Updated:** The `onMounted` hook will be refactored to use a `try...finally` block. This guarantees that `isLoading` is set to `false` only after the entire data-fetching process (including any errors) is complete.
4.  **Update Template:** The template will be updated to conditionally render the loading spinner based on the `isLoading` state. The rest of the content (the invoice, error message, or "not found" message) will only be rendered *after* the loading process is finished.
