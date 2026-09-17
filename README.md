# JustClub OS — Gaming Club & Lounge Operating Platform

> **Version 2.4** • Production-ready, Multi-tenant Operating Platform for Snooker, Billiards, PlayStation, PC Gaming, VR, Table Tennis, Foosball, and Entertainment Lounges.

Built with **React 19 + TypeScript + Tailwind CSS**, powered by **Cloudflare Pages Functions (Hono.js)** and **Cloudflare D1 Serverless SQL**, with full **PWABuilder compliance** for Google Play (Android APK/AAB) and Apple App Store (iOS) packaging.

---

## 🌟 Executive Summary

**JustClub OS** solves the operational chaos of gaming lounges and snooker clubs by replacing manual logbooks, unreliable hardware timers, and separate card terminals with a unified, browser-native operating system.

### Key Value Propositions:
- ⏱️ **Precision Live Timers**: Sub-second timer engine with pause/resume support, custom billing increments (per-minute, 15m, 30m, 1hr), and zero timer drift.
- 💸 **Instant Split Billing Engine**: Split gaming and café tabs across multiple tagged players with dynamic UPI QR codes and 1-click WhatsApp payment links.
- ☕ **Attached & Standalone Café POS**: Add food, beverages, and merchandise directly to active tables or ring up quick walk-in orders with real-time stock decrements.
- 📒 **Customer CRM & Credit Khata**: Track member visits, lifetime value, and credit tabs with automated WhatsApp debt reminder messages.
- 👑 **Super Admin Multi-Tenant Portal**: Manage club subscriptions, monitor tenant telemetry, enforce automated billing cycles, and configure Cashfree payment gateway settings.
- 📱 **Store-Ready PWA**: Fully verified against [PWABuilder.com](https://docs.pwabuilder.com/) with offline lounge caching, Digital Asset Links (`assetlinks.json`), and Apple App Site Association.

---

## 🏗️ Architecture & Technology Stack

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                             Cloudflare Global Edge                          │
 ├──────────────────────────────────────┬──────────────────────────────────────┤
 │  Cloudflare Pages (Static SPA)       │  Cloudflare Functions (/functions)   │
 │  • React 19 + Vite 6                 │  • Hono.js Edge Router               │
 │  • Tailwind CSS v4 + Motion          │  • JWT Authentication & RBAC         │
 │  • Workbox Service Worker            │  • Cashfree PG Webhook Verification  │
 └──────────────────┬───────────────────┴───────────────────┬──────────────────┘
                    │                                       │
                    │ (Fetch /api/*)                        │ (env.DB Binding)
                    ▼                                       ▼
         ┌─────────────────────┐                 ┌────────────────────┐
         │ Browser / PWA App   │                 │ Cloudflare D1 SQL  │
         │ (Offline Timers)    │                 │ (SQLite on Edge)   │
         └─────────────────────┘                 └────────────────────┘
```

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS, Motion (Framer Motion), Lucide Icons.
- **Backend**: Cloudflare Pages Functions with Hono.js microframework.
- **Database**: Cloudflare D1 Serverless SQL (SQLite at edge) with comprehensive indexing.
- **Payments**: Cashfree Payment Gateway SDK + Dynamic UPI QR Codes + WhatsApp Deep Links.
- **Mobile/Store Runtime**: Progressive Web App (PWA) with Trusted Web Activity (TWA) and iOS WebKit wrapper compliance.

---

## 🚀 Quick Start & Local Development

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/YOUR_USERNAME/justclub.git
cd justclub
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
The application will start on `http://localhost:3000`.

### 3. Local Cloudflare Pages & D1 Emulation
```bash
# Preview production build with Wrangler Pages
npm run build
npx wrangler pages dev dist --d1=DB=justclub-db
```

---

## 📦 Cloudflare Deployment Guide

### Step 1: Provision Cloudflare D1 Database
```bash
# 1. Login to Cloudflare
npx wrangler login

# 2. Create the D1 database
npx wrangler d1 create justclub-db

# 3. Apply schema to remote D1 instance
npx wrangler d1 execute justclub-db --file=./schema.sql --remote
```

### Step 2: Push Repository to GitHub
```bash
git add .
git commit -m "feat: complete justclub production deployment"
git push -u origin main
```

### Step 3: Connect to Cloudflare Pages
1. Navigate to **Cloudflare Dashboard** > **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Select your repository `justclub`.
3. Set **Build Configuration**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
4. Set **D1 Database Binding**:
   - Go to **Settings** > **Functions** > **D1 Database Bindings**.
   - Add binding: Variable name = `DB`, Database = `justclub-db`.
5. Set **Environment Variables**:
   - `JWT_SECRET`: Random secure string
   - `CASHFREE_ENVIRONMENT`: `TEST` or `PRODUCTION`
   - `CASHFREE_TEST_APP_ID`: Your Cashfree App ID
   - `CASHFREE_TEST_SECRET_KEY`: Your Cashfree Secret Key

---

## 📱 Google Play & Apple App Store Packaging (PWABuilder)

JustClub is built to score 100% on [PWABuilder](https://docs.pwabuilder.com/).

### 🤖 Android (Google Play Store)
1. Go to [PWABuilder.com](https://www.pwabuilder.com/) and enter your deployed URL (e.g., `https://justclub.pages.dev`).
2. Click **Package for Stores** > **Android**.
3. Set Package ID: `com.justclub.app`.
4. Generate your signing key and copy the **SHA-256 fingerprint**.
5. Paste the fingerprint into `/public/.well-known/assetlinks.json`.
6. Download the signed `.aab` file and upload to Google Play Console.

### 🍎 iOS (Apple App Store)
1. On PWABuilder, click **Package for Stores** > **iOS**.
2. Download the generated Xcode project zip.
3. Open in Xcode, select your **Apple Developer Team ID**.
4. Verify `/public/.well-known/apple-app-site-association` matches your Team ID.
5. Archive and submit to TestFlight / App Store Connect.

---

## 🗄️ Database Schema & API Reference

See [DOCUMENTATION.md](./DOCUMENTATION.md) for full endpoint specifications, SQL table definitions, and security policies.

---

## 📄 License
Private & Proprietary — Developed for JustClub Operating Platform.
