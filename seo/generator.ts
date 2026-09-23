import type { BreadcrumbItem, FAQItem, PageMeta } from './types';

export const BASE_URL = 'https://justclub.in';
export const AVATAR_URL = `${BASE_URL}/justclub-avatar.jpg`;
export const LOGO_URL = `${BASE_URL}/justclub-launcher-512.png`;
export const LAST_UPDATED = 'September 21, 2026';
export const SUPPORT_EMAIL = 'support@justclub.in';

export const ORG_NODE = {
  '@type': 'Organization',
  '@id': `${BASE_URL}/#organization`,
  name: 'JustClub',
  url: BASE_URL,
  logo: {
    '@type': 'ImageObject',
    '@id': `${BASE_URL}/#logo`,
    url: LOGO_URL,
    width: 512,
    height: 512,
  },
  email: SUPPORT_EMAIL,
  sameAs: [
    'https://www.instagram.com/justclub.in/',
    'https://www.youtube.com/@Justclubindia',
    'https://www.linkedin.com/company/justclubindia/',
    'https://x.com/justclubindia',
    'https://www.facebook.com/justclub.in',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: SUPPORT_EMAIL,
    areaServed: 'IN',
    availableLanguage: 'English',
    hoursAvailable: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '18:00',
    },
  },
  founder: {
    '@type': 'Person',
    name: 'Rajaganapathy Kamalakannan',
  },
};

export const WEBSITE_NODE = {
  '@type': 'WebSite',
  '@id': `${BASE_URL}/#website`,
  name: 'JustClub',
  url: BASE_URL,
  inLanguage: 'en-IN',
  publisher: {
    '@id': `${BASE_URL}/#organization`,
  },
};

export const SOFTWARE_NODE = {
  '@type': 'SoftwareApplication',
  '@id': `${BASE_URL}/#software`,
  name: 'JustClub',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web browser (installable PWA)',
  description: 'Cloud POS, live table timer, split billing, café inventory, and customer khata ledger operating platform for snooker, billiards, and gaming lounges in India. Includes a 15-day free trial.',
  featureList: [
    'Precision live table & station timers with pause/resume support',
    'Per-minute exact billing and custom block billing increments (15m, 30m, 1hr)',
    'Instant split billing engine with 1v1 loser-pays and group split modes',
    'Dynamic UPI QR code generation for Google Pay, PhonePe, Paytm, and BHIM',
    'Direct WhatsApp payment request deep linking and customer debt reminders',
    'Attached & standalone café POS terminal with real-time stock decrements',
    'Customer CRM & credit khata ledger with lifetime visit metrics',
    'Isolated super admin multi-tenant portal for SaaS subscription management',
  ],
  offers: [
    {
      '@type': 'Offer',
      name: 'Monthly Subscription',
      price: '499',
      priceCurrency: 'INR',
      description: 'Full multi-game club POS, timers, split billing, café POS, and customer ledger billed monthly.',
      url: `${BASE_URL}/#pricing`,
      priceValidUntil: '2027-12-31',
      availability: 'https://schema.org/InStock',
      billingDuration: 'P1M',
    },
    {
      '@type': 'Offer',
      name: 'Quarterly Subscription',
      price: '1299',
      priceCurrency: 'INR',
      description: 'Quarterly club POS plan (about ₹433/month) with all features and priority support.',
      url: `${BASE_URL}/#pricing`,
      priceValidUntil: '2027-12-31',
      availability: 'https://schema.org/InStock',
      billingDuration: 'P3M',
    },
    {
      '@type': 'Offer',
      name: 'Yearly Subscription',
      price: '4499',
      priceCurrency: 'INR',
      description: 'Annual club OS plan (about ₹375/month) including 15-day free trial with no credit card required.',
      url: `${BASE_URL}/#pricing`,
      priceValidUntil: '2027-12-31',
      availability: 'https://schema.org/InStock',
      billingDuration: 'P1Y',
    },
  ],
  publisher: {
    '@id': `${BASE_URL}/#organization`,
  },
  inLanguage: 'en-IN',
  screenshot: LOGO_URL,
};

export const sharedStyles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: #090d16;
    color: #f8fafc;
    line-height: 1.65;
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
  }
  a { color: #818cf8; text-decoration: none; transition: color 0.15s ease; padding: 2px 0; }
  a:hover { color: #a5b4fc; text-decoration: underline; }
  .container { max-width: 960px; margin: 0 auto; padding: 0 1.5rem; }
  header {
    border-bottom: 1px solid #1e293b;
    background-color: rgba(9, 13, 22, 0.95);
    position: sticky;
    top: 0;
    z-index: 50;
    backdrop-filter: blur(8px);
  }
  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }
  .brand-logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 900;
    font-size: 1.25rem;
    color: #ffffff;
    text-decoration: none !important;
  }
  .brand-logo span.highlight { color: #635bff; }
  .brand-logo span.badge {
    font-family: monospace;
    font-size: 0.65rem;
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    background: rgba(99, 91, 255, 0.15);
    color: #a5a0ff;
    border: 1px solid rgba(99, 91, 255, 0.3);
  }
  .header-nav {
    display: none;
    gap: 1.5rem;
    align-items: center;
  }
  @media (min-width: 768px) {
    .header-nav { display: flex; }
  }
  .header-nav a {
    color: #94a3b8;
    font-size: 0.875rem;
    font-weight: 600;
  }
  .header-nav a:hover {
    color: #ffffff;
    text-decoration: none;
  }
  .cta-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: #635bff;
    color: #ffffff !important;
    font-weight: 700;
    font-size: 0.875rem;
    padding: 0.65rem 1.25rem;
    min-height: 44px;
    border-radius: 0.75rem;
    text-decoration: none !important;
    box-shadow: 0 4px 14px rgba(99, 91, 255, 0.35);
    transition: background 0.15s ease;
  }
  .cta-btn:hover { background: #4f46e5; text-decoration: none !important; }
  .cta-btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: #1e293b;
    color: #f1f5f9 !important;
    font-weight: 700;
    font-size: 0.875rem;
    padding: 0.65rem 1.25rem;
    min-height: 44px;
    border-radius: 0.75rem;
    text-decoration: none !important;
    border: 1px solid #334155;
    transition: background 0.15s ease;
  }
  .cta-btn-secondary:hover { background: #334155; text-decoration: none !important; }
  .breadcrumbs {
    padding: 1rem 0;
    font-size: 0.8rem;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .breadcrumbs a { color: #94a3b8; }
  .breadcrumbs span.separator { color: #475569; }
  .hero-card {
    padding: 1.5rem 0 2rem 0;
    border-bottom: 1px solid #1e293b;
  }
  .meta-tag {
    display: inline-block;
    font-family: monospace;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #818cf8;
    background: rgba(99, 91, 255, 0.12);
    border: 1px solid rgba(99, 91, 255, 0.25);
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    margin-bottom: 1rem;
  }
  h1 {
    font-size: 2.15rem;
    font-weight: 900;
    line-height: 1.2;
    color: #ffffff;
    margin-bottom: 1.25rem;
    letter-spacing: -0.02em;
  }
  @media (min-width: 640px) { h1 { font-size: 2.65rem; } }
  .quick-answer {
    background: #0f172a;
    border-left: 4px solid #635bff;
    border-radius: 0 0.75rem 0.75rem 0;
    padding: 1.25rem 1.5rem;
    margin-bottom: 2rem;
    font-size: 1.05rem;
    color: #cbd5e1;
    line-height: 1.6;
  }
  .quick-answer strong { color: #ffffff; }
  .author-attribution {
    font-size: 0.85rem;
    color: #94a3b8;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  h2 {
    font-size: 1.45rem;
    font-weight: 800;
    color: #ffffff;
    margin: 2.5rem 0 1rem 0;
    letter-spacing: -0.01em;
  }
  h3 {
    font-size: 1.15rem;
    font-weight: 700;
    color: #f1f5f9;
    margin: 1.5rem 0 0.75rem 0;
  }
  p { margin-bottom: 1.25rem; color: #cbd5e1; font-size: 1rem; }
  strong { color: #f1f5f9; }
  ul, ol { margin-bottom: 1.5rem; padding-left: 1.5rem; color: #cbd5e1; }
  li { margin-bottom: 0.5rem; }
  
  .table-wrapper {
    overflow-x: auto;
    margin: 1.75rem 0;
    border: 1px solid #1e293b;
    border-radius: 0.75rem;
    background: #0f172a;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
    text-align: left;
  }
  th {
    background: #1e293b;
    color: #f1f5f9;
    padding: 0.85rem 1rem;
    font-weight: 700;
    border-bottom: 1px solid #334155;
  }
  td {
    padding: 0.85rem 1rem;
    border-bottom: 1px solid #1e293b;
    color: #cbd5e1;
  }
  tr:last-child td { border-bottom: none; }
  
  .feature-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.25rem;
    margin: 2rem 0;
  }
  @media (min-width: 640px) {
    .feature-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (min-width: 900px) {
    .feature-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
  }
  .feature-card {
    background: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 0.75rem;
    padding: 1.25rem 1.5rem;
  }
  .feature-card h3 { margin-top: 0; color: #ffffff; }
  .feature-card p { font-size: 0.925rem; margin-bottom: 0; }
  
  .example-box {
    background: #111827;
    border: 1px solid #374151;
    border-radius: 0.75rem;
    padding: 1.25rem 1.5rem;
    margin: 1.75rem 0;
  }
  .example-box .tag {
    display: inline-block;
    font-family: monospace;
    font-size: 0.75rem;
    font-weight: 700;
    color: #34d399;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
  }
  
  .faq-section { margin: 3rem 0; }
  .faq-item {
    background: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 0.75rem;
    padding: 1.25rem 1.5rem;
    margin-bottom: 1rem;
  }
  .faq-item h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: #ffffff;
    margin-top: 0;
    margin-bottom: 0.5rem;
  }
  .faq-item p { margin-bottom: 0; }
  
  .cta-banner {
    background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
    border: 1px solid #3730a3;
    border-radius: 1rem;
    padding: 2.5rem 2rem;
    text-align: center;
    margin: 3.5rem 0;
  }
  .cta-banner h2 { margin-top: 0; margin-bottom: 0.75rem; }
  .cta-banner p { max-width: 600px; margin: 0 auto 1.5rem auto; color: #cbd5e1; }
  
  .calc-box {
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 1rem;
    padding: 1.5rem;
    margin: 2rem 0;
  }
  .calc-form-group {
    margin-bottom: 1.25rem;
  }
  .calc-form-group label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: #e2e8f0;
    margin-bottom: 0.5rem;
  }
  .calc-input {
    width: 100%;
    background: #1e293b;
    border: 1px solid #475569;
    color: #ffffff;
    padding: 0.65rem 0.85rem;
    border-radius: 0.5rem;
    font-size: 1rem;
  }
  .calc-result-box {
    background: #020617;
    border: 1px solid #3730a3;
    border-radius: 0.75rem;
    padding: 1.25rem;
    margin-top: 1.5rem;
  }
  
  footer {
    border-top: 1px solid #1e293b;
    background: #050811;
    padding: 3.5rem 0 2rem 0;
    font-size: 0.875rem;
    color: #94a3b8;
  }
  .footer-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    margin-bottom: 2.5rem;
  }
  @media (min-width: 640px) { .footer-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 1024px) { .footer-grid { grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr; } }
  .footer-col h4 {
    color: #f1f5f9;
    font-size: 0.85rem;
    margin-bottom: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .footer-col ul { list-style: none; padding-left: 0; margin-bottom: 0; }
  .footer-col li { margin-bottom: 0.55rem; }
  .footer-col a { color: #818cf8; text-decoration: none; display: inline-block; padding: 2px 0; }
  .footer-col a:hover { color: #a5b4fc; text-decoration: underline; }
  .footer-bottom {
    border-top: 1px solid #1e293b;
    padding-top: 1.5rem;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    color: #94a3b8;
  }
`;

export function buildBreadcrumbSchema(items: BreadcrumbItem[]): any {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${items[items.length - 1].url}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function renderBreadcrumbsHtml(items: BreadcrumbItem[]): string {
  const html = items
    .map((item, index) => {
      if (index === items.length - 1) {
        return `<span>${item.name}</span>`;
      }
      return `<a href="${item.url}">${item.name}</a><span class="separator">/</span>`;
    })
    .join(' ');
  return `<nav class="breadcrumbs" aria-label="Breadcrumb">${html}</nav>`;
}

export function buildPageHtml(meta: PageMeta): string {
  const graphNodes = meta.jsonLd.flatMap((item) => (item['@graph'] ? item['@graph'] : item));

  const jsonLdScript = `<script type="application/ld+json">\n${JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@graph': graphNodes,
    },
    null,
    2
  )}\n</script>`;

  return `<!doctype html>
<html lang="en-IN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${meta.title}</title>
    <meta name="description" content="${meta.description}" />
    <link rel="canonical" href="${meta.canonical}" />
    
    <!-- OpenGraph & Social Metadata -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="JustClub" />
    <meta property="og:locale" content="en_IN" />
    <meta property="og:title" content="${meta.title}" />
    <meta property="og:description" content="${meta.description}" />
    <meta property="og:url" content="${meta.canonical}" />
    <meta property="og:image" content="${AVATAR_URL}" />
    <meta property="og:image:alt" content="JustClub Multi-Game Club POS Software" />
    
    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@justclubindia" />
    <meta name="twitter:creator" content="@justclubindia" />
    <meta name="twitter:title" content="${meta.title}" />
    <meta name="twitter:description" content="${meta.description}" />
    <meta name="twitter:image" content="${AVATAR_URL}" />
    
    <!-- Favicon & Icons -->
    <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
    <link rel="icon" type="image/png" sizes="192x192" href="/pwa-192x192.png" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="shortcut icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    
    <!-- Fonts (Non-blocking font loading strategy) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap" media="print" onload="this.media='all'">
    <noscript>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap">
    </noscript>
    
    <!-- JSON-LD Structured Data (@graph) -->
    ${jsonLdScript}

    <style>${sharedStyles}</style>
  </head>
  <body>
    <header>
      <div class="header-inner">
        <a href="/" class="brand-logo">
          <span><span class="highlight">just</span>club</span>
          <span class="badge">OS</span>
        </a>
        <nav class="header-nav" aria-label="Main Navigation">
          <a href="/club-management-software/">Solutions</a>
          <a href="/snooker-software-india/">India Hub</a>
          <a href="/locations/india/bangalore/">Locations</a>
          <a href="/tools/snooker-club-profit-calculator/">Calculators</a>
          <a href="/resources/">Resources</a>
          <a href="/compare/">Compare</a>
        </nav>
        <a href="/#pricing" class="cta-btn">Start 15-day free trial</a>
      </div>
    </header>

    <main class="container">
      ${meta.contentHtml}
    </main>

    <footer>
      <div class="container">
        <div class="footer-grid">
          <div class="footer-col">
            <a href="/" class="brand-logo" style="margin-bottom: 0.75rem;">
              <span><span class="highlight">just</span>club</span>
              <span class="badge">OS</span>
            </a>
            <p style="font-size: 0.875rem; color: #94a3b8; margin-bottom: 0.75rem;">
              The complete operating system for snooker clubs, billiards parlors, pool lounges, and multi-game entertainment venues across India.
            </p>
            <p style="font-size: 0.8rem; color: #64748b;">
              Operated by Rajaganapathy Kamalakannan.
            </p>
          </div>

          <div class="footer-col">
            <nav aria-label="Solutions">
              <h4>Software &amp; POS</h4>
              <ul>
                <li><a href="/club-management-software/">Club Management Software</a></li>
                <li><a href="/snooker-club-management-software/">Snooker Club Software</a></li>
                <li><a href="/billiards-club-management-software/">Billiards Club Software</a></li>
                <li><a href="/pool-club-management-software/">Pool Club Software</a></li>
                <li><a href="/gaming-club-management-software/">Gaming Lounge Software</a></li>
                <li><a href="/snooker-table-timer/">Snooker Table Timer</a></li>
                <li><a href="/club-pos-software/">Club POS Software</a></li>
                <li><a href="/club-membership-software/">Club Membership Software</a></li>
              </ul>
            </nav>
          </div>

          <div class="footer-col">
            <nav aria-label="Locations">
              <h4>India Hub &amp; Cities</h4>
              <ul>
                <li><a href="/snooker-software-india/">Snooker Software India</a></li>
                <li><a href="/locations/india/bangalore/">Bangalore Snooker POS</a></li>
                <li><a href="/locations/india/chennai/">Chennai Snooker POS</a></li>
                <li><a href="/locations/india/coimbatore/">Coimbatore Snooker POS</a></li>
                <li><a href="/locations/india/hyderabad/">Hyderabad Snooker POS</a></li>
                <li><a href="/locations/india/mumbai/">Mumbai Snooker POS</a></li>
                <li><a href="/locations/india/delhi/">Delhi NCR Snooker POS</a></li>
                <li><a href="/locations/india/pune/">Pune Snooker POS</a></li>
                <li><a href="/locations/india/kolkata/">Kolkata Snooker POS</a></li>
              </ul>
            </nav>
          </div>

          <div class="footer-col">
            <nav aria-label="Tools & Resources">
              <h4>Tools &amp; Resources</h4>
              <ul>
                <li><a href="/tools/snooker-club-profit-calculator/">Profit Calculator</a></li>
                <li><a href="/tools/snooker-table-revenue-calculator/">Table Revenue Calculator</a></li>
                <li><a href="/tools/snooker-club-break-even-calculator/">Break-Even Estimator</a></li>
                <li><a href="/resources/how-to-start-a-snooker-club-in-india/">How to Start a Club (India)</a></li>
                <li><a href="/resources/snooker-table-pricing-guide/">Table Pricing Guide</a></li>
                <li><a href="/resources/snooker-club-management-guide/">Club Management Guide</a></li>
                <li><a href="/snooker-club-software-buyers-guide/">Buyer's Evaluation Guide</a></li>
                <li><a href="/how-to-bill-snooker-table-time/">Table Time Billing Guide</a></li>
                <li><a href="/compare/">Competitor Comparisons</a></li>
              </ul>
            </nav>
          </div>

          <div class="footer-col">
            <nav aria-label="Company & Legal">
              <h4>Trust &amp; Legal</h4>
              <ul>
                <li><a href="/about/">About JustClub</a></li>
                <li><a href="/privacy/">Privacy Policy</a></li>
                <li><a href="/terms/">Terms of Service</a></li>
                <li><a href="/refund/">Refund Policy</a></li>
                <li><a href="/contact/">Contact &amp; Support</a></li>
                <li><a href="https://www.instagram.com/justclub.in/" target="_blank" rel="noopener noreferrer">Instagram (@justclub.in)</a></li>
                <li><a href="https://www.youtube.com/@Justclubindia" target="_blank" rel="noopener noreferrer">YouTube Channel</a></li>
              </ul>
            </nav>
          </div>
        </div>

        <div class="footer-bottom">
          <div>© 2026 JustClub. Operated by Rajaganapathy Kamalakannan. All Rights Reserved.</div>
          <div>Last Updated: ${LAST_UPDATED}</div>
        </div>
      </div>
    </footer>
  </body>
</html>`;
}
