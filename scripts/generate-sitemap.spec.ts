import { describe, expect, it } from 'vitest';
import { buildSitemapXml, escapeXml } from './generate-sitemap';

describe('escapeXml', () => {
  it('escapes ampersands', () => {
    expect(escapeXml('/foo?a=1&b=2')).toBe('/foo?a=1&amp;b=2');
  });

  it('leaves plain paths untouched', () => {
    expect(escapeXml('/docs/getting-started')).toBe('/docs/getting-started');
  });
});

describe('buildSitemapXml', () => {
  const siteUrl = 'https://expressive.angular-material.dev';
  const lastmod = '2026-07-06';

  it('produces a valid urlset wrapper', () => {
    const xml = buildSitemapXml(['/'], siteUrl, lastmod);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n')).toBe(true);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml.trimEnd().endsWith('</urlset>')).toBe(true);
  });

  it('emits one <url> entry per route with an absolute <loc> and the given <lastmod>', () => {
    const xml = buildSitemapXml(['/pricing', '/license'], siteUrl, lastmod);
    expect(xml).toContain(`<loc>${siteUrl}/pricing</loc>`);
    expect(xml).toContain(`<loc>${siteUrl}/license</loc>`);
    expect(xml.match(/<lastmod>2026-07-06<\/lastmod>/g)).toHaveLength(2);
    expect(xml.match(/<url>/g)).toHaveLength(2);
  });

  it('escapes special characters in route paths', () => {
    const xml = buildSitemapXml(['/search?q=a&b'], siteUrl, lastmod);
    expect(xml).toContain(`<loc>${siteUrl}/search?q=a&amp;b</loc>`);
  });

  it('returns an empty urlset for no routes', () => {
    const xml = buildSitemapXml([], siteUrl, lastmod);
    expect(xml).not.toContain('<url>');
  });
});
