# Swift Invoice Blueprint

## Overview

Swift Invoice is a modern, web-based invoicing application designed for freelancers and small businesses. It provides a simple and efficient way to create, manage, and send professional invoices. The application is built with Vue.js, Vite, and Firebase, and it leverages modern design principles to provide a clean and intuitive user experience.

## Features

### Invoicing

*   **Create Invoices:** Users can create new invoices with details such as client information, line items, tax rates, and due dates.
*   **Dynamic Line Items:** The invoice editor supports both selecting from a list of saved items and entering new, custom line items on the fly. When a saved item is selected, its price is automatically populated.
*   **Invoice Numbering:** Invoices are automatically assigned a unique, sequential invoice number.
*   **Status Tracking:** Invoices can be marked as "Paid," and the status is visually reflected in the UI.
*   **Real-Time Updates:** Dashboard statistics update instantly when an invoice is deleted.
*   **WYSIWYG PDF Generation:** Users can download or email a pixel-perfect PDF of any invoice that exactly matches the in-browser preview.
*   **Email Invoices:** Users can send PDF invoices directly to clients. The sender is set to `no-reply@swiftinvoice.biz`.
*   **QR Code Payments:** The invoice editor allows users to toggle the inclusion of a QR code for payments.

### User Management

*   **Authentication:** Users can sign up and log in using email/password or their Google account.
*   **User Profiles:** Each user has a profile in Firestore that stores their name, email, and subscription status.

### Subscriptions

*   **Subscription Plans:** The application offers a "Free" plan and paid "Pro" and "Business" plans.
*   **Stripe Integration:** Stripe Checkout is used to handle subscription payments.
*   **Webhook Handling:** A cloud function handles Stripe webhooks to update user subscription status in Firestore.

### Design and Styling

*   **Component-Based:** The UI is built with Vue.js Single File Components.
*   **Scoped Styles:** Each component has its own scoped styles to prevent CSS conflicts.
*   **Modern Design:** The application features a clean, modern design with a focus on user experience.
*   **Consistent Styling:** The delete button for line items has a consistent, prominent style across all screen sizes for clear user affordance.

## Current Task: Responsive Landing Page Adjustments

### Problem

The "Take a tour" button on the `LandingPage.vue` component needed to be hidden on mobile devices.

### Solution

Applied Vuetify's responsive display classes (`d-none` and `d-md-block`) to the `div` element containing the button. This hides the element on mobile screens (`xs` and `sm`) and displays it on medium screens and larger (`md`, `lg`, `xl`), effectively making it visible only on desktops.

## Previous Tasks

### Final UI Polish for Invoice Editor

*   **Problem:** The delete icon for each line item was not vertically centered, and its styling was inconsistent across devices.
*   **Solution:** The `align="center"` prop was added to the `<v-row>` for vertical alignment, and the button's styling was made globally consistent by moving it out of a mobile-only media query.

### Fix Line Item Input Bug in Invoice Editor

*   **Problem:** The line item `<v-combobox>` was not correctly retaining user input.
*   **Solution:** The component's logic was refactored to use a simpler data model, binding directly to the `item.description` string.

### Fix Real-Time Update for Invoice Deletion

*   **Problem:** `InvoiceStats.vue` was not updating in real time when an invoice was deleted.
*   **Solution:** Manually removed the deleted invoice from the local `invoices` array in `Dashboard.vue`.
