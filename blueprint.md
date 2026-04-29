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

## Current Action Plan: Update Landing Page FAQs

### Goal
Update the Frequently Asked Questions (FAQs) content on the landing page to accurately reflect current features, such as Stripe payment processing, Venmo backup, and account requirements.

### Steps
1. **Update Content (`LandingPage.vue`)**: Modified the `faqs` reactive reference within the setup script to contain the new set of six targeted questions and answers.
2. **Schema Integration**: Because the `faqSchema` maps directly over the `faqs.value` array, updating the `faqs` reference automatically updates the JSON-LD schema generated for SEO without requiring structural changes to `faqSchema`.

### Status
- **Completed**: The landing page now displays the updated, Stripe-and-Venmo-focused FAQs both visually on the page and systematically within the page metadata.
