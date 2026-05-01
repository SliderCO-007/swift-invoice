const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineString } = require("firebase-functions/params");
const { Resend } = require("resend");

const resendApiKey = defineString("RESEND_API_KEY");

exports.sendWelcomeEmail = onDocumentCreated("users/{userId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
        console.log("No data associated with the event");
        return;
    }

    const userData = snapshot.data();
    const userEmail = userData.email;
    const userName = userData.name || "Customer";

    if (!userEmail) {
        console.log("No email provided for user:", event.params.userId);
        return;
    }

    try {
        const resend = new Resend(resendApiKey.value());

        const htmlContent = `
            <div style="font-family: 'Inter', Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background-color: #111d2f; color: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #1e293b;">
                <h1 style="color: #60a5fa; margin-bottom: 24px;">Welcome to ScanGo Invoice! 🚀</h1>
                <p style="font-size: 16px; line-height: 1.6; color: #e2e8f0;">
                    Hi ${userName},
                </p>
                <p style="font-size: 16px; line-height: 1.6; color: #e2e8f0;">
                    We're thrilled to have you on board! ScanGo Invoice is designed to help you streamline your billing and get paid faster.
                </p>
                
                <div style="background-color: #1e293b; padding: 24px; border-radius: 8px; margin: 32px 0;">
                    <h2 style="color: #f8fafc; font-size: 18px; margin-top: 0; margin-bottom: 16px;">Here's what you can do right away:</h2>
                    <ul style="color: #cbd5e1; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                        <li>📝 <strong>Create Professional Invoices:</strong> Stand out with clean, customizable invoices generated in seconds.</li>
                        <li>📱 <strong>Accept Online Payments:</strong> Get paid instantly via credit card, Apple Pay, Google Pay, and ACH — all through ScanGo Invoice's secure, branded payment page.</li>
                        <li>📊 <strong>Business Insights:</strong> Track paid, pending, and overdue invoices easily.</li>
                        <li>📈 <strong>End-to-End Business Tracking:</strong> Manage your billing lifecycle seamlessly from first contact to final payment.</li>
                    </ul>
                </div>

                <p style="font-size: 16px; line-height: 1.6; color: #e2e8f0; margin-bottom: 32px;">
                    Ready to take control of your invoicing?
                </p>

                <div style="text-align: center;">
                    <a href="https://scangoinvoice.com" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                        Create Your First Invoice
                    </a>
                </div>

                <div style="text-align: center; margin-top: 24px;">
                    <a href="https://scangoinvoice.com/__ScanGo%20Invoice%20+%20Stripe%20Connect.pdf" style="color: #60a5fa; text-decoration: underline; font-size: 15px;">
                        Download the ScanGo Invoice + Stripe Connect Setup Guide
                    </a>
                </div>

                <hr style="border: none; border-top: 1px solid #334155; margin: 40px 0;">
                
                <p style="font-size: 14px; color: #94a3b8; text-align: center; margin: 0;">
                    Need help? Simply <a href="mailto:support@scangoinvoice.com" style="color: #60a5fa; text-decoration: none;">click here</a> to reach our support team.<br>
                    — The ScanGo Invoice Team
                </p>
            </div>
        `;

        const { data, error } = await resend.emails.send({
            from: "ScanGo Invoice <support@scangoinvoice.com>",
            to: userEmail,
            subject: "Welcome to ScanGo Invoice! 🚀",
            html: htmlContent,
        });

        if (error) {
            console.error("Resend API error:", error);
            return;
        }

        console.log(`Welcome email successfully sent to ${userEmail} with ID ${data.id}`);
    } catch (error) {
        console.error("Error sending welcome email:", error);
    }
});
