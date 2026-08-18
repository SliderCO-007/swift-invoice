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
  console.log(`📱 SCANGO INVOICE - MOBILE-FIRST RE-ENGAGEMENT EMAIL CLI`);
  console.log(`================================================================================`);
  console.log(`\nDescription:`);
  console.log(`  Identifies registered users who haven't logged in for 14+ days and sends an`);
  console.log(`  engaging, plain-text email with emoticons announcing the new Mobile First design,`);
  console.log(`  Bottom Navigation Bar, Quick-Action [+] button, Jobsite Receipts & 1-Click Payments.`);
  console.log(`\nUsage:`);
  console.log(`  node scripts/send-mobile-announcement.js [OPTIONS]`);
  console.log(`\nOptions:`);
  console.log(`  --dry-run                Simulate target finding and preview the email without`);
  console.log(`                           sending any messages.`);
  console.log(`  --days-min=<n>           Minimum days since last login (default: 14).`);
  console.log(`  --days-max=<n>           Maximum days since last login (optional upper bound).`);
  console.log(`  --to=<email>             Target a single email address directly (test mode).`);
  console.log(`  --name=<name>            Override recipient first name for --to test mode.`);
  console.log(`  --from=<sender>          Custom sender address (default: Curtis <curtis@scangoinvoice.com>).`);
  console.log(`  --force                  Send email even if user already received it previously`);
  console.log(`                           (bypasses lastMobileAnnouncementSentAt timestamp).`);
  console.log(`  --include-members        Include secondary team members (default: owners only).`);
  console.log(`  -h, --help               Show this help message and exit.`);
  console.log(`\nExamples:`);
  console.log(`  1) Preview matched inactive users and copy (Dry-Run):`);
  console.log(`     node scripts/send-mobile-announcement.js --dry-run\n`);
  console.log(`  2) Preview test email to your address:`);
  console.log(`     node scripts/send-mobile-announcement.js --to you@example.com --dry-run\n`);
  console.log(`  3) Send live test email to your address:`);
  console.log(`     node scripts/send-mobile-announcement.js --to you@example.com\n`);
  console.log(`  4) Run interactive campaign (shows candidate list & prompts to exclude/confirm):`);
  console.log(`     node scripts/send-mobile-announcement.js\n`);
  console.log(`  5) Filter users inactive for 30+ days in dry-run mode:`);
  console.log(`     node scripts/send-mobile-announcement.js --days-min=30 --dry-run\n`);
  console.log(`  6) Force re-send to all eligible users regardless of previous send history:`);
  console.log(`     node scripts/send-mobile-announcement.js --force\n`);
  console.log(`================================================================================`);
  process.exit(0);
}

const isDryRun = args.includes('--dry-run');
const isForce = args.includes('--force');
const includeMembers = args.includes('--include-members');

function getArgValue(prefix, defaultValue) {
  const eqArg = args.find(a => a.startsWith(`${prefix}=`));
  if (eqArg) return eqArg.split('=')[1];
  const idx = args.indexOf(prefix);
  if (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--')) {
    return args[idx + 1];
  }
  return defaultValue;
}

const daysMin = parseInt(getArgValue('--days-min', '14'), 10);
const daysMaxArg = getArgValue('--days-max', null);
const daysMax = daysMaxArg ? parseInt(daysMaxArg, 10) : null;
const senderEmail = getArgValue('--from', 'Curtis <curtis@scangoinvoice.com>');
const targetOverride = getArgValue('--to', null);
const nameOverride = getArgValue('--name', null);

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

const subject = "📱 Big Update: ScanGo is now Mobile First! 🚀";

/**
 * Robust First Name Resolver
 * Handles full names, single names, all-caps strings, email addresses, and generic placeholders.
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
      // Remove any non-alphabetic leading characters if present
      const firstToken = clean.split(/\s+/)[0].replace(/^[^a-zA-Z]+/, '');
      if (firstToken && !genericPlaceholders.includes(firstToken.toLowerCase())) {
        return firstToken.charAt(0).toUpperCase() + firstToken.slice(1).toLowerCase();
      }
    } else {
      email = clean;
    }
  }

  // Fallback: Extract clean capitalized name from email prefix (e.g. john.doe@domain.com -> John)
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
  return `Hi ${firstName} 👋,

Big news! We just rolled out a major upgrade to ScanGo Invoice that we think you're going to love 🎉.

ScanGo is now completely redesigned from the ground up to be MOBILE FIRST 📱⚡!

Whether you're on a jobsite, meeting with a client, or on the go, you can now manage your entire billing workflow straight from your phone's browser—no app store download required.

Here's what's new on mobile 🚀:

📱 BRAND NEW MOBILE BOTTOM NAVIGATION
Tap to access your Dashboard, Projects, and Clients with one thumb. Everything is faster, cleaner, and built for touchscreens.

⚡ 1-TAP QUICK ACTION BUTTON (+)
Instantly create an invoice, log a new project, or add a customer in seconds right from the bottom bar.

🧾 JOBSITE RECEIPT & EXPENSE TRACKING
Snap a photo of your receipt on the job, log material expenses or billable hours on the fly, and convert them to an invoice with one tap.

💳 1-CLICK INSTANT CLIENT PAYMENTS
Clients can pay you on the spot via Apple Pay, Google Pay, credit card, ACH transfer, or scan your custom Stripe QR code. Plus, direct Email & Text-2-Pay SMS invoicing is completely free!

👉 Try out the new mobile experience:
https://scangoinvoice.com/dashboard

Just open that link on your smartphone, log in, and you're ready to roll 🎯. (Pro-tip: Tap "Add to Home Screen" in Safari or Chrome for a full native app feel 📲!)

Have questions, suggestions, or feedback on the mobile design? Just hit reply to this email—I read every message!

Best regards,

Curtis 🤝
Founder, ScanGo Invoice
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
  console.log(`📱 SCANGO INVOICE - MOBILE-FIRST RE-ENGAGEMENT EMAIL DISPATCHER`);
  console.log(`================================================================================`);
  console.log(`📌 Project ID:          ${projectId}`);
  console.log(`⏱️  Inactivity Filter:   >= ${daysMin} days since last login${daysMax ? ` (up to ${daysMax} days)` : ''}`);
  console.log(`✉️  Sender Address:       ${senderEmail}`);
  console.log(`📧 Subject:              ${subject}`);
  console.log(`⚡ Mode:                ${isDryRun ? 'DRY-RUN (Preview mode - No emails will be sent)' : 'LIVE OUTREACH'}`);
  console.log(`================================================================================\n`);

  if (targetOverride) {
    console.log(`🎯 Target override specified: ${targetOverride}`);
    
    let resolvedName = nameOverride;
    let resolvedUid = 'manual';
    let resolvedDays = 'N/A';
    let resolvedLoginDate = 'Manual Override';
    let resolvedInvoices = 0;
    let resolvedPlan = 'free';

    // 1. Try to find user profile in Firestore
    try {
      const snap = await db.collection('users').where('email', '==', targetOverride).limit(1).get();
      if (!snap.empty) {
        const uDoc = snap.docs[0];
        const uData = uDoc.data();
        resolvedUid = uDoc.id;
        if (!resolvedName) resolvedName = uData.name;
        resolvedInvoices = uData.invoiceCount || 0;
        resolvedPlan = uData.subscriptionStatus || 'free';
      }
    } catch (e) {
      // Ignore Firestore lookup error
    }

    // 2. Try to lookup in Firebase Auth if name still not found
    if (!resolvedName && admin && admin.auth) {
      try {
        const authUser = await admin.auth().getUserByEmail(targetOverride);
        if (authUser) {
          resolvedUid = authUser.uid;
          if (authUser.displayName) resolvedName = authUser.displayName;
        }
      } catch (e) {
        // Ignore Auth lookup error
      }
    }

    const candidate = {
      id: resolvedUid,
      email: targetOverride,
      name: resolvedName || '',
      daysInactive: resolvedDays,
      lastLoginDate: resolvedLoginDate,
      invoiceCount: resolvedInvoices,
      subscriptionStatus: resolvedPlan
    };
    await processCandidates([candidate]);
    return;
  }

  // 1. Collect Firebase Auth records for accurate lastSignInTime
  const authUsersMap = new Map();
  if (admin && admin.auth) {
    try {
      console.log(`Querying Firebase Authentication records...`);
      let nextPageToken;
      do {
        const listResult = await admin.auth().listUsers(1000, nextPageToken);
        listResult.users.forEach(u => {
          authUsersMap.set(u.uid, u);
        });
        nextPageToken = listResult.pageToken;
      } while (nextPageToken);
      console.log(`Retrieved ${authUsersMap.size} user records from Firebase Auth.`);
    } catch (authErr) {
      console.warn(`⚠️ Could not query Firebase Auth directly (${authErr.message}). Falling back to Firestore timestamps.`);
    }
  }

  // 2. Scan Firestore user records
  console.log(`Scanning users from Firestore...`);
  const usersSnap = await db.collection('users').get();
  console.log(`Total user records scanned in Firestore: ${usersSnap.size}`);

  const now = Date.now();
  const minMillis = daysMin * 24 * 60 * 60 * 1000;
  const maxMillis = daysMax ? daysMax * 24 * 60 * 60 * 1000 : null;

  const candidates = [];

  for (const docSnap of usersSnap.docs) {
    const data = docSnap.data();
    const uid = docSnap.id;

    if (!includeMembers && data.role === 'member') continue; // Skip team members by default
    if (!isForce && data.lastMobileAnnouncementSentAt) continue; // Already sent
    if (!data.email) continue; // Skip accounts without email

    // Determine the most accurate last login timestamp
    let lastLoginTime = 0;
    let lastLoginSource = '';

    const authUser = authUsersMap.get(uid);
    if (authUser && authUser.metadata && authUser.metadata.lastSignInTime) {
      lastLoginTime = new Date(authUser.metadata.lastSignInTime).getTime();
      lastLoginSource = 'Firebase Auth lastSignInTime';
    } else if (data.lastLoginAt) {
      if (typeof data.lastLoginAt.toDate === 'function') {
        lastLoginTime = data.lastLoginAt.toDate().getTime();
      } else if (data.lastLoginAt._seconds) {
        lastLoginTime = data.lastLoginAt._seconds * 1000;
      } else {
        lastLoginTime = new Date(data.lastLoginAt).getTime();
      }
      lastLoginSource = 'Firestore lastLoginAt';
    } else if (authUser && authUser.metadata && authUser.metadata.creationTime) {
      lastLoginTime = new Date(authUser.metadata.creationTime).getTime();
      lastLoginSource = 'Firebase Auth creationTime';
    } else if (data.createdAt) {
      if (typeof data.createdAt.toDate === 'function') {
        lastLoginTime = data.createdAt.toDate().getTime();
      } else if (data.createdAt._seconds) {
        lastLoginTime = data.createdAt._seconds * 1000;
      } else {
        lastLoginTime = new Date(data.createdAt).getTime();
      }
      lastLoginSource = 'Firestore createdAt';
    }

    if (!lastLoginTime || isNaN(lastLoginTime)) continue;

    const ageMillis = now - lastLoginTime;
    if (ageMillis < minMillis) continue;
    if (maxMillis && ageMillis > maxMillis) continue;

    const daysInactive = Math.floor(ageMillis / (24 * 60 * 60 * 1000));
    const formattedDate = new Date(lastLoginTime).toISOString().split('T')[0];

    candidates.push({
      id: uid,
      email: data.email,
      name: data.name || (authUser ? authUser.displayName : null) || '',
      daysInactive,
      lastLoginDate: formattedDate,
      lastLoginSource,
      invoiceCount: data.invoiceCount || 0,
      subscriptionStatus: data.subscriptionStatus || 'free'
    });
  }

  // Sort candidates by most inactive first
  candidates.sort((a, b) => b.daysInactive - a.daysInactive);

  await processCandidates(candidates);
}

async function processCandidates(candidates) {
  if (candidates.length === 0) {
    console.log(`\n✅ No eligible inactive users found matching criteria (>= ${daysMin} days inactive).`);
    return;
  }

  console.log(`\nFound ${candidates.length} eligible user(s) who haven't logged in for >= ${daysMin} days:\n`);
  candidates.forEach((user, idx) => {
    const greetingName = resolveFirstName(user.name, user.email);
    const displayName = user.name ? `${user.name} (Greeting: "Hi ${greetingName}")` : `(Greeting: "Hi ${greetingName}")`;
    console.log(`  [${idx + 1}] ${displayName} <${user.email}>`);
    console.log(`      Last Login: ${user.lastLoginDate} (${user.daysInactive} days ago) | Invoices: ${user.invoiceCount} | Plan: ${user.subscriptionStatus} | UID: ${user.id}`);
  });

  console.log(`\n--------------------------------------------------------------------------------`);
  console.log(`EMAIL PREVIEW FOR FIRST RECIPIENT (${candidates[0].email}):`);
  console.log(`--------------------------------------------------------------------------------`);
  console.log(getPlainTextBody(candidates[0].name, candidates[0].email));
  console.log(`--------------------------------------------------------------------------------`);

  if (isDryRun) {
    console.log(`\nℹ️ DRY-RUN complete. ${candidates.length} candidate(s) identified. No emails were sent.`);
    console.log(`To run interactively and send emails, run without --dry-run:`);
    console.log(`  node scripts/send-mobile-announcement.js\n`);
    return;
  }

  if (!isForce && candidates.length > 1) {
    const excludeInput = await promptUser(`\nEnter numbers to EXCLUDE (comma-separated, e.g. "2, 4"), or press Enter to include ALL: `);
    const excludeIndices = excludeInput ? excludeInput.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n)) : [];

    const selectedCandidates = candidates.filter((_, idx) => !excludeIndices.includes(idx + 1));
    if (selectedCandidates.length === 0) {
      console.log(`\n🚫 All candidates were excluded. Exiting.`);
      return;
    }

    const confirm = await promptUser(`\nConfirm sending Mobile Announcement emails to ${selectedCandidates.length} user(s)? (y/N): `);
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
      const greetingName = resolveFirstName(user.name, user.email);
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

      console.log(`✅ Email sent to ${user.email} (Greeting: "Hi ${greetingName}") [Resend ID: ${data.id}]`);
      successCount++;

      if (user.id !== 'manual') {
        await db.collection('users').doc(user.id).update({
          lastMobileAnnouncementSentAt: new Date()
        });
      }
    } catch (err) {
      console.error(`❌ Exception sending to ${user.email}:`, err.message);
    }
  }

  console.log(`\n🎉 Dispatch complete! Successfully sent ${successCount} / ${targetList.length} email(s).`);
}

main().catch(err => console.error(`❌ Fatal Error:`, err));
