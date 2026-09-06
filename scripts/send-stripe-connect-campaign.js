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
    return null;
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
    console.error('❌ Could not import "resend" package. Make sure dependencies are installed.');
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
    // Admin optional if Firestore standalone works
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

// 4. Parse command-line flags
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`================================================================================`);
  console.log(`💳 SCANGO INVOICE - STRIPE CONNECT & PAYMENTS ONBOARDING EMAIL CLI`);
  console.log(`================================================================================`);
  console.log(`\nDescription:`);
  console.log(`  Finds registered users who have not yet connected or completed Stripe onboarding`);
  console.log(`  (chargesEnabled !== true) and sends an educational, benefit-driven email explaining`);
  console.log(`  low-fee ACH Bank Pay, instant cards, dynamic QR Scan-to-Pay, and the 3-min checklist.`);
  console.log(`\nUsage:`);
  console.log(`  node scripts/send-stripe-connect-campaign.js [OPTIONS]`);
  console.log(`\nOptions:`);
  console.log(`  --dry-run                  Simulate target finding and preview message without sending.`);
  console.log(`  --preview-list, --list     Preview formatted table of all eligible recipient candidates.`);
  console.log(`  --preview-message          Print full plain-text and HTML email previews to console.`);
  console.log(`  --send-single=<email>      Send to a single recipient (or alias: --to=<email>).`);
  console.log(`  --name=<name>              Override recipient first name for single-send test mode.`);
  console.log(`  --from=<sender>            Custom sender address (default: Curtis <curtis@scangoinvoice.com>).`);
  console.log(`  --status=<filter>          Filter by Stripe state: 'all' (default), 'not-started', 'in-progress'.`);
  console.log(`  --force                    Send email even if user already received it previously`);
  console.log(`                             (bypasses stripeConnectCampaignSentAt timestamp).`);
  console.log(`  --include-members          Include secondary team members (default: owners only).`);
  console.log(`  -h, --help                 Show this help message and exit.`);
  console.log(`\nExamples:`);
  console.log(`  1) Dry-run preview list and message sample:`);
  console.log(`     node scripts/send-stripe-connect-campaign.js --dry-run\n`);
  console.log(`  2) Preview full candidate list only:`);
  console.log(`     node scripts/send-stripe-connect-campaign.js --list\n`);
  console.log(`  3) Send single test email to your inbox:`);
  console.log(`     node scripts/send-stripe-connect-campaign.js --send-single=you@example.com --name=Curtis\n`);
  console.log(`  4) Dry-run single test to verify rendering:`);
  console.log(`     node scripts/send-stripe-connect-campaign.js --send-single=you@example.com --dry-run\n`);
  console.log(`  5) Run interactive batch dispatch to all eligible candidates:`);
  console.log(`     node scripts/send-stripe-connect-campaign.js\n`);
  console.log(`================================================================================`);
  process.exit(0);
}

const isDryRun = args.includes('--dry-run');
const isListOnly = args.includes('--list') || args.includes('--preview-list');
const isPreviewMessageOnly = args.includes('--preview-message') || args.includes('--preview');
const isForce = args.includes('--force');
const includeMembers = args.includes('--include-members');

function getArgValue(prefixes, defaultValue) {
  const prefixList = Array.isArray(prefixes) ? prefixes : [prefixes];
  for (const prefix of prefixList) {
    const eqArg = args.find(a => a.startsWith(`${prefix}=`));
    if (eqArg) return eqArg.split('=')[1];
    const idx = args.indexOf(prefix);
    if (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--')) {
      return args[idx + 1];
    }
  }
  return defaultValue;
}

const senderEmail = getArgValue('--from', 'Curtis <curtis@scangoinvoice.com>');
const targetOverride = getArgValue(['--send-single', '--to', '-t'], null);
const nameOverride = getArgValue(['--name', '-n'], null);
const statusFilter = getArgValue(['--status', '-s'], 'all').toLowerCase(); // all | not-started | in-progress

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

if (admin) {
  try {
    if (!admin.apps.length) {
      if (token) {
        admin.initializeApp({
          projectId,
          credential: {
            getAccessToken: async () => ({
              access_token: token,
              expires_in: 3600
            })
          }
        });
      } else {
        admin.initializeApp({ projectId });
      }
    }
    db = admin.firestore();
  } catch (e) {
    // Fallback to standalone Firestore if admin init fails
  }
}

if (!db && FirestoreClass) {
  try {
    if (token) {
      db = new FirestoreClass({
        projectId,
        authClient: {
          getRequestHeaders: async () => ({ Authorization: `Bearer ${token}` })
        }
      });
    } else {
      db = new FirestoreClass({ projectId });
    }
  } catch (e) {
    console.error("❌ Failed to initialize Firestore client:", e.message);
    process.exit(1);
  }
}

if (!db) {
  console.error("❌ Could not initialize Firestore database client.");
  process.exit(1);
}

const subject = "Keep more of your hard-earned money (and get paid 2x faster) 💳";

/**
 * Robust First Name Resolver
 */
function resolveFirstName(name, email) {
  const genericPlaceholders = [
    'valued user',
    'valued',
    'new user',
    'target user',
    'recipient',
    'user',
    'customer',
    'member',
    'owner',
    'admin',
    'test',
    'there'
  ];

  if (name && typeof name === 'string') {
    let clean = name.trim();

    // If name is an email address, treat as email fallback
    if (!clean.includes('@')) {
      const firstToken = clean.split(/\s+/)[0].replace(/^[^a-zA-Z]+/, '');
      if (firstToken && !genericPlaceholders.includes(firstToken.toLowerCase())) {
        return firstToken.charAt(0).toUpperCase() + firstToken.slice(1).toLowerCase();
      }
    } else {
      email = clean;
    }
  }

  // Fallback: Extract clean capitalized name from email prefix
  if (email && typeof email === 'string' && email.includes('@')) {
    const localPart = email.split('@')[0];
    const firstSegment = localPart.split(/[._+-]/)[0].replace(/^[^a-zA-Z]+/, '');
    if (
      firstSegment &&
      firstSegment.length >= 2 &&
      !genericPlaceholders.includes(firstSegment.toLowerCase()) &&
      !/^\d+$/.test(firstSegment)
    ) {
      return firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1).toLowerCase();
    }
  }

  return 'there';
}

function getPlainTextBody(name, email) {
  const firstName = resolveFirstName(name, email);
  return `Hi ${firstName},

If you're still waiting on paper checks in the mail or paying high card processing fees on large invoices, there's a much better way to collect your payments.

With Stripe Connect integrated right into ScanGo Invoice, your clients can pay you instantly online via Credit/Debit Card, Apple Pay, Google Pay, or direct low-fee ACH Bank Transfer.

==================================================
WHY CONNECT STRIPE TO SCANGO INVOICE?
==================================================
💰 Drastically Lower Fees on Big Invoices (ACH Bank Pay):
   For large invoices ($1,000+), clients can pay directly from their bank account with a fraction of typical card processing fees.

⚡ Get Paid 2x-3x Faster:
   Clients open your invoice link on their smartphone and pay on the spot in seconds.

📱 Scan-to-Pay QR Codes:
   Every invoice template automatically includes a dynamic QR code. Print or show it in person, and clients can scan and pay before you leave the job.

🔄 Zero Manual Bookkeeping:
   When an invoice is paid, ScanGo automatically flips the status to "PAID", sends a payment receipt SMS, and updates your revenue reports with zero extra work.

🏦 Direct Bank Deposits:
   Earnings deposit straight into your checking account on a regular schedule (or within 30 minutes with Instant Payouts).

🔒 Bank-Grade Security:
   Stripe handles all banking compliance (PCI Level 1). You never have to handle or store sensitive payment numbers.

==================================================
WHAT TO HAVE READY (3-MINUTE CHECKLIST)
==================================================
When you click connect, Stripe guides you through a quick, secure setup:

1. Business / Freelancer Info:
   - Business legal name (or your personal name).
   - Business or home address.
   - EIN or SSN.
   - Website OR Brief Description (Don't have a website? No problem! Stripe allows entering a simple 1-2 sentence description of what you do, like "Residential plumbing repair" or "Freelance consulting").

2. Personal Details:
   - Date of birth and home address.
   - Mobile phone number (for secure SMS verification).
   - (Occasionally requested) Photo of Driver's License or ID.

3. Bank Details:
   - Routing Number and Checking Account Number where you want payouts deposited (or an eligible debit card).

==================================================
HOW TO CONNECT IN 3 SIMPLE STEPS:
==================================================
1. Log in to your ScanGo Invoice Account:
   https://scangoinvoice.com/login

2. Head to Settings and click "Connect with Stripe":
   https://scangoinvoice.com/settings#stripe-connect

3. Complete the quick Stripe form and click Submit.

That's it! Your company details will sync automatically, and your invoices will immediately feature online checkout and Scan-to-Pay QR codes.

👉 Connect Your Stripe Account Now:
https://scangoinvoice.com/settings#stripe-connect

Have any questions or need a hand getting set up? Simply reply directly to this email and our team will be glad to assist.

Best regards,

Curtis 🤝
ScanGo Invoice Team
curtis@scangoinvoice.com
https://scangoinvoice.com
`;
}

function getHtmlBody(name, email) {
  const firstName = resolveFirstName(name, email);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Keep More of Your Money & Get Paid Faster</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: #0f172a; padding: 28px 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { color: #38bdf8; margin: 6px 0 0; font-size: 14px; font-weight: 500; }
    .content { padding: 32px 24px; }
    .greeting { font-size: 17px; font-weight: 600; color: #0f172a; margin-bottom: 16px; }
    .highlight-card { background: #f0f9ff; border-left: 4px solid #0284c7; padding: 16px; border-radius: 6px; margin: 20px 0; }
    .benefit-item { display: flex; margin-bottom: 14px; align-items: flex-start; }
    .benefit-icon { font-size: 20px; margin-right: 12px; line-height: 1.4; }
    .benefit-text { font-size: 14px; color: #334155; }
    .benefit-title { font-weight: 700; color: #0f172a; display: block; margin-bottom: 2px; }
    .checklist-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0; }
    .checklist-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
    .checklist-list { margin: 0; padding-left: 20px; font-size: 14px; color: #475569; }
    .checklist-list li { margin-bottom: 8px; }
    .tip-box { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 12px; font-size: 13px; color: #065f46; margin-top: 12px; }
    .cta-container { text-align: center; margin: 32px 0 24px; }
    .cta-btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25); }
    .footer { background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .footer a { color: #2563eb; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>⚡ ScanGo Invoice</h1>
      <p>Online Payments & Low-Fee ACH Direct Debit</p>
    </div>
    <div class="content">
      <div class="greeting">Hi ${firstName},</div>
      <p style="font-size: 15px; color: #334155; margin-top: 0;">
        If you're still waiting on paper checks in the mail or paying high card processing fees on large jobs, there's a much better way to get paid.
      </p>
      <p style="font-size: 15px; color: #334155;">
        With <strong>Stripe Connect</strong> integrated right into ScanGo Invoice, your clients can pay you securely online via <strong>Credit/Debit Card, Apple Pay, Google Pay, or direct ACH Bank Transfer</strong>.
      </p>

      <div class="highlight-card">
        <strong style="color: #0369a1; font-size: 15px;">Why Connect Your Stripe Account?</strong>
        <div style="margin-top: 12px;">
          <div class="benefit-item">
            <span class="benefit-icon">💰</span>
            <div class="benefit-text">
              <span class="benefit-title">Drastically Lower Fees on Big Invoices (ACH Bank Pay)</span>
              For large jobs ($1,000+), clients can pay straight from their checking account with a fraction of card processing fees.
            </div>
          </div>
          <div class="benefit-item">
            <span class="benefit-icon">⚡</span>
            <div class="benefit-text">
              <span class="benefit-title">Get Paid 2x–3x Faster</span>
              Clients open the invoice link on their phone and complete payment in seconds.
            </div>
          </div>
          <div class="benefit-item">
            <span class="benefit-icon">📱</span>
            <div class="benefit-text">
              <span class="benefit-title">Dynamic Scan-to-Pay QR Codes</span>
              Every invoice automatically includes a QR code your clients can scan on the jobsite.
            </div>
          </div>
          <div class="benefit-item">
            <span class="benefit-icon">🔄</span>
            <div class="benefit-text">
              <span class="benefit-title">Zero Manual Bookkeeping</span>
              Invoices automatically mark as <strong>"PAID"</strong>, receipts are sent via SMS, and sales reports update instantly.
            </div>
          </div>
        </div>
      </div>

      <div class="checklist-box">
        <div class="checklist-title">📋 3-Minute Preparation Checklist</div>
        <ul class="checklist-list">
          <li><strong>Business / Freelancer Info:</strong> Legal name, address, and EIN or SSN.</li>
          <li><strong>Website OR Brief Description:</strong> <em>Don't have a website? No problem! Stripe accepts a 1–2 sentence description of what you do (e.g. "Residential plumbing repair" or "Freelance consulting").</em></li>
          <li><strong>Personal Info:</strong> Date of birth, home address, and mobile phone number for 2FA.</li>
          <li><strong>Bank Payout Info:</strong> Routing & Checking account numbers where your money will deposit.</li>
        </ul>
        <div class="tip-box">
          💡 <strong>Tip:</strong> The entire connection takes under 3 minutes when you have your account numbers ready!
        </div>
      </div>

      <div class="cta-container">
        <a href="https://scangoinvoice.com/settings#stripe-connect" class="cta-btn">Connect Stripe & Start Accepting Payments →</a>
      </div>

      <p style="font-size: 13px; color: #64748b; text-align: center; margin-bottom: 0;">
        Have questions or need assistance? Reply directly to this email and our team will help you right away.
      </p>
    </div>
    <div class="footer">
      <p style="margin: 0 0 6px;"><strong>ScanGo Invoice</strong> • Fast, Professional Mobile Invoicing</p>
      <p style="margin: 0;"><a href="https://scangoinvoice.com/dashboard">Dashboard</a> | <a href="https://scangoinvoice.com/settings">Settings</a> | <a href="https://scangoinvoice.com/privacy">Privacy Policy</a></p>
    </div>
  </div>
</body>
</html>`;
}

function promptUser(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans.trim());
  }));
}

async function processCandidates(candidates) {
  if (!candidates.length) {
    console.log(`ℹ️ No eligible recipient candidates found matching the criteria.`);
    return;
  }

  console.log(`\n📋 Target Recipients Summary (${candidates.length} candidate${candidates.length === 1 ? '' : 's'}):`);
  console.log(`---------------------------------------------------------------------------------------------------------`);
  console.log(` #  | ${'Name'.padEnd(20)} | ${'Email'.padEnd(30)} | ${'Stripe Status'.padEnd(22)} | Registered`);
  console.log(`---------------------------------------------------------------------------------------------------------`);
  
  candidates.forEach((c, idx) => {
    const num = String(idx + 1).padStart(2, ' ');
    const nameStr = (c.name || 'N/A').slice(0, 20).padEnd(20);
    const emailStr = c.email.slice(0, 30).padEnd(30);
    const statusStr = c.stripeStatus.slice(0, 22).padEnd(22);
    const regDate = c.registeredAt || 'N/A';
    console.log(` ${num} | ${nameStr} | ${emailStr} | ${statusStr} | ${regDate}`);
  });
  console.log(`---------------------------------------------------------------------------------------------------------\n`);

  if (isListOnly) {
    console.log(`✅ List preview complete. Exiting (--list flag).`);
    return;
  }

  // Print Sample Message Preview
  const sample = candidates[0];
  console.log(`================================================================================`);
  console.log(`📧 MESSAGE PREVIEW (Rendered for: ${sample.email} / Name: ${sample.name || 'N/A'})`);
  console.log(`================================================================================`);
  console.log(`From:    ${senderEmail}`);
  console.log(`To:      ${sample.email}`);
  console.log(`Subject: ${subject}`);
  console.log(`--------------------------------------------------------------------------------`);
  console.log(getPlainTextBody(sample.name, sample.email));
  console.log(`================================================================================\n`);

  if (isPreviewMessageOnly) {
    console.log(`✅ Message preview complete. Exiting (--preview-message flag).`);
    return;
  }

  if (isDryRun) {
    console.log(`⚡ DRY-RUN ACTIVE: No emails were sent.`);
    console.log(`   To send live emails, re-run without --dry-run.`);
    return;
  }

  // Live Sending Confirmation
  const confirm = await promptUser(`⚠️ Ready to send ${candidates.length} live email(s) via Resend? Type "YES" to proceed: `);
  if (confirm !== 'YES') {
    console.log(`🛑 Dispatch aborted by user.`);
    return;
  }

  console.log(`\n🚀 Starting live email dispatch...`);
  let sentCount = 0;
  let failCount = 0;

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    const progress = `[${i + 1}/${candidates.length}]`;

    try {
      const response = await resend.emails.send({
        from: senderEmail,
        to: c.email,
        subject: subject,
        text: getPlainTextBody(c.name, c.email),
        html: getHtmlBody(c.name, c.email)
      });

      if (response && response.error) {
        throw new Error(response.error.message);
      }

      console.log(`✅ ${progress} Sent to ${c.email} (Resend ID: ${response?.data?.id || 'OK'})`);
      sentCount++;

      // Update Firestore tracking timestamp if user doc exists
      if (c.id && c.id !== 'manual') {
        try {
          await db.collection('users').doc(c.id).update({
            stripeConnectCampaignSentAt: admin ? admin.firestore.FieldValue.serverTimestamp() : new Date(),
            stripeConnectCampaignStatus: 'sent'
          });
        } catch (e) {
          // Non-critical tracking update error
        }
      }

      // Small delay between requests to be gentle on API limits
      if (i < candidates.length - 1) {
        await new Promise(r => setTimeout(r, 400));
      }
    } catch (sendErr) {
      console.error(`❌ ${progress} Failed to send to ${c.email}: ${sendErr.message}`);
      failCount++;
    }
  }

  console.log(`\n================================================================================`);
  console.log(`🎉 CAMPAIGN DISPATCH FINISHED`);
  console.log(`   Total Candidates: ${candidates.length}`);
  console.log(`   Successfully Sent: ${sentCount}`);
  console.log(`   Failed:            ${failCount}`);
  console.log(`================================================================================\n`);
}

async function main() {
  console.log(`================================================================================`);
  console.log(`💳 SCANGO INVOICE - STRIPE CONNECT CAMPAIGN DISPATCHER`);
  console.log(`================================================================================`);
  console.log(`📌 Project ID:     ${projectId}`);
  console.log(`🎯 Status Filter: ${statusFilter.toUpperCase()}`);
  console.log(`✉️  Sender:        ${senderEmail}`);
  console.log(`📧 Subject:       ${subject}`);
  console.log(`⚡ Mode:           ${isDryRun ? 'DRY-RUN (Preview mode)' : 'LIVE OUTREACH'}`);
  console.log(`================================================================================\n`);

  if (targetOverride) {
    console.log(`🎯 Single recipient override: ${targetOverride}`);

    let resolvedName = nameOverride;
    let resolvedUid = 'manual';
    let resolvedStatus = 'Manual Target';
    let resolvedRegDate = 'Manual';

    try {
      const snap = await db.collection('users').where('email', '==', targetOverride).limit(1).get();
      if (!snap.empty) {
        const uDoc = snap.docs[0];
        const uData = uDoc.data();
        resolvedUid = uDoc.id;
        if (!resolvedName) resolvedName = uData.name;
        resolvedStatus = uData.chargesEnabled ? 'Connected (charges enabled)' : (uData.stripeConnectAccountId ? 'Pending Onboarding' : 'Not Connected');
        if (uData.createdAt) {
          resolvedRegDate = uData.createdAt.toDate ? uData.createdAt.toDate().toISOString().split('T')[0] : 'N/A';
        }
      }
    } catch (e) {
      // Ignore lookup error
    }

    const candidate = {
      id: resolvedUid,
      email: targetOverride,
      name: resolvedName || '',
      stripeStatus: resolvedStatus,
      registeredAt: resolvedRegDate
    };

    await processCandidates([candidate]);
    return;
  }

  // Query Firestore Users
  console.log(`🔍 Scanning Firestore users collection...`);
  const usersSnap = await db.collection('users').get();
  console.log(`Total user records in database: ${usersSnap.size}`);

  const candidates = [];

  for (const docSnap of usersSnap.docs) {
    const data = docSnap.data();
    const uid = docSnap.id;

    if (!includeMembers && data.role === 'member') continue;
    if (!data.email) continue;
    if (!isForce && data.stripeConnectCampaignSentAt) continue;

    const chargesEnabled = !!data.chargesEnabled;
    const hasConnectId = !!data.stripeConnectAccountId;

    // Filter out users who already have active charges enabled
    if (chargesEnabled && !isForce) continue;

    let stripeStatusText = 'Not Connected';
    let stateCategory = 'not-started';

    if (chargesEnabled) {
      stripeStatusText = 'Active & Charges Enabled';
      stateCategory = 'completed';
    } else if (hasConnectId) {
      stripeStatusText = 'Incomplete / Pending Verification';
      stateCategory = 'in-progress';
    } else {
      stripeStatusText = 'Not Started';
      stateCategory = 'not-started';
    }

    // Apply status flag filter
    if (statusFilter === 'not-started' && stateCategory !== 'not-started') continue;
    if (statusFilter === 'in-progress' && stateCategory !== 'in-progress') continue;

    let regDate = 'N/A';
    if (data.createdAt) {
      if (typeof data.createdAt.toDate === 'function') {
        regDate = data.createdAt.toDate().toISOString().split('T')[0];
      } else if (data.createdAt._seconds) {
        regDate = new Date(data.createdAt._seconds * 1000).toISOString().split('T')[0];
      } else {
        regDate = String(data.createdAt).split('T')[0];
      }
    }

    candidates.push({
      id: uid,
      email: data.email,
      name: data.name || '',
      stripeStatus: stripeStatusText,
      registeredAt: regDate
    });
  }

  await processCandidates(candidates);
}

main().catch(err => {
  console.error("❌ Fatal execution error:", err);
  process.exit(1);
});
