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
*   **WYSIWYG PDF Generation:** Users can download or email a pixel-perfect PDF of any invoice that exactly matches the in-browser preview. The PDF generation logic is carefully designed to wait for web fonts to load, ensuring a perfect render every time.
*   **Email Invoices:** Users can send PDF invoices directly to clients. The sender is set to `no-reply@swiftinvoice.biz`.
*   **QR Code Payments:** The invoice editor allows users to toggle the inclusion of a QR code for payments.

### User Management

*   **Authentication:** Users can sign up and log in using email/password or their Google account.
*   **User Profiles:** Each user has a profile in Firestore that stores their name, email, and subscription status.

### Subscriptions

*   **Subscription Plans:** The application offers a "Free" plan and paid "Pro" and "Business" plans.
*   **Stripe Integration:** Stripe Checkout is used to handle subscription payments.
*   **Webhook Handling:** A cloud function handles Stripe webhooks to update user subscription status in Firestore.
*   **Robust Payment Verification:** A resilient polling mechanism on the payment success page waits for backend confirmation of subscription status, providing dynamic user feedback and a generous timeout to prevent premature errors.

### Analytics & Privacy

*   **Google Consent Mode v2:** The application correctly implements Google's consent mode. Consent is set to 'denied' by default, and tracking is only enabled after the user explicitly accepts.
*   **Cookie Consent Banner:** A banner is displayed to new users to obtain consent. The choice is stored in `localStorage` to persist the setting across sessions.
*   **Cookie Policy Modal:** A detailed Cookie Policy is available to users directly from the consent banner via a modal dialog, ensuring easy access without navigating away from the page.

### Design and Styling

*   **Component-Based:** The UI is built with Vue.js Single File Components.
*   **Scoped Styles:** Each component has its own scoped styles to prevent CSS conflicts.
*   **Modern Design:** The application features a clean, modern design with a focus on user experience.
*   **Responsive Navigation:** A fully responsive app bar that provides a consistent and intuitive user experience across all devices.
*   **Dynamic Hero Section:** A modern, responsive two-column hero section on the landing page that highlights the key value proposition alongside a professional, animated image composition.

## Current Task: Create Invoices from Templates

*   **Goal:** Create dark theme with icon toggle using Vuetify.


## Previous Tasks

### Implement Google Analytics with Consent Mode

*   **Goal:** Integrate Google Analytics using `vue-gtag` while correctly implementing Google Consent Mode v2.
*   **Implementation:**
    1.  **Configured `vue-gtag`:** The plugin was configured in `main.js` to set the default consent for all tracking types to 'denied'. It was also configured to use `localStorage` to persist the user's consent choice, using the key 'cookie_consent_given'.
    2.  **Created Cookie Banner:** A `TheCookieBanner.vue` component was created to inform the user about cookie usage and provide "Accept" and "Decline" options.
    3.  **Managed Consent State:** The banner is shown only if no consent choice is stored in `localStorage`. When the user clicks "Accept" or "Decline", the `acceptAll()` or `rejectAll()` functions from the `useConsent` composable are called, and the user's choice is automatically saved to `localStorage` by the plugin.

### Revert Feature Grid Layout

*   **Goal:** Restore the four-column layout for the feature cards on the landing page.
*   **Implementation:** The `features-grid` CSS was updated to use `grid-template-columns: repeat(4, 1fr);` on desktop screens. The responsive styles were also adjusted to show two columns on tablet-sized screens and a single column on mobile devices.

### Simplify Hero Section

*   **Goal:** Simplify the hero section by removing the animation and using a single, static image, while ensuring the correct content order on mobile devices.
*   **Implementation:**
    1.  **Removed Animation:** The CSS animation and the secondary `shape_gradient.png` image were removed.
    2.  **Static Image:** The hero section now uses a single, composite `hero_woman.png` image.
    3.  **Cleaned Up Code:** The `LandingPage.vue` component was updated to remove the unnecessary code, and the `shape_gradient.png` file was deleted from the project.
    4.  **Corrected Mobile Stacking:** The responsive styles were adjusted to ensure the hero content appears *above* the image on mobile devices by default.

### Redesign Landing Page Hero Section

*   **Goal:** Redesign the landing page hero section to create a cleaner, more modern, and focused user experience.
*   **Implementation:**
    1.  **Two-Column Layout:** A responsive two-column `hero-grid` was created. The left column holds the text content, and the right column contains the visual elements.
    2.  **Layered Images:** A `hero-image-container` was implemented to layer a decorative `shape_gradient.png` behind the main `hero_woman.png`. This creates a sense of depth and visual interest.
    3.  **Subtle Animation:** A CSS keyframe animation (`rotate`) was added to the `shape_gradient.png`, causing it to spin slowly. This adds a dynamic, modern feel to the page without being distracting.
    4.  **Responsive Stacking:** On mobile devices, the columns stack vertically, with the animated image appearing above the text for a strong visual introduction.

### Enhance Payment Verification

*   **Goal:** Improve the reliability and user experience of the post-payment verification screen.
*   **Implementation:** Extended the verification timeout to 60 seconds, added dynamic loading messages to keep the user informed, and made the subscription status check more flexible.

### Fix PDF Font Rendering Issue

*   **Problem:** Text in generated PDFs was overlapping and unreadable because the rendering would occur before the "Roboto" web font had fully loaded.
*   **Solution:** Added `await document.fonts.ready;` to the `generatePDF` function in `InvoiceView.vue`. This simple line ensures that `html2canvas` does not attempt to render the invoice until all necessary fonts are available, resulting in a perfect, pixel-accurate PDF.

### Enhance Navigation Menus

*   **Goal:** Improve the navigation menus to be more intuitive and visually appealing across all screen sizes.
*   **Implementation:** Refined the mobile menu, added icons to all menu items for better visual guidance, and ensured the content remains dynamic for both guest and authenticated users.
