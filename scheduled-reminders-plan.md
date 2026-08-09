# Implementation Plan - Automated Payment Reminders (Type B)

## Overview
Implement an automated payment reminder engine for ScanGo Invoice. The system automatically sends targeted email reminders via Resend at three critical invoice milestones:
1. **3 Days Before Due Date**: Friendly upcoming payment reminder.
2. **On Due Date**: Prompt due today payment reminder.
3. **7 Days Overdue**: Gentle overdue reminder requesting immediate settlement.

This feature is gated for **Pro Subscribers** (`subscriptionStatus === 'active'`), driving conversion and reducing late payments for merchants.

---

## Data Model & Schema Updates

### 1. `userSettings/{userId}`
```json
{
  "reminderSettings": {
    "enabled": true,
    "triggers": ["3_days_before", "on_due_date", "7_days_overdue"]
  }
}
```

### 2. `invoices/{invoiceId}`
```json
{
  "remindersEnabled": true,
  "remindersSent": ["3_days_before"]
}
```

---

## Action Plan & File Changes

### 1. Backend (`functions/`)
- **[NEW] `functions/scheduledReminders.js`**:
  - `onSchedule("every day 09:00", ...)` scheduled Cloud Function.
  - Queries `invoices` with `status in ['pending', 'sent', 'overdue']` and `remindersEnabled !== false`.
  - Verifies merchant user has `subscriptionStatus === 'active'`.
  - Calculates day delta: `Math.floor((dueDate - today) / (1000 * 60 * 60 * 24))`.
  - Evaluates matching trigger stage:
    - Delta = +3 days: `3_days_before`
    - Delta = 0 days: `on_due_date`
    - Delta = -7 days: `7_days_overdue`
  - Prevents duplicate sends using `remindersSent` check.
  - Sends styled dark-themed email via Resend containing invoice summary & direct payment link.
  - Updates Firestore `remindersSent` array via `FieldValue.arrayUnion()` and updates `status: 'overdue'` if past due.
- **[MODIFY] `functions/index.js`**:
  - Export `sendScheduledReminders` function.

### 2. Composables (`src/composables/`)
- **[MODIFY] `src/composables/useUserSettings.js`**:
  - Add default `reminderSettings` to initial state.
- **[MODIFY] `src/composables/useInvoices.js`**:
  - Store `remindersEnabled` (boolean) and `remindersSent` (array) on invoice creation/updates.

### 3. Frontend UI (`src/components/`)
- **[MODIFY] `src/components/UserSettings.vue`**:
  - Add "Automated Payment Reminders" settings card under business/payment terms section.
  - Toggles for master enable + individual triggers (`3_days_before`, `on_due_date`, `7_days_overdue`).
  - Pro subscription lock badge for free users.
- **[MODIFY] `src/components/InvoiceEditor.vue`**:
  - Add "Automated Reminders" switch under invoice terms options.
  - Pre-fills from user's global settings default.

---

## Verification Plan
1. **Unit & Build Validation**: Run `npm run build` to verify Vue SFC compilation.
2. **Function Verification**: Perform dry-run unit test on date math, trigger matching, and email rendering logic in `scheduledReminders.js`.
3. **Blueprint Update**: Update `blueprint.md` with v7 Automated Payment Reminders.
