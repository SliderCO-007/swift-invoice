const {onRequest} = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const {Resend} = require('resend');
const {defineString} = require('firebase-functions/params');

// -- Initialize Firebase Admin SDK --
admin.initializeApp();
const storage = admin.storage();

// -- Environment Variables --
const resendKey = defineString('RESEND_KEY');

// --- Cloud Function: sendInvoiceEmail ---
exports.sendInvoiceEmail = onRequest(
    {cors: true, memory: '1GiB'},
    async (req, res) => {
      const resend = new Resend(resendKey.value());

      const {invoiceId, clientEmail, clientName, companyName} = req.body;

      if (!invoiceId || !clientEmail || !clientName || !companyName) {
        const error =
          'Missing required data: invoiceId, clientEmail, ' +
          'clientName, or companyName.';
        console.error('Validation Error:', error, req.body);
        res.status(400).send(error);
        return;
      }

      let invoiceData;
      let pdfBuffer;

      try {
      // 1. Fetch Invoice Document
        const docRef = admin.firestore().collection('invoices').doc(invoiceId);
        const invoiceDoc = await docRef.get();
        if (!invoiceDoc.exists) {
          res.status(404).send('Invoice not found.');
          return;
        }
        invoiceData = invoiceDoc.data();

        // 2. Download PDF from Firebase Storage
        const bucket = storage.bucket();
        const filePath = `invoice_pdfs/${invoiceId}.pdf`;
        const file = bucket.file(filePath);
        const [exists] = await file.exists();
        if (!exists) {
          console.error(`PDF not found in Storage at path: ${filePath}`);
          res.status(404).send('Invoice PDF not found in storage.');
          return;
        }
        const [buffer] = await file.download();
        pdfBuffer = buffer;
      } catch (error) {
        console.error('Error fetching data or PDF:', error);
        res.status(500).send(
            'Error fetching invoice data or PDF from storage.',
        );
        return;
      }

      // 3. Define Email Content
      const emailHtml = `
  <!DOCTYPE html>
  <html>
  <head>
      <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 20px auto; padding: 20px;
                       border: 1px solid #eee; border-radius: 8px; }
          .header { text-align: center; margin-bottom: 20px; }
          .footer { margin-top: 20px; font-size: 0.8em; text-align: center;
                    color: #777; }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h2>Invoice from ${companyName}</h2>
          </div>
          <p>Dear ${clientName},</p>
          <p>
            Thank you for your business! Your invoice
            #${invoiceData.invoiceNumber} is attached to this email.
          </p>
          <p>
            Please review the attached PDF for payment details,
            including available payment options.
          </p>
          <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
          </div>
      </div>
  </body>
  </html>
  `;

      // 4. Send Email with Resend
      try {
        await resend.emails.send({
          from: 'no-reply@swiftinvoice.biz',
          to: clientEmail,
          subject: `Invoice #${invoiceData.invoiceNumber} from ${companyName}`,
          html: emailHtml,
          attachments: [
            {
              filename: `Invoice-${invoiceData.invoiceNumber}.pdf`,
              content: pdfBuffer,
            },
          ],
        });
        res.status(200).send('Email sent successfully with PDF attachment.');
      } catch (error) {
        console.error('Error sending email via Resend:', error);
        res.status(500).send('Failed to send email.');
      }
    });
