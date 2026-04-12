# ScanGo Invoice Blueprint

## Overview
ScanGo Invoice is a modern, responsive Vue.js application that allows users to create, send, and track professional invoices. It features multiple invoice templates, PDF generation, instant payments via Venmo QR codes, and a generous free tier for users.

## Application Architecture & Design System
- **Core Functionality:** User authentication, invoice creation with line items, tax calculation, client management.
- **Templates:** Classic, Modern, and Corporate invoice styles.
- **Features:** 
  - Venmo QR code integration for instant payments.
  - "Scan or click to pay" feature for QR codes.
  - PDF generation and email sending.
  - Simple client and item management.
- **Design System (v2 Dark Theme):** 
  - The application has been upgraded to a premium, glassmorphic dark theme.
  - **Base Background:** Deep navy `#111d2f` perfectly matching the hero image.
  - **Typography:** Light text (`#f1f5f9`, `#fff`) with softer secondary colors (`#94a3b8`, `#e2e8f0`).
  - **Glassmorphism:** Cards, dialogs, and panels utilize slightly transparent white backgrounds (`rgba(255, 255, 255, 0.03)`), borders (`rgba(255, 255, 255, 0.08)`), and backdrops (`blur(16px)`).
  - **Glow & Interactions:** Soft drop shadows (`rgba(0,0,0,0.4)`) and glowing interactive elements using the primary brand color to build depth.

## Current Action Plan: Solid Invoice Template & Theme Customization

### Goal
Add a primary theme color selector and introduce a new "Solid" template to complement the updated "Corporate" template.

### Steps
1. **State & Settings Update:** Added `primaryColor: '#1a3a52'` to default settings in `useUserSettings.js` and exposed an HTML5 color picker within `UserSettings.vue`.
2. **Editor Support:** Integrated the `primaryColor` selector inside `InvoiceEditor.vue` only visible when using the Corporate or Solid styles. Added the "Solid" template to the radio selector options.
3. **Template Customization:** 
   - **Corporate (`InvoiceTemplate3.vue`):** Updated the header background to use a `linear-gradient` that blends the custom `primaryColor` into the application's secondary highlight `#2c5aa0` with dynamically matching bottom borders.
   - **Solid (`InvoiceTemplate4.vue`):** Extrapolated the corporate style into a new standalone template applying only solid variations of the `primaryColor`.

### Status
- **Completed:** Settings apply globally across the platform and properly override dynamic inline styles for newly created and existing invoices.
