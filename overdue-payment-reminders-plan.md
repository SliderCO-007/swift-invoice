# Overdue Invoice Status & One-Click Payment Reminders Plan

## Goal
Display dynamic `Overdue` status across owner and customer-facing invoice views when a pending invoice is past its due date, track reminder history (`reminderCount` and `lastReminderSentAt`), and enable one-click professional overdue payment reminder emails with optional message customization.

## Project Type
**WEB & BACKEND** (Vue 3 + Vuetify 3 Frontend, Firebase Cloud Functions v2 + Resend Backend, Firestore)

## Success Criteria
- [x] Unpaid (`pending` / `sent` / `overdue`) invoices with a `dueDate` before today dynamically display `Overdue` on the owner's `InvoiceView.vue`, all 6 `InvoiceTemplate*.vue` components (including PDF exports), `InvoiceEditor.vue` preview, and the customer-facing `PublicPayment.vue` (`/pay/:invoiceId`).
- [x] Owners can still mark an `Overdue` invoice as `Paid` on `InvoiceView.vue`.
- [x] Clicking **Send Payment Reminder** (from `InvoiceView.vue` or `InvoiceTable.vue` on the Dashboard) opens `PaymentReminderModal.vue` pre-filled with an executive-grade, polite default reminder message and subject line.
- [x] Owners can dispatch the reminder in one click from the confirmation modal or toggle **Customize Message** to edit the subject/body before sending.
- [x] Sending a reminder dispatches a branded HTML email (with invoice summary and direct `/pay/:id` online payment button) via the existing Resend backend service and increments `reminderCount` + sets `lastReminderSentAt` on the invoice document in Firestore.
- [x] Both `InvoiceView.vue` and `InvoiceTable.vue` display how many reminders have been sent and when the last reminder was sent.

## File Structure & Changes
- `functions/paymentReminder.js` **[NEW]**: Callable Cloud Function `sendPaymentReminder` that validates ownership, sends the styled HTML overdue reminder email via Resend with direct `/pay/:invoiceId` link, and increments `reminderCount` + sets `lastReminderSentAt` on `invoices/{invoiceId}`.
- `functions/index.js` **[MODIFY]**: Export `sendPaymentReminder`.
- `functions/stripeConnect.js` **[MODIFY]**: Include dynamic overdue status check in `getInvoiceForPayment` response.
- `src/composables/useInvoices.js` **[MODIFY]**: Normalize `lastReminderSentAt` and `reminderCount` on fetched invoices and expose `sendPaymentReminder`.
- `src/components/PaymentReminderModal.vue` **[NEW]**: Confirmation modal (Option A) displaying reminder history (`reminderCount`, `lastReminderSentAt`), recipient email, pre-filled professional message preview with a "Customize Message" toggle, and 1-click send button.
- `src/components/InvoiceView.vue` **[MODIFY]**:
  - Dynamically compute `Overdue` status in `safeInvoice` when `status` is `pending`/`sent`/`overdue` and `dueDate` is before today.
  - Show `Mark as Paid` for both `Pending` and `Overdue` invoices.
  - Display an Overdue Alert & Reminder Tracking banner for the owner with a 1-click **Send Payment Reminder** button and reminder count/timestamp badge.
- `src/components/InvoiceTable.vue` & `src/components/Dashboard.vue` **[MODIFY]**:
  - Display reminder count and last sent date under the `Overdue` status chip and in the mobile accordion.
  - Add a **Remind** action button on overdue invoices to open `PaymentReminderModal.vue` directly from the dashboard.
- `src/components/PublicPayment.vue` **[MODIFY]**:
  - Dynamically derive `Overdue` status when `dueDate` is before today and style `.status-badge.overdue` in urgent red.
- `src/components/InvoiceTemplate6.vue` & `src/components/InvoiceEditor.vue` **[MODIFY]**:
  - Highlight overdue status in Tech Grid template and compute dynamic status in editor preview.

## Tasks
- [x] **Task 1**: Create `functions/paymentReminder.js` and export `sendPaymentReminder` in `functions/index.js` → Verify: Function syntax and Resend email builder with `reminderCount` & `lastReminderSentAt` Firestore updates.
- [x] **Task 2**: Update `src/composables/useInvoices.js` to parse `lastReminderSentAt` / `reminderCount` and provide `sendPaymentReminder` method → Verify: Composable exports `sendPaymentReminder`.
- [x] **Task 3**: Create `src/components/PaymentReminderModal.vue` with polished default overdue copy, customization toggle, and reminder history banner → Verify: Component props, events, and responsive dark glassmorphic styling.
- [x] **Task 4**: Update `src/components/InvoiceView.vue`, `src/components/PublicPayment.vue`, `functions/stripeConnect.js`, `src/components/InvoiceEditor.vue`, and `src/components/InvoiceTemplate6.vue` to dynamically display `Overdue` status and integrate the reminder banner/button → Verify: `Overdue` badge appears on owner view, templates, and customer payment view.
- [x] **Task 5**: Update `src/components/InvoiceTable.vue` and `src/components/Dashboard.vue` to show reminder tracking metadata (`reminderCount`, `lastReminderSentAt`) and a quick **Remind** button for overdue invoices → Verify: `npm run build` succeeds without errors.
