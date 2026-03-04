
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

## 4. Current Task: Update Subscription Flow

The following steps have been taken to update the subscription flow:

1.  **Update Pricing Page:** The pricing page in `src/components/PricingPage.vue` has been updated to redirect non-logged-in users to the registration page instead of the login page.
2.  **Update Registration Page:** The registration page in `src/components/RegisterPage.vue` has been updated to handle redirects, ensuring users are returned to their original destination after signing up.
3.  **Automate Subscription Flow:** The `PricingPage.vue` component now automatically initiates the checkout process by reading the `plan` from the URL query parameters upon redirection after login or registration.
4.  **Fix Cancellation Flow:** The `cancelUrl` in `src/components/PricingPage.vue` has been updated to correctly redirect users to the `/payment-cancel` page, which displays a confirmation message, preventing the previous authentication error.
5.  **Fix Auth Race Condition:** The `PaymentCancel.vue` component has been updated to wait for the authentication check to complete before rendering, preventing a race condition that caused a blank page and a permissions error on redirect.
6.  **Fix Persistent Auth Race Condition:** The authentication logic in `src/composables/useAuth.js` has been refactored to prevent a race condition on redirects. The process was split into two stages: first, confirming authentication status, and second, fetching user data only after authentication is confirmed. This was orchestrated by calling an `init()` function from `App.vue`.

