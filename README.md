# ScanGo Invoice

ScanGo Invoice is a modern, premium, glassmorphic Vue.js web application that empowers small businesses and freelance professionals to digitize expense receipts, log project hours, manage clients/items, build/preview professional invoices, accept direct credit card or ACH payments via Stripe Connect, and export detailed monthly sales reports.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v20 or higher is recommended.
- **Firebase CLI**: Installed and configured for deployment.

### Running Locally

1. **Clone the repository and install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Create a local configuration file `.env.local` by referencing `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
   Add your Firebase and Stripe keys.

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open your browser to the local URL (usually `http://localhost:5173/`).

4. **Build the production bundle**:
   ```bash
   npm run build
   ```

---

## ✨ Features

- **Billing & Templates**: Choose from 6 distinct premium invoice designs (Classic, Modern, Corporate, Solid, Creative Sidebar, and Tech Grid).
- **Stripe Connect Integration**: Connect Stripe accounts to enable credit cards, Apple Pay, Google Pay, and ACH bank transfers directly from customer-facing invoices.
- **Project & Time Tracking**: Track projects, log hourly labor entries, log expenses with receipt image uploads, and convert billable items directly to pre-filled invoices with 1 click.
- **Robust Client & Items Directories**: Access auto-saving directories of your customers and frequent services/goods for lightning-fast autocomplete creation.
- **Comprehensive Reporting**: Filter and analyze your business with dedicated **Sales Reports** showing monthly sales totals, tax collection summaries, average invoice size, daily revenue charts, and detailed data exports (CSV and print-ready PDF).
- **Freemium Upgrade Funnel**: Includes soft caps (e.g. 3 invoices per month for free tier) and upgrade prompts to easily convert free accounts into paid Pro subscribers.

---

## 📂 Project Directory Structure

```
swift-invoice/
├── .idx/                  # IDX IDE configurations
├── dist/                  # Static production build files
├── functions/             # Firebase Cloud Functions (Emailing, Stripe Webhooks, etc.)
├── public/                # Static assets (images, logos, icons)
├── src/
│   ├── assets/            # Global images and graphics
│   ├── components/        # Vue single-file components (Views, Layouts, Wizards)
│   ├── composables/       # Global state management and API services (Auth, Invoices, Projects)
│   ├── plugins/           # Vuetify framework configuration
│   ├── router/            # Route configurations and navigation guards
│   ├── utils/             # Helper scripts (CSV exports)
│   ├── App.vue            # Root component
│   ├── main.js            # App initialization and GA configuration
│   └── style.css          # Core design system styles
├── firestore.rules        # Firestore security rules
├── storage.rules          # Cloud Storage security rules
├── firebase.json          # Firebase configurations
└── package.json           # Project dependencies & scripts
```

---

## 🗄️ Firestore Database Schema

The Firestore database leverages a flat collection structure with secure owner-only authorization rules.

### 1. `users/{userId}`
Tracks users, their registration info, and subscription levels.
```json
{
  "uid": "USER_UID",
  "email": "user@example.com",
  "name": "Jane Doe",
  "invoiceCount": 2,
  "subscriptionStatus": "free", // "free" | "paid"
  "createdAt": "TIMESTAMP"
}
```

### 2. `userSettings/{userId}`
Manages business profiles and document preferences.
```json
{
  "company": {
    "name": "Acme Corp",
    "email": "billing@acme.com",
    "phone": "555-0199",
    "address1": "123 Main St",
    "address2": "Suite 100",
    "city": "Metropolis",
    "state": "NY",
    "zip": "10001",
    "logoUrl": "FIREBASE_STORAGE_URL",
    "primaryColor": "#1a3a52"
  },
  "taxRate": 8.25,
  "defaultDiscount": 0,
  "defaultDiscountType": "percentage",
  "invoiceCounter": 12,
  "currency": "USD"
}
```

### 3. `invoices/{invoiceId}`
Holds invoice parameters and computed sums.
```json
{
  "userId": "USER_UID",
  "invoiceNumber": "000012",
  "issueDate": "TIMESTAMP",
  "dueDate": "TIMESTAMP",
  "clientName": "John Smith",
  "client": {
    "name": "John Smith",
    "email": "john@example.com"
  },
  "items": [
    {
      "description": "Design Consulting",
      "quantity": 10,
      "price": 100,
      "taxable": false
    }
  ],
  "taxRate": 8.25,
  "discount": 10,
  "discountType": "percentage",
  "status": "paid", // "draft" | "pending" | "sent" | "paid" | "overdue"
  "paidAt": "TIMESTAMP",
  "createdAt": "TIMESTAMP"
}
```

### 4. `projects/{projectId}`
Coordinates time tracking logs.
```json
{
  "userId": "USER_UID",
  "name": "Website Redesign",
  "clientName": "Delta Inc",
  "clientId": "CUSTOMER_ID",
  "description": "Redesign corporate portal",
  "defaultRate": 120,
  "status": "Active", // "Active" | "Completed" | "Archived"
  "totalHours": 14.5,
  "totalLabor": 1740,
  "totalExpenses": 85.2,
  "createdAt": "TIMESTAMP"
}
```

### 5. `projects/{projectId}/entries/{entryId}`
Specific hours or expenses logged to a project.
```json
{
  "type": "time", // "time" | "expense"
  "date": "YYYY-MM-DD",
  "description": "Updated stylesheet colors",
  "billable": true,
  "hours": 3.5, // Used for type="time"
  "rate": 120,  // Used for type="time"
  "amount": 85.2, // Used for type="expense"
  "category": "Software Licenses", // Used for type="expense"
  "receiptUrl": "FIREBASE_STORAGE_URL", // Used for type="expense"
  "createdAt": "TIMESTAMP"
}
```

---

## 🛠️ Tech Stack & Concepts

- **Vue 3 (Composition API)**: Standard Single-File Components using the modern `<script setup>` syntax.
- **Vite**: Ultra-fast front-end tooling server.
- **Vuetify**: Google Material Design library.
- **Singleton Composables**: State management pattern (e.g. `useInvoices.js`, `useProjects.js`) using shared refs defined outside the hook closures, acting as a lightweight global store.
- **Firebase integration**:
  - **Firestore**: Reactive data synchronization.
  - **Firebase Auth**: User account sessions (including synchronous Pop-up patterns for mobile browser Google Login).
  - **Cloud Functions**: Node serverless code for processing Stripe webhooks, Stripe Connect session links, and onboarding trigger mailers.
  - **Firebase Storage**: Secure file repository for merchant logo assets and receipt snapshots.

---

## 🚀 Deployment

ScanGo Invoice is deployed via Firebase hosting and Firestore configuration pipelines.

### Firestore Rules & Storage Rules
Ensure you apply rules changes before publishing changes to security layouts:
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

### Deploying the App
To release updates:
```bash
npm run build
firebase deploy --only hosting
```
