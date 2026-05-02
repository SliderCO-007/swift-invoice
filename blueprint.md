# ScanGo Invoice Blueprint

## Overview
ScanGo Invoice is a modern, responsive Vue.js application that allows users to create, send, and track professional invoices. It features multiple invoice templates, PDF generation, instant online payments via Stripe Connect, and a full project time/expense tracking workflow.

## Application Architecture & Design System
- **Core Functionality:** User authentication, invoice creation with line items, tax calculation, client management.
- **Templates:** Classic, Modern, Corporate, and Solid invoice styles.
- **Features:** 
  - Stripe Connect integration for instant online payments (credit cards, Apple Pay, Google Pay, ACH).
  - "Scan or click to pay" QR code powered by Stripe (shown only when merchant's Stripe account has charges enabled).
  - PDF generation and email sending.
  - Simple client and item management.
  - **Project Tracking** (paid plans only): create projects, log billable/non-billable time entries and expenses with receipt photos, then convert directly to a pre-filled invoice.
- **Design System (v2 Dark Theme):** 
  - The application has been upgraded to a premium, glassmorphic dark theme.
  - **Base Background:** Deep navy `#111d2f` perfectly matching the hero image.
  - **Typography:** Light text (`#f1f5f9`, `#fff`) with softer secondary colors (`#94a3b8`, `#e2e8f0`).
  - **Glassmorphism:** Cards, dialogs, and panels utilize slightly transparent white backgrounds (`rgba(255, 255, 255, 0.03)`), borders (`rgba(255, 255, 255, 0.08)`), and backdrops (`blur(16px)`).
  - **Glow & Interactions:** Soft drop shadows (`rgba(0,0,0,0.4)`) and glowing interactive elements using the primary brand color to build depth.

## Project Tracking Feature (v3)

### New Files
- `src/composables/useProjects.js` — Singleton composable: project CRUD, subcollection entry CRUD, receipt upload to Firebase Storage, `buildInvoicePayload` bridge.
- `src/components/ProjectsView.vue` — `/projects` list page with subscription gate, status filter tabs (All/Active/Completed/Archived), and a responsive card grid.
- `src/components/ProjectEditor.vue` — `/projects/new` and `/projects/:id/edit` create/edit form.
- `src/components/ProjectDetail.vue` — `/projects/:id` working view with Time and Expenses tabs, inline forms, billable toggles, receipt upload, edit modal, and "Convert to Invoice" button.
- `src/components/ReceiptViewer.vue` — Shared receipt lightbox dialog with download link.

### Modified Files
- `src/router/index.js` — 4 new routes: `/projects`, `/projects/new`, `/projects/:id`, `/projects/:id/edit`.
- `src/components/AppBar.vue` — "Projects" added to `authNav` with `mdi-folder-multiple-outline` icon.
- `src/components/InvoiceEditor.vue` — Prefill bridge reads `history.state.invoicePrefill` to populate client, items, and notes from a project conversion.
- `firestore.rules` — Added `projects` and `projects/{projectId}/entries` rules (owner-only access).

### Data Model
- `projects/{projectId}` — userId, name, clientName, clientId, description, defaultRate, status, totalHours, totalLabor, totalExpenses, createdAt, updatedAt.
- `projects/{projectId}/entries/{entryId}` — type (time|expense), date, description, billable, hours, rate (time), amount, category, receiptUrl (expense), createdAt.
- Expense categories auto-saved to `users/{uid}/items` with `type: 'expense-category'` for typeahead reuse.

### Status
- **Completed**: All 9 build steps implemented and verified.
