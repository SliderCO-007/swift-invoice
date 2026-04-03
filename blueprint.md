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

## Current Action Plan: Password Reset Flow

### Goal
Implement a password reset system so users who forgot their passwords can easily regain access to their accounts.

### Steps
1. **Composable Update:** Added `sendPasswordResetEmail`, `verifyPasswordResetCode`, and `confirmPasswordReset` from `firebase/auth` and created corresponding functions (`resetPassword`, `verifyResetCode`, `confirmReset`) in `src/composables/useAuth.js`.
2. **Route Creation:** Added `/reset-password` and `/auth/action` routes pointing to their respective components.
3. **UI Components:** 
   - Created `ResetPasswordPage.vue` incorporating the existing glassmorphic dark theme and connected it to the `resetPassword` composable function.
   - Created `ActionHandlerPage.vue` to handle the email redirect, displaying a form to verify the new password and complete the reset.
   - **Password Visibility Toggle:** Implemented an "eye" icon toggle on `LoginPage.vue`, `RegisterPage.vue`, and `ActionHandlerPage.vue` allowing users to view the passwords they type.
4. **Login Link:** Added an inline "Forgot?" link on the `LoginPage.vue` above the password input field.

### Status
- **Completed:** The password reset flow is fully implemented and styled.
