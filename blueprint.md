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
- Append a trailing slash (`/`) to the generated canonical URLs to prevent Firebase Hosting directory 301 redirects from causing circular loops during crawler execution.

#### [MODIFY] [package.json](file:///C:/Users/curth/git/swift-invoice/package.json)
- Modify the `build` script to execute `node scripts/generate-lp-meta.js` after `vite build`.

### Verification Plan
- **Vite Build Run:** Run `npm run build` and ensure the `dist/lp/weekend-freedom/index.html` and `dist/lp/get-paid-faster/index.html` files are generated successfully.
- **File Inspection:** Verify the generated HTML files contain root-relative script/style paths (`/assets/...`) and the specific Open Graph tags matching their respective landing page variant.


## Ideal Customer Profile (ICP) Definition (v38)

### Purpose
Compile and document the core Ideal Customer Profile (ICP) for ScanGo Invoice, confirming that local service professionals (contractors, plumbers, electricians, landscapers) are our target customers. This profile guides GTM positioning, feature priorities, and marketing campaigns.

### Proposed Changes
#### [NEW] [ideal_customer_profile.md](file:///C:/Users/curth/.gemini/antigravity-cli/brain/e9f78dc3-9521-4298-86dc-9bb73737c75f/ideal_customer_profile.md)
- Define demographics, behaviors, and decision-making styles of the on-the-road service professional.
- Document their core Jobs to Be Done (JTBD) including functional, social, and emotional jobs (e.g., reclaiming weekends).
- List major pain points (delayed cash flow, receipt loss, unprofessional look) and map them directly to ScanGo Invoice features.
- Define disqualification criteria to narrow focus away from desk-bound services and mid-market organizations.

### Verification Plan
- **Content Completeness**: Verify that the profile document fully covers the Demographics, Behaviors, JTBD, Pain Points, Product Alignment, and Disqualification frameworks as specified in the `ideal-customer-profile` skill.


## Remove Sent Invitations (v39)

### Purpose
Add the ability for organization owners to cancel/remove sent invitations. This allows them to revoke pending invitations that were sent by mistake, expired, or are no longer valid, ensuring clean organization management.

### Proposed Changes

#### [MODIFY] [src/composables/useOrganization.js](file:///C:/Users/curth/git/swift-invoice/src/composables/useOrganization.js)
- Import `deleteDoc` from `firebase/firestore`.
- Define a new function `deleteInvitation(invitationId)` that checks if the active user is an owner, retrieves the reference for the invitation document, and calls `deleteDoc(inviteRef)`.
- Return `deleteInvitation` from `useOrganization`.

#### [MODIFY] [src/components/TeamSettings.vue](file:///C:/Users/curth/git/swift-invoice/src/components/TeamSettings.vue)
- Import `deleteInvitation` from the `useOrganization` composable.
- Define a `handleDeleteInvitation(invite)` function that prompts the user with a confirmation dialog. If confirmed, it deletes the invitation and displays a transient success notification.
- Update the "Pending Invitations" table layout:
  - Add an "Actions" header column on the right side of the row.
  - In each row, render a red "Cancel Invite" button with a trash-can icon (`mdi-delete-outline`) aligned to the right.

### Verification Plan
- **Invitation Revocation UI**: Invite a dummy email. Confirm it appears under "Pending Invitations". Click the red "Cancel Invite" button. Confirm that a standard confirmation prompt appears.
- **Successful Deletion**: Click "OK" on the prompt. Confirm that the invitation document is deleted from Firestore and disappears from the "Pending Invitations" table. Verify the success message is shown.
- **Cancel Deletion**: Click "Cancel" on the confirmation prompt and confirm the invitation remains.


## Individualized Time and Expense Invoice Conversion (v40)

### Purpose
Optimize the project-to-invoice conversion workflow to default to generating separate, individual line items on the invoice for each logged time and expense entry, matching the needs of our target contractor/small business owner ICPs. Add a checkbox option on the conversion dialog to optionally combine the entries into single time and expense line items (which restores the old grouped behavior).

### Proposed Changes

#### [MODIFY] [src/composables/useProjects.js](file:///C:/Users/curth/git/swift-invoice/src/composables/useProjects.js)
- Update `buildInvoicePayload(project, entries, options)` to accept an `options` object defaulting to `{}`.
- Extract `groupEntries` (default `false`) from the `options` parameter.
- Implement the default behavior (when `groupEntries === false`) to map each billable time entry to a separate line item with the format: `Labor: [activity description] ([date]) - [hours] hours @ $[rate]/hr`, non-taxable by default.
- Implement the default behavior to map each billable expense entry to a separate line item with the format: `[category]: [expense description] ([date])`, taxable by default.
- Implement the fallback behavior (when `groupEntries === true`) to match the legacy grouped behavior (all labor combined into one line item, all expenses combined into another).

#### [MODIFY] [src/components/ProjectDetail.vue](file:///C:/Users/curth/git/swift-invoice/src/components/ProjectDetail.vue)
- Add new reactive state properties: `showConvertDialog` (default `false`) and `combineEntries` (default `false`).
- Update `convertToInvoice()` to reset `combineEntries.value = false` and set `showConvertDialog.value = true`.
- Implement `confirmConvert()` which calls `buildInvoicePayload` passing `{ groupEntries: combineEntries.value }`, closes the dialog, and routes the user to `InvoiceNew`.
- Add a new `<v-dialog v-model="showConvertDialog">` inside the template featuring:
  - An informative explanation of the conversion settings.
  - A `v-switch` or `v-checkbox` linked to `combineEntries` labeled "Combine entries into single line items".
  - Dialog action buttons ("Cancel" and "Convert") styled with glassmorphism.

### Verification Plan
- **Default Conversion (Individual)**: Log multiple time and expense entries for a project. Click "Convert to Invoice", leave "Combine entries..." unchecked, and click "Convert". Verify that the generated invoice has separate line items for each entry with correct formatting (e.g., `"Labor: HVAC Repair (2026-07-06) - 4 hours @ $75/hr"` and `"Materials: Copper Piping (2026-07-06)"`) and correct taxable flags.
- **Combined Conversion (Grouped)**: Click "Convert to Invoice" on a project, check "Combine entries...", and click "Convert". Verify that the generated invoice contains exactly two line items (one for Labor and one for Expenses) matching the old behavior.
- **Cancellation**: Click "Convert to Invoice", click "Cancel", and verify the dialog closes without initiating any redirect.


## Project and Expense Category Deletion for Owners (v41)

### Purpose
Give Organization Owners the ability to delete projects and expense categories. Project deletion must be cascading (deleting all associated time/expense entries under the project) and protected by a safety confirmation modal where the owner must type the project name to confirm. Expense categories will be managed (added, edited, deleted) inside the `ItemsView.vue` component under a tabbed interface, and their deletion will not affect historical entries.

### Proposed Changes

#### [MODIFY] [src/composables/useProjects.js](file:///C:/Users/curth/git/swift-invoice/src/composables/useProjects.js)
- Import `getDocs` from `firebase/firestore`.
- Modify `deleteProject(id)` to fetch all documents in the `entries` subcollection of the project using `getDocs` and programmatically delete them via `deleteDoc` before deleting the project document itself.

#### [MODIFY] [src/components/ProjectEditor.vue](file:///C:/Users/curth/git/swift-invoice/src/components/ProjectEditor.vue)
- Import `userProfile` from `../composables/useAuth` and compute `isOwner`.
- Import `deleteProject` from `useProjects`.
- Add reactive state `showDeleteConfirm` (default `false`) and `deleteConfirmName` (default `""`).
- Add a "Delete Project" button in the `.form-actions` toolbar on the left (visible only in edit mode to owners).
- Add a `<v-dialog v-model="showDeleteConfirm">` modal requiring the owner to type the project name exactly to enable the permanent delete action.
- Implement `handleDelete()` to execute cascading project deletion and redirect the owner to the `/projects` page.

#### [MODIFY] [src/components/ItemsView.vue](file:///C:/Users/curth/git/swift-invoice/src/components/ItemsView.vue)
- Add a tabbed navigation row to toggle `activeTab` between `'items'` (Invoice Items) and `'categories'` (Expense Categories).
- Create computed properties `standardItems` and `expenseCategories` to split list contents based on `item.type === 'expense-category'`.
- Toggle columns and table items in `<v-data-table>` and mobile list layout dynamically based on `activeTab`.
- Update the create/edit dialog fields: hide description and price fields, and show a "Category Name" field instead, when editing or adding an item of type `'expense-category'`.
- Update standard CRUD callbacks (`saveItem`, `openEditItemDialog`, `openNewItemDialog`) to handle categories seamlessly.
- Update `exportItemsOutput()` to export the active list category or item fields.

### Verification Plan
- **Safety Project Deletion**: Navigate to `/projects/:id/edit` as an Owner. Verify the "Delete Project" button is visible. Click it, type a wrong project name, and verify the delete button remains disabled. Type the correct project name, click delete, and verify the project and all its entries are deleted from Firestore and the user is redirected to the projects list.
- **Member Access Check**: Access `/projects/:id/edit` or `/projects/new` as a member. Verify the route is blocked by the router guard.
- **Expense Category Management**: Navigate to `/items` (Manage Items). Verify the two tabs are rendered. Add a new expense category under the "Expense Categories" tab. Edit its name. Delete it. Verify these actions succeed and that existing expense logs utilizing this category remain intact.
- **CSV Export**: Click "Export CSV" on both tabs and verify it generates the correct fields (Description & Price for standard items; Category Name for categories).


## Team Member Hourly Rate Restriction (v42)

### Purpose
Ensure that team members (users with the role `member`) can only enter their time, cannot view or adjust hourly rates anywhere in the application, and cannot create new expense categories (they can only choose from existing categories created by the owner). Visibility and adjustment of default project rates, individual time entry rates, total billable labor amounts, and creating new expense categories is restricted solely to organization owners.

### Proposed Changes

#### [MODIFY] [src/components/ProjectsView.vue](file:///C:/Users/curth/git/swift-invoice/src/components/ProjectsView.vue)
- Add `v-if="isOwner"` to the highlight billable chip on the project list cards so that members do not see the total billable amount.

#### [MODIFY] [src/components/ProjectDetail.vue](file:///C:/Users/curth/git/swift-invoice/src/components/ProjectDetail.vue)
- Add `v-if="isOwner"` to the total billable summary chip.
- Wrap the hourly rate (`Rate ($/hr)`) text field in the inline time entry form with `v-if="isOwner"`. The form will still initialize with the project's `defaultRate` in `freshTimeEntry()`.
- Wrap the hourly rate (`Rate ($/hr)`) text field in the edit entry dialog with `v-if="isOwner"` for time entries.
- Hide the rate detail (`@ {{ fmt$(entry.rate) }}`) and the subtotal (`{{ fmt$(entry.hours * entry.rate) }}`) in the time entries list for non-owners.
- Replace the expense category `v-combobox` with `v-select` for non-owners so they can only select from pre-existing categories.
- Replace the expense category edit `v-text-field` with `v-select` for non-owners in the edit entry dialog.
- Guard the automatic Firestore category creation inside `submitExpenseEntry()` so it only runs if `isOwner` is true.

#### [MODIFY] [src/components/ProjectEditor.vue](file:///C:/Users/curth/git/swift-invoice/src/components/ProjectEditor.vue)
- Wrap the `Default Hourly Rate ($)` input field with `v-if="isOwner"`.

### Verification Plan
- **Projects List Total Visibility**: Log in as a member. Navigate to Projects. Verify that the project card shows total hours and expenses, but the green "billable" badge/chip is hidden. Log in as owner, verify the "billable" badge/chip is visible.
- **Project Detail Page Total Visibility**: As a member, view project details. Verify that the total billable summary chip is hidden. As owner, verify it is visible.
- **Log Hours rate restriction**: As a member, open the "Log Hours" form. Verify the `Rate ($/hr)` input field is completely hidden. Enter hours and save. Verify the entry is saved successfully and inherits the project's default rate.
- **Edit Hours rate restriction**: As a member, click "Edit" on a time entry. Verify the `Rate ($/hr)` field is hidden in the edit dialog. Modify the hours, save, and verify that the original rate is preserved.
- **Time Entry List display**: As a member, view the Time entries list. Verify that the rate (e.g. `@ $100.00`) and the entry's subtotal are not visible. Only the date, description, hours logged, and billable badge should be visible.
- **Expense Category restriction**: Log in as a member, go to "Add Expense". Verify that the Category field is a dropdown (`v-select`) only allowing choices from existing categories. Type custom category names and verify they cannot be added.
- **Edit Expense Category restriction**: Log in as a member, edit an expense entry. Verify that the Category field is a dropdown (`v-select`) only.


## Team Hours Report (v43)

### Purpose
Introduce a team member hours report under the Reports tab to allow organization owners to filter logged project time entries by date range and team member (including themselves). Provides total hours logged, billable vs non-billable splits, and estimated labor costs, along with options to export the filtered report as CSV (for payroll software imports) or PDF (for immutable storage).

### Proposed Changes

#### [MODIFY] [src/components/ReportsView.vue](file:///C:/Users/curth/git/swift-invoice/src/components/ReportsView.vue)
- Import firestore `db`, collection queries (`getDocs`, `query`, `where`), and composables (`useProjects`, `useOrganization`, `userProfile`).
- Set up state variables for active tab selection, date range (Start/End Date), selected member, loading states, and project entries.
- Add computed lists for team members including the owner.
- Implement the `fetchHoursReportData()` logic to fetch entries dynamically across projects.
- Implement `exportHoursCSV()` and `exportHoursPDF()` export handlers.
- Style metrics cards with custom shadows and text-glows.
- Embed offscreen print-ready layout `hoursReportPrintArea` for the PDF generator.
- Configure PDF print margins (jsPDF margin) and container spacing (CSS padding) to exactly 0.5 inch (36pt/36px) instead of the default 40pt/40px.

### Verification Plan
- **Report Toggle**: Navigate to `/reports` as an Owner. Confirm the "Sales Report" and "Team Hours Report" tabs are rendered.
- **Report Filtering**: Click the "Team Hours Report" tab. Adjust the date ranges and team member selection dropdown. Confirm the metrics cards (Total Hours, Billable/Non-Billable, Estimated Labor Cost) and details table update instantly.
- **CSV Export**: Click "Export CSV". Verify the downloaded file contains the correct columns and values.
- **PDF Export**: Click "Download PDF". Verify the downloaded PDF contains the clean, styled portrait layout of the team member hours.


## Guest Funnel Elimination & GA Route Tracking (v44)

### Purpose
To eliminate conversion friction by routing anonymous guest users directly to registration/signup instead of allowing them to create a full invoice in guest mode only to block them with a paywall modal when trying to save or download. This ensures a transparent CTA structure and drives signups earlier. Additionally, resolves the Google Analytics tracking gap by enabling Vue Router page tracking and logging successful registration events.

### Proposed Changes

#### [MODIFY] [src/router/index.js](file:///C:/Users/curth/git/swift-invoice/src/router/index.js)
- Changed the `/invoice/new` route `requiresAuth` meta setting from `false` to `true` to restrict guest access. Guests attempting to access `/invoice/new` directly will be redirected to the Login page automatically.

#### [MODIFY] [src/components/LandingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/LandingPage.vue)
- Updated the Hero secondary button to point to `/register` with the label "Create Free Account" (replacing the old "Create Guest Invoice" to `/invoice/new`).
- Updated the sub-row links to direct existing users to `/login` with "Already have an account? Log In" (replacing "Or sign up with email").
- Updated the bottom CTA section to remove the guest invoice button entirely and style the remaining options cleanly: "Start Free with Google" (primary) and "Create Account with Email" (secondary, pointing to `/register`).

#### [MODIFY] [src/main.js](file:///C:/Users/curth/git/swift-invoice/src/main.js)
- Passed the `router` instance to `createGtag` so that `vue-gtag` automatically tracks route changes and page views in Google Analytics.

#### [MODIFY] [src/composables/useAuth.js](file:///C:/Users/curth/git/swift-invoice/src/composables/useAuth.js)
- Imported `event` from `vue-gtag` and called `event('sign_up', { method })` inside `createInitialUserData` to fire registration events to Google Analytics, reporting the provider method (Google vs Email).

### Verification Plan
- **Route Guard Redirect**: Navigate to `/invoice/new` as an unauthenticated guest. Confirm the app redirects to `/login`.
- **Landing Page Hero CTAs**: View the Hero section as a guest. Verify "Start Free with Google" and "Create Free Account" (points to `/register`) are the CTAs. Check that the sub-row contains "Already have an account? Log In" pointing to `/login`.
- **Landing Page Bottom CTAs**: Scroll to the bottom of the landing page. Verify only two CTAs are present: "Start Free with Google" (primary layout) and "Create Account with Email" (secondary layout, points to `/register`).
- **Google Analytics Pageviews**: Navigate between routes and check the browser network calls or GA debugger to verify `gtag` pageview events are dispatched on every route transition.
- **GA Conversion Event**: Perform a new user signup and confirm that a `sign_up` event with the correct `method` parameter is fired.


## Guest Funnel Cleanup & Navigation Update (v45)

### Purpose
Clean up dead guest-related code in `InvoiceEditor.vue` and update the navigation menu in `AppBar.vue` to remove the redundant "Create Invoice" link for guests. Since guest access to the invoice editor is now restricted, we ensure clean navigation and maintainable, uncluttered code.

### Proposed Changes

#### [MODIFY] [src/components/AppBar.vue](file:///C:/Users/curth/git/swift-invoice/src/components/AppBar.vue)
- Remove the `{ title: 'Create Invoice', to: '/invoice/new', icon: 'mdi-file-document-edit-outline' }` item from the `guestNav` array.

#### [MODIFY] [src/components/InvoiceEditor.vue](file:///C:/Users/curth/git/swift-invoice/src/components/InvoiceEditor.vue)
- Remove all local storage variables, checkers, and handlers for `swift_invoice_guest_draft`.
- Remove the guest alert banner, the guest preview overlay, the guest auth modal, and related variables/computed properties (`authMode`, `showAuthModal`, etc.).
- Simplify `initializeInvoice()` to directly check if route parameters specify a new invoice and create a fresh one, else fetch the invoice from Firestore.
- Remove all scoped CSS styles for guest banners and the auth modal.

### Verification Plan
- **Guest Navigation**: Verify that when logged out, the "Create Invoice" link is not displayed in the guest navigation drawer or menu.
- **Invoice Editor Cleanliness**: Navigate to `/invoice/new` (after logging in) and verify the page loads correctly and there are no lint or console errors. Confirm that guest-related warning banners and login overlays do not render.
- **Vite Build**: Run `npm run build` to verify that there are no compilation or bundling errors from the cleanup.


## Onboarding Flow Optimization: Option 1 (v46)

### Purpose
Optimize the onboarding flow to prevent user drop-off/friction caused by presenting Stripe Connect onboarding immediately post-registration. We reduce the onboarding wizard `/onboarding` to a single step (Company Details only). Once finished or skipped, the user is redirected straight to the `/dashboard`. Stripe Connect setup is deferred to the Dashboard prompts and the Settings page.

### Proposed Changes

#### [MODIFY] [src/composables/useStripeConnect.js](file:///C:/Users/curth/git/swift-invoice/src/composables/useStripeConnect.js)
- Modify `createConnectAccount(returnPath = '/settings')` to dynamically use the passed `returnPath` parameter for return/refresh URLs instead of the hardcoded `/onboarding`.

#### [MODIFY] [src/components/OnboardingWizard.vue](file:///C:/Users/curth/git/swift-invoice/src/components/OnboardingWizard.vue)
- Remove step indicators, Step 2 (Stripe Connect), and Step 3 (Congratulations screen).
- On saving or skipping company details, redirect directly to `/dashboard`.
- Remove all Stripe Connect dependencies, variables, methods, and scoped styles.

#### [MODIFY] [src/components/UserSettings.vue](file:///C:/Users/curth/git/swift-invoice/src/components/UserSettings.vue)
- Import `createConnectAccount` and `loading: stripeLoading` from `useStripeConnect`.
- Implement `handleStripeConnect` to save settings first and then call `createConnectAccount('/settings')`.
- Bind `handleStripeConnect` to the template CTA button, showing loading spinner state as appropriate.

#### [MODIFY] [src/components/Dashboard.vue](file:///C:/Users/curth/git/swift-invoice/src/components/Dashboard.vue)
- Update Stripe warning/error banners to route to `/settings` instead of `/onboarding?step=2`.

#### [MODIFY] [src/components/InvoiceEditor.vue](file:///C:/Users/curth/git/swift-invoice/src/components/InvoiceEditor.vue)
- Update Stripe warning alert banner to route to `/settings` instead of `/onboarding?step=2`.

### Verification Plan
- **Onboarding Wizard**: Register a new user. Confirm they land on `/onboarding` showing only the Company Details setup (no step indicators). Click "Save & Continue" or "Skip" and verify they are redirected to `/dashboard`.
- **Direct Stripe Connection**: Navigate to Settings. Click "Connect with Stripe" (or "Manage Payment Account"). Verify they are redirected to Stripe with `/settings` as the return URL.
- **Banners Redirection**: Verify clicking "Connect Now" on the Dashboard or Invoice Editor redirect warning correctly routes the user to `/settings`.
- **Vite Build**: Run `npm run build` to confirm no bundling errors occur.


## Invoice Editor Stripe Warning Mobile Fix (v47)

### Purpose
Fix the layout of the Stripe Connect warning banner on the `/invoice/new` route on mobile screens. The default `v-alert` layout with an appended button shrinks and distorts on small viewports. We replace it with a custom responsive flex layout matching the Dashboard warning banner style, which stacks nicely on mobile.

### Proposed Changes

#### [MODIFY] [src/components/InvoiceEditor.vue](file:///C:/Users/curth/git/swift-invoice/src/components/InvoiceEditor.vue)
- Replace `v-alert` Stripe Connect warning with a custom responsive `stripe-warning-banner` div wrapper.
- Add CSS classes `.stripe-warning-banner`, `.banner-content`, `.banner-text-wrapper`, etc., in scoped styles.
- Add media query rules under `@media (max-width: 768px)` to stack the flex container column-wise, align items, and make the button full-width.

### Verification Plan
- **Mobile Viewport**: Emulate mobile viewport. Confirm that the Stripe warning banner stacks vertically, text is fully readable, and the "Connect Now" button spans 100% width cleanly.
- **Desktop Viewport**: Verify that the banner renders as a clean row, aligning the text on the left and the button on the right.
- **Vite Build**: Run `npm run build` to verify clean build compilation.


## Customers View Mobile Layout Fix (v48)

### Purpose
Fix mobile layouts and prevent offscreen rendering and element overlapping on the Customers view page (`/customers`). We update the page header buttons to stack vertically as full-width elements on mobile, scale down title typography, and restructure mobile customer cards to move Edit/Delete actions from the header row into a dedicated actions tray at the bottom of the card.

### Proposed Changes

#### [MODIFY] [src/components/CustomersView.vue](file:///C:/Users/curth/git/swift-invoice/src/components/CustomersView.vue)
- Update `<header>` flex container classes to stack buttons vertically on mobile (`flex-column flex-sm-row w-100 w-sm-auto ga-3`).
- Use responsive button sizes (`:size="mobile ? 'default' : 'large'"`).
- Make heading responsive (`text-h5 text-sm-h4`).
- Modify the mobile view cards loop to move the Edit/Delete actions into a dedicated `<v-card-actions>` layout with divider line and text-truncate name protection.

### Verification Plan
- **Header Responsiveness**: Verify that the header buttons stack cleanly and take full width on mobile viewports.
- **Mobile Card Layout**: Verify customer cards on mobile do not overlap actions with long names. Confirm action buttons appear clearly at the bottom.
- **Vite Build**: Run `npm run build` to confirm compilation is clean.


## Reset Password Page Mobile Alignment (v49)

### Purpose
Align the Reset Password Page styling and responsiveness with the rest of the authentication routes (Login and Register). Previously, the reset password route lacked media queries, causing the layout cards to render with excessive padding and large header sizes on mobile screens.

### Proposed Changes

#### [MODIFY] [src/components/ResetPasswordPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/ResetPasswordPage.vue)
- Add responsive media queries at `@media (max-width: 768px)` and `@media (max-width: 480px)` to shrink header typography, adjust view margins, and optimize card padding for mobile screens.

### Verification Plan
- **Mobile Responsiveness**: Test the page under mobile viewport presets. Confirm card padding adjusts down to `1.5rem` / `1rem` and title fonts decrease to `1.75rem`.
- **Vite Build**: Run `npm run build` to verify clean compilation.


## User Guide & Documentation Update (v50)

### Purpose
Update both the user guide markdown file (`USER_GUIDE.md`) and the in-app interactive user guide page (`UserGuidePage.vue`) to cover the wide range of new platform features including Stripe Connect payments, project time/expense tracking, role-based member restrictions, team collaboration/seats, items and categories directory segmentation, and the Team Hours Report.

### Proposed Changes

#### [MODIFY] [USER_GUIDE.md](file:///C:/Users/curth/git/swift-invoice/USER_GUIDE.md)
- Update "1. How to Create an Invoice" to reference the line-item level "Tax" toggles and "(No Tax)" templates indicator.
- Update "2. How to Update Your Business Information" to mention the single-step onboarding wizard.
- Update "3. How to Create Customers and Products" to become "3. How to Create Customers, Products, and Expense Categories". Document the separate tabs under the Items page, and the owner-only restrictions for creating expense categories.
- Update "5. How to View and Generate Reports" to explain the Sales Report KPIs and add a new sub-section for the "Team Hours Report" (Owners-only, filters, CSV/PDF export).
- Add "6. How to Set Up Stripe Connect & Accept Payments" detailing setup, auto-syncing merchant details, payment methods, and invoice QR codes.
- Add "7. How to Use Project & Time/Expense Tracking" covering project creation, logging hours, uploading receipt photos, cascading deletions, and the "Convert to Invoice" options (Individual vs. Combined line items).
- Add "8. How to Manage Team Seats & Collaboration" covering email invitations, member seat revoking, invitation cancelation, and a detailed member-role restriction breakdown.

#### [MODIFY] [src/components/UserGuidePage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/UserGuidePage.vue)
- Update the hardcoded `sections` array to match the updated table of contents and steps from `USER_GUIDE.md`.
- Include the new sections: Stripe Connect (`stripe-connect`), Project Tracking (`project-tracking`), and Team Collaboration (`team-collaboration`).
- Expand the existing segments (Customers & Items, Reports) with the new sub-features.

### Verification Plan
- **Markdown Audit**: Check that `USER_GUIDE.md` is formatted correctly and contains all steps matching the prompt questions answers.
- **In-App Navigation**: Run the app locally, visit `/guide`, and verify that the new sections are rendered correctly with their respective timeline badges and icons.
- **Search Functionality**: Test searching for terms like "Stripe", "Project", "Team", "Member", "Hours", and ensure expansion panels collapse/expand dynamically.
- **Vite Build**: Run `npm run build` to verify clean compilation.


## Landing Page Free Tier Copy Correction (v51)

### Purpose
Align the landing page's default risk-reduction text with the actual free tier limits enforced by the application (unlimited projects/time tracking and a limit of 5 free invoices).

### Proposed Changes

#### [MODIFY] [src/components/LandingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/LandingPage.vue)
- Update `riskReductionText` computed property's default fallback case (lines 617-618) to read: `'Free tier includes unlimited projects and 5 free invoices. No credit card required.'`

### Verification Plan
- **Landing Page Check**: Load the landing page in the default variant and confirm the risk-reduction text reads: "Free tier includes unlimited projects and 5 free invoices. No credit card required."
- **Vite Build**: Run `npm run build` to ensure the project compiles cleanly.


## Time is Money Landing Page & Campaign Tracking (v52)

### Purpose
Implement a custom landing page at `/lp/time-is-money` optimized for the "TIME is MONEY" Facebook Reel / YouTube Short campaign. This page features tailored copy that aligns with the video content (focusing on time & expense tracking, team collaboration, and not giving away hard-earned time) and implements tracking mechanisms to identify signups and page views originating from the Facebook Reel promotion.

### Proposed Changes

#### [NEW] [src/components/TimeIsMoneyLandingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/TimeIsMoneyLandingPage.vue)
- Create a simple wrapper component that loads `LandingPage.vue` with `variant="time_is_money"`.
- Set `signup_source` in `sessionStorage` to `'lp_time_is_money'` on mount.
- Send a custom Meta Pixel tracking event `ViewTimeIsMoneyReelPromotion` to isolate traffic driven from the Reel campaign.

#### [MODIFY] [src/components/LandingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/LandingPage.vue)
- Update computed text properties (`heroTitleText`, `heroTitleHighlight`, `heroSubtitleText`, `badges`, `trustRatingText`, `testimonials`, `metaTitle`, `metaDescription`) to return high-impact time-tracking copy for the `time_is_money` variant matching the video prompts.

#### [MODIFY] [src/router/index.js](file:///C:/Users/curth/git/swift-invoice/src/router/index.js)
- Register the route `/lp/time-is-money` mapping to the new `TimeIsMoneyLandingPage` component.

#### [MODIFY] [scripts/generate-lp-meta.js](file:///C:/Users/curth/git/swift-invoice/scripts/generate-lp-meta.js)
- Add the `lp/time-is-money` configuration (metadata title, description, and canonical URL) to the static meta tags generation page list.

### Verification Plan
- **Route Access**: Navigate to `/lp/time-is-money`. Confirm that the custom copy for "TIME is MONEY" renders correctly.
- **Tracking Verification**: Confirm that `sessionStorage.getItem('signup_source')` is set to `'lp_time_is_money'` when visiting the page.
- **Pixel Call**: Verify that `fbq` is invoked for both the custom event `ViewTimeIsMoneyReelPromotion` and `ViewContent` with `LP - time_is_money`.
- **Meta Generator**: Run `npm run build` and verify that `dist/lp/time-is-money/index.html` is generated with correct title and og:meta properties.


## Dynamic Device Mockup Hero Section (v53)

### Purpose
Replace the static corporate "deconstructed workspace" hero image (`/branded_hero_v7.png`) with a highly interactive, responsive, and gorgeous CSS-based Device Mockup system that dynamically adapts to the visitor's landing page variant. This ensures that users coming from specific Meta Ads (like the "Time is Money" ad campaign) immediately see mobile mockups representing their specific business context (e.g., tracking crew hours and receipt photo uploads, sending invoices on-site, or weekend payout success screens), maximizing conversion rates.

### Proposed Changes

#### [MODIFY] [src/components/LandingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/LandingPage.vue)
- Update the hero-image slot:
  - Render a browser + floating phone composite for the `standard` variant, featuring revenue dashboards, bar charts, and QR code billing.
  - Render a crew time-tracker phone frame for the `time_is_money` variant, showcasing logged crew hours in whole integers (e.g. "24 Hours"), crew rates, and today's logged expenses with receipt status.
  - Render a mobile invoice preview phone frame for the `contractor` variant, showing typical plumbing leak repair service lines and total due.
  - Render a payment confirmation & payout status screen phone frame for the `weekend` variant, highlighting Chase checking account instant deposits and zero billing hours.
- Implement floating glassmorphic badges (`.floating-badge`) layered above the mockups to create 3D visual depth, featuring CSS hover bounce animations.
- Add CSS styling for responsive, glassmorphic phone frames (notch, buttons, neon glows, glares) and custom components, supporting full mobile-first stacking.

### Verification Plan
- **Standard Mockup**: Visit `/` and verify the desktop dashboard browser preview and floating QR scanner mobile mockup display correctly.
- **Time is Money Mockup**: Visit `/lp/time-is-money` and confirm the active Crew Timer (04:32:18) and Today's Expenses logs display correctly with floating badges ("No Lost Hours", "Receipt Photo Uploaded").
- **Contractor Mockup**: Visit `/lp/get-paid-faster` and confirm the Plumbing leak repair invoice form and floating payment badges render correctly.
- **Weekend Mockup**: Visit `/lp/weekend-freedom` and verify the green paid decagram icon and Bank Payout initiated banner display correctly.
- **Responsive Stacking**: Emulate mobile viewport on all variants. Ensure the CSS mockups scale down cleanly and stack neatly under the hero headline without overflow or horizontal scrolling.
- **Vite Build**: Run `npm run build` to confirm no bundling errors occur.


## Project Editor Delete Button Mobile Fix (v54)

### Purpose
Fix a mobile layout bug on the Project Edit page where the "Delete Project" button renders off the left side of the screen on small viewports. This is caused by the `mr-auto` (margin-right: auto) flex layout utility class forcing the button to the edge without proper container constraints or wrapping rules on mobile.

### Proposed Changes

#### [MODIFY] [src/components/ProjectEditor.vue](file:///C:/Users/curth/git/swift-invoice/src/components/ProjectEditor.vue)
- Update CSS styling under `@media (max-width: 640px)` for `.form-actions`:
  - Set `flex-direction: column-reverse` to stack the action buttons vertically.
  - Set `align-items: stretch` and `gap: 0.75rem` for uniform margins and padding.
  - Force `.form-actions .v-btn` to take `width: 100% !important` and remove default horizontal margins using `margin: 0 !important` to override the desktop `mr-auto` and `mr-2` positioning.

### Verification Plan
- **Desktop Layout**: Navigate to `/projects/:id/edit` on a desktop screen. Verify that the "Delete Project" button sits on the far-left side of the actions bar, while "Cancel" and "Save Changes" sit on the right side.
- **Mobile Layout**: Emulate a mobile screen (width <= 640px). Verify that all three buttons stack vertically, spanning the full width of the container, with "Save Changes" at the top, "Cancel" in the middle, and "Delete Project" at the bottom with clean spacing.
- **Vite Build**: Run `npm run build` to confirm no bundling errors occur.


## Mobile Device Aspect Ratio and Bezel Realism (v55)

### Purpose
Redesign the CSS phone mockups in the Hero section of the landing page to feature a realistic modern smartphone aspect ratio (19.5:9), classic iPhone 11/12 notch style, uniform premium bezels, glass reflection glare, and a balanced grid layout that ensures perfect scale and responsiveness across all device viewports.

### Proposed Changes

#### [MODIFY] [src/components/LandingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/LandingPage.vue)
- Update CSS styling of `.phone-frame`:
  - Set `aspect-ratio: 9 / 19.5` for a realistic vertical profile matching modern iPhones.
  - Implement a uniform black bezel using `padding: 12px` and a thin metallic edge border highlight.
  - Remove all redundant, conflicting `min-height` rules on the screen and frames.
- Re-design `.phone-notch`:
  - style as a classic iPhone 11/12 trapezoidal notch projecting down from the top edge bezel.
  - Add pseudo-elements representing the physical speaker grille capsule and the front-facing camera lens dot with a blue-teal reflection glow.
- Introduce screen glare styling:
  - Add a diagonal CSS linear-gradient overlay on `.phone-screen::before` to emulate the reflective property of physical glass screens.
- Implement responsive balanced grid adjustments:
  - Modify `.floating-phone-mockup` to use percentage width (`width: 38%`) and container-relative offsets instead of fixed `200px` width.
  - Scale down notch dimensions inside media queries for the floating phone mockup to maintain visual proportions.
  - Adjust margins and layout heights of screen elements (timer widget, items list, scanner visual) to occupy the taller display area gracefully.

### Verification Plan
- **Mockup Aspect Ratio**: Check that both the big phone (320px width) and floating phone (responsive 38% width) maintain a tall 19.5:9 proportion.
- **Classic Notch Details**: Verify the speaker grille and camera reflection lens are visible on the notch at the top center.
- **Responsive Balance**: Check the layout at multiple viewport widths (1200px, 980px, 768px, 480px) to verify that the floating phone scales down proportionally with the browser mockup, and that text remains perfectly legible.
- **Vite Build**: Run `npm run build` to confirm there are no bundling or stylesheet errors.


## Quirky Catch-All 404 Page (v56)

### Purpose
Redesign the catch-all `NotFound.vue` page into a stunning, responsive, themed experience that aligns with the app's premium dark glassmorphic styling. The page will present the quirky and humbly apologetic message: "Seems we Scan't Go to that page right now. Try back later." and incorporate an interactive scanning/grid visual representing the "ScanGo" invoice capture concept to maintain brand context and visual interest.

### Proposed Changes

#### [MODIFY] [src/components/NotFound.vue](file:///C:/Users/curth/git/swift-invoice/src/components/NotFound.vue)
- Set up a beautiful glassmorphic container matching the `#111d2f` navy theme and standard design tokens (blur, borders, glows).
- Embed a custom interactive CSS illustration: a stylized camera viewfinder/document scanning card representing a failed scan, with a red/amber blinking scanning beam animation, a central 404 watermark, and interactive hover effects.
- Display the apologetic heading and the requested quirky description: "Seems we Scan't Go to that page right now. Try back later."
- Add navigation logic using `currentUser` from `useAuth.js` to redirect users:
  - If authenticated, display a main button "Go to Dashboard" and a secondary text link "View Homepage".
  - If a guest, display a main button "Go to Homepage" and a secondary text link "Log In".
- Apply full SEO tagging via `useMeta`.
- Add responsive media queries to ensure the visual elements stack nicely and scale correctly on small viewports.

### Verification Plan
- **Aesthetic Match**: Navigate to a non-existent URL (e.g. `/non-existent-page`). Verify that the base background is deep navy, matching the rest of the application.
- **Visual Design & Interactive Scanner**: Check that the glassmorphic card has appropriate borders, backdrops, and box-shadow glows. Ensure the scanning beam animation is moving, and hover effects are smooth.
- **Copy Verification**: Confirm the description text exactly says "Seems we Scan't Go to that page right now. Try back later."
- **Conditional Buttons (Auth vs Guest)**:
  - If logged in, verify the CTA button points to `/dashboard` ("Go to Dashboard") and the secondary link points to `/` ("Back to Homepage").
  - If logged out, verify the CTA button points to `/` ("Go to Homepage") and the secondary link points to `/login` ("Log In").
- **Responsive Scaling**: Resize the viewport down to mobile width (e.g. 375px) and verify the text and layout wrap cleanly without overflow.
- **Build Checks**: Run `npm run build` to verify there are no syntax or build errors.


## Google Analytics Page Tracking Fix (v57)

### Purpose
Fix Google Analytics page tracking which was failing due to improper plugin initialization. The router instance was passed as a secondary argument to `createGtag` (which is ignored by `vue-gtag` next), and invalid/unsupported configuration keys (`storage`, `storageKey`, `consent`) were used. We will switch `vue-gtag` to `initMode: 'manual'`, properly configure automatic route tracking using `pageTracker.router`, initialize Google Analytics on page load based on `localStorage` consent status, and update the Cookie Banner component to dynamically initialize tracking and update consent signals without requiring page reloads.

### Proposed Changes

#### [MODIFY] [src/main.js](file:///C:/Users/curth/git/swift-invoice/src/main.js)
- Remove unsupported options (`storage`, `storageKey`, `consent`) from the `createGtag` configuration object.
- Configure `initMode: 'manual'` to prevent premature tracking script injection before consent is verified.
- Configure `pageTracker: { router }` to enable automatic route change tracking.
- Add page-load check: if `localStorage` consent is `'true'`, invoke `addGtag()` and `consentGrantedAll('update')` immediately.

#### [MODIFY] [src/components/TheCookieBanner.vue](file:///C:/Users/curth/git/swift-invoice/src/components/TheCookieBanner.vue)
- Replace the buggy `useConsent()` composable with direct calls to `addGtag()`, `consentGrantedAll()`, and `consentDeniedAll()`.
- Update `handleAccept` to set `localStorage` consent to `'true'`, trigger script injection and route tracking via `addGtag()`, grant consent parameters via `consentGrantedAll('update')`, and hide the banner without reloading.
- Update `handleDecline` to set `localStorage` consent to `'false'`, deny consent parameters via `consentDeniedAll('update')`, and hide the banner.

### Verification Plan
- **Consent Banner and Cookie Storage**: Clear storage/cookies. Visit the page and confirm the banner shows. Click "Accept". Verify that the script tag for Google Analytics is injected, `localStorage` has `cookie_consent_given: "true"`, and the browser console logs "Google Analytics consent granted".
- **Dynamic Initialization (No Reload)**: Confirm that clicking "Accept" does not trigger a page refresh, but tracking starts immediately.
- **Route Tracking**: Navigate across different routes (e.g. landing page to pricing, about us, features). Verify that page view events are logged for each route (using network panel or Google Analytics debugger).
- **Subsequent Load Persistence**: Reload the page with consent already given. Confirm the GA script loads automatically without showing the banner.
- **Decline Behavior**: Clear storage, reload, click "Decline". Verify `localStorage` has `cookie_consent_given: "false"`, and GA script is NOT loaded.
- **Vite Build**: Run `npm run build` to confirm compilation is clean.


## Mobile View Header & Button Styling Alignment (v58)

### Purpose
Align the mobile styling of headers, button sizes, button order, and spacing across all secondary views (ItemsView.vue, ProjectsView.vue, ReportsView.vue, InvoiceList.vue) to match the responsive behavior of CustomersView.vue. This includes ensuring that action buttons stack vertically on mobile (taking up full width), primary action buttons (like "Add" or "Create") appear first/on top of secondary actions (like "Export CSV"), and using standard responsive size/width utilities.

### Proposed Changes

#### [MODIFY] [src/components/CustomersView.vue](file:///C:/Users/curth/git/swift-invoice/src/components/CustomersView.vue)
- Reorder header actions so that the "Add Customer" button is placed before the "Export CSV" button in the DOM. This ensures that in a column flex layout on mobile, the primary CTA ("Add Customer") appears on top, while on desktop it appears on the left of "Export CSV".

#### [MODIFY] [src/components/ItemsView.vue](file:///C:/Users/curth/git/swift-invoice/src/components/ItemsView.vue)
- Update `<header>` block:
  - Add standard `ga-4` and `mb-6` classes to the `<header>` element.
  - Set class `text-h5 text-sm-h4 font-weight-bold mb-0` on the title `h1`.
  - Update the button container to use: `class="d-flex align-center w-100 w-sm-auto ga-3 flex-sm-row flex-column"`.
  - Reorder the buttons to place the "Add Item/Category" button first and the "Export CSV" button second.
  - Add `:size="mobile ? 'default' : 'large'"` to both buttons.
  - Update classes on both buttons: `class="elevation-2 w-100 w-sm-auto"` for the "Add Item/Category" button and `class="elevation-2 bg-transparent w-100 w-sm-auto"` for the "Export CSV" button (removing `me-3` since `ga-3` handles spacing).

#### [MODIFY] [src/components/ProjectsView.vue](file:///C:/Users/curth/git/swift-invoice/src/components/ProjectsView.vue)
- Import `useDisplay` from `'vuetify'` and define `const { mobile } = useDisplay();`.
- Update the `<header>` action block:
  - Wrap the "New Project" button in a container: `<div v-if="isOwner" class="d-flex align-center w-100 w-sm-auto ga-3 flex-sm-row flex-column">`.
  - Update the "New Project" button to use `:size="mobile ? 'default' : 'large'"` and add responsive classes: `class="elevation-2 w-100 w-sm-auto"`.

#### [MODIFY] [src/components/ReportsView.vue](file:///C:/Users/curth/git/swift-invoice/src/components/ReportsView.vue)
- Update `<header>` block:
  - Add standard classes to the `<header>` element: `reports-header d-flex justify-space-between align-center mb-6 flex-wrap ga-4`.
  - Update the button container to use: `class="d-flex align-center w-100 w-sm-auto ga-3 flex-sm-row flex-column mt-4 mt-sm-0"`.
  - Reorder the buttons under both tab templates ("sales" and "hours") to place the "Download PDF" button first and the "Export CSV" button second in the DOM.
  - Add `:size="mobile ? 'default' : 'large'"` to all action buttons in the header.
  - Set classes on buttons: `class="elevation-2 w-100 w-sm-auto action-btn"` for "Download PDF" and `class="elevation-2 bg-transparent w-100 w-sm-auto action-btn"` for "Export CSV" (removing `mr-2` and `action-btn` margins).

- In `<style scoped>` block:
  - Add a mobile media query for `.list-header` to set `flex-direction: column`, `align-items: stretch !important`, and `gap: 1rem` under `max-width: 600px`.
  - Update `.create-btn` inside the media query to set `width: 100%` and `justify-content: center` to make it span full-width on mobile.

#### [MODIFY] [src/components/TeamSettings.vue](file:///C:/Users/curth/git/swift-invoice/src/components/TeamSettings.vue)
- Import `useDisplay` from `'vuetify'` and define `const { mobile } = useDisplay();`.
- Update the access denied and main settings header blocks:
  - Re-structure headers to match `CustomersView.vue` responsive wrapper classes: `<header class="d-flex justify-space-between align-center mb-6 flex-wrap ga-4">` and place description `<p>` tags outside/below the `<header>`.
  - Wrap the "Back to Dashboard" button in a flex container: `<div class="d-flex align-center w-100 w-sm-auto ga-3 flex-sm-row flex-column">` and update the button to use `:size="mobile ? 'default' : 'large'"` and `class="back-btn elevation-2 w-100 w-sm-auto"`.
- Update the edit member modal actions:
  - In `v-card-actions`, change class to: `class="px-6 pb-6 pt-2 d-flex flex-sm-row flex-column ga-2"`.
  - Reposition "Save Changes" to be first in the DOM with class `w-100 w-sm-auto order-sm-2 ml-0` and "Cancel" second with class `w-100 w-sm-auto order-sm-1`. This guarantees that on mobile the buttons stack vertically with "Save Changes" on top, and on desktop they render side-by-side with "Cancel" on the left of "Save Changes".
- Clean up unused CSS rules:
  - Remove `.settings-header`, `.settings-header h1`, `.settings-header p` styles.
  - Remove mobile media overrides for `.settings-header` and `.back-btn`.

### Verification Plan
- **Button Stacking & Sizing (Mobile)**: Emulate a mobile screen (width <= 600px). Verify that the header actions stack vertically, taking up 100% width on:
  - Customers page (`/customers`)
  - Items page (`/items`)
  - Projects page (`/projects`)
  - Reports page (`/reports`)
  - Invoices page (`/invoices`)
  - Team page (`/team`)
- **Primary Button Priority**: Verify that the primary button (Add/Create/Download PDF) appears *on top* of the Export button in all these mobile headers.
- **Modal Dialog Sizing & Stacking**: On mobile, open the "Edit Member Details" modal. Verify that the "Save Changes" button stacks on top of the "Cancel" button, and both buttons span 100% width. On desktop, verify that they align horizontally on the right side of the modal.
- **Desktop Layout**: Verify that all headers restore to their side-by-side flex layouts on wider screens (>= 960px).
- **Vite Build**: Run `npm run build` to confirm compilation is clean.


## SMS Privacy Policy Carrier Compliance Update (v59)

### Purpose
Update PrivacyPolicy.vue to explicitly include the mandatory A2P 10DLC SMS privacy clause required by mobile carriers (AT&T, T-Mobile, Verizon) for Twilio campaign registration approval. Mobile originator opt-in data and SMS consent must be explicitly excluded from third-party data sharing.

### Proposed Changes

#### [MODIFY] [src/components/PrivacyPolicy.vue](file:///C:/Users/curth/git/swift-invoice/src/components/PrivacyPolicy.vue)
- Add a dedicated subsection/list item under Section 4 ("Our Commitment to Your Privacy") and Section 3 explicitly stating that mobile phone numbers, SMS consent, and text messaging originator opt-in data will not be shared, sold, or rented to third parties or affiliates for marketing or promotional purposes.

### Verification Plan
- **Content Verification**: View `/privacy` in the browser or check component template to confirm the SMS Privacy & Carrier Compliance clause is rendered clearly under Privacy Commitments.
- **Vite Build**: Run `npm run build` to ensure clean compilation without errors.


## SMS Terms of Service Carrier Compliance Update (v60)

### Purpose
Update TermsOfService.vue to include a dedicated SMS Messaging Terms section covering message frequency, message/data rates, opt-out (STOP), and support (HELP) disclosures to ensure 100% compliance with Twilio A2P 10DLC vetting guidelines.

### Proposed Changes

#### [MODIFY] [src/components/TermsOfService.vue](file:///C:/Users/curth/git/swift-invoice/src/components/TermsOfService.vue)
- Add Section 11 ("SMS Messaging Terms") covering SMS invoice notifications, message frequency, carrier rate warnings, STOP to cancel, and HELP for support.

### Verification Plan
- **Content Verification**: Confirm Section 11 renders on `/terms`.
- **Vite Build & Deploy**: Run `npm run build` and deploy hosting to Firebase.



### Proposed Changes

#### [MODIFY] [src/components/LandingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/LandingPage.vue)
- Update `.hero-image` block:
  - Add `.hero-image-wrapper` containing base `<img>` (`/branded_hero_v7.png`) and overlay `<img>` (`/new_hero.gif`) wrapped in Vue `<Transition name="fade-overlay">`.
- Update `<script setup>`:
  - Define `gifSrc` initialized on mount with cache-busting timestamp (`/new_hero.gif?t=${Date.now()}`).
  - Set `showGifOverlay = ref(true)` on mount and set a timer for 19,200 ms (exact duration of 3 loops of `new_hero.gif`), after which `showGifOverlay.value = false`.
- Add `<style scoped>` rules:
  - `.hero-image-wrapper` relative positioning, rounded corners, glassmorphic box-shadow.
  - `.gif-overlay-img` absolute positioning covering `.base-hero-img`.
  - `.fade-overlay-leave-active` with `transition: opacity 1.5s ease-in-out` and `opacity: 0`.

### Verification Plan
- **Visual & Animation Check**: Open `/` and secondary landing pages (`/lp/weekend-freedom`, `/lp/get-paid-faster`, `/lp/time-is-money`). Verify `new_hero.gif` plays over `branded_hero_v7.png` and gently fades out after ~19 seconds to reveal `branded_hero_v7.png`.
- **Vite Build & Deploy**: Run `npm run build` and deploy hosting to Firebase.


## iPhone Frame Simulated Container for Hero GIF & Image Fade (v62)

### Purpose
Wrap both the base `branded_hero_v7.png` and overlay `new_hero.gif` inside a simulated iPhone device frame (`.phone-frame.big-phone` with hardware `.phone-notch` and rounded `.phone-screen`). The 3-loop animation of `new_hero.gif` plays directly within the iPhone screen viewport and smoothly fades out over 1.5 seconds to reveal `branded_hero_v7.png` inside the iPhone mockup.

### Proposed Changes

#### [MODIFY] [src/components/LandingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/LandingPage.vue)
- Update `.hero-image` template block:
  - Enclose `.base-hero-img` and `.gif-overlay-img` inside `<div class="phone-frame shadow-glow big-phone"><div class="phone-notch"></div><div class="phone-screen position-relative overflow-hidden">...</div></div>`.
- Update `.hero-image` scoped CSS:
  - Ensure `.phone-screen` has `position: relative; width: 100%; height: 100%; border-radius: 28px; overflow: hidden;`.
  - Position `.gif-overlay-img` absolutely inside `.phone-screen` covering `.base-hero-img`.

### Verification Plan
- **Visual Check**: Inspect hero section on desktop and mobile viewports. Verify `new_hero.gif` plays inside the iPhone mockup frame, loops 3 times, and gently fades out to reveal `branded_hero_v7.png` within the iPhone frame.
- **Vite Build & Deploy**: Run `npm run build` and deploy hosting to Firebase.


## Simulated iPhone Frame Overlay Fade revealing static branded_hero_v7.png (v63)

### Purpose
Position the simulated iPhone device frame (with notch, bezel, shadow, and playing `new_hero.gif`) as a floating overlay on top of the static `branded_hero_v7.png` hero image. After 3 loops of the animated GIF (19.2s), the entire iPhone frame overlay performs a gentle 1.5s fade-out transition to reveal the full static `branded_hero_v7.png` hero image underneath.

### Proposed Changes

#### [MODIFY] [src/components/LandingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/LandingPage.vue)
- Update `.hero-image` template block:
  - Render static `base-hero-img` (`/branded_hero_v7.png`) as the underlying hero element.
  - Overlay `<Transition name="fade-overlay"><div v-if="showGifOverlay" class="phone-frame-overlay shadow-glow big-phone">...</div></Transition>` centered on top.
- Update scoped CSS:
  - `.phone-frame-overlay` positioned `absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10;`.
  - `.fade-overlay-leave-active` with `transition: opacity 1.5s ease-in-out` and `opacity: 0`.

### Verification Plan
- **Visual & Animation Check**: Open `/` and secondary landing pages (`/lp/weekend-freedom`, `/lp/get-paid-faster`, `/lp/time-is-money`). Verify the iPhone frame plays `new_hero.gif` on top of `branded_hero_v7.png`, then the entire iPhone frame gently fades out to reveal `branded_hero_v7.png`.
- **Vite Build & Deploy**: Run `npm run build` and deploy hosting to Firebase.


## Top-Alignment & Aspect Ratio Calibration for Hero GIF (v64)

### Purpose
Calibrate `.gif-overlay-img` with `object-position: top center` and match `.phone-frame-overlay` aspect ratio to `1080 / 2289` so that the top edge of `new_hero.gif` aligns flush with the top of the simulated iPhone frame viewport.

### Proposed Changes

#### [MODIFY] [src/components/LandingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/LandingPage.vue)
- Update `.phone-frame-overlay` aspect ratio to `1080 / 2289`.
- Update `.gif-overlay-img` CSS rules with `object-fit: cover; object-position: top center;`.

### Verification Plan
- **Visual Check**: Open landing page hero section. Verify the status bar / top header of `new_hero.gif` aligns flush at the top of the iPhone screen right under the hardware notch.
- **Vite Build & Deploy**: Run `npm run build` and deploy hosting to Firebase.


## Top White Bar Removal & Aspect Ratio Calibration (v65)

### Purpose
Crop the top 44px white border/padding present in `new_hero.gif` so that the app's top navigation bar starts at row 0 (size 1080x2245). Update `.phone-frame-overlay` CSS aspect-ratio to `1080 / 2245` so `new_hero.gif` fits 100% flush against the top inner edge of `.phone-screen` without any gap.

### Proposed Changes

#### [MODIFY] [public/new_hero.gif](file:///C:/Users/curth/git/swift-invoice/public/new_hero.gif)
- Crop top 44px white margin across all frames.

#### [MODIFY] [src/components/LandingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/LandingPage.vue)
- Update `.phone-frame-overlay` aspect ratio to `1080 / 2245`.

### Verification Plan
- **Visual Check**: Refresh landing page and verify `new_hero.gif` is 100% flush at the top of the iPhone screen viewport right below the notch with zero gap.
- **Vite Build & Deploy**: Run `npm run build` and deploy hosting to Firebase.


## Full Height Uncropped GIF in Simulated iPhone Frame (v66)

### Purpose
Display uncropped `new_hero.gif` in its full native height (1080x2289) wrapped inside the simulated iPhone frame (`.phone-frame.big-phone`). The GIF plays for 3 loops inside the iPhone viewport and gently fades out over 1.5 seconds to reveal `branded_hero_v7.png` inside the iPhone mockup frame.

### Proposed Changes

#### [MODIFY] [src/components/LandingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/LandingPage.vue)
- Update `.hero-image` template:
  - Place `.phone-frame.big-phone` containing `.phone-notch` and `.phone-screen`.
  - Position `.base-hero-img` (`/branded_hero_v7.png`) as base and `.gif-overlay-img` (`new_hero.gif`) wrapped in `<Transition name="fade-overlay">`.
- Update scoped CSS:
  - Set `.phone-frame.big-phone` with `aspect-ratio: 1080 / 2289; width: 340px; max-width: 100%; border-radius: 44px; padding: 12px;`.
  - Set `.gif-overlay-img` with `width: 100%; height: 100%; object-fit: fill; border-radius: 32px;`.
  - Set `.fade-overlay-leave-active` with `transition: opacity 1.5s ease-in-out` and `opacity: 0`.

### Verification Plan
- **Visual Check**: Open landing page. Confirm `new_hero.gif` plays in full height within the iPhone frame for 3 loops, then gently fades to reveal `branded_hero_v7.png`.
- **Vite Build & Deploy**: Run `npm run build` and deploy hosting to Firebase.


## Limit Base PNG Hero Image to Phone Frame Width (v69)

### Purpose
Update CSS rules for `.base-hero-img` in `LandingPage.vue` to restrict `branded_hero_v7.png` to the exact width of the simulated iPhone frame (`max-width: 100%; width: 100%; object-fit: contain;`), preventing any scaling, zooming, or side cropping of the static PNG image within the phone screen viewport.

### Proposed Changes

#### [MODIFY] [src/components/LandingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/LandingPage.vue)
- Update `.base-hero-img` CSS:
  - Add `max-width: 100%; width: 100%; object-fit: contain;`.

### Verification Plan
- **Visual Check**: Open landing page. Verify `branded_hero_v7.png` is constrained precisely to the width of `.phone-screen` without overflow or cropping.
- **Vite Build & Deploy**: Run `npm run build` and deploy hosting to Firebase.


## Interactive Replay Demo Button inside Phone Frame (v70)

### Purpose
Add a sleek glassmorphic "Replay Demo" button positioned inside the `.phone-screen` below `branded_hero_v7.png` that appears automatically whenever `showGifOverlay` is false. Clicking the button restarts `new_hero.gif` from frame 0 and runs the 3-loop animation again before fading back to the static PNG.

### Proposed Changes

#### [MODIFY] [src/components/LandingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/LandingPage.vue)
- Update `.phone-screen` template:
  - Add `<Transition name="fade-overlay"><button v-if="!showGifOverlay" class="replay-btn" @click="replayGifAnimation">...</button></Transition>`.
- Update `<script setup>`:
  - Extract `startGifTimer()` helper function to handle timestamp cache-busting, setting `showGifOverlay.value = true`, and clearing/setting the 19.2s `gifTimer`.
  - Add `replayGifAnimation` handler.
- Add scoped CSS:
  - `.replay-btn` styled with dark glassmorphism, glowing teal border, hover scale effect, and absolute positioning at the bottom center of `.phone-screen`.

### Verification Plan
- **Interactive Check**: Wait for `new_hero.gif` to finish 3 loops and fade to `branded_hero_v7.png`. Click "Replay Demo". Confirm `new_hero.gif` starts playing again from frame 0 for 3 loops.
- **Vite Build & Deploy**: Run `npm run build` and deploy hosting to Firebase.


## A2P 10DLC SMS Opt-In Carrier Compliance Resubmission Update (v71)

### Purpose
Update `RegisterPage.vue` to include an optional mobile phone number field alongside an un-ticked, explicit SMS opt-in checkbox with 100% compliant CTIA and mobile carrier disclosure text (including Brand Name, purpose, message frequency, rate warning, STOP/HELP keywords, and explicit links to Privacy Policy and Terms of Service). This matches Twilio A2P 10DLC vetting requirements and provides a live, verifiable opt-in mechanism on `https://scangoinvoice.com/register`.

### Proposed Changes

#### [MODIFY] [src/components/RegisterPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/RegisterPage.vue)
- Add `phone` and `smsOptIn` reactive state variables.
- Add `<input type="tel" id="phone" ... />` field.
- Add un-ticked opt-in checkbox (`#sms-opt-in`) with verbatim carrier compliance text:
  *"I agree to receive SMS billing notifications, payment reminders, and invoice links from ScanGo Invoice LLC. Message frequency varies. Message and data rates may apply. Reply STOP to cancel or HELP for help. View our Privacy Policy and Terms of Service."*
- Add scoped CSS for `.opt-in-group`, `.checkbox-label`, `.checkbox-text`, and links.

### Verification Plan
- **Verification**: Run `npm run build` to confirm clean compilation.
- **Visual Check**: Check `/register` to verify the phone field and un-ticked SMS consent checkbox with working Privacy Policy & Terms of Service links render correctly.


## Google PageSpeed Assessment & Performance Optimization Plan (v72)

### Purpose
Execute Google PageSpeed / Lighthouse performance assessments across all landing pages (`/`, `/lp/get-paid-faster`, `/lp/weekend-freedom`, `/lp/time-is-money`, `/features`, `/pricing`, `/reviews`, `/about`) and establish an empirical, prioritized action plan to elevate performance scores from ~42–55 to 90+ on Mobile and Desktop.

### Assessment Findings Summary
- **Current Performance Score**: **42 / 100** (Mobile Root), **55 / 100** (Mobile LP)
- **Accessibility**: 90 / 100
- **Best Practices**: 71 / 100
- **SEO**: 83 / 100
- **Key Metrics**:
  - **FCP (First Contentful Paint)**: 7.2s – 11.3s (Target: <1.8s) ⚠️
  - **LCP (Largest Contentful Paint)**: 12.3s – 20.5s (Target: <2.5s) 🔴
  - **TBT (Total Blocking Time)**: 90ms – 670ms (Target: <200ms) ⚠️
  - **CLS (Cumulative Layout Shift)**: 0.012 – 0.022 (Target: <0.1) ✅

### Root Cause Bottlenecks
1. **Firebase Auth Blocking App Mount (`src/main.js`)**:
   `mountApp()` awaits `isAuthReady` before calling `app.mount('#app')`, blocking the initial DOM render for non-logged-in visitors until network auth state completes.
2. **Heavy Image & GIF Payloads (~4.3 MB total savings)**:
   - 1.8 MB wasted on un-sized images (`uses-responsive-images`).
   - 1.25 MB wasted on PNG/JPEG formats instead of WebP/AVIF (`modern-image-formats`).
   - 1.3 MB wasted on animated GIF files (`new_hero.gif`) instead of compressed HTML5 MP4/WebM video (`efficient-animated-content`).
3. **Monolithic Bundle & Unused JavaScript (~420 KB savings)**:
   `src/plugins/vuetify.js` imports all Vuetify components upfront (`import * as components from 'vuetify/components'`), bloating the main bundle chunk.
4. **Third-Party & Font Render-Blocking Overhead**:
   Google Fonts (`Poppins`) imported as render-blocking stylesheet without origin `preconnect`. External analytics/widgets (`fbevents.js`, `storylane.js`, Trustpilot) loaded in `<head>`.

### Plan of Action
1. **Immediate Unblocking (Main Entry)**:
   - Decouple Vue mounting from `isAuthReady` in `src/main.js` so static UI renders immediately.
   - Add `<link rel="preconnect" href="https://fonts.googleapis.com">` and `preconnect` for `fonts.gstatic.com` in `index.html`.
   - Defer non-critical scripts (`storylane.js`, Meta Pixel, Trustpilot).
2. **Asset Conversion & Modernization**:
   - Convert `new_hero.gif` to `.mp4`/`.webm` or optimize with high-efficiency WebP frames.
   - Convert landing page images to `.webp`/`.avif` format with explicit `srcset`, `loading="lazy"`, `width`, and `height`.
3. **Bundle Shrinking & Code Splitting**:
   - Tree-shake Vuetify imports using selective component registration or `vite-plugin-vuetify`.
   - Configure Rollup `manualChunks` in `vite.config.js` to isolate Firebase, Vuetify, and Chart.js into secondary chunks.
4. **HTTP Caching Policies**:
   - Add `Cache-Control: public, max-age=31536000, immutable` headers in `firebase.json` for static dist assets.

### Verification & Implementation Completed
- **Phase 1 Complete**: Instant Vue app mounting in `src/main.js`, Google Fonts preconnect and direct loading in `index.html`, deferred third-party script tags (`storylane.js`, Trustpilot).
- **Phase 2 Complete**: Converted static PNG/JPEG images (`branded_hero_v7.png`, `template_corporate.png`, etc.) and animated GIFs (`new_hero.gif`, `ScanGo_click_send_4.gif`) to WebP using Pillow compression. Saved over 5.6 MB of total image payload.
- **Phase 3 Complete**: Installed `vite-plugin-vuetify` for component-level tree-shaking, refactored `src/plugins/vuetify.js` to remove bulk imports, and configured Rollup `manualChunks` in `vite.config.js`. Reduced initial entry JavaScript bundle from **1,109 KB down to 67.7 KB (93.8% reduction)** and CSS from **816 KB down to 30.2 KB (96.3% reduction)**.
- **Deployed to Firebase**: Successfully built (`npm run build`) and deployed to Firebase Hosting (`https://scangoinvoice-9124f.web.app` and `https://scangoinvoice.com`).


## Text-2-Pay SMS Invoicing & Automated Payment Confirmation (v73)

### Purpose
Implement the complete Text-2-Pay feature powered by Twilio SMS API following A2P 10DLC registration approval. This enables Pro subscribers to send instant payment link text messages directly to clients' mobile phones from invoice views and table actions, and automatically dispatches payment confirmation SMS receipts upon successful payment completion via Stripe Connect webhooks.

### Proposed Changes

#### [MODIFY] [functions/package.json](file:///C:/Users/curth/git/swift-invoice/functions/package.json)
- Add `"twilio": "^5.0.0"` dependency to Firebase Functions package configuration.
- Upgrade Node.js runtime engine from `"20"` to `"22"` (LTS) to resolve deprecation warnings and ensure long-term deployment stability.

#### [MODIFY] [firebase.json](file:///C:/Users/curth/git/swift-invoice/firebase.json)
- Update functions configuration `"runtime"` property from `"nodejs20"` to `"nodejs22"`.

#### [NEW] [functions/welcomeSms.js](file:///C:/Users/curth/git/swift-invoice/functions/welcomeSms.js)
- Create `sendWelcomeSms` Firestore trigger (`onDocumentCreated` for `users/{userId}`):
  - Check if user provided `phone` and checked `smsOptIn: true` during registration.
  - Format phone to E.164 (`+1NXXNXXNXX`).
  - Send instant Welcome SMS via Twilio API confirming subscription and CTIA opt-out instructions (`Reply STOP to opt out, HELP for info`).
  - Log dispatch in `users/{userId}/smsLogs`.

#### [MODIFY] [src/composables/useAuth.js](file:///C:/Users/curth/git/swift-invoice/src/composables/useAuth.js) & [src/components/RegisterPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/RegisterPage.vue)
- Persist merchant `phone` and `smsOptIn` during account registration into Firestore `users/{uid}` and `userSettings/{uid}`.
- Create callable Cloud Function `sendSmsInvoice`:
  - Check caller authentication (`context.auth`).
  - Read merchant user record from Firestore to verify subscription status (`isPaidUser` / active plan check).
  - Format client phone number to standard E.164 (+1NXXNXXNXX).
  - Read invoice details (`invoiceNumber`, `total`, `currency`, `client`, `companyName`, `paymentUrl`).
  - Send SMS using Twilio Client:
    - Message template: `"ScanGo Invoice #{number} for ${total} from {companyName} is ready. Pay online here: {paymentUrl} - Reply STOP to opt out, HELP for info."`
  - Record SMS log entry under Firestore `invoices/{invoiceId}/smsLogs` subcollection with status, timestamp, recipient phone, and message SID.

#### [MODIFY] [functions/stripeConnect.js](file:///C:/Users/curth/git/swift-invoice/functions/stripeConnect.js) or [functions/index.js](file:///C:/Users/curth/git/swift-invoice/functions/index.js)
- Export `sendSmsInvoice` callable function.
- Create automated helper / Firestore trigger `sendPaymentConfirmationSms` when invoice payment status updates to `'Paid'` (e.g. via Stripe webhook or invoice update):
  - Send SMS: `"Payment Received! Invoice #{number} for ${total} from {companyName} has been paid in full. Thank you! - Reply STOP to opt out."`
  - Log receipt SMS dispatch in `invoices/{invoiceId}/smsLogs`.

#### [MODIFY] [src/composables/useInvoices.js](file:///C:/Users/curth/git/swift-invoice/src/composables/useInvoices.js)
- Add `sendInvoiceSms(invoiceId, phoneNumber)` method calling the `sendSmsInvoice` Cloud Function.
- Handle loading state, success notifications, error responses, and SMS history retrieval.

#### [MODIFY] [src/components/InvoiceView.vue](file:///C:/Users/curth/git/swift-invoice/src/components/InvoiceView.vue)
- Add **"Send via SMS"** button to the invoice action bar next to "Send Email" and "Download PDF".
- Gate action with Pro subscription modal / check.
- Open dynamic SMS Send modal with prefilled client phone number, E.164 formatting check, live message preview, mandatory customer consent attestation checkbox, carrier compliance disclosures, and direct Send button.
- Log `consentAttested: true` in Firestore audit trail `invoices/{id}/smsLogs`.
- Display SMS Delivery History drawer/chip displaying previous SMS dispatch timestamps and statuses.

#### [MODIFY] [src/components/InvoiceTable.vue](file:///C:/Users/curth/git/swift-invoice/src/components/InvoiceTable.vue)
- Add "Send SMS" icon action in the desktop invoice table actions and mobile accordion drawer.

### Verification Plan
- **Dependency & Functions Check**: Run `npm install` in `functions/` and verify `twilio` installs cleanly.
- **Pro Tier Gate**: Log in as a Free user and attempt to click "Send via SMS". Confirm upgrade prompt displays. Log in as a Pro user and confirm SMS modal opens.
- **Phone Formatting & SMS Send**: Enter a valid client phone number and send an SMS. Verify Twilio sends the text message with invoice payment URL and compliance disclosures.
- **Firestore Logging**: Check `invoices/{id}/smsLogs` to verify the log record was created with recipient, status, and timestamp.
- **Automated Payment Confirmation**: Complete a test payment on an invoice with a client phone number. Verify that an automated payment confirmation SMS is dispatched.
- **Build & Lint Verification**: Run `npm run build` in root and `npm run lint` in `functions/` to ensure clean build.


## Text-2-Pay SMS Modal Glassmorphic UI & Mobile Stacking Fix (v74)

### Purpose
Fix UI contrast, element visibility, and mobile button layout in the Text-2-Pay SMS modal ([InvoiceView.vue](file:///C:/Users/curth/git/swift-invoice/src/components/InvoiceView.vue)). Replace un-rendered Tailwind utility classes (`bg-slate-800`, `text-white`, `border-slate-700`) with explicit scoped CSS design system tokens. Ensure the consent attestation checkbox and message preview box are 100% legible, and configure mobile `@media (max-width: 600px)` rules to stack the "Send Text-2-Pay SMS" button on top and the "Cancel" button directly below it.

### Proposed Changes

#### [MODIFY] [src/components/InvoiceView.vue](file:///C:/Users/curth/git/swift-invoice/src/components/InvoiceView.vue)
- Replace Tailwind classes in `v-card`, `sms-preview-card`, and `sms-consent-box` with explicit scoped CSS classes (`.sms-dialog-card`, `.sms-preview-card`, `.sms-consent-box`).
- Style `.sms-dialog-card` with deep navy background (`#111d2f`), subtle glassmorphic border (`rgba(255,255,255,0.15)`), and 20px rounded corners.
- Style `.sms-preview-card` with 4% transparent white background, subtle border, and crisp `#ffffff` monospace text rendering.
- Style `.sms-consent-box` with a glowing teal border (`rgba(20,184,166,0.4)`), prominent teal title ("Consent Attestation Required"), and bright readable label text (`#e2e8f0`).
- Update `.sms-modal-actions`:
  - On desktop (`min-width: 601px`): Align Cancel button on left and Send button on right (`flex-direction: row-reverse`).
  - On mobile (`max-width: 600px`): Stack action buttons vertically (`flex-direction: column`) so "Send Text-2-Pay SMS" is at the top and "Cancel" is directly underneath, both spanning 100% container width (`width: 100% !important`).

### Verification Plan
- **Contrast & Visibility**: Open the SMS modal on desktop. Verify that the SMS Message Preview box, the Consent Attestation checkbox, and all label texts are 100% visible against the dark navy background with glowing teal highlights.
- **Mobile Viewport Stacking**: Switch to mobile emulation (width <= 600px). Confirm that the "Send Text-2-Pay SMS" button sits at the top of the modal action bar, and the "Cancel" button sits cleanly below it, spanning full width without cut-offs or offscreen overflow.
- **Build Checks**: Run `npm run build` to verify clean compilation.


## Text-2-Pay Marketing Integration on Features & Pricing Pages (v75)

### Purpose
Promote the Text-2-Pay SMS invoicing feature across the public marketing surfaces ([FeaturesPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/FeaturesPage.vue) and [PricingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/PricingPage.vue)). Showcase live SMS preview cards, CTIA & A2P 10DLC compliance badges, and automated receipt features, and clarify feature availability across Free vs. Paid subscription tiers.

### Proposed Changes

#### [MODIFY] [src/components/FeaturesPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/FeaturesPage.vue)
- Add dedicated feature showcase section: **"Instant Text-2-Pay SMS Invoicing"**.
- Feature bullet points highlighting 1-Click SMS delivery, automated payment text receipts, and carrier compliance.
- Interactive glassmorphic `.sms-mockup-card` with glowing teal borders, delivered SMS text bubble, and automated payment receipt badge.

#### [MODIFY] [src/components/PricingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/PricingPage.vue)
- **Free Plan**: Add muted/disabled `Text-2-Pay SMS invoicing` line item under Communication section.
- **Monthly Plan**: Add highlighted `Text-2-Pay SMS invoicing & receipts` line item with vibrant teal `mdi-cellphone-text` icon.
- **Yearly Plan**: Add `Text-2-Pay SMS invoicing & receipts` line item to Communication list.

### Verification Plan
- **Features Page**: Navigate to `/features`. Verify the new Text-2-Pay SMS section renders cleanly with hover animation and responsive layout.
- **Pricing Page**: Navigate to `/pricing`. Verify Free plan lists Text-2-Pay as unavailable/disabled, while Monthly and Yearly plans list Text-2-Pay SMS invoicing as an included Pro feature.
- **Build Verification**: Run `npm run build` to ensure clean production bundle generation.


## Text-2-Pay Landing Page Differentiation (v76)

### Purpose
Promote Text-2-Pay SMS Invoicing as a core competitive differentiator across all high-converting landing pages ([LandingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/LandingPage.vue) supporting `/lp/get-paid-faster`, `/lp/time-is-money`, `/lp/weekend-freedom`). Add dedicated Hero Benefit Badges, payment pill highlights, testimonials, and a detailed FAQ item explaining Text-2-Pay SMS delivery.

### Proposed Changes

#### [MODIFY] [src/components/LandingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/LandingPage.vue)
- **Hero Badges**: Added a 4th Hero Benefit Badge (`type: 'sms'`) with a custom teal gradient SVG phone icon highlighting 1-Click Text-2-Pay SMS invoicing across all landing page variants (`contractor`, `weekend`, `time_is_money`, default).
- **Payment Pills**: Added glowing `.payment-pill.sms-pill` badge ("Text-2-Pay SMS") under Step 4 ("Get Paid Your Way").
- **Testimonials**: Updated social proof testimonials highlighting real-world Text-2-Pay usage.
- **FAQ Section**: Added dedicated FAQ entry: *"How does Text-2-Pay SMS invoicing work?"* detailing instant SMS payment links and automated text receipts.

### Verification Plan
- **Landing Pages Check**: Visit `/lp/get-paid-faster`, `/lp/time-is-money`, and `/lp/weekend-freedom`. Verify that the new Text-2-Pay hero badge and Step 4 payment pill display cleanly.
- **FAQ Verification**: Expand the new Text-2-Pay FAQ item and verify copy accuracy.
- **Build Checks**: Run `npm run build` to confirm production bundle compilation.


## Features Page Mobile Responsive Layout Fix (v77)

### Purpose
Fix mobile responsiveness, text wrapping, and icon alignment for the Text-2-Pay section in [FeaturesPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/FeaturesPage.vue). Ensure long sample SMS links wrap without clipping, `.sms-mockup-card` fits 100% container width on narrow mobile viewports, bullet check icons preserve `flex-shrink-0` layout, and heading typography scales down gracefully on small screens.

### Proposed Changes

#### [MODIFY] [src/components/FeaturesPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/FeaturesPage.vue)
- Add `word-break: break-word; overflow-wrap: anywhere;` to `.sms-bubble` and `.sms-text` so payment URLs break cleanly without horizontal scrollbars.
- Add `box-sizing: border-box; max-width: 100%;` and responsive padding (`1.25rem`) to `.sms-mockup-card` under `@media (max-width: 900px)`.
- Add `flex-shrink-0` to bullet list checkmark icons to prevent icon squishing on multi-line text wrapping.
- Scale `<h2>` heading font size down to `1.75rem` on mobile viewports for optimal readability.

### Verification Plan
- **Mobile Viewport Inspection**: Inspect `/features` on mobile viewports (320px - 480px). Verify that the Text-2-Pay SMS section text, bullet points, chip badge, and preview card fit 100% within the viewport without horizontal scrolling or text overlap.
- **Build Checks**: Run `npm run build` to verify production bundle build.


## Pricing Page Mobile Top Spacing Fix (v78)

### Purpose
Fix excessive blank vertical space at the top of [PricingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/PricingPage.vue) on mobile screens. Eliminate redundant double-padding where `.pricing-page`'s static `padding-top: 80px` combined with `<v-main>`'s auto-calculated top padding (56px) and `<v-container>`'s `pa-4` padding (16px), creating ~150px of empty space above the main "Choose Your Plan" heading.

### Proposed Changes

#### [MODIFY] [src/components/PricingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/PricingPage.vue)
- Update `.pricing-page` top padding to `1rem` on desktop and `@media (max-width: 900px)` `0.25rem !important` on mobile.
- Update `<v-container>` padding to `px-4 py-2 px-md-8 py-md-6`.
- Update `<h1>` title to `text-h4 text-sm-h3 text-md-h2` with responsive top margin (`mt-1 mt-md-0`).

### Verification Plan
- **Mobile Viewport Verification**: Open `/pricing` on mobile viewports. Confirm that "Choose Your Plan" sits neatly below the fixed top navigation bar without dead blank space.
- **Build Checks**: Run `npm run build` to verify production bundle.



## Custom Receipt Image Renaming in Expense Tracking (v79)

### Purpose
Provide users with the capability to customize and rename receipt photo image files when capturing or adding receipt photos in project expenses, and maintain the custom receipt filename across storage, entry records, edit modal, and the receipt lightbox viewer.

### Proposed Changes

#### [MODIFY] [src/composables/useProjects.js](file:///C:/Users/curth/git/swift-invoice/src/composables/useProjects.js)
- Update `addEntry(projectId, entryData, receiptFile = null, customFileName = null)` to support custom filenames:
  - Sanitize `customFileName` if provided (or default to `receiptFile.name`).
  - Preserve original image file extension if omitted by the user.
  - Store the sanitized filename in Firebase Storage: `receipts/${userId}/${projectId}/${Date.now()}_${sanitizedFileName}`.
  - Save `receiptName` (e.g. `HomeDepot_Lumber_Receipt.jpg`) on the Firestore expense entry document.

#### [MODIFY] [src/components/ProjectDetail.vue](file:///C:/Users/curth/git/swift-invoice/src/components/ProjectDetail.vue)
- Add `receiptFileName` reactive ref state for tracking custom receipt file names.
- Update `onReceiptChange`: populate `receiptFile` and default `receiptFileName.value = file.name`.
- Expand Expense inline form (`showExpenseForm`):
  - Render an interactive text input for "Receipt File Name" when a receipt photo is selected or captured.
  - Provide inline controls to edit filename, preview image, and clear photo if needed.
- Update `submitExpenseEntry`: pass `receiptFileName.value` to `addEntry`.
- Update Expense entry list:
  - Display the custom receipt filename (`entry.receiptName || 'Receipt'`) on entry rows with receipt attachments.
- Update Edit Entry modal (`openEdit` / `saveEdit`):
  - Include an editable "Receipt File Name" field so users can rename uploaded receipts on existing expense entries.
- Pass `entry.receiptName` to `ReceiptViewer` when viewing attached receipt photos.

#### [MODIFY] [src/components/ReceiptViewer.vue](file:///C:/Users/curth/git/swift-invoice/src/components/ReceiptViewer.vue)
- Add `receiptName` prop (defaulting to `'Receipt Photo'`).
- Display `receiptName` in the viewer header toolbar.
- Update download button `download` attribute to use `receiptName` so saved file downloads use the custom name.

### Verification Plan
- **Expense Creation Test**: Open a project, navigate to Expenses, add an expense with photo capture/upload, rename the receipt file, and save. Verify `receiptName` displays on the entry.
- **Lightbox Test**: Click the receipt icon on the entry. Verify the lightbox modal header displays the custom filename and the download button downloads with the custom filename.
- **Entry Edit Test**: Edit an expense entry and rename its receipt filename. Save and verify updated filename.
- **Build Check**: Execute `npm run build` to confirm zero lint or compilation errors.

## Platform Application Fee Reduction for User Acquisition (v80)

### Purpose
Lower the platform transaction application fee from 0.5% (`0.005`) to 0.25% (`0.0025`) across Stripe Connect online invoice payment checkouts. This reduction aims to boost new merchant acquisition, reduce friction for first-time invoice payment setup, and provide a competitive pricing advantage over alternative invoicing solutions.

### Changes Implemented

#### [MODIFY] [functions/stripeConnect.js](file:///C:/Users/curth/git/swift-invoice/functions/stripeConnect.js)
- Reduced application fee multiplier from `0.005` (0.5%) to `0.0025` (0.25%) in `createConnectCheckoutSession`.
- Updated calculation comment to document the 0.25% application fee.

### Verification Plan
- Verified `functions/stripeConnect.js` application fee logic (`applicationFeeAmount = Math.round(totalAmountCents * 0.0025)`).
- Confirmed zero syntax or logic issues.


## Progressive Profile Enrichment & Post-Signup Activation (v81)

### Purpose
Eliminate onboarding friction and post-signup drop-off for new users by replacing forced upfront company setup with Progressive Profile Enrichment. Users land directly in invoice creation with auto-populated account profile metadata, while inline profile enrichment prompts in `InvoiceEditor.vue` and an upgraded `CompanyInfoPrompt.vue` collect company details seamlessly during invoice creation.

### Proposed Changes

#### [MODIFY] [src/components/Dashboard.vue](file:///C:/Users/curth/git/swift-invoice/src/components/Dashboard.vue)
- Remove hard blocker `alert('Please set up your company information...')` and forced redirection to `/onboarding` in `createNewInvoice`.
- Allow all users (including those with incomplete profiles) to navigate directly to `/invoice/new`.

#### [MODIFY] [src/components/CompanyInfoPrompt.vue](file:///C:/Users/curth/git/swift-invoice/src/components/CompanyInfoPrompt.vue)
- Redesign from a restrictive warning banner to a high-converting **"Create First Invoice in 30 Seconds"** activation banner.
- Change primary action to `"Create First Invoice"` (`/invoice/new`).
- Add a secondary subtle action `"Complete Full Profile"` (`/onboarding`).
- Display profile completion badge (e.g. `50% complete`) and quick-start tips with provider-agnostic account copy ("Your account profile details are ready").

#### [MODIFY] [src/components/InvoiceEditor.vue](file:///C:/Users/curth/git/swift-invoice/src/components/InvoiceEditor.vue)
- **Account Profile Auto-Fallback**: When initializing a new invoice (`invoiceId === 'new'`), if `settings.company.name` is missing, auto-fallback `invoice.value.sender.name` to `userProfile.value?.name` or `user.value.displayName` or email prefix, and `invoice.value.sender.email` to `user.value.email`.
- **Progressive Profile Enrichment Banner**:
  - Insert a glassmorphic banner at the top of the editor when company profile is incomplete.
  - Render provider-agnostic microcopy ("Your profile details are pre-filled below").
  - Provide a one-click checkbox/button `[✓ Save as my default business info]` which updates `useUserSettings` in Firestore without interrupting invoice composition.
- **Invoice Preview Custom Logo Hint**: Added non-printing small print hints (`data-html2canvas-ignore="true"` + `.no-print`) across `InvoiceEditor.vue` (preview dialog toolbar), `InvoiceView.vue` (view screen), and all 6 Single File Component invoice templates (`InvoiceTemplate.vue` through `InvoiceTemplate6.vue`). When a user hasn't uploaded a custom business logo, a helpful tip suggests: `* Upload custom logo in Settings` with a direct link to `/settings`.

#### [MODIFY] [src/components/RegisterPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/RegisterPage.vue)
- Harmonize signup redirection: Change post-registration watch handler from forcing `/onboarding` to landing directly on `/dashboard`. This unifies the onboarding experience so both Google One-Click users and manual email/password registrants enter the same zero-friction Progressive Profile Enrichment activation flow.

#### [MODIFY] [src/composables/useUserSettings.js](file:///C:/Users/curth/git/swift-invoice/src/composables/useUserSettings.js)
- Ensure `updateUserSettings` can be called cleanly from `InvoiceEditor.vue` to persist sender/company updates as a side-effect when saving or toggling "Save as Default".

### Verification Plan
- **Google Auth & Email Registration Flow**: Test registration via both Google One-Click and manual Email/Password (`RegisterPage.vue`). Confirm both land on `/dashboard` and navigate smoothly to `/invoice/new` without forced onboarding modals.
- **Auto-Fill Check**: Verify that sender name and email default to the user's registered name or Google profile name/email.
- **Progressive Enrichment Check**: Test updating company details directly inside `InvoiceEditor.vue` and checking "Save as default company info". Verify Firestore settings update.
- **Logo Hint Verification**: Open invoice preview / view screen without a custom logo. Verify small print hint appears on screen with link to `/settings`, and confirms hidden on PDF/Print.
- **Build Checks**: Run `npm run build` to verify clean production compilation.


## Facebook Messenger Direct Chat Integration (v82)

### Purpose
Add a direct, modern, branded Facebook Messenger chat link (`https://m.me/913313295207738`) to the site's contact cards and footers, enabling visitors and users to initiate an instant messenger support session with the ScanGo Invoice support team.

### Proposed Changes

#### [MODIFY] [src/components/LandingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/LandingPage.vue)
- Add branded Facebook Messenger CTA button (`https://m.me/913313295207738`) inside the Contact card with icon `mdi-facebook-messenger`.
- Add Facebook Messenger link to the footer navigation list (`target="_blank" rel="noopener noreferrer"`).
- Add CSS styling for `.messenger-cta-btn` with Messenger blue gradient `#0084ff` -> `#00c6ff`, glowing hover effect, and responsive centering.

#### [MODIFY] [src/components/AboutUsPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/AboutUsPage.vue)
- Add branded Facebook Messenger CTA button (`https://m.me/913313295207738`) inside the Contact card with icon `mdi-facebook-messenger`.

## Educational Instagram Carousel Post: Invoicing Inefficiency & Profit Loss (v83)

### Purpose
Create a high-impact, 5-slide educational Instagram carousel post targeting small business owners and service agencies. The post highlights hard data and real-world mechanics showing how delayed, inaccurate, or manual invoicing silently erodes profit margins, creates cash flow gaps, and degrades client trust, followed by actionable solutions and a strong call-to-action.

### Proposed Changes

#### [NEW] [instagram_post_invoicing_efficiency.md](file:///C:/Users/curth/.gemini/antigravity-cli/brain/513e2269-c086-43a7-85fd-e55c2c48a6c1/instagram_post_invoicing_efficiency.md)
- Design and structure a 5-slide educational Instagram Carousel:
  - **Slide 1: Hook (The Silent Profit Killer)** — Bold headline & visual stat callout on small business invoice delay costs.
  - **Slide 2: Cost #1 (Delayed Invoicing = Extended Cash Flow Gaps)** — Explains the 30-60 day float cost and cash crunch caused by late billing.
  - **Slide 3: Cost #2 (Inaccurate Line Items = Disputed Invoices & Unbilled Work)** — Highlights forgotten billable hours, receipt leakage, and dispute delays.
  - **Slide 4: Cost #3 (Manual Overhead = High Operational Waste)** — Shows the hidden cost of manually building, tracking, and following up on invoices.
  - **Slide 5: The Solution & Call to Action** — 3-step modern invoicing fix and CTA directing to ScanGo Invoice.
- Provide comprehensive Instagram caption copywriting with engaging structure, emojis, data points, and clear CTA.
- Curate 15 high-volume targeted hashtags for maximum organic reach among small business owners, agencies, and entrepreneurs.

### Visual Design Specifications
- **Format**: 5 Individual Standalone Carousel Slides (1:1 aspect ratio, high resolution 1080x1080, clean graphic assets without UI arrows/dots).
- **Style**: Clean Minimalist Editorial featuring elevated light-gray floating cards with deep multi-layered drop shadows on off-white studio backdrops.


## Facebook Educational Post: Simplified Invoicing & Profit Protection (v84)

### Purpose
Adapt the Instagram invoicing efficiency campaign into a high-engagement, simplified Facebook post. Rephrase financial mechanics into plain, everyday language and simple vocabulary tailored for small business owners, tradespeople, and service providers browsing Facebook.

### Proposed Changes

#### [NEW] [facebook_post_invoicing_efficiency.md](file:///C:/Users/curth/.gemini/antigravity-cli/brain/513e2269-c086-43a7-85fd-e55c2c48a6c1/facebook_post_invoicing_efficiency.md)
- Draft plain-language Facebook post copy focusing on 3 simple points:
  1. **Waiting to bill = waiting to get paid** (Why late billing drains bank accounts).
  2. **Forgetting small costs = losing cash** (How missed hours and receipts eat profits).
  3. **Unclear bills = delayed checks** (Why simple item lists get paid faster).
- Provide a clear 3-step solution written in simple, everyday words.
- Include a friendly discussion question to boost Facebook comments and algorithm reach.
- Recommend visual photo layouts (single image vs multi-photo post) matching Facebook feed best practices.

### Verification Plan
- Ensure language is simple, clear, and free of overly technical corporate jargon.
- Update free tier limit alert text from 3-invoice to 5-invoice limit for consistency.

#### [MODIFY] [src/components/UpgradePrompt.vue](file:///C:/Users/curth/git/swift-invoice/src/components/UpgradePrompt.vue)
- **FAQ Section**: Added dedicated FAQ entry: *"How does Text-2-Pay SMS invoicing work?"* detailing instant SMS payment links and automated text receipts.

### Verification Plan
- **Landing Pages Check**: Visit `/lp/get-paid-faster`, `/lp/time-is-money`, and `/lp/weekend-freedom`. Verify that the new Text-2-Pay hero badge and Step 4 payment pill display cleanly.
- **FAQ Verification**: Expand the new Text-2-Pay FAQ item and verify copy accuracy.
- **Build Checks**: Run `npm run build` to confirm production bundle compilation.


## Features Page Mobile Responsive Layout Fix (v77)

### Purpose
Fix mobile responsiveness, text wrapping, and icon alignment for the Text-2-Pay section in [FeaturesPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/FeaturesPage.vue). Ensure long sample SMS links wrap without clipping, `.sms-mockup-card` fits 100% container width on narrow mobile viewports, bullet check icons preserve `flex-shrink-0` layout, and heading typography scales down gracefully on small screens.

### Proposed Changes

#### [MODIFY] [src/components/FeaturesPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/FeaturesPage.vue)
- Add `word-break: break-word; overflow-wrap: anywhere;` to `.sms-bubble` and `.sms-text` so payment URLs break cleanly without horizontal scrollbars.
- Add `box-sizing: border-box; max-width: 100%;` and responsive padding (`1.25rem`) to `.sms-mockup-card` under `@media (max-width: 900px)`.
- Add `flex-shrink-0` to bullet list checkmark icons to prevent icon squishing on multi-line text wrapping.
- Scale `<h2>` heading font size down to `1.75rem` on mobile viewports for optimal readability.

### Verification Plan
- **Mobile Viewport Inspection**: Inspect `/features` on mobile viewports (320px - 480px). Verify that the Text-2-Pay SMS section text, bullet points, chip badge, and preview card fit 100% within the viewport without horizontal scrolling or text overlap.
- **Build Checks**: Run `npm run build` to verify production bundle build.


## Pricing Page Mobile Top Spacing Fix (v78)

### Purpose
Fix excessive blank vertical space at the top of [PricingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/PricingPage.vue) on mobile screens. Eliminate redundant double-padding where `.pricing-page`'s static `padding-top: 80px` combined with `<v-main>`'s auto-calculated top padding (56px) and `<v-container>`'s `pa-4` padding (16px), creating ~150px of empty space above the main "Choose Your Plan" heading.

### Proposed Changes

#### [MODIFY] [src/components/PricingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/PricingPage.vue)
- Update `.pricing-page` top padding to `1rem` on desktop and `@media (max-width: 900px)` `0.25rem !important` on mobile.
- Update `<v-container>` padding to `px-4 py-2 px-md-8 py-md-6`.
- Update `<h1>` title to `text-h4 text-sm-h3 text-md-h2` with responsive top margin (`mt-1 mt-md-0`).

### Verification Plan
- **Mobile Viewport Verification**: Open `/pricing` on mobile viewports. Confirm that "Choose Your Plan" sits neatly below the fixed top navigation bar without dead blank space.
- **Build Checks**: Run `npm run build` to verify production bundle.



## Custom Receipt Image Renaming in Expense Tracking (v79)

### Purpose
Provide users with the capability to customize and rename receipt photo image files when capturing or adding receipt photos in project expenses, and maintain the custom receipt filename across storage, entry records, edit modal, and the receipt lightbox viewer.

### Proposed Changes

#### [MODIFY] [src/composables/useProjects.js](file:///C:/Users/curth/git/swift-invoice/src/composables/useProjects.js)
- Update `addEntry(projectId, entryData, receiptFile = null, customFileName = null)` to support custom filenames:
  - Sanitize `customFileName` if provided (or default to `receiptFile.name`).
  - Preserve original image file extension if omitted by the user.
  - Store the sanitized filename in Firebase Storage: `receipts/${userId}/${projectId}/${Date.now()}_${sanitizedFileName}`.
  - Save `receiptName` (e.g. `HomeDepot_Lumber_Receipt.jpg`) on the Firestore expense entry document.

#### [MODIFY] [src/components/ProjectDetail.vue](file:///C:/Users/curth/git/swift-invoice/src/components/ProjectDetail.vue)
- Add `receiptFileName` reactive ref state for tracking custom receipt file names.
- Update `onReceiptChange`: populate `receiptFile` and default `receiptFileName.value = file.name`.
- Expand Expense inline form (`showExpenseForm`):
  - Render an interactive text input for "Receipt File Name" when a receipt photo is selected or captured.
  - Provide inline controls to edit filename, preview image, and clear photo if needed.
- Update `submitExpenseEntry`: pass `receiptFileName.value` to `addEntry`.
- Update Expense entry list:
  - Display the custom receipt filename (`entry.receiptName || 'Receipt'`) on entry rows with receipt attachments.
- Update Edit Entry modal (`openEdit` / `saveEdit`):
  - Include an editable "Receipt File Name" field so users can rename uploaded receipts on existing expense entries.
- Pass `entry.receiptName` to `ReceiptViewer` when viewing attached receipt photos.

#### [MODIFY] [src/components/ReceiptViewer.vue](file:///C:/Users/curth/git/swift-invoice/src/components/ReceiptViewer.vue)
- Add `receiptName` prop (defaulting to `'Receipt Photo'`).
- Display `receiptName` in the viewer header toolbar.
- Update download button `download` attribute to use `receiptName` so saved file downloads use the custom name.

### Verification Plan
- **Expense Creation Test**: Open a project, navigate to Expenses, add an expense with photo capture/upload, rename the receipt file, and save. Verify `receiptName` displays on the entry.
- **Lightbox Test**: Click the receipt icon on the entry. Verify the lightbox modal header displays the custom filename and the download button downloads with the custom filename.
- **Entry Edit Test**: Edit an expense entry and rename its receipt filename. Save and verify updated filename.
- **Build Check**: Execute `npm run build` to confirm zero lint or compilation errors.

## Platform Application Fee Reduction for User Acquisition (v80)

### Purpose
Lower the platform transaction application fee from 0.5% (`0.005`) to 0.25% (`0.0025`) across Stripe Connect online invoice payment checkouts. This reduction aims to boost new merchant acquisition, reduce friction for first-time invoice payment setup, and provide a competitive pricing advantage over alternative invoicing solutions.

### Changes Implemented

#### [MODIFY] [functions/stripeConnect.js](file:///C:/Users/curth/git/swift-invoice/functions/stripeConnect.js)
- Reduced application fee multiplier from `0.005` (0.5%) to `0.0025` (0.25%) in `createConnectCheckoutSession`.
- Updated calculation comment to document the 0.25% application fee.

### Verification Plan
- Verified `functions/stripeConnect.js` application fee logic (`applicationFeeAmount = Math.round(totalAmountCents * 0.0025)`).
- Confirmed zero syntax or logic issues.


## Progressive Profile Enrichment & Post-Signup Activation (v81)

### Purpose
Eliminate onboarding friction and post-signup drop-off for new users by replacing forced upfront company setup with Progressive Profile Enrichment. Users land directly in invoice creation with auto-populated account profile metadata, while inline profile enrichment prompts in `InvoiceEditor.vue` and an upgraded `CompanyInfoPrompt.vue` collect company details seamlessly during invoice creation.

### Proposed Changes

#### [MODIFY] [src/components/Dashboard.vue](file:///C:/Users/curth/git/swift-invoice/src/components/Dashboard.vue)
- Remove hard blocker `alert('Please set up your company information...')` and forced redirection to `/onboarding` in `createNewInvoice`.
- Allow all users (including those with incomplete profiles) to navigate directly to `/invoice/new`.

#### [MODIFY] [src/components/CompanyInfoPrompt.vue](file:///C:/Users/curth/git/swift-invoice/src/components/CompanyInfoPrompt.vue)
- Redesign from a restrictive warning banner to a high-converting **"Create First Invoice in 30 Seconds"** activation banner.
- Change primary action to `"Create First Invoice"` (`/invoice/new`).
- Add a secondary subtle action `"Complete Full Profile"` (`/onboarding`).
- Display profile completion badge (e.g. `50% complete`) and quick-start tips with provider-agnostic account copy ("Your account profile details are ready").

#### [MODIFY] [src/components/InvoiceEditor.vue](file:///C:/Users/curth/git/swift-invoice/src/components/InvoiceEditor.vue)
- **Account Profile Auto-Fallback**: When initializing a new invoice (`invoiceId === 'new'`), if `settings.company.name` is missing, auto-fallback `invoice.value.sender.name` to `userProfile.value?.name` or `user.value.displayName` or email prefix, and `invoice.value.sender.email` to `user.value.email`.
- **Progressive Profile Enrichment Banner**:
  - Insert a glassmorphic banner at the top of the editor when company profile is incomplete.
  - Render provider-agnostic microcopy ("Your profile details are pre-filled below").
  - Provide a one-click checkbox/button `[✓ Save as my default business info]` which updates `useUserSettings` in Firestore without interrupting invoice composition.
- **Invoice Preview Custom Logo Hint**: Added non-printing small print hints (`data-html2canvas-ignore="true"` + `.no-print`) across `InvoiceEditor.vue` (preview dialog toolbar), `InvoiceView.vue` (view screen), and all 6 Single File Component invoice templates (`InvoiceTemplate.vue` through `InvoiceTemplate6.vue`). When a user hasn't uploaded a custom business logo, a helpful tip suggests: `* Upload custom logo in Settings` with a direct link to `/settings`.

#### [MODIFY] [src/components/RegisterPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/RegisterPage.vue)
- Harmonize signup redirection: Change post-registration watch handler from forcing `/onboarding` to landing directly on `/dashboard`. This unifies the onboarding experience so both Google One-Click users and manual email/password registrants enter the same zero-friction Progressive Profile Enrichment activation flow.

#### [MODIFY] [src/composables/useUserSettings.js](file:///C:/Users/curth/git/swift-invoice/src/composables/useUserSettings.js)
- Ensure `updateUserSettings` can be called cleanly from `InvoiceEditor.vue` to persist sender/company updates as a side-effect when saving or toggling "Save as Default".

### Verification Plan
- **Google Auth & Email Registration Flow**: Test registration via both Google One-Click and manual Email/Password (`RegisterPage.vue`). Confirm both land on `/dashboard` and navigate smoothly to `/invoice/new` without forced onboarding modals.
- **Auto-Fill Check**: Verify that sender name and email default to the user's registered name or Google profile name/email.
- **Progressive Enrichment Check**: Test updating company details directly inside `InvoiceEditor.vue` and checking "Save as default company info". Verify Firestore settings update.
- **Logo Hint Verification**: Open invoice preview / view screen without a custom logo. Verify small print hint appears on screen with link to `/settings`, and confirms hidden on PDF/Print.
- **Build Checks**: Run `npm run build` to verify clean production compilation.


## Facebook Messenger Direct Chat Integration (v82)

### Purpose
Add a direct, modern, branded Facebook Messenger chat link (`https://m.me/913313295207738`) to the site's contact cards and footers, enabling visitors and users to initiate an instant messenger support session with the ScanGo Invoice support team.

### Proposed Changes

#### [MODIFY] [src/components/LandingPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/LandingPage.vue)
- Add branded Facebook Messenger CTA button (`https://m.me/913313295207738`) inside the Contact card with icon `mdi-facebook-messenger`.
- Add Facebook Messenger link to the footer navigation list (`target="_blank" rel="noopener noreferrer"`).
- Add CSS styling for `.messenger-cta-btn` with Messenger blue gradient `#0084ff` -> `#00c6ff`, glowing hover effect, and responsive centering.

#### [MODIFY] [src/components/AboutUsPage.vue](file:///C:/Users/curth/git/swift-invoice/src/components/AboutUsPage.vue)
- Add branded Facebook Messenger CTA button (`https://m.me/913313295207738`) inside the Contact card with icon `mdi-facebook-messenger`.

## Educational Instagram Carousel Post: Invoicing Inefficiency & Profit Loss (v83)

### Purpose
Create a high-impact, 5-slide educational Instagram carousel post targeting small business owners and service agencies. The post highlights hard data and real-world mechanics showing how delayed, inaccurate, or manual invoicing silently erodes profit margins, creates cash flow gaps, and degrades client trust, followed by actionable solutions and a strong call-to-action.

### Proposed Changes

#### [NEW] [instagram_post_invoicing_efficiency.md](file:///C:/Users/curth/.gemini/antigravity-cli/brain/513e2269-c086-43a7-85fd-e55c2c48a6c1/instagram_post_invoicing_efficiency.md)
- Design and structure a 5-slide educational Instagram Carousel:
  - **Slide 1: Hook (The Silent Profit Killer)** — Bold headline & visual stat callout on small business invoice delay costs.
  - **Slide 2: Cost #1 (Delayed Invoicing = Extended Cash Flow Gaps)** — Explains the 30-60 day float cost and cash crunch caused by late billing.
  - **Slide 3: Cost #2 (Inaccurate Line Items = Disputed Invoices & Unbilled Work)** — Highlights forgotten billable hours, receipt leakage, and dispute delays.
  - **Slide 4: Cost #3 (Manual Overhead = High Operational Waste)** — Shows the hidden cost of manually building, tracking, and following up on invoices.
  - **Slide 5: The Solution & Call to Action** — 3-step modern invoicing fix and CTA directing to ScanGo Invoice.
- Provide comprehensive Instagram caption copywriting with engaging structure, emojis, data points, and clear CTA.
- Curate 15 high-volume targeted hashtags for maximum organic reach among small business owners, agencies, and entrepreneurs.

### Visual Design Specifications
- **Format**: 5 Individual Standalone Carousel Slides (1:1 aspect ratio, high resolution 1080x1080, clean graphic assets without UI arrows/dots).
- **Style**: Clean Minimalist Editorial featuring elevated light-gray floating cards with deep multi-layered drop shadows on off-white studio backdrops.


## Facebook Educational Post: Simplified Invoicing & Profit Protection (v84)

### Purpose
Adapt the Instagram invoicing efficiency campaign into a high-engagement, simplified Facebook post. Rephrase financial mechanics into plain, everyday language and simple vocabulary tailored for small business owners, tradespeople, and service providers browsing Facebook.

### Proposed Changes

#### [NEW] [facebook_post_invoicing_efficiency.md](file:///C:/Users/curth/.gemini/antigravity-cli/brain/513e2269-c086-43a7-85fd-e55c2c48a6c1/facebook_post_invoicing_efficiency.md)
- Draft plain-language Facebook post copy focusing on 3 simple points:
  1. **Waiting to bill = waiting to get paid** (Why late billing drains bank accounts).
  2. **Forgetting small costs = losing cash** (How missed hours and receipts eat profits).
  3. **Unclear bills = delayed checks** (Why simple item lists get paid faster).
- Provide a clear 3-step solution written in simple, everyday words.
- Include a friendly discussion question to boost Facebook comments and algorithm reach.
- Recommend visual photo layouts (single image vs multi-photo post) matching Facebook feed best practices.

### Verification Plan
- Ensure language is simple, clear, and free of overly technical corporate jargon.
- Update free tier limit alert text from 3-invoice to 5-invoice limit for consistency.

#### [MODIFY] [src/components/UpgradePrompt.vue](file:///C:/Users/curth/git/swift-invoice/src/components/UpgradePrompt.vue)
- Add an optional close icon button (`mdi-close`) allowing users to dismiss the upgrade banner.
- Store dismissal state in `localStorage` key `swift_invoice_upgrade_dismissed` so dismissed status persists across sessions.

### Verification Plan
- **New User Registration Experience**: Register a new user (0 invoices). Confirm that the "Unlock Pro Features!" banner is NOT displayed on the Dashboard, and the "Welcome to ScanGo Invoice!" Quick Start banner is rendered instead with "Create Your First Invoice" and "Complete Business Profile" CTAs.
- **Active Free User Experience**: Create at least 1 invoice on a free account. Navigate to the Dashboard. Confirm that the Welcome banner is hidden and the "Unlock Pro Features!" banner is displayed.
- **Banner Dismissal**: Click the close button on the Upgrade banner. Confirm the banner disappears and remains hidden on page refresh.
- **Build Checks**: Run `npm run build` to confirm zero lint or compilation errors.

## Dashboard WelcomePrompt Removal (v86)

### Purpose
Remove `WelcomePrompt.vue` from the `Dashboard.vue` layout to eliminate redundancy with `CompanyInfoPrompt.vue` (which already features a prominent "Create First Invoice" action). The `src/components/WelcomePrompt.vue` component remains in the codebase for potential future use.

### Proposed Changes

#### [MODIFY] [src/components/Dashboard.vue](file:///C:/Users/curth/git/swift-invoice/src/components/Dashboard.vue)
- Remove `<WelcomePrompt>` component rendering from the template.
- Remove `import WelcomePrompt from './WelcomePrompt.vue'` from `<script setup>`.
- Update `<UpgradePrompt>` condition for free plan users to require at least 1 invoice: `v-if="isFreePlan && hasInvoices && !invoiceLimitReached && !settingsLoading"`.

### Verification Plan
- **Dashboard Inspection**: Log in as a new free user (0 invoices). Confirm that neither `WelcomePrompt` nor `UpgradePrompt` ("Unlock Pro Features!") render on the dashboard. Create an invoice and confirm `UpgradePrompt` appears for free users.
- **Codebase Integrity**: Confirm `src/components/WelcomePrompt.vue` remains present in the codebase.
- **Build Checks**: Run `npm run build` to confirm zero compilation errors.

## Platform Pricing Structure Strategy (v87)

### Purpose
Establish a zero-friction Pricing & Packaging Strategy for ScanGo Invoice while retaining the existing Stripe Price IDs ($9/month for Pro and $90/year for Agency). Transition the Free Starter tier from a 5-invoice lifetime limit to a resetting 3-invoices/month allowance with direct Email and Text-2-Pay SMS invoicing enabled to eliminate onboarding friction.

### Strategy Blueprint Overview
- **Zero Friction Activation**: Free Starter tier enables direct Email & Text-2-Pay SMS invoicing out of the box so users can complete their business profile and bill clients immediately.
- **Stripe Price ID Continuity**: Retains existing Stripe price IDs (`monthly` @ $9/mo and `yearly` @ $90/yr).
- **Plan Architecture**:
  1. **Free Starter ($0/mo)**: 3 invoices/month allowance (resets monthly), Direct Email & Text-2-Pay SMS invoicing enabled, 0.50% ScanGo transaction fee.
  2. **Pro Monthly ($9/mo)**: Unlimited invoices, receipt photo attachments, automated reminders, multi-user team seats, 0.25% ScanGo fee.
  3. **Agency / Yearly ($90/yr)**: All Pro features, $7.50/mo equivalent (Save 2 months), priority support, 0.25% ScanGo fee.

### Action Plan
1. Update `PricingPage.vue` to display the updated Free Starter features (3 invoices/mo, direct Email & SMS included, 0.50% fee), Pro Monthly ($9/mo), and Agency Yearly ($90/yr).
2. Update `UpgradePrompt.vue` and copy to reflect the 3-invoice/mo limit for free tier users.
3. Verify `npm run build` compiles with zero errors.

## Automated Payment Reminders (v88)

### Purpose
Automate payment follow-ups for merchants to reduce late payments and increase cash flow. Automatically send dark-themed email reminders via Resend at 3 critical milestones: 3 days before due date, on due date, and 7 days overdue. Restricted to Pro Subscribers (`subscriptionStatus === 'active'`) as a high-value upgrade incentive.

### Architecture & Schema
- **`userSettings/{userId}`**: Includes `reminderSettings: { enabled: true, triggers: ['3_days_before', 'on_due_date', '7_days_overdue'] }`.
- **`invoices/{invoiceId}`**: Includes `remindersEnabled: true` and `remindersSent: [...]` array.
- **Backend Function (`functions/scheduledReminders.js`)**: Runs daily via `onSchedule("every day 09:00", ...)` to evaluate due dates, subscription eligibility, send emails, and track sent history.
- **UI Integrations**:
  - `src/components/UserSettings.vue`: Payment Reminders configuration card with master switch & trigger checkboxes (Pro lock for free users).
  - `src/components/InvoiceEditor.vue`: Individual invoice toggle under Payment Terms options.
  - `src/composables/useUserSettings.js` & `src/composables/useInvoices.js`: Default state & persistence.

### Status
- Completed: Implementation of backend Cloud Function, composables, and frontend UI components.

## Tiered Stripe Connect Application Fee Logic (v89)

### Purpose
Enforce dynamic tier-based Stripe Connect application fees on customer invoice checkouts matching the marketing and pricing site specs:
- **Free Starter Users**: 0.50% (`0.0050`) transaction fee.
- **Active Pro / Agency Subscribers**: Reduced 0.25% (`0.0025`) transaction fee.

### Action Taken
- Modified `createInvoicePaymentSession` in `functions/stripeConnect.js` to inspect `userDoc.data().subscriptionStatus`.
- Computes `feeRate = isPro ? 0.0025 : 0.0050` and sets `applicationFeeAmount = Math.round(totalAmountCents * feeRate)`.

## Stripe Express Connect Account Migration & Single Sign-On (v90)

### Purpose
Migrate merchant Stripe Connect onboarding from Standard accounts to Stripe Express (`type: 'express'`). This prevents merchants from accessing standard Stripe invoice creation features outside ScanGo Invoice while providing a streamlined hosted portal for payouts, tax forms, and debit-card Instant Payout configuration.

### Action Taken
- **`functions/stripeConnect.js`**:
  - Updated `stripe.accounts.create` to `type: 'express'` with capabilities `card_payments` & `transfers`.
  - Added `createExpressDashboardLink` callable function (`stripe.accounts.createLoginLink(accountId)`).
- **`functions/index.js`**: Exported `createExpressDashboardLink`.
- **`src/composables/useStripeConnect.js`**: Added `openExpressDashboard` method.
- **`src/components/UserSettings.vue`**: Added "Open Stripe Express Dashboard" button and Instant Payouts info text for connected merchants.

### Status
- Completed and ready for build & deploy.

## Invoice Editor Scheduled Reminders Layout & Style Fix (v91)

### Purpose
Review and refine the responsive layout and typography contrast of the `InvoiceEditor.vue` scheduled payment reminders box. Eliminate black/dark text on dark glassmorphism backgrounds by using high-contrast text tokens (`#f8fafc` for title, `#cbd5e1` for descriptions), improve padding and flex alignment to prevent crowded layouts, and add a responsive vertical layout stack for mobile viewports along with interactive reminder schedule badges (`3 days before due`, `On due date`, `7 days overdue`).

### Proposed Changes

#### [MODIFY] [src/components/InvoiceEditor.vue](file:///C:/Users/curth/git/swift-invoice/src/components/InvoiceEditor.vue)
- Replace inline style attributes on `.reminders-toggle-box` with clean, responsive scoped CSS rules using glassmorphism styling (`rgba(255, 255, 255, 0.03)` background, `rgba(255, 255, 255, 0.1)` border, `12px` blur).
- Fix text contrast: replace `.text-medium-emphasis` with explicit light slate text classes (`.reminders-desc` with `#cbd5e1`, title with `#f8fafc`).
- Restructure flex layout: separate title/description and toggle switch into flexible groups with adequate gap (`1rem`) and `flex-shrink: 0` on actions to prevent crowding.
- Add an interactive schedule timeline pills row (`3 days before due`, `On due date`, `7 days overdue`) with SVG icons when auto-reminders are active.
- Add responsive `@media (max-width: 600px)` media query to stack header content vertically on mobile devices so switch and text never collide.

## Expense Category Dropdown Layout & Height Fix (v92)

### Purpose
Fix the layout and height mismatch of the Expense Category dropdown/input field in the inline expense form within `ProjectDetail.vue`. The `<v-select>` and `<v-combobox>` components were missing a wrapping `<div>` and `<label class="field-label">Category</label>`, causing them to stretch vertically to match the height of adjacent grid cells with labels, rendering the category input two lines tall instead of a single line.

### Proposed Changes

#### [MODIFY] [src/components/ProjectDetail.vue](file:///C:/Users/curth/git/swift-invoice/src/components/ProjectDetail.vue)
- Wrap `<v-select>` / `<v-combobox>` inside a `<div>` wrapper with `<label class="field-label">Category</label>` in `.form-grid-4`.
- Ensure category input aligns with adjacent Date, Amount ($), and Billable fields in single-line compact height (~38px).

## Expense Receipt Storage Deletion on Expense & Project Cleanup (v93)

### Purpose
Eliminate orphaned receipt image files in Firebase Storage when expense entries or entire projects are deleted. Integrate Firebase Storage object deletion into single-entry deletion (`deleteEntry`), project cascading deletion (`deleteProject`), and receipt removal in the edit modal. Update Firebase Storage security rules to explicitly allow object deletion for authenticated users.

### Proposed Changes

#### [MODIFY] [storage.rules](file:///C:/Users/curth/git/swift-invoice/storage.rules)
- Update `match /receipts/{userId}/{projectId}/{fileName}` to separate `allow create, update` and `allow delete: if request.auth != null;` to prevent rule rejection during `deleteObject` calls (where `request.resource` is null).

#### [MODIFY] [src/composables/useProjects.js](file:///C:/Users/curth/git/swift-invoice/src/composables/useProjects.js)
- Import `deleteObject` from `firebase/storage`.
- Create `deleteReceiptStorageFile(receiptUrl)` helper function to delete files from Firebase Storage by URL with safe error handling.
- Update `deleteEntry(projectId, entryId, receiptUrl)` to delete the associated storage file before deleting the Firestore entry document.
- Update `deleteProject(id)` cascading loop to delete receipt images for all expense entries belonging to the project prior to deleting entry and project documents.


#### [MODIFY] [src/components/ProjectDetail.vue](file:///C:/Users/curth/git/swift-invoice/src/components/ProjectDetail.vue)
- Update `removeEntry` to pass entry objects (including `receiptUrl`) to `deleteEntry`.
- Add a "Remove Photo" option in the edit modal to allow users to detach and delete receipt images from existing expense entries.

## UserSettings Responsive Button Layout & Text Wrap Fix (v94)

### Purpose
Fix button text overflow in `UserSettings.vue` on narrow and mobile viewports. On smaller screens, long text on Vuetify `<v-btn>` elements (e.g., "Upgrade to Pro for Auto-Reminders", "Resume Stripe Onboarding", "Open Stripe Express Dashboard", and "Back to Dashboard") extends beyond button borders due to default `white-space: nowrap`, rigid button heights, and flex container alignment.

### Proposed Changes

#### [MODIFY] [src/components/UserSettings.vue](file:///C:/Users/curth/git/swift-invoice/src/components/UserSettings.vue)
- Add deep CSS targeting for Vuetify buttons (`.v-btn`) inside `.settings-container` to set `max-width: 100%`, `height: auto !important`, `min-height: 40px`, and adequate padding.
- Override Vuetify's default `:deep(.v-btn__content)` styling to allow `white-space: normal !important`, `word-break: break-word`, and proper alignment.
- Update flex containers around action buttons (such as Stripe Connect buttons and section buttons) to stack vertically (`flex-direction: column; width: 100%`) on mobile breakpoints (`max-width: 600px`).
- Ensure icons and multi-line text inside buttons remain visually centered and balanced across all screen widths down to 320px.



