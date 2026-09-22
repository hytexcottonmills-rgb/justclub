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

interface FeatureDef {
  slug: string;
  name: string;
  title: string;
  description: string;
  h1: string;
  tag: string;
  summary: string;
  whatItIs: string;
  whyClubsNeedIt: string;
  howItWorks: string[];
  whoItIsFor: string[];
  faqs: { q: string; a: string }[];
}

const FEATURES: FeatureDef[] = [
  {
    slug: 'table-billing',
    name: 'Table Billing',
    title: 'Snooker Table Billing Software: Exact Time & Block Billing | JustClub',
    description: 'Precision snooker and pool table billing software. Support exact-minute pro-rata billing, 15m/30m block rounding, split tickets & WhatsApp UPI checkout.',
    h1: 'Precision Table Billing Engine for Snooker & Pool Lounges',
    tag: 'Billing Engine',
    summary: 'JustClub Table Billing automates the mathematical calculation of table time tariffs, converting elapsed session seconds into accurate, transparent customer invoices.',
    whatItIs: 'An automated billing engine built specifically for cue-sports and gaming lounges that calculates charges using real-time elapsed session timestamps and configurable hourly rate tiers.',
    whyClubsNeedIt: 'Manual billing calculations frequently cause revenue leakage through unbilled minutes, rounding disputes between players, and employee calculation errors.',
    howItWorks: [
      'Club operator sets hourly table rates (e.g., ₹240/hr for Standard Snooker, ₹360/hr for Tournament AC Table).',
      'Table session begins with 1 tap. Timer records the exact start timestamp.',
      'During checkout, the system computes: Total = (Hourly Rate / 60) × Duration In Minutes + Canteen Items.',
      'Operator can select Exact-Minute Billing or 15-Minute Block Rounding.',
      'Invoice is presented on screen with dynamic UPI QR code or dispatched via WhatsApp.',
    ],
    whoItIsFor: [
      'Snooker clubs running multiple hourly table rate cards',
      'Billiards parlors with mixed peak and off-peak tariffs',
      'Pool lounges catering to fast-turnaround friend groups',
    ],
    faqs: [
      { q: 'Can I set different rates for AC and Non-AC tables?', a: 'Yes. You can configure individual hourly tariffs for every single table and station in your club.' },
      { q: 'Does the system handle minimum billing amounts?', a: 'Yes. You can enforce minimum session charges (e.g., minimum ₹50) to protect table wear.' },
    ],
  },
  {
    slug: 'live-table-timer',
    name: 'Live Table Timer',
    title: 'Cloud Snooker Table Timer Software: Real-Time Session Tracker | JustClub',
    description: 'Digital live table timers for snooker, pool and gaming cafes. Real-time pause/resume, multi-station grid & offline-safe synchronization.',
    h1: 'Cloud-Based Live Table Timer & Multi-Station Session Tracker',
    tag: 'Session Timers',
    summary: 'JustClub Live Table Timer provides a real-time digital timer grid that tracks concurrent snooker tables, pool tables, and gaming consoles without dedicated hardware boxes.',
    whatItIs: 'A browser-based, synchronized digital timer interface displaying live elapsed time, accrued bill amount, and player names across all club tables in real time.',
    whyClubsNeedIt: 'Hardware timer boxes require high-voltage wiring, frequently suffer relay burnouts, and lock club owners into expensive proprietary repairs.',
    howItWorks: [
      'Counter staff or markers tap "Start Session" on any mobile phone, tablet, or desktop.',
      'Timer ticks in real time, calculating current bill value live.',
      'Staff can Pause the timer for table maintenance or player breaks and Resume seamlessly.',
      'If players request a table switch, 1 tap transfers the session to a new table while retaining elapsed charges.',
    ],
    whoItIsFor: [
      'Venue operators looking to eliminate clunky electrical timer boxes',
      'Floor markers managing tables directly from smartphones',
      'Gaming lounges tracking console booth sessions',
    ],
    faqs: [
      { q: 'What happens if my WiFi disconnects during a match?', a: 'JustClub timers record UTC start timestamps. When internet reconnects, the timer instantly synchronizes to the true elapsed time without losing a single second.' },
      { q: 'Can floor markers start timers from their own phones?', a: 'Yes. Staff with marker permissions can manage tables from their personal or venue mobile devices.' },
    ],
  },
  {
    slug: 'member-management',
    name: 'Member Management',
    title: 'Club Member Management Software: VIP Tiers & Khata CRM | JustClub',
    description: 'Cloud membership management software for Indian snooker & sports clubs. Member discounts, advance wallet balances, visit history & WhatsApp CRM.',
    h1: 'Club Member Management & Customer Khata CRM',
    tag: 'Membership & CRM',
    summary: 'JustClub Member Management centralizes regular player profiles, automated membership discount rates, advance balance wallets, and lifetime visit history.',
    whatItIs: 'A customer relationship and membership database designed to reward loyal players and streamline credit khata accounting.',
    whyClubsNeedIt: 'Regular players drive 60%–80% of repeat club revenue. Managing their special discount rates and advance deposits manually leads to confusion and disputes.',
    howItWorks: [
      'Create member profiles with name, mobile number, and membership tier (e.g., Gold, VIP, Regular).',
      'Assign custom hourly rates or percentage discounts for each membership tier.',
      'When a member starts a session, their discounted rate applies automatically.',
      'Record advance prepaid deposits or track running khata credit with full transaction logs.',
    ],
    whoItIsFor: [
      'Snooker clubs with active player memberships',
      'Cue-sports academies managing student practice packages',
      'Sports recreation clubs offering tiered VIP benefits',
    ],
    faqs: [
      { q: 'Can members prepay into an advance balance wallet?', a: 'Yes. You can credit member advance balances and automatically deduct table and café charges from their wallet.' },
      { q: 'Can I look up a player by phone number?', a: 'Yes. Quick search by phone number or name instantly brings up lifetime visit history and outstanding balance.' },
    ],
  },
  {
    slug: 'upi-payments',
    name: 'UPI Payments',
    title: 'Dynamic UPI QR Code Generator for Club POS | JustClub',
    description: 'Dynamic UPI QR payment integration for Indian snooker clubs & gaming lounges. Instant Google Pay, PhonePe & Paytm settlement with zero manual amount typing.',
    h1: 'Dynamic UPI QR Code Payments for Indian Clubs',
    tag: 'UPI Gateway',
    summary: 'JustClub generates dynamic, bill-specific UPI QR codes on screen so customers can pay exact amounts instantly via Google Pay, PhonePe, Paytm, or BHIM.',
    whatItIs: 'An integrated UPI payment display engine that encodes the club VPA, merchant name, and exact invoice amount into an instant-scan QR code.',
    whyClubsNeedIt: 'Static printed counter QR codes require customers to manually type invoice amounts, leading to underpayments, incorrect notes, and slow counter queues.',
    howItWorks: [
      'When table session ends, JustClub generates a dynamic UPI QR code on the counter screen or marker’s phone.',
      'Customer scans the QR code with GPay, PhonePe, Paytm, CRED, or BHIM.',
      'The exact bill amount and table reference are pre-filled automatically in their payment app.',
      'Customer taps pay and completes the instant bank transfer.',
    ],
    whoItIsFor: [
      'All Indian snooker, pool, billiards, and gaming lounge operators',
      'Venues looking to eliminate cash handling and manual payment matching',
    ],
    faqs: [
      { q: 'Do I need a special merchant account to use UPI QR codes?', a: 'No. JustClub supports direct merchant UPI VPAs and standard Indian bank business QR setups.' },
      { q: 'Can I send the UPI payment link over WhatsApp?', a: 'Yes! 1-click WhatsApp bill delivery includes deep-linked UPI URLs that launch payment apps directly on the customer’s phone.' },
    ],
  },
  {
    slug: 'club-pos',
    name: 'Club POS Terminal',
    title: 'Club POS Terminal: Integrated Table & Snack Point of Sale | JustClub',
    description: 'High-speed cloud POS terminal for snooker parlors, gaming cafes & sports lounges in India. Combine table fees, food orders & UPI on one screen.',
    h1: 'High-Speed Cloud POS Terminal for Tables & Canteens',
    tag: 'Point of Sale',
    summary: 'JustClub POS merges table time tariffs, console station fees, and canteen orders into a single, high-speed point of sale terminal.',
    whatItIs: 'A unified checkout and billing system designed for multi-activity entertainment venues.',
    whyClubsNeedIt: 'Running separate software for table timing and café billing creates double entry, cashier confusion, and lost snack charges.',
    howItWorks: [
      'Select active table from the floor grid.',
      'Tap snacks or drinks to add them directly to the table tab.',
      'When the session concludes, table time and snacks are compiled into a unified invoice.',
      'Collect payment via Cash, UPI QR, Card, or Member Khata.',
    ],
    whoItIsFor: [
      'Clubs operating attached snack bars, cafes, or energy drink counters',
      'Gaming lounges offering combined gaming and food combo packages',
    ],
    faqs: [
      { q: 'Can I sell canteen items to walk-in takeaway customers?', a: 'Yes. The POS supports quick standalone takeaway sales without opening a table timer.' },
    ],
  },
  {
    slug: 'canteen-billing',
    name: 'Canteen Billing & Stock',
    title: 'Canteen Billing & Stock Management Software for Clubs | JustClub',
    description: 'Club canteen inventory and billing software. Real-time snack decrements, low-stock warnings, attached table tabs & profit margin tracking.',
    h1: 'Club Canteen Inventory & Snack Billing Software',
    tag: 'Inventory & Canteen',
    summary: 'JustClub Canteen Billing tracks beverage and food stock decrements in real time, preventing kitchen inventory theft and managing attached table tabs.',
    whatItIs: 'An integrated food & beverage inventory and quick-sale billing module.',
    whyClubsNeedIt: 'Unrecorded snack sales, missing cold drink cans, and pilferage can cost venue owners ₹15,000–₹40,000 every month.',
    howItWorks: [
      'Add canteen menu items with purchase cost and selling price.',
      'When items are billed, inventory counts decrement automatically.',
      'View low-stock indicators to reorder fast-moving items before they run out.',
      'Audit monthly canteen gross margins and best-selling snacks.',
    ],
    whoItIsFor: [
      'Snooker clubs selling packaged beverages, energy drinks, and noodles',
      'Gaming cafes with dedicated snack bars and coffee counters',
    ],
    faqs: [
      { q: 'Can I track canteen profit margins?', a: 'Yes. JustClub calculates gross profit per item based on purchase cost and selling price.' },
    ],
  },
  {
    slug: 'staff-management',
    name: 'Staff & Shift Management',
    title: 'Club Staff Shift Management & Cash Audit Software | JustClub',
    description: 'Role-based staff management software for snooker & gaming clubs. Granular marker permissions, shift closing audits & cashier anti-pilferage controls.',
    h1: 'Club Staff Shift Management & Anti-Pilferage Controls',
    tag: 'Staff & Security',
    summary: 'JustClub Staff Management protects venue revenue with strict role-based access permissions, audit logs, and mandatory shift closing cash reconciliations.',
    whatItIs: 'A security and operational control system for club employees, floor markers, and cashiers.',
    whyClubsNeedIt: 'Unauthorized rate discounts, deleted invoices, and unrecorded cash payments during unsupervised night shifts erode club profits.',
    howItWorks: [
      'Create staff logins with specific roles (Admin, Manager, Marker, Cashier).',
      'Markers can start/pause timers but cannot delete invoices or edit tariffs.',
      'At the end of each shift, staff submit a closing declaration matching physical cash and UPI with recorded sessions.',
      'Owners receive automated shift summary reports showing discrepancies.',
    ],
    whoItIsFor: [
      'Club owners managing staff across multiple shifts or absentee owners',
      'Multi-table venues with dedicated floor markers',
    ],
    faqs: [
      { q: 'Can staff delete past bills without my knowledge?', a: 'No. Bill deletions and rate overrides require manager authorization and are permanently recorded in the audit log.' },
    ],
  },
  {
    slug: 'revenue-reports',
    name: 'Revenue Reports & Analytics',
    title: 'Snooker Club Revenue Analytics & Table Utilization | JustClub',
    description: 'Comprehensive financial reporting and analytics for sports clubs in India. Daily sales, table utilization rates, peak hours & profit/loss statements.',
    h1: 'Real-Time Revenue Reports & Table Utilization Analytics',
    tag: 'Analytics & Reporting',
    summary: 'JustClub Revenue Reports provide real-time visibility into daily table earnings, canteen turnover, table occupancy rates, and member receivables.',
    whatItIs: 'A financial and operational analytics dashboard delivering actionable business intelligence for club owners.',
    whyClubsNeedIt: 'Understanding peak occupancy hours and underutilized tables is necessary to optimize pricing and staff scheduling.',
    howItWorks: [
      'View live daily, weekly, monthly, and yearly revenue breakdowns.',
      'Filter revenue by Game Type (Snooker vs Pool vs PS5 vs Canteen).',
      'Analyze hourly occupancy heatmaps to identify slow afternoon slots.',
      'Export comprehensive Excel / PDF reports for tax and partnership accounting.',
    ],
    whoItIsFor: [
      'Club owners, partners, and investors tracking financial performance',
    ],
    faqs: [
      { q: 'Can I export reports for my accountant?', a: 'Yes. All revenue, payment mode, and GST reports can be downloaded as Excel or PDF summaries.' },
    ],
  },
  {
    slug: 'whatsapp',
    name: 'WhatsApp Digital Invoicing',
    title: 'WhatsApp Invoicing & Debt Payment Reminders for Clubs | JustClub',
    description: '1-click WhatsApp bill delivery and debt payment reminders for snooker clubs. Send itemized receipts with embedded UPI payment links.',
    h1: '1-Click WhatsApp Invoicing & Customer Debt Reminders',
    tag: 'WhatsApp CRM',
    summary: 'JustClub connects directly with WhatsApp to deliver instant digital receipts, table booking confirmations, and member debt reminders.',
    whatItIs: 'A friction-free WhatsApp integration that sends itemized session invoices directly to customer phones.',
    whyClubsNeedIt: 'Paper thermal receipts are easily lost and costly to print. WhatsApp bills provide permanent digital proof and embedded 1-tap UPI payment links.',
    howItWorks: [
      'At checkout, tap "Send WhatsApp Bill".',
      'JustClub generates a pre-formatted message with table breakdown, duration, canteen items, and UPI payment link.',
      'WhatsApp opens automatically on your counter device or marker phone.',
      'Customer receives an official branded receipt on their phone.',
    ],
    whoItIsFor: [
      'Modern clubs aiming for paperless, mobile-first customer communication',
    ],
    faqs: [
      { q: 'Does WhatsApp invoicing cost extra per message?', a: 'No! JustClub uses direct deep linking that leverages your existing WhatsApp app with zero per-SMS gateway fees.' },
    ],
  },
  {
    slug: 'ledger',
    name: 'Customer Khata Ledger',
    title: 'Club Customer Khata Ledger & Credit Management Software | JustClub',
    description: 'Digital customer khata credit ledger for Indian snooker & gaming clubs. Track member debts, advance deposits & automated WhatsApp payment links.',
    h1: 'Digital Customer Khata Ledger & Credit Management Software',
    tag: 'Khata Accounting',
    summary: 'JustClub Khata Ledger replaces messy physical debt registers with an auditable digital credit tracking system with 1-click WhatsApp payment reminders.',
    whatItIs: 'A digital credit accounting ledger built specifically for Indian club customer relationships.',
    whyClubsNeedIt: 'Allowing trusted regular players to play on credit is common in Indian clubs, but forgotten debts and lost paper notes result in massive uncollected arrears.',
    howItWorks: [
      'Select customer profile during checkout and tap "Add to Khata (Credit)".',
      'Outstanding balance updates instantly with full session date and time stamps.',
      'When customer makes a partial or full payment, record the settlement via Cash or UPI.',
      'Send polite 1-click WhatsApp balance statements with embedded payment links.',
    ],
    whoItIsFor: [
      'Indian snooker and pool parlors managing regular customer credit tabs',
    ],
    faqs: [
      { q: 'Can I set a maximum credit limit per customer?', a: 'Yes. You can configure credit limits to prevent members from accumulating excessive debt.' },
    ],
  },
  {
    slug: 'gst-billing',
    name: 'GST Billing & Tax Invoices',
    title: 'GST-Compliant Club Billing Software for India | JustClub',
    description: 'GST-compliant snooker and gaming club billing software. Automated CGST & SGST breakdowns, B2B tax invoices & monthly GST report summaries.',
    h1: 'GST-Compliant Club Billing & Tax Invoicing Software',
    tag: 'GST & Compliance',
    summary: 'JustClub GST Billing automates GST calculation across table tariffs and canteen items, generating tax invoices and summary reports for easy monthly filings.',
    whatItIs: 'A tax compliance module adhering to Indian Goods & Services Tax regulations for recreation and hospitality venues.',
    whyClubsNeedIt: 'Registered clubs must generate GST invoices showing explicit CGST and SGST breakdowns and file monthly GSTR-1 and GSTR-3B summaries.',
    howItWorks: [
      'Enable GST mode in settings and enter your 15-digit GSTIN.',
      'Configure GST rates (e.g., 18% on table gaming tariffs, 5% on packaged snacks).',
      'Invoices automatically calculate and display base amount, CGST, SGST, and total.',
      'Export monthly GST summary reports ready for your chartered accountant.',
    ],
    whoItIsFor: [
      'GST-registered sports recreation clubs, gaming cafes, and corporate lounges',
    ],
    faqs: [
      { q: 'Is GST billing mandatory in JustClub?', a: 'No. If your club is not GST registered, you can keep GST disabled and generate simple non-tax bills.' },
    ],
  },
];

export const featurePages: PageMeta[] = FEATURES.map((feat) => {
  const slug = `features/${feat.slug}`;
  const canonical = `${BASE_URL}/${slug}/`;

  return {
    slug,
    title: feat.title,
    description: feat.description,
    canonical,
    h1: feat.h1,
    category: 'Features',
    jsonLd: [
      ORG_NODE,
      WEBSITE_NODE,
      SOFTWARE_NODE,
      {
        '@type': 'WebPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: feat.title,
        description: feat.description,
        isPartOf: { '@id': `${BASE_URL}/#website` },
        breadcrumb: { '@id': `${canonical}#breadcrumb` },
      },
      buildBreadcrumbSchema([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Features', url: `${BASE_URL}/club-management-software/` },
        { name: feat.name, url: canonical },
      ]),
    ],
    contentHtml: `
      ${renderBreadcrumbsHtml([
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Features', url: `${BASE_URL}/club-management-software/` },
        { name: feat.name, url: canonical },
      ])}
      <article class="hero-card">
        <span class="meta-tag">${feat.tag}</span>
        <h1>${feat.h1}</h1>
        
        <div class="quick-answer">
          <strong>Quick answer:</strong> ${feat.summary}
        </div>

        <div class="author-attribution">
          <span>Published by <strong>JustClub Engineering</strong></span>
          <span>•</span>
          <span>Last updated: <strong>${LAST_UPDATED}</strong></span>
        </div>

        <h2>What It Is</h2>
        <p>${feat.whatItIs}</p>

        <h2>Why Clubs Need It</h2>
        <p>${feat.whyClubsNeedIt}</p>

        <h2>How It Works & Real Workflow</h2>
        <ol>
          ${feat.howItWorks.map((step) => `<li>${step}</li>`).join('\n          ')}
        </ol>

        <h2>Who It Is For</h2>
        <ul>
          ${feat.whoItIsFor.map((item) => `<li>${item}</li>`).join('\n          ')}
        </ul>

        <div class="faq-section">
          <h2>Frequently Asked Questions</h2>
          ${feat.faqs
            .map(
              (faq) => `
          <div class="faq-item">
            <h3>${faq.q}</h3>
            <p>${faq.a}</p>
          </div>`
            )
            .join('')}
        </div>

        <div class="cta-banner">
          <h2>Experience ${feat.name} with JustClub</h2>
          <p>Get started with a full-featured 15-day free trial. Setup takes less than 2 minutes.</p>
          <a href="/#pricing" class="cta-btn">Start 15-Day Free Trial</a>
        </div>
      </article>
    `,
  };
});
