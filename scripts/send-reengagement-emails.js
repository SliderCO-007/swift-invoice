import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { execSync } from 'child_process';
import { Firestore } from '@google-cloud/firestore';
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
  console.log(`🔍 SCANGO INVOICE - RE-ENGAGEMENT EMAIL TARGET FINDER CLI`);
  console.log(`================================================================================`);
  console.log(`\nDescription:`);
  console.log(`  Finds newly registered users (2-7 days ago) with 0 invoices created and sends
  a re-engagement email inviting them to send a 60-second test invoice to themselves.`);
  console.log(`\nUsage:`);
  console.log(`  node scripts/send-reengagement-emails.js [OPTIONS]`);
  console.log(`\nOptions:`);
  console.log(`  --dry-run                Preview matched users without sending emails.`);
  console.log(`  --days-min=<n>           Minimum days since registration (default: 2).`);
  console.log(`  --days-max=<n>           Maximum days since registration (default: 7).`);
  console.log(`  --to=<email>             Target a single recipient directly.`);
  console.log(`  --from=<sender>          Sender address (default: Curtis <curtis@scangoinvoice.com>).`);
  console.log(`  --force                  Send email even if previously sent.`);
  console.log(`  -h, --help               Show this help message and exit.`);
  console.log(`\nExamples:`);
  console.log(`  node scripts/send-reengagement-emails.js --dry-run`);
  console.log(`  node scripts/send-reengagement-emails.js --to you@example.com`);
  console.log(`================================================================================`);
  process.exit(0);
}

const isDryRun = args.includes('--dry-run');
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

const daysMin = parseInt(getArgValue('--days-min', '2'), 10);
const daysMax = parseInt(getArgValue('--days-max', '7'), 10);
const senderEmail = getArgValue('--from', 'Curtis <curtis@scangoinvoice.com>');
const targetOverride = getArgValue('--to', null);

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

const subject = "Send yourself a test invoice in 60 seconds";

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
    if (!clean.includes('@')) {
      const firstToken = clean.split(/\s+/)[0].replace(/^[^a-zA-Z]+/, '');
      if (firstToken && !genericPlaceholders.includes(firstToken.toLowerCase())) {
        return firstToken.charAt(0).toUpperCase() + firstToken.slice(1).toLowerCase();
      }
    } else {
      email = clean;
    }
  }

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

When you signed up for ScanGo Invoice, you were probably looking for a faster, cleaner way to bill clients.

The best way to see how easy it is? Send a quick test invoice to yourself:

👉 Send a 60-second test invoice: https://scangoinvoice.com/invoice/new

Here's what you'll experience:
1. Tap to add an item (takes 20 seconds).
2. Preview the professional client view with Apple Pay, Google Pay, and credit card options. (Requires a Stripe Connected account)
3. Send it straight to your own email or phone via SMS Text-2-Pay.

No commitment and zero setup needed—your business info is already pre-filled.

Give it a spin and see what your clients will see.

If you ran into any issues or have feedback on how we can make ScanGo better for your business, just hit reply to this email—I read every message!

Best,

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
  console.log(`🔍 SCANGO INVOICE - RE-ENGAGEMENT EMAIL TARGET FINDER`);
  console.log(`================================================================================`);
  console.log(`📌 Project ID:         ${projectId}`);
  console.log(`⏱️  Registration Filter: ${daysMin} to ${daysMax} days ago`);
  console.log(`✉️  Sender Address:      ${senderEmail}`);
  console.log(`⚡ Mode:               ${isDryRun ? 'DRY-RUN (No emails will be sent)' : 'LIVE OUTREACH'}`);
  console.log(`================================================================================\n`);

  if (targetOverride) {
    console.log(`🎯 Sending directly to single recipient: ${targetOverride}`);
    let resolvedName = '';
    try {
      const snap = await db.collection('users').where('email', '==', targetOverride).limit(1).get();
      if (!snap.empty) {
        resolvedName = snap.docs[0].data().name || '';
      }
    } catch (e) { }

    const candidate = { id: 'manual', email: targetOverride, name: resolvedName, daysAgo: 'N/A' };
    await processCandidates([candidate]);
    return;
  }

  console.log(`Scanning users from Firestore...`);
  const usersSnap = await db.collection('users').get();
  console.log(`Total user records scanned: ${usersSnap.size}`);

  const now = Date.now();
  const minMillis = daysMin * 24 * 60 * 60 * 1000;
  const maxMillis = daysMax * 24 * 60 * 60 * 1000;

  const candidates = [];

  for (const docSnap of usersSnap.docs) {
    const data = docSnap.data();
    const uid = docSnap.id;

    if (data.role === 'member') continue; // Exclude team members
    if (!isForce && data.lastReengagementEmailSentAt) continue; // Already sent

    // Calculate age
    let createdTime = 0;
    if (data.createdAt && typeof data.createdAt.toDate === 'function') {
      createdTime = data.createdAt.toDate().getTime();
    } else if (data.createdAt && data.createdAt._seconds) {
      createdTime = data.createdAt._seconds * 1000;
    } else if (data.createdAt) {
      createdTime = new Date(data.createdAt).getTime();
    }

    if (!createdTime) continue;

    const ageMillis = now - createdTime;
    if (ageMillis < minMillis || ageMillis > maxMillis) continue;

    const invoiceCount = data.invoiceCount || 0;
    if (invoiceCount > 0) continue;

    const daysAgo = Math.floor(ageMillis / (24 * 60 * 60 * 1000));

    candidates.push({
      id: uid,
      email: data.email,
      name: data.name || 'New User',
      daysAgo
    });
  }

  await processCandidates(candidates);
}

async function processCandidates(candidates) {
  if (candidates.length === 0) {
    console.log(`\n✅ No eligible inactive users found matching criteria.`);
    return;
  }

  console.log(`\nFound ${candidates.length} eligible user(s) matching zero-invoice / zero-data criteria:\n`);
  candidates.forEach((user, idx) => {
    console.log(`  [${idx + 1}] ${user.name} <${user.email}>`);
    console.log(`      Registered: ${user.daysAgo} days ago | UID: ${user.id}`);
  });

  console.log(`\n--------------------------------------------------------------------------------`);
  console.log(`EMAIL PREVIEW FOR FIRST RECIPIENT (${candidates[0].email}):`);
  console.log(`Subject: ${subject}`);
  console.log(`--------------------------------------------------------------------------------`);
  console.log(getPlainTextBody(candidates[0].name, candidates[0].email));
  console.log(`--------------------------------------------------------------------------------`);

  if (isDryRun) {
    console.log(`\n--------------------------------------------------------------------------------`);
    console.log(`ℹ️ DRY-RUN complete. No emails were sent.`);
    console.log(`To run interactively and send emails, execute without --dry-run.`);
    return;
  }

  if (!isForce) {
    const excludeInput = await promptUser(`\nEnter numbers to EXCLUDE (comma-separated, e.g. "2, 4"), or press Enter to include ALL: `);
    const excludeIndices = excludeInput ? excludeInput.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n)) : [];

    const selectedCandidates = candidates.filter((_, idx) => !excludeIndices.includes(idx + 1));
    if (selectedCandidates.length === 0) {
      console.log(`\n🚫 All candidates were excluded. Exiting.`);
      return;
    }

    const confirm = await promptUser(`\nConfirm sending emails to ${selectedCandidates.length} user(s)? (y/N): `);
    if (confirm.toLowerCase() !== 'y') {
      console.log(`\nCancelled.`);
      return;
    }

    await dispatchEmails(selectedCandidates);
  } else {
    await dispatchEmails(candidates);
  }
}

async function dispatchEmails(targetList) {
  console.log(`\n🚀 Starting email dispatch to ${targetList.length} recipient(s)...\n`);
  let successCount = 0;

  for (const user of targetList) {
    try {
      const textBody = getPlainTextBody(user.name, user.email);
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

      console.log(`✅ Email sent to ${user.name} <${user.email}> (ID: ${data.id})`);
      successCount++;

      if (user.id !== 'manual') {
        await db.collection('users').doc(user.id).update({
          lastReengagementEmailSentAt: new Date()
        });
      }
    } catch (err) {
      console.error(`❌ Exception sending to ${user.email}:`, err.message);
    }
  }

  console.log(`\n🎉 Dispatch complete! Successfully sent ${successCount} / ${targetList.length} email(s).`);
}

main().catch(err => console.error(`❌ Fatal Error:`, err));
