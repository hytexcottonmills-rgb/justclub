/**
 * SEO & GEO Build Validation Script for JustClub
 * Scans generated static HTML files in dist/ and checks compliance against hard SEO rules.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
const errors = [];
const warnings = [];

function logPass(msg) {
  totalChecks++;
  passedChecks++;
  console.log(`  ✓ [PASS] ${msg}`);
}

function logFail(msg, file = '') {
  totalChecks++;
  failedChecks++;
  const errorMsg = file ? `${file}: ${msg}` : msg;
  errors.push(errorMsg);
  console.error(`  ✗ [FAIL] ${errorMsg}`);
}

function logWarn(msg, file = '') {
  const warnMsg = file ? `${file}: ${msg}` : msg;
  warnings.push(warnMsg);
  console.warn(`  ! [WARN] ${warnMsg}`);
}

// Ensure dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  console.error(`[ERROR] dist directory does not exist at ${DIST_DIR}. Please run build first.`);
  process.exit(1);
}

console.log('====================================================');
console.log('   JustClub SEO & GEO Build Validation Audit        ');
console.log('====================================================\n');

// 1. Collect all HTML files in dist
function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.resolve(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getHtmlFiles(filePath));
    } else if (file.endsWith('.html')) {
      results.push(filePath);
    }
  }
  return results;
}

const htmlFiles = getHtmlFiles(DIST_DIR);
console.log(`Found ${htmlFiles.length} HTML files in dist/:\n`);

// Expected static slugs
const expectedSlugs = [
  '/',
  '/snooker-billiards-club-software/',
  '/gaming-cafe-lounge-software/',
  '/club-credit-khata-ledger-software/',
  '/snooker-club-software-buyers-guide/',
  '/how-to-bill-snooker-table-time/',
  '/about/',
  '/privacy/',
  '/terms/',
  '/refund/',
  '/contact/',
];

// Audit each HTML file
for (const file of htmlFiles) {
  const relativePath = path.relative(DIST_DIR, file);
  console.log(`Auditing: ${relativePath}`);
  const html = fs.readFileSync(file, 'utf-8');

  // Check 1: H1 Count (Exactly 1 H1 per page, except 404 which can have 1 as well)
  const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  if (h1Matches.length === 1) {
    logPass(`H1 count is exactly 1 (${h1Matches[0].replace(/<[^>]+>/g, '').trim()})`);
  } else {
    logFail(`H1 count is ${h1Matches.length} (Expected exactly 1)`, relativePath);
  }

  // Check 2: Title Tag
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch && titleMatch[1].trim()) {
    const titleText = titleMatch[1].trim();
    if (titleText.length >= 20 && titleText.length <= 70) {
      logPass(`Title tag present and optimal length (${titleText.length} chars): "${titleText}"`);
    } else {
      logWarn(`Title tag length (${titleText.length} chars) outside standard 20-70 range: "${titleText}"`, relativePath);
      logPass(`Title tag present: "${titleText}"`);
    }
  } else {
    logFail(`Missing <title> tag`, relativePath);
  }

  // Check 3: Description Meta Tag
  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']\s*\/?>/i);
  if (descMatch && descMatch[1].trim()) {
    const descText = descMatch[1].trim();
    if (descText.length >= 50 && descText.length <= 180) {
      logPass(`Meta description present and optimal length (${descText.length} chars)`);
    } else {
      logWarn(`Meta description length (${descText.length} chars) outside 50-180 range`, relativePath);
      logPass(`Meta description present`);
    }
  } else {
    logFail(`Missing <meta name="description"> tag`, relativePath);
  }

  // Check 4: Canonical Link Tag
  const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([\s\S]*?)["']\s*\/?>/i);
  if (canonicalMatch && canonicalMatch[1].trim()) {
    logPass(`Canonical link tag present: ${canonicalMatch[1].trim()}`);
  } else {
    if (!relativePath.endsWith('404.html')) {
      logFail(`Missing <link rel="canonical"> tag`, relativePath);
    } else {
      logPass(`Canonical omitted for 404 page`);
    }
  }

  // Check 5: OpenGraph and Twitter Tags
  const hasOgTitle = /<meta\s+property=["']og:title["']/i.test(html);
  const hasOgDesc = /<meta\s+property=["']og:description["']/i.test(html);
  const hasOgUrl = /<meta\s+property=["']og:url["']/i.test(html);
  const hasOgImage = /<meta\s+property=["']og:image["']/i.test(html);
  const hasTwitterCard = /<meta\s+name=["']twitter:card["']/i.test(html);

  if (hasOgTitle && hasOgDesc && hasOgUrl && hasOgImage && hasTwitterCard) {
    logPass(`OpenGraph and Twitter social card meta tags complete`);
  } else {
    logFail(`Incomplete social meta tags (og:title:${hasOgTitle}, og:desc:${hasOgDesc}, og:url:${hasOgUrl}, og:image:${hasOgImage}, twitter:${hasTwitterCard})`, relativePath);
  }

  // Check 6: JSON-LD Structured Data
  const jsonLdMatches = html.match(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi) || [];
  if (jsonLdMatches.length > 0) {
    let validJsonLdCount = 0;
    let hasGraphPattern = false;

    for (const jsonLdBlock of jsonLdMatches) {
      const content = jsonLdBlock.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '').trim();
      try {
        const parsed = JSON.parse(content);
        validJsonLdCount++;
        if (parsed['@graph'] && Array.isArray(parsed['@graph'])) {
          hasGraphPattern = true;
        }
      } catch (e) {
        logFail(`Invalid JSON inside application/ld+json script tag: ${e.message}`, relativePath);
      }
    }

    if (validJsonLdCount > 0) {
      logPass(`Valid JSON-LD script tag present (${validJsonLdCount} block(s), @graph:${hasGraphPattern})`);
    }
  } else {
    if (!relativePath.endsWith('404.html')) {
      logFail(`Missing <script type="application/ld+json"> structured data`, relativePath);
    } else {
      logPass(`JSON-LD omitted for 404 page`);
    }
  }

  // Check 7: Image Alt Tags
  const imgMatches = html.match(/<img[^>]*>/gi) || [];
  let missingAltCount = 0;
  for (const imgTag of imgMatches) {
    if (!/alt=["']([^"']*)["']/i.test(imgTag)) {
      missingAltCount++;
    }
  }
  if (missingAltCount === 0) {
    logPass(`All ${imgMatches.length} <img> tags have alt attributes`);
  } else {
    logFail(`${missingAltCount} out of ${imgMatches.length} <img> tags missing alt attribute`, relativePath);
  }

  console.log('');
}

// 2. Check sitemap.xml
console.log('Auditing: sitemap.xml');
const sitemapPath = path.resolve(DIST_DIR, 'sitemap.xml');
if (fs.existsSync(sitemapPath)) {
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
  let missingUrls = 0;

  for (const slug of expectedSlugs) {
    const fullUrl = slug === '/' ? 'https://justclub.in/' : `https://justclub.in${slug}`;
    if (sitemapContent.includes(fullUrl)) {
      logPass(`Sitemap includes: ${fullUrl}`);
    } else {
      logFail(`Sitemap missing expected URL: ${fullUrl}`);
      missingUrls++;
    }
  }
} else {
  logFail(`sitemap.xml not found in dist/`);
}

console.log('');

// 3. Summary
console.log('====================================================');
console.log(`   SEO & GEO Validation Summary                     `);
console.log(`   Total Checks:  ${totalChecks}`);
console.log(`   Passed Checks: ${passedChecks}`);
console.log(`   Failed Checks: ${failedChecks}`);
console.log(`   Warnings:      ${warnings.length}`);
console.log('====================================================\n');

if (errors.length > 0) {
  console.error('Audit failed with the following errors:');
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
} else {
  console.log('✓ All SEO & GEO build checks PASSED successfully!');
  process.exit(0);
}
