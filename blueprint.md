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
- Set `v-if="false"` on the `.iphone-overlay` block to temporarily disable the iPhone GIF mockup overlay until a new visual asset showcasing the new updates is created.

## Landing Page Above-the-Fold Badges Reordering (v19)

### Purpose
Resolve the desktop view fold issue where the large vertical hero benefit badges pushed the primary call-to-actions (CTA buttons) below the fold. By repositioning the benefits badges out of the narrow left-column grid layout and placing them horizontally below the 2-column hero grid section, we maintain critical above-the-fold prominence for the CTA block while presenting the benefits in a beautiful, widescreen 3-column format on desktop.

### Proposed Changes

#### [MODIFY] [LandingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/LandingPage.vue)
- Move `.hero-benefits-badges` markup from the bottom of the `.hero-content` left column to the bottom of the `.hero` section (outside the `.hero-grid` card but inside the container).
- Add CSS media queries for `.hero-benefits-badges` and `.benefit-badge` to display horizontally (`flex-direction: row`, `flex: 1 1 0px`) for screens 960px and wider, while retaining the vertical stack on mobile/tablet viewports.

### Verification Plan
- **Desktop View:** Verify that the primary signup buttons (Google, Email) and secondary video button are clearly visible above the fold. Verify the benefits badges appear horizontally spanning the container width below the main grid.
- **Mobile View:** Verify that the layout remains responsive, with the badges stacked vertically at the bottom of the hero section.


## Line Item Tax Customization (v20)

### Purpose
Introduce line-item level tax customization to accommodate different tax regulations for labor/services versus expenses/goods. Support item tax toggling in the invoice editor (defaulting to taxable) and default to labor as non-taxable and expenses as taxable during one-click project-to-invoice conversion.

### Proposed Changes

#### [MODIFY] [useInvoices.js](file:///C:/Users/curth/git/swift-invoice/src/composables/useInvoices.js)
- Update `calculateTotal` to compute tax only on the taxable subtotal of items (`item.taxable !== false`), pro-rating the invoice-wide discount across taxable and non-taxable items.

#### [MODIFY] [InvoiceEditor.vue](file:///C:/Users/curth/git/swift-invoice/src/components/InvoiceEditor.vue)
- Add `taxable: true` by default to fresh line items.
- Update `taxAmount` computed property to calculate tax only on the taxable subtotal, pro-rating the invoice discount.
- Render an inline "Tax" checkbox next to the Price field for each line item in the items list.

#### [MODIFY] [useProjects.js](file:///C:/Users/curth/git/swift-invoice/src/composables/useProjects.js)
- Update `buildInvoicePayload` to explicitly set `taxable: false` for the generated Labor item, and `taxable: true` for the generated Expenses item.

#### [MODIFY] [InvoiceView.vue](file:///C:/Users/curth/git/swift-invoice/src/components/InvoiceView.vue)
- Update the `safeInvoice` computed property to compute tax only on the taxable subtotal, pro-rating the invoice discount.

#### [MODIFY] [Templates](file:///C:/Users/curth/git/swift-invoice/src/components/)
- Modify all six invoice template components ([InvoiceTemplate.vue](file:///C:/Users/curth/git/swift-invoice/src/components/InvoiceTemplate.vue), [InvoiceTemplate2.vue](file:///C:/Users/curth/git/swift-invoice/src/components/InvoiceTemplate2.vue), [InvoiceTemplate3.vue](file:///C:/Users/curth/git/swift-invoice/src/components/InvoiceTemplate3.vue), [InvoiceTemplate4.vue](file:///C:/Users/curth/git/swift-invoice/src/components/InvoiceTemplate4.vue), [InvoiceTemplate5.vue](file:///C:/Users/curth/git/swift-invoice/src/components/InvoiceTemplate5.vue), [InvoiceTemplate6.vue](file:///C:/Users/curth/git/swift-invoice/src/components/InvoiceTemplate6.vue)) to render a compact, clean "(No Tax)" indicator next to the item unit price/total if `invoice.taxRate > 0` and `item.taxable === false`.

### Verification Plan
- **Invoice Conversion**: Trigger "Convert to Invoice" from a project. Confirm that the Labor line item has the "Tax" checkbox unchecked, and the Expenses line item has it checked.
- **Invoice Editor UI**: Add manual line items and verify they default to taxable (checkbox checked). Toggle the checkbox and verify that the Tax and Total calculations update dynamically.
- **Mixed Tax Calculation**: Verify calculation correctness when tax is 10% and discount is flat or percentage.
- **Templates Presentation**: Review all 6 templates in the preview/view page and ensure "(No Tax)" is elegantly rendered for non-taxable items.


## Free Tier Limits Expansion & Projects Access (v21)

### Purpose
Entice new users to register by increasing the free tier invoice limit from 3 to 5 and fully enabling the project tracking features (unlimited projects, hours, and expense captures) for the free plan. Display an inline alert banner on the Projects list for free plan users reminding them of Pro upgrades (e.g. direct email sending, unlimited invoices) without blocking project creation/management.

### Proposed Changes

#### [MODIFY] [firestore.rules](file:///C:/Users/curth/git/swift-invoice/firestore.rules)
- Update the invoice creation rules to allow free tier users to write up to 5 invoices (check `invoiceCount < 5` instead of `invoiceCount < 3`).

#### [MODIFY] [useInvoices.js](file:///C:/Users/curth/git/swift-invoice/src/composables/useInvoices.js)
- Update `createInvoice` limit check to throw limit error when `invoiceCount >= 5` (instead of `invoiceCount >= 3`).

#### [MODIFY] [Dashboard.vue](file:///C:/Users/curth/git/swift-invoice/src/components/Dashboard.vue)
- Update `invoiceLimitReached` computed property to check `invoiceCount >= 5` (instead of `invoiceCount >= 3`).

#### [MODIFY] [PricingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/PricingPage.vue)
- Update marketing descriptions on the Free tier card from `3 invoices` to `5 invoices`.
- Mark project-tracking features on the Free tier card as enabled (active icons, remove muted class).

#### [MODIFY] [ProjectsView.vue](file:///C:/Users/curth/git/swift-invoice/src/components/ProjectsView.vue)
- Remove the hard upgrade gate panel and Lock message overlay.
- Display a new glassmorphic inline banner warning at the top of the projects list when `!isPaidUser`, highlighting that project tracking is active and directing them to upgrade to Pro to unlock direct email sending and unlimited invoices.
- Render the "New Project" button for all users.

### Verification Plan
- **Backend Rules**: Test creating up to 5 invoices on a free account. Confirm that the 5th invoice saves successfully, and the 6th invoice is blocked by the database rules and editor transactions.
- **Project Access on Free Account**: Log in with a free account and access `/projects`. Confirm the projects list renders without a locking overlay. Verify that you can create, view, edit, and convert projects without locks.
- **Projects UI Banner**: Check that the projects page renders the new inline alert banner indicating "Project tracking is active" and directing users to upgrade for email sending and unlimited invoices.
- **Pricing Copy**: Verify the pricing page correctly highlights "5 invoices" and shows "Project & time tracking" as checked/enabled for the Free tier.

## Chunk Load Error Handling (v22)

### Purpose
Resolve dynamic import errors (`TypeError: Failed to fetch dynamically imported module`) that occur in production when a new build is deployed and users with active sessions attempt to navigate to a lazy-loaded route (such as Features). This is done by catching chunk load failures in Vue Router, checking if we have already attempted a reload via `sessionStorage` (to avoid infinite reload loops in case of true network failure), and forcing a page reload to pull down the newly deployed assets.

### Proposed Changes

#### [MODIFY] [router/index.js](file:///C:/Users/curth/git/swift-invoice/src/router/index.js)
- Update `router.afterEach` to clear the `chunk-reload-target` from `sessionStorage` upon successful navigation.
- Implement `router.onError` to catch dynamic import chunk errors.
- Store the failed route's `to.fullPath` in `sessionStorage` as a reload target, reload the page on the first failure, and show a user-friendly alert message if a second consecutive failure occurs to prevent reload loops.

### Verification Plan
- **Mock Chunk Failure:** In local development, simulate a chunk import failure by modifying a route to point to a non-existent chunk or throw an import error, then check if `router.onError` catches it, sets `sessionStorage` correctly, and triggers a reload.
- **Loop Prevention:** Verify that if the error persists after a reload, the reload loop is blocked and a friendly alert is displayed to the user instead.
- **Normal Navigation:** Verify that normal route navigation works properly and clears the `sessionStorage` key in `router.afterEach`.

## Pricing Page Templates Count Update (v23)

### Purpose
Ensure that the templates count listed on the Pricing Page reflects the correct total number of templates available to users (which is 6, following the addition of the Creative Sidebar and Tech Grid templates in v17).

### Proposed Changes

#### [MODIFY] [PricingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/PricingPage.vue)
- Update the templates count text in both the Free and Monthly plans features lists from "4 professional templates" to "6 professional templates".

### Verification Plan
- **Visual Check:** Navigate to the Pricing Page (`/pricing`) and verify that the Free tier card and the Monthly tier card both show "6 professional templates" in their features lists.


## Monthly Sales Reporting Feature (v24)

### Purpose
Introduce a dedicated, premium glassmorphic "Reports" page allowing users to view, analyze, and export monthly sales reports. This feature provides direct visibility into key sales metrics (total sales, tax collected, total invoices, average invoice value, number of invoices) for any selected month, featuring a daily sales trend chart and detailed invoice tables. It supports downloading/exporting reports as CSV and formatted print-ready PDFs.

### Proposed Changes

#### [NEW] [ReportsView.vue](file:///C:/Users/curth/git/swift-invoice/src/components/ReportsView.vue)
- Create a beautiful, glassmorphic page matching the deep navy background (`#111d2f`).
- Add dropdown filters to select the month (January-December) and the year (based on dynamic list of recent years).
- Display a responsive grid of 5 cards with subtle teal/blue glows for:
  - **Total Sales**: sum of all invoices excluding drafts in the selected month.
  - **Tax Collected**: sum of calculated tax for those invoices.
  - **Average Invoice Value**: total sales divided by the number of invoices.
  - **Number of Invoices**: total count of invoices.
  - **Paid vs Outstanding Breakdown**: comparison of collected revenue vs. outstanding/pending revenue.
- Add a daily sales trend chart using Chart.js to visualize daily revenue collection/sales within the selected month.
- Render a table displaying all invoices for the selected month, with columns for Invoice Number, Date, Customer, Status, Tax, and Total.
- Implement action buttons:
  - **Export to CSV**: Generates a CSV showing Invoice #, Date, Customer Name, Status, Tax Amount, Discount, and Total.
  - **Export/Download PDF**: Generates a beautiful, print-ready PDF using `jsPDF` or browser's print options, containing a clean header with company name, the metrics, and the detailed invoice table.

#### [MODIFY] [router/index.js](file:///C:/Users/curth/git/swift-invoice/src/router/index.js)
- Register the `/reports` route: `{ path: '/reports', name: 'Reports', component: () => import('../components/ReportsView.vue'), meta: { requiresAuth: true } }`.

#### [MODIFY] [AppBar.vue](file:///C:/Users/curth/git/swift-invoice/src/components/AppBar.vue)
- Add "Reports" (`/reports`) to the `authNav` list with the icon `mdi-file-chart-outline`.

### Verification Plan
- **Navigation**: Log in and verify that the "Reports" option appears in the navigation menu and routes successfully to `/reports`.
- **Filtering**: Change the month and year filters and confirm that the key metrics, chart, and invoices list update dynamically.
- **CSV Export**: Click "Export CSV" and confirm that a CSV file containing the selected month's invoices is downloaded with correct data.
- **PDF Export**: Click "Download PDF" and confirm that a formatted PDF containing the monthly report summary and invoice breakdown is downloaded correctly.


## Application Documentation Update (v25)

### Purpose
Replace the generic, template-generated developer documentation in README.md with a comprehensive, professional, and detailed documentation guide for ScanGo Invoice. Additionally, create an AI-friendly llms.txt index file in the project's root for rapid codebase onboarding of developer agents.

### Proposed Changes

#### [MODIFY] [README.md](file:///C:/Users/curth/git/swift-invoice/README.md)
- Write full, professional documentation detailing:
  - Project Overview and Key Features (Invoice Generation, Stripe Connect, Project Tracking, Reports).
  - Technology Stack (Vue 3, Vite, Vuetify, Firebase Auth/Firestore/Storage/Functions).
  - Quick Start guide for local development.
  - Project directory structure.
  - Core database schema details (Users, User Settings, Invoices, Projects, Entries).
  - Deployment details.

#### [NEW] [llms.txt](file:///C:/Users/curth/git/swift-invoice/llms.txt)
- Create a modern `llms.txt` file listing core files, folder purposes, and key concepts for agent/RAG indexing.

### Verification Plan
- **README Check**: Verify that the new README format looks correct, covers all technical sections, and has clickable links.
- **llms.txt Check**: Ensure `llms.txt` is structured correctly per AI guidelines.


## User Documentation Guide (v26)

### Purpose
Provide clear, step-by-step user-facing documentation to answer common end-user questions regarding key features of ScanGo Invoice: invoice creation, updating business details, managing customers and items directories, exporting invoice files, and viewing/generating sales reports.

### Proposed Changes

#### [NEW] [USER_GUIDE.md](file:///C:/Users/curth/git/swift-invoice/USER_GUIDE.md)
- Create a comprehensive user guide document in the project root covering:
  - **Creating Invoices**: Step-by-step instructions on choosing templates, selecting clients, adding line items, configuring discounts/taxes, and sending.
  - **Updating Business Information**: Guide to managing details under Settings and Onboarding (name, addresses, currency, uploading logo, theme colors).
  - **Managing Customers and Items**: How to manage clients and catalog items for quick reuse.
  - **Exporting Invoice Data**: Instructions on exporting list spreadsheets (CSV) and downloading invoice PDFs.
  - **Generating Reports**: Guide to using the new Reports tab to filter sales monthly/yearly, interpret metrics, and export data.

### Verification Plan
- **Content Audit**: Verify that USER_GUIDE.md answers all 5 specified user flows with clear, friendly, and step-by-step instructions.


## Web User Guide Page Integration (v27)

### Purpose
Integrate the user documentation directly into the application by creating a beautiful, dedicated `/guide` route rendering the guide contents inside interactive glassmorphic panels. It features a real-time topic filter/search bar and is linked in both authenticated and guest headers/footers to maximize user enablement.

### Proposed Changes

#### [NEW] [UserGuidePage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/UserGuidePage.vue)
- Create a dedicated user guide page with the deep navy background (`#111d2f`) and glassmorphic panels.
- Add an interactive real-time search field at the top to filter guides by keyword.
- Use Vuetify's expansion panels (`<v-expansion-panels>`) to structure the 5 core topics: Invoices, Settings, Customer/Items, Exporting, and Reports.
- Render styled bullet points, code-styled fields, and icons for intuitive visual aid.

#### [MODIFY] [router/index.js](file:///C:/Users/curth/git/swift-invoice/src/router/index.js)
- Register the `/guide` public route: `{ path: '/guide', name: 'UserGuide', component: () => import('../components/UserGuidePage.vue'), meta: { requiresAuth: false } }`.

#### [MODIFY] [AppBar.vue](file:///C:/Users/curth/git/swift-invoice/src/components/AppBar.vue)
- Add "Guide" to the `guestNav` array and the `authNav` array to make it visible in header menus.

#### [MODIFY] [LandingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/LandingPage.vue)
- Add a footer route link to the User Guide.

#### [MODIFY] [Dashboard.vue](file:///C:/Users/curth/git/swift-invoice/src/components/Dashboard.vue)
- Add a footer route link to the User Guide.

#### [MODIFY] [AboutUsPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/AboutUsPage.vue)
- Add a footer route link to the User Guide.

### Verification Plan
- **Route Access**: Go to `/guide` as both guest and logged-in user; verify page loads correctly.
- **Search Filtering**: Type a keyword (like "Stripe" or "PDF") and verify that non-matching panels collapse/hide dynamically.
- **Navigation Links**: Verify that clicking "Guide" in navigation bars or footers successfully routes the user to the Guide.


## Stripe Connect Loading UX Optimization (v28)

### Purpose
Resolve the issue where the dashboard loads before the Stripe Connect status is fully validated, causing the "Online Payments Not Connected" alert to briefly flash to users who are actually connected. We will replace the full-screen spinner with a matching dashboard-wide skeleton loader, wait for the Stripe Connect check to complete alongside other loaders, and show a friendly reload screen if the Stripe Connect check fails or takes too long (e.g., more than 7 seconds).

### Proposed Changes

#### [MODIFY] [Dashboard.vue](file:///C:/Users/curth/git/swift-invoice/src/components/Dashboard.vue)
- Import `loading` (aliased to `stripeLoading`) and `error` (aliased to `stripeError`) from `useStripeConnect()`.
- Add local state `stripeStatusHaveLoaded` ref to track the finalization of the Stripe status fetch.
- Add `initialLoadTimeout` ref to signal when loading has failed or timed out.
- Set up a 7-second timeout check in `onMounted`. If the check doesn't finish or fails with an error, show a custom error screen prompting the user to reload the page.
- Update `isInitialLoad` to require that invoices, settings, and Stripe Connect status have all completed loading.
- Add `stripeLoading` to the `isDataLoading` computed variable.
- Replace the page-loading-container spinner with a simplified skeleton dashboard layout (featuring only the header and main content table placeholders, excluding optional warning banner and tab indicator placeholders), and add a custom failure/timeout screen with a reload button.
- Add glassmorphic styling for the skeleton loaders to keep the interface premium and brand-aligned.

### Verification Plan
- **Normal Loading State**: Verify that logging in displays a layout-matching skeleton dashboard until loading finishes, with no flashing "Online Payments Not Connected" banner for verified accounts.
- **Error/Timeout Handling**: Artificially mock a slow network delay or check failure, and confirm that a beautiful, user-friendly timeout message with a reload button is presented after 7 seconds.


## Stripe Connect Loading UX Optimization for Invoice Editor (v29)

### Purpose
Resolve the issue where the Stripe Connect warning banner briefly flashes inside the invoice creator/editor (`InvoiceEditor.vue`) when loading the page or changing authentication states. This happens because the warning banner check runs immediately when settings finish loading, while the Stripe verification status fetch is still in progress asynchronously. We will track the Stripe status loading state and prevent the warning alert from showing until the fetch has finished.

### Proposed Changes

#### [MODIFY] [InvoiceEditor.vue](file:///C:/Users/curth/git/swift-invoice/src/components/InvoiceEditor.vue)
- Add a reactive boolean ref `stripeStatusHaveLoaded` to track whether the Stripe status verification has finished loading.
- Move the asynchronous `fetchConnectStatus()` call out of the `onMounted` hook and place it inside the `user` watcher. This ensures that the Stripe Connect check is always triggered dynamically when the user authentication finishes loading, preventing a race condition where direct page accesses bypass the check.
- Set `stripeStatusHaveLoaded` to `false` when a fetch starts, and set it to `true` inside a `finally` block once the fetch resolves (or immediately to `true` if the user is a guest since no account status check is needed).
- Update the Stripe Connect Warning Alert `v-if` condition to include `stripeStatusHaveLoaded` as a dependency. This keeps the alert hidden until we are absolutely certain of the user's Stripe status.

### Verification Plan
- **Normal Loading (Authenticated User)**: Navigate to `/invoice/new` as a logged-in user with a verified Stripe account. Confirm that the yellow Stripe Connect warning alert does not show up at all, even briefly.
- **Incomplete Setup (Authenticated User)**: Navigate to `/invoice/new` as a logged-in user who has not connected their Stripe account. Confirm that the Stripe Connect warning alert renders correctly after a short delay (once loading finishes) and is not hidden permanently.
- **Guest Access**: Open `/invoice/new` as a guest. Confirm that no warning alert flashes or renders since guest mode doesn't check Stripe status.


## Stripe Checkout Cancel Redirect Path Alignment (v30)

### Purpose
Align the cancellation URL passed to Stripe Checkout with the app's routing configuration. Currently, cancelling a checkout redirect sends the user to `/payment/:invoiceId`, which is a non-existent route in the frontend application resulting in a 404 page. The correct route is `/pay/:invoiceId`. We will update the composable's `cancelUrl` parameter to point to the correct `/pay/:invoiceId` route.

### Proposed Changes

#### [MODIFY] [useStripeConnect.js](file:///C:/Users/curth/git/swift-invoice/src/composables/useStripeConnect.js)
- Update the `cancelUrl` value in `createPaymentSession` to use `/pay/` instead of `/payment/`.

### Verification Plan
- **Stripe Checkout Cancel Flow**: Generate a payment link for a dummy invoice, navigate to it, click "Pay online," and on the Stripe payment page, click the "Back" or "Cancel" button. Confirm it successfully routes back to the correct public payment page (`/pay/:invoiceId`) instead of a 404 page.


## Mobile Firefox Date Picker Interaction Fix (v31)

### Purpose
Resolve the issue in mobile Firefox (and Firefox responsive design mode) where clicking or focusing the Issue Date and Due Date fields does not display the native calendar popup. This occurs because Vuetify wraps native inputs with multiple overlay components that intercept the click events. We will attach custom click and focus event handlers to the date inputs that programmatically trigger the HTML5 native `.showPicker()` API.

### Proposed Changes

#### [MODIFY] [InvoiceEditor.vue](file:///C:/Users/curth/git/swift-invoice/src/components/InvoiceEditor.vue)
- Add a helper function `openDatePicker(event)` to trigger `.showPicker()` on the target input element, with a `.click()` fallback.
- Bind `@click="openDatePicker"` and `@focus="openDatePicker"` to both the "Issue Date" and "Due Date" `<v-text-field>` elements in the template.

### Verification Plan
- **Mobile Emulator (Firefox)**: Open Firefox's Responsive Design Mode (mimicking mobile viewports). Click/tap the Issue Date and Due Date text fields; confirm the native calendar picker opens immediately.
- **Focus Navigation (Keyboard)**: Navigate the form fields using the Tab key. When the focus hits the Issue Date and Due Date fields, confirm the native date picker popup opens automatically.


## Text-to-Pay SMS Compliance Implementation (v32)

### Purpose
Ensure full compliance with TCPA laws and carrier rules (CTIA & TCR) for text-to-pay transactional SMS functionality. This feature will prevent unsolicited message dispatch, shift compliance liability dynamically, and provide audit-ready consent flows to speed up future carrier validation.

### Proposed Changes

#### Flow 1: Your Merchants signing up for ScanGo
*If you want to text your merchants directly (e.g., account alerts):*
* **Design/UI:** Place an unchecked checkbox on the signup or profile page next to the phone number input with a clear compliance disclosure statement.

#### Flow 2: Your Merchants texting their Customers (Text-to-Pay)
*Since you cannot control what your merchants do offline, you must protect your platform from compliance violations:*
* **Invoice Editor / Send View:** In your invoice creation screen, when a merchant inputs their customer's phone number to send a text-to-pay link, display a small helper notice:
  > "By checking this box, you confirm that your customer has explicitly consented to receive transactional text messages from your business."
* **Enforcement:** Enforce that the merchant must click this checkbox before the system allows them to trigger the SMS. This shifts compliance liability and shows carrier auditors that your platform actively prevents unsolicited messaging.

### Verification Plan
* **Merchant Signup Opt-In:** Confirm the SMS checkbox on the signup page is unchecked by default. Verify that submitting the form registers the consent state in Firestore.
* **Consent Enforcement:** Try sending an invoice payment link via SMS without checking the customer consent box. Verify that the "Send SMS" button is disabled/greyed out, and attempting to force it returns a validation error.


## Stripe Deleted/Invalid Account Handling (v33)

### Purpose
Resolve the issue where a deleted/invalid Stripe Connect ID stored in Firestore causes `stripe.accounts.retrieve` to throw a `resource_missing` (or 404) error, which crashes the dashboard load process. Instead of throwing a fatal error and blocking the dashboard, we will catch the account retrieval failure, return an `invalidAccount` flag to the client, and display a prominent warning banner on the dashboard advising the user to contact support or reconnect their Stripe account.

### Proposed Changes

#### [MODIFY] [stripeConnect.js](file:///C:/Users/curth/git/swift-invoice/functions/stripeConnect.js)
- In the `getStripeConnectStatus` Cloud Function, wrap `stripe.accounts.retrieve` inside a try-catch block.
- Catch the specific Stripe error when the account is not found (e.g. `error.code === 'resource_missing'`, `error.statusCode === 404`, `error.message.includes('No such account')`, or `error.raw?.code === 'resource_missing'`).
- If caught, instead of throwing an `HttpsError('internal')`, return a successful payload `{ connected: false, invalidAccount: true, chargesEnabled: false, detailsSubmitted: false }`.

#### [MODIFY] [useStripeConnect.js](file:///C:/Users/curth/git/swift-invoice/src/composables/useStripeConnect.js)
- Initialize `invalidAccount: false` in the default `connectStatus` reference.
- Add client-side error fallback check inside the `catch` block of `fetchConnectStatus` to intercept `No such account` or `resource_missing` errors. This guarantees the dashboard loads successfully even if the updated backend Cloud Functions are not yet deployed.

#### [MODIFY] [Dashboard.vue](file:///C:/Users/curth/git/swift-invoice/src/components/Dashboard.vue)
- Update the standard Stripe Connect banner `v-if` to only show if `!connectStatus.chargesEnabled && !connectStatus.invalidAccount`.
- Render a new glassmorphic error banner styled in red if `connectStatus.invalidAccount` is true. The banner will state there is an issue with their Stripe account, advise them to contact support, and offer a "Reconnect Stripe" button.

#### [MODIFY] [UserSettings.vue](file:///C:/Users/curth/git/swift-invoice/src/components/UserSettings.vue)
- Update the Stripe status text to render `'Connection Error'` if `connectStatus.invalidAccount` is true.

#### [MODIFY] [OnboardingWizard.vue](file:///C:/Users/curth/git/swift-invoice/src/components/OnboardingWizard.vue)
- Render an error status banner advising the user of the Stripe account issue if `connectStatus.invalidAccount` is true.
- Add `.stripe-status-banner.error` CSS class styling to match standard warning classes but with red borders/backgrounds.

### Verification Plan
- **Mock Account Not Found Error**: Temporarily mock `stripe.accounts.retrieve` to throw an error with `code: 'resource_missing'`. Verify that the dashboard loads successfully without triggering the "Unable to Load Workspace" screen.
- **Verify Dashboard Banner**: Verify that a red, glassmorphic "Stripe Payment Account Issue" banner is displayed on the dashboard with a "Reconnect Stripe" button and support email.
- **Verify Settings Page**: Verify that the Stripe status badge displays "Connection Error" in red.
- **Verify Onboarding Wizard**: Verify that the onboarding wizard displays a status banner informing them of the Stripe account issue and prompts them to connect again.


## Multi-User Seats & Invitations (v34)

### Purpose
Implement multi-user seats and team invitation flow for paid subscribers. Owners can invite members by email, and members will inherit organization settings and have restricted read/write access to projects and entries, without access to invoices, settings, reports, or Stripe connections.

### Proposed Changes

#### [MODIFY] [firestore.rules](file:///C:/Users/curth/git/swift-invoice/firestore.rules)
- Update collections rules for `users`, `userSettings`, `invoices`, `projects`, and `entries` to check for organization member/owner permissions.
- Create security rules for the new `organizations` and `invitations` collections.

#### [MODIFY] [src/composables/useAuth.js](file:///C:/Users/curth/git/swift-invoice/src/composables/useAuth.js)
- Update `createInitialUserData` to check for pending invitations by email, accept them, set user's `orgId` to the invited org, and set `role` to `'member'`.
- If no pending invitation exists, create a new organization `organizations/{userId}` with `ownerId: userId` and `members: [userId]`, setting the user's `orgId` to `userId` and `role` to `'owner'`.
- In `fetchUserProfile`, automatically migrate legacy users who do not have `orgId` set by creating their organization and updating their user doc.

#### [NEW] [src/composables/useOrganization.js](file:///C:/Users/curth/git/swift-invoice/src/composables/useOrganization.js)
- A new composable to manage team invitations and members list:
  - `inviteMember(email)`: Owner creates an invitation.
  - `revokeMember(uid)`: Owner removes a member from the organization members list and updates the member's user profile.
  - `fetchTeamMembers()`: Retrieves all users who belong to the same `orgId`.
  - `fetchInvitations()`: Retrieves pending and accepted invitations for the organization.

#### [MODIFY] [src/composables/useInvoices.js](file:///C:/Users/curth/git/swift-invoice/src/composables/useInvoices.js)
- Update querying to filter by `orgId` (or fall back to `userId` for safety) instead of individual `userId`.
- Set `orgId` on invoice creation from the active user's profile metadata.

#### [MODIFY] [src/composables/useProjects.js](file:///C:/Users/curth/git/swift-invoice/src/composables/useProjects.js)
- Update querying to filter by `orgId` instead of `userId`.
- Set `orgId` on project creation.

#### [MODIFY] [src/composables/useCustomers.js](file:///C:/Users/curth/git/swift-invoice/src/composables/useCustomers.js)
- Update customers subcollection path or query to use `orgId` instead of individual user uid.
- Wait, since customer subcollection was under `users/{userId}/customers`, if we want sharing, we can keep using the organization owner's `orgId` as the parent `users/{orgId}/customers` directory! This is perfect.

#### [MODIFY] [src/composables/useItems.js](file:///C:/Users/curth/git/swift-invoice/src/composables/useItems.js)
- Update items subcollection path to use `orgId` as parent `users/{orgId}/items` to share frequent items list.

#### [NEW] [src/components/TeamSettings.vue](file:///C:/Users/curth/git/swift-invoice/src/components/TeamSettings.vue)
- Create a team management panel for Owners, permitting them to invite new users, view pending invitations, and revoke member seats.

#### [MODIFY] [src/router/index.js](file:///C:/Users/curth/git/swift-invoice/src/router/index.js)
- Add route protection: members cannot visit `/invoice/new`, `/onboarding`, or `/reports`.

#### [MODIFY] [src/components/AppBar.vue](file:///C:/Users/curth/git/swift-invoice/src/components/AppBar.vue)
- Hide links to Invoices, Settings, Reports for members, rendering only Projects and Guide. Add link to Team Settings for Owners.

### Verification Plan
- **Legacy User Migration**: Verify old accounts automatically create their organization and inherit `orgId`/`role: owner`.
- **Invitation Flow**: Owner invites a new email. Verify the invitation creates in Firestore. Sign up as a new user with that email. Verify the account is created with `role: member` and `orgId` of the owner, and added to the organization members array.
- **Rules Enforcement**: Verify a Member cannot write invoices or edit settings. Verify a Member can create/edit projects and entries.
- **UI Gating**: Verify Member accounts have a clean dashboard showing only projects and guide, without access to invoices.


## Landing Page CRO Redesign (v35)

### Purpose
Improve landing page conversion rate from social media traffic to free trial sign-ups by simplifying CTA hierarchy, adding immediate trust signals below the hero fold, and streamlining the mobile scroll experience.

### Proposed Changes
#### [MODIFY] [LandingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/LandingPage.vue)
- Reposition CTAs to make "Start Free with Google" the single, high-contrast, glowing primary CTA above the fold. Demote "Create Guest Invoice" to a secondary outlined button, and style "Sign up with email" as a secondary text route link.
- Add a new "Loved by Founders" reviews section immediately below the Hero section, displaying Trustpilot rating and 2-3 brief customer quotes.
- Add risk-reduction copy below the CTAs: "No credit card required. Up to 1 active project and 3 entries free forever."
- Streamline mobile scroll footprint by reducing card padding and spacing in the "How It Works" step grid.

### Verification Plan
- **Above-the-Fold Visual Check:** Verify that "Start Free with Google" is the primary visual anchor and buttons are clean and uncluttered on mobile.
- **Social Proof Placement:** Verify that the trust reviews block is visible immediately after scrolling below the hero fold.
- **Responsive Layout:** Check that all sections look premium on desktop and stack neatly on mobile viewports.
- **Console Log Check:** Verify no syntax or runtime errors occur on page load.


## Custom Landing Pages for Ad Variations (v36)

### Purpose
Improve conversions from target Meta Ads traffic by creating dedicated landing pages for specific ad campaigns (Contractors "Get Paid 3x Faster" hook and "Weekend Freedom" hook). When visitors sign up from these custom pages, their registration source is preserved in the database to trace back campaign effectiveness.

### Proposed Changes

#### [NEW] [ContractorLandingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/ContractorLandingPage.vue)
- Create a dedicated container route component for local service pros / contractors.
- Upon mounting, set the `sessionStorage` key `signup_source` to `'lp_contractor'`.
- Render the base `<LandingPage variant="contractor" />` component.

#### [NEW] [WeekendLandingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/WeekendLandingPage.vue)
- Create a dedicated container route component focusing on reclaiming weekends and avoiding Sunday night invoicing.
- Upon mounting, set the `sessionStorage` key `signup_source` to `'lp_weekend'`.
- Render the base `<LandingPage variant="weekend" />` component.

#### [MODIFY] [LandingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/LandingPage.vue)
- Add a `variant` prop (values: `'standard' | 'contractor' | 'weekend'`, defaulting to `'standard'`).
- Use the `variant` prop to dynamically render tailored copywriting, subheadlines, benefit badges, trust reviews, and testimonials.
- Upon mounting, if `variant === 'standard'`, default the `sessionStorage` key `signup_source` to `'lp_standard'` (if not already set by a container).

#### [MODIFY] [useAuth.js](file:///C:/Users/curth/git/swift-invoice/src/composables/useAuth.js)
- Read `signup_source` from `sessionStorage` (defaulting to `'lp_standard'`) during `createInitialUserData` profile setup.
- Store the resolved `signupSource` value under the user's Firestore document.

#### [MODIFY] [router/index.js](file:///C:/Users/curth/git/swift-invoice/src/router/index.js)
- Register `/lp/get-paid-faster` to lazy-load `ContractorLandingPage.vue`.
- Register `/lp/weekend-freedom` to lazy-load `WeekendLandingPage.vue`.

### Verification Plan
- **Route Validation:** Access `/lp/get-paid-faster` and `/lp/weekend-freedom`. Confirm each renders the custom tailored copy, badges, and testimonials.
- **Session Opt-In:** Verify `sessionStorage` key `signup_source` is set correctly on landing.
- **Database Entry Sync:** Register a test user on each of the pages (via Google Sign-in or email registration) and check the Firestore document in the `users` collection to confirm the `signupSource` field is saved with the correct identifier (`lp_contractor` / `lp_weekend` / `lp_standard`).


## Landing Page Meta Tags & Open Graph Validation for Meta Ads (v37)

### Purpose
Resolve Meta ad verification and debugger failures (missing `og:url`, `og:type`, and `fb:app_id`) on the landing page variants (`/lp/weekend-freedom` and `/lp/get-paid-faster`) by implementing a static pre-rendered meta-tag generation script that runs post-build. This ensures crawlers read the correct metadata without needing server-side execution.

### Proposed Changes

#### [MODIFY] [index.html](file:///C:/Users/curth/git/swift-invoice/index.html)
- Add base Open Graph properties to `<head>`: `og:url` (canonical home page), `og:type` (`website`), and `fb:app_id` (`944354605099455`).
- Sync `og:title` and `og:description` tags to match the standard landing page metadata.

#### [NEW] [scripts/generate-lp-meta.js](file:///C:/Users/curth/git/swift-invoice/scripts/generate-lp-meta.js)
- Create a post-build utility in Node.js.
- Read built `dist/index.html`.
- For `/lp/weekend-freedom` and `/lp/get-paid-faster`, generate separate `index.html` files inside corresponding `dist/lp/*` directories with replaced title, description, and `og:url` values.

#### [MODIFY] [package.json](file:///C:/Users/curth/git/swift-invoice/package.json)
- Modify the `build` script to execute `node scripts/generate-lp-meta.js` after `vite build`.

### Verification Plan
- **Vite Build Run:** Run `npm run build` and ensure the `dist/lp/weekend-freedom/index.html` and `dist/lp/get-paid-faster/index.html` files are generated successfully.
- **File Inspection:** Verify the generated HTML files contain root-relative script/style paths (`/assets/...`) and the specific Open Graph tags matching their respective landing page variant.




