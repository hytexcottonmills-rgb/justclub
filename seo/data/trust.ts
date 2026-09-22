import {
  AVATAR_URL,
  BASE_URL,
  LAST_UPDATED,
  LOGO_URL,
  ORG_NODE,
  SOFTWARE_NODE,
  SUPPORT_EMAIL,
  WEBSITE_NODE,
  buildBreadcrumbSchema,
  renderBreadcrumbsHtml,
  sharedStyles,
} from '../generator';
import type { PageMeta } from '../types';

export const trustAndLegacyPages: PageMeta[] = [
  // 1. About
  {
    slug: 'about',
    title: 'About JustClub: Built for Cue Sports & Gaming Venues | JustClub',
    description: 'Learn about JustClub and founder Rajaganapathy Kamalakannan. Our mission is to modernize snooker clubs and entertainment venues across India.',
    canonical: `${BASE_URL}/about/`,
    h1: 'About JustClub & Founder Rajaganapathy Kamalakannan',
    category: 'Trust',
    jsonLd: [
      ORG_NODE,
      WEBSITE_NODE,
      SOFTWARE_NODE,
      {
        '@type': 'AboutPage',
        '@id': `${BASE_URL}/about/#webpage`,
        url: `${BASE_URL}/about/`,
        name: 'About JustClub',
        description: 'About JustClub mission and leadership.',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        breadcrumb: { '@id': `${BASE_URL}/about/#breadcrumb` },
      },
      buildBreadcrumbSchema([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'About', url: `${BASE_URL}/about/` },
      ]),
    ],
    contentHtml: `
      ${renderBreadcrumbsHtml([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'About', url: `${BASE_URL}/about/` },
      ])}
      <article class="hero-card">
        <span class="meta-tag">Company & Leadership</span>
        <h1>About JustClub &amp; Founder Rajaganapathy Kamalakannan</h1>
        
        <div class="quick-answer">
          <strong>Mission:</strong> JustClub was founded by Rajaganapathy Kamalakannan to equip every snooker club, billiards parlor, and gaming lounge owner in India with intuitive, cloud-based operating software that eliminates manual math, accelerates UPI checkout, and protects daily cash collections.
        </div>

        <div class="author-attribution">
          <span>Published by <strong>JustClub Leadership</strong></span>
          <span>•</span>
          <span>Last updated: <strong>${LAST_UPDATED}</strong></span>
        </div>

        <h2>The Origin of JustClub</h2>
        <p>
          Visiting cue sports clubs across India revealed a consistent problem: passion-driven venue owners were losing significant revenue due to fragmented operations. Table sessions were tracked on scraps of paper, cashiers guessed start times during busy evening matches, customers faced friction calculating split bills, and unrecorded canteen sodas created inventory discrepancies.
        </p>
        <p>
          JustClub was built to solve these exact operational friction points. By offering hardware-free live table timers, exact pro-rata billing, dynamic UPI QR generation, 1-click WhatsApp invoicing, and customer khata accounting, JustClub empowers club operators to run professional, highly profitable businesses.
        </p>

        <h2>Operator &amp; Compliance Details</h2>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Entity Information</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Operating Entity</strong></td>
                <td>Rajaganapathy Kamalakannan</td>
              </tr>
              <tr>
                <td><strong>Brand Name</strong></td>
                <td>JustClub (justclub.in)</td>
              </tr>
              <tr>
                <td><strong>Primary Jurisdiction</strong></td>
                <td>India</td>
              </tr>
              <tr>
                <td><strong>Official Support Email</strong></td>
                <td><a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="cta-banner">
          <h2>Join the JustClub Community</h2>
          <p>Get started with a 15-day free trial. Setup takes less than 2 minutes.</p>
          <a href="/#pricing" class="cta-btn">Start 15-Day Free Trial</a>
        </div>
      </article>
    `,
  },

  // 2. Privacy Policy
  {
    slug: 'privacy',
    title: 'Privacy Policy | JustClub',
    description: 'Privacy policy for JustClub platform. Learn how we collect, protect, and handle venue data, customer records, and payment information.',
    canonical: `${BASE_URL}/privacy/`,
    h1: 'JustClub Privacy Policy',
    category: 'Legal',
    jsonLd: [
      ORG_NODE,
      WEBSITE_NODE,
      {
        '@type': 'WebPage',
        '@id': `${BASE_URL}/privacy/#webpage`,
        url: `${BASE_URL}/privacy/`,
        name: 'Privacy Policy',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        breadcrumb: { '@id': `${BASE_URL}/privacy/#breadcrumb` },
      },
      buildBreadcrumbSchema([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Privacy Policy', url: `${BASE_URL}/privacy/` },
      ]),
    ],
    contentHtml: `
      ${renderBreadcrumbsHtml([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Privacy Policy', url: `${BASE_URL}/privacy/` },
      ])}
      <article class="hero-card">
        <span class="meta-tag">Data Protection</span>
        <h1>JustClub Privacy Policy</h1>
        
        <p><strong>Effective Date:</strong> ${LAST_UPDATED}</p>
        <p>
          JustClub ("we", "our", or "us"), operated by Rajaganapathy Kamalakannan, respects the privacy of our subscribers and their venue customers. This policy outlines how information is handled when using justclub.in.
        </p>

        <h2>1. Information We Collect</h2>
        <ul>
          <li><strong>Account Information:</strong> Name, club business name, email address, phone number, and subscription billing details.</li>
          <li><strong>Venue Operational Data:</strong> Table session logs, tariffs, customer khata balances, and canteen inventory counts entered by the subscriber.</li>
          <li><strong>Technical Metadata:</strong> Browser type, IP address, and device characteristics collected for security and session persistence.</li>
        </ul>

        <h2>2. Use of Information</h2>
        <p>
          We use operational data solely to deliver, secure, and maintain the JustClub software service. We never sell, rent, or monetize your customer database or sales figures to third parties.
        </p>

        <h2>3. Data Security &amp; Isolation</h2>
        <p>
          All tenant data is strictly logically partitioned. Cloud communications are encrypted in transit using industry-standard TLS protocols.
        </p>

        <h2>4. Contact Us</h2>
        <p>For privacy inquiries, contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
      </article>
    `,
  },

  // 3. Terms of Service
  {
    slug: 'terms',
    title: 'Terms of Service | JustClub',
    description: 'Terms of service and subscription agreement for JustClub club management operating platform.',
    canonical: `${BASE_URL}/terms/`,
    h1: 'JustClub Terms of Service',
    category: 'Legal',
    jsonLd: [
      ORG_NODE,
      WEBSITE_NODE,
      {
        '@type': 'WebPage',
        '@id': `${BASE_URL}/terms/#webpage`,
        url: `${BASE_URL}/terms/`,
        name: 'Terms of Service',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        breadcrumb: { '@id': `${BASE_URL}/terms/#breadcrumb` },
      },
      buildBreadcrumbSchema([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Terms of Service', url: `${BASE_URL}/terms/` },
      ]),
    ],
    contentHtml: `
      ${renderBreadcrumbsHtml([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Terms of Service', url: `${BASE_URL}/terms/` },
      ])}
      <article class="hero-card">
        <span class="meta-tag">Subscription Terms</span>
        <h1>JustClub Terms of Service</h1>
        
        <p><strong>Effective Date:</strong> ${LAST_UPDATED}</p>
        <p>
          These Terms of Service govern your access to and use of JustClub, operated by Rajaganapathy Kamalakannan. By creating an account or using the platform, you agree to these terms.
        </p>

        <h2>1. Subscriptions &amp; Free Trial</h2>
        <p>
          JustClub provides a 15-day free trial. Paid subscriptions are billed in Indian Rupees (₹) on a monthly, quarterly, or annual recurring basis as selected by the user.
        </p>

        <h2>2. Permitted Use</h2>
        <p>
          Subscribers may use JustClub to manage physical sports clubs, cue-sports parlors, gaming lounges, and attached canteens. You are responsible for safeguarding your login credentials.
        </p>

        <h2>3. Service Level &amp; Availability</h2>
        <p>
          We strive for 99.9% uptime. Scheduled maintenance will be communicated in advance whenever feasible.
        </p>
      </article>
    `,
  },

  // 4. Refund Policy
  {
    slug: 'refund',
    title: 'Refund & Cancellation Policy | JustClub',
    description: 'Refund, billing dispute, and subscription cancellation policy for JustClub software platform.',
    canonical: `${BASE_URL}/refund/`,
    h1: 'JustClub Refund & Cancellation Policy',
    category: 'Legal',
    jsonLd: [
      ORG_NODE,
      WEBSITE_NODE,
      {
        '@type': 'WebPage',
        '@id': `${BASE_URL}/refund/#webpage`,
        url: `${BASE_URL}/refund/`,
        name: 'Refund Policy',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        breadcrumb: { '@id': `${BASE_URL}/refund/#breadcrumb` },
      },
      buildBreadcrumbSchema([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Refund Policy', url: `${BASE_URL}/refund/` },
      ]),
    ],
    contentHtml: `
      ${renderBreadcrumbsHtml([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Refund Policy', url: `${BASE_URL}/refund/` },
      ])}
      <article class="hero-card">
        <span class="meta-tag">Fair Billing</span>
        <h1>JustClub Refund &amp; Cancellation Policy</h1>
        
        <p><strong>Effective Date:</strong> ${LAST_UPDATED}</p>
        <p>
          We provide a full-featured 15-day free trial so club owners can thoroughly evaluate JustClub with their real tables, staff, and canteen items prior to purchasing a subscription.
        </p>

        <h2>1. Cancellation</h2>
        <p>
          You may cancel your subscription at any time from your account settings. Upon cancellation, your access remains active until the end of your prepaid billing period.
        </p>

        <h2>2. Refund Eligibility</h2>
        <p>
          If you experience a verified technical defect that prevents service usage and our support team cannot resolve it within 7 business days, you are eligible for a full pro-rated refund for the remaining subscription period.
        </p>

        <h2>3. How to Request Support or Refunds</h2>
        <p>
          Email <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a> with your registered club account details.
        </p>
      </article>
    `,
  },

  // 5. Contact
  {
    slug: 'contact',
    title: 'Contact JustClub Support & Sales | JustClub',
    description: 'Get in touch with JustClub for customer support, onboarding assistance, sales inquiries, and multi-branch deployments.',
    canonical: `${BASE_URL}/contact/`,
    h1: 'Contact JustClub Support & Customer Advisory',
    category: 'Trust',
    jsonLd: [
      ORG_NODE,
      WEBSITE_NODE,
      {
        '@type': 'ContactPage',
        '@id': `${BASE_URL}/contact/#webpage`,
        url: `${BASE_URL}/contact/`,
        name: 'Contact JustClub',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        breadcrumb: { '@id': `${BASE_URL}/contact/#breadcrumb` },
      },
      buildBreadcrumbSchema([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Contact', url: `${BASE_URL}/contact/` },
      ]),
    ],
    contentHtml: `
      ${renderBreadcrumbsHtml([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Contact', url: `${BASE_URL}/contact/` },
      ])}
      <article class="hero-card">
        <span class="meta-tag">Customer Support</span>
        <h1>Contact JustClub Support &amp; Customer Advisory</h1>
        
        <div class="quick-answer">
          <strong>Direct Support:</strong> We are here to help you set up your rate cards, train your floor staff, and optimize your club's daily revenue.
        </div>

        <div class="table-wrapper" style="margin-top:2rem;">
          <table>
            <thead>
              <tr>
                <th>Channel</th>
                <th>Contact Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Customer Support Email</strong></td>
                <td><a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></td>
              </tr>
              <tr>
                <td><strong>Operating Entity</strong></td>
                <td>Rajaganapathy Kamalakannan</td>
              </tr>
              <tr>
                <td><strong>Support Hours</strong></td>
                <td>Monday – Saturday, 9:00 AM – 6:00 PM IST</td>
              </tr>
              <tr>
                <td><strong>Social Channels</strong></td>
                <td>
                  <a href="https://www.instagram.com/justclub.in/" target="_blank" rel="noopener noreferrer">Instagram (@justclub.in)</a> •
                  <a href="https://www.youtube.com/@Justclubindia" target="_blank" rel="noopener noreferrer">YouTube Channel</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="cta-banner">
          <h2>Start Your 15-Day Free Trial</h2>
          <p>No credit card required. Onboard your club in under 2 minutes.</p>
          <a href="/#pricing" class="cta-btn">Start 15-Day Free Trial</a>
        </div>
      </article>
    `,
  },

  // 6. Legacy / Alias: Snooker Billiards Club Software
  {
    slug: 'snooker-billiards-club-software',
    title: 'Snooker & Billiards Club Software | JustClub OS',
    description: 'Cloud software for snooker and billiards parlors in India. Timers, 1v1 loser-pays split, attached café POS & WhatsApp UPI receipts.',
    canonical: `${BASE_URL}/snooker-club-management-software/`,
    h1: 'Snooker & Billiards Club Management Software',
    category: 'Commercial',
    jsonLd: [
      ORG_NODE,
      WEBSITE_NODE,
      SOFTWARE_NODE,
      {
        '@type': 'WebPage',
        '@id': `${BASE_URL}/snooker-billiards-club-software/#webpage`,
        url: `${BASE_URL}/snooker-club-management-software/`,
        name: 'Snooker & Billiards Club Software',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        breadcrumb: { '@id': `${BASE_URL}/snooker-billiards-club-software/#breadcrumb` },
      },
      buildBreadcrumbSchema([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Snooker Club Software', url: `${BASE_URL}/snooker-club-management-software/` },
      ]),
    ],
    contentHtml: `
      ${renderBreadcrumbsHtml([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Snooker Club Software', url: `${BASE_URL}/snooker-club-management-software/` },
      ])}
      <article class="hero-card">
        <span class="meta-tag">Snooker &amp; Billiards POS</span>
        <h1>Snooker &amp; Billiards Club Management Software</h1>
        
        <div class="quick-answer">
          <strong>Quick answer:</strong> JustClub Snooker Software manages full-size tournament tables, English billiards frames, pro-rata minute billing, canteen snack orders, and dynamic UPI QR payments on any phone, tablet, or PC.
        </div>

        <p>
          Looking for our dedicated snooker suite? Visit our <a href="/snooker-club-management-software/">Snooker Club Management Software</a> or explore our <a href="/billiards-club-management-software/">Billiards Club Software</a>.
        </p>

        <div class="cta-banner">
          <h2>Start Your 15-Day Free Trial</h2>
          <p>Automate your snooker club with JustClub OS.</p>
          <a href="/#pricing" class="cta-btn">Start 15-Day Free Trial</a>
        </div>
      </article>
    `,
  },

  // 7. Legacy: Gaming Cafe Lounge Software
  {
    slug: 'gaming-cafe-lounge-software',
    title: 'Gaming Cafe & PS5 Lounge Management Software | JustClub',
    description: 'Gaming lounge software for PS5 booths, PC rigs & VR pods in India. Multi-controller timers, snack POS, split bills & UPI checkout.',
    canonical: `${BASE_URL}/gaming-club-management-software/`,
    h1: 'Gaming Cafe & PS5 Lounge Management Software',
    category: 'Commercial',
    jsonLd: [
      ORG_NODE,
      WEBSITE_NODE,
      SOFTWARE_NODE,
      {
        '@type': 'WebPage',
        '@id': `${BASE_URL}/gaming-cafe-lounge-software/#webpage`,
        url: `${BASE_URL}/gaming-club-management-software/`,
        name: 'Gaming Lounge Software',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        breadcrumb: { '@id': `${BASE_URL}/gaming-cafe-lounge-software/#breadcrumb` },
      },
      buildBreadcrumbSchema([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Gaming Club Software', url: `${BASE_URL}/gaming-club-management-software/` },
      ]),
    ],
    contentHtml: `
      ${renderBreadcrumbsHtml([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Gaming Club Software', url: `${BASE_URL}/gaming-club-management-software/` },
      ])}
      <article class="hero-card">
        <span class="meta-tag">Console &amp; PC Gaming</span>
        <h1>Gaming Cafe &amp; PS5 Lounge Management Software</h1>
        
        <div class="quick-answer">
          <strong>Quick answer:</strong> JustClub Gaming Software manages PlayStation 5 stations, Xbox booths, PC gaming rigs, and VR pods with multi-controller rate tiers, canteen item billing, and instant UPI checkout.
        </div>

        <p>
          Explore our full <a href="/gaming-club-management-software/">Gaming Club Management Software</a> platform.
        </p>

        <div class="cta-banner">
          <h2>Start 15-Day Free Trial</h2>
          <p>Get started today. Setup takes less than 2 minutes.</p>
          <a href="/#pricing" class="cta-btn">Start 15-Day Free Trial</a>
        </div>
      </article>
    `,
  },

  // 8. Legacy: Club Credit Khata Ledger Software
  {
    slug: 'club-credit-khata-ledger-software',
    title: 'Club Credit Khata & Customer Ledger Software | JustClub',
    description: 'Customer credit khata ledger software for Indian cue sports clubs. Track member credit balances, advance deposits & WhatsApp payment links.',
    canonical: `${BASE_URL}/features/ledger/`,
    h1: 'Club Credit Khata & Customer Ledger Software',
    category: 'Commercial',
    jsonLd: [
      ORG_NODE,
      WEBSITE_NODE,
      SOFTWARE_NODE,
      {
        '@type': 'WebPage',
        '@id': `${BASE_URL}/club-credit-khata-ledger-software/#webpage`,
        url: `${BASE_URL}/features/ledger/`,
        name: 'Customer Khata Ledger',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        breadcrumb: { '@id': `${BASE_URL}/club-credit-khata-ledger-software/#breadcrumb` },
      },
      buildBreadcrumbSchema([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Customer Khata Ledger', url: `${BASE_URL}/features/ledger/` },
      ]),
    ],
    contentHtml: `
      ${renderBreadcrumbsHtml([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Customer Khata Ledger', url: `${BASE_URL}/features/ledger/` },
      ])}
      <article class="hero-card">
        <span class="meta-tag">Digital Ledger</span>
        <h1>Club Credit Khata &amp; Customer Ledger Software</h1>
        
        <div class="quick-answer">
          <strong>Quick answer:</strong> JustClub Digital Khata replaces paper debt registers with an auditable credit ledger, tracking player running tabs, advance deposits, and 1-click WhatsApp balance notifications.
        </div>

        <p>
          Explore our dedicated <a href="/features/ledger/">Customer Khata Ledger Feature</a> page.
        </p>

        <div class="cta-banner">
          <h2>Start 15-Day Free Trial</h2>
          <p>Eliminate uncollected member credit with JustClub.</p>
          <a href="/#pricing" class="cta-btn">Start 15-Day Free Trial</a>
        </div>
      </article>
    `,
  },

  // 9. Legacy: Snooker Club Software Buyer's Guide
  {
    slug: 'snooker-club-software-buyers-guide',
    title: "Snooker Club Software Buyer's Guide (2026) | JustClub",
    description: 'The definitive evaluation guide for club owners selecting snooker POS software in India. Compare timers, UPI, hardware independence & pricing.',
    canonical: `${BASE_URL}/snooker-club-software-buyers-guide/`,
    h1: "Snooker Club Software Buyer's Evaluation Guide (2026)",
    category: 'Guides',
    jsonLd: [
      ORG_NODE,
      WEBSITE_NODE,
      SOFTWARE_NODE,
      {
        '@type': 'Article',
        '@id': `${BASE_URL}/snooker-club-software-buyers-guide/#article`,
        headline: "Snooker Club Software Buyer's Evaluation Guide (2026)",
        description: 'Comprehensive buyer evaluation checklist for snooker club management software in India.',
        author: {
          '@type': 'Person',
          name: 'Rajaganapathy Kamalakannan',
        },
        publisher: { '@id': `${BASE_URL}/#organization` },
        datePublished: '2026-02-18',
        dateModified: '2026-09-21',
        mainEntityOfPage: `${BASE_URL}/snooker-club-software-buyers-guide/`,
      },
      buildBreadcrumbSchema([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Resources', url: `${BASE_URL}/resources/` },
        { name: "Buyer's Guide", url: `${BASE_URL}/snooker-club-software-buyers-guide/` },
      ]),
    ],
    contentHtml: `
      ${renderBreadcrumbsHtml([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Resources', url: `${BASE_URL}/resources/` },
        { name: "Buyer's Guide", url: `${BASE_URL}/snooker-club-software-buyers-guide/` },
      ])}
      <article class="hero-card">
        <span class="meta-tag">Buyer's Checklist</span>
        <h1>Snooker Club Software Buyer's Evaluation Guide (2026)</h1>
        
        <div class="quick-answer">
          <strong>Key Checklist:</strong> When choosing snooker software in India, verify: 1) Native on-screen dynamic UPI QR codes, 2) 1-click direct WhatsApp receipts, 3) 1v1 loser-pays split billing, 4) Real-time canteen stock decrements, 5) 100% hardware-independent browser access, and 6) Transparent INR pricing.
        </div>

        <p>
          Read our in-depth comparison on <a href="/compare/justclub-vs-cueflow/">JustClub vs CueFlow</a> or check our guide on <a href="/resources/how-to-start-a-snooker-club-in-india/">How to Start a Snooker Club in India</a>.
        </p>

        <div class="cta-banner">
          <h2>Start 15-Day Free Trial</h2>
          <p>Try JustClub risk-free today.</p>
          <a href="/#pricing" class="cta-btn">Start 15-Day Free Trial</a>
        </div>
      </article>
    `,
  },

  // 10. Legacy: How to Bill Snooker Table Time
  {
    slug: 'how-to-bill-snooker-table-time',
    title: 'How to Bill Snooker Table Time: Exact vs Block Billing | JustClub',
    description: 'Learn the exact mathematical formulas for snooker table billing. Compare exact-minute pro-rata billing with 15-minute block rounding.',
    canonical: `${BASE_URL}/how-to-bill-snooker-table-time/`,
    h1: 'How to Bill Snooker Table Time: Exact Minute vs Block Billing',
    category: 'Guides',
    jsonLd: [
      ORG_NODE,
      WEBSITE_NODE,
      SOFTWARE_NODE,
      {
        '@type': 'Article',
        '@id': `${BASE_URL}/how-to-bill-snooker-table-time/#article`,
        headline: 'How to Bill Snooker Table Time: Exact Minute vs Block Billing',
        description: 'Mathematical and operational guide for snooker and pool table billing models.',
        author: {
          '@type': 'Person',
          name: 'Rajaganapathy Kamalakannan',
        },
        publisher: { '@id': `${BASE_URL}/#organization` },
        datePublished: '2026-02-25',
        dateModified: '2026-09-21',
        mainEntityOfPage: `${BASE_URL}/how-to-bill-snooker-table-time/`,
      },
      buildBreadcrumbSchema([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Resources', url: `${BASE_URL}/resources/` },
        { name: 'Table Billing Guide', url: `${BASE_URL}/how-to-bill-snooker-table-time/` },
      ]),
    ],
    contentHtml: `
      ${renderBreadcrumbsHtml([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Resources', url: `${BASE_URL}/resources/` },
        { name: 'Table Billing Guide', url: `${BASE_URL}/how-to-bill-snooker-table-time/` },
      ])}
      <article class="hero-card">
        <span class="meta-tag">Billing Strategy</span>
        <h1>How to Bill Snooker Table Time: Exact Minute vs Block Billing</h1>
        
        <div class="quick-answer">
          <strong>Summary:</strong> Exact-minute pro-rata billing calculates: <code>(Hourly Rate / 60) × Elapsed Minutes</code>. 15-minute block billing rounds up session time to the nearest quarter-hour increment (e.g., 34 minutes becomes 45 minutes). JustClub supports both models seamlessly per table.
        </div>

        <p>
          Calculate your club's potential monthly earnings with our interactive <a href="/tools/snooker-club-profit-calculator/">Snooker Club Profit Calculator</a> or learn more on our <a href="/features/table-billing/">Table Billing Feature</a> page.
        </p>

        <div class="cta-banner">
          <h2>Automate Table Billing Today</h2>
          <p>Get started with JustClub OS. 15-day free trial.</p>
          <a href="/#pricing" class="cta-btn">Start 15-Day Free Trial</a>
        </div>
      </article>
    `,
  },
];

export const notFoundHtml = `<!doctype html>
<html lang="en-IN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Page Not Found (404) | JustClub</title>
    <meta name="description" content="The page you are looking for does not exist on JustClub. Explore our snooker club management software, tools, and pricing." />
    <meta name="robots" content="noindex, follow" />
    <style>${sharedStyles}</style>
  </head>
  <body>
    <header>
      <div class="header-inner">
        <a href="/" class="brand-logo">
          <span><span class="highlight">just</span>club</span>
          <span class="badge">OS</span>
        </a>
        <a href="/" class="cta-btn">Return to Home</a>
      </div>
    </header>

    <main class="container" style="padding: 5rem 1.5rem; text-align: center;">
      <h1 style="font-size: 3rem; margin-bottom: 1rem;">404 - Page Not Found</h1>
      <p style="max-width: 550px; margin: 0 auto 2rem auto; color: #94a3b8;">
        The requested URL was not found on JustClub. You can explore our snooker club solutions, business calculators, or return to the main dashboard.
      </p>
      <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
        <a href="/" class="cta-btn">Main App Dashboard</a>
        <a href="/club-management-software/" class="cta-btn-secondary">Club Software</a>
        <a href="/tools/snooker-club-profit-calculator/" class="cta-btn-secondary">Profit Calculator</a>
        <a href="/resources/" class="cta-btn-secondary">Knowledge Hub</a>
      </div>
    </main>
  </body>
</html>`;
