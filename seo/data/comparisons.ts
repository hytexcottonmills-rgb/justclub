import {
  BASE_URL,
  LAST_UPDATED,
  ORG_NODE,
  SOFTWARE_NODE,
  WEBSITE_NODE,
  buildBreadcrumbSchema,
  renderBreadcrumbsHtml,
} from '../generator';
import type { PageMeta } from '../types';

export const comparisonPages: PageMeta[] = [
  // 1. Comparison Index
  {
    slug: 'compare',
    title: 'Club Management Software Comparisons & Alternatives | JustClub',
    description: 'Compare JustClub against alternative club management software, CueFlow, generic retail POS, spreadsheets, and manual paper billing systems.',
    canonical: `${BASE_URL}/compare/`,
    h1: 'Club Management Software Comparisons & Alternatives',
    category: 'Comparisons',
    jsonLd: [
      ORG_NODE,
      WEBSITE_NODE,
      SOFTWARE_NODE,
      {
        '@type': 'WebPage',
        '@id': `${BASE_URL}/compare/#webpage`,
        url: `${BASE_URL}/compare/`,
        name: 'Club Management Comparisons',
        description: 'Objective comparisons of snooker and recreation club management systems.',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        breadcrumb: { '@id': `${BASE_URL}/compare/#breadcrumb` },
      },
      buildBreadcrumbSchema([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Comparisons', url: `${BASE_URL}/compare/` },
      ]),
    ],
    contentHtml: `
      ${renderBreadcrumbsHtml([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Comparisons', url: `${BASE_URL}/compare/` },
      ])}
      <article class="hero-card">
        <span class="meta-tag">Evaluation Hub</span>
        <h1>Club Management Software Comparisons & Alternatives</h1>
        
        <div class="quick-answer">
          <strong>Overview:</strong> Choosing the right operating system for your snooker, pool, or gaming lounge directly affects daily cash flow, player satisfaction, and staff efficiency. Explore our detailed, factual comparison guides below.
        </div>

        <div class="author-attribution">
          <span>Published by <strong>JustClub Research Team</strong></span>
          <span>•</span>
          <span>Last updated: <strong>${LAST_UPDATED}</strong></span>
        </div>

        <div class="feature-grid">
          <div class="feature-card">
            <h3><a href="/compare/justclub-vs-cueflow/">JustClub vs CueFlow</a></h3>
            <p>Direct comparison of feature sets, Indian UPI payments, pricing models, and hardware flexibility between JustClub and CueFlow.</p>
          </div>
          <div class="feature-card">
            <h3><a href="/compare/justclub-vs-generic-pos/">JustClub vs Generic Retail POS</a></h3>
            <p>Why standard retail POS software (Petpooja, Vyapar, Square) struggles with session timers, loser-pays billing, and cue sports operations.</p>
          </div>
          <div class="feature-card">
            <h3><a href="/compare/justclub-vs-spreadsheets/">JustClub vs Excel Spreadsheets</a></h3>
            <p>Compare cloud session automation against manual Excel logs, formula errors, and unrecorded evening rush hours.</p>
          </div>
          <div class="feature-card">
            <h3><a href="/compare/justclub-vs-manual-billing/">JustClub vs Manual Paper Billing</a></h3>
            <p>Calculate the true financial cost of paper slips, unbilled table minutes, and forgotten customer credit khata balances.</p>
          </div>
        </div>

        <div class="cta-banner">
          <h2>Experience the JustClub Advantage</h2>
          <p>Try JustClub risk-free for 15 days. No credit card required, instant setup in under 2 minutes.</p>
          <a href="/#pricing" class="cta-btn">Start 15-Day Free Trial</a>
        </div>
      </article>
    `,
  },

  // 2. JustClub vs CueFlow
  {
    slug: 'compare/justclub-vs-cueflow',
    title: 'JustClub vs CueFlow: Snooker Club Software Comparison (2026)',
    description: 'Detailed comparison of JustClub vs CueFlow for snooker and pool clubs. Compare Indian UPI QR checkout, WhatsApp receipts, pricing & hardware independence.',
    canonical: `${BASE_URL}/compare/justclub-vs-cueflow/`,
    h1: 'JustClub vs CueFlow: Comprehensive Software Comparison',
    category: 'Comparisons',
    jsonLd: [
      ORG_NODE,
      WEBSITE_NODE,
      SOFTWARE_NODE,
      {
        '@type': 'WebPage',
        '@id': `${BASE_URL}/compare/justclub-vs-cueflow/#webpage`,
        url: `${BASE_URL}/compare/justclub-vs-cueflow/`,
        name: 'JustClub vs CueFlow Comparison',
        description: 'Objective comparison between JustClub and CueFlow club software.',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        breadcrumb: { '@id': `${BASE_URL}/compare/justclub-vs-cueflow/#breadcrumb` },
      },
      buildBreadcrumbSchema([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Comparisons', url: `${BASE_URL}/compare/` },
        { name: 'JustClub vs CueFlow', url: `${BASE_URL}/compare/justclub-vs-cueflow/` },
      ]),
    ],
    contentHtml: `
      ${renderBreadcrumbsHtml([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Comparisons', url: `${BASE_URL}/compare/` },
        { name: 'JustClub vs CueFlow', url: `${BASE_URL}/compare/justclub-vs-cueflow/` },
      ])}
      <article class="hero-card">
        <span class="meta-tag">Competitor Comparison</span>
        <h1>JustClub vs CueFlow: Comprehensive Software Comparison</h1>
        
        <div class="quick-answer">
          <strong>Quick summary:</strong> While CueFlow provides cue-sports management tools, JustClub is specifically engineered for Indian venue realities: native INR pricing starting at ₹499/mo, direct dynamic UPI QR codes (GPay, PhonePe, Paytm), 1-click WhatsApp customer invoicing, attached café stock decrements, and 100% hardware-independent browser access.
        </div>

        <div class="author-attribution">
          <span>Published by <strong>JustClub Technical Research</strong></span>
          <span>•</span>
          <span>Last updated: <strong>${LAST_UPDATED}</strong></span>
        </div>

        <h2>Detailed Feature Matrix</h2>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Feature / Capability</th>
                <th>CueFlow</th>
                <th>JustClub OS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Target Regional Workflows</strong></td>
                <td>General / International</td>
                <td><strong>Tailored specifically for Indian Club Operations</strong></td>
              </tr>
              <tr>
                <td><strong>Dynamic UPI QR Invoicing</strong></td>
                <td>Limited / Manual amount entry</td>
                <td><strong>Native on-screen QR &amp; deep links for GPay, PhonePe, Paytm</strong></td>
              </tr>
              <tr>
                <td><strong>WhatsApp Digital Receipts</strong></td>
                <td>Requires external SMS gateways</td>
                <td><strong>1-Click Direct WhatsApp Invoicing with zero extra fees</strong></td>
              </tr>
              <tr>
                <td><strong>1v1 Loser-Pays Split Mode</strong></td>
                <td>Standard split</td>
                <td><strong>Dedicated Match Loser Split with shared snack splitting</strong></td>
              </tr>
              <tr>
                <td><strong>Customer Khata Ledger</strong></td>
                <td>Basic account balances</td>
                <td><strong>Comprehensive Digital Khata with WhatsApp balance links</strong></td>
              </tr>
              <tr>
                <td><strong>Canteen &amp; Snack Inventory</strong></td>
                <td>Separate module / basic</td>
                <td><strong>Integrated live stock decrements and low-stock alerts</strong></td>
              </tr>
              <tr>
                <td><strong>Pricing &amp; Currency</strong></td>
                <td>Higher tiered / Foreign currency options</td>
                <td><strong>Transparent INR pricing from ₹499/mo with 15-day trial</strong></td>
              </tr>
              <tr>
                <td><strong>Hardware Independence</strong></td>
                <td>Web/Desktop</td>
                <td><strong>Any device (Phone, Tablet, iPad, PC, Mac, POS screen)</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div class="faq-item">
            <h3>Can I migrate my existing club data from CueFlow to JustClub?</h3>
            <p>Yes. You can import your member directory, table tariff lists, and canteen menu items directly into JustClub with our guided onboarding.</p>
          </div>
        </div>

        <div class="cta-banner">
          <h2>Experience the Modern JustClub OS</h2>
          <p>Switch to India's most modern snooker and lounge operating system. Start your 15-day free trial today.</p>
          <a href="/#pricing" class="cta-btn">Start 15-Day Free Trial</a>
        </div>
      </article>
    `,
  },

  // 3. JustClub vs Generic POS
  {
    slug: 'compare/justclub-vs-generic-pos',
    title: 'JustClub vs Generic Retail POS (Petpooja, Vyapar) | JustClub',
    description: 'Why generic retail POS software fails for snooker & gaming lounges. Compare live session timers, pro-rata tariffs, loser-pays split & attached canteen tabs.',
    canonical: `${BASE_URL}/compare/justclub-vs-generic-pos/`,
    h1: 'JustClub vs Generic Retail POS (Petpooja, Vyapar, Square)',
    category: 'Comparisons',
    jsonLd: [
      ORG_NODE,
      WEBSITE_NODE,
      SOFTWARE_NODE,
      {
        '@type': 'WebPage',
        '@id': `${BASE_URL}/compare/justclub-vs-generic-pos/#webpage`,
        url: `${BASE_URL}/compare/justclub-vs-generic-pos/`,
        name: 'JustClub vs Generic Retail POS',
        description: 'Comparison of specialized club OS vs generic retail POS systems.',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        breadcrumb: { '@id': `${BASE_URL}/compare/justclub-vs-generic-pos/#breadcrumb` },
      },
      buildBreadcrumbSchema([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Comparisons', url: `${BASE_URL}/compare/` },
        { name: 'JustClub vs Generic POS', url: `${BASE_URL}/compare/justclub-vs-generic-pos/` },
      ]),
    ],
    contentHtml: `
      ${renderBreadcrumbsHtml([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Comparisons', url: `${BASE_URL}/compare/` },
        { name: 'JustClub vs Generic POS', url: `${BASE_URL}/compare/justclub-vs-generic-pos/` },
      ])}
      <article class="hero-card">
        <span class="meta-tag">Specialized vs Generic POS</span>
        <h1>JustClub vs Generic Retail POS (Petpooja, Vyapar, Square)</h1>
        
        <div class="quick-answer">
          <strong>Quick summary:</strong> Generic restaurant and retail POS tools are designed for static item sales (e.g., selling a burger or a shirt). They lack continuous session timers, second-by-second pro-rata billing, 1v1 loser-pays split logic, and multi-table status grids essential for recreation lounges.
        </div>

        <p>
          Trying to manage a snooker club or gaming lounge using retail POS software forces cashiers into awkward workarounds: typing minutes as quantity multipliers, manually calculating splits on mobile calculators, and losing track of active table times during busy shifts. JustClub is purpose-built for time-based venue operations.
        </p>

        <div class="cta-banner">
          <h2>Use Purpose-Built Software for Your Club</h2>
          <p>Eliminate clumsy POS workarounds. Start your 15-day free trial with JustClub today.</p>
          <a href="/#pricing" class="cta-btn">Start 15-Day Free Trial</a>
        </div>
      </article>
    `,
  },

  // 4. JustClub vs Spreadsheets
  {
    slug: 'compare/justclub-vs-spreadsheets',
    title: 'JustClub vs Excel Spreadsheets for Snooker Clubs | JustClub',
    description: 'Compare JustClub cloud club operating system vs manual Excel spreadsheets. Eliminate formula errors, forgotten minutes & uncollected member debts.',
    canonical: `${BASE_URL}/compare/justclub-vs-spreadsheets/`,
    h1: 'JustClub vs Excel Spreadsheets: Why Cloud OS Wins',
    category: 'Comparisons',
    jsonLd: [
      ORG_NODE,
      WEBSITE_NODE,
      SOFTWARE_NODE,
      {
        '@type': 'WebPage',
        '@id': `${BASE_URL}/compare/justclub-vs-spreadsheets/#webpage`,
        url: `${BASE_URL}/compare/justclub-vs-spreadsheets/`,
        name: 'JustClub vs Spreadsheets',
        description: 'Comparison of JustClub cloud software against Excel sheets.',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        breadcrumb: { '@id': `${BASE_URL}/compare/justclub-vs-spreadsheets/#breadcrumb` },
      },
      buildBreadcrumbSchema([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Comparisons', url: `${BASE_URL}/compare/` },
        { name: 'JustClub vs Spreadsheets', url: `${BASE_URL}/compare/justclub-vs-spreadsheets/` },
      ]),
    ],
    contentHtml: `
      ${renderBreadcrumbsHtml([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Comparisons', url: `${BASE_URL}/compare/` },
        { name: 'JustClub vs Spreadsheets', url: `${BASE_URL}/compare/justclub-vs-spreadsheets/` },
      ])}
      <article class="hero-card">
        <span class="meta-tag">Digital Transformation</span>
        <h1>JustClub vs Excel Spreadsheets: Why Cloud OS Wins</h1>
        
        <div class="quick-answer">
          <strong>Quick summary:</strong> While Excel is inexpensive, it cannot run live synchronized table timers, generate instant UPI QR payment codes, send automated WhatsApp receipts, or provide role-based anti-theft shift audit controls.
        </div>

        <p>
          Spreadsheets are prone to accidental row deletions, formula overwrites by staff, and lack real-time visibility when the owner is away from the venue. JustClub gives you live smartphone access to all active tables and financial metrics wherever you are.
        </p>

        <div class="cta-banner">
          <h2>Upgrade from Static Spreadsheets</h2>
          <p>Automate your club operations with JustClub OS. 15-day free trial.</p>
          <a href="/#pricing" class="cta-btn">Start 15-Day Free Trial</a>
        </div>
      </article>
    `,
  },

  // 5. JustClub vs Manual Billing
  {
    slug: 'compare/justclub-vs-manual-billing',
    title: 'JustClub vs Manual Paper Billing for Snooker Parlors | JustClub',
    description: 'Calculate the true financial cost of paper slips, unbilled minutes & disputed table fees in snooker parlors compared to JustClub cloud automation.',
    canonical: `${BASE_URL}/compare/justclub-vs-manual-billing/`,
    h1: 'JustClub vs Manual Paper Billing: The Cost of Pen and Paper',
    category: 'Comparisons',
    jsonLd: [
      ORG_NODE,
      WEBSITE_NODE,
      SOFTWARE_NODE,
      {
        '@type': 'WebPage',
        '@id': `${BASE_URL}/compare/justclub-vs-manual-billing/#webpage`,
        url: `${BASE_URL}/compare/justclub-vs-manual-billing/`,
        name: 'JustClub vs Manual Billing',
        description: 'Comparison of JustClub cloud automation vs manual paper notes.',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        breadcrumb: { '@id': `${BASE_URL}/compare/justclub-vs-manual-billing/#breadcrumb` },
      },
      buildBreadcrumbSchema([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Comparisons', url: `${BASE_URL}/compare/` },
        { name: 'JustClub vs Manual Billing', url: `${BASE_URL}/compare/justclub-vs-manual-billing/` },
      ]),
    ],
    contentHtml: `
      ${renderBreadcrumbsHtml([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Comparisons', url: `${BASE_URL}/compare/` },
        { name: 'JustClub vs Manual Billing', url: `${BASE_URL}/compare/justclub-vs-manual-billing/` },
      ])}
      <article class="hero-card">
        <span class="meta-tag">Paper vs Automation</span>
        <h1>JustClub vs Manual Paper Billing: The Cost of Pen and Paper</h1>
        
        <div class="quick-answer">
          <strong>Quick summary:</strong> Paper slips cost the average 4-table club ₹18,000 to ₹35,000 every month in unrecorded minutes, lost snack orders, and disputed customer credit debts. JustClub eliminates 100% of these losses for just ₹499/month.
        </div>

        <p>
          Invest in your club's profitability and reputation with automated, transparent digital billing that builds trust with every player.
        </p>

        <div class="cta-banner">
          <h2>Stop Paper-Based Losses Today</h2>
          <p>Get started with JustClub today. Full features, 15-day free trial.</p>
          <a href="/#pricing" class="cta-btn">Start 15-Day Free Trial</a>
        </div>
      </article>
    `,
  },
];
