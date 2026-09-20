import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { justclubSeoPlugin } from './seo/plugin';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      justclubSeoPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.ico',
          'favicon.svg',
          'favicon-32x32.png',
          'favicon-16x16.png',
          'apple-touch-icon.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-maskable-512x512.png'
        ],
        manifest: {
          id: '/',
          name: 'JustClub — Multi-Game Club POS & Lounge OS',
          short_name: 'JustClub',
          description: 'JustClub is an all-in-one cloud POS, live table timer, split billing, café inventory, and customer khata ledger operating platform for snooker, billiards, and gaming lounges in India.',
          theme_color: '#0F172A',
          background_color: '#020617',
          display: 'standalone',
          orientation: 'any',
          start_url: '/',
          scope: '/',
          lang: 'en',
          dir: 'ltr',
          prefer_related_applications: false,
          categories: ['business', 'finance', 'utilities', 'productivity', 'entertainment'],
          screenshots: [
            {
              src: '/justclub-avatar.jpg',
              sizes: '1024x1024',
              type: 'image/jpeg',
              form_factor: 'wide',
              label: 'JustClub Operating Platform Dashboard'
            },
            {
              src: '/justclub-brand-specs.jpg',
              sizes: '1024x1024',
              type: 'image/jpeg',
              form_factor: 'narrow',
              label: 'Live Table Timers & Split Billing'
            }
          ],
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ],
          shortcuts: [
            {
              name: 'Live Tables',
              short_name: 'Tables',
              description: 'View active tables and timers',
              url: '/?tab=tables',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }]
            },
            {
              name: 'Café & Bar POS',
              short_name: 'POS',
              description: 'Quick order entry & bar billing',
              url: '/?tab=bar',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }]
            },
            {
              name: 'Customer Ledgers',
              short_name: 'Ledgers',
              description: 'Member balances & WhatsApp bills',
              url: '/?tab=ledgers',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }]
            }
          ]
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          globIgnores: ['*/index.html', '404.html'],
          navigateFallbackDenylist: [
            /^\/api\//,
            /^\/snooker-billiards-club-software\//,
            /^\/gaming-cafe-lounge-software\//,
            /^\/club-credit-khata-ledger-software\//,
            /^\/snooker-club-software-buyers-guide\//,
            /^\/how-to-bill-snooker-table-time\//,
            /^\/about\//,
            /^\/privacy\//,
            /^\/terms\//,
            /^\/refund\//,
            /^\/contact\//,
            /^\/sitemap\.xml$/,
            /^\/robots\.txt$/,
            /^\/llms\.txt$/,
            /^\/404\.html$/
          ],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
      {
        name: 'vite-safe-ws',
        configureServer(server) {
          if (!server.ws) {
            server.ws = {
              send: () => {},
              on: () => {},
              off: () => {},
              close: () => {},
              clients: new Set(),
            } as any;
          }
        },
      },
    ],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
