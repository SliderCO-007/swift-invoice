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

## Current Action Plan: Social Proof Integration

### Goal
Enhance user trust on the landing page by elevating social proof elements from the footer directly into the primary viewing areas, including the hero section.

### Steps
1. **Hero Avatar Group (`LandingPage.vue`)**: Added a 5-star rating summary and an avatar group ("Loved by 2,000+ users") directly underneath the main Hero CTAs.
2. **Review Navigation (`LandingPage.vue`)**: Made the new hero social proof badge clickable, smoothly scrolling users down to the dedicated review section.
3. **Trustpilot Elevation (`LandingPage.vue`, `TrustpilotWidget.vue`)**: Moved the Trustpilot component higher up on the landing page to sit prominently above the reviews carousel. Updated the widget configuration to `data-theme="dark"` so it blends flawlessly into the app's `#111d2f` premium dark theme.

### Status
- **Completed**: Landing page now prominently features quantitative social proof in the hero and elevated Trustpilot credibility over the customer review carousel.
