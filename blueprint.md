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

## Current Action Plan: Landing Page Optimization

### Goal
Refine the landing page by condensing the steps layout and updating the hero messaging to a more direct and cohesive copy.

### Steps
1. **Hero Text Update:** Change the title copy to "Made Effortless" and the subtitle to a punchy single sentence summarizing invoice creation, billing, and QR payments.
2. **CTA Restructure:** Swapped the CTA buttons so that "Start Invoicing for Free" is the primary solid button, making the free aspect more predominant, and "Sign up with Google" is the secondary outlined button.
3. **Template Restructure:** Remove the `.steps-grid` and 3 individual step cards from `LandingPage.vue`.
4. **Compact Component:** Insert a single horizontally-flowing `.compact-steps` container highlighting the 3 quick steps (`Input Details`, `Customize Design`, `Deliver & Track`).
5. **CSS Clean-up:** Purge dead CSS related to the old numbers and grid, and implement modern flexbox styles with subtle glassmorphic hover effects for the new layout.

### Status
- **Completed:** The landing page now displays the refined professional copy along with the elegant, compact steps progression.
