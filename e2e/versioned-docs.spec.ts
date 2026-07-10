import { test, expect, type Page } from '@playwright/test';

async function waitForPageContent(page: Page) {
  const loading = page.locator('.loading-state');
  await loading.waitFor({ state: 'attached', timeout: 10_000 }).catch(() => undefined);
  await loading.waitFor({ state: 'detached', timeout: 10_000 }).catch(() => undefined);
  await page
    .locator('.markdown-body, .not-found')
    .first()
    .waitFor({ state: 'visible', timeout: 10_000 });
}

// ---------------------------------------------------------------------------
// 1. Latest routing — no version prefix, always serves from /docs/
// ---------------------------------------------------------------------------

test.describe('Latest routing', () => {
  test('navigating to /getting-started/installation serves the latest content', async ({ page }) => {
    await page.goto('/getting-started/installation');
    await waitForPageContent(page);

    await expect(page.locator('.markdown-body')).toBeVisible();
    await expect(page.locator('.markdown-body')).not.toBeEmpty();
  });

  test('latest page does NOT show the deprecation banner', async ({ page }) => {
    await page.goto('/getting-started/installation');
    await waitForPageContent(page);

    await expect(page.locator('.deprecation-banner')).not.toBeVisible();
  });

  test('latest component page does NOT show the deprecation banner', async ({ page }) => {
    await page.goto('/components/all-buttons/button');
    await waitForPageContent(page);

    await expect(page.locator('.deprecation-banner')).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 2. /vN/ paths are no longer handled — they render the not-found state
// ---------------------------------------------------------------------------

test.describe('Removed versioned routing', () => {
  test('navigating to /v1/getting-started/installation shows not-found', async ({ page }) => {
    await page.goto('/v1/getting-started/installation');
    await waitForPageContent(page);

    await expect(page.locator('.not-found')).toBeVisible();
    await expect(page.locator('.markdown-body')).not.toBeVisible();
  });

  test('navigating to /v1/components/all-buttons/button shows not-found', async ({ page }) => {
    await page.goto('/v1/components/all-buttons/button');
    await waitForPageContent(page);

    await expect(page.locator('.not-found')).toBeVisible();
  });

  test('/v1/ path does NOT show the deprecation banner (banner is a stub)', async ({ page }) => {
    await page.goto('/v1/getting-started/installation');
    await waitForPageContent(page);

    // DeprecationBannerComponent is a stub; it should not be visible on any path
    await expect(page.locator('.deprecation-banner')).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 3. nav-manifest.json — no versions field
// ---------------------------------------------------------------------------

test.describe('nav-manifest.json — no versions field', () => {
  test('manifest is served and does not contain a versions field', async ({ page }) => {
    const response = await page.request.get('/nav-manifest.json');
    expect(response.ok()).toBe(true);

    const manifest = (await response.json()) as Record<string, unknown>;
    expect('versions' in manifest).toBe(false);
  });

  test('manifest contains nav, pages, and sectionRedirects fields', async ({ page }) => {
    const response = await page.request.get('/nav-manifest.json');
    const manifest = (await response.json()) as Record<string, unknown>;

    expect(Array.isArray(manifest['nav'])).toBe(true);
    expect(Array.isArray(manifest['pages'])).toBe(true);
    expect(typeof manifest['sectionRedirects']).toBe('object');
  });
});

// ---------------------------------------------------------------------------
// 4. routes.txt — no /vN/ routes
// ---------------------------------------------------------------------------

test.describe('routes.txt — no versioned routes', () => {
  test('routes.txt is served correctly', async ({ page }) => {
    const response = await page.request.get('/routes.txt');
    expect(response.ok()).toBe(true);
  });

  test('routes.txt contains unversioned (latest) routes', async ({ page }) => {
    const response = await page.request.get('/routes.txt');
    const text = await response.text();
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

    expect(lines).toContain('/getting-started/installation');
    expect(lines).toContain('/components/all-buttons/button');
  });

  test('routes.txt contains NO /vN/ prefixed routes', async ({ page }) => {
    const response = await page.request.get('/routes.txt');
    const text = await response.text();
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

    const versionedRoutes = lines.filter((l) => /^\/v\d+\//.test(l) || l === '/v1' || l === '/v2');
    expect(versionedRoutes).toHaveLength(0);
  });
});
