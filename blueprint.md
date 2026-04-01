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

## Current Action Plan: Dark Theme Redesign

### Goal
Redesign the theme of the application to feature a seamless, modern dark background that matches the `branded_hero_v7.png` (`#111d2f`). Apply this aesthetic globally across the Landing Page, Pricing Page, and Register Page.

### Steps
1. **Analyze Hero Image:** Extracted the hex code `#111d2f` from the top-left pixel.
2. **Landing Page Flip:** Swapped hero to `branded_hero_v7.png`. Darkened the site background to `#111d2f`. Replaced all white component blocks with sleek glassmorphic surfaces (`backdrop-filter`) and inverted typography colors to light shades.
3. **Pricing Page Update:** Modified `PricingPage.vue` to adopt `#111d2f` and applied matching CSS to Vuetify cards.
4. **Register Page Update:** Updated `RegisterPage.vue` container, input fields, and UI elements to seamlessly fit the dark ecosystem.
5. **Blueprint Update:** Updated documentation to reflect the new global design constraints.

### Status
- **Completed:** All requested pages are now fully upgraded to the dark theme glassmorphism design language.
