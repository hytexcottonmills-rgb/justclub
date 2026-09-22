# JustClub — Internal Linking Architecture & Battle Map

**Domain:** `https://justclub.in/`  
**Total Nodes in Mesh:** 64 Static Indexable URLs  
**Architecture Model:** Topic Cluster Silo + Contextual Cross-Bridge Linking  
**Goal:** Pass maximum PageRank authority from top-level hubs to transactional feature and local city pages while establishing clear contextual topical relevance.

---

## 1. Information Architecture & Authority Flow

```text
                                [ Homepage: / ]
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        ▼                              ▼                              ▼
 [ Commercial Hubs (4) ]     [ Category Core (6) ]         [ Comparison Hub: /compare/ ]
  • /club-management-...      • /snooker-club-m...          • /compare/justclub-vs-cueflow/
  • /snooker-software-in...   • /pool-club-mana...          • /compare/justclub-vs-generic-pos/
  • /billiards-software-...   • /billiards-club...          • /compare/justclub-vs-spreadsheets/
  • /pool-club-softwar...     • /gaming-club-ma...          • /compare/justclub-vs-manual-billing/
        │                              │                              │
        ├──────────────────────────────┼──────────────────────────────┤
        ▼                              ▼                              ▼
 [ Local City Cluster (12) ]   [ Feature Cluster (11) ]    [ Interactive Tools (3) ]
  • /locations/india/bang...   • /features/table-bill...    • /tools/snooker-club-profit-...
  • /locations/india/chen...   • /features/live-table...    • /tools/snooker-table-reven...
  • /locations/india/coim...   • /features/upi-paymen...    • /tools/snooker-club-break-...
  • /locations/india/hyde...   • /features/whatsapp/                  │
  • /locations/india/mumb...   • /features/ledger/                    │
  • /locations/india/delh...   • /features/club-pos/                  │
  • /locations/india/pune...   • /features/canteen-b...               │
  • /locations/india/kolk...   • /features/member-ma...               │
  • /locations/india/jaip...   • /features/staff-man...               │
  • /locations/india/koch...   • /features/revenue-r...               │
  • /locations/india/ahme...   • /features/gst-billi...               │
  • /locations/india/chan...           │                              │
        │                              │                              │
        └──────────────────────────────┼──────────────────────────────┘
                                       ▼
                     [ Problem / Solution Guides (4) ]
                      • /solutions/manual-snooker-billing/
                      • /solutions/snooker-table-timer/
                      • /solutions/snooker-club-credit-management/
                      • /solutions/multi-branch-club-management/
                                       ▲
                                       │
                      [ Knowledge Base & Guides (7) ]
                      • /resources/
                      • /resources/how-to-start-a-snooker-club-in-india/
                      • /resources/snooker-table-pricing-guide/
                      • /resources/snooker-club-management-guide/
                      • /resources/best-snooker-club-management-software/
                      • /snooker-club-software-buyers-guide/
                      • /how-to-bill-snooker-table-time/
```

---

## 2. Cluster Linking Rules & Specific Directives

### Cluster A: Local City Landing Pages (12 Pages)
- **Every City Page MUST link to:**
  1. `/snooker-software-india/` (National parent hub) — Anchor: `snooker software India`
  2. `/features/table-billing/` (Core feature) — Anchor: `pro-rata table billing`
  3. `/features/upi-payments/` (Local payment workflow) — Anchor: `dynamic UPI payments`
  4. `/features/whatsapp/` (Local receipt workflow) — Anchor: `WhatsApp digital receipts`
  5. `/tools/snooker-club-profit-calculator/` (Interactive engagement) — Anchor: `calculate your club profit`
- **Parent Hubs Linking TO City Pages:**
  - `/snooker-software-india/` contains a clear regional grid linking to all 12 metro pages with anchors like `Snooker club software in Bangalore`, `Chennai snooker billing POS`, etc.

---

### Cluster B: Interactive Financial Tools (3 Pages)
- **Every Calculator MUST link to:**
  1. `/resources/how-to-start-a-snooker-club-in-india/` — Anchor: `complete club startup guide`
  2. `/resources/snooker-table-pricing-guide/` — Anchor: `snooker table hourly rate benchmarks`
  3. `/snooker-billing-software/` — Anchor: `automated table billing software`
  4. `/features/revenue-reports/` — Anchor: `live club analytics dashboard`
- **Guides Linking TO Calculators:**
  - `/resources/how-to-start-a-snooker-club-in-india/` prominently embeds CTAs linking to `/tools/snooker-club-break-even-calculator/` and `/tools/snooker-club-profit-calculator/`.
  - `/resources/snooker-table-pricing-guide/` embeds CTAs linking to `/tools/snooker-table-revenue-calculator/`.

---

### Cluster C: Comparison & Competitor Teardown Cluster (5 Pages)
- **The `/compare/` Hub and individual comparisons MUST link to:**
  1. `/snooker-club-management-software/` — Anchor: `snooker club management platform`
  2. `/features/live-table-timer/` — Anchor: `cloud table timer`
  3. `/features/ledger/` — Anchor: `customer khata and credit management`
  4. `/features/upi-payments/` — Anchor: `instant UPI payment integration`
- **The `/compare/justclub-vs-cueflow/` page specifically links to:**
  - `/solutions/snooker-table-timer/` — Anchor: `cloud timers vs hardware timer boxes`
  - `/features/whatsapp/` — Anchor: `WhatsApp billing for Indian clubs`

---

### Cluster D: Problem / Solution Deep Guides (4 Pages)
- **Problem pages serve as high-converting educational bridges:**
  - `/solutions/manual-snooker-billing/` links to:
    - `/snooker-billing-software/`
    - `/features/table-billing/`
    - `/compare/justclub-vs-manual-billing/`
  - `/solutions/snooker-table-timer/` links to:
    - `/snooker-table-timer/`
    - `/features/live-table-timer/`
  - `/solutions/snooker-club-credit-management/` links to:
    - `/features/ledger/`
    - `/features/whatsapp/`
  - `/solutions/multi-branch-club-management/` links to:
    - `/club-management-software/`
    - `/features/staff-management/`
    - `/features/revenue-reports/`

---

## 3. High-Priority Inbound/Outbound Linking Matrix

| Page URL | Inbound Links From | Outbound Links To | Anchor Text Concepts |
| :--- | :--- | :--- | :--- |
| `/snooker-club-management-software/` | Homepage, All Guides, All City pages, Comparisons | `/features/table-billing/`, `/features/live-table-timer/`, `/features/upi-payments/`, `/snooker-software-india/` | `snooker club management software`, `all-in-one snooker POS` |
| `/features/upi-payments/` | Homepage, All City pages, Billing pages, Solution guides | `/features/whatsapp/`, `/features/table-billing/`, `/snooker-billing-software/` | `dynamic UPI QR checkout`, `UPI billing for clubs` |
| `/features/ledger/` | Homepage, City pages, Comparisons, Credit Solution guide | `/features/whatsapp/`, `/solutions/snooker-club-credit-management/`, `/contact/` | `club credit ledger`, `snooker khata software` |
| `/tools/snooker-club-profit-calculator/` | Startup guide, Pricing guide, City pages, Homepage | `/resources/how-to-start-a-snooker-club-in-india/`, `/snooker-billing-software/`, `/contact/` | `snooker club profit calculator`, `estimate club earnings` |
| `/compare/justclub-vs-cueflow/` | `/compare/`, Best Software guide, Buyer's guide | `/snooker-club-management-software/`, `/features/upi-payments/`, `/features/whatsapp/` | `JustClub vs CueFlow`, `CueFlow alternative for India` |
| `/resources/how-to-start-a-snooker-club-in-india/` | Homepage, Resources hub, City pages, Profit calculator | `/tools/snooker-club-profit-calculator/`, `/resources/snooker-table-pricing-guide/`, `/snooker-club-management-software/` | `how to start a snooker club in India`, `club startup blueprint` |
| `/locations/india/bangalore/` | `/snooker-software-india/`, National commercial pages | `/features/table-billing/`, `/features/upi-payments/`, `/tools/snooker-club-profit-calculator/`, `/contact/` | `snooker club software in Bangalore`, `Koramangala pool parlor POS` |

---

## 4. Anchor Text Hygiene Directives
1. **No Generic Anchors**: Strictly avoid anchors like `click here`, `read more`, `learn more`, or `this link`.
2. **Contextual Natural Phrasing**: Integrate the anchor into complete sentences (e.g., *"You can calculate your club's estimated monthly revenue using our [snooker club profit calculator](/tools/snooker-club-profit-calculator/)."*).
3. **No Exact-Match Over-Optimization**: Vary anchor variations across pages (e.g. use `snooker table timer`, `cloud table timer`, `real-time session clock`).
