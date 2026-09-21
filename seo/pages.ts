/**
 * SEO & GEO Static Landing Pages Generator for JustClub
 * Contains static HTML templates for keyword landing pages, guide pages, trust pages, 404, and sitemap.
 */

export interface PageMeta {
  slug: string;
  title: string;
  description: string;
  canonical: string;
  h1: string;
  jsonLd: any[];
  contentHtml: string;
}

const BASE_URL = 'https://justclub.in';
const AVATAR_URL = `${BASE_URL}/justclub-avatar.jpg`;
const LOGO_URL = `${BASE_URL}/justclub-launcher-512.png`;
const LAST_UPDATED = 'September 20, 2026';

// TODO_CONFIRM: mailbox exists and is monitored
export const SUPPORT_EMAIL = 'support@justclub.in';

// Standard Organization node for JSON-LD @graph cross-referencing
const ORG_NODE = {
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
  // TODO_CONFIRM: Add official social media profiles to sameAs array once established
};

const WEBSITE_NODE = {
  '@type': 'WebSite',
  '@id': `${BASE_URL}/#website`,
  name: 'JustClub',
  url: BASE_URL,
  inLanguage: 'en-IN',
  publisher: {
    '@id': `${BASE_URL}/#organization`,
  },
};

// SoftwareApplication node note: Included for entity clarity. Not eligible for Google software rich results as those require reviews/ratings.
const SOFTWARE_NODE = {
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

const sharedStyles = `
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
  .hero-card {
    padding: 3rem 0 2rem 0;
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
    font-size: 2.25rem;
    font-weight: 900;
    line-height: 1.2;
    color: #ffffff;
    margin-bottom: 1.25rem;
    letter-spacing: -0.02em;
  }
  @media (min-width: 640px) { h1 { font-size: 2.75rem; } }
  .quick-answer {
    background: #0f172a;
    border-left: 4px solid #635bff;
    border-radius: 0 0.75rem 0.75rem 0;
    padding: 1.25rem 1.5rem;
    margin-bottom: 2.5rem;
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
    font-size: 1.5rem;
    font-weight: 800;
    color: #ffffff;
    margin: 2.5rem 0 1rem 0;
    letter-spacing: -0.01em;
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
  
  footer {
    border-top: 1px solid #1e293b;
    background: #050811;
    padding: 3rem 0 2rem 0;
    font-size: 0.875rem;
    color: #94a3b8;
  }
  .footer-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
  }
  @media (min-width: 640px) { .footer-grid { grid-template-columns: 1.8fr 1.1fr 1.1fr 1fr; } }
  .footer-col h4 {
    color: #f1f5f9;
    font-size: 0.9rem;
    margin-bottom: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .footer-col ul { list-style: none; padding-left: 0; margin-bottom: 0; }
  .footer-col li { margin-bottom: 0.6rem; }
  .footer-col a { color: #818cf8; text-decoration: none; display: inline-block; padding: 3px 0; }
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

function buildPageHtml(meta: PageMeta): string {
  // Flattens all graph nodes into a single standardized @graph array
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
              The complete operating system for snooker clubs, gaming lounges, pool parlors, and multi-game entertainment venues across India.
            </p>
            <p style="font-size: 0.8rem; color: #64748b;">
              Operated by Rajaganapathy Kamalakannan.
            </p>
          </div>

          <div class="footer-col">
            <nav aria-label="Solutions">
              <h4>Solutions</h4>
              <ul>
                <li><a href="/snooker-billiards-club-software/">Snooker &amp; Billiards POS</a></li>
                <li><a href="/gaming-cafe-lounge-software/">Gaming Cafe &amp; PS5 POS</a></li>
                <li><a href="/club-credit-khata-ledger-software/">Customer Khata Ledger</a></li>
              </ul>
            </nav>
          </div>

          <div class="footer-col">
            <nav aria-label="Guides & Resources">
              <h4>Guides &amp; Resources</h4>
              <ul>
                <li><a href="/snooker-club-software-buyers-guide/">Snooker Buyer's Guide</a></li>
                <li><a href="/how-to-bill-snooker-table-time/">Table Time Billing Guide</a></li>
              </ul>
            </nav>
          </div>

          <div class="footer-col">
            <nav aria-label="Company & Legal">
              <h4>Legal &amp; Trust</h4>
              <ul>
                <li><a href="/about/">About JustClub</a></li>
                <li><a href="/privacy/">Privacy Policy</a></li>
                <li><a href="/terms/">Terms of Service</a></li>
                <li><a href="/refund/">Refund Policy</a></li>
                <li><a href="/contact/">Contact &amp; Support</a></li>
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

// -----------------------------------------------------------------------------
// KEYWORD PAGE 1: Snooker & Billiards Club Software
// -----------------------------------------------------------------------------
export const snookerPage: PageMeta = {
  slug: 'snooker-billiards-club-software',
  title: 'Snooker Club Software: Table Timers & Billing | JustClub',
  description: 'Snooker and billiards club software in India. Live table timers, 1v1 loser-pays split billing, dynamic UPI QR codes & khata credit ledger. 15-day free trial.',
  canonical: `${BASE_URL}/snooker-billiards-club-software/`,
  h1: 'Snooker & Billiards Club Management Software',
  jsonLd: [
    ORG_NODE,
    WEBSITE_NODE,
    SOFTWARE_NODE,
    {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/snooker-billiards-club-software/#webpage`,
      url: `${BASE_URL}/snooker-billiards-club-software/`,
      name: 'Snooker & Billiards Club Management Software',
      description: 'Cloud POS and table timer management software for snooker, billiards, and pool clubs in India.',
      isPartOf: { '@id': `${BASE_URL}/#website` },
      breadcrumb: { '@id': `${BASE_URL}/snooker-billiards-club-software/#breadcrumb` },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${BASE_URL}/snooker-billiards-club-software/#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Snooker & Billiards Club Software', item: `${BASE_URL}/snooker-billiards-club-software/` },
      ],
    },
  ],
  contentHtml: `
    <article class="hero-card">
      <span class="meta-tag">Cue Sports Operations</span>
      <h1>Snooker & Billiards Club Management Software</h1>
      
      <div class="quick-answer">
        <strong>Quick answer:</strong> JustClub is a cloud-based operating system for snooker and billiards clubs that automates live table timers, precision per-minute billing, 1v1 loser-pays match splits, café POS order integration, and WhatsApp UPI payment links without requiring dedicated timer hardware.
      </div>

      <div class="author-attribution">
        <span>Published by <strong>JustClub Team</strong></span>
        <span>•</span>
        <span>Last updated: <strong>${LAST_UPDATED}</strong></span>
      </div>

      <p>
        Running a busy snooker club or pool parlor requires tracking dozens of simultaneous tables, managing hourly table tariffs, splitting bills across players, and logging café snack orders. Manual record-keeping leads to unbilled session minutes, disputed match settlements, and lost revenue. JustClub provides an all-in-one browser POS and PWA that transforms your phone, tablet, or desktop into an authoritative club control center.
      </p>

      <h2>How do live table timers and billing modes work?</h2>
      <p>
        Every snooker, pool, and billiards table in your venue receives a real-time digital timer with pause, resume, and shift capabilities. Venue operators can choose between two flexible billing modes based on club house rules:
      </p>
      <ul>
        <li><strong>Exact-Minute Pro-Rata Billing:</strong> Calculates charges down to the exact second spent playing, ensuring mathematical accuracy and full customer trust.</li>
        <li><strong>15-Minute Block Rounding:</strong> Automatically rounds up session durations to the next 15-minute increment (for example, an 80-minute match rounds to 90 minutes).</li>
      </ul>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Billing Mode</th>
              <th>How Time Is Calculated</th>
              <th>Best Used For</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Exact-Minute Pro-Rata</strong></td>
              <td>Pro-rata charges computed to the exact elapsed minutes</td>
              <td>High-end tournament tables, transparent walk-in billing</td>
            </tr>
            <tr>
              <td><strong>15-Minute Blocks</strong></td>
              <td>Elapsed time rounded up to the nearest 15-minute slot</td>
              <td>Standard cue sport club sessions, peak-hour management</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="example-box">
        <div class="tag">Example</div>
        <p style="margin-bottom: 0;">
          For a table with an hourly rate of <strong>Rs 300/hr</strong> and a <strong>1h20m (80-minute)</strong> match:<br />
          • Under <strong>Exact-Minute Billing</strong>: Total charge = <strong>₹400</strong> (80 / 60 × Rs 300).<br />
          • Under <strong>15-Minute Block Rounding</strong>: Total charge = <strong>₹450</strong> (80 minutes rounds up to 90 minutes = 1.5 hrs × Rs 300).
        </p>
      </div>

      <h2>How does player split billing work for cue sports?</h2>
      <p>
        Snooker and pool matches are competitive, and players frequently agree on specific payout rules before starting a frame. JustClub supports automatic multi-player splitting rules:
      </p>
      <ul>
        <li><strong>1v1 Equal & 1v1 Loser-Pays:</strong> Split the table fee 50-50 or assign the entire amount to the losing player with a single tap.</li>
        <li><strong>2v2 Equal & 2v2 Loser-Pays:</strong> Assign the bill to the losing pair or distribute it equally across all four players.</li>
        <li><strong>Group Equal:</strong> Evenly divide the total session tariff among all tagged players.</li>
        <li><strong>Attached Café Tab:</strong> Drinks, Red Bulls, and snacks ordered during the frame can be attached to the running table with custom splits among selected players.</li>
      </ul>

      <h2>How are payments collected via WhatsApp and UPI?</h2>
      <p>
        Once a frame concludes, JustClub generates a dynamic UPI QR code on screen for instant counter scanning. The cashier can also dispatch a personalized WhatsApp payment link directly to the customer's phone number containing the itemized invoice and a 1-click UPI deep link.
      </p>

      <h2>Deep Dive & Industry Resources</h2>
      <p>
        For a comprehensive evaluation checklist when selecting club software, read our <a href="/snooker-club-software-buyers-guide/">Snooker &amp; Gaming Lounge Software Buyer's Guide</a>. To learn more about calculating table revenue, see our guide on <a href="/how-to-bill-snooker-table-time/">how to bill snooker table time using exact vs block models</a>.
      </p>

      <div class="faq-section">
        <h2>Frequently Asked Questions about Snooker Club Software</h2>
        
        <div class="faq-item">
          <h3>Do I need specialized hardware or table light controllers to use JustClub?</h3>
          <p>No. JustClub runs entirely in any modern web browser and installs as a Progressive Web App (PWA) on tablets, mobile phones, or desktop PCs. No proprietary hardware or timer boxes are required.</p>
        </div>

        <div class="faq-item">
          <h3>Can I attach drinks and snack orders directly to a running snooker table?</h3>
          <p>Yes. JustClub includes an integrated café and bar POS. Orders added to a running table automatically decrement stock in your inventory ledger and roll up into the final unified invoice.</p>
        </div>

        <div class="faq-item">
          <h3>How does customer credit (khata) management work for regular players?</h3>
          <p>If a member or regular player prefers to settle weekly or monthly, their balance can be added to their personal khata ledger with lifetime visit tracking and 1-click WhatsApp payment reminders.</p>
        </div>

        <div class="faq-item">
          <h3>What happens if a match is temporarily paused?</h3>
          <p>Cashiers can pause active table timers with one click during maintenance, practice pauses, or prayer breaks. JustClub tracks total paused duration and excludes it from the final bill.</p>
        </div>

        <div class="faq-item">
          <h3>How much does JustClub cost after the trial?</h3>
          <p>JustClub offers a 15-day free trial with no credit card required. Paid plans start at Monthly Rs 499, Quarterly Rs 1,299 (about Rs 433/mo), and Yearly Rs 4,499 (about Rs 375/mo).</p>
        </div>
      </div>

      <div class="cta-banner">
        <h2>Modernize Your Snooker Club Today</h2>
        <p>Start tracking tables, automating player match splits, and speeding up counter checkout with JustClub.</p>
        <a href="/#pricing" class="cta-btn">Start 15-day free trial</a>
      </div>
    </article>
  `,
};

// -----------------------------------------------------------------------------
// KEYWORD PAGE 2: Gaming Cafe & PS5 Lounge Billing Software
// -----------------------------------------------------------------------------
export const gamingCafePage: PageMeta = {
  slug: 'gaming-cafe-lounge-software',
  title: 'Gaming Cafe & PS5 Lounge Billing Software | JustClub',
  description: 'Billing software for gaming cafes & PS5 lounges in India. Station timers for PC, VR, consoles, table tennis & karaoke with café POS. 15-day free trial.',
  canonical: `${BASE_URL}/gaming-cafe-lounge-software/`,
  h1: 'Gaming Cafe & PS5 Lounge Billing Software',
  jsonLd: [
    ORG_NODE,
    WEBSITE_NODE,
    SOFTWARE_NODE,
    {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/gaming-cafe-lounge-software/#webpage`,
      url: `${BASE_URL}/gaming-cafe-lounge-software/`,
      name: 'Gaming Cafe & PS5 Lounge Billing Software',
      description: 'Multi-category billing and station timer management software for PlayStation 5 lounges, PC gaming cafes, VR pods, karaoke suites, and entertainment clubs in India.',
      isPartOf: { '@id': `${BASE_URL}/#website` },
      breadcrumb: { '@id': `${BASE_URL}/gaming-cafe-lounge-software/#breadcrumb` },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${BASE_URL}/gaming-cafe-lounge-software/#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Gaming Cafe & PS5 Lounge Billing Software', item: `${BASE_URL}/gaming-cafe-lounge-software/` },
      ],
    },
  ],
  contentHtml: `
    <article class="hero-card">
      <span class="meta-tag">Multi-Game Entertainment Lounges</span>
      <h1>Gaming Cafe & PS5 Lounge Billing Software</h1>
      
      <div class="quick-answer">
        <strong>Quick answer:</strong> JustClub is a unified gaming lounge POS and station timer system that manages PlayStation 5 booths, PC gaming rigs, VR pods, table tennis, karaoke suites, darts lanes, and board games with custom rate cards, café inventory, and instant UPI split billing.
      </div>

      <div class="author-attribution">
        <span>Published by <strong>JustClub Team</strong></span>
        <span>•</span>
        <span>Last updated: <strong>${LAST_UPDATED}</strong></span>
      </div>

      <p>
        Modern gaming lounges and entertainment cafes offer multiple game types under one roof: console booths, high-spec eSports PC rigs, virtual reality pods, table tennis tables, private karaoke rooms, darts lanes, and board game tables. Managing different billing rules across diverse game categories with spreadsheets or separate timer apps creates confusion at checkout. JustClub unifies every station into a single live floor dashboard.
      </p>

      <h2>Which game categories and rate cards are supported?</h2>
      <p>
        JustClub is purpose-built to handle the unique pricing mechanics of 10 distinct entertainment categories:
      </p>
      <ul>
        <li><strong>PlayStation & Xbox:</strong> Station billing with controller count adjustments for 1v1, 2v2, or 4-player multiplayer sessions.</li>
        <li><strong>PC Gaming & eSports Rigs:</strong> Individual hourly rig timers with custom day and night pass tariffs.</li>
        <li><strong>Virtual Reality (VR):</strong> 15-minute slot timers with headset safety alerts and multiplayer arena tracking.</li>
        <li><strong>Table Tennis (Ping Pong):</strong> Per-table hourly billing with equipment rental tracking.</li>
        <li><strong>Karaoke Private Suites:</strong> Hourly package billing combining room size tier and guest count parameters.</li>
        <li><strong>Darts Lanes:</strong> Electronic and steel-tip lane rentals with hourly billing.</li>
        <li><strong>Board Game Lounges:</strong> Flexible billing supporting either a per-player cover charge or a flat table hourly rate.</li>
      </ul>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Game Category</th>
              <th>Billing Model</th>
              <th>Special Mechanics</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>PlayStation / Console</strong></td>
              <td>Hourly Station Tariff</td>
              <td>Controller scaling (1v1, 2v2, 4-player)</td>
            </tr>
            <tr>
              <td><strong>PC Gaming Arena</strong></td>
              <td>Per-Rig Metering</td>
              <td>Exact-minute or 15-min slot blocks</td>
            </tr>
            <tr>
              <td><strong>Karaoke Rooms</strong></td>
              <td>Room Size + Hourly Rate</td>
              <td>Guest count capacity + food combos</td>
            </tr>
            <tr>
              <td><strong>Board Games</strong></td>
              <td>Per-Player Cover / Flat Table</td>
              <td>Cover charge or hourly rental option</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="example-box">
        <div class="tag">Example</div>
        <p style="margin-bottom: 0;">
          For a PS5 lounge booth priced at <strong>Rs 300/hr</strong> where players play for <strong>1h20m (80 minutes)</strong>:<br />
          • Under <strong>Exact-Minute Billing</strong>: Total station cost = <strong>₹400</strong> (80 / 60 × Rs 300).<br />
          • Under <strong>15-Minute Block Rounding</strong>: Total station cost = <strong>₹450</strong> (80 min rounds up to 90 min = 1.5 hrs × Rs 300).
        </p>
      </div>

      <h2>How does the integrated café and snack POS function?</h2>
      <p>
        Gamers frequently order energy drinks, frappes, nachos, and fries during long sessions. JustClub allows venue staff to attach food and beverage items directly to any active gaming station or run quick walk-in orders. As items are sold, the inventory ledger decrements stock in real time, preventing inventory shrinkage.
      </p>

      <h2>Can multi-player groups split the console and food bill?</h2>
      <p>
        Yes. When ending a group gaming session, JustClub enables split billing across all tagged players (1v1 equal, 1v1 loser-pays, 2v2 equal, 2v2 loser-pays, or group equal, plus custom splits for café tabs). Each player's share is calculated automatically, complete with individual UPI QR codes and WhatsApp payment receipts.
      </p>

      <h2>Helpful Resources & Guides</h2>
      <p>
        Setting up a new lounge? Consult our <a href="/snooker-club-software-buyers-guide/">Gaming Lounge Software Buyer's Guide</a> to evaluate key features and hardware requirements. Compare station billing strategies in our guide to <a href="/how-to-bill-snooker-table-time/">per-minute and block table billing</a>.
      </p>

      <div class="faq-section">
        <h2>Frequently Asked Questions about Gaming Cafe Software</h2>
        
        <div class="faq-item">
          <h3>Can JustClub manage multiple consoles and PC stations simultaneously?</h3>
          <p>Yes. JustClub provides a real-time live floor control center that monitors all active stations, remaining session times, paused states, and attached snack tabs on a single screen.</p>
        </div>

        <div class="faq-item">
          <h3>Does the software support both per-table and per-person board game billing?</h3>
          <p>Yes. Board game cafes can configure either a per-player cover charge or a flat hourly table rental rate according to house preference.</p>
        </div>

        <div class="faq-item">
          <h3>Can I run JustClub on an iPad or Android tablet at the counter?</h3>
          <p>Yes. JustClub is a Progressive Web App (PWA) that installs on iOS, iPadOS, Android, Windows, and macOS without requiring server installations or app store downloads.</p>
        </div>

        <div class="faq-item">
          <h3>How does customer credit and membership ledger work?</h3>
          <p>JustClub includes a built-in khata ledger that records member deposits, outstanding balances, visit histories, and lifetime spend with one-click WhatsApp payment reminders.</p>
        </div>

        <div class="faq-item">
          <h3>What are the pricing plans for gaming lounges?</h3>
          <p>JustClub includes a 15-day free trial with no credit card required. Subscriptions are Monthly Rs 499, Quarterly Rs 1,299 (about Rs 433/mo), and Yearly Rs 4,499 (about Rs 375/mo).</p>
        </div>
      </div>

      <div class="cta-banner">
        <h2>Streamline Your Gaming Lounge POS</h2>
        <p>Manage all your console booths, PC rigs, VR pods, and café sales from one browser application.</p>
        <a href="/#pricing" class="cta-btn">Start 15-day free trial</a>
      </div>
    </article>
  `,
};

// -----------------------------------------------------------------------------
// KEYWORD PAGE 3: Club Credit Khata & Customer Ledger Software
// -----------------------------------------------------------------------------
export const khataPage: PageMeta = {
  slug: 'club-credit-khata-ledger-software',
  title: 'Club Credit Khata & Customer Ledger Software | JustClub',
  description: 'Customer khata ledger software for gaming clubs & snooker lounges in India. Track customer visits, credit balances & WhatsApp payment links. 15-day free trial.',
  canonical: `${BASE_URL}/club-credit-khata-ledger-software/`,
  h1: 'Club Credit Khata & Customer Ledger Software',
  jsonLd: [
    ORG_NODE,
    WEBSITE_NODE,
    SOFTWARE_NODE,
    {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/club-credit-khata-ledger-software/#webpage`,
      url: `${BASE_URL}/club-credit-khata-ledger-software/`,
      name: 'Club Credit Khata & Customer Ledger Software',
      description: 'Digital khata ledger and customer CRM software for gaming clubs, snooker venues, and entertainment parlors in India.',
      isPartOf: { '@id': `${BASE_URL}/#website` },
      breadcrumb: { '@id': `${BASE_URL}/club-credit-khata-ledger-software/#breadcrumb` },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${BASE_URL}/club-credit-khata-ledger-software/#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Club Credit Khata & Customer Ledger Software', item: `${BASE_URL}/club-credit-khata-ledger-software/` },
      ],
    },
  ],
  contentHtml: `
    <article class="hero-card">
      <span class="meta-tag">Customer CRM & Credit Ledger</span>
      <h1>Club Credit Khata & Customer Ledger Software</h1>
      
      <div class="quick-answer">
        <strong>Quick answer:</strong> JustClub is a digital credit ledger (khata) and customer CRM designed specifically for snooker clubs and gaming lounges that logs player visit history, tracks outstanding credit tabs, calculates lifetime customer value, and sends automated WhatsApp payment reminders with dynamic UPI links.
      </div>

      <div class="author-attribution">
        <span>Published by <strong>JustClub Team</strong></span>
        <span>•</span>
        <span>Last updated: <strong>${LAST_UPDATED}</strong></span>
      </div>

      <p>
        Regular players and club members rarely pay after every single frame or gaming session. Instead, clubs extend informal credit tabs (udhar or khata) that are settled weekly or monthly. Keeping track of credit on paper notebooks or generic billing apps leads to missing records, forgotten balances, and awkward payment collection. JustClub digitizes your club's customer khata into an automated ledger tied directly to table timers and POS receipts.
      </p>

      <h2>How does the club khata credit ledger work?</h2>
      <p>
        Every customer profile in JustClub maintains an audit-proof debit and credit ledger. When a session ends, the cashier can settle the bill immediately via cash or UPI, or post the balance directly to the customer's account with one click:
      </p>
      <ul>
        <li><strong>Unpaid Session Posting:</strong> Add game time, bar orders, or tournament entry fees straight to the customer's ledger balance.</li>
        <li><strong>Advance Credit Balances:</strong> Members can maintain advance credit in their ledger, which is displayed and usable at checkout.</li>
        <li><strong>Lifetime Value & Visit Tracking:</strong> View total club visits, favorite games, and total lifetime spend to identify VIP players.</li>
      </ul>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Ledger Feature</th>
              <th>Traditional Paper Khata</th>
              <th>JustClub Digital Khata</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Bill Attachment</strong></td>
              <td>Manual entry prone to missing minutes</td>
              <td>Automatic link to live timer & itemized invoice</td>
            </tr>
            <tr>
              <td><strong>Payment Collection</strong></td>
              <td>Awkward manual phone calls</td>
              <td>1-click WhatsApp payment reminders with UPI QR</td>
            </tr>
            <tr>
              <td><strong>Audit & Balance History</strong></td>
              <td>Disputed handwritten entries</td>
              <td>Timestamped credit/debit transaction trail</td>
            </tr>
            <tr>
              <td><strong>Analytics & LTV</strong></td>
              <td>None</td>
              <td>Real-time customer lifetime value & visit metrics</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="example-box">
        <div class="tag">Example</div>
        <p style="margin-bottom: 0;">
          A regular player finishes an <strong>80-minute (1h20m)</strong> snooker session on a <strong>Rs 300/hr</strong> table:<br />
          • With <strong>Exact-Minute Billing</strong>: ₹400 is posted to the player's khata.<br />
          • With <strong>15-Minute Block Rounding</strong>: 80 min rounds to 90 min (₹450) posted to the player's khata.<br />
          • The cashier clicks "Send WhatsApp Reminder" to dispatch the breakdown and UPI link directly to the player.
        </p>
      </div>

      <h2>How are WhatsApp debt reminders dispatched?</h2>
      <p>
        JustClub eliminates the friction of collecting overdue balances. With a single tap, the platform prepares a courteous WhatsApp reminder containing the member's outstanding balance, a summary of recent sessions, and a pre-configured UPI payment link. Customers can tap and pay instantly using GPay, PhonePe, or Paytm.
      </p>

      <h2>Further Reading</h2>
      <p>
        Learn how table timers and credit khata ledgers fit into your broader venue strategy in our <a href="/snooker-club-software-buyers-guide/">Snooker &amp; Gaming POS Buyer's Guide</a>. See how split billing and credit tabs combine with <a href="/how-to-bill-snooker-table-time/">per-minute and block table billing</a>.
      </p>

      <div class="faq-section">
        <h2>Frequently Asked Questions about Club Khata Software</h2>
        
        <div class="faq-item">
          <h3>Can I send payment reminders to customers via WhatsApp?</h3>
          <p>Yes. JustClub generates 1-click WhatsApp payment messages with deep-linked UPI URLs so customers can settle balances directly through PhonePe, Google Pay, or Paytm.</p>
        </div>

        <div class="faq-item">
          <h3>Can members maintain advance credit balances (wallets)?</h3>
          <p>Yes. Members can maintain advance credit balances in their club ledger, and available credit is shown and usable at checkout.</p>
        </div>

        <div class="faq-item">
          <h3>Is customer data kept private and secure?</h3>
          <p>Yes. Customer phone numbers, ledger records, and visit logs are encrypted and accessible only by authorized club staff members.</p>
        </div>

        <div class="faq-item">
          <h3>Does JustClub require an internet connection to run timers?</h3>
          <p>JustClub is a Progressive Web App (PWA) with intelligent local state management that keeps timers and session logs active even during brief network interruptions.</p>
        </div>

        <div class="faq-item">
          <h3>What are the subscription rates for JustClub?</h3>
          <p>JustClub provides a 15-day free trial with no credit card required. Subscription plans are Monthly Rs 499, Quarterly Rs 1,299 (about Rs 433/mo), and Yearly Rs 4,499 (about Rs 375/mo).</p>
        </div>
      </div>

      <div class="cta-banner">
        <h2>Take Control of Your Club Customer Ledger</h2>
        <p>Eliminate paper notebooks, track credit balances, and automate WhatsApp collections with JustClub.</p>
        <a href="/#pricing" class="cta-btn">Start 15-day free trial</a>
      </div>
    </article>
  `,
};

// -----------------------------------------------------------------------------
// NEW GUIDE PAGE 1: Snooker & Gaming Lounge Software Buyer's Guide
// -----------------------------------------------------------------------------
export const snookerGuidePage: PageMeta = {
  slug: 'snooker-club-software-buyers-guide',
  title: "Snooker Club Software Buyer's Guide | JustClub",
  description: 'How to choose snooker & gaming lounge management software in India. Key features, billing modes, hardware needs & pricing evaluation. 15-day free trial.',
  canonical: `${BASE_URL}/snooker-club-software-buyers-guide/`,
  h1: "How to Choose Snooker & Gaming Lounge Software: Buyer's Guide",
  jsonLd: [
    ORG_NODE,
    WEBSITE_NODE,
    {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/snooker-club-software-buyers-guide/#webpage`,
      url: `${BASE_URL}/snooker-club-software-buyers-guide/`,
      name: "How to Choose Snooker & Gaming Lounge Software: Buyer's Guide",
      description: 'Comprehensive evaluation checklist for snooker club timers, split billing, café POS, UPI payment links, and pricing transparency.',
      isPartOf: { '@id': `${BASE_URL}/#website` },
      breadcrumb: { '@id': `${BASE_URL}/snooker-club-software-buyers-guide/#breadcrumb` },
    },
    {
      '@type': 'Article',
      '@id': `${BASE_URL}/snooker-club-software-buyers-guide/#article`,
      headline: "How to Choose Snooker & Gaming Lounge Software: Buyer's Guide",
      description: 'A practical, neutral guide for club owners selecting management software for snooker, pool, and gaming lounges in India.',
      image: LOGO_URL,
      author: { '@id': `${BASE_URL}/#organization` },
      publisher: { '@id': `${BASE_URL}/#organization` },
      datePublished: '2026-09-20',
      dateModified: '2026-09-20',
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}/snooker-club-software-buyers-guide/#webpage` },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${BASE_URL}/snooker-club-software-buyers-guide/#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: "Snooker Club Software Buyer's Guide", item: `${BASE_URL}/snooker-club-software-buyers-guide/` },
      ],
    },
  ],
  contentHtml: `
    <article class="hero-card">
      <span class="meta-tag">Buyer's Guide & Checklist</span>
      <h1>How to Choose Snooker & Gaming Lounge Software: Buyer's Guide</h1>
      
      <div class="quick-answer">
        <strong>Buyer's Checklist Summary:</strong> Selecting snooker and gaming lounge software in India requires evaluating precision live table timers, exact-minute vs block billing flexibility, 1v1 loser-pays split billing, attached café POS inventory, UPI QR payment generation, WhatsApp debt reminders, offline resilience, transparent pricing, and responsive support without hidden hardware locks.
      </div>

      <div class="author-attribution">
        <span>Published by <strong>JustClub Editorial Team</strong></span>
        <span>•</span>
        <span>Last updated: <strong>${LAST_UPDATED}</strong></span>
      </div>

      <p>
        Operating a snooker club, pool parlor, PS5 lounge, or gaming cafe involves managing simultaneous time-based game sessions, complex match tariffs, snack counter sales, and customer credit tabs. Traditional retail point-of-sale (POS) systems designed for simple retail stores fail to handle live timers or multi-player match splits. This buyer's guide breaks down the essential criteria every venue operator should evaluate when selecting club management software in India.
      </p>

      <h2>1. Why Specialized Software is Essential for Cue Sports and Gaming Lounges</h2>
      <p>
        Unlike traditional retail stores where products have fixed item prices, gaming lounges generate revenue primarily through time-based station rentals and attached food orders. Using paper logs or generic spreadsheets introduces several operational risks:
      </p>
      <ul>
        <li><strong>Unbilled Session Minutes:</strong> Unrecorded table time and forgotten extra minutes erode daily revenue.</li>
        <li><strong>Disputed Match Settlements:</strong> Manual calculations during 1v1 or 2v2 loser-pays matches frequently lead to arguments at the counter.</li>
        <li><strong>Inventory Shrinkage:</strong> Unlinked café and drink sales result in untracked stock losses.</li>
        <li><strong>Forgotten Member Khata:</strong> Informal credit tabs on loose paper leads to uncollected player debts.</li>
      </ul>

      <h2>2. Core Feature Evaluation Checklist</h2>
      <p>
        When reviewing software options for your venue, ensure the platform includes these essential capabilities:
      </p>
      <ul>
        <li><strong>Real-Time Live Timers:</strong> Visual floor status showing active tables, elapsed time, running charges, and pause/resume states.</li>
        <li><strong>Flexible Billing Modes:</strong> Ability to toggle between exact-minute pro-rata billing and 15-minute block rounding based on house rules.</li>
        <li><strong>Automated Split Billing:</strong> Pre-built splitting logic for 1v1 equal, 1v1 loser-pays, 2v2 equal, 2v2 loser-pays, and group equal splits.</li>
        <li><strong>Attached Café POS:</strong> Adding snacks and drinks directly to a running table tab with stock inventory decrementing in real time.</li>
        <li><strong>Digital Khata & CRM:</strong> Recording unpaid sessions to customer credit accounts with lifetime visit history and LTV metrics.</li>
        <li><strong>WhatsApp & UPI Collect:</strong> Generating dynamic UPI QR codes and sending 1-click WhatsApp payment reminders with deep links.</li>
      </ul>

      <h2>3. Feature Evaluation Matrix</h2>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>What to Look For</th>
              <th>Why It Matters</th>
              <th>How JustClub Handles It</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Live Station Timers</strong></td>
              <td>Prevents manual timer mistakes and unbilled minutes</td>
              <td>Browser & PWA timers with pause/resume and shift capabilities</td>
            </tr>
            <tr>
              <td><strong>Exact vs Block Billing</strong></td>
              <td>Matches house rules and table tariff policies</td>
              <td>Supports both exact-minute pro-rata and 15-min block rounding</td>
            </tr>
            <tr>
              <td><strong>Match Split Billing</strong></td>
              <td>Speeds up checkout for competitive cue sports</td>
              <td>1-click 1v1/2v2 loser-pays and group equal split engines</td>
            </tr>
            <tr>
              <td><strong>Café POS Integration</strong></td>
              <td>Protects food inventory and combines bills</td>
              <td>Real-time stock decrement and attached station tabs</td>
            </tr>
            <tr>
              <td><strong>Customer Khata Ledger</strong></td>
              <td>Eliminates paper udhar books and missing credits</td>
              <td>Digital debit/credit trail with 1-click WhatsApp reminders</td>
            </tr>
            <tr>
              <td><strong>Deployment Architecture</strong></td>
              <td>Avoids high upfront hardware costs</td>
              <td>Runs on existing PCs, tablets, and mobile phones as a PWA</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>4. Hardware Requirements & Deployment Architecture</h2>
      <p>
        Legacy club management software often required expensive light controller boxes, dedicated serial ports, or local server hardware. Modern cloud-native platforms like JustClub run directly inside any standard web browser (Chrome, Safari, Edge) and install as a Progressive Web App (PWA). This means you can run your entire club counter from an existing Windows PC, iPad, Android tablet, or smartphone without buying specialized hardware.
      </p>

      <h2>5. Pricing Transparency & Return on Investment</h2>
      <p>
        Evaluate software pricing structures carefully. Avoid solutions that charge per-transaction commission fees, lock you into multi-year contracts, or require mandatory hardware purchases. JustClub offers transparent pricing with no hidden fees:
      </p>
      <ul>
        <li><strong>15-Day Free Trial:</strong> Full platform access with zero credit card required.</li>
        <li><strong>Monthly Plan:</strong> ₹499/month for full POS, timer, and ledger features.</li>
        <li><strong>Quarterly Plan:</strong> ₹1,299/quarter (approx. ₹433/month).</li>
        <li><strong>Yearly Plan:</strong> ₹4,499/year (approx. ₹375/month).</li>
      </ul>

      <h2>Next Steps</h2>
      <p>
        To learn more about optimizing table billing rules, explore our detailed guide on <a href="/how-to-bill-snooker-table-time/">how to bill snooker table time using exact vs block rounding</a>, or review our specialized solutions for <a href="/snooker-billiards-club-software/">snooker clubs</a>, <a href="/gaming-cafe-lounge-software/">gaming cafes</a>, and <a href="/club-credit-khata-ledger-software/">customer khata ledgers</a>.
      </p>

      <div class="faq-section">
        <h2>Frequently Asked Questions</h2>
        
        <div class="faq-item">
          <h3>Do I need proprietary light box controllers to run JustClub?</h3>
          <p>No. JustClub is completely software-driven and operates in any browser or PWA on tablets, phones, or PCs without requiring hardware light controllers.</p>
        </div>

        <div class="faq-item">
          <h3>Can venue staff manage multiple game types on one screen?</h3>
          <p>Yes. JustClub provides a single live floor dashboard where staff can monitor snooker tables, PS5 booths, PC rigs, and VR pods simultaneously.</p>
        </div>

        <div class="faq-item">
          <h3>How does the 15-day free trial work?</h3>
          <p>You can sign up and test all features for 15 days completely free. No credit card or payment authorization is required to start your trial.</p>
        </div>
      </div>

      <div class="cta-banner">
        <h2>Evaluate JustClub Risk-Free Today</h2>
        <p>Set up your club tables and test live timers, split billing, and café POS with a 15-day free trial.</p>
        <a href="/#pricing" class="cta-btn">Start 15-day free trial</a>
      </div>
    </article>
  `,
};

// -----------------------------------------------------------------------------
// NEW GUIDE PAGE 2: How to Bill Snooker Table Time
// -----------------------------------------------------------------------------
export const billingGuidePage: PageMeta = {
  slug: 'how-to-bill-snooker-table-time',
  title: 'How to Bill Snooker Table Time: Exact vs Blocks | JustClub',
  description: 'Learn how to bill snooker & pool table time. Compare per-minute vs 15-minute block billing with worked examples, pause/resume & split rules. 15-day free trial.',
  canonical: `${BASE_URL}/how-to-bill-snooker-table-time/`,
  h1: 'How to Bill Snooker & Pool Table Time: Exact vs Block Billing',
  jsonLd: [
    ORG_NODE,
    WEBSITE_NODE,
    {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/how-to-bill-snooker-table-time/#webpage`,
      url: `${BASE_URL}/how-to-bill-snooker-table-time/`,
      name: 'How to Bill Snooker & Pool Table Time: Exact vs Block Billing',
      description: 'In-depth comparison of exact-minute vs 15-minute block table time billing with worked calculation examples, pause/resume rules, and split billing strategies.',
      isPartOf: { '@id': `${BASE_URL}/#website` },
      breadcrumb: { '@id': `${BASE_URL}/how-to-bill-snooker-table-time/#breadcrumb` },
    },
    {
      '@type': 'Article',
      '@id': `${BASE_URL}/how-to-bill-snooker-table-time/#article`,
      headline: 'How to Bill Snooker & Pool Table Time: Exact vs Block Billing',
      description: 'Practical guide to snooker and pool table billing calculations, rounding rules, pause mechanics, and multi-player split structures.',
      image: LOGO_URL,
      author: { '@id': `${BASE_URL}/#organization` },
      publisher: { '@id': `${BASE_URL}/#organization` },
      datePublished: '2026-09-20',
      dateModified: '2026-09-20',
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}/how-to-bill-snooker-table-time/#webpage` },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${BASE_URL}/how-to-bill-snooker-table-time/#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Table Time Billing Guide', item: `${BASE_URL}/how-to-bill-snooker-table-time/` },
      ],
    },
  ],
  contentHtml: `
    <article class="hero-card">
      <span class="meta-tag">Table Revenue & Billing Rules</span>
      <h1>How to Bill Snooker & Pool Table Time: Exact vs Block Billing</h1>
      
      <div class="quick-answer">
        <strong>Billing Method Summary:</strong> Snooker table time billing typically uses exact-minute calculation or fixed 15-minute block rounding. Exact-minute billing calculates the precise duration multiplied by hourly rates, while 15-minute block billing rounds partial intervals up to ensure full table revenue recovery, paired with split billing for multi-player games.
      </div>

      <div class="author-attribution">
        <span>Published by <strong>JustClub Editorial Team</strong></span>
        <span>•</span>
        <span>Last updated: <strong>${LAST_UPDATED}</strong></span>
      </div>

      <p>
        Setting clear, transparent table billing rules is fundamental to running a profitable snooker club or pool parlor. Venue owners must balance fair customer pricing with maximizing hourly table yield. This guide examines the two primary time calculation methods—per-minute exact billing and 15-minute block rounding—with worked examples, pause mechanics, and split billing rules.
      </p>

      <h2>1. Per-Minute Exact Billing vs 15-Minute Block Rounding</h2>
      <p>
        Depending on your venue's target clientele and local competitive environment, you can choose between two main billing models:
      </p>
      <ul>
        <li><strong>Exact-Minute Pro-Rata Billing:</strong> Charges players for the exact number of minutes played. For example, playing 42 minutes at ₹300/hr yields a pro-rata charge of exactly ₹210. This model is highly transparent and popular for tournament tables and regular walk-ins.</li>
        <li><strong>15-Minute Block Rounding:</strong> Rounds partial session times up to the next 15-minute interval (for instance, 1 minute to 15 minutes = 15 mins; 16 to 30 minutes = 30 mins). This ensures that table turnover overhead is factored into the session fee.</li>
      </ul>

      <h2>2. Worked Example: Comparing Exact-Minute and Block Billing</h2>
      <div class="example-box">
        <div class="tag">Example Calculation</div>
        <p style="margin-bottom: 0;">
          Consider a snooker table priced at an hourly tariff of <strong>Rs 300/hr</strong> (equivalent to Rs 5/minute or Rs 75 per 15-minute block). Two players finish an <strong>80-minute (1 hour 20 minute)</strong> match:<br /><br />
          • <strong>Method A: Exact-Minute Billing</strong><br />
          Elapsed duration: 80 minutes.<br />
          Calculation: (80 / 60) × Rs 300 = <strong>₹400 exact</strong>.<br /><br />
          • <strong>Method B: 15-Minute Block Rounding</strong><br />
          Elapsed duration: 80 minutes rounds up to 90 minutes (6 blocks of 15 minutes = 1.5 hours).<br />
          Calculation: 1.5 hours × Rs 300 = <strong>₹450</strong>.
        </p>
      </div>

      <h2>3. Pause/Resume Mechanics & Game Interruptions</h2>
      <p>
        During busy evening sessions, matches may experience temporary interruptions due to referee calls, ball replacement, prayer breaks, or equipment adjustments. JustClub allows cashiers to pause live table timers with a single tap. Paused time is tracked separately and excluded from the active billing tally, ensuring customers are never overcharged for non-playing minutes.
      </p>

      <h2>4. Split Billing Rules: 1v1 Loser-Pays vs Group Equal Split</h2>
      <p>
        In competitive cue sports, settling the table bill often involves split rules agreed upon by players prior to frame start:
      </p>
      <ul>
        <li><strong>1v1 Equal Split:</strong> Divides the table charge 50-50 between two players.</li>
        <li><strong>1v1 Loser-Pays:</strong> Assigns 100% of the table time bill to the losing player upon frame completion.</li>
        <li><strong>2v2 Equal & Loser-Pays:</strong> Splits the charge evenly among four players or assigns the total to the losing pair.</li>
        <li><strong>Group Equal Split:</strong> Evenly distributes the session total among all registered group members.</li>
        <li><strong>Café & Bar Split Rules:</strong> Snacks and drinks ordered during the match can either be split equally or charged to specific individuals.</li>
      </ul>

      <h2>5. Table Time Billing Strategy Matrix</h2>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Billing Model</th>
              <th>Recommended Usage</th>
              <th>Operator Benefit</th>
              <th>JustClub Automation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Exact-Minute Billing</strong></td>
              <td>Tournament tables, premium cue sports</td>
              <td>Maximum transparency, zero customer friction</td>
              <td>Automated pro-rata rate calculation per second</td>
            </tr>
            <tr>
              <td><strong>15-Minute Blocks</strong></td>
              <td>Standard club tables during peak hours</td>
              <td>Recovers turnover overhead on short games</td>
              <td>Automatic rounding up to 15m intervals</td>
            </tr>
            <tr>
              <td><strong>1v1 Loser-Pays Split</strong></td>
              <td>Competitive challenge frames</td>
              <td>Speeds up counter checkout for winner/loser</td>
              <td>1-tap assignment of total bill to loser profile</td>
            </tr>
            <tr>
              <td><strong>Attached Café Tab</strong></td>
              <td>Long gaming & snooker sessions</td>
              <td>Increases average order value per session</td>
              <td>Real-time food item rollup into final bill</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Explore Platform Capabilities</h2>
      <p>
        Discover how JustClub automates table timers, split billing, and customer khata ledgers by visiting our <a href="/snooker-billiards-club-software/">Snooker Club POS Page</a>, exploring our <a href="/snooker-club-software-buyers-guide/">Software Buyer's Guide</a>, or checking our <a href="/club-credit-khata-ledger-software/">Customer Khata Ledger Module</a>.
      </p>

      <div class="faq-section">
        <h2>Frequently Asked Questions</h2>
        
        <div class="faq-item">
          <h3>Which billing mode is recommended for new snooker clubs?</h3>
          <p>Most modern clubs use 15-minute block billing for general walk-in tables to recover turnover overhead, while offering exact-minute billing for regular members and tournament matches.</p>
        </div>

        <div class="faq-item">
          <h3>Can I attach café items to a table bill before splitting?</h3>
          <p>Yes. JustClub allows staff to attach snacks and drinks to an active table tab and apply custom split rules before generating UPI payment links.</p>
        </div>

        <div class="faq-item">
          <h3>How does pause/resume work during maintenance breaks?</h3>
          <p>Staff can tap 'Pause' on any active table timer. JustClub pauses the billing counter and resumes duration calculation only when 'Resume' is clicked.</p>
        </div>
      </div>

      <div class="cta-banner">
        <h2>Automate Table Billing with JustClub</h2>
        <p>Switch between exact-minute and block billing, automate player splits, and eliminate checkout friction.</p>
        <a href="/#pricing" class="cta-btn">Start 15-day free trial</a>
      </div>
    </article>
  `,
};

// -----------------------------------------------------------------------------
// TRUST PAGE 1: About JustClub
// -----------------------------------------------------------------------------
export const aboutPage: PageMeta = {
  slug: 'about',
  title: 'About JustClub — Multi-Game Club & Lounge OS',
  description: 'Learn about JustClub, the operating platform for snooker clubs, gaming cafes, and entertainment lounges across India. Operated by Rajaganapathy Kamalakannan.',
  canonical: `${BASE_URL}/about/`,
  h1: 'About JustClub',
  jsonLd: [
    ORG_NODE,
    WEBSITE_NODE,
    {
      '@type': 'AboutPage',
      '@id': `${BASE_URL}/about/#webpage`,
      url: `${BASE_URL}/about/`,
      name: 'About JustClub — Multi-Game Club & Lounge OS',
      description: 'The complete operating system for snooker clubs, gaming cafes, and entertainment lounges across India. Founded and operated by Rajaganapathy Kamalakannan.',
      isPartOf: { '@id': `${BASE_URL}/#website` },
      breadcrumb: { '@id': `${BASE_URL}/about/#breadcrumb` },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${BASE_URL}/about/#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'About JustClub', item: `${BASE_URL}/about/` },
      ],
    },
  ],
  contentHtml: `
    <article class="hero-card">
      <span class="meta-tag">Company & Vision</span>
      <h1>About JustClub</h1>

      <div class="quick-answer">
        <strong>Overview:</strong> JustClub is a cloud-based Software-as-a-Service (SaaS) operating platform founded and operated by Rajaganapathy Kamalakannan in Tamil Nadu, India, built to modernize table timing, split billing, café POS, and customer ledgers for multi-game clubs and gaming lounges.
      </div>

      <div class="author-attribution">
        <span>Published by <strong>JustClub Team</strong></span>
        <span>•</span>
        <span>Last updated: <strong>${LAST_UPDATED}</strong></span>
      </div>

      <h2>Our Mission</h2>
      <p>
        Snooker clubs, pool parlors, PC gaming cafes, PlayStation lounges, and board game spaces often manage multi-category operations with paper slips, stopwatch apps, and disconnected accounting books. This friction leads to unbilled session time, disputed player match settlements, and lost revenue.
      </p>
      <p>
        JustClub was created to give club owners a unified operating system that handles live table timers, flexible 1v1 and 2v2 split billing, café inventory management, customer khata credit tracking, and instant WhatsApp UPI settlement from any phone, tablet, or PC browser.
      </p>

      <h2>Key Platform Capabilities</h2>
      <ul>
        <li><strong>Universal Station Timers:</strong> Supports Billiards, Snooker, PlayStation, PC Gaming, VR Pods, Table Tennis, Foosball, Air Hockey, Darts, Karaoke, and Board Games.</li>
        <li><strong>Precision Billing Modes:</strong> Exact-minute pro-rata billing or 15-minute block rounding with automatic pause/resume tracking.</li>
        <li><strong>Player Match Splits:</strong> 1v1 equal, 1v1 loser-pays, 2v2 equal, 2v2 loser-pays, and group equal splits, with custom splits for attached café orders.</li>
        <li><strong>Integrated Café & Bar POS:</strong> Instant snack ordering with real-time stock decrement and combined invoicing.</li>
        <li><strong>Member Khata CRM:</strong> Customer visit logs, lifetime spend analytics, credit balances, and 1-click WhatsApp payment reminders.</li>
        <li><strong>Zero Hardware Lock-In:</strong> Installs instantly as a Progressive Web App (PWA) with no expensive timer boxes required.</li>
      </ul>

      <h2>Transparent Pricing</h2>
      <p>
        JustClub offers simple, transparent subscription plans in Indian Rupees with a risk-free 15-day free trial (no credit card required):
      </p>
      <ul>
        <li><strong>Monthly Plan:</strong> ₹499 per month</li>
        <li><strong>Quarterly Plan:</strong> ₹1,299 per quarter (approx. ₹433/month)</li>
        <li><strong>Yearly Plan:</strong> ₹4,499 per year (approx. ₹375/month)</li>
      </ul>

      <h2>Merchant Details & Operator Identity</h2>
      <p>
        <strong>Brand Name:</strong> JustClub (JustCLUB OS)<br />
        <strong>Sole Operator:</strong> Rajaganapathy Kamalakannan<br />
        <strong>Operating Region:</strong> Tamil Nadu, India<br />
        <strong>Support Email:</strong> <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a><br />
        <strong>Support Hours:</strong> 9:00 AM to 6:00 PM IST (Monday to Saturday)
      </p>
    </article>
  `,
};

// -----------------------------------------------------------------------------
// TRUST PAGE 2: Privacy Policy
// -----------------------------------------------------------------------------
export const privacyPage: PageMeta = {
  slug: 'privacy',
  title: 'JustClub Privacy Policy | justclub.in',
  description: 'Read the JustClub privacy policy regarding data collection, operational use, security, and DPDP Act compliance for gaming club billing software.',
  canonical: `${BASE_URL}/privacy/`,
  h1: 'Privacy Policy',
  jsonLd: [
    ORG_NODE,
    WEBSITE_NODE,
    {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/privacy/#webpage`,
      url: `${BASE_URL}/privacy/`,
      name: 'Privacy Policy | JustClub',
      description: 'Privacy Policy for JustClub gaming lounge and snooker club software, operated by Rajaganapathy Kamalakannan.',
      isPartOf: { '@id': `${BASE_URL}/#website` },
      breadcrumb: { '@id': `${BASE_URL}/privacy/#breadcrumb` },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${BASE_URL}/privacy/#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Privacy Policy', item: `${BASE_URL}/privacy/` },
      ],
    },
  ],
  contentHtml: `
    <article class="hero-card">
      <span class="meta-tag">Compliance & Data Protection</span>
      <h1>Privacy Policy</h1>
      <p><strong>Operated by Rajaganapathy Kamalakannan (JustCLUB) • Compliant with DPDP Act 2023 & IT Rules 2011</strong></p>

      <div class="author-attribution">
        <span>Last updated: <strong>${LAST_UPDATED}</strong></span>
      </div>

      <p>
        <strong>JustCLUB</strong> ("we," "our," or "us"), operated by <strong>Rajaganapathy Kamalakannan</strong>, is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by JustCLUB.
      </p>

      <h2>1. Information We Collect</h2>
      <p>We collect information that you provide directly to us when registering a club account, configuring assets, or initiating subscription payments. This includes:</p>
      <ul>
        <li><strong>Account Information:</strong> Name, business name, work email address, phone number, and physical billing address.</li>
        <li><strong>Business & Invoicing Data:</strong> Payment transactions processed via our payment gateway partner, Razorpay. Please note that we do not store your raw credit/debit card numbers or UPI PINs on our servers.</li>
        <li><strong>Transactional Content:</strong> Customer names, visit logs, game configurations, asset rates, and inventory ledger items entered into your club POS.</li>
        <li><strong>Technical Metadata:</strong> IP addresses, browser user-agent, session timestamps, and diagnostic error logs for system uptime and fraud prevention.</li>
      </ul>

      <h2>2. How We Use Your Data</h2>
      <p>Your data is processed strictly for legitimate operational purposes:</p>
      <ul>
        <li>To operate, maintain, and provision your dedicated multi-game club billing workspace.</li>
        <li>To verify your identity and prevent fraudulent activities or unauthorized account access.</li>
        <li>To process secure subscription payments securely through RBI-authorized payment aggregator <strong>Razorpay Software Private Limited</strong>.</li>
        <li>To send critical system notifications, billing alerts, and support responses.</li>
      </ul>

      <h2>3. Data Sharing and Third-Party Services</h2>
      <p>
        We do not sell, rent, or trade your personal or operational data to third parties. We share transaction-specific data only with our trusted payment processor partner, <strong>Razorpay</strong>, for the sole purpose of secure checkout processing. All communication with our partners is secured using industrial-grade HTTPS/TLS encryption.
      </p>

      <h2>4. Data Retention & Security</h2>
      <p>
        Your database records are protected with secure cloud parameters and modern access keys. Data is retained for as long as your account remains active. You can request deletion of your account and related database entries at any time by contacting us.
      </p>

      <h2>5. Contact Information</h2>
      <p>
        For any queries regarding this Privacy Policy, please contact:<br />
        <strong>Operator:</strong> Rajaganapathy Kamalakannan<br />
        <strong>Email:</strong> <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>
      </p>
    </article>
  `,
};

// -----------------------------------------------------------------------------
// TRUST PAGE 3: Terms of Service
// -----------------------------------------------------------------------------
export const termsPage: PageMeta = {
  slug: 'terms',
  title: 'JustClub Terms of Service | justclub.in',
  description: 'Review the Terms of Service for using the JustClub gaming lounge and snooker club POS management platform.',
  canonical: `${BASE_URL}/terms/`,
  h1: 'Terms of Service',
  jsonLd: [
    ORG_NODE,
    WEBSITE_NODE,
    {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/terms/#webpage`,
      url: `${BASE_URL}/terms/`,
      name: 'Terms of Service | JustClub',
      description: 'Terms of Service for JustClub OS, operated by Rajaganapathy Kamalakannan.',
      isPartOf: { '@id': `${BASE_URL}/#website` },
      breadcrumb: { '@id': `${BASE_URL}/terms/#breadcrumb` },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${BASE_URL}/terms/#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Terms of Service', item: `${BASE_URL}/terms/` },
      ],
    },
  ],
  contentHtml: `
    <article class="hero-card">
      <span class="meta-tag">User Agreement</span>
      <h1>Terms of Service</h1>
      <p><strong>Operated by Rajaganapathy Kamalakannan (JustCLUB) • Effective as of September 15, 2026</strong></p>

      <div class="author-attribution">
        <span>Last updated: <strong>${LAST_UPDATED}</strong></span>
      </div>

      <p>
        Welcome to <strong>JustCLUB</strong>. These Terms of Service ("Terms") govern your use of the JustCLUB application and platform operated by <strong>Rajaganapathy Kamalakannan</strong>. By accessing our services, you agree to comply with these terms.
      </p>

      <h2>1. Use of Service</h2>
      <p>
        JustCLUB is a cloud-based multi-tenant Software-as-a-Service (SaaS) tool designed to manage multi-game club operations, session timing, and cafe inventories. You must use the service only for lawful business purposes in compliance with all local guidelines.
      </p>

      <h2>2. Account Registration & Security</h2>
      <p>
        To use the POS and asset configuration modules, you must register an account using Google SSO or email credentials. You are solely responsible for keeping your login credentials confidential and secure. Any activity occurring under your account is your responsibility.
      </p>

      <h2>3. Fees & Subscription Plans</h2>
      <p>
        JustCLUB offers Monthly (₹499), Quarterly (₹1,299), and Yearly (₹4,499) subscription packages. A 15-Day Free Trial is granted to new venues. After the trial period, you must select and activate a paid plan using our integration with Razorpay to retain active write-access to POS controls.
      </p>

      <h2>4. Termination</h2>
      <p>
        We reserve the right to suspend or terminate your account access if any terms are violated, or in cases of non-payment. Upon cancellation, your database records will be preserved for up to 30 days, allowing you to export reports.
      </p>

      <h2>5. Limitation of Liability</h2>
      <p>
        JustCLUB is provided "as is" and "as available" without warranties of any kind. Under no circumstances shall Rajaganapathy Kamalakannan or JustCLUB be liable for any indirect, incidental, or loss of revenue damages resulting from service downtime or ledger errors.
      </p>

      <h2>6. Governing Law</h2>
      <p>
        These terms are governed by and construed in accordance with the laws of India. Any disputes arising hereunder shall be subject to the exclusive jurisdiction of the courts located in Tamil Nadu, India.
      </p>
    </article>
  `,
};

// -----------------------------------------------------------------------------
// TRUST PAGE 4: Refund & Cancellation Policy
// -----------------------------------------------------------------------------
export const refundPage: PageMeta = {
  slug: 'refund',
  title: 'Refund & Cancellation Policy | JustClub',
  description: 'Understand the 15-day free trial and refund terms for JustClub multi-game club management subscriptions.',
  canonical: `${BASE_URL}/refund/`,
  h1: 'Refund & Cancellation Policy',
  jsonLd: [
    ORG_NODE,
    WEBSITE_NODE,
    {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/refund/#webpage`,
      url: `${BASE_URL}/refund/`,
      name: 'Refund & Cancellation Policy | JustClub',
      description: 'Refund and Cancellation Policy for JustClub subscription plans.',
      isPartOf: { '@id': `${BASE_URL}/#website` },
      breadcrumb: { '@id': `${BASE_URL}/refund/#breadcrumb` },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${BASE_URL}/refund/#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Refund Policy', item: `${BASE_URL}/refund/` },
      ],
    },
  ],
  contentHtml: `
    <article class="hero-card">
      <span class="meta-tag">Refunds & Cancellations</span>
      <h1>Refund & Cancellation Policy</h1>
      <p><strong>Operated by Rajaganapathy Kamalakannan (JustCLUB) • Safe & Simple Guarantee</strong></p>

      <div class="author-attribution">
        <span>Last updated: <strong>${LAST_UPDATED}</strong></span>
      </div>

      <p>
        At <strong>JustCLUB</strong> (operated by <strong>Rajaganapathy Kamalakannan</strong>), customer satisfaction is our top priority. Because we want you to be fully confident in your investment, we offer a risk-free <strong>15-Day Free Trial</strong> for all new club registrations.
      </p>

      <h2>1. Trial and Cancellation</h2>
      <p>
        You can evaluate all POS features and asset management modules for 15 days completely free of charge. No payment credentials or credit cards are required to start your trial. You can cancel your subscription at any time during this trial period with zero charges.
      </p>

      <h2>2. Paid Subscriptions & Refunds</h2>
      <p>
        Once you choose to transition to a paid plan (Monthly, Quarterly, or Yearly) and authorize payment via our secure Razorpay checkout, the fees are billed in advance. Due to the digital nature of SaaS delivery, payments are generally non-refundable after successful activation.
      </p>

      <h2>3. Exceptional Refund Requests</h2>
      <p>
        If you believe there was a billing error or an accidental charge, you may reach out to us within <strong>48 hours</strong> of the transaction. Approved refund requests are processed immediately, and the funds will reflect in your original payment method (bank account, credit card, or UPI wallet) within <strong>5 to 7 business days</strong> as per Razorpay standards.
      </p>

      <h2>4. Contact Support</h2>
      <p>
        For cancellation assistance or refund requests, please email <strong><a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></strong> with your transaction reference ID.
      </p>
    </article>
  `,
};

// -----------------------------------------------------------------------------
// TRUST PAGE 5: Contact & Support
// -----------------------------------------------------------------------------
export const contactPage: PageMeta = {
  slug: 'contact',
  title: 'Contact JustClub Support | justclub.in',
  description: `Get in touch with the JustClub support team for onboarding, technical assistance, or billing inquiries. Support email: ${SUPPORT_EMAIL}.`,
  canonical: `${BASE_URL}/contact/`,
  h1: 'Contact & Support',
  jsonLd: [
    ORG_NODE,
    WEBSITE_NODE,
    {
      '@type': 'ContactPage',
      '@id': `${BASE_URL}/contact/#webpage`,
      name: 'JustClub Contact & Support',
      description: 'Official support and contact channels for JustClub gaming lounge and snooker club software.',
      url: `${BASE_URL}/contact/`,
      isPartOf: { '@id': `${BASE_URL}/#website` },
      breadcrumb: { '@id': `${BASE_URL}/contact/#breadcrumb` },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${BASE_URL}/contact/#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Contact & Support', item: `${BASE_URL}/contact/` },
      ],
    },
  ],
  contentHtml: `
    <article class="hero-card">
      <span class="meta-tag">Customer Helpdesk</span>
      <h1>Contact & Support</h1>
      <p><strong>Operated by Rajaganapathy Kamalakannan (JustCLUB)</strong></p>

      <div class="author-attribution">
        <span>Last updated: <strong>${LAST_UPDATED}</strong></span>
      </div>

      <p>
        We are here to assist you. If you have questions about onboarding your venue, configuring custom game rates, managing club khata ledgers, or setting up Razorpay/UPI payments, reach out using the channels below.
      </p>

      <h2>Official Contact Channels</h2>
      <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 0.75rem; padding: 1.5rem; margin: 1.5rem 0;">
        <p><strong>Primary Support Email:</strong> <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
        <p><strong>Operator Name:</strong> Rajaganapathy Kamalakannan</p>
        <p><strong>Business Region:</strong> Tamil Nadu, India</p>
        <p><strong>Postal Address:</strong> Tamil Nadu, India <!-- TODO_CONFIRM: exact street address --></p>
        <p><strong>Phone / WhatsApp:</strong> Contact available via registered account dashboard <!-- TODO_CONFIRM: direct support phone number --></p>
        <p style="margin-bottom: 0;"><strong>Operating Hours:</strong> 9:00 AM to 6:00 PM IST (Monday to Saturday)</p>
      </div>

      <h2>1. Response SLA</h2>
      <p>
        All critical support inquiries submitted via email receive a diagnostic response within <strong>2 to 4 business hours</strong>. General billing, account, and setup questions are resolved within 24 business hours.
      </p>

      <h2>2. Escalation Procedure</h2>
      <p>
        If your support ticket requires urgent escalation, please include "ESCALATION" in your email subject line to route directly to the principal operator, Rajaganapathy Kamalakannan.
      </p>
    </article>
  `,
};

// -----------------------------------------------------------------------------
// 404 PAGE (Standalone HTML)
// -----------------------------------------------------------------------------
export const notFoundHtml = `<!doctype html>
<html lang="en-IN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Page Not Found | JustClub</title>
    <meta name="description" content="The requested page could not be found. Return to the JustClub multi-game club operating system home page or explore our software solutions." />
    <meta name="robots" content="noindex, follow" />
    
    <!-- OpenGraph & Social Metadata -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="JustClub" />
    <meta property="og:title" content="Page Not Found | JustClub" />
    <meta property="og:description" content="The requested page could not be found." />
    <meta property="og:url" content="${BASE_URL}/404.html" />
    <meta property="og:image" content="${AVATAR_URL}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="Page Not Found | JustClub" />
    <meta name="twitter:description" content="The requested page could not be found." />
    <meta name="twitter:image" content="${AVATAR_URL}" />

    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <style>${sharedStyles}</style>
  </head>
  <body>
    <header>
      <div class="header-inner">
        <a href="/" class="brand-logo">
          <span><span class="highlight">just</span>club</span>
          <span class="badge">OS</span>
        </a>
        <a href="/" class="cta-btn">Go to Home</a>
      </div>
    </header>

    <main class="container" style="padding-top: 4rem; padding-bottom: 4rem; text-align: center;">
      <span class="meta-tag">404 Error</span>
      <h1>Page Not Found</h1>
      <p style="max-width: 500px; margin: 0 auto 2rem auto;">
        The page you are looking for does not exist or has been moved. Explore our solutions or return to the main platform.
      </p>

      <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-bottom: 3rem;">
        <a href="/" class="cta-btn">Return to Home</a>
        <a href="/snooker-billiards-club-software/" class="cta-btn" style="background: #1e293b; color: #f1f5f9 !important;">Snooker POS</a>
        <a href="/gaming-cafe-lounge-software/" class="cta-btn" style="background: #1e293b; color: #f1f5f9 !important;">Gaming Cafe POS</a>
        <a href="/club-credit-khata-ledger-software/" class="cta-btn" style="background: #1e293b; color: #f1f5f9 !important;">Khata Ledger</a>
      </div>
    </main>

    <footer>
      <div class="container" style="text-align: center;">
        <div>© 2026 JustClub. Operated by Rajaganapathy Kamalakannan. All Rights Reserved.</div>
      </div>
    </footer>
  </body>
</html>`;

export const allStaticPages: PageMeta[] = [
  snookerPage,
  gamingCafePage,
  khataPage,
  snookerGuidePage,
  billingGuidePage,
  aboutPage,
  privacyPage,
  termsPage,
  refundPage,
  contactPage,
];

export function generateSitemapXml(): string {
  const urls = [
    `${BASE_URL}/`,
    ...allStaticPages.map((p) => p.canonical),
  ];

  const urlElements = urls
    .map((url) => `  <url>\n    <loc>${url}</loc>\n  </url>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlElements}\n</urlset>\n`;
}

export function generatePageHtml(page: PageMeta): string {
  return buildPageHtml(page);
}
