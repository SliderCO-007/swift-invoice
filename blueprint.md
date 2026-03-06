# Swift Invoice Blueprint

## 1. Overview

Swift Invoice is a web application designed to help users create, manage, and track invoices. It provides a simple and intuitive interface for managing customers, items, and invoices, with a focus on ease of use and a clean, modern design.

## 2. Project Outline

### 2.1. Styling and Design

*   **CSS Framework:** The project uses a custom design system built with CSS variables and global styles, defined in `src/style.css`.
*   **Component Library:** Vuetify is used for UI components, with custom styling to match the application's design system.
*   **Typography:** The primary font is Poppins, imported from Google Fonts.
*   **Color Palette:**
    *   Primary: `#4A90E2` (Modern Blue)
    *   Secondary: `#50E3C2` (Vibrant Teal)
    *   Text: `#333`
    *   Background: `#F4F7F9`
*   **Layout:** The application uses a responsive layout with a maximum width of 1200px.

### 2.2. Features

*   **Authentication:** Users can register and log in to their accounts.
*   **Invoice Management:** Users can create, view, and manage invoices.
*   **Customer Management:** Users can add and manage their customers.
*   **Item Management:** Users can create and manage a list of items for use in invoices.
*   **Settings:** Users can manage their profile and application settings.
*   **Upgrade Prompt:** A prompt is displayed on the dashboard for non-subscribed users, encouraging them to upgrade.

## 3. Current Task: System Restoration and Security Fix

*   **Objective:** Restore the application to a fully functional state and patch a security vulnerability.
*   **Completed Steps:**
    1.  Fixed the `firestore.rules` to allow new users to save their first invoice.
    2.  Consolidated all global styles into `src/style.css`.
    3.  Imported `src/style.css` into `src/main.js`.
    4.  Removed the conflicting `<style>` block from `App.vue`.
    5.  **Security Fix:** Patched a vulnerability in the `sendInvoiceEmail` cloud function to prevent non-subscribed users from sending emails.
    6.  **UI Restoration:** Restored the `UpgradePrompt` component on the `Dashboard.vue` to ensure non-subscribed users are prompted to upgrade their accounts.
