import { test, expect, type Page } from '@playwright/test';

const VERSIONS_URL = 'https://expressive.angular-material.dev/versions.json';
const START_PATH = '/getting-started/installation';

async function mockVersionsJson(page: Page, versions: string[]): Promise<void> {
  await page.route(VERSIONS_URL, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(versions),
    }),
  );
}

async function openVersionMenu(page: Page): Promise<void> {
  await page.locator('app-version-switcher button.version-button').click();
  await expect(page.locator('.mat-mdc-menu-panel')).toBeVisible();
}

// ---------------------------------------------------------------------------
// 1. Presence
// ---------------------------------------------------------------------------

test.describe('VersionSwitcherComponent — presence', () => {
  test('version switcher button is visible in the header on desktop', async ({ page }) => {
    await mockVersionsJson(page, []);
    await page.goto(START_PATH);
    await expect(page.locator('app-version-switcher button.version-button')).toBeVisible();
  });

  test('button label shows "Latest" when no version is set in the build', async ({ page }) => {
    await mockVersionsJson(page, []);
    await page.goto(START_PATH);
    await expect(page.locator('app-version-switcher .version-label')).toHaveText('Latest');
  });
});

// ---------------------------------------------------------------------------
// 2. Dropdown content
// ---------------------------------------------------------------------------

test.describe('VersionSwitcherComponent — dropdown', () => {
  test('dropdown contains only "Latest" when versions list is empty', async ({ page }) => {
    await mockVersionsJson(page, []);
    await page.goto(START_PATH);
    await openVersionMenu(page);

    const items = page.locator('.mat-mdc-menu-panel button[mat-menu-item]');
    await expect(items).toHaveCount(1);
    await expect(items.first()).toContainText('Latest');
  });

  test('dropdown shows all versions from VersionsService plus "Latest"', async ({ page }) => {
    await mockVersionsJson(page, ['v1', 'v2']);
    await page.goto(START_PATH);
    await openVersionMenu(page);

    const items = page.locator('.mat-mdc-menu-panel button[mat-menu-item]');
    await expect(items).toHaveCount(3);
    await expect(items.nth(0)).toContainText('Latest');
    await expect(items.nth(1)).toContainText('v1');
    await expect(items.nth(2)).toContainText('v2');
  });

  test('"Latest" entry shows a check icon when the build has no version set', async ({ page }) => {
    await mockVersionsJson(page, ['v1']);
    await page.goto(START_PATH);
    await openVersionMenu(page);

    const latestItem = page.locator('.mat-mdc-menu-panel button[mat-menu-item]').first();
    await expect(latestItem.locator('mat-icon.check-icon')).toBeVisible();
  });

  test('versioned entries do not show a check icon when the build is Latest', async ({ page }) => {
    await mockVersionsJson(page, ['v1']);
    await page.goto(START_PATH);
    await openVersionMenu(page);

    const v1Item = page.locator('.mat-mdc-menu-panel button[mat-menu-item]', { hasText: 'v1' });
    await expect(v1Item.locator('mat-icon.check-icon')).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 3. Navigation (window.location.href is intercepted to prevent real redirect)
// ---------------------------------------------------------------------------

test.describe('VersionSwitcherComponent — navigation', () => {
  test('selecting "Latest" navigates to the root production domain with current path', async ({
    page,
  }) => {
    await mockVersionsJson(page, ['v1']);
    await page.goto(START_PATH);
    await openVersionMenu(page);

    const [request] = await Promise.all([
      page.waitForRequest(
        (req) =>
          req.isNavigationRequest() &&
          req.url().startsWith('https://expressive.angular-material.dev'),
      ),
      page.locator('.mat-mdc-menu-panel button[mat-menu-item]', { hasText: 'Latest' }).click(),
    ]);

    expect(request.url()).toBe(`https://expressive.angular-material.dev${START_PATH}`);
  });

  test('selecting a version navigates to the versioned subdomain with current path', async ({
    page,
  }) => {
    await mockVersionsJson(page, ['v1']);
    await page.goto(START_PATH);
    await openVersionMenu(page);

    const [request] = await Promise.all([
      page.waitForRequest(
        (req) =>
          req.isNavigationRequest() &&
          req.url().startsWith('https://v1.expressive.angular-material.dev'),
      ),
      page.locator('.mat-mdc-menu-panel button[mat-menu-item]', { hasText: 'v1' }).click(),
    ]);

    expect(request.url()).toBe(`https://v1.expressive.angular-material.dev${START_PATH}`);
  });
});
