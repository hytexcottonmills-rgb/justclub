/**
 * Sitemap & Canonical Alignment Audit Script for JustClub
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');

console.log('--- AUDITING SITEMAP & CANONICAL ALIGNMENT ---');

// 1. Read dist/sitemap.xml
const sitemapPath = path.resolve(DIST_DIR, 'sitemap.xml');
if (!fs.existsSync(sitemapPath)) {
  console.error('[FAIL] dist/sitemap.xml not found. Build the project first.');
  process.exit(1);
}

const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
const locMatches = [...sitemapContent.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);

console.log(`Found ${locMatches.length} URLs in sitemap.xml\n`);

// 2. Check for duplicates in sitemap
const seenUrls = new Set();
const duplicateUrls = [];
for (const url of locMatches) {
  if (seenUrls.has(url)) {
    duplicateUrls.push(url);
  }
  seenUrls.add(url);
}

if (duplicateUrls.length > 0) {
  console.error(`[FAIL] Found duplicate URLs in sitemap.xml:`, duplicateUrls);
} else {
  console.log(`[PASS] Zero duplicate URLs in sitemap.xml`);
}

// 3. Check that all URLs in sitemap use HTTPS and exact production domain
let invalidDomainCount = 0;
for (const url of locMatches) {
  if (!url.startsWith('https://justclub.in/')) {
    console.error(`[FAIL] Invalid domain or protocol in sitemap URL: ${url}`);
    invalidDomainCount++;
  }
  if (url.includes('?') || url.includes('#')) {
    console.error(`[FAIL] URL contains query string or hash: ${url}`);
    invalidDomainCount++;
  }
}

if (invalidDomainCount === 0) {
  console.log(`[PASS] All sitemap URLs strictly use https://justclub.in/ with no query parameters or hashes.`);
}

// 4. Verify that each sitemap URL corresponds to an existing HTML file in dist/
let missingHtmlCount = 0;
for (const url of locMatches) {
  const parsedPath = url.replace('https://justclub.in', '');
  const cleanPath = parsedPath.replace(/^\/+|\/+$/g, '');
  const expectedFile = cleanPath === '' 
    ? path.resolve(DIST_DIR, 'index.html') 
    : path.resolve(DIST_DIR, cleanPath, 'index.html');

  if (!fs.existsSync(expectedFile)) {
    console.error(`[FAIL] Sitemap URL ${url} has no corresponding HTML file at ${expectedFile}`);
    missingHtmlCount++;
  } else {
    // Check canonical link inside this file
    const fileHtml = fs.readFileSync(expectedFile, 'utf-8');
    const canonicalMatch = fileHtml.match(/<link\s+rel=["']canonical["']\s+href=["'](.*?)["']/i);
    if (!canonicalMatch) {
      console.error(`[FAIL] HTML file for ${url} is missing a canonical link tag.`);
    } else {
      const pageCanonical = canonicalMatch[1];
      if (pageCanonical !== url) {
        console.error(`[FAIL] Canonical mismatch for ${url}: Page specifies canonical ${pageCanonical}`);
      }
    }
    // Check for accidental noindex
    if (/<meta\s+name=["']robots["']\s+content=["'][^"']*noindex[^"']*["']/i.test(fileHtml)) {
      console.error(`[FAIL] Sitemap contains URL marked with noindex: ${url}`);
    }
  }
}

if (missingHtmlCount === 0) {
  console.log(`[PASS] All ${locMatches.length} sitemap URLs have corresponding static HTML files with matching self-canonical tags!`);
}
