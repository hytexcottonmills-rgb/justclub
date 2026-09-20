import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import type { Plugin } from 'vite';
import { allStaticPages, generatePageHtml, generateSitemapXml, notFoundHtml } from './pages';

export function justclubSeoPlugin(): Plugin {
  let isBuild = false;

  return {
    name: 'justclub-seo-plugin',

    configResolved(config) {
      isBuild = config.command === 'build';
    },

    // DEV / PREVIEW: serve the generated static pages so links work while developing.
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url || '').split('?')[0].split('#')[0];
        const withSlash = url.endsWith('/') ? url : `${url}/`;
        const page = allStaticPages.find((p) => `/${p.slug}/` === withSlash);

        if (page) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(generatePageHtml(page));
          return;
        }
        if (url === '/sitemap.xml') {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/xml; charset=utf-8');
          res.end(generateSitemapXml());
          return;
        }
        next();
      });
    },

    // BUILD: inject the server-rendered landing page into <div id="root">.
    async transformIndexHtml(html) {
      if (!isBuild) return html;

      const failHard = !!process.env.CI;
      const fail = (msg: string) => {
        if (failHard) throw new Error(`[justclub-seo] ${msg}`);
        console.warn(`\n⚠️  [justclub-seo] ${msg} Skipping root HTML prerendering.\n`);
        return html;
      };

      const ssrEntryPath = path.resolve(process.cwd(), 'dist-ssr/entry-prerender.js');
      if (!fs.existsSync(ssrEntryPath)) return fail('dist-ssr/entry-prerender.js not found.');

      try {
        const ssrModule = await import(pathToFileURL(ssrEntryPath).href);
        if (typeof ssrModule.render !== 'function') return fail('render() not found on SSR module.');

        const renderedApp: string = ssrModule.render();
        if (!renderedApp || renderedApp.length < 5000 || !html.includes('<div id="root"></div>')) {
          return fail('Prerender produced unexpectedly small output or root placeholder missing.');
        }
        console.log('\n✅ [justclub-seo] Prerendered LandingPage into <div id="root">\n');
        return html.replace('<div id="root"></div>', `<div id="root">${renderedApp}</div>`);
      } catch (err) {
        if (failHard) throw err;
        console.error('\n❌ [justclub-seo] Failed to prerender SSR entry:', err);
        return html;
      }
    },

    generateBundle() {
      for (const page of allStaticPages) {
        this.emitFile({ type: 'asset', fileName: `${page.slug}/index.html`, source: generatePageHtml(page) });
      }
      this.emitFile({ type: 'asset', fileName: '404.html', source: notFoundHtml });
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: generateSitemapXml() });
      console.log(`\n✅ [justclub-seo] Emitted ${allStaticPages.length} static pages, 404.html, and sitemap.xml\n`);
    },
  };
}
