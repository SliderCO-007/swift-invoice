
# Blueprint: Swift Invoice

## 1. Overview

Swift Invoice is a powerful and intuitive application designed to streamline the invoice and quote management process for small businesses and freelancers. It offers a comprehensive suite of features to create, track, and manage financial documents, helping users stay organized and get paid faster.

## 2. Core Features

### 2.1. Implemented

*   **Authentication:** Users can register and log in to the application.
*   **Professional User Interface:** The user interface maintains a professional tone. Personalized greetings and emojis have been removed from the dashboard to align with this standard.
*   **Dashboard Layout:**
    *   The `InvoiceStats` component is located in the main content area of the dashboard, providing a clear, responsive overview of key invoice metrics.
*   **Advanced Invoice List:**
    *   The main dashboard features a powerful data table for listing all invoices and quotes.
    *   All columns are sortable, including a custom, logical sort order for the "Status" column (Overdue > Pending > Quote > Paid > Draft).
    *   Users can export their invoice data, including line items, to a CSV file.
*   **Invoice & Quote Management:**
    *   Users can create, edit, and view invoices with "Pending," "Paid," or "Overdue" statuses.
    *   Users can create quotes, which can be converted into "Pending" invoices.
*   **Customer Management:** Users can add and manage customer information.
*   **Item Management:** Users can save and manage frequently used invoice items.
*   **Robust PDF Generation:**
    *   Users can download invoices and quotes as multi-page PDF files.
    *   The generation logic dynamically sizes the output to prevent content from being truncated.
*   **Email Integration:** Paid users can email invoices directly to clients.
*   **Stripe Integration:** The application uses Stripe for subscription payments.
*   **Multiple Invoice Templates:** The application includes three professionally designed invoice templates: 'Classic', 'Modern', and 'Corporate'.

### 2.2. Current Task: Weekly Email Report

The new feature will automatically send a weekly email report to users, summarizing key invoice activity.

*   **Automated Weekly Emails:** A scheduled function will run weekly to compile and send the report.
*   **Dynamic Content:** The email will be personalized for each user, containing two main sections:
    *   **Invoices Paid Last Week:** A list of all invoices that were marked as "Paid" in the previous seven days.
    *   **Invoices Due This Week:** A list of all "Pending" or "Overdue" invoices with a due date in the next seven days.
*   **No-Data Handling:** If a user has no invoices in either category, the email will not be sent to avoid unnecessary notifications.
*   **Backend Logic:** The feature will be implemented as a Firebase Cloud Function that runs on a recurring schedule.

## 3. Plan

1.  **Create a new Firebase Function:** I'll create a new file `functions/weeklyReport.js` to house the logic for the weekly email report.
2.  **Add Scheduled Trigger:** The function will be triggered on a schedule (e.g., every Monday at 8 AM).
3.  **Implement Report Logic:**
    *   Fetch all users.
    *   For each user, query their invoices to find:
        *   Invoices marked as "Paid" within the last week.
        *   Invoices with a due date within the upcoming week.
    *   If there's data for the report, compile it into an HTML email.
4.  **Set up Emailing:** I'll use Resend to send the emails. I'll need to add it as a dependency in `functions/package.json`.
5.  **Integrate into `functions/index.js`:** I'll import and export the new function from the main `index.js` file.
6.  **Update `blueprint.md`:** Document the new weekly email report feature.
