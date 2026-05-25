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

## Bug Fixes
### Date Picker Timezone Defect
- Addressed timezone offset issue in `ProjectDetail.vue` and `useProjects.js` where UTC parsing of local `YYYY-MM-DD` strings resulted in an off-by-one day display bug. Fixed `useProjects.js` to keep `YYYY-MM-DD` dates as strings rather than Date objects, and updated `ProjectDetail.vue` generators/formatters to explicitly handle local dates without unwanted timezone shifts.

## Enhancements
### Landing Page Visuals
- Added a dynamic iPhone frame overlay to the hero section (`LandingPage.vue`) that plays `ScanGo_convert_project_01.gif`. The animation is configured to loop exactly 3 times before fading out gracefully via Vue transitions.

## Video Player Integration (v4)

### Purpose
Introduce a high-converting, privacy-respecting "Getting Started" YouTube video modal directly on the landing page so users can see the product in action without being redirected away from the signup funnel.

### Proposed Changes
#### [MODIFY] [LandingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/LandingPage.vue)
- Replace "Download Setup Guide" button in the Hero section with "Watch 2-Min Demo" primary brand button.
- Declare `videoDialogOpen` and `youtubeId` in `<script setup>`.
- Add custom methods `openVideoModal` and `closeVideoModal` to manage play state and tracking.
- Embed a `v-dialog` modal containing a responsive, privacy-compliant iframe (`youtube-nocookie.com`) to load and play the video.
- Add CSS styling for responsive video wrapper and modal card glassmorphism.

## Freemium Funnel & Onboarding Optimization (v5)

### Purpose
Maximize learning velocity, drive free plan signups, and seamlessly guide users to realize the value of Project Tracking (billable hours & expense entries) to accelerate Pro subscription upgrades.

### Proposed Changes
#### [NEW] [OnboardingChecklist.vue](file:///C:/Users/curth/git/swift-invoice/src/components/OnboardingChecklist.vue)
- Create a beautiful glassmorphic onboarding checklist widget with completed task states stored in local storage per user profile UID.
- Checklist actions: Create first project, log first entry, convert/preview invoice.

#### [MODIFY] [Dashboard.vue](file:///C:/Users/curth/git/swift-invoice/src/components/Dashboard.vue)
- Add `<OnboardingChecklist />` at the top of the main workspace dashboard for users on the free tier.

#### [MODIFY] [ProjectsView.vue](file:///C:/Users/curth/git/swift-invoice/src/components/ProjectsView.vue)
- Replace hard upgrade paywall with a freemium limit (1 active project allowed).
- Add header banners alerting free users of the "Taste Test" limit.
- Prevent free users from creating > 1 project and trigger the Upgrade Modal on clicks.

#### [MODIFY] [ProjectDetail.vue](file:///C:/Users/curth/git/swift-invoice/src/components/ProjectDetail.vue)
- Track time and expense entry count: Limit free users to 3 entries before prompting Pro subscription.
- Intercept "Convert to Invoice" clicks for free users and redirect them to the upgrade screen.

#### [MODIFY] [ProjectEditor.vue](file:///C:/Users/curth/git/swift-invoice/src/components/ProjectEditor.vue)
- Prevent free users from accessing the project creation route if they already have one project.

#### [NEW] [AlternativesPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/AlternativesPage.vue)
- Create comparative marketing layout for Harvest, FreshBooks, and Toggl comparisons.
- Highlight the dark mode styling and Stripe Connect direct bank pay features.

#### [MODIFY] [router/index.js](file:///C:/Users/curth/git/swift-invoice/src/router/index.js)
- Register route `/alternatives/:competitor` to render comparison pages.

## Landing Page & Onboarding Funnel CRO Optimization (v6)

### Purpose
Optimize the landing page and welcome email funnel for high-converting Meta Ads traffic. This is achieved by establishing equal visual prominence for the registration CTAs, demoting the distracting video CTA, deferring heavy GIF loading on mobile to maximize page speed, and adding the quick-start video to the post-signup welcome email.

### Proposed Changes
#### [MODIFY] [LandingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/LandingPage.vue)
- Restructure the registration buttons to display Google and Email Sign-in with equal visual prominence, styling both as premium glowing buttons of equal scale and visual weight.
- Demote the *"Watch 2-Min Demo"* button from its dominant glowing gradient to a clean, understated outlined style.
- Upgrade hero list items to benefit-driven outcomes rather than dry feature specifications.
- Set `showGifOverlay` to `false` initially and defer loading the heavy `.gif` until the first user scroll, touch, or click.

#### [MODIFY] [welcomeEmail.js](file:///C:/Users/curth/git/swift-invoice/functions/welcomeEmail.js)
- Embed a beautifully styled, high-converting callout block containing a button that directs new signups to watch the 2-minute setup guide on YouTube.

## Landing Page Hero Benefit Badges Optimization (v7)

### Purpose
Optimize the landing page hero section above-the-fold real estate in mobile view by replacing the 5 large, wordy vertical bullets with 3 compact, glassmorphic pill badges featuring high-fidelity custom SVGs. This retains critical project tracking and billing value proposition highlights while dramatically reducing height footprint.

### Proposed Changes
#### [MODIFY] [LandingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/LandingPage.vue)
- Replace vertical `.hero-bullets` with a responsive wrap layout `.hero-benefits-badges` containing 3 premium badges.
- Design custom, high-end inline SVG icons for mobile invoicing, receipt photo expense tracking, and 1-click invoice conversion.
- Implement responsive scoped styles using transparent base colors (`rgba(255, 255, 255, 0.03)`), borders (`rgba(255, 255, 255, 0.08)`), blur backdrops (`12px`), and subtle teal glows.

## Stripe Connect Onboarding UX Optimization (v8)

### Purpose
Eliminate the double data-entry friction and page-redirect state loss when users navigate to Stripe Connect. We implement a two-pronged solution: auto-saving form inputs before leaving to the Stripe onboarding page, and automatically syncing verified merchant profile metadata (company name, address, email) from the connected Stripe account into the Firestore `userSettings` profile upon return.

### Proposed Changes
#### [MODIFY] [UserSettings.vue](file:///C:/Users/curth/git/swift-invoice/src/components/UserSettings.vue)
- Create a `handleStripeConnect` method that triggers an explicit `saveUserSettings` call before calling the `createConnectAccount` redirect composable.
- Bind `handleStripeConnect` to the "Connect with Stripe" template CTA button.

#### [MODIFY] [stripeConnect.js](file:///C:/Users/curth/git/swift-invoice/functions/stripeConnect.js)
- Enhance the `getStripeConnectStatus` Cloud Function to fetch full account metadata using `stripe.accounts.retrieve()`.
- Compare the Stripe merchant profile with the user's Firestore `userSettings` document.
- Auto-fill any empty address, state, city, zip, email, or company name fields in Firestore from the Stripe account metadata using `{ merge: true }`.

## About Us Page Integration (v9)

### Purpose
Introduce a stunning, responsive, glassmorphic "About Us" page that blends a relatable creator origin story with high-grade systems security, automated tracking capabilities, and Stripe Connect integration details. We integrate this page across key footers and the header AppBar to maximize trust and build organic authority.

### Proposed Changes
#### [NEW] [AboutUsPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/AboutUsPage.vue)
- Create a beautiful glassmorphic vue component leveraging a deep navy background (`#111d2f`).
- Include the hybrid creator/fintech story narrative.
- Add three interactive values cards highlighting Security, Simplicity, and Speed.
- Design an elegant Operating Commitments grid (Option B) featuring premium custom SVGs for 100% Independence, Direct Human Support, and Privacy First (avoiding fake profiles to build real organic trust).
- Embed dynamic sign-up CTAs and full SEO meta tagging using `useMeta`.

#### [MODIFY] [router/index.js](file:///C:/Users/curth/git/swift-invoice/src/router/index.js)
- Register the `/about` lazy-loaded public route.

#### [MODIFY] [AppBar.vue](file:///C:/Users/curth/git/swift-invoice/src/components/AppBar.vue)
- Add the `"About"` link to guestNav and render it on both desktop and mobile dropdown structures.

#### [MODIFY] [LandingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/LandingPage.vue)
- Add a router link to the page footer.

#### [MODIFY] [FeaturesPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/FeaturesPage.vue)
- Add a router link to the page footer.

