# Project Tracking Feature Set — Finalized Plan

## Overview

Add a full project tracking workflow to ScanGo Invoice: create projects, log billable hours and expenses (with receipt photo capture), view running totals, and convert a project directly into a pre-filled invoice. Available to monthly and annual subscribers only.

---

## Decisions Incorporated

| # | Decision |
|---|---|
| 1 | Project carries a **default hourly rate** that pre-fills each new time entry |
| 2 | Expense categories are **free-text** but auto-saved to `users/{uid}/items` with `type: 'expense-category'` for reuse via typeahead |
| 3 | Invoice conversion **rolls up** all labor into one "Labor" line item and all expenses into one "Expenses" line item |
| 4 | Feature is **gated to monthly/annual plans** — free users see an `UpgradePrompt` |
| 5 | Projects have **three statuses**: `active` · `completed` · `archived` |

---

## Proposed Changes

---

### Component 1 — Data Layer (Firestore)

No migration needed. Two new collections added purely by writing to them.

#### `projects` collection
```
projects/{projectId}
  userId:        string
  name:          string
  clientName:    string         // free text
  clientId:      string | null  // optional link to existing customer doc
  description:   string
  defaultRate:   number         // $/hr, pre-fills time entries
  status:        'active' | 'completed' | 'archived'
  createdAt:     Timestamp
  updatedAt:     Timestamp
```

#### `projects/{projectId}/entries` subcollection
Time entries and expenses share one subcollection, differentiated by `type`:
```
entries/{entryId}
  type:         'time' | 'expense'
  date:         Timestamp
  description:  string
  billable:     boolean
  createdAt:    Timestamp

  // time-only
  hours:        number
  rate:         number   // $/hr captured at entry time (snapshot of project rate)

  // expense-only
  amount:       number
  category:     string   // free text, saved to items collection
  receiptUrl:   string | null
```

#### Expense category reuse (`users/{uid}/items`)
When a user types a new expense category and saves the entry, we call `useItems().addItem({ name: category, type: 'expense-category' })` — **only if that category doesn't already exist**. The expense form fetches items filtered by `type === 'expense-category'` to populate a typeahead suggestion list. This is completely transparent to the existing `ItemsView.vue`.

---

### Component 2 — Composable

#### [NEW] `useProjects.js`
Follows the exact `useInvoices.js` module pattern (module-level refs, `onSnapshot` listener keyed to `currentUser`).

**Exports:**
```js
// Project CRUD
projects, loading, error
createProject(data)
updateProject(id, data)
deleteProject(id)
getProject(id)

// Entry CRUD
addEntry(projectId, entryData, receiptFile?)  // uploads receipt to Storage if file present
updateEntry(projectId, entryId, data)
deleteEntry(projectId, entryId)
getEntries(projectId)   // returns { entries, loading } reactive for one project

// Invoice bridge
buildInvoicePayload(project, entries)
```

**`buildInvoicePayload` logic:**
```
billableTime    = entries.filter(e => e.type === 'time' && e.billable)
billableExpenses = entries.filter(e => e.type === 'expense' && e.billable)

laborTotal    = sum(hours * rate) for billableTime
expensesTotal = sum(amount) for billableExpenses

lineItems = []
if (laborTotal > 0)
  lineItems.push({ name: 'Labor', description: `${totalHours} hrs @ project: ${project.name}`, quantity: 1, price: laborTotal })
if (expensesTotal > 0)
  lineItems.push({ name: 'Expenses', description: `Project expenses — ${project.name}`, quantity: 1, price: expensesTotal })

return {
  client: { name: project.clientName },
  items: lineItems,
  notes: `Project: ${project.name}`,
  status: 'pending'
}
```

**Receipt upload** reuses the identical Firebase Storage pattern from `saveUserSettings`:
```js
const receiptStorageRef = storageRef(storage, `receipts/${userId}/${projectId}/${Date.now()}_${file.name}`)
await uploadBytes(receiptStorageRef, file)
entry.receiptUrl = await getDownloadURL(receiptStorageRef)
```

---

### Component 3 — Vue Components (4 new files)

#### [NEW] `ProjectsView.vue` — `/projects`
Main list page. Subscription gate check on mount — redirects free users to `UpgradePrompt`.
- Header: "Projects" title + "New Project" button
- Status filter tabs: All · Active · Completed · Archived
- Card grid: project name, client, status badge, running totals (hours + $ expenses), last updated
- Click card → `ProjectDetail`

#### [NEW] `ProjectEditor.vue` — `/projects/new` and `/projects/:id/edit`
Create/edit form in a full page or dialog. Fields:
- Project Name (required)
- Client (typeahead from Customers collection, or free-text fallback)
- Description (textarea)
- Default Hourly Rate (number input)
- Status (radio: Active / Completed / Archived) — defaults to Active on create

#### [NEW] `ProjectDetail.vue` — `/projects/:id`
The core working view. Layout:

**Header bar:**
- Project name + status badge + Edit button
- Summary chips: `X hrs logged` · `$Y expenses` · `$Z total billable`
- "Convert to Invoice" button (calls `buildInvoicePayload` → navigates to `/invoice/new`)

**Two-tab body:**

*Tab 1 — Time*
- "Log Hours" button → inline slide-in form:
  - Date (date picker, defaults today)
  - Hours (number)
  - Rate (number, pre-filled from `project.defaultRate`)
  - Description (text)
  - Billable toggle (defaults on)
- Entry list: date · description · hours · rate · subtotal · billable chip · edit/delete

*Tab 2 — Expenses*
- "Add Expense" button → inline form:
  - Date (date picker, defaults today)
  - Amount (currency input)
  - Category (combobox — typeahead from saved `expense-category` items, free text allowed, auto-saves new values)
  - Description (text)
  - Billable toggle (defaults on)
  - Receipt: `<input type="file" accept="image/*" capture="environment">` wrapped in a styled upload button — shows thumbnail after upload
- Entry list: date · category · description · amount · receipt thumbnail · billable chip · edit/delete

#### [NEW] `ReceiptViewer.vue` — shared dialog component
Lightbox for full-screen receipt image preview.
- Triggered by clicking a thumbnail anywhere in the app
- Props: `receiptUrl: string`
- Simple centered image with close button and download link

---

### Component 4 — Router

#### [MODIFY] `router/index.js`
Add four routes (all `requiresAuth: true`). Insert **before** the `/:pathMatch(.*)` catch-all:

```js
{ path: '/projects',           name: 'Projects',      component: () => import('../components/ProjectsView.vue'),  meta: { requiresAuth: true } },
{ path: '/projects/new',       name: 'ProjectNew',    component: () => import('../components/ProjectEditor.vue'), meta: { requiresAuth: true } },
{ path: '/projects/:id',       name: 'ProjectDetail', component: () => import('../components/ProjectDetail.vue'), meta: { requiresAuth: true } },
{ path: '/projects/:id/edit',  name: 'ProjectEdit',   component: () => import('../components/ProjectEditor.vue'), meta: { requiresAuth: true } },
```

> [!IMPORTANT]
> `/projects/new` must be declared before `/projects/:id` to avoid the param route capturing it.

---

### Component 5 — Navigation

#### [MODIFY] `AppBar.vue`
Add "Projects" nav item alongside Dashboard / Invoices / Customers. Show with a `mdi-folder-multiple-outline` icon. Gate visibility or show lock icon for free users.

---

### Component 6 — Invoice Conversion Bridge

#### [MODIFY] `InvoiceEditor.vue`
Small addition to `onMounted` — check for pre-fill data passed via router state:

```js
onMounted(() => {
  const prefill = history.state?.invoicePrefill
  if (prefill) {
    Object.assign(invoice, prefill)
  }
})
```

In `ProjectDetail.vue`, the "Convert to Invoice" button:
```js
const convertToInvoice = () => {
  const payload = buildInvoicePayload(project.value, entries.value)
  router.push({ name: 'InvoiceNew', state: { invoicePrefill: payload } })
}
```

> [!NOTE]
> `history.state` is used instead of query params because the payload may contain nested objects. No URL encoding needed. The state is automatically cleared on subsequent navigation.

---

## Build Order

Execute in this sequence to maintain a working app at every step:

1. **`useProjects.js`** — composable first, no UI yet
2. **`ProjectsView.vue`** + router + AppBar — list page (empty state)
3. **`ProjectEditor.vue`** — create/edit projects
4. **`ProjectDetail.vue`** (time tab only) — log hours
5. **`ProjectDetail.vue`** (expenses tab + receipt upload)
6. **`ReceiptViewer.vue`** — receipt lightbox
7. **`InvoiceEditor.vue` bridge** + `buildInvoicePayload` — conversion

---

## Verification Plan

### Dev Checks
- Subscription gate: navigate to `/projects` as free user → confirm `UpgradePrompt` renders
- Create project, add 3 time entries, mark one non-billable → conversion excludes it
- Add expense with receipt photo on mobile (camera) and desktop (file picker)
- Receipt thumbnail renders in entry list; lightbox opens on click
- Convert to invoice: verify "Labor" line item total = sum of billable hours × rate; "Expenses" = sum of billable expense amounts
- New expense category auto-saved to items collection; appears in typeahead on second expense entry

### Manual Verification
1. Full end-to-end: create project → log hours + expenses with receipt → convert → send invoice
2. Status workflow: set project to Completed, confirm it moves to Completed tab in `ProjectsView`
3. Mobile receipt capture: open on iOS/Android, tap "Add Expense", confirm camera launches
