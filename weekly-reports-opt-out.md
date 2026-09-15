# Weekly Reports for All Registered Users & Opt-Out Functionality

## Goal
Enable automated weekly invoice reports for all registered ScanGo Invoice users by default, implement a signed one-click email unsubscribe & in-app settings opt-out, add "All Caught Up" re-engagement content with Pro upsell banners, and provide an admin announcement email dispatch script.

## Tasks
- [x] Task 1: Create HMAC Unsubscribe Helper (`functions/unsubscribeHelper.js`) → Verify: Unit test token generation and verification
- [x] Task 2: Implement Unsubscribe Cloud Function HTTP Endpoint (`functions/index.js` & `functions/unsubscribeEndpoint.js`) → Verify: Endpoint verifies token and updates user opt-out in Firestore
- [x] Task 3: Update Weekly Report Cloud Function (`functions/weeklyReport.js`) → Verify: Runs for all users, respects opt-out flag, adds Pro upsell for free tier, provides "All Caught Up" + quick action tip for zero-activity weeks, and adds signed unsubscribe links & headers
- [x] Task 4: Update Preview Report Cloud Function (`functions/previewReport.js`) → Verify: Allows all registered users to preview their report
- [x] Task 5: Add Dedicated Frontend Unsubscribe Page (`src/components/UnsubscribePage.vue` & `src/router/index.js` & `firebase.json`) → Verify: Route `/unsubscribe` renders confirmation card and syncs opt-out
- [x] Task 6: Add Opt-Out & Preferences Toggle in User Settings (`src/components/UserSettings.vue` & `src/composables/useUserSettings.js`) → Verify: Toggle updates state and syncs to Firestore `users` & `userSettings`
- [x] Task 7: Update Pricing Page (`src/components/PricingPage.vue`) → Verify: Free tier lists basic weekly summary, Pro lists advanced reports & auto-reminders
- [x] Task 8: Create Admin Announcement Script with Responsive Resend Template (`scripts/send-weekly-report-announcement.js`) → Verify: CLI script runs with `--dry-run` and tests email generation
- [x] Task 9: Final Quality & Build Verification (`npm run build`) → Verify: Production Vite build passes with zero errors

## Done When
- [x] All registered users are eligible for weekly reports unless `weeklyReportOptOut === true`.
- [x] Users with 0 paid/due invoices receive an encouraging "All Caught Up" recap with quick-action re-engagement tips.
- [x] Free users see an attractive Pro upsell banner; active subscribers see a clean report.
- [x] Users can opt out via in-app switch in User Settings or via signed 1-click unsubscribe link in email footers.
- [x] The admin script `scripts/send-weekly-report-announcement.js` can safely dry-run and send announcement emails via Resend.
- [x] Project builds cleanly without errors.

## Notes
- Follows Vue 3 Composition API `<script setup>` and dark-theme glassmorphism styling.
- RFC 8058 compliant email headers (`List-Unsubscribe`, `List-Unsubscribe-Post`) for high deliverability.
