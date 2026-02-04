## Overview

This project is a Vue.js application that uses Firebase for authentication and Firestore for database management. It allows users to create, manage, and send invoices. The application is built with the Composition API, TypeScript, and Vite.

### Style and Design

The application uses a modern design system with a clean and intuitive user interface. The color palette is based on a friendly blue and a vibrant teal, with a focus on readability and a premium feel. The application is also mobile-responsive and uses a custom scrollbar for a more modern look.

### Features

- User authentication (signup, login, Google sign-in)
- Invoice management (create, read, update, delete)
- PDF generation for invoices
- Stripe integration for payments
- User settings management

### Codebase Maintenance: Import Path Correction

An attempt was made to refactor the codebase to use `@` as an alias for the `src` directory in import statements. This effort led to persistent resolution errors with the Vite development server. To restore application functionality, all import aliases have been reverted to use relative paths. The codebase is now stable and uses relative paths for all module imports.

### Dashboard UI Enhancements

- **Invoice Statistics:** The dashboard header now prominently displays key invoice statistics, including total outstanding, overdue, and paid amounts, as well as the total number of invoices. This provides users with an at-a-glance overview of their invoicing activity.
- **Responsive Design:** The dashboard has been optimized for mobile devices. On smaller screens, the invoice statistics are displayed below the welcome message for a clean and user-friendly layout.
- **State Management & Error Handling:** The dashboard's invoice deletion functionality has been improved. It now uses an optimistic UI update for a more responsive feel, while also ensuring that any database deletion errors are properly caught and reported to the user. This prevents the application from getting into an inconsistent state and provides clearer feedback.
- **Deletion Error Handling:** A bug was identified in the `Dashboard.vue` component where the error message displayed upon a failed invoice deletion was incorrect. The `handleDelete` function was showing a generic error message from the `useInvoices` composable instead of the specific error returned from the failed operation. This has been corrected to display the precise error message (`err.message`), providing clearer and more accurate feedback to the user in case of a deletion failure.
	
### Vite Configuration Update

- **Alias Configuration:** To improve developer experience and simplify import paths, the Vite configuration has been updated to include an alias for the `src` directory. The `@` alias can now be used to reference the `src` folder, making it easier to import modules from different parts of the application.
- **TypeScript Removal:** The `vite.config.ts` file has been replaced with a `vite.config.js` file, and the TypeScript dependency has been removed from the project. This change was made to simplify the build process and align with the project's preference for a JavaScript-based configuration.
- **Import Path Update:** The `CreateInvoiceSuccess.vue` component has been updated to use the new `@` alias for its imports. This is the first step in a broader effort to refactor the codebase to use the new alias, which will improve code readability and maintainability.

### Invoice Creation Refactoring

- **Delayed Invoice Number Generation:** The invoice creation process has been refactored to delay the generation of the invoice number. Previously, the invoice number was generated as soon as the user clicked the "New Invoice" button. This has been changed so that the invoice number is only generated after the service fee for PDF creation has been successfully processed. This ensures that invoice numbers are only assigned to invoices that are actually created and paid for.
- **Sequential Invoice Numbering:** The invoice numbering system has been updated to be sequential. The invoice number is now a zero-padded, 8-digit number that increments with each new invoice. The `invoiceCounter` is managed in the `userSettings` collection. This provides a more professional and organized invoicing system.

### UI Refinements

- **"Paid" Watermark Update:** The `mdi-check-decagram` icon has been removed from the "Paid" watermark on the invoice view. This provides a cleaner and less cluttered design.

### Bug Fixes

- **Invoice Deletion:** The invoice deletion functionality has been fixed in `Dashboard.vue`. A new `handleDeleteInvoice` function was created to handle the core deletion logic, and the `handleDeleteFromCard` function was updated to call this new function. The `InvoiceTable` component is now properly connected to the deletion logic via a `@delete-invoice` event listener, ensuring that invoices can be deleted from both the card and table views.
- **Invoice Creation and Payment:** The invoice creation process has been refactored to correctly handle draft and pending invoices. A new "Save as Draft" button has been added to the `InvoiceEditor.vue` component, which allows users to save an invoice without assigning a sequential invoice number. The `createInvoice` function in `useInvoices.js` has been updated to no longer force the status to 'draft', and the `saveAndPay` function in `InvoiceEditor.vue` now correctly sets the status to 'pending' before creating the invoice.
- **Stripe Integration:** The Stripe integration has been updated to ensure that the Stripe API key is present before attempting to load Stripe. A check has been added to `useStripe.js` to verify that the `VITE_STRIPE_PUBLIC_KEY` environment variable is set. If the key is missing, an error is thrown, and a descriptive message is logged to the console.
