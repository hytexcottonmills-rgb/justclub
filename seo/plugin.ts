import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import type { Plugin } from 'vite';
import { allStaticPages, generatePageHtml, generateSitemapXml, notFoundHtml } from './pages';

export function justclubSeoPlugin(): Plugin {
  return {
    name: 'justclub-seo-plugin',
    apply: 'build',
    async transformIndexHtml(html) {
      const ssrEntryPath = path.resolve(process.cwd(), 'dist-ssr/entry-prerender.js');
      if (!fs.existsSync(ssrEntryPath)) {
        console.warn('\n⚠️  [justclub-seo] dist-ssr/entry-prerender.js not found. Skipping root HTML prerendering.\n');
        return html;
      }

      try {
        const fileUrl = pathToFileURL(ssrEntryPath).href;
        const ssrModule = await import(fileUrl);
        if (typeof ssrModule.render === 'function') {
          const renderedApp = ssrModule.render();
          console.log('\n✅ [justclub-seo] Successfully prerendered LandingPage into <div id="root">\n');
          return html.replace('<div id="root"></div>', `<div id="root">${renderedApp}</div>`);
        } else {
          console.warn('\n⚠️  [justclub-seo] render() not found on SSR module.\n');
          return html;
        }
      } catch (err) {
        console.error('\n❌ [justclub-seo] Failed to prerender SSR entry:', err);
        return html;
      }
    },
    generateBundle() {
      // 1. Emit all keyword & trust static landing pages
      for (const page of allStaticPages) {
        this.emitFile({
          type: 'asset',
          fileName: `${page.slug}/index.html`,
          source: generatePageHtml(page),
        });
      }

      // 2. Emit 404.html
      this.emitFile({
        type: 'asset',
        fileName: '404.html',
        source: notFoundHtml,
      });

      // 3. Emit sitemap.xml
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: generateSitemapXml(),
      });

      console.log(`\n✅ [justclub-seo] Emitted ${allStaticPages.length} static pages, 404.html, and sitemap.xml\n`);
    },
  };
}
