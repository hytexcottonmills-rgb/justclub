import { cityPages } from './data/cities';
import { commercialPages } from './data/commercial';
import { comparisonPages } from './data/comparisons';
import { featurePages } from './data/features';
import { resourcePages } from './data/resources';
import { solutionPages } from './data/solutions';
import { toolPages } from './data/tools';
import { notFoundHtml, trustAndLegacyPages } from './data/trust';
import { BASE_URL, buildPageHtml } from './generator';
import type { PageMeta } from './types';

export { notFoundHtml };
export type { PageMeta };

export const ISO_LASTMOD = '2026-09-21';

export const allStaticPages: PageMeta[] = [
  ...commercialPages,
  ...cityPages,
  ...featurePages,
  ...solutionPages,
  ...toolPages,
  ...comparisonPages,
  ...resourcePages,
  ...trustAndLegacyPages,
];

export function getPageBySlug(slug: string): PageMeta | undefined {
  const cleanSlug = slug.replace(/^\/+|\/+$/g, '');
  return allStaticPages.find((p) => p.slug === cleanSlug);
}

export function generatePageHtml(meta: PageMeta): string {
  return buildPageHtml(meta);
}

/**
 * Generates the clean, W3C/sitemaps.org compliant XML sitemap.
 * Only includes legitimate, self-canonical, indexable URLs with deduplication.
 * Uses ISO 8601 (YYYY-MM-DD) formatted dates for <lastmod>.
 */
export function generateSitemapXml(): string {
  const homeUrl = `${BASE_URL}/`;
  const sitemapUrls = new Set<string>();
  sitemapUrls.add(homeUrl);

  for (const page of allStaticPages) {
    const expectedCanonical = `${BASE_URL}/${page.slug}/`;
    // Only include pages that are strictly self-canonical (exclude alias pages)
    if (page.canonical === expectedCanonical) {
      sitemapUrls.add(page.canonical);
    }
  }

  const urlElements = Array.from(sitemapUrls)
    .sort((a, b) => {
      if (a === homeUrl) return -1;
      if (b === homeUrl) return 1;
      return a.localeCompare(b);
    })
    .map(
      (loc) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${ISO_LASTMOD}</lastmod>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
}
