# JustClub — Weekly Google Search Console (GSC) SEO Playbook

**Domain:** `https://justclub.in/`  
**Review Frequency:** Weekly (Every Monday)  
**Target Search Market:** India (English)  
**Tool Requirements:** Google Search Console, Google Analytics 4, Internal Keyword Master Map  

---

## 1. Weekly Execution Workflow Overview

```text
       [ Monday 09:00 AM: GSC Weekly Audit ]
                        │
       ┌────────────────┼────────────────┐
       ▼                ▼                ▼
[ Indexing & Health ]  [ Query Harvest ]  [ Page CTR & Striking Distance ]
 - 64 URLs Validated   - Rising Queries   - Pos 4-10: Striking Distance
 - 0 Errors / 404s     - New Intent Gaps  - High Imp / Low CTR: Title Rewrite
 - 0 Excluded Alarms   - Cannibalization  - Top Converters: Internal Links
```

---

## 2. Step 1: Technical & Indexing Health Check (5 Mins)

1. Navigate to **Google Search Console > Indexing > Pages**.
2. **Key Metric Checklist**:
   - Total Indexed Pages: Expected **64**.
   - "Discovered - currently not indexed": Investigate any newly reported URLs.
   - "Crawled - currently not indexed": Check for potential thin content or canonical mismatches.
   - "Duplicate without user-selected canonical": Confirm count is **0**.
3. **Sitemaps Tab**:
   - Check `https://justclub.in/sitemap.xml`.
   - Ensure status is **Success** with **64** discovered URLs.

---

## 3. Step 2: Striking-Distance Query Optimization (Positions 4 – 20) (15 Mins)

Queries ranking in positions **4 to 20** represent high-leverage opportunities: they already have Google's algorithmic trust and need only minor on-page refinement to reach the Top 3.

### Workflow:
1. Go to **Performance > Search Results**.
2. Set Date Range to **Last 28 Days**.
3. Filter: **Position > 3.9** and **Position < 20.1**.
4. Sort by **Impressions (Descending)**.
5. Identify top 5 commercial queries (e.g. `snooker billing software india`, `snooker table timer online`).
6. Click the query > Switch to **Pages** tab to see which URL is ranking.
7. **Optimization Action**:
   - Does the page `<h1>` or `<h2>` include the query variation naturally?
   - Add a 2–3 sentence direct answer or FAQ item addressing that specific query.
   - Add an internal link from a high-authority hub (e.g. `/snooker-club-management-software/`) using that query as anchor text.

---

## 4. Step 3: Click-Through Rate (CTR) Rescue (High Impressions / Low CTR) (10 Mins)

When a page ranks in positions 1–5 but receives lower than expected CTR (<3% for top 3, <1.5% for top 5), the snippet (Title & Meta Description) fails to compel searchers.

### Benchmark CTR by Position (Commercial B2B):
- **Position 1**: 20% – 30%
- **Position 2**: 12% – 18%
- **Position 3**: 8% – 12%
- **Position 4–5**: 4% – 7%
- **Position 6–10**: 1% – 3%

### Optimization Action:
1. Filter queries in positions 1–5 with CTR below the benchmark.
2. Review the `<title>` and `<meta name="description">` tags in `seo/pages.ts`.
3. **Enhancement Formulas**:
   - Add clear Indian context: `"with Dynamic UPI & WhatsApp Invoicing"`
   - Add clear value proof: `"Zero Hardware Required • 15-Day Free Trial"`
   - Ensure title length remains strictly between **50–60 characters** to prevent ellipsis cutoff.

---

## 5. Step 4: Cannibalization & Query Dilution Audit (10 Mins)

1. Select a high-impression target query (e.g., `snooker club software`).
2. Navigate to the **Pages** tab.
3. If impressions are split across multiple pages (e.g., `/snooker-club-management-software/` has 50% and `/snooker-software-india/` has 40%):
   - Check which page is converting better in GA4.
   - Designate the primary canonical owner.
   - Adjust on-page subheadings on the secondary page to focus on its unique intent (e.g. national compliance vs global feature set).
   - Ensure the secondary page links to the primary page using the exact target phrase.

---

## 6. Step 5: New Query Harvesting & Content Enrichment (10 Mins)

1. Filter for queries with **Impressions > 50** and **Clicks = 0** in the last 28 days.
2. Group these queries by semantic intent:
   - **Operational Questions** (e.g. *"how to calculate snooker frame split bill"*): Add direct answers to `/how-to-bill-snooker-table-time/`.
   - **Local Intent Queries** (e.g. *"snooker software near me"*): Ensure local city landing pages contain accurate regional landmark cues.
   - **Feature Inquiries** (e.g. *"does justclub support phonepe qr"*): Update `/features/upi-payments/` with supported UPI apps (GPay, PhonePe, Paytm, BHIM).

---

## 7. Weekly GSC Tracking Log Template

| Date | Total Indexable URLs | Total Clicks (L28D) | Total Impressions (L28D) | Avg. Position | Top Striking-Distance Query Identified | Action Taken |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| W1 | 64 | — | — | — | Baseline setup | Sitemap verified (64 URLs) |
| W2 | 64 | | | | | |
| W3 | 64 | | | | | |
