# ScanGo Invoice - User Documentation Guide

Welcome to the ScanGo Invoice User Guide! This document provides step-by-step instructions for managing your business invoicing, project tracking, team management, and online payment workflows.

---

## 📋 Table of Contents
1. [How to Create an Invoice](#1-how-to-create-an-invoice)
2. [How to Update Your Business Information](#2-how-to-update-your-business-information)
3. [How to Create Customers, Products, and Expense Categories](#3-how-to-create-customers-products-and-expense-categories)
4. [How to Export Invoice Data](#4-how-to-export-invoice-data)
5. [How to View and Generate Reports](#5-how-to-view-and-generate-reports)
6. [How to Set Up Stripe Connect & Accept Payments](#6-how-to-set-up-stripe-connect--accept-payments)
7. [How to Use Project & Time/Expense Tracking](#7-how-to-use-project--timeexpense-tracking)
8. [How to Manage Team Seats & Collaboration](#8-how-to-manage-team-seats--collaboration)

---

## 1. How to Create an Invoice

Creating professional invoices with ScanGo Invoice is fast and intuitive:

1. **Start a New Invoice**:
   - Log in and navigate to the **Dashboard**.
   - Click the floating **`+` (Plus)** button in the bottom-right corner of the page, or click **"Create Your First Invoice"** if you are new to the platform.
2. **Select or Enter Client Information**:
   - In the **Client Details** section, type a customer name. 
   - If the client is already saved in your directory, choose them from the dropdown autocomplete list to auto-fill their email, phone, and address.
   - If they are a new client, fill in their details manually; they will automatically save to your directory when you save the invoice.
3. **Add Line Items**:
   - In the **Invoice Items** list, click **"Add Item"**.
   - Type or select a product/service from your catalog.
   - Specify the **Quantity** and **Price**.
   - Use the **Tax** checkbox next to each item to choose whether that specific item is taxable (useful for separating service labor from physical products).
4. **Apply Discounts and Adjust Global Settings**:
   - Enter a discount amount in the **Discount** field, and choose whether it is a flat rate or percentage.
   - Set the **Tax Rate** percentage to apply to taxable items.
   - Select an **Issue Date** and a **Due Date** (defaults to 30 days from issue).
5. **Choose a Design Template**:
   - Scroll to the **Template Selection** section.
   - Select one of the 6 premium styles (e.g. Classic, Tech Grid, Creative Sidebar) and choose your brand accent color. Non-taxable items will display a subtle **(No Tax)** indicator on the generated invoice.
6. **Save or Preview**:
   - Click **"Preview"** to see how the invoice looks.
   - Click **"Save Invoice"** to finalize the record. (Free plan allows up to 5 finalized invoices).

---

## 2. How to Update Your Business Information

Ensure your invoices always display your current branding and contact information:

1. **Access Settings**:
   - Click the **User Menu** (top-right avatar) and select **Settings** or navigate to **Onboarding** directly.
2. **Onboarding Wizard**:
   - New users are automatically routed to a single-step **Onboarding Wizard** (`/onboarding`) upon registration to set up their initial company profile.
3. **Company Profile Details**:
   - **Company Name**: Your official trading name.
   - **Contact Details**: Email and phone number.
   - **Address**: Street, City, State, and Zip code.
   - **Currency**: Select your default transaction currency (e.g. USD, EUR, GBP).
4. **Upload Brand Logo**:
   - Click on the logo section under Company Info, select an image file from your device, and upload it.
5. **Choose Accent Color**:
   - Use the primary color picker to select your brand's signature color. This color dynamically themes button accents and tables on your selected templates.
6. **Save Changes**:
   - Click **"Save & Continue"** or **"Save Settings"**.

---

## 3. How to Create Customers, Products, and Expense Categories

Save time by adding clients, items, and expense categories to your catalog directories beforehand, enabling autocomplete during invoice and project tracking logs:

### Managing Customers
1. Navigate to the **Customers** page from the navigation menu.
2. Click **"New Customer"** in the top bar.
3. Enter the customer's Name, Email, Phone, and Address details.
4. Click **"Save"**. You can search, edit, or delete customers from this table at any time.

### Managing Products / Services
1. Navigate to the **Items** page from the navigation menu and click the **Invoice Items** tab.
2. Click **"Add Item"** in the top bar.
3. Provide an **Item Name**, **Default Price**, and check whether the item is **Taxable** by default.
4. Click **"Save"**. These products will now instantly autocomplete when building new invoices.

### Managing Expense Categories (Owners Only)
1. Navigate to the **Items** page from the navigation menu and click the **Expense Categories** tab.
2. Click **"Add Category"** to create a custom expense category (e.g., "Materials", "Travel").
3. You can edit or delete categories here. Rest assured, deleting a category does not affect historical expense logs.
4. *Note: Team members cannot create new categories and must choose from pre-existing ones when logging expenses.*

---

## 4. How to Export Invoice Data

You can download lists of invoices or export individual documents for accounting:

### Exporting the Invoices List (CSV Spreadsheet)
1. Go to your **Dashboard**.
2. Make sure you are on the **Invoices** tab.
3. Click the **"Export CSV"** button located at the top-right of your invoices table.
4. A `.csv` file containing details (Invoice #, Client, Issue Date, Due Date, Total, and Status) for all invoices will be downloaded to your device.

### Exporting a Specific Invoice (PDF)
1. In your Dashboard invoice list, click the **"View" (eye icon)** next to the invoice you want to download.
2. On the invoice preview page, click **"Download PDF"** in the top bar.
3. A clean, styled PDF copy of the invoice will be compiled and downloaded.

---

## 5. How to View and Generate Reports

Analyze your sales performance and audit team hours with the reporting module:

### Sales Reports
1. Navigate to the **Reports** page and click the **Sales Report** tab.
2. **Apply Month and Year Filters**: Use the dropdown menus at the top to select the **Month** and **Year** you wish to audit.
3. **Review Key Performance Indicators**:
   - **Total Sales**: Combined total of all finalized invoices in that month.
   - **Tax Collected**: Sum of taxes collected from taxable line items.
   - **Average Value**: The average value of your invoices for the month.
   - **Total Invoices**: Total count of invoices created.
   - **Paid vs. Pending**: Visual card breakdown showing how much revenue has been collected versus how much is still outstanding.
4. **Analyze the Sales Trend**: Check the **Daily Sales Trend** bar graph to visualize day-by-day sales peaks.
5. **Export the Monthly Report**:
   - Click **"Export CSV"** to download a spreadsheet table of that specific month's invoice breakdown.
   - Click **"Download PDF"** to generate and download a clean, print-friendly portrait PDF report.

### Team Hours Report (Owners Only)
1. Navigate to the **Reports** page and click the **Team Hours Report** tab.
2. **Apply Filters**: Filter logged time entries by **Date Range** (Start Date and End Date) and **Team Member** (including yourself).
3. **Review Metrics**:
   - **Total Hours**: Combined hours logged during the period.
   - **Billable/Non-Billable Split**: Hours split by billable status.
   - **Estimated Labor Cost**: Cost calculated based on member rates.
4. **Export the Hours Report**:
   - Click **"Export CSV"** for quick payroll software integration.
   - Click **"Download PDF"** to generate a beautifully aligned, print-ready PDF summary of team logs.

---

## 6. How to Set Up Stripe Connect & Accept Payments

Accept instant online card and bank payments directly from your clients:

1. **Connect Stripe Account**:
   - Click the "Connect with Stripe" banner on your **Dashboard** or under **Settings** (`/settings`).
   - You will be redirected to Stripe to create or link your merchant account.
2. **Profile Auto-Sync**:
   - Upon completing the connection and returning to the platform, your company profile (company name, address, state, city, zip code, and email) is automatically synced from Stripe into your **Settings** to eliminate double data entry.
3. **Stripe Scan-to-Pay QR Code**:
   - Once your Stripe charges are enabled, a dynamic "Scan to Pay" QR code is automatically rendered on all invoice templates (e.g. Classic, Tech Grid, Creative Sidebar) so clients can pay instantly.
4. **Online Payment Options**:
   - Customers opening your payment links can pay securely using credit cards, Apple Pay, Google Pay, or ACH bank transfers.
5. **Low 0.25% Platform Fee**:
   - Payments processed via Stripe Connect carry an industry-leading, low platform application fee of just **0.25%**, maximizing your revenue retention on every paid invoice.

---

## 7. How to Use Project & Time/Expense Tracking

Create projects, track hours, manage receipt expenses, and bill clients in one click:

1. **Access Projects**:
   - Navigate to the **Projects** page (unlocked for all plans, including Free).
2. **Create a New Project**:
   - Click **"New Project"**, enter client details, a project description, and a **Default Hourly Rate**.
3. **Log Hours (Time Entries)**:
   - Inside a project page, click **"Log Hours"**.
   - Input the date, description, hours, and toggle whether it is **Billable** or not.
4. **Log Expenses**:
   - Click **"Add Expense"**, select an **Expense Category** from the dropdown, enter the amount, and optionally upload a **Receipt Photo** which is saved securely.
5. **Delete Projects (Owners Only)**:
   - To prevent accidental losses, deleting a project deletes all associated time and expense logs in a cascading format. Confirm deletion by typing the project name exactly inside the safety modal.
6. **Convert Project to Invoice**:
   - Click **"Convert to Invoice"** at the top-right of your project page.
   - A dialog will ask if you want to:
     - **Individual Entries (Default)**: Maps each logged time and expense entry to separate line items (e.g., Labor: 5 hours @ $80/hr, Materials: Copper Pipes) with automated tax applications.
     - **Combine Entries**: Check "Combine entries..." to consolidate all hours into one "Labor" item and all expenses into one "Expenses" item.
   - Click **"Convert"** to generate a pre-filled draft invoice immediately.

---

## 8. How to Manage Team Seats & Collaboration

Collaborate with your crew while maintaining strict control over billing and rates:

1. **Invite Team Members**:
   - Organization Owners can navigate to **Team Settings** under the User Menu to invite members by entering their email address.
2. **Manage Invitations**:
   - Pending invitations are listed in the Team Settings dashboard. Owners can cancel/revoke any sent invitation with a single click before the user registers.
3. **Role Gating & Restrictions**:
   - **Member Role**: Invited crew members who register inherit your organization ID but are locked out of billing data:
     - Hides all invoices, reports, Stripe settings, and onboarding wizards.
     - Restricts navigation to the **Projects** and **Guide** pages.
     - Completely hides hourly rates, default project rates, and billing totals across the entire app.
     - Restricts expense categories to dropdown-only choices (preventing members from creating new categories).
   - **Owner Role**: Full administrative control over invoices, settings, reports, Stripe account details, invitation management, project deletions, and custom rates.
