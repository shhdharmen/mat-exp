import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Asserts the outcome of the Component Page tabs → single-page migration
// (#177, #178, #179): every component's old per-tab URLs 404 (no redirects),
// and its merged page contains the Playground, API, and Styling sections in
// the expected order. The tabs architecture itself (`app-doc-tabs`) is gone
// (#179), so there's nothing left to assert about tab-bar visibility.
// ---------------------------------------------------------------------------

async function waitForPageContent(page: Page) {
  await page.locator('.markdown-body, .not-found, app-playground').first().waitFor({
    state: 'visible',
    timeout: 10_000,
  });
}

const COMPONENTS = [
  { slug: 'button', path: '/docs/components/all-buttons/button' },
  { slug: 'icon-button', path: '/docs/components/all-buttons/icon-button' },
  { slug: 'button-group', path: '/docs/components/all-buttons/button-group' },
  { slug: 'split-button', path: '/docs/components/all-buttons/split-button' },
  { slug: 'fab-menu', path: '/docs/components/all-buttons/fab-menu' },
  {
    slug: 'loading-indicator',
    path: '/docs/components/loading-and-progress/loading-indicator',
  },
] as const;

// ---------------------------------------------------------------------------
// 1. Old tab URLs 404 (no redirects) for every migrated component
// ---------------------------------------------------------------------------

test.describe('Old tab URLs 404 for every migrated component', () => {
  for (const { slug, path } of COMPONENTS) {
    for (const tab of ['api', 'styling', 'playground'] as const) {
      test(`${slug} old /${tab} URL 404s (no redirect)`, async ({ page }) => {
        await page.goto(`${path}/${tab}`);
        await waitForPageContent(page);

        expect(page.url()).toContain(`${path}/${tab}`);
        await expect(page.locator('.not-found')).toBeVisible();
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 2. Each merged page contains Playground, API, and Styling sections in order
// ---------------------------------------------------------------------------

test.describe('Merged section order — Overview → Playground → API → Styling', () => {
  for (const { slug, path } of COMPONENTS) {
    test(`${slug} page contains the Playground, API, and Styling sections in order`, async ({
      page,
    }) => {
      await page.goto(path);
      await waitForPageContent(page);

      const headings = page.locator('.markdown-body h2');
      const texts = (await headings.allInnerTexts()).map((t) => t.trim());

      expect(texts).toContain('Playground');
      expect(texts).toContain('API');
      expect(texts).toContain('Styling');
      expect(texts.indexOf('Playground')).toBeLessThan(texts.indexOf('API'));
      expect(texts.indexOf('API')).toBeLessThan(texts.indexOf('Styling'));
    });
  }
});
