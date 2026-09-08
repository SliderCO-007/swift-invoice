import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { blogPosts } from '../src/data/blogPosts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.resolve(__dirname, '../dist');
const indexPath = path.join(distPath, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('Error: dist/index.html not found! Run npm run build first.');
  process.exit(1);
}

const originalHtml = fs.readFileSync(indexPath, 'utf-8');

// Marketing Landing Pages
const landingPages = [
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
  },
  {
    path: 'lp/no-paywall',
    title: "What's a Paywall? | ScanGo Free Invoicing & Instant Mobile Payments",
    description: 'Stop paying monthly subscriptions just to bill clients. ScanGo unlocks free email & Text-2-Pay SMS invoicing, instant Stripe QR codes, and jobsite tracking with no credit card required.',
    url: 'https://scangoinvoice.com/lp/no-paywall/'
  },
  {
    path: 'blog',
    title: 'Guides & Resources for Contractors & Small Businesses | ScanGo Invoice',
    description: 'Practical cash-flow strategies, confident pricing blueprints, and mobile invoicing tips for trade contractors, freelancers, and female entrepreneurs.',
    url: 'https://scangoinvoice.com/blog/'
  }
];

// Combine Landing Pages and Blog Articles
const allPages = [...landingPages];

blogPosts.forEach((post) => {
  allPages.push({
    path: `blog/${post.slug}`,
    title: `${post.title} | ScanGo Invoice Blog`,
    description: post.metaDescription,
    url: `https://scangoinvoice.com/blog/${post.slug}/`,
    isArticle: true,
    publishedAt: post.publishedAt,
    author: post.author.name
  });
});

allPages.forEach((page) => {
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

  // Replace Meta Description
  if (/<meta\s+name="description"\s+content="[\s\S]*?"\s*\/?>/i.test(modifiedHtml)) {
    modifiedHtml = modifiedHtml.replace(
      /<meta\s+name="description"\s+content="[\s\S]*?"\s*\/?>/i,
      `<meta name="description" content="${page.description}" />`
    );
  } else {
    modifiedHtml = modifiedHtml.replace(
      /<\/head>/i,
      `  <meta name="description" content="${page.description}" />\n</head>`
    );
  }

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

  if (page.isArticle) {
    // Inject article og:type & Schema.org JSON-LD
    modifiedHtml = modifiedHtml.replace(
      /<meta\s+property="og:type"\s+content="[\s\S]*?"\s*\/?>/i,
      `<meta property="og:type" content="article" />`
    );

    const schemaJson = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": page.title,
      "description": page.description,
      "datePublished": page.publishedAt,
      "author": {
        "@type": "Organization",
        "name": "ScanGo Invoice",
        "url": "https://scangoinvoice.com"
      },
      "publisher": {
        "@type": "Organization",
        "name": "ScanGo Invoice",
        "logo": {
          "@type": "ImageObject",
          "url": "https://scangoinvoice.com/Logo.webp"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": page.url
      }
    });

    const injection = `
  <link rel="canonical" href="${page.url}" />
  <script type="application/ld+json">
  ${schemaJson}
  </script>
</head>`;
    modifiedHtml = modifiedHtml.replace(/<\/head>/i, injection);
  } else {
    const canonical = `  <link rel="canonical" href="${page.url}" />\n</head>`;
    modifiedHtml = modifiedHtml.replace(/<\/head>/i, canonical);
  }

  fs.writeFileSync(path.join(targetDir, 'index.html'), modifiedHtml, 'utf-8');
  console.log(`Successfully generated dynamic meta HTML for: ${page.url}`);
});
