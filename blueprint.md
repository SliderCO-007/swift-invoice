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

## Mobile Google Sign-In Fallback (v10)

### Purpose
Resolve the mobile production Google Sign-In bugs (both the immediate popup closures on Chrome/Safari mobile and the `"missing initial state"` error caused by storage-partitioning/third-party cookie blocking on Firefox/Safari mobile). 

Instead of `signInWithRedirect` (which breaks due to storage partitioning in strict privacy environments), we leverage `signInWithPopup` globally. To bypass aggressive mobile pop-up blockers, we implement the **Synchronous Popup Call** pattern. By invoking `signInWithPopup` as the absolute first synchronous line in our click execution thread—before any asynchronous microtasks, yields, or Vue reactive queue ticks—the mobile browser accepts the popup as a direct, trusted user-action result. 

### Proposed Changes
#### [MODIFY] [useAuth.js](file:///C:/Users/curth/git/swift-invoice/src/composables/useAuth.js)
- Revert the `getRedirectResult` chain-resolution in the auth state listener to avoid unnecessary page-reload overhead and prevent storage-partitioning issues.
- Modify `googleLogin` to call `signInWithPopup` synchronously as the very first operation inside the execution context, awaiting its promise resolution subsequently to handle loading states and exceptions.

### Verification Plan
- Verify that Google Sign-in on desktop successfully triggers a popup.
- Verify that Google Sign-in on mobile (Safari, Chrome, Firefox) opens the popup synchronously, stays open, and successfully authenticates the user, seamlessly routing them to `/dashboard`.


## Manual Onboarding Email Template (v11)

### Purpose
Provide a high-converting, personalized plain-text email template that the platform owner can manually send to unsubscribed or inactive users. The email is designed to feel genuine, personal, and helpful (written from the founder's perspective), while guiding users directly through the onboarding steps to set up their company details and send their first invoice.

### Proposed Changes
#### [NEW] [manual_onboarding_email.txt](file:///C:/Users/curth/git/swift-invoice/manual_onboarding_email.txt)
- Create a plain-text email template featuring:
  - Personal, high-open-rate subject lines.
  - A friendly founder outreach tone that lowers barriers and builds trust.
  - A clear 2-step quick start checklist with direct dashboard links:
    1. Set up company profile (`/settings`)
    2. Create first invoice (`/invoice/new`)
  - A low-friction feedback question to identify why they haven't started yet.

### Verification Plan
- Verify readability and tone of the plain-text template.
- Ensure all routing links (`/settings` and `/invoice/new`) align perfectly with `src/router/index.js`.


## Instagram Post Campaign: Quote vs. Estimate (v12)

### Purpose
Create and design a premium, high-engagement Instagram post campaign educating small business owners on the differences between Quotes and Estimates. Provide optimized copy, target hashtags, and a beautiful brand-aligned visual showing a top-down vertical workflow of an Estimate, Client Approval, and final Invoice.

### Proposed Changes
#### [NEW] [instagram_post_quote_vs_estimate.md](file:///C:/Users/curth/.gemini/antigravity-cli/brain/97c46a2c-ac01-487c-bb74-963f2f6ec142/instagram_post_quote_vs_estimate.md)
- Write professional copywriting explaining Quotes vs. Estimates clearly.
- Embed the vertical top-down glassmorphic visual workflow.
- List 13 high-performance marketing hashtags.

### Verification Plan
- Verify visual design follows the brand's navy, glassmorphic dark theme and does not use fake click triggers.
- Check vertical alignment and aspect ratio optimization (1:1 square) for Instagram's grid.


## Nosignup Guest Invoice Builder & Delayed Signup (v13)

### Purpose
Eliminate signup friction from the acquisition funnel by allowing prospective clients to experience the full value of the Invoice Builder immediately. Signup is seamlessly deferred until they attempt high-value actions (Save, Export, Send), using a premium glassmorphic modal with zero form data loss through localized guest state migration.

### Proposed Changes

#### [MODIFY] [router/index.js](file:///C:/Users/curth/git/swift-invoice/src/router/index.js)
- Modify `/invoice/new` route configuration to set `requiresAuth: false` so guests can access the editor.

#### [MODIFY] [LandingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/LandingPage.vue)
- Add a prominent primary CTA button: "Create Invoice (No Signup)" that routes immediately to `/invoice/new`.
- Style it to match the high-fidelity dark navy theme with custom hover animations.

#### [MODIFY] [AppBar.vue](file:///C:/Users/curth/git/swift-invoice/src/components/AppBar.vue)
- Add a "Create Invoice" guest nav action link in both desktop and mobile guest navigation lists.

#### [MODIFY] [InvoiceEditor.vue](file:///C:/Users/curth/git/swift-invoice/src/components/InvoiceEditor.vue)
- Check `user.value` presence to identify guest state.
- Add local storage synchronization (`swift_invoice_guest_draft`) to save the active guest progress in real time (via watch) so resets don't erase state.
- Add a premium sticky alert banner at the top of the editor alerting guests of preview mode.
- Restrict save and preview export buttons for guest users, intercepting clicks to open the new signup modal.
- Implement a gorgeous, responsive, glassmorphic auth modal inside the page that allows guests to sign up or log in via Google popup or email/password.
- On successful authentication, automatically migrate the active `localStorage` guest draft to Firestore using the `createInvoice` composable, clear the draft, and route the user to `/invoice/:id`.

### Verification Plan
- **Guest Access**: Log out and navigate to `/invoice/new`. Confirm the editor loads fully and initial settings default safely.
- **Landing Page CTA**: Click "Create Invoice (No Signup)" on the landing page and confirm seamless routing.
- **Persistence**: Edit fields as a guest, reload the page, and verify all populated values persist.
- **Auth Modal Intercept**: Click "Save Invoice" as a guest and confirm the beautiful auth modal opens with benefits highlights.
- **Google & Email Signups**: Perform a signup/login inside the modal and verify the draft data is successfully migrated to Firestore, the guest local draft is cleared, and routing to the invoice details page is successful.


## Stripe Connect Onboarding & Settings Separation (v14)

### Purpose
Separate Stripe Connect functionality from `UserSettings.vue` to streamline the onboarding experience. Create a step-by-step wizard route `/onboarding` for new users to complete their profile (Company Info, then Payment Setup) immediately after registration. Prompt incomplete users on their Dashboard and when beginning to create an invoice.

### Proposed Changes

#### [NEW] [OnboardingWizard.vue](file:///C:/Users/curth/git/swift-invoice/src/components/OnboardingWizard.vue)
- A beautiful, glassmorphic wizard container with step indicators.
- **Step 1: Company Information**: Includes logo upload, name, email, addresses, city, state, zip, tax rate, currency, and brand primary color. Excludes discount settings.
  - Buttons: "Save & Continue" (saves via `saveUserSettings` and proceeds to Step 2) and "Skip" (proceeds to Step 2).
- **Step 2: Connect Payment Account**: Shows Stripe Connect connection.
  - If verified (`chargesEnabled`): Displays a beautiful congratulatory screen with a link to the `/dashboard`.
  - If not connected: Warning prompt explaining that online payments won't be accepted without connection, a "Connect with Stripe" CTA, and a "Skip & Go to Dashboard" button.
  - If connected but pending verification: Informational message and a link to the `/dashboard`.

#### [MODIFY] [router/index.js](file:///C:/Users/curth/git/swift-invoice/src/router/index.js)
- Register `/onboarding` as a lazy-loaded route requiring authentication (`requiresAuth: true`).

#### [MODIFY] [RegisterPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/RegisterPage.vue)
- Redirect newly registered users to `/onboarding` instead of `/dashboard`.

#### [MODIFY] [useStripeConnect.js](file:///C:/Users/curth/git/swift-invoice/src/composables/useStripeConnect.js)
- Modify `createConnectAccount` to set the return and refresh URL to `/onboarding` so the user is returned to the onboarding wizard instead of `/settings`.

#### [MODIFY] [UserSettings.vue](file:///C:/Users/curth/git/swift-invoice/src/components/UserSettings.vue)
- Remove Stripe Connect UI code and handling methods. Add a simple link/button pointing to `/onboarding?step=2` to let users manage or connect their payment account.

#### [MODIFY] [Dashboard.vue](file:///C:/Users/curth/git/swift-invoice/src/components/Dashboard.vue)
- Modify `CompanyInfoPrompt` rendering: if the user hasn't completed company details, show a prompt directing them to `/onboarding` instead of `/settings`.
- Add an onboarding checklist or secondary prompt if company settings are done but the payment account is not connected (`!userProfile?.chargesEnabled`).

#### [MODIFY] [InvoiceEditor.vue](file:///C:/Users/curth/git/swift-invoice/src/components/InvoiceEditor.vue)
- Add a banner or top notification warning users if they haven't completed their payment connection: "You will not be able to accept online payments until your payment account is connected. [Connect Now]" (linking to `/onboarding?step=2`).

### Verification Plan
- **Registration Flow**: Register a new account and verify immediate routing to `/onboarding`.
- **Wizard Step 1**: Verify all fields save correctly to Firestore userSettings (except discount settings, which are skipped). Check that clicking "Skip" or "Save & Continue" correctly takes the user to Step 2.
- **Wizard Step 2**: Check that the warning banner displays correctly. Verify clicking "Connect with Stripe" calls the redirect with `/onboarding` as return/refresh URLs. Verify clicking "Skip & Go to Dashboard" routes to `/dashboard`.
- **Completion Flow**: Verify that returning to `/onboarding` with `chargesEnabled` displays the congratulatory layout.
- **Invoice Editor Intercept**: Verify that loading `/invoice/new` with an account that has no Stripe Connect connection triggers a warning alert.


## Social Media & Contact Section Integration (v15)

### Purpose
Add minimalist Facebook and Instagram links to the website footers and introduce a beautiful, glassmorphic "Contact Us" section containing the support email and social media links. This section will be integrated into the landing page and about us page, and we will update the guest navigation bar with a "Contact" link.

### Proposed Changes

#### [MODIFY] [LandingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/LandingPage.vue)
- Add a new contact section (`#contact`) before the final CTA section.
- Use branded, glassmorphic Facebook and Instagram social buttons on the Get in Touch card.
- Optimize spacing above the "Get in Touch" header on mobile devices.

#### [MODIFY] [AboutUsPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/AboutUsPage.vue)
- Add the contact section (`#contact`) before the CTA card.
- Add a standard footer at the bottom of the page (without social links) to match other pages.
- Use branded, glassmorphic Facebook and Instagram social buttons on the Get in Touch card.
- Optimize spacing above the "Get in Touch" header on mobile devices.

#### [MODIFY] [FeaturesPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/FeaturesPage.vue)
- Removed previously added social links and styles from the footer.

#### [MODIFY] [Dashboard.vue](file:///C:/Users/curth/git/swift-invoice/src/components/Dashboard.vue)
- Removed previously added social links and styles from the footer.

#### [MODIFY] [AppBar.vue](file:///C:/Users/curth/git/swift-invoice/src/components/AppBar.vue)
- Reverted/removed the "Contact" link from the `guestNav` array.
- Reverted/removed the "Contact" button from the guest desktop navigation and mobile drawer menu.

### Verification Plan
- Verify contact section displays beautifully with branded, glassmorphic Facebook and Instagram icons on landing and about pages.
- Verify no social links appear in the footers of the landing page, about page, features page, or dashboard.


## Conversion Rate Optimization (v16)

### Purpose
Improve the landing page and registration conversion rates by:
1. Eliminating the "ScanGo" OCR scanner expectation mismatch and aligning the landing page copy with the Facebook ad's "Digitize, Manage, Grow" theme.
2. Enabling automated conversion tracking in Meta Ads manager by firing the `CompleteRegistration` Pixel event on successful registration.

### Proposed Changes

#### [MODIFY] [useAuth.js](file:///C:/Users/curth/git/swift-invoice/src/composables/useAuth.js)
- Call `fbq('track', 'CompleteRegistration')` inside `createInitialUserData` to fire the conversion event immediately upon a new user's profile creation.

#### [MODIFY] [LandingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/LandingPage.vue)
- Add a high-converting `.hero-subtitle` in the Hero section right below the `h1` titles to clarify "ScanGo" and align with "Digitize, Manage, Grow":
  "Digitize your business on the go. Snap receipts to track expenses, log project hours, and get paid instantly via customer 'Scan-to-Pay' QR codes."
- Refine Step 3 of the "How It Works" section to change "Scan receipts and save them to the project" to "Photograph and attach receipts to keep your expense records digital" to clarify that the app supports manual photo uploads rather than automated OCR document ingestion.

### Verification Plan
- **Meta Pixel Tracking:** Confirm that when a new user registers (via Email or Google), the `CompleteRegistration` event is fired.
- **Copy Match:** Verify the landing page displays the new subheadline and the updated Step 3 text correctly.


## Invoice Templates Expansion (v17)

### Purpose
Add two new premium invoice templates to expand visual choices for users:
1. **Creative Sidebar (creative)**: An asymmetrical split-column layout. A solid-tinted left sidebar containing the company logo in the upper left, status badge, invoice number, issue/due dates, client details, and the Stripe QR payment code. The spacious right pane contains the sender's contact details, items table, notes, and totals.
2. **Tech Grid (tech)**: A modern, tech-themed blueprint grid layout featuring monospace and clean geometric typography, sharp grid lines, status code indicators, and data-table boxes.
Both templates dynamically adapt to the user's primary/brand color for visual accents (e.g. sidebar tints, borders, table headers).

### Proposed Changes

#### [NEW] [InvoiceTemplate5.vue](file:///C:/Users/curth/git/swift-invoice/src/components/InvoiceTemplate5.vue)
- Create the Creative Sidebar template with a responsive grid layout.
- Handle logo in upper left sidebar, client billing details, QR pay code, and sender details.
- Use dynamic primary color RGB conversion to theme elements.

#### [NEW] [InvoiceTemplate6.vue](file:///C:/Users/curth/git/swift-invoice/src/components/InvoiceTemplate6.vue)
- Create the Tech Grid template with Google Fonts Space Grotesk and Share Tech Mono imports.
- Render double grid lines, blocky status labels, monospace numbers, and technical headers.
- Support all invoice calculation fields, notes, logo, and Stripe QR pay code.

#### [MODIFY] [InvoiceEditor.vue](file:///C:/Users/curth/git/swift-invoice/src/components/InvoiceEditor.vue)
- Register style choices `'creative'` and `'tech'` in the template selection radio group.
- Update style primary color visibility check to include `'creative'` and `'tech'`.
- Import and render `InvoiceTemplate5` and `InvoiceTemplate6` inside the Preview modal.

#### [MODIFY] [InvoiceView.vue](file:///C:/Users/curth/git/swift-invoice/src/components/InvoiceView.vue)
- Add radio controls for `'creative'` and `'tech'` inside the owner's style selector.
- Import and render `InvoiceTemplate5` and `InvoiceTemplate6` in the active invoice template view.

### Verification Plan
- **Template Selection**: Go to the Invoice Editor and verify that "Creative Sidebar" and "Tech Grid" appear as options and show the primary color picker when selected.
- **Dynamic Color**: Modify the theme color and confirm the accents on both templates update in real-time.
- **Responsive Layout**: Resize screen to mobile size and verify the sidebar shifts to a stacked column layout and the tech grid wraps legibly.
- **PDF Generation**: Click "Download PDF" on both templates and verify that the HTML iframe cloning, canvas generation, and clickable QR overlay remain fully operational.

## Dashboard Layout Optimization (v18)

### Purpose
Declutter and optimize the workspace dashboard by removing bulky stats cards and splitting the interface into a tabbed layout, while introducing a fully custom responsive accordion table for invoice management.

### Proposed Changes

#### [MODIFY] [Dashboard.vue](file:///C:/Users/curth/git/swift-invoice/src/components/Dashboard.vue)
- Remove `InvoiceStats` import and its rendering block.
- Declare `activeTab` ref to toggle between Invoices and Analytics views.
- Render Invoices in Tab 1, showing the unified `InvoiceTable` component.
- Render the monthly revenue `DashboardChart` in Tab 2.
- Remove redundant mobile invoice card loop from the layout.

#### [MODIFY] [InvoiceTable.vue](file:///C:/Users/curth/git/swift-invoice/src/components/InvoiceTable.vue)
- Rewrite database table to be fully custom, responsive, and styled with glassmorphic elements.
- On desktop: Render a clean, wide tabular view.
- On mobile: Render a list of compact row elements showing Client, Total, and Status.
- Implement click-expand row toggling using Vue `<v-expand-transition>` to display details (Issue/Due Dates) and Action buttons.

### Verification Plan
- **Tab Toggling**: Visit the Dashboard and check that you can toggle between the "Invoices" tab and "Analytics" tab.
- **Removed Stats**: Confirm that the statistics cards are gone from the dashboard.
- **Desktop Grid**: Check that desktop rendering displays the wide tabular view with sorting and CSV exporting.
- **Mobile Accordion**: Switch to mobile emulation and confirm that tapping an invoice item reveals the sliding detailed drawer with proper action buttons.

#### [MODIFY] [LandingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/LandingPage.vue)
- Update `.hero-grid` to set `align-items: start` instead of `align-items: center` to ensure the hero image is aligned to the top and sits above the fold in desktop views.


