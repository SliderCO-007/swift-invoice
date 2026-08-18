import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { execSync } from 'child_process';
import { Firestore } from '@google-cloud/firestore';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment variables loader
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

// Load Resend module dynamically
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

// Parse command-line flags
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`================================================================================`);
  console.log(`📢 SCANGO INVOICE - FREE TIER ANNOUNCEMENT CAMPAIGN CLI`);
  console.log(`================================================================================`);
  console.log(`\nDescription:`);
  console.log(`  Dispatches the free tier upgrade announcement (3 monthly invoices, free direct`);
  console.log(`  email & text-2-pay SMS, Stripe Connect integration) to Free plan users.`);
  console.log(`\nUsage:`);
  console.log(`  node scripts/send-campaign.js [OPTIONS]`);
  console.log(`\nOptions:`);
  console.log(`  --all-free-users         Target all active users on the free plan.`);
  console.log(`  --dry-run                Simulate target finding without sending emails.`);
  console.log(`  --to=<email>             Target a single recipient directly (test mode).`);
  console.log(`  --from=<sender>          Sender address (default: Curtis <curtis@scangoinvoice.com>).`);
  console.log(`  -h, --help               Show this help message and exit.`);
  console.log(`\nExamples:`);
  console.log(`  node scripts/send-campaign.js --to you@example.com --dry-run`);
  console.log(`  node scripts/send-campaign.js --all-free-users --dry-run`);
  console.log(`  node scripts/send-campaign.js --all-free-users`);
  console.log(`================================================================================`);
  process.exit(0);
}

const isDryRun = args.includes('--dry-run');
const isForce = args.includes('--force');
const targetAllFreeUsers = args.includes('--all-free-users');

function getArgValue(prefix, defaultValue) {
  const eqArg = args.find(a => a.startsWith(`${prefix}=`));
  if (eqArg) return eqArg.split('=')[1];
  const idx = args.indexOf(prefix);
  if (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--')) {
    return args[idx + 1];
  }
  return defaultValue;
}

const targetOverride = getArgValue('--to', null);
const senderEmail = getArgValue('--from', 'Curtis <curtis@scangoinvoice.com>');
const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.GCP_PROJECT || 'swift-invoice-9124f';
const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.error("❌ RESEND_API_KEY not found in environment or functions/.env.swift-invoice-9124f");
  process.exit(1);
}

const resend = new ResendClass(resendApiKey);

// Initialize Firestore
let db;
try {
  const token = getGcloudAccessToken();
  if (token) {
    db = new Firestore({
      projectId,
      authClient: {
        getRequestHeaders: async () => ({ Authorization: `Bearer ${token}` })
      }
    });
  } else {
    db = new Firestore({ projectId });
  }
} catch (e) {
  console.error("❌ Failed to initialize Firestore client:", e.message);
  process.exit(1);
}

const subject = "🎉 Major Update: Email & SMS Invoicing are now FREE on ScanGo!";

function getPlainTextBody(name) {
  const firstName = (name || 'there').split(' ')[0];
  return `Hi ${firstName},

We've got big news for your business: we just upgraded the ScanGo Invoice Free plan!

Here’s what’s newly unlocked on your Free account:

1. 3 INVOICES EVERY MONTH:
   Your free allowance now resets automatically on the 1st of every month (3 invoices/mo), so you can continuously bill clients as you grow.

2. DIRECT EMAIL INVOICING:
   Send professional invoices directly to your client’s inbox with 1 click.

3. TEXT-2-PAY SMS INVOICING:
   Send an instant Text-2-Pay SMS link straight to your client’s mobile phone for ultra-fast payment.

--------------------------------------------------------------------------------
💡 IMPORTANT SETUP TIP: CONNECT YOUR STRIPE PAYMENT ACCOUNT
--------------------------------------------------------------------------------
To allow your clients to click "Pay Invoice" and submit credit card, Apple Pay, Google Pay, or ACH Bank Transfer payments directly, make sure to connect your Stripe account in your Settings.

Connecting Stripe takes under 2 minutes and ensures payments deposit directly into your bank account.

👉 Connect Stripe & Send Invoices: https://scangoinvoice.com/settings

If you run into any questions or have feedback, just reply directly to this email—I read every message!

Best regards,

Curtis
ScanGo Invoice
curtis@scangoinvoice.com
https://scangoinvoice.com
`;
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

async function main() {
  console.log(`================================================================================`);
  console.log(`📢 SCANGO INVOICE - FREE TIER ANNOUNCEMENT CAMPAIGN CLI`);
  console.log(`================================================================================`);
  console.log(`📌 Project ID:    ${projectId}`);
  console.log(`✉️  Sender Address: ${senderEmail}`);
  console.log(`Subject:         ${subject}`);
  console.log(`⚡ Mode:          ${isDryRun ? 'DRY-RUN (No emails will be sent)' : 'LIVE CAMPAIGN DISPATCH'}`);
  console.log(`================================================================================\n`);

  let recipients = [];

  if (targetOverride) {
    recipients.push({ id: 'manual', email: targetOverride, name: 'Target User' });
  } else if (targetAllFreeUsers) {
    console.log(`Scanning Firestore for all Free Tier users...`);
    const usersSnap = await db.collection('users').get();
    for (const docSnap of usersSnap.docs) {
      const data = docSnap.data();
      const status = data.subscriptionStatus || 'free';
      if (status === 'free' && data.email) {
        recipients.push({
          id: docSnap.id,
          email: data.email,
          name: data.name || 'Valued User'
        });
      }
    }
  } else {
    console.log("Usage Instructions:");
    console.log("  1) Preview email in dry-run mode:");
    console.log("     node scripts/send-campaign.js --dry-run --to user@example.com\n");
    console.log("  2) Send campaign email to a single test user:");
    console.log("     node scripts/send-campaign.js --to user@example.com\n");
    console.log("  3) Preview sending to ALL free tier users:");
    console.log("     node scripts/send-campaign.js --all-free-users --dry-run\n");
    console.log("  4) Send campaign email to ALL free tier users:");
    console.log("     node scripts/send-campaign.js --all-free-users\n");
    
    console.log("--------------------------------------------------------------------------------");
    console.log("EMAIL BODY PREVIEW:");
    console.log("--------------------------------------------------------------------------------");
    console.log(getPlainTextBody("John"));
    process.exit(0);
  }

  console.log(`Found ${recipients.length} target recipient(s):\n`);
  recipients.forEach((user, idx) => {
    console.log(`  [${idx + 1}] ${user.name} <${user.email}>`);
  });

  if (isDryRun) {
    console.log(`\n--------------------------------------------------------------------------------`);
    console.log(`ℹ️ DRY-RUN complete. ${recipients.length} recipient(s) identified. Zero emails sent.`);
    console.log(`Remove --dry-run flag to dispatch live email campaign.`);
    return;
  }

  if (!isForce && recipients.length > 1) {
    const excludeInput = await promptUser(`\nEnter numbers to EXCLUDE (comma-separated, e.g. "2, 4"), or press Enter to include ALL: `);
    const excludeIndices = excludeInput ? excludeInput.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n)) : [];

    recipients = recipients.filter((_, idx) => !excludeIndices.includes(idx + 1));
    if (recipients.length === 0) {
      console.log(`\n🚫 All candidates were excluded. Exiting.`);
      return;
    }

    const confirm = await promptUser(`\nConfirm dispatching campaign email to ${recipients.length} recipient(s)? (y/N): `);
    if (confirm.toLowerCase() !== 'y') {
      console.log(`\nCancelled.`);
      return;
    }
  }

  console.log(`\n🚀 Starting email dispatch to ${recipients.length} recipient(s)...\n`);
  let successCount = 0;

  for (const user of recipients) {
    try {
      const textBody = getPlainTextBody(user.name);
      const { data, error } = await resend.emails.send({
        from: senderEmail,
        to: user.email,
        subject: subject,
        text: textBody,
        reply_to: 'curtis@scangoinvoice.com'
      });

      if (error) {
        console.error(`❌ Failed to send to ${user.email}:`, error);
        continue;
      }

      console.log(`✅ Campaign email sent to ${user.name} <${user.email}> (ID: ${data.id})`);
      successCount++;
    } catch (err) {
      console.error(`❌ Exception sending to ${user.email}:`, err.message);
    }
  }

  console.log(`\n🎉 Campaign dispatch complete! Successfully sent ${successCount} / ${recipients.length} email(s).`);
}

main().catch(err => console.error(`❌ Fatal Error:`, err));
