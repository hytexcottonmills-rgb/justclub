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
  :root {
    --sat: env(safe-area-inset-top, 0px);
    --sab: env(safe-area-inset-bottom, 0px);
    --sal: env(safe-area-inset-left, 0px);
    --sar: env(safe-area-inset-right, 0px);
  }
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  html {
    font-size: 16px;
    -webkit-text-size-adjust: 100%;
    scroll-behavior: smooth;
  }
  body {
    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: #090d16;
    color: #f8fafc;
    line-height: 1.65;
    font-size: 1rem;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    width: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  a {
    color: #818cf8;
    text-decoration: none;
    transition: color 0.15s ease, opacity 0.15s ease;
    padding: 2px 0;
  }
  @media (hover: hover) {
    a:hover { color: #a5b4fc; text-decoration: underline; }
  }
  
  .container {
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 clamp(1rem, 3.5vw, 2rem);
  }
  main.container {
    flex: 1 0 auto;
    padding-bottom: clamp(2.5rem, 5vw, 4rem);
  }

  header {
    border-bottom: 1px solid #1e293b;
    background-color: rgba(9, 13, 22, 0.95);
    position: sticky;
    top: 0;
    z-index: 50;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    padding-top: var(--sat);
    padding-left: var(--sal);
    padding-right: var(--sar);
  }
  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 clamp(1rem, 3.5vw, 2rem);
    gap: 0.75rem;
  }
  .brand-logo {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-weight: 900;
    font-size: clamp(1.1rem, 2.5vw, 1.25rem);
    color: #ffffff;
    text-decoration: none !important;
    flex-shrink: 0;
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
    gap: 1.25rem;
    align-items: center;
  }
  @media (min-width: 860px) {
    .header-nav { display: flex; }
  }
  .header-nav a {
    color: #94a3b8;
    font-size: 0.875rem;
    font-weight: 600;
  }
  @media (hover: hover) {
    .header-nav a:hover {
      color: #ffffff;
      text-decoration: none;
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .cta-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: #635bff;
    color: #ffffff !important;
    font-weight: 700;
    font-size: clamp(0.8rem, 1.5vw, 0.875rem);
    padding: 0.65rem clamp(0.85rem, 2vw, 1.25rem);
    min-height: 44px;
    border-radius: 0.75rem;
    text-decoration: none !important;
    box-shadow: 0 4px 14px rgba(99, 91, 255, 0.35);
    transition: background 0.15s ease, transform 0.15s ease;
    white-space: nowrap;
    text-align: center;
  }
  @media (hover: hover) {
    .cta-btn:hover { background: #4f46e5; transform: translateY(-1px); }
  }
  .cta-btn:active { transform: translateY(1px); }

  .cta-btn-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: #1e293b;
    color: #f1f5f9 !important;
    font-weight: 700;
    font-size: clamp(0.8rem, 1.5vw, 0.875rem);
    padding: 0.65rem clamp(0.85rem, 2vw, 1.25rem);
    min-height: 44px;
    border-radius: 0.75rem;
    text-decoration: none !important;
    border: 1px solid #334155;
    transition: background 0.15s ease;
    white-space: nowrap;
    text-align: center;
  }
  @media (hover: hover) {
    .cta-btn-secondary:hover { background: #334155; text-decoration: none !important; }
  }

  .mobile-menu-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 0.65rem;
    background: #1e293b;
    border: 1px solid #334155;
    color: #f8fafc;
    cursor: pointer;
    padding: 0;
    transition: background 0.15s ease;
  }
  .mobile-menu-btn:hover { background: #334155; }
  .mobile-menu-btn svg { width: 22px; height: 22px; }
  @media (min-width: 860px) {
    .mobile-menu-btn { display: none; }
  }

  /* Mobile Nav Overlay & Drawer */
  .mobile-nav-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 99;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
  }
  .mobile-nav-overlay.open {
    opacity: 1;
    pointer-events: auto;
  }
  .mobile-nav-drawer {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: min(85vw, 360px);
    background: #0b1120;
    border-left: 1px solid #1e293b;
    padding: calc(var(--sat) + 1.25rem) 1.5rem calc(var(--sab) + 1.5rem) 1.5rem;
    z-index: 100;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    transform: translateX(100%);
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .mobile-nav-drawer.open {
    transform: translateX(0);
  }
  .mobile-nav-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 1rem;
    border-bottom: 1px solid #1e293b;
  }
  .mobile-nav-close {
    background: #1e293b;
    border: 1px solid #334155;
    color: #cbd5e1;
    width: 38px;
    height: 38px;
    border-radius: 0.5rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .mobile-nav-links {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .mobile-nav-links a {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    color: #e2e8f0;
    font-weight: 600;
    font-size: 0.95rem;
    background: #0f172a;
    border: 1px solid #1e293b;
    text-decoration: none !important;
    min-height: 48px;
  }
  .mobile-nav-links a:hover {
    background: #1e293b;
    color: #ffffff;
  }

  .breadcrumbs {
    padding: clamp(0.75rem, 2vw, 1.25rem) 0;
    font-size: clamp(0.75rem, 1.5vw, 0.85rem);
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 0.35rem 0.5rem;
    flex-wrap: wrap;
    line-height: 1.4;
  }
  .breadcrumbs a { color: #94a3b8; }
  .breadcrumbs span.separator { color: #475569; }

  .hero-card {
    padding: 1.25rem 0 2rem 0;
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
    font-size: clamp(1.65rem, 4vw + 0.5rem, 2.65rem);
    font-weight: 900;
    line-height: 1.2;
    color: #ffffff;
    margin-bottom: 1.25rem;
    letter-spacing: -0.02em;
    word-break: break-word;
    overflow-wrap: break-word;
  }
  h2 {
    font-size: clamp(1.25rem, 2.5vw + 0.3rem, 1.65rem);
    font-weight: 800;
    color: #ffffff;
    margin: clamp(2rem, 4vw, 2.75rem) 0 1rem 0;
    letter-spacing: -0.01em;
    word-break: break-word;
    overflow-wrap: break-word;
  }
  h3 {
    font-size: clamp(1.05rem, 1.8vw + 0.2rem, 1.25rem);
    font-weight: 700;
    color: #f1f5f9;
    margin: 1.5rem 0 0.75rem 0;
    word-break: break-word;
    overflow-wrap: break-word;
  }
  p {
    margin-bottom: 1.25rem;
    color: #cbd5e1;
    font-size: clamp(0.95rem, 0.4vw + 0.85rem, 1.05rem);
    line-height: 1.7;
    word-break: break-word;
    overflow-wrap: break-word;
  }
  strong { color: #f1f5f9; }
  ul, ol {
    margin-bottom: 1.5rem;
    padding-left: clamp(1.25rem, 3vw, 1.75rem);
    color: #cbd5e1;
    font-size: clamp(0.95rem, 0.4vw + 0.85rem, 1.05rem);
    line-height: 1.7;
  }
  li { margin-bottom: 0.5rem; word-break: break-word; }

  .quick-answer {
    background: #0f172a;
    border-left: 4px solid #635bff;
    border-radius: 0 0.75rem 0.75rem 0;
    padding: clamp(1rem, 2.5vw, 1.35rem) clamp(1rem, 3vw, 1.5rem);
    margin-bottom: 2rem;
    font-size: clamp(0.95rem, 1vw + 0.5rem, 1.05rem);
    color: #cbd5e1;
    line-height: 1.65;
    word-break: break-word;
  }
  .quick-answer strong { color: #ffffff; }

  .author-attribution {
    font-size: clamp(0.8rem, 1.2vw, 0.875rem);
    color: #94a3b8;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  /* Tables & Responsive Wrapper */
  .table-wrapper {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    margin: 1.75rem 0;
    border: 1px solid #1e293b;
    border-radius: 0.75rem;
    background: #0f172a;
    position: relative;
  }
  .table-wrapper::-webkit-scrollbar {
    height: 6px;
  }
  .table-wrapper::-webkit-scrollbar-track {
    background: #090d16;
  }
  .table-wrapper::-webkit-scrollbar-thumb {
    background: #334155;
    border-radius: 3px;
  }
  table {
    width: 100%;
    min-width: 520px;
    border-collapse: collapse;
    font-size: clamp(0.85rem, 0.5vw + 0.75rem, 0.95rem);
    text-align: left;
  }
  th {
    background: #1e293b;
    color: #f1f5f9;
    padding: clamp(0.75rem, 1.5vw, 0.95rem) clamp(0.75rem, 2vw, 1.15rem);
    font-weight: 700;
    border-bottom: 1px solid #334155;
    white-space: nowrap;
  }
  td {
    padding: clamp(0.75rem, 1.5vw, 0.95rem) clamp(0.75rem, 2vw, 1.15rem);
    border-bottom: 1px solid #1e293b;
    color: #cbd5e1;
    line-height: 1.55;
  }
  tr:nth-child(even) td {
    background: rgba(30, 41, 59, 0.3);
  }
  tr:last-child td { border-bottom: none; }

  /* Feature Grids */
  .feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
    gap: clamp(1rem, 2vw, 1.5rem);
    margin: 2rem 0;
  }
  .feature-card {
    background: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 0.75rem;
    padding: clamp(1.15rem, 2.5vw, 1.5rem);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: border-color 0.2s ease, transform 0.2s ease;
  }
  @media (hover: hover) {
    .feature-card:hover {
      border-color: rgba(99, 91, 255, 0.4);
      transform: translateY(-2px);
    }
  }
  .feature-card h3 { margin-top: 0; color: #ffffff; }
  .feature-card p { font-size: 0.925rem; margin-bottom: 0; line-height: 1.6; }

  .example-box {
    background: #111827;
    border: 1px solid #374151;
    border-radius: 0.75rem;
    padding: clamp(1.15rem, 2.5vw, 1.5rem);
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

  .faq-section { margin: clamp(2.5rem, 5vw, 3.5rem) 0; }
  .faq-item {
    background: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 0.75rem;
    padding: clamp(1.15rem, 2.5vw, 1.5rem);
    margin-bottom: 1rem;
  }
  .faq-item h3 {
    font-size: clamp(1rem, 1.5vw + 0.3rem, 1.15rem);
    font-weight: 700;
    color: #ffffff;
    margin-top: 0;
    margin-bottom: 0.5rem;
  }
  .faq-item p { margin-bottom: 0; }

  /* Interactive Calculators */
  .calc-box {
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 1rem;
    padding: clamp(1.25rem, 3vw, 2rem);
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
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    font-size: 16px; /* Prevents auto-zoom on iOS */
    min-height: 48px;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .calc-input:focus {
    outline: none;
    border-color: #635bff;
    box-shadow: 0 0 0 3px rgba(99, 91, 255, 0.25);
  }
  .calc-result-box {
    background: #020617;
    border: 1px solid #3730a3;
    border-radius: 0.75rem;
    padding: clamp(1.15rem, 2.5vw, 1.6rem);
    margin-top: 1.5rem;
  }

  /* CTA Banner */
  .cta-banner {
    background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
    border: 1px solid #3730a3;
    border-radius: 1rem;
    padding: clamp(2rem, 5vw, 3.5rem) clamp(1.25rem, 4vw, 2.5rem);
    text-align: center;
    margin: clamp(2.5rem, 6vw, 4rem) 0;
  }
  .cta-banner h2 { margin-top: 0; margin-bottom: 0.75rem; }
  .cta-banner p { max-width: 620px; margin: 0 auto 1.5rem auto; color: #cbd5e1; font-size: clamp(0.95rem, 1.2vw, 1.05rem); }
  @media (max-width: 480px) {
    .cta-banner .cta-btn, .cta-banner .cta-btn-secondary {
      width: 100%;
      justify-content: center;
    }
  }

  /* Footer */
  footer {
    border-top: 1px solid #1e293b;
    background: #050811;
    padding: clamp(2.5rem, 5vw, 4rem) 0 calc(var(--sab) + 1.5rem) 0;
    font-size: 0.875rem;
    color: #94a3b8;
    padding-left: var(--sal);
    padding-right: var(--sar);
  }
  .footer-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr));
    gap: clamp(1.5rem, 3vw, 2.5rem);
    margin-bottom: 2.5rem;
  }
  @media (min-width: 1024px) {
    .footer-grid { grid-template-columns: 1.6fr 1fr 1fr 1.1fr 1fr; }
  }
  .footer-col h4 {
    color: #f1f5f9;
    font-size: 0.85rem;
    margin-bottom: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .footer-col ul { list-style: none; padding-left: 0; margin-bottom: 0; }
  .footer-col li { margin-bottom: 0.4rem; }
  .footer-col a {
    color: #818cf8;
    text-decoration: none;
    display: inline-block;
    padding: 0.25rem 0;
    min-height: 32px;
    line-height: 1.5;
  }
  @media (hover: hover) {
    .footer-col a:hover { color: #a5b4fc; text-decoration: underline; }
  }
  .footer-bottom {
    border-top: 1px solid #1e293b;
    padding-top: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    justify-content: space-between;
    align-items: flex-start;
    color: #94a3b8;
    font-size: 0.8rem;
  }
  @media (min-width: 640px) {
    .footer-bottom {
      flex-direction: row;
      align-items: center;
    }
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
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
        <a href="/" class="brand-logo" aria-label="JustClub Home">
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
        <div class="header-actions">
          <a href="/#pricing" class="cta-btn">Free Trial</a>
          <button type="button" class="mobile-menu-btn" id="mobile-menu-toggle" aria-label="Open mobile navigation menu" aria-expanded="false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Mobile Navigation Overlay & Drawer -->
    <div class="mobile-nav-overlay" id="mobile-nav-overlay" aria-hidden="true"></div>
    <div class="mobile-nav-drawer" id="mobile-nav-drawer" aria-label="Mobile Navigation" role="dialog" aria-modal="true">
      <div class="mobile-nav-header">
        <a href="/" class="brand-logo">
          <span><span class="highlight">just</span>club</span>
          <span class="badge">OS</span>
        </a>
        <button type="button" class="mobile-nav-close" id="mobile-nav-close" aria-label="Close menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="mobile-nav-links">
        <a href="/club-management-software/">✨ Solutions &amp; POS</a>
        <a href="/snooker-software-india/">🇮🇳 India Hub</a>
        <a href="/locations/india/bangalore/">📍 City Locations</a>
        <a href="/tools/snooker-club-profit-calculator/">📊 Profit &amp; Yield Calculators</a>
        <a href="/resources/">📖 Guides &amp; Resources</a>
        <a href="/compare/">⚡ JustClub vs Alternatives</a>
        <a href="/about/">🏢 About Us</a>
        <a href="/contact/">💬 Contact &amp; Support</a>
      </div>
      <div style="margin-top: auto; padding-top: 1rem;">
        <a href="/#pricing" class="cta-btn" style="width: 100%; min-height: 48px; font-size: 1rem;">Start 15-Day Free Trial</a>
      </div>
    </div>

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
            <p style="font-size: 0.875rem; color: #94a3b8; margin-bottom: 0.75rem; line-height: 1.6;">
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

    <script>
      (function() {
        const toggleBtn = document.getElementById('mobile-menu-toggle');
        const closeBtn = document.getElementById('mobile-nav-close');
        const overlay = document.getElementById('mobile-nav-overlay');
        const drawer = document.getElementById('mobile-nav-drawer');

        function openMenu() {
          if (!drawer || !overlay) return;
          drawer.classList.add('open');
          overlay.classList.add('open');
          overlay.setAttribute('aria-hidden', 'false');
          if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
          document.body.style.overflow = 'hidden';
        }

        function closeMenu() {
          if (!drawer || !overlay) return;
          drawer.classList.remove('open');
          overlay.classList.remove('open');
          overlay.setAttribute('aria-hidden', 'true');
          if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }

        if (toggleBtn) toggleBtn.addEventListener('click', openMenu);
        if (closeBtn) closeBtn.addEventListener('click', closeMenu);
        if (overlay) overlay.addEventListener('click', closeMenu);

        document.addEventListener('keydown', function(e) {
          if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
            closeMenu();
          }
        });

        const drawerLinks = drawer ? drawer.querySelectorAll('a') : [];
        drawerLinks.forEach(function(link) {
          link.addEventListener('click', closeMenu);
        });
      })();
    </script>
  </body>
</html>`;
}
