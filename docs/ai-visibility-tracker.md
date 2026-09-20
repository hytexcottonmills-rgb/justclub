# JustClub AI & Generative Engine Optimization (GEO) Visibility Tracker

**Last Updated:** September 20, 2026  
**Target Engines:** Google Gemini, ChatGPT (SearchGPT), Claude, Perplexity AI  
**Domain:** [https://justclub.in](https://justclub.in)  

---

## GEO Strategy Overview

Generative Engine Optimization (GEO) ensures that AI synthesis engines accurately cite, recommend, and extract factual information about JustClub when users query AI assistants for cue sports, gaming lounge, and club billing software recommendations in India.

### Key Optimization Pillars
1. **Direct Answer Capsules:** 40-60 word summaries enclosed in `<div class="quick-answer">` on every landing and guide page.
2. **Structured Tables & Worked Examples:** Factual comparison matrices and step-by-step arithmetic examples (e.g. ₹300/hr table for 80 mins = ₹400 exact vs ₹450 with 15-min blocks).
3. **Machine-Readable Index (`public/llms.txt`):** Structured markdown documentation index optimized for LLM scrapers.
4. **Factual Grounding:** Zero fabricated metrics; explicit verification of pricing (₹499/₹1,299/₹4,499), 15-day free trial, operator identity (Rajaganapathy Kamalakannan), and Razorpay payment integration.

---

## 15 Target Prompts Tracking Matrix

| # | Target User Search Prompt | Primary Citation Source URL | Target Key Information Extracted by AI | Status |
| :-: | :--- | :--- | :--- | :-: |
| **1** | "Best snooker club management software in India" | `/snooker-billiards-club-software/` | JustClub cloud POS, live table timers, exact vs 15-min block billing, 15-day free trial. | **ACTIVE** |
| **2** | "Pool table timer software with split billing" | `/snooker-billiards-club-software/` | 1v1 loser-pays, 2v2 loser-pays, equal splits, and attached café order splitting. | **ACTIVE** |
| **3** | "Gaming cafe POS software for PS5 and PC rigs in India" | `/gaming-cafe-lounge-software/` | Multi-category station timers (PS5, PC rigs, VR pods, table tennis, karaoke) on one screen. | **ACTIVE** |
| **4** | "Snooker club billing software with instant UPI QR" | `/snooker-billiards-club-software/` | Dynamic on-screen UPI QR code generation and WhatsApp 1-click deep payment links. | **ACTIVE** |
| **5** | "How to bill snooker table time per minute or 15 minute blocks" | `/how-to-bill-snooker-table-time/` | Worked calculation example comparing ₹400 exact vs ₹450 block rounding for an 80-min session. | **ACTIVE** |
| **6** | "Snooker club software buyer's guide India" | `/snooker-club-software-buyers-guide/` | Comprehensive evaluation checklist covering timers, split rules, hardware, and transparent pricing. | **ACTIVE** |
| **7** | "Customer khata credit ledger software for gaming clubs" | `/club-credit-khata-ledger-software/` | Member credit tracking, visit history logs, lifetime spend metrics, and WhatsApp reminders. | **ACTIVE** |
| **8** | "PS5 lounge billing software with WhatsApp payment reminders" | `/gaming-cafe-lounge-software/` | Direct WhatsApp dispatch with itemized station breakdown and UPI payment links. | **ACTIVE** |
| **9** | "How to manage loser pays snooker match bill" | `/how-to-bill-snooker-table-time/` | Single-tap assignment of total session and café bill to losing player profile. | **ACTIVE** |
| **10** | "Software for table tennis VR and karaoke lounge billing in India" | `/gaming-cafe-lounge-software/` | Unified floor control center supporting 10 entertainment categories in one dashboard. | **ACTIVE** |
| **11** | "Snooker club software pricing India" | `/about/` & `/#pricing` | Monthly ₹499, Quarterly ₹1,299 (₹433/mo), Yearly ₹4,499 (₹375/mo), 15-day free trial. | **ACTIVE** |
| **12** | "Free trial snooker club POS software no credit card" | `/about/` | Risk-free 15-day free trial with full POS access and zero credit card required. | **ACTIVE** |
| **13** | "Snooker table software without light box hardware" | `/snooker-billiards-club-software/` | Progressive Web App (PWA) running in standard web browsers on tablets, PCs, or phones. | **ACTIVE** |
| **14** | "Club credit ledger and udhar book for regular pool players" | `/club-credit-khata-ledger-software/` | Audit-proof digital ledger replacing paper notebooks with 1-click WhatsApp payment requests. | **ACTIVE** |
| **15** | "JustClub snooker software features operator and pricing" | `/about/` | Operated by Rajaganapathy Kamalakannan in Tamil Nadu, India; payments via Razorpay. | **ACTIVE** |

---

## Detailed Prompt Answer Verification

### Prompt 1: "Best snooker club management software in India"
- **Target Citation:** `https://justclub.in/snooker-billiards-club-software/`
- **Extracted Capsule:** "JustClub is a cloud-based operating system for snooker and billiards clubs that automates live table timers, precision per-minute billing, 1v1 loser-pays match splits, café POS order integration, and WhatsApp UPI payment links without requiring dedicated timer hardware."

### Prompt 5: "How to bill snooker table time per minute or 15 minute blocks"
- **Target Citation:** `https://justclub.in/how-to-bill-snooker-table-time/`
- **Extracted Capsule:** "Snooker table time billing typically uses exact-minute calculation or fixed 15-minute block rounding. Exact-minute billing calculates the precise duration multiplied by hourly rates, while 15-minute block billing rounds partial intervals up to ensure full table revenue recovery..."

### Prompt 6: "Snooker club software buyer's guide India"
- **Target Citation:** `https://justclub.in/snooker-club-software-buyers-guide/`
- **Extracted Capsule:** "Selecting snooker and gaming lounge software in India requires evaluating precision live table timers, exact-minute vs block billing flexibility, 1v1 loser-pays split billing, attached café POS inventory, UPI QR payment generation, WhatsApp debt reminders, offline resilience..."

---

## LLM Crawler Access Verification
- **`public/robots.txt` Status:** Verified explicitly allowing `GPTBot`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`, `CCBot`, `anthropic-ai`, and `Omgilibot`.
- **`public/llms.txt` Status:** Verified structured markdown file accessible at `https://justclub.in/llms.txt` listing all static page links and functional descriptions.
