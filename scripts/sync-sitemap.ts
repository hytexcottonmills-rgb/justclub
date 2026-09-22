import fs from 'fs';
import path from 'path';
import { allStaticPages, generateSitemapXml } from '../seo/pages.ts';

const publicSitemapPath = path.resolve(process.cwd(), 'public/sitemap.xml');
const sitemapXml = generateSitemapXml();

fs.writeFileSync(publicSitemapPath, sitemapXml, 'utf-8');
console.log(`[PASS] Wrote sitemap.xml to public/sitemap.xml (${(sitemapXml.match(/<url>/g) || []).length} URLs)`);
