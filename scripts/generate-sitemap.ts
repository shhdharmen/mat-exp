/**
 * Post-build script: writes `sitemap.xml` into the `ng build` output directory.
 *
 * Runs after `ng build` (via the `postbuild:docs` npm script) so it can read the
 * final `public/routes.txt` — the same route list Angular's prerenderer consumed —
 * and reference the production origin regardless of which environment was built.
 *
 * Usage: tsx scripts/generate-sitemap.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import { DIST_BROWSER_DIR, ROUTES_OUT, SITE_URL } from './site-config';

const SITEMAP_OUT = path.resolve(DIST_BROWSER_DIR, 'sitemap.xml');

export function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;');
}

/** Builds the `sitemap.xml` document body for a list of route paths (e.g. `/changelog`). */
export function buildSitemapXml(
  routes: readonly string[],
  siteUrl: string,
  lastmod: string,
): string {
  const urls = routes
    .map(
      (route) =>
        `  <url>\n    <loc>${escapeXml(siteUrl + route)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function main(): void {
  if (!fs.existsSync(ROUTES_OUT)) {
    console.error(`Error: ${ROUTES_OUT} not found. Run \`npm run build:docs\` first.`);
    process.exit(1);
  }
  if (!fs.existsSync(DIST_BROWSER_DIR)) {
    console.error(`Error: ${DIST_BROWSER_DIR} not found. Run \`ng build\` first.`);
    process.exit(1);
  }

  const routes = fs
    .readFileSync(ROUTES_OUT, 'utf-8')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const today = new Date().toISOString().slice(0, 10);
  const sitemap = buildSitemapXml(routes, SITE_URL, today);

  fs.writeFileSync(SITEMAP_OUT, sitemap, 'utf-8');
  console.log(`✓ Written ${SITEMAP_OUT} (${routes.length} routes)`);
}

const isDirectRun = import.meta.url === pathToFileURL(process.argv[1] ?? '').href;
if (isDirectRun) {
  main();
}
