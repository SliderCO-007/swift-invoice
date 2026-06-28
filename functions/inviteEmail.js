const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineString } = require("firebase-functions/params");
const { Resend } = require("resend");
const admin = require("firebase-admin");

const resendApiKey = defineString("RESEND_API_KEY");

exports.sendInviteEmail = onDocumentCreated({ document: "invitations/{inviteId}" }, async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
        console.log("No data associated with the event");
        return;
    }

    const inviteData = snapshot.data();
    const recipientEmail = inviteData.email;
    const inviterId = inviteData.invitedBy;

    if (!recipientEmail) {
        console.log("No recipient email provided for invitation:", event.params.inviteId);
        return;
    }

    try {
        const db = admin.firestore();
        let inviterName = "An organization owner";
        
        if (inviterId) {
            const inviterDoc = await db.collection("users").doc(inviterId).get();
            if (inviterDoc.exists) {
                inviterName = inviterDoc.data().name || inviterDoc.data().email || inviterName;
            }
        }

        const resend = new Resend(resendApiKey.value());

        const htmlContent = `
            <div style="font-family: 'Inter', Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background-color: #111d2f; color: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #1e293b;">
                <h1 style="color: #60a5fa; margin-bottom: 24px;">You've Been Invited! 👥</h1>
                <p style="font-size: 16px; line-height: 1.6; color: #e2e8f0;">
                    Hi,
                </p>
                <p style="font-size: 16px; line-height: 1.6; color: #e2e8f0;">
                    <strong>${inviterName}</strong> has invited you to join their organization on <strong>ScanGo Invoice</strong>.
                </p>
                <p style="font-size: 16px; line-height: 1.6; color: #e2e8f0;">
                    As a team member, you'll be able to view assigned projects, log your billable hours, and upload receipt images to track expenses.
                </p>
                
                <div style="background-color: #1e293b; padding: 24px; border-radius: 8px; margin: 32px 0; border: 1px solid #334155; text-align: center;">
                    <p style="color: #cbd5e1; font-size: 15px; margin-bottom: 20px; line-height: 1.6;">
                        Click the button below to register or log in with your email (<strong>${recipientEmail}</strong>) and automatically accept the invitation.
                    </p>
                    <a href="https://scangoinvoice.com/register?email=${encodeURIComponent(recipientEmail)}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                        Accept Invitation & Join Team
                    </a>
                </div>

                <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">
                    If you already have a ScanGo Invoice account, simply log in using your invited email address, and your workspace will automatically sync.
                </p>

                <hr style="border: none; border-top: 1px solid #334155; margin: 40px 0;">
                
                <p style="font-size: 14px; color: #94a3b8; text-align: center; margin: 0;">
                    Need help? Simply <a href="mailto:support@scangoinvoice.com" style="color: #60a5fa; text-decoration: none;">click here</a> to reach our support team.<br>
                    — The ScanGo Invoice Team
                </p>
            </div>
        `;

        const { data, error } = await resend.emails.send({
            from: "ScanGo Invoice <support@scangoinvoice.com>",
            to: recipientEmail,
            subject: `Join ${inviterName} on ScanGo Invoice 🚀`,
            html: htmlContent,
        });

        if (error) {
            console.error("Resend API error sending invite email:", error);
            return;
        }

        console.log(`Invitation email successfully sent to ${recipientEmail} with ID ${data.id}`);
    } catch (error) {
        console.error("Error sending invitation email:", error);
    }
});
