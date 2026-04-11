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

## Current Action Plan: Convert Reviews Marquee to v-carousel

### Goal
Replace the CSS-based scrolling marquee used for user reviews with a sophisticated, responsive Vuetify `v-carousel` component to improve usability and maintain theme consistency.

### Steps
1. **Component Template Refactor:** Removed the duplicate `.marquee` DOM elements and replaced them with a single `<v-carousel>` integrating `<v-carousel-item>`.
2. **Carousel Configuration:** Configured the carousel with `hide-delimiters`, `cycle` (interval 5000ms), and custom navigation arrows (`show-arrows="hover"`). Added responsive height support and fixed alignments.
3. **CSS Cleanup:** Removed the legacy scrolling keyframes and redundant styles (`@keyframes scroll`, `.marquee-container`, `.marquee`) from the `LandingPage.vue` styles.
4. **Card Adjustments:** Optimized `.review-card` to expand gracefully up to 600px widths and act as a standalone layout element when centered inside a carousel item.

### Status
- **Completed:** The horizontal scrolling marquee is now replaced with a `v-carousel`, cleanly showcasing individual reviews without overlapping or duplication bugs.
