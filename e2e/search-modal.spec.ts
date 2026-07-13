import { test, expect, type Page } from '@playwright/test';

const PAGEFIND_MOCK = `
  export async function init() {}
  export async function debouncedSearch(query) {
    if (!query || !query.trim()) return null;
    return {
      results: [
        {
          id: '1',
          data: async () => ({
            url: '/docs/getting-started/installation',
            excerpt: 'Install <mark>Angular</mark> Material Expressive.',
            meta: { title: 'Installation' },
          }),
        },
        {
          id: '2',
          data: async () => ({
            url: '/components/all-buttons/button',
            excerpt: 'The expressive <mark>button</mark> component.',
            meta: { title: 'Button' },
          }),
        },
      ],
    };
  }
`;

async function mockPagefind(page: Page): Promise<void> {
  await page.route('**/_pagefind/pagefind.js', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/javascript; charset=utf-8',
      body: PAGEFIND_MOCK,
    }),
  );
}

// ---------------------------------------------------------------------------
// 1. Search trigger button in the header
// ---------------------------------------------------------------------------

test.describe('Search trigger button', () => {
  test('header contains a search button', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await expect(
      page.locator('app-header button[aria-label="Search docs (Ctrl+K)"]'),
    ).toBeVisible();
  });

  test('search button shows ⌃K keyboard hint on desktop', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    const kbd = page.locator('app-header kbd');
    await expect(kbd).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 2. Opening and closing the modal
// ---------------------------------------------------------------------------

test.describe('Search modal — open / close', () => {
  test('Ctrl+K opens the search modal', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await page.keyboard.press('Control+k');
    await expect(page.locator('app-search-modal')).toBeVisible();
  });

  test('Meta+K opens the search modal (Mac)', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await page.keyboard.press('Meta+k');
    await expect(page.locator('app-search-modal')).toBeVisible();
  });

  test('clicking the search button opens the modal', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await page.locator('app-header button[aria-label="Search docs (Ctrl+K)"]').click();
    await expect(page.locator('app-search-modal')).toBeVisible();
  });

  test('Escape closes the modal', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await page.keyboard.press('Control+k');
    await expect(page.locator('app-search-modal')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('app-search-modal')).not.toBeVisible();
  });

  test('clicking the backdrop closes the modal', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await page.locator('button[aria-label="Search docs (Ctrl+K)"]').waitFor({ state: 'visible' });
    await page.keyboard.press('Control+k');
    await expect(page.locator('app-search-modal')).toBeVisible();

    // Click the backdrop directly (rather than a blind coordinate click) so
    // Playwright's actionability checks wait for the CDK overlay backdrop's
    // outsidePointerEvents listener to actually be attached before clicking.
    await page.locator('.cdk-overlay-backdrop').click({ position: { x: 10, y: 10 } });
    await expect(page.locator('app-search-modal')).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 3. Search input behaviour
// ---------------------------------------------------------------------------

test.describe('Search modal — input', () => {
  test('search input is auto-focused on open', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await page.keyboard.press('Control+k');

    const input = page.locator('app-search-modal input[type="search"]');
    await expect(input).toBeVisible();
    await expect(input).toBeFocused();
  });

  test('shows empty-state prompt before typing', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await page.keyboard.press('Control+k');

    await expect(page.locator('app-search-modal')).toContainText('Start typing to search');
  });
});

// ---------------------------------------------------------------------------
// 4. Search results (Pagefind mocked)
// ---------------------------------------------------------------------------

test.describe('Search modal — results', () => {
  test('typing a query shows matching results', async ({ page }) => {
    await mockPagefind(page);
    await page.goto('/docs/getting-started/installation');
    await page.keyboard.press('Control+k');

    await page.locator('app-search-modal input[type="search"]').fill('install');

    const results = page.locator('app-search-modal ul[role="listbox"] li[role="option"]');
    await expect(results).toHaveCount(2);
  });

  test('results show section group headers', async ({ page }) => {
    await mockPagefind(page);
    await page.goto('/docs/getting-started/installation');
    await page.keyboard.press('Control+k');

    await page.locator('app-search-modal input[type="search"]').fill('install');

    await expect(page.locator('app-search-modal')).toContainText('Getting Started');
    await expect(page.locator('app-search-modal')).toContainText('Components');
  });

  test('results show type tag pills', async ({ page }) => {
    await mockPagefind(page);
    await page.goto('/docs/getting-started/installation');
    await page.keyboard.press('Control+k');

    await page.locator('app-search-modal input[type="search"]').fill('install');

    await expect(page.locator('app-search-modal')).toContainText('Guide');
    await expect(page.locator('app-search-modal')).toContainText('Component');
  });

  test('no-results state appears when there are no matches', async ({ page }) => {
    await page.route('**/_pagefind/pagefind.js', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/javascript; charset=utf-8',
        body: `
          export async function init() {}
          export async function debouncedSearch() {
            return { results: [] };
          }
        `,
      }),
    );
    await page.goto('/docs/getting-started/installation');
    await page.keyboard.press('Control+k');

    await page.locator('app-search-modal input[type="search"]').fill('zzznomatch');
    await expect(page.locator('app-search-modal')).toContainText('No results for');
  });

  test('ArrowDown / ArrowUp moves highlight through results', async ({ page }) => {
    await mockPagefind(page);
    await page.goto('/docs/getting-started/installation');
    await page.keyboard.press('Control+k');
    await page.locator('app-search-modal input[type="search"]').fill('install');

    const items = page.locator('app-search-modal ul[role="listbox"] li[role="option"]');
    await expect(items).toHaveCount(2);

    await page.keyboard.press('ArrowDown');
    await expect(items.nth(0)).toHaveClass(/cdk-option-active/);

    await page.keyboard.press('ArrowDown');
    await expect(items.nth(1)).toHaveClass(/cdk-option-active/);

    await page.keyboard.press('ArrowUp');
    await expect(items.nth(0)).toHaveClass(/cdk-option-active/);
  });

  test('Enter on a highlighted result navigates and closes the modal', async ({ page }) => {
    await mockPagefind(page);
    await page.goto('/docs/getting-started/installation');
    await page.keyboard.press('Control+k');
    await page.locator('app-search-modal input[type="search"]').fill('button');

    // Wait for results to render before navigating
    await expect(page.locator('app-search-modal ul[role="listbox"] li[role="option"]')).toHaveCount(
      2,
    );

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await expect(page.locator('app-search-modal')).not.toBeVisible();
  });

  test('result count is shown in the footer', async ({ page }) => {
    await mockPagefind(page);
    await page.goto('/docs/getting-started/installation');
    await page.keyboard.press('Control+k');

    await page.locator('app-search-modal input[type="search"]').fill('install');

    await expect(page.locator('app-search-modal')).toContainText('2 results');
  });
});

// ---------------------------------------------------------------------------
// 5. Recent searches
// ---------------------------------------------------------------------------

test.describe('Search modal — recent searches', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/docs/getting-started/installation');
    await page.evaluate(() => localStorage.removeItem('docs-recent-searches'));
  });

  test('recent searches appear after navigating to a result', async ({ page }) => {
    await mockPagefind(page);
    await page.goto('/docs/getting-started/installation');
    await page.keyboard.press('Control+k');

    await page.locator('app-search-modal input[type="search"]').fill('install');
    await expect(page.locator('app-search-modal ul[role="listbox"] li[role="option"]')).toHaveCount(
      2,
    );
    await page.locator('app-search-modal ul[role="listbox"] li[role="option"]').first().click();

    // Reopen modal — should show recent
    await page.keyboard.press('Control+k');
    await expect(page.locator('app-search-modal')).toContainText('Recent');
    await expect(page.locator('app-search-modal')).toContainText('install');
  });

  test('clicking a recent search populates the input and searches', async ({ page }) => {
    await mockPagefind(page);
    // Seed localStorage
    await page.goto('/docs/getting-started/installation');
    await page.evaluate(() =>
      localStorage.setItem('docs-recent-searches', JSON.stringify(['angular'])),
    );

    await page.keyboard.press('Control+k');
    await expect(page.locator('app-search-modal')).toContainText('Recent');

    await page.locator('app-search-modal ul[aria-label="Recent searches"] li').first().click();

    const input = page.locator('app-search-modal input[type="search"]');
    await expect(input).toHaveValue('angular');
  });

  test('clear all removes all recent searches', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await page.evaluate(() =>
      localStorage.setItem('docs-recent-searches', JSON.stringify(['foo', 'bar'])),
    );
    await page.locator('button[aria-label="Search docs (Ctrl+K)"]').waitFor({ state: 'visible' });

    await page.keyboard.press('Control+k');
    await expect(page.locator('app-search-modal')).toContainText('Recent');

    await page.locator('app-search-modal button', { hasText: 'Clear all' }).click();

    await expect(page.locator('app-search-modal')).toContainText('Start typing to search');
  });

  test('remove button deletes a single recent search', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await page.evaluate(() =>
      localStorage.setItem('docs-recent-searches', JSON.stringify(['foo', 'bar'])),
    );
    await page.locator('button[aria-label="Search docs (Ctrl+K)"]').waitFor({ state: 'visible' });

    await page.keyboard.press('Control+k');
    await expect(page.locator('app-search-modal')).toContainText('foo');
    await expect(page.locator('app-search-modal')).toContainText('bar');

    const firstItem = page.locator('app-search-modal ul[aria-label="Recent searches"] li').first();
    await firstItem.hover();
    await firstItem.locator('button[aria-label="Remove from recent searches"]').click();

    await expect(page.locator('app-search-modal')).not.toContainText('foo');
    await expect(page.locator('app-search-modal')).toContainText('bar');
  });
});
