import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Environment variables loader
function loadEnvFiles() {
  const envFiles = [
    '.env.local',
    '.env',
    'functions/.env.swift-invoice-9124f',
    'functions/.env',
    'functions/.env.local'
  ];
  
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const firstEq = trimmed.indexOf('=');
          const key = trimmed.substring(0, firstEq).trim();
          let val = trimmed.substring(firstEq + 1).trim();
          val = val.replace(/^["']|["']$/g, '');
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnvFiles();

// Helper to get access token from gcloud CLI
function getGcloudAccessToken() {
  if (process.env.GOOGLE_ACCESS_TOKEN) return process.env.GOOGLE_ACCESS_TOKEN;
  try {
    const out = execSync('gcloud auth print-access-token', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    return out ? out.trim() : null;
  } catch (err) {
    try {
      const out = execSync('powershell -NoProfile -Command "gcloud auth print-access-token"', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
      return out ? out.trim() : null;
    } catch {
      return null;
    }
  }
}

// 2. Load Resend module dynamically
let ResendClass;
try {
  const resendMod = await import('../functions/node_modules/resend/dist/index.js');
  ResendClass = resendMod.Resend;
} catch (err) {
  try {
    const resendMod = await import('resend');
    ResendClass = resendMod.Resend;
  } catch (e) {
    console.error('❌ Could not import "resend" package. Make sure dependencies are installed in functions/.');
    process.exit(1);
  }
}

// 3. Load Firebase Admin / Firestore dynamically
let admin;
try {
  const adminMod = await import('../functions/node_modules/firebase-admin/lib/index.js');
  admin = adminMod.default || adminMod;
} catch (e) {
  try {
    const adminMod = await import('firebase-admin');
    admin = adminMod.default || adminMod;
  } catch (err) {
    // Fallback
  }
}

let FirestoreClass;
try {
  const firestoreMod = await import('../functions/node_modules/@google-cloud/firestore/build/src/index.js');
  FirestoreClass = firestoreMod.Firestore;
} catch (e) {
  try {
    const firestoreMod = await import('@google-cloud/firestore');
    FirestoreClass = firestoreMod.Firestore;
  } catch (err) {
    // Fallback
  }
}

// Load HMAC helper from functions
const { generateUnsubscribeToken, getUnsubscribeUrl } = await import('../functions/unsubscribeHelper.js');

// 4. Parse command-line flags
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`================================================================================`);
  console.log(`📊 SCANGO INVOICE - WEEKLY REPORT LAUNCH ANNOUNCEMENT CLI`);
  console.log(`================================================================================`);
  console.log(`\nDescription:`);
  console.log(`  Sends a branded, high-converting announcement email to registered users`);
  console.log(`  introducing automated weekly invoice reports with opt-out options.`);
  console.log(`\nUsage:`);
  console.log(`  node scripts/send-weekly-report-announcement.js [OPTIONS]`);
  console.log(`\nOptions:`);
  console.log(`  --dry-run                Simulate target finding and preview email without sending.`);
  console.log(`  --send                   Send emails directly without interactive prompt.`);
  console.log(`  --to=<email>             Target a single email address directly (test mode).`);
  console.log(`  --name=<name>            Override recipient first name for --to test mode.`);
  console.log(`  --from=<sender>          Custom sender address (default: ScanGo Invoice <support@scangoinvoice.com>).`);
  console.log(`  --limit=<n>              Limit total emails sent (useful for staged rollouts).`);
  console.log(`  --force                  Send email even if user already received this announcement.`);
  console.log(`  -h, --help               Show this help message and exit.`);
  console.log(`\nExamples:`);
  console.log(`  1) Preview matching users and email layout (Dry-Run):`);
  console.log(`     node scripts/send-weekly-report-announcement.js --dry-run\n`);
  console.log(`  2) Send live test email to your personal address:`);
  console.log(`     node scripts/send-weekly-report-announcement.js --to=you@example.com --send\n`);
  console.log(`  3) Broadcast to all registered users:`);
  console.log(`     node scripts/send-weekly-report-announcement.js --send\n`);
  console.log(`================================================================================`);
  process.exit(0);
}

const isDryRun = args.includes('--dry-run');
const isDirectSend = args.includes('--send');
const isForce = args.includes('--force');

function getArgValue(prefix, defaultValue) {
  const eqArg = args.find(a => a.startsWith(`${prefix}=`));
  if (eqArg) return eqArg.split('=')[1];
  const idx = args.indexOf(prefix);
  if (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--')) {
    return args[idx + 1];
  }
  return defaultValue;
}

const senderEmail = getArgValue('--from', 'ScanGo Invoice <support@scangoinvoice.com>');
const targetOverride = getArgValue('--to', null);
const nameOverride = getArgValue('--name', null);
const limitArg = getArgValue('--limit', null);
const sendLimit = limitArg ? parseInt(limitArg, 10) : null;

const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.GCP_PROJECT || 'swift-invoice-9124f';
const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.error("❌ RESEND_API_KEY not found in environment or functions/.env.swift-invoice-9124f");
  process.exit(1);
}

const resend = new ResendClass(resendApiKey);

// 5. Initialize Firebase / Firestore
const token = getGcloudAccessToken();
let db;

// Priority 1: Standalone Firestore with OAuth token from gcloud
if (FirestoreClass && token) {
  try {
    db = new FirestoreClass({
      projectId,
      authClient: {
        getRequestHeaders: async () => ({ Authorization: `Bearer ${token}` })
      }
    });
  } catch (e) {
    console.warn("⚠️ Standalone Firestore init with token failed, trying fallback:", e.message);
  }
}

// Priority 2: Firebase Admin (if running in GCP or with service account)
if (!db && admin) {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({ projectId });
    }
    db = admin.firestore();
  } catch (err) {
    // Admin init fallback
  }
}

// Priority 3: Standalone Firestore default credentials
if (!db && FirestoreClass) {
  try {
    db = new FirestoreClass({ projectId });
  } catch (e) {
    // Fallback
  }
}

if (!db) {
  console.error("❌ Failed to initialize Firestore. Please ensure you are logged into gcloud (`gcloud auth login`) or set GOOGLE_APPLICATION_CREDENTIALS.");
  process.exit(1);
}

// 6. Build Announcement Email HTML & Plain Text
function buildEmailContent({ name, userId }) {
  const displayName = name || 'Customer';
  const unsubscribeUrl = getUnsubscribeUrl(userId);
  const settingsUrl = 'https://scangoinvoice.com/settings';
  const dashboardUrl = 'https://scangoinvoice.com/dashboard';

  const subject = "New: Automated Weekly Invoice Reports are now live 📊";

  const plainText = `Hi ${displayName},

We're excited to introduce automated Weekly Invoice Reports on ScanGo Invoice!

Starting this week, you'll receive a clear financial recap in your inbox every Monday at 8:00 AM.

What's in your weekly report:
- 💰 Invoices Paid: Total cash collected in the past 7 days.
- ⏳ Invoices Due: Upcoming and overdue balances due this week.
- 💡 Cash Flow Tips: Practical insights to help you get paid up to 14 days faster.
- 🎉 All-Caught-Up Peace of Mind: When all balances are settled, you'll know your receivables are 100% current.

You're automatically enrolled so you never miss an invoice deadline. You are always in full control: you can customize your preferences or opt out at any time in your Settings (${settingsUrl}) or using the one-click unsubscribe link below.

View Your Dashboard: ${dashboardUrl}

Questions or feedback? Reply to this email anytime.
— The ScanGo Invoice Team

Opt-out / Unsubscribe: ${unsubscribeUrl}
`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New: Automated Weekly Invoice Reports</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b1320; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 32px auto; background-color: #111d2f; border-radius: 14px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 12px 30px rgba(0,0,0,0.4);">
    
    <!-- Top Brand Header -->
    <div style="padding: 28px 32px; border-bottom: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <h1 style="color: #60a5fa; font-size: 22px; font-weight: 700; margin: 0;">ScanGo Invoice</h1>
            <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0 0;">Product Announcement &amp; Updates</p>
          </td>
          <td align="right">
            <span style="background: rgba(96, 165, 250, 0.15); color: #60a5fa; border: 1px solid rgba(96, 165, 250, 0.3); padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">NEW FEATURE</span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Body Content -->
    <div style="padding: 36px 32px; color: #ffffff;">
      <h2 style="color: #f8fafc; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">
        Never Miss an Unpaid Invoice: Automated Weekly Reports 📊
      </h2>

      <p style="font-size: 15.5px; line-height: 1.6; color: #e2e8f0; margin-bottom: 16px;">
        Hi ${displayName},
      </p>

      <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1; margin-bottom: 24px;">
        Keeping tabs on client balances shouldn't require logging in every day. Starting this week, we're bringing <strong>Weekly Invoice Reports</strong> to all registered ScanGo Invoice members! Every Monday at 8:00 AM, you'll receive a fast, elegant snapshot of your financial pulse.
      </p>

      <!-- Feature Highlight Cards -->
      <div style="background-color: #1e293b; border-radius: 10px; padding: 22px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.05);">
        <h3 style="color: #60a5fa; font-size: 15px; margin: 0 0 14px 0; text-transform: uppercase; letter-spacing: 0.5px;">What's in your weekly pulse:</h3>
        
        <div style="margin-bottom: 12px;">
          <p style="color: #f8fafc; font-size: 14.5px; font-weight: 600; margin: 0 0 3px 0;">💰 Invoices Paid Last Week</p>
          <p style="color: #94a3b8; font-size: 13.5px; margin: 0; line-height: 1.5;">Exact dollar totals and client invoice numbers marked as paid over the prior 7 days.</p>
        </div>

        <div style="margin-bottom: 12px;">
          <p style="color: #f8fafc; font-size: 14.5px; font-weight: 600; margin: 0 0 3px 0;">⏳ Due in the Next 7 Days</p>
          <p style="color: #94a3b8; font-size: 13.5px; margin: 0; line-height: 1.5;">Upcoming and past-due invoice deadlines so you can follow up before cash gets delayed.</p>
        </div>

        <div style="margin-bottom: 12px;">
          <p style="color: #f8fafc; font-size: 14.5px; font-weight: 600; margin: 0 0 3px 0;">💡 Cash Flow &amp; Speed-to-Pay Tips</p>
          <p style="color: #94a3b8; font-size: 13.5px; margin: 0; line-height: 1.5;">Proven invoicing strategies to help you get paid up to 14 days faster.</p>
        </div>

        <div>
          <p style="color: #f8fafc; font-size: 14.5px; font-weight: 600; margin: 0 0 3px 0;">🎉 "All Caught Up" State</p>
          <p style="color: #94a3b8; font-size: 13.5px; margin: 0; line-height: 1.5;">Peace of mind when your receivables are 100% current and no balances are outstanding.</p>
        </div>
      </div>

      <!-- User Control Callout -->
      <div style="background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.25); border-radius: 8px; padding: 16px 20px; margin-bottom: 28px;">
        <p style="color: #4ade80; font-size: 13px; font-weight: 700; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px;">✓ You're in Full Control</p>
        <p style="color: #cbd5e1; font-size: 13.5px; line-height: 1.5; margin: 0;">
          Your account is enrolled automatically so you never miss upcoming revenue. If you ever prefer not to receive weekly reports, you can toggle them off in <a href="${settingsUrl}" style="color: #60a5fa; text-decoration: underline;">User Settings</a> or click the instant 1-click unsubscribe link at the bottom of any email.
        </p>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin: 32px 0 16px 0;">
        <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15.5px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
          Go to Your Dashboard &rarr;
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding: 24px 32px; background-color: #0d1726; border-top: 1px solid #1e293b; text-align: center;">
      <p style="font-size: 13px; color: #94a3b8; line-height: 1.6; margin: 0 0 12px 0;">
        Have questions or ideas? Simply reply directly to this email.<br>
        — The ScanGo Invoice Team
      </p>

      <p style="font-size: 12px; color: #64748b; line-height: 1.6; margin: 0;">
        You received this email because you are a registered user of ScanGo Invoice.<br>
        <a href="${unsubscribeUrl}" style="color: #94a3b8; text-decoration: underline;">Unsubscribe from weekly reports</a> &bull;
        <a href="${settingsUrl}" style="color: #94a3b8; text-decoration: underline;">Notification Settings</a>
      </p>
    </div>

  </div>
</body>
</html>
  `;

  return { subject, html, plainText, unsubscribeUrl };
}

// 7. Execution Logic
async function run() {
  console.log(`\n================================================================================`);
  console.log(`🚀 SCANGO INVOICE - WEEKLY REPORT ANNOUNCEMENT BROADCAST`);
  console.log(`================================================================================`);
  console.log(`⚙️  Project:       ${projectId}`);
  console.log(`⚙️  Sender:        ${senderEmail}`);
  console.log(`⚙️  Dry Run:       ${isDryRun ? 'YES (No emails will be sent)' : 'NO (LIVE SEND)'}`);
  console.log(`⚙️  Force Send:    ${isForce ? 'YES (Bypasses prior send log)' : 'NO'}`);
  if (targetOverride) console.log(`⚙️  Target Single: ${targetOverride}`);
  if (sendLimit) console.log(`⚙️  Limit:         ${sendLimit} recipients`);
  console.log(`--------------------------------------------------------------------------------\n`);

  let recipients = [];

  if (targetOverride) {
    recipients.push({
      id: 'test-user-id-001',
      email: targetOverride,
      name: nameOverride || 'Test User',
      subscriptionStatus: 'free',
      weeklyReportOptOut: false
    });
  } else {
    console.log(`🔍 Fetching registered users from Firestore ('users' collection)...`);
    const usersSnap = await db.collection('users').get();
    console.log(`📦 Found ${usersSnap.docs.length} total user records.`);

    for (const doc of usersSnap.docs) {
      const data = doc.data();
      const email = data.email || doc.id;
      if (!email || !email.includes('@')) continue;

      // Skip users who have explicitly opted out
      if (data.weeklyReportOptOut === true) {
        console.log(`⏩ Skipping ${email}: user opted out of weekly reports.`);
        continue;
      }

      // Skip if previously announced unless --force is set
      if (data.weeklyReportAnnouncementSentAt && !isForce) {
        console.log(`⏩ Skipping ${email}: already received announcement on ${data.weeklyReportAnnouncementSentAt.toDate ? data.weeklyReportAnnouncementSentAt.toDate().toISOString() : data.weeklyReportAnnouncementSentAt}.`);
        continue;
      }

      recipients.push({
        id: doc.id,
        email,
        name: data.name || (data.company && data.company.name) || '',
        subscriptionStatus: data.subscriptionStatus || 'free',
      });

      if (sendLimit && recipients.length >= sendLimit) break;
    }
  }

  console.log(`\n🎯 Filtered Eligible Recipients: ${recipients.length}\n`);

  if (recipients.length === 0) {
    console.log(`✅ No eligible recipients found to email.`);
    process.exit(0);
  }

  // Print summary of candidates
  console.log(`Sample candidates (up to 10):`);
  recipients.slice(0, 10).forEach((r, idx) => {
    console.log(`  ${idx + 1}. ${r.email} (${r.name || 'No name'}) [${r.subscriptionStatus}]`);
  });
  if (recipients.length > 10) console.log(`  ... and ${recipients.length - 10} more.`);
  console.log(``);

  if (isDryRun) {
    console.log(`[DRY RUN PREVIEW] Generating sample email for: ${recipients[0].email}...`);
    const preview = buildEmailContent({ name: recipients[0].name, userId: recipients[0].id });
    console.log(`\nSubject: ${preview.subject}`);
    console.log(`Unsubscribe URL: ${preview.unsubscribeUrl}`);
    console.log(`\n--- Plain Text Sample ---\n${preview.plainText}\n-------------------------\n`);
    console.log(`✅ Dry run complete. To send live, run again without --dry-run (or add --send).`);
    process.exit(0);
  }

  // Confirmation prompt if not --send flag
  if (!isDirectSend) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise(resolve => {
      rl.question(`⚠️  Ready to send ${recipients.length} live emails via Resend? Type 'SEND' to confirm: `, resolve);
    });
    rl.close();

    if (answer.trim() !== 'SEND') {
      console.log(`❌ Broadcast cancelled by user.`);
      process.exit(0);
    }
  }

  console.log(`\n🚀 Starting live email broadcast...`);
  let sentCount = 0;
  let failCount = 0;

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    const emailContent = buildEmailContent({ name: recipient.name, userId: recipient.id });

    try {
      await resend.emails.send({
        from: senderEmail,
        to: recipient.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.plainText,
        headers: {
          'List-Unsubscribe': `<${emailContent.unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      });

      sentCount++;
      console.log(`[${i + 1}/${recipients.length}] ✅ Sent to: ${recipient.email}`);

      // Record announcement timestamp on user record if not in test override mode
      if (!targetOverride && db) {
        try {
          await db.collection('users').doc(recipient.id).set({
            weeklyReportAnnouncementSentAt: new Date(),
          }, { merge: true });
        } catch (dbErr) {
          console.warn(`Could not update announcement timestamp for ${recipient.id}:`, dbErr.message);
        }
      }

      // Modest rate limiting delay (150ms between requests)
      await new Promise(r => setTimeout(r, 150));

    } catch (sendErr) {
      failCount++;
      console.error(`[${i + 1}/${recipients.length}] ❌ Failed to send to ${recipient.email}:`, sendErr.message);
    }
  }

  console.log(`\n================================================================================`);
  console.log(`🏁 BROADCAST SUMMARY`);
  console.log(`================================================================================`);
  console.log(`Total Candidates: ${recipients.length}`);
  console.log(`Successfully Sent: ${sentCount}`);
  console.log(`Failed:           ${failCount}`);
  console.log(`================================================================================\n`);
}

run().catch(err => {
  console.error("Fatal broadcast error:", err);
  process.exit(1);
});
