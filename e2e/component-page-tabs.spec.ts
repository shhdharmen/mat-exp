import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function waitForPageContent(page: Page) {
  await page.locator('.markdown-body, .not-found, app-playground').first().waitFor({
    state: 'visible',
    timeout: 10_000,
  });
}

/** After clicking a tab link, wait for the route and markdown to finish updating. */
async function waitForTabNavigation(page: Page, urlPattern: string | RegExp) {
  await page.waitForURL(urlPattern, { timeout: 10_000 });
  const loading = page.locator('.loading-state');
  await loading.waitFor({ state: 'attached', timeout: 3_000 }).catch(() => undefined);
  await loading.waitFor({ state: 'detached', timeout: 10_000 }).catch(() => undefined);
  await page
    .locator('.markdown-body, app-playground')
    .first()
    .waitFor({ state: 'visible', timeout: 10_000 });
}

/** Locate the mat-tab-nav-bar nav element rendered by TabsComponent. */
const tabBar = (page: Page) => page.locator('app-doc-tabs [mat-tab-nav-bar]');

/** Locate all mat-tab-link anchors inside the tab bar. */
const tabLinks = (page: Page) => page.locator('app-doc-tabs [mat-tab-link]');

/** Locate the active mat-tab-link (mdc-tab--active is toggled by [active] input). */
const activeTab = (page: Page) => page.locator('app-doc-tabs [mat-tab-link].mdc-tab--active');

// ---------------------------------------------------------------------------
// 1. Tab bar renders on component pages
// ---------------------------------------------------------------------------

test.describe('Tab bar visibility', () => {
  test('tab bar is visible on a component page base path', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button');
    await waitForPageContent(page);

    await expect(tabBar(page)).toBeVisible();
  });

  test('tab bar is visible when deep-linking to a tab URL', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button/api');
    await waitForPageContent(page);

    await expect(tabBar(page)).toBeVisible();
  });

  test('tab bar renders exactly four tabs in order', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button');
    await waitForPageContent(page);

    const tabs = tabLinks(page);
    await expect(tabs).toHaveCount(4);

    const labels = await tabs.allInnerTexts();
    expect(labels.map((l) => l.trim())).toEqual(['Overview', 'API', 'Styling', 'Playground']);
  });

  test('tab bar does NOT appear on a non-component Getting Started page', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForPageContent(page);

    await expect(page.locator('app-doc-tabs')).not.toBeVisible();
  });

  test('tab bar does NOT appear on a Styles API page', async ({ page }) => {
    await page.goto('/docs/styles-api/all-styles');
    await waitForPageContent(page);

    await expect(page.locator('app-doc-tabs')).not.toBeVisible();
  });

  test('tab bar appears for a different component page (loading-indicator)', async ({ page }) => {
    await page.goto('/docs/components/loading-and-progress/loading-indicator');
    await waitForPageContent(page);

    await expect(tabBar(page)).toBeVisible();
    const tabs = tabLinks(page);
    await expect(tabs).toHaveCount(4);
  });
});

// ---------------------------------------------------------------------------
// 2. Active tab state (exact routerLinkActive matching)
// ---------------------------------------------------------------------------

test.describe('Active tab highlighting', () => {
  test('Overview tab is active on the component page base path', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button');
    await waitForPageContent(page);

    const active = activeTab(page);
    await expect(active).toHaveCount(1);
    await expect(active).toContainText('Overview');
  });

  test('API tab is active on the /api URL', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button/api');
    await waitForPageContent(page);

    const active = activeTab(page);
    await expect(active).toHaveCount(1);
    await expect(active).toContainText('API');
  });

  test('Styling tab is active on the /styling URL', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button/styling');
    await waitForPageContent(page);

    const active = activeTab(page);
    await expect(active).toHaveCount(1);
    await expect(active).toContainText('Styling');
  });

  test('Playground tab is active on the /playground URL', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button/playground');
    await waitForPageContent(page);

    const active = activeTab(page);
    await expect(active).toHaveCount(1);
    await expect(active).toContainText('Playground');
  });

  test('Overview tab is NOT active when on /api (exact matching enforced)', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button/api');
    await waitForPageContent(page);

    const overviewTab = tabLinks(page).filter({ hasText: 'Overview' });
    await expect(overviewTab).not.toHaveClass(/active/);
  });

  test('exactly one tab is active at a time', async ({ page }) => {
    for (const url of [
      '/docs/components/all-buttons/button',
      '/docs/components/all-buttons/button/api',
      '/docs/components/all-buttons/button/styling',
      '/docs/components/all-buttons/button/playground',
    ]) {
      await page.goto(url);
      await waitForPageContent(page);
      await expect(activeTab(page)).toHaveCount(1);
    }
  });
});

// ---------------------------------------------------------------------------
// 3. Tab click navigation
// ---------------------------------------------------------------------------

test.describe('Tab click navigation', () => {
  test('clicking the API tab navigates to the /api URL', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button');
    await waitForPageContent(page);

    await tabLinks(page).filter({ hasText: 'API' }).click();
    await waitForTabNavigation(page, '**/button/api');

    expect(page.url()).toContain('/docs/components/all-buttons/button/api');
  });

  test('clicking the Styling tab navigates to the /styling URL', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button');
    await waitForPageContent(page);

    await tabLinks(page).filter({ hasText: 'Styling' }).click();
    await waitForTabNavigation(page, '**/button/styling');

    expect(page.url()).toContain('/docs/components/all-buttons/button/styling');
  });

  test('clicking the Playground tab navigates to the /playground URL', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button');
    await waitForPageContent(page);

    await tabLinks(page).filter({ hasText: 'Playground' }).click();
    await waitForTabNavigation(page, '**/button/playground');

    expect(page.url()).toContain('/docs/components/all-buttons/button/playground');
  });

  test('clicking Overview tab from API tab returns to the base path', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button/api');
    await waitForPageContent(page);

    await tabLinks(page).filter({ hasText: 'Overview' }).click();
    await waitForTabNavigation(page, /\/docs\/components\/all-buttons\/button$/);

    // URL must be exactly the base path, not /api
    expect(page.url()).toMatch(/\/docs\/components\/all-buttons\/button$/);
  });

  test('tab bar stays visible after switching between tabs', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button');
    await waitForPageContent(page);

    await tabLinks(page).filter({ hasText: 'API' }).click();
    await waitForTabNavigation(page, '**/button/api');
    await expect(tabBar(page)).toBeVisible();

    await tabLinks(page).filter({ hasText: 'Styling' }).click();
    await waitForTabNavigation(page, '**/button/styling');
    await expect(tabBar(page)).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 4. Correct markdown content is loaded per tab
// ---------------------------------------------------------------------------

test.describe('Per-tab content rendering', () => {
  test('Overview tab loads index.md content', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button');
    await waitForPageContent(page);

    // index.md should have some content in the markdown body
    await expect(page.locator('.markdown-body')).not.toBeEmpty();
    // The overview page typically contains component usage prose, not API-only content
    await expect(page.locator('.markdown-body')).toBeVisible();
  });

  test('API tab loads api.md and shows API-specific content', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button/api');
    await waitForPageContent(page);

    // api.md for the Button component contains 'Data Attributes'
    await expect(page.locator('.markdown-body')).toContainText('Data Attributes');
  });

  test('content changes when switching from Overview to API tab', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button');
    await waitForPageContent(page);
    const overviewContent = await page.locator('.markdown-body').textContent();

    await tabLinks(page).filter({ hasText: 'API' }).click();
    await waitForTabNavigation(page, '**/button/api');
    await expect(page.locator('.markdown-body')).toContainText('Data Attributes');
    const apiContent = await page.locator('.markdown-body').textContent();

    expect(apiContent).not.toBe(overviewContent);
  });

  test('styling.md content is rendered on the Styling tab', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button/styling');
    await waitForPageContent(page);

    await expect(page.locator('.markdown-body')).not.toBeEmpty();
    await expect(page.locator('.markdown-body')).toBeVisible();
  });

  test('playground is rendered on the Playground tab', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button/playground');
    await waitForPageContent(page);

    await expect(page.locator('app-playground')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 5. Deep-linking to each tab URL
// ---------------------------------------------------------------------------

test.describe('Deep-linking to tab URLs', () => {
  test('deep-link to /api renders content without visiting base path first', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button/api');
    await waitForPageContent(page);

    await expect(page.locator('.markdown-body')).toContainText('Data Attributes');
    await expect(activeTab(page)).toContainText('API');
  });

  test('deep-link to /styling renders the Styling tab active', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button/styling');
    await waitForPageContent(page);

    await expect(page.locator('.markdown-body')).toBeVisible();
    await expect(activeTab(page)).toContainText('Styling');
  });

  test('deep-link to /playground renders the Playground tab active', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button/playground');
    await waitForPageContent(page);

    await expect(page.locator('app-playground')).toBeVisible();
    await expect(activeTab(page)).toContainText('Playground');
  });

  test('deep-link to the loading-indicator API tab works', async ({ page }) => {
    await page.goto('/docs/components/loading-and-progress/loading-indicator/api');
    await waitForPageContent(page);

    await expect(tabBar(page)).toBeVisible();
    await expect(activeTab(page)).toContainText('API');
    await expect(page.locator('.markdown-body')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 6. No stale tab state when navigating between different component pages
// ---------------------------------------------------------------------------

test.describe('Cross-component navigation', () => {
  test('switching from button/api to icon-button shows icon-button tabs with Overview active', async ({
    page,
  }) => {
    await page.goto('/docs/components/all-buttons/button/api');
    await waitForPageContent(page);
    await expect(activeTab(page)).toContainText('API');

    // Navigate to icon-button overview via sidebar or direct navigation
    await page.goto('/docs/components/all-buttons/icon-button');
    await waitForPageContent(page);

    await expect(tabBar(page)).toBeVisible();
    await expect(activeTab(page)).toContainText('Overview');
  });

  test('tabs work correctly for button-group component page', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button-group');
    await waitForPageContent(page);

    await expect(tabLinks(page)).toHaveCount(4);
    await expect(activeTab(page)).toContainText('Overview');

    await tabLinks(page).filter({ hasText: 'API' }).click();
    await waitForTabNavigation(page, '**/button-group/api');

    expect(page.url()).toContain('/docs/components/all-buttons/button-group/api');
    await expect(activeTab(page)).toContainText('API');
  });
});

// ---------------------------------------------------------------------------
// 7. Accessibility
// ---------------------------------------------------------------------------

test.describe('Tab bar accessibility', () => {
  test('tab nav has role="tablist" and correct aria-label', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button');
    await waitForPageContent(page);

    const nav = tabBar(page);
    // mat-tab-nav-bar sets role="tablist" via _getRole() host binding
    await expect(nav).toHaveAttribute('role', 'tablist');
    // aria-label added directly to the nav element in the template
    await expect(nav).toHaveAttribute('aria-label', 'Component page sections');
  });

  test('each tab link has role="tab"', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button');
    await waitForPageContent(page);

    const tabs = tabLinks(page);
    const count = await tabs.count();
    for (let i = 0; i < count; i++) {
      // mat-tab-link sets role="tab" via _getRole() host binding
      await expect(tabs.nth(i)).toHaveAttribute('role', 'tab');
    }
  });

  test('active tab is focusable and other tabs are reachable via arrow keys', async ({ page }) => {
    await page.goto('/docs/components/all-buttons/button');
    await waitForPageContent(page);

    // mat-tab-nav-bar follows WAI-ARIA tablist pattern: Tab focuses the active tab,
    // ArrowRight/ArrowLeft move focus between tabs without changing the URL.
    const active = activeTab(page);
    await active.focus();
    await expect(active).toBeFocused();

    // ArrowRight moves focus to the next tab (API)
    await page.keyboard.press('ArrowRight');
    await expect(tabLinks(page).nth(1)).toBeFocused();
  });
});
