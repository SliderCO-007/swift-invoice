# ScanGo Invoice Blueprint

## Overview
ScanGo Invoice is a modern, responsive Vue.js application that allows users to create, send, and track professional invoices. It features multiple invoice templates, PDF generation, instant payments via Venmo QR codes, and a generous free tier for users.

## Current Application State
- **Core Functionality:** User authentication, invoice creation with line items, tax calculation, client management.
- **Templates:** Classic, Modern, and Corporate invoice styles.
- **Features:** 
  - Venmo QR code integration for instant payments.
  - "Scan or click to pay" feature for QR codes.
  - PDF generation and email sending.
  - Simple client and item management.
- **Design:** Modern aesthetics with Vuetify components, responsive grid layouts, and custom CSS styling.

## Action Plan: Replacing Template Cards with Images

### Goal
Replace the CSS-styled template placeholder cards on the Landing Page with actual PNG images of the three existing templates.

### Proposed Steps
1. **Update DOM Elements:** Replace `<div class="template-card">` with `<img src="...">` tags pointing to the user-provided PNG files (`template_classic.png`, `template_modern.png`, `template_corporate.png`).
2. **Update CSS:** Alter the `.template-card` CSS class to include `object-fit: cover` and `object-position: top` to realistically crop the invoices, and remove previous flex and text-styling properties.
3. **Enhance Hover Details:** Update template card CSS hover effects to scale individual hovered cards massively, reset rotation, and bring them to the foreground (`z-index: 10`) allowing users to easily inspect their details. Non-hovered cards fade slightly to focus attention. On mobile, `tabindex` allows a tap-to-expand effect scaling to exactly 2.2x and centering perfectly on screen.
4. **QR Code Image & Magnification:** Replace the `.qr-mockup` placeholder text and icon with the `venmo-qr-with-logo.png` image. The base size is reduced by 30% for a cleaner layout, while an enhanced hover action scales the element to 1.3x its size to fully showcase the image and logo quality on desktop. This hover is safely disabled on mobile.
5. **PDF Mockup Animation:** Replace the `.pdf-mockup` placeholder with the `ScanGo_click_send_2.gif` animated image. The hover interaction is adjusted to remove rotation and increase drop shadow for a more premium, grounded presentation.

### Status
- **Completed:** HTML replaced, base CSS updated, image files added by user and linked, hover magnification implemented for templates and QR code.
