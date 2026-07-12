import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.resolve(__dirname, '../dist');
const indexPath = path.join(distPath, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('Error: dist/index.html not found! Run npm run build first.');
  process.exit(1);
}

const originalHtml = fs.readFileSync(indexPath, 'utf-8');

const pages = [
  {
    path: 'lp/weekend-freedom',
    title: 'Reclaim Your Weekends | ScanGo Invoice Simple On-Site Billing',
    description: 'Stop wasting Sunday nights on paperwork. Track project time, snap receipt photos on the go, and convert to invoices in one click. Free up your weekends.',
    url: 'https://scangoinvoice.com/lp/weekend-freedom/'
  },
  {
    path: 'lp/get-paid-faster',
    title: 'Get Paid 3x Faster | ScanGo Invoice for Contractors & Local Pros',
    description: 'The ultimate mobile invoicing tool for plumbers, contractors, and local service providers. Send professional invoices on the job in under 60 seconds and accept cards/ACH instantly.',
    url: 'https://scangoinvoice.com/lp/get-paid-faster/'
  },
  {
    path: 'lp/time-is-money',
    title: 'ScanGo Invoice - Time is Money | Professional Mobile Invoicing',
    description: 'Track time and expenses on your phone for you and your team. Stop losing billable hours and turn tracked work into paid client invoices instantly.',
    url: 'https://scangoinvoice.com/lp/time-is-money/'
  }
];

pages.forEach((page) => {
  const targetDir = path.join(distPath, page.path);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  let modifiedHtml = originalHtml;

  // Replace Title tag
  modifiedHtml = modifiedHtml.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${page.title}</title>`
  );

  // Replace Open Graph tags
  modifiedHtml = modifiedHtml.replace(
    /<meta\s+property="og:title"\s+content="[\s\S]*?"\s*\/?>/i,
    `<meta property="og:title" content="${page.title}" />`
  );

  modifiedHtml = modifiedHtml.replace(
    /<meta\s+property="og:description"\s+content="[\s\S]*?"\s*\/?>/i,
    `<meta property="og:description" content="${page.description}" />`
  );

  modifiedHtml = modifiedHtml.replace(
    /<meta\s+property="og:url"\s+content="[\s\S]*?"\s*\/?>/i,
    `<meta property="og:url" content="${page.url}" />`
  );

  fs.writeFileSync(path.join(targetDir, 'index.html'), modifiedHtml, 'utf-8');
  console.log(`Successfully generated dynamic meta HTML for: ${page.url}`);
});
