import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Dynamic environment variables loader (no hardcoded project-specific .env filenames)
function parseEnvFile(fullPath) {
  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) return;
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

function loadEnvFiles() {
  const dirsToScan = [process.cwd(), path.resolve(process.cwd(), 'functions')];
  for (const dir of dirsToScan) {
    if (!fs.existsSync(dir)) continue;
    const entries = fs.readdirSync(dir);
    // Prioritize .env.local first, then other .env* files (excluding examples/templates)
    const envFiles = entries
      .filter(name => name.startsWith('.env') && !name.endsWith('.example') && !name.endsWith('.template'))
      .sort((a, b) => (a === '.env.local' ? -1 : b === '.env.local' ? 1 : a.localeCompare(b)));

    for (const file of envFiles) {
      parseEnvFile(path.join(dir, file));
    }
  }
}

function resolveProjectId() {
  if (process.env.VITE_FIREBASE_PROJECT_ID) return process.env.VITE_FIREBASE_PROJECT_ID;
  if (process.env.GCP_PROJECT) return process.env.GCP_PROJECT;
  if (process.env.GCLOUD_PROJECT) return process.env.GCLOUD_PROJECT;
  try {
    const rcPath = path.resolve(process.cwd(), '.firebaserc');
    if (fs.existsSync(rcPath)) {
      const rc = JSON.parse(fs.readFileSync(rcPath, 'utf8'));
      if (rc?.projects?.default) return rc.projects.default;
    }
  } catch (e) {
    // Ignore parse error
  }
  return null;
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
  console.log(`👋 SCANGO INVOICE - FOUNDER INTRODUCTION EMAIL CLI`);
  console.log(`================================================================================`);
  console.log(`\nDescription:`);
  console.log(`  Sends a personal founder introduction email from Curtis to registered users,`);
  console.log(`  sharing why ScanGo Invoice was built, offering a quick 1-on-1 Zoom onboarding`);
  console.log(`  call/demo or Q&A, and including a personal photo from Trafalgar Square, London.`);
  console.log(`\nUsage:`);
  console.log(`  node scripts/send-founder-intro.js [OPTIONS]`);
  console.log(`\nOptions:`);
  console.log(`  --dry-run                Preview matched users and email copy without sending.`);
  console.log(`  --preview-message        Print the plain-text and HTML email preview and exit.`);
  console.log(`  --to=<email>             Target a single recipient directly (test mode).`);
  console.log(`  --name=<name>            Override recipient first name for --to test mode.`);
  console.log(`  --limit=<n>              Limit the batch size to the first N eligible users (pilot mode).`);
  console.log(`  --days-min=<n>           Optional minimum days since registration.`);
  console.log(`  --days-max=<n>           Optional maximum days since registration.`);
  console.log(`  --from=<sender>          Sender address (default: Curtis <curtis@scangoinvoice.com>).`);
  console.log(`  --subject=<text>         Custom subject line override.`);
  console.log(`  --image-url=<url>        Photo URL (default: https://scangoinvoice.com/curtis-london.jpg).`);
  console.log(`  --inline-cid             Attach public/curtis-london.jpg via inline CID (useful before hosting deploy).`);
  console.log(`  --force                  Send email even if user already received it previously.`);
  console.log(`  --include-members        Include secondary team members (default: owners only).`);
  console.log(`  -h, --help               Show this help message and exit.`);
  console.log(`\nExamples:`);
  console.log(`  1) Preview all eligible existing users (Dry-Run):`);
  console.log(`     node scripts/send-founder-intro.js --dry-run\n`);
  console.log(`  2) Send a live test email to yourself (with inline image before deploying hosting):`);
  console.log(`     node scripts/send-founder-intro.js --to=curtis@scangoinvoice.com --name=Curtis --inline-cid\n`);
  console.log(`  3) Pilot batch to 5 eligible users (marks them as sent so they won't be emailed twice):`);
  console.log(`     node scripts/send-founder-intro.js --limit=5 --inline-cid\n`);
  console.log(`  4) Interactive broadcast to all remaining users:`);
  console.log(`     node scripts/send-founder-intro.js\n`);
  console.log(`  5) Reuse later for newly signed-up users (registered 1 to 7 days ago):`);
  console.log(`     node scripts/send-founder-intro.js --days-min=1 --days-max=7\n`);
  console.log(`================================================================================`);
  process.exit(0);
}

const isDryRun = args.includes('--dry-run');
const isPreviewMessageOnly = args.includes('--preview-message');
const isForce = args.includes('--force');
const includeMembers = args.includes('--include-members');
const useInlineCid = args.includes('--inline-cid');

function getArgValue(prefix, defaultValue) {
  const eqArg = args.find(a => a.startsWith(`${prefix}=`));
  if (eqArg) return eqArg.slice(prefix.length + 1);
  const idx = args.indexOf(prefix);
  if (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--')) {
    return args[idx + 1];
  }
  return defaultValue;
}

const daysMinArg = getArgValue('--days-min', null);
const daysMaxArg = getArgValue('--days-max', null);
const limitArg = getArgValue('--limit', null);
const daysMin = daysMinArg !== null ? parseInt(daysMinArg, 10) : null;
const daysMax = daysMaxArg !== null ? parseInt(daysMaxArg, 10) : null;
const batchLimit = limitArg !== null ? parseInt(limitArg, 10) : null;

const senderEmail = getArgValue('--from', 'Curtis <curtis@scangoinvoice.com>');
const targetOverride = getArgValue('--to', null);
const nameOverride = getArgValue('--name', null);
const imageUrl = getArgValue('--image-url', 'https://scangoinvoice.com/curtis-london.jpg');
const subject = getArgValue(
  '--subject',
  'Quick hello from the founder of ScanGo Invoice 👋'
);

const projectId = resolveProjectId();

/**
 * Robust First Name Resolver
 * Extracts a clean, capitalized first name from user profile name or email prefix.
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
    const clean = name.trim();
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

I realized we haven't properly met yet, so I wanted to send a quick personal note to introduce myself. My name is Curtis, and I'm the founder of ScanGo Invoice.

I built ScanGo Invoice with one simple goal: to help freelancers, contractors, small businesses, and entrepreneurs get paid faster—without getting bogged down by complicated CRM or accounting software.

Billing a client shouldn't feel like a second job. Whether you're creating an invoice in seconds on your phone (or by voice!), tracking jobsite hours and receipt photos, or collecting instant online payments via Stripe, everything in ScanGo is designed to stay out of your way so you can focus on your actual work.

Because I build ScanGo for independent business owners like you, I wanted to personally reach out and offer my help:

1. Quick 1-on-1 Zoom Walkthrough / Demo:
   If you'd like a quick 10-minute walkthrough to get your account dialed in (like connecting Stripe for 1-click client payments or setting up project tracking), just reply with a day and time that works for you and I'll set up a quick Zoom call at your convenience.

2. Questions or Feedback:
   If you have any questions, ran into a snag, or wish ScanGo had a specific feature for your business, just hit reply and let me know. I read and reply to every email personally.

Thanks for being part of ScanGo Invoice—I'm grateful to have you here!

Best,

Curtis
Founder, ScanGo Invoice
curtis@scangoinvoice.com
https://scangoinvoice.com

P.S. Putting a face to the name! I've included a photo from a recent trip to Trafalgar Square in London—complete with Nelson's Column and the bronze Landseer Lions right behind me, Big Ben in the distance on the left, and a classic red double-decker bus passing by:
${imageUrl}
`;
}

function getHtmlBody(name, email, imgSrc) {
  const firstName = resolveFirstName(name, email);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.65;">
  <div style="max-width: 580px; margin: 0; padding: 20px 16px;">
    <p style="margin: 0 0 16px 0;">Hi ${firstName},</p>

    <p style="margin: 0 0 16px 0;">
      I realized we haven't properly met yet, so I wanted to send a quick personal note to introduce myself. My name is <strong>Curtis</strong>, and I'm the founder of <a href="https://scangoinvoice.com" style="color: #2563eb; text-decoration: none; font-weight: 500;">ScanGo Invoice</a>.
    </p>

    <p style="margin: 0 0 16px 0;">
      I built ScanGo Invoice with one simple goal: to help freelancers, contractors, small businesses, and entrepreneurs <strong>get paid faster—without complicated CRM or accounting software</strong>.
    </p>

    <p style="margin: 0 0 16px 0;">
      Billing a client shouldn't feel like a second job. Whether you're creating an invoice in seconds on your phone (or by voice!), logging jobsite hours and receipt photos, or collecting instant payments via Stripe, everything in ScanGo is built to stay out of your way so you can focus on your actual work.
    </p>

    <p style="margin: 0 0 12px 0;">
      Because I build ScanGo directly for independent business owners like you, I wanted to personally reach out and offer my help:
    </p>

    <ul style="margin: 0 0 18px 0; padding-left: 20px;">
      <li style="margin-bottom: 10px;">
        <strong>Quick 1-on-1 Zoom Call / Demo:</strong> Want a quick 10-minute walkthrough to get your account dialed in? Just reply with a day and time that works for you, and I'll gladly set up a quick Zoom call at your convenience.
      </li>
      <li style="margin-bottom: 4px;">
        <strong>Questions or Ideas:</strong> Have a question, ran into a snag, or wish ScanGo had a specific feature for your business? Just hit reply—I read and respond to every email personally.
      </li>
    </ul>

    <p style="margin: 0 0 18px 0;">
      Thanks for being part of ScanGo Invoice—I'm grateful to have you here!
    </p>

    <p style="margin: 0 0 24px 0;">
      Best,<br><br>
      <strong>Curtis</strong><br>
      Founder, ScanGo Invoice<br>
      <a href="mailto:curtis@scangoinvoice.com" style="color: #2563eb; text-decoration: none;">curtis@scangoinvoice.com</a><br>
      <a href="https://scangoinvoice.com" style="color: #64748b; text-decoration: none; font-size: 13.5px;">scangoinvoice.com</a>
    </p>

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 20px 0;">

    <p style="margin: 0 0 12px 0; font-size: 14px; color: #475569; font-style: italic;">
      <strong>P.S.</strong> Putting a face to the name! Here's a photo from a recent trip to <strong>Trafalgar Square in London</strong>—complete with Nelson's Column and the bronze Landseer Lions right behind me, Big Ben (Elizabeth Tower) in the distance on the left, and a classic red double-decker bus passing by:
    </p>

    <div style="margin: 12px 0 8px 0;">
      <img
        src="${imgSrc}"
        alt="Curtis, Founder of ScanGo Invoice, in Trafalgar Square, London with Nelson's Column, the Landseer Lions, Big Ben, and a red double-decker bus in the background"
        width="360"
        style="display: block; max-width: 100%; height: auto; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);"
      />
      <p style="margin: 6px 0 0 0; font-size: 12.5px; color: #64748b;">
        📍 Trafalgar Square, London — saying hello from across the pond!
      </p>
    </div>
  </div>
</body>
</html>`;
}

if (isPreviewMessageOnly) {
  const sampleName = nameOverride || 'Alex';
  const sampleEmail = targetOverride || 'alex@example.com';
  console.log(`================================================================================`);
  console.log(`📧 FOUNDER INTRO EMAIL PREVIEW (Sample Recipient: ${sampleName} <${sampleEmail}>)`);
  console.log(`================================================================================`);
  console.log(`From:    ${senderEmail}`);
  console.log(`Subject: ${subject}`);
  console.log(`Image:   ${useInlineCid ? 'cid:curtis-london (inline attachment)' : imageUrl}`);
  console.log(`--------------------------------------------------------------------------------`);
  console.log(getPlainTextBody(sampleName, sampleEmail));
  console.log(`================================================================================`);
  process.exit(0);
}

const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
  console.error('❌ RESEND_API_KEY not found in environment variables.');
  process.exit(1);
}

if (!projectId) {
  console.error('❌ Firebase Project ID not found in environment or .firebaserc.');
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
    console.error('❌ Failed to initialize Firestore client:', e.message);
    process.exit(1);
  }
}

if (!db) {
  console.error('❌ Could not initialize Firestore database client.');
  process.exit(1);
}

function promptUser(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve =>
    rl.question(query, ans => {
      rl.close();
      resolve(ans.trim());
    })
  );
}

async function main() {
  const filterDescription =
    daysMin !== null || daysMax !== null
      ? `${daysMin ?? 0} to ${daysMax ?? '∞'} days since registration`
      : 'All existing registered users (not previously sent)';

  console.log(`================================================================================`);
  console.log(`👋 SCANGO INVOICE - FOUNDER INTRODUCTION EMAIL DISPATCHER`);
  console.log(`================================================================================`);
  console.log(`📌 Project ID:         ${projectId}`);
  console.log(`🎯 Target Filter:      ${filterDescription}`);
  if (batchLimit) {
    console.log(`📦 Batch Pilot Limit:  Up to ${batchLimit} user(s)`);
  }
  console.log(`✉️  Sender Address:     ${senderEmail}`);
  console.log(`📧 Subject:            ${subject}`);
  console.log(`🖼️  London Photo Mode:  ${useInlineCid ? 'Inline CID (public/curtis-london.jpg)' : imageUrl}`);
  console.log(`⚡ Mode:               ${isDryRun ? 'DRY-RUN (No emails will be sent)' : 'LIVE OUTREACH'}`);
  console.log(`================================================================================\n`);

  if (targetOverride) {
    console.log(`🎯 Sending directly to single recipient: ${targetOverride}`);
    let resolvedName = nameOverride || '';
    let resolvedUid = 'manual';

    try {
      const snap = await db.collection('users').where('email', '==', targetOverride).limit(1).get();
      if (!snap.empty) {
        resolvedUid = snap.docs[0].id;
        if (!resolvedName) resolvedName = snap.docs[0].data().name || '';
      }
    } catch (e) {
      // Ignore lookup error
    }

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
      name: resolvedName,
      daysAgo: 'N/A',
      invoiceCount: 'N/A',
      plan: 'N/A'
    };
    await processCandidates([candidate]);
    return;
  }

  // Optional: query Firebase Auth for fallback displayName / creationTime
  const authUsersMap = new Map();
  if (admin && admin.auth) {
    try {
      let nextPageToken;
      do {
        const listResult = await admin.auth().listUsers(1000, nextPageToken);
        listResult.users.forEach(u => authUsersMap.set(u.uid, u));
        nextPageToken = listResult.pageToken;
      } while (nextPageToken);
    } catch (e) {
      // Continue with Firestore records if Auth listing is unavailable
    }
  }

  console.log(`Scanning users from Firestore...`);
  const usersSnap = await db.collection('users').get();
  console.log(`Total user records scanned: ${usersSnap.size}`);

  const now = Date.now();
  const minMillis = daysMin !== null ? daysMin * 24 * 60 * 60 * 1000 : null;
  const maxMillis = daysMax !== null ? daysMax * 24 * 60 * 60 * 1000 : null;

  const candidates = [];

  for (const docSnap of usersSnap.docs) {
    const data = docSnap.data();
    const uid = docSnap.id;

    if (!includeMembers && data.role === 'member') continue; // Exclude secondary team members
    if (!isForce && data.founderIntroEmailSentAt) continue; // Already sent founder intro
    if (!data.email || !data.email.includes('@')) continue;

    const authUser = authUsersMap.get(uid);

    // Calculate registration age if available
    let createdTime = 0;
    if (data.createdAt && typeof data.createdAt.toDate === 'function') {
      createdTime = data.createdAt.toDate().getTime();
    } else if (data.createdAt && data.createdAt._seconds) {
      createdTime = data.createdAt._seconds * 1000;
    } else if (data.createdAt) {
      createdTime = new Date(data.createdAt).getTime();
    } else if (authUser && authUser.metadata && authUser.metadata.creationTime) {
      createdTime = new Date(authUser.metadata.creationTime).getTime();
    }

    if (minMillis !== null || maxMillis !== null) {
      if (!createdTime || isNaN(createdTime)) continue;
      const ageMillis = now - createdTime;
      if (minMillis !== null && ageMillis < minMillis) continue;
      if (maxMillis !== null && ageMillis > maxMillis) continue;
    }

    const daysAgo =
      createdTime && !isNaN(createdTime)
        ? Math.floor((now - createdTime) / (24 * 60 * 60 * 1000))
        : 'N/A';

    candidates.push({
      id: uid,
      email: data.email.trim(),
      name: data.name || (authUser ? authUser.displayName : '') || '',
      daysAgo,
      createdTime: createdTime || 0,
      invoiceCount: data.invoiceCount || 0,
      plan: data.subscriptionStatus || 'free'
    });
  }

  // Sort most recently registered users first for predictable batching
  candidates.sort((a, b) => b.createdTime - a.createdTime);

  const totalEligible = candidates.length;
  const batchedCandidates =
    batchLimit && batchLimit > 0 ? candidates.slice(0, batchLimit) : candidates;

  if (batchLimit && totalEligible > batchedCandidates.length) {
    console.log(
      `📦 Pilot batch active: selected ${batchedCandidates.length} of ${totalEligible} total eligible user(s).`
    );
  }

  await processCandidates(batchedCandidates);
}

async function processCandidates(candidates) {
  if (candidates.length === 0) {
    console.log(`\n✅ No eligible users found matching criteria.`);
    return;
  }

  console.log(`\nFound ${candidates.length} eligible user(s):\n`);
  candidates.forEach((user, idx) => {
    const greetingName = resolveFirstName(user.name, user.email);
    const displayName = user.name ? `${user.name} (Greeting: "Hi ${greetingName}")` : `(Greeting: "Hi ${greetingName}")`;
    console.log(`  [${idx + 1}] ${displayName} <${user.email}>`);
    console.log(`      Registered: ${user.daysAgo} days ago | Invoices: ${user.invoiceCount} | Plan: ${user.plan} | UID: ${user.id}`);
  });

  console.log(`\n--------------------------------------------------------------------------------`);
  console.log(`EMAIL PREVIEW FOR FIRST RECIPIENT (${candidates[0].email}):`);
  console.log(`Subject: ${subject}`);
  console.log(`--------------------------------------------------------------------------------`);
  console.log(getPlainTextBody(candidates[0].name, candidates[0].email));
  console.log(`--------------------------------------------------------------------------------`);

  if (isDryRun) {
    console.log(`\nℹ️ DRY-RUN complete. ${candidates.length} candidate(s) identified. No emails were sent.`);
    console.log(`To run interactively and send emails, execute without --dry-run.`);
    return;
  }

  if (!isForce && candidates.length > 1) {
    const excludeInput = await promptUser(
      `\nEnter numbers to EXCLUDE (comma-separated, e.g. "2, 4"), or press Enter to include ALL: `
    );
    const excludeIndices = excludeInput
      ? excludeInput
          .split(',')
          .map(s => parseInt(s.trim(), 10))
          .filter(n => !isNaN(n))
      : [];

    const selectedCandidates = candidates.filter((_, idx) => !excludeIndices.includes(idx + 1));
    if (selectedCandidates.length === 0) {
      console.log(`\n🚫 All candidates were excluded. Exiting.`);
      return;
    }

    const confirm = await promptUser(
      `\nConfirm sending Founder Intro email to ${selectedCandidates.length} user(s)? (y/N): `
    );
    if (confirm.toLowerCase() !== 'y') {
      console.log(`\nCancelled.`);
      return;
    }

    await dispatchEmails(selectedCandidates);
  } else if (!isForce && candidates.length === 1) {
    const confirm = await promptUser(
      `\nConfirm sending Founder Intro email to ${candidates[0].email}? (y/N): `
    );
    if (confirm.toLowerCase() !== 'y') {
      console.log(`\nCancelled.`);
      return;
    }
    await dispatchEmails(candidates);
  } else {
    await dispatchEmails(candidates);
  }
}

async function dispatchEmails(targetList) {
  console.log(`\n🚀 Starting email dispatch to ${targetList.length} recipient(s)...\n`);
  let successCount = 0;

  let inlineAttachment = null;
  if (useInlineCid) {
    const localPhotoPath = path.resolve(process.cwd(), 'public/curtis-london.jpg');
    if (!fs.existsSync(localPhotoPath)) {
      console.error(`❌ Could not find ${localPhotoPath} for --inline-cid attachment.`);
      process.exit(1);
    }
    inlineAttachment = {
      filename: 'curtis-london.jpg',
      content: fs.readFileSync(localPhotoPath),
      content_id: 'curtis-london',
      contentId: 'curtis-london'
    };
  }

  const effectiveImgSrc = useInlineCid ? 'cid:curtis-london' : imageUrl;

  for (let i = 0; i < targetList.length; i++) {
    const user = targetList[i];
    try {
      const greetingName = resolveFirstName(user.name, user.email);
      const textBody = getPlainTextBody(user.name, user.email);
      const htmlBody = getHtmlBody(user.name, user.email, effectiveImgSrc);

      const payload = {
        from: senderEmail,
        to: user.email,
        subject: subject,
        text: textBody,
        html: htmlBody,
        reply_to: 'curtis@scangoinvoice.com'
      };

      if (inlineAttachment) {
        payload.attachments = [inlineAttachment];
      }

      const { data, error } = await resend.emails.send(payload);

      if (error) {
        console.error(`❌ Failed to send to ${user.email}:`, error);
        continue;
      }

      console.log(`✅ Email sent to ${user.email} (Greeting: "Hi ${greetingName}") [ID: ${data.id}]`);
      successCount++;

      if (user.id && user.id !== 'manual') {
        await db.collection('users').doc(user.id).update({
          founderIntroEmailSentAt: new Date()
        });
      }

      // Gentle rate-limiting pause between sends
      if (i < targetList.length - 1) {
        await new Promise(r => setTimeout(r, 300));
      }
    } catch (err) {
      console.error(`❌ Exception sending to ${user.email}:`, err.message);
    }
  }

  console.log(`\n🎉 Dispatch complete! Successfully sent ${successCount} / ${targetList.length} email(s).`);
}

main().catch(err => console.error(`❌ Fatal Error:`, err));
