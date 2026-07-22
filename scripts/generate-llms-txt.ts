/**
 * Post-build script: writes `llms.txt` into the `ng build` output directory,
 * following the https://llmstxt.org convention (an `/llms.txt` index that
 * points LLMs at a site's key pages, preferring plain-Markdown sources).
 *
 * Runs after `ng build` (via the `postbuild:docs` npm script) so it can read
 * the final `public/nav-manifest.json` for page labels/descriptions.
 *
 * Usage: tsx scripts/generate-llms-txt.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  DIST_BROWSER_DIR,
  NAV_MANIFEST_OUT,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  GH_URL,
} from './site-config';

const LLMS_TXT_OUT = path.resolve(DIST_BROWSER_DIR, 'llms.txt');
// const PUBLIC_DIR = path.resolve(process.cwd(), 'public');

export interface NavPage {
  label: string;
  path: string;
  description?: string;
  isComponentPage?: boolean;
  isSection?: boolean;
  hasIndexPage?: boolean;
  children?: NavPage[];
}

interface NavManifest {
  nav: NavPage[];
}

export interface LlmsLink {
  label: string;
  /** Absolute URL to link to — prefers a page's raw Markdown source when one exists. */
  url: string;
  description?: string;
}

/** Parses `title`/`description` frontmatter out of a `.md` file's raw text content. */
export function parseFrontmatterFields(raw: string): { title?: string; description?: string } {
  const titleMatch = raw.match(/^title:\s*(.+)$/m);
  const descriptionMatch = raw.match(/^description:\s*(.+)$/m);
  const unquote = (v: string): string => v.trim().replace(/^"(.*)"$|^'(.*)'$/, (_, a, b) => a ?? b);
  return {
    title: titleMatch ? unquote(titleMatch[1]) : undefined,
    description: descriptionMatch ? unquote(descriptionMatch[1]) : undefined,
  };
}

/** Reads `title`/`description` frontmatter out of a standalone (non-docs) page's `index.md`. */
// function readStaticPageFrontmatter(routePath: string): { title?: string; description?: string } {
//   const filePath = path.join(PUBLIC_DIR, routePath, 'index.md');
//   if (!fs.existsSync(filePath)) return {};
//   return parseFrontmatterFields(fs.readFileSync(filePath, 'utf-8'));
// }

/**
 * Flattens the nav tree into one link per real "topic": section landing pages,
 * plain content pages, and one entry per Component Page (its Overview, not the
 * API/Styling/Playground tabs — kept out to keep llms.txt concise).
 */
export function collectDocLinks(nodes: NavPage[], out: LlmsLink[] = []): LlmsLink[] {
  for (const node of nodes) {
    if (node.isComponentPage) {
      out.push({
        label: node.label,
        url: `${SITE_URL}${node.path}/index.md`,
        description: node.description,
      });
      continue;
    }
    if (node.isSection) {
      if (node.hasIndexPage) {
        out.push({
          label: node.label,
          url: `${SITE_URL}${node.path}/index.md`,
          description: node.description,
        });
      }
      if (node.children) collectDocLinks(node.children, out);
      continue;
    }
    out.push({
      label: node.label,
      url: `${SITE_URL}${node.path}/index.md`,
      description: node.description,
    });
  }
  return out;
}

export function formatLink(link: LlmsLink): string {
  return link.description
    ? `- [${link.label}](${link.url}): ${link.description}`
    : `- [${link.label}](${link.url})`;
}

function main(): void {
  if (!fs.existsSync(NAV_MANIFEST_OUT)) {
    console.error(`Error: ${NAV_MANIFEST_OUT} not found. Run \`npm run build:docs\` first.`);
    process.exit(1);
  }
  if (!fs.existsSync(DIST_BROWSER_DIR)) {
    console.error(`Error: ${DIST_BROWSER_DIR} not found. Run \`ng build\` first.`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(NAV_MANIFEST_OUT, 'utf-8')) as NavManifest;
  const docLinks = collectDocLinks(manifest.nav);

  const apiLink: LlmsLink = {
    label: 'API Reference',
    url: `${SITE_URL}/docs/api`,
    description: `Full API reference for ${'`@ngm-dev/mat-exp`'} — every exported component, directive, type, and utility.`,
  };

  const optionalLinks: LlmsLink[] = [
    {
      label: 'Changelog',
      url: `${GH_URL}/blob/main/CHANGELOG.md`,
    },
  ];

  const lines = [
    `# ${SITE_NAME}`,
    '',
    `> ${SITE_DESCRIPTION}`,
    '',
    '## Docs',
    '',
    ...docLinks.map(formatLink),
    formatLink(apiLink),
    '',
    '## Optional',
    '',
    ...optionalLinks.map(formatLink),
    '',
  ];

  fs.writeFileSync(LLMS_TXT_OUT, lines.join('\n'), 'utf-8');
  console.log(
    `✓ Written ${LLMS_TXT_OUT} (${docLinks.length + 1} doc links, ${optionalLinks.length} optional links)`,
  );
}

const isDirectRun = import.meta.url === pathToFileURL(process.argv[1] ?? '').href;
if (isDirectRun) {
  main();
}
