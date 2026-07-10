import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// 1. public/versions.json — static asset
// ---------------------------------------------------------------------------

test.describe('versions.json — static asset', () => {
  test('versions.json is served with HTTP 200', async ({ page }) => {
    const response = await page.request.get('/versions.json');
    expect(response.ok()).toBe(true);
    expect(response.status()).toBe(200);
  });

  test('versions.json content is a valid JSON array', async ({ page }) => {
    const response = await page.request.get('/versions.json');
    const content = await response.json();
    expect(Array.isArray(content)).toBe(true);
  });

  test('versions.json starts as an empty array', async ({ page }) => {
    const response = await page.request.get('/versions.json');
    const content = await response.json();
    // Initial state before any release workflow appends versions
    expect(content).toEqual([]);
  });

  test('versions.json contains only string entries when non-empty', async ({ page }) => {
    const response = await page.request.get('/versions.json');
    const content = (await response.json()) as unknown[];
    for (const entry of content) {
      expect(typeof entry).toBe('string');
    }
  });

  test('versions.json Content-Type is application/json', async ({ page }) => {
    const response = await page.request.get('/versions.json');
    const contentType = response.headers()['content-type'] ?? '';
    expect(contentType).toContain('json');
  });
});

// ---------------------------------------------------------------------------
// 2. App still loads correctly (VersionsService fetch failure is graceful)
// ---------------------------------------------------------------------------

test.describe('VersionsService — graceful failure', () => {
  test('app loads normally even when versions.json fetch fails', async ({ page }) => {
    // Intercept the production domain fetch that VersionsService makes and return 500
    await page.route('https://expressive.angular-material.dev/versions.json', (route) =>
      route.fulfill({ status: 500, body: 'Internal Server Error' }),
    );

    await page.goto('/getting-started/installation');
    await page.waitForSelector('.loading-state', { state: 'detached', timeout: 10_000 });

    // App should still render normally — VersionsService falls back to []
    await expect(page.locator('.markdown-body')).toBeVisible({ timeout: 10_000 });
  });

  test('app loads normally even when versions.json returns invalid JSON', async ({ page }) => {
    await page.route('https://expressive.angular-material.dev/versions.json', (route) =>
      route.fulfill({ status: 200, body: 'not-json' }),
    );

    await page.goto('/getting-started/installation');
    await page.waitForSelector('.loading-state', { state: 'detached', timeout: 10_000 });

    await expect(page.locator('.markdown-body')).toBeVisible({ timeout: 10_000 });
  });
});
