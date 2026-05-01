# ScanGo Invoice Blueprint

## Overview
ScanGo Invoice is a modern, responsive Vue.js application that allows users to create, send, and track professional invoices. It features multiple invoice templates, PDF generation, and instant online payments via Stripe Connect.

## Application Architecture & Design System
- **Core Functionality:** User authentication, invoice creation with line items, tax calculation, client management.
- **Templates:** Classic, Modern, Corporate, and Solid invoice styles.
- **Features:** 
  - Stripe Connect integration for instant online payments (credit cards, Apple Pay, Google Pay, ACH).
  - "Scan or click to pay" QR code powered by Stripe (shown only when merchant's Stripe account has charges enabled).
  - PDF generation and email sending.
  - Simple client and item management.
- **Design System (v2 Dark Theme):** 
  - The application has been upgraded to a premium, glassmorphic dark theme.
  - **Base Background:** Deep navy `#111d2f` perfectly matching the hero image.
  - **Typography:** Light text (`#f1f5f9`, `#fff`) with softer secondary colors (`#94a3b8`, `#e2e8f0`).
  - **Glassmorphism:** Cards, dialogs, and panels utilize slightly transparent white backgrounds (`rgba(255, 255, 255, 0.03)`), borders (`rgba(255, 255, 255, 0.08)`), and backdrops (`blur(16px)`).
  - **Glow & Interactions:** Soft drop shadows (`rgba(0,0,0,0.4)`) and glowing interactive elements using the primary brand color to build depth.

## Current Action Plan: Remove Venmo as a Payment Option

### Goal
Remove all Venmo-related functionality from the application in preparation for a new feature set.

### Steps
1. **`useUserSettings.js`**: Removed `venmoQrUrl` and `venmoUsername` from the default settings object. Removed the `generateVenmoQR` Firebase Function call from `saveUserSettings`. Cleaned up unused `functions` and `httpsCallable` imports.
2. **`UserSettings.vue`**: Removed the Venmo Fallback Username form field, the Venmo help dialog, the `.venmo-label` CSS class, and the `isHelpDialogVisible` ref. Updated success message.
3. **`InvoiceEditor.vue`**: Removed `includeVenmoQr` from the `createFreshInvoice` data model and removed the "Payment Options" section with the QR code toggle switch.
4. **`InvoiceTemplate.vue`** (Classic), **`InvoiceTemplate2.vue`** (Modern), **`InvoiceTemplate3.vue`** (Corporate), **`InvoiceTemplate4.vue`** (Solid): Simplified `paymentUrl` and `paymentQrImageUrl` computed properties to only handle Stripe. Updated `v-if` on the QR block to only show when `chargesEnabled`. Removed all Venmo-specific alt text and labels.
5. **`LandingPage.vue`**: Updated hero subtitle, "Get Paid Your Way" step card (replaced Venmo QR pill with ACH/Bank pill), final CTA text, FAQs (removed Venmo FAQ, updated payout/security answers), and SEO meta description. Removed `.payment-pill.venmo` CSS rule.

### Status
- **Completed**: All Venmo references have been removed from the frontend codebase. Payment functionality now exclusively uses Stripe Connect.
