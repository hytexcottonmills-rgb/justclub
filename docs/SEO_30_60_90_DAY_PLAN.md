# JustClub — 30 / 60 / 90 Day SEO Execution Roadmap

**Domain:** `https://justclub.in/`  
**Execution Lead:** SEO Architect & Technical Engineering Team  
**Scope:** Existing 64 Prerendered Static Pages + Strategic Internal Authority Mesh  
**Date:** September 21, 2026  

---

## Phase 1: Days 1 – 30 | Foundation, Cannibalization Fencing & GSC Activation

### Core Objective
Ensure 100% indexing of all 64 sitemap URLs in Google Search Console, enforce strict canonical keyword boundaries to prevent cannibalization, and harden internal link pathways between core commercial hubs.

### Action Items:
1. **Google Search Console Indexation Monitoring**:
   - Track the 64 URLs in Google Search Console > **Page Indexing**.
   - Inspect individual URLs if any remain in "Discovered - currently not indexed" status after 14 days.
   - Confirm zero duplicate canonical warnings and zero `noindex` misconfigurations.
2. **Cannibalization Fencing**:
   - Review title tags and `<h1>` headings across the 4 flagship commercial hubs (`/snooker-club-management-software/`, `/snooker-software-india/`, `/snooker-billing-software/`, `/snooker-table-timer/`) to ensure exact target keyword alignment as defined in `SEO_CANNIBALIZATION_AUDIT.md`.
3. **Internal Linking Hardening**:
   - Audit contextual internal links across all 64 pages to eliminate generic anchor text (`click here`, `read more`).
   - Implement direct contextual bridges from the 12 local city pages to `/features/upi-payments/`, `/features/whatsapp/`, and `/tools/snooker-club-profit-calculator/`.
4. **Interactive Calculators Verification**:
   - Verify that all 3 interactive tools (`/tools/snooker-club-profit-calculator/`, `/tools/snooker-table-revenue-calculator/`, `/tools/snooker-club-break-even-calculator/`) execute smoothly client-side with zero JS console errors.
5. **Schema & JSON-LD Validation**:
   - Validate `@graph` schemas (`SoftwareApplication`, `Organization`, `WebPage`, `FAQPage`, `BreadcrumbList`) across Rich Results Test for 0 syntax warnings.

---

## Phase 2: Days 31 – 60 | High-Intent Feature Deepening & Competitor Interception

### Core Objective
Deepen high-converting commercial pages, capture switchers searching for CueFlow/Generic POS alternatives, and enhance local relevance in top Indian metro hubs.

### Action Items:
1. **P0 Commercial Landing Page Deepening**:
   - **`/features/upi-payments/`**: Add step-by-step UI walkthrough showing dynamic QR generation, instant cashier payment reconciliation, and cashier tip management.
   - **`/features/ledger/`**: Add detailed workflows for player khata tracking, automated WhatsApp balance reminders, and UPI payment link generation.
   - **`/snooker-billing-software/`**: Provide illustrated examples of pro-rata minute billing vs 15-minute block rounding and "loser pays frame" calculations.
2. **Competitor Teardown Refinement**:
   - **`/compare/justclub-vs-cueflow/`**: Refresh feature comparison table to objectively highlight Indian payment workflows (UPI QR), WhatsApp receipts, and local Tier-1/Tier-2 support without making derogatory claims.
   - **`/compare/justclub-vs-generic-pos/`**: Clarify why generic retail POS (Petpooja, Vyapar) fails for time-based table billing.
3. **Local City Page Context Enhancement**:
   - Deepen content on the top 4 metro pages (**Bangalore, Chennai, Hyderabad, Delhi NCR**) by adding regional snooker scene context, local tournament hubs, and prominent cue sports neighborhood references.
4. **Google Search Console Initial Harvesting**:
   - Review queries generating impressions in positions 10–30.
   - Incorporate emerging long-tail question queries into the relevant page FAQ sections.

---

## Phase 3: Days 61 – 90 | Authority Building, First-Party Insights & Directory Feasibility

### Core Objective
Establish JustClub as the definitive authority on cue sports operations in India through original benchmark data and evaluate the public club directory roadmap.

### Action Items:
1. **First-Party Industry Benchmark Report**:
   - Publish the **"State of Indian Snooker & Cue-Sports Clubs 2026"** report on `/resources/` using anonymized operational trends (average table occupancy, peak hour revenue patterns, hourly rate averages across metros).
   - Leverage this original report to earn organic editorial backlinks from sports blogs, recreation trade publications, and regional news portals.
2. **GSC Query Pruning & Position 4–20 Promotion**:
   - Identify commercial queries ranking in positions 4–10 with high search impressions.
   - Optimize title tags for higher organic Click-Through Rate (CTR) and add targeted subheadings answering secondary intent questions.
3. **Club Directory MVP Evaluation**:
   - Review findings from `CLUB_DIRECTORY_SEO_EVALUATION.md`.
   - If human verification and data hygiene standards are met, architect a 50-club pilot directory in Bangalore and Chennai to test local discovery and user value.
4. **Continuous Core Web Vitals & Technical Maintenance**:
   - Audit mobile performance, LCP, CLS, and FID across all static routes to ensure 95+ PageSpeed scores across all devices.
