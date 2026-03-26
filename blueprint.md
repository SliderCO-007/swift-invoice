# Blueprint

## Overview
The Swift Invoice application allows users to manage and generate invoices. It supports PDF generation and an optional Venmo QR code for payments.

## Application State
The application currently renders the Venmo QR code as an image within the invoice templates (`InvoiceTemplate.vue`, `InvoiceTemplate2.vue`, `InvoiceTemplate3.vue`). When invoices are generated as PDFs, they are currently rendered as a single flattened images using `html2canvas` and `jsPDF`.

## Current Request
Make the Venmo QR code a clickable link in the PDF invoice for mobile users.

## Plan & Steps
1. Determine the actual Venmo profile URL for the business owner. Use the Venmo username/link if available in user settings, or extract it/ask the user.
2. Update the `InvoiceTemplate.vue` components so the `<img>` tag for the QR code is wrapped in an `<a>` link pointing to the Venmo URL.
3. Update `InvoiceView.vue` to use `jsPDF`'s `.html()` method so that the generated PDF preserves `<a>` tag links. Wait, `.html()` might be tricky with styling. Alternatively, we can manually add a `jsPDF.link()` annotation over the bottom-right corner where the QR code is rendered, or use `jspdf` `html` feature. Let's see what is more robust.
