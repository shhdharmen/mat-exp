/**
 * Post-render patch: adds `lang="en"` to the bare `<html>` tag emitted by
 * Angular's prerenderer for section-redirect routes (routes whose
 * `sectionRedirectGuard` returns a `UrlTree`, e.g. `/docs/components`).
 *
 * For these routes Angular emits a minimal static `<meta http-equiv="refresh">`
 * stub instead of bootstrapping the full `index.html` app shell, so the
 * `lang="en"` set in `src/index.html` never reaches the output file. Pagefind
 * then warns that these pages are missing an html lang attribute.
 *
 * Runs after `ng build` (prerender) and before Pagefind indexing, so it must
 * be wired into the `build:docs` npm script between those two steps — not
 * `postbuild:docs`, which runs after Pagefind has already indexed the files.
 *
 * Usage: tsx scripts/fix-redirect-html-lang.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import { DIST_BROWSER_DIR } from './site-config';

/** Bare `<html>` with no attributes — only emitted by Angular's redirect stub pages. */
const BARE_HTML_TAG = '<html>';
const PATCHED_HTML_TAG = '<html lang="en">';

function findHtmlFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

function main(): void {
  if (!fs.existsSync(DIST_BROWSER_DIR)) {
    console.error(`Error: ${DIST_BROWSER_DIR} not found. Run \`ng build\` first.`);
    process.exit(1);
  }

  const htmlFiles = findHtmlFiles(DIST_BROWSER_DIR);
  let patchedCount = 0;

  for (const file of htmlFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    if (content.includes(BARE_HTML_TAG)) {
      fs.writeFileSync(file, content.replace(BARE_HTML_TAG, PATCHED_HTML_TAG), 'utf-8');
      patchedCount++;
    }
  }

  console.log(`✓ Patched html lang attribute on ${patchedCount} redirect stub page(s)`);
}

const isDirectRun = import.meta.url === pathToFileURL(process.argv[1] ?? '').href;
if (isDirectRun) {
  main();
}
