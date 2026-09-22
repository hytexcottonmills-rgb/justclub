# JustClub — Search Intent Cannibalization Audit & Boundary Rules

**Domain:** `https://justclub.in/`  
**Total Pages Audited:** 64 Indexable URLs  
**Audit Purpose:** Prevent internal keyword competition, avoid ranking dilution in Google Search Console, and enforce distinct search intent boundaries across all commercial, national, local, and feature pages.

---

## 1. High-Risk Cannibalization Clusters & Resolution

### Conflict Group 1: Snooker Core vs India National vs Billing vs Timer
- **URLs in Contention:**
  1. `/snooker-club-management-software/` (Global/Category Core)
  2. `/snooker-software-india/` (National India Hub)
  3. `/snooker-billing-software/` (Billing & Cashier Intent)
  4. `/snooker-table-timer/` (Timer Hardware & Digital Clock Intent)
  5. `/features/table-billing/` (Deep Feature Mechanics)
  6. `/features/live-table-timer/` (Live Multi-Table Screen Feature)

#### Overlap Analysis & Risk:
Without clear boundaries, all 6 pages could attempt to rank for the head term `"snooker club software"`, causing Google to alternate URLs in the SERP and lower overall rank position.

#### Intent & Keyword Boundary Matrix:

| URL | Exact Canonical Target Keyword | Excluded Keywords (Do NOT target in H1/Title) | Primary User Search Intent | Primary CTA / Next Step |
| :--- | :--- | :--- | :--- | :--- |
| `/snooker-club-management-software/` | `snooker club management software` | `snooker software india`, `snooker billing software` | Evaluates all-in-one software to run an entire snooker parlor. | Start 15-Day Free Trial |
| `/snooker-software-india/` | `snooker software India` | `snooker club management software` (unqualified) | Indian club owner seeking localized software with UPI, GST, and INR pricing. | Explore India Features & Pricing |
| `/snooker-billing-software/` | `snooker billing software` | `snooker table timer`, `snooker parlor management` | Cashier/owner looking specifically to generate bills and calculate game charges. | View Billing Demo |
| `/snooker-table-timer/` | `snooker table timer` | `snooker billing software`, `club management software` | Owner searching for a replacement for physical light timers or stopwatches. | Test Cloud Timer |
| `/features/table-billing/` | `snooker table billing` | `snooker club management software`, `best snooker software` | User investigating how rate cards, 15-minute rounding, and frame splits work. | See Rate Configuration |
| `/features/live-table-timer/` | `live table timer software` | `snooker table timer hardware` | User looking for a visual real-time multi-table status board for markers. | Try Live Dashboard |

---

### Conflict Group 2: Club Management vs Multi-Sport vs National Hub
- **URLs in Contention:**
  1. `/` (Homepage / Platform)
  2. `/club-management-software/` (Multi-Game & Sports Club Category)
  3. `/club-management-software-india/` (India Recreation & Sports Hub)
  4. `/club-pos-software/` (Point of Sale Counter Terminal)

#### Intent & Keyword Boundary Matrix:

| URL | Exact Canonical Target Keyword | Distinct Positioning | Primary Search Intent |
| :--- | :--- | :--- | :--- |
| `https://justclub.in/` | `multi-game club operating platform` | Brand flagship & complete operational operating system for modern cue and recreation clubs. | Direct brand discovery & trial signups. |
| `/club-management-software/` | `club management software` | Category-level commercial page for multi-game recreation clubs (snooker, pool, gaming, cafe). | Operator looking for complete club management software. |
| `/club-management-software-india/` | `club management software India` | Dedicated to Indian recreational clubs needing UPI, GST invoices, and WhatsApp receipts. | Indian sports and leisure club operators seeking regional compliance. |
| `/club-pos-software/` | `club POS software` | Dedicated to the counter cashier experience: table billing, canteen orders, and payment collection. | Cashier terminal & POS hardware/software evaluation. |

---

### Conflict Group 3: Pool / Billiards Category vs India Pages
- **URLs in Contention:**
  1. `/pool-club-management-software/` vs `/pool-club-software-india/` vs `/pool-billing-software/`
  2. `/billiards-club-management-software/` vs `/billiards-software-india/` vs `/billiards-billing-software/`

#### Boundary Rules:
- **Category Pages (`/pool-club-management-software/`, `/billiards-club-management-software/`)**:
  - Focus strictly on game-specific workflows (8-ball/9-ball rack rules, English/French billiards time tracking).
  - Target: `pool club management software`, `billiards club management software`.
- **India Geographic Pages (`/pool-club-software-india/`, `/billiards-software-india/`)**:
  - Focus on Indian market economic realities (commercial electricity tariffs, local parlor hourly rates in INR, UPI integration).
  - Target: `pool club software India`, `billiards software India`.
- **Billing Pages (`/pool-billing-software/`, `/billiards-billing-software/`)**:
  - Focus on the arithmetic of frame billing, rack billing, tournament entry fees, and table tabs.
  - Target: `pool billing software`, `billiards billing software`.

---

### Conflict Group 4: Khata / Ledger / Credit vs Problem Guide
- **URLs in Contention:**
  1. `/features/ledger/` (Feature landing page)
  2. `/solutions/snooker-club-credit-management/` (Operational problem/solution guide)

#### Boundary Rules:
- `/features/ledger/` targets feature hunters searching for: `club credit ledger`, `snooker khata software`, `digital khata for clubs`. Content highlights ledger UI, automatic balance alerts, and ledger export.
- `/solutions/snooker-club-credit-management/` targets pain-point searchers searching for: `how to manage customer credit in snooker club`, `stop bad debt in pool parlor`, `snooker customer debt recovery`. Content provides an operational SOP for setting credit limits and automating WhatsApp reminders.

---

### Conflict Group 5: Buyer's Guide vs Startup Guide vs Best Software Review
- **URLs in Contention:**
  1. `/resources/how-to-start-a-snooker-club-in-india/` (Business Setup)
  2. `/resources/best-snooker-club-management-software/` (Software Review / Alternatives)
  3. `/snooker-club-software-buyers-guide/` (Procurement Checklist)
  4. `/resources/snooker-table-pricing-guide/` (Tariff & Hourly Rate Strategy)

#### Boundary Rules:
- `/resources/how-to-start-a-snooker-club-in-india/`: Targets prospective entrepreneurs searching for capital expenditure (CAPEX), room dimensions, table procurement (Riley, Wiraka), and license requirements.
- `/resources/best-snooker-club-management-software/`: Targets active software buyers searching for software evaluations, feature matrices, and honest comparisons of Indian club systems.
- `/snooker-club-software-buyers-guide/`: Targets owners with budget approval ready, providing an objective 10-point checklist before purchasing any club POS.
- `/resources/snooker-table-pricing-guide/`: Targets active operators optimizing per-hour table rates, peak vs off-peak rates, and AC surcharges.

---

## 2. Canonical Anchor Text Guardrails

To prevent search engines from confusing which page to rank for specific terms, follow these strict anchor text rules across all internal links:

| Target Page | Approved Primary Anchor Phrases | BANNED Anchor Phrases (Reserved for Other Pages) |
| :--- | :--- | :--- |
| `/snooker-club-management-software/` | `snooker club management software`, `snooker club software`, `snooker parlor management` | `snooker billing software`, `snooker timer`, `snooker software India` |
| `/snooker-software-india/` | `snooker software India`, `Indian snooker club software`, `snooker management in India` | `snooker club management software`, `snooker table timer` |
| `/snooker-billing-software/` | `snooker billing software`, `snooker table billing system`, `table billing POS` | `snooker club software`, `snooker timer app` |
| `/snooker-table-timer/` | `snooker table timer`, `cloud table timer`, `digital snooker timer` | `snooker billing software`, `snooker club software` |
| `/features/upi-payments/` | `UPI billing for clubs`, `dynamic UPI QR checkout`, `UPI payment integration` | `snooker billing software`, `club POS software` |
| `/features/ledger/` | `club credit ledger`, `snooker khata software`, `player credit management` | `snooker billing software`, `club revenue reports` |
| `/tools/snooker-club-profit-calculator/` | `snooker club profit calculator`, `club ROI calculator`, `monthly profit estimator` | `how to start a snooker club`, `snooker table pricing` |

---

## 3. Regular GSC Cannibalization Monitoring Protocol
Once Search Console performance data populates:
1. Filter queries with high impressions (e.g. `snooker billing software`).
2. Check the **Pages** tab for that query.
3. If more than 1 URL receives significant impressions (>20% share each) without either ranking in the top 3, verify that:
   - The primary intended URL has the exact query in its `<title>` and `<h1>`.
   - Internal links from secondary pages use exact anchor text pointing to the designated primary URL.
   - Secondary pages do not use the exact phrase as an `<h2>` heading.
