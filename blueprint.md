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

## Current Action Plan: FAQ Integration & Features Route

### Goal
Move the existing landing page features grid into a dedicated `/features` route and replace the main page space with an interactive FAQ section.

### Steps
1. **Features Page (`FeaturesPage.vue`)**: Extracted all landing page features HTML and CSS into a dedicated route.
2. **Routing Update**: Appended `{ path: '/features', component: FeaturesPage }` to Vue Router and updated `AppBar.vue` links perfectly.
3. **FAQ Component**: Inserted a `v-expansion-panels` element heavily customized with glassmorphic `<v-expansion-panel>` styling across `LandingPage.vue`.
4. **Objection Handling**: Implemented a 15-item array containing precisely tailored messaging addressing buyer frictions around QR functionality, costs, and templates.

### Status
- **Completed**: The landing page now hosts a sleek collapsible FAQ, pushing deep-dive explorers into the new Features view via updated header navs.
