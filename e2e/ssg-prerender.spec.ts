import { test, expect, type Page } from '@playwright/test';

async function waitForPageContent(page: Page) {
  const loading = page.locator('.loading-state');
  await loading.waitFor({ state: 'attached', timeout: 10_000 }).catch(() => undefined);
  await loading.waitFor({ state: 'detached', timeout: 10_000 }).catch(() => undefined);
  await page
    .locator('.markdown-body, .not-found, app-playground')
    .first()
    .waitFor({ state: 'visible', timeout: 15_000 });
}

// ---------------------------------------------------------------------------
// 1. routes.txt — served correctly and well-formed
// ---------------------------------------------------------------------------

test.describe('routes.txt — static asset', () => {
  test('routes.txt is served with HTTP 200', async ({ page }) => {
    const response = await page.request.get('/routes.txt');
    expect(response.ok()).toBe(true);
    expect(response.status()).toBe(200);
  });

  test('routes.txt is non-empty', async ({ page }) => {
    const response = await page.request.get('/routes.txt');
    const text = await response.text();
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    expect(lines.length).toBeGreaterThan(0);
  });

  test('routes.txt contains /docs/getting-started/installation', async ({ page }) => {
    const response = await page.request.get('/routes.txt');
    const text = await response.text();
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    expect(lines).toContain('/docs/getting-started/installation');
  });

  test('routes.txt contains component page routes', async ({ page }) => {
    const response = await page.request.get('/routes.txt');
    const text = await response.text();
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    expect(lines).toContain('/docs/components/all-buttons/button');
    expect(lines).toContain('/docs/components/all-buttons/button/api');
    expect(lines).toContain('/docs/components/all-buttons/button/styling');
    expect(lines).toContain('/docs/components/all-buttons/button/playground');
  });

  test('all routes in routes.txt start with /', async ({ page }) => {
    const response = await page.request.get('/routes.txt');
    const text = await response.text();
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    for (const line of lines) {
      expect(line).toMatch(/^\//);
    }
  });

  test('routes.txt contains no /vN/ prefixed routes', async ({ page }) => {
    const response = await page.request.get('/routes.txt');
    const text = await response.text();
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const versioned = lines.filter((l) => /^\/v\d+/.test(l));
    expect(versioned).toHaveLength(0);
  });

  test('routes.txt contains /docs/api index route', async ({ page }) => {
    const response = await page.request.get('/routes.txt');
    const text = await response.text();
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    expect(lines).toContain('/docs/api');
  });

  test('routes.txt contains /pricing route', async ({ page }) => {
    const response = await page.request.get('/routes.txt');
    const text = await response.text();
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    expect(lines).toContain('/pricing');
  });

  test('routes.txt contains /license route', async ({ page }) => {
    const response = await page.request.get('/routes.txt');
    const text = await response.text();
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    expect(lines).toContain('/license');
  });

  test('routes.txt contains /docs/getting-started/licensing route', async ({ page }) => {
    const response = await page.request.get('/routes.txt');
    const text = await response.text();
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    expect(lines).toContain('/docs/getting-started/licensing');
  });

  test('routes.txt contains API symbol routes for known symbols', async ({ page }) => {
    const response = await page.request.get('/routes.txt');
    const text = await response.text();
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    expect(lines).toContain('/docs/api/mat-expressive/directives/MatExpressiveButton');
    expect(lines).toContain('/docs/api/mat-expressive/directives/MatExpressiveIconButton');
  });

  test('routes.txt API routes follow /docs/api/mat-expressive/:kind/:symbol pattern', async ({
    page,
  }) => {
    const response = await page.request.get('/routes.txt');
    const text = await response.text();
    const apiRoutes = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('/docs/api/'));

    expect(apiRoutes.length).toBeGreaterThan(1);
    for (const route of apiRoutes) {
      expect(route).toMatch(/^\/docs\/api\/mat-expressive\/[a-z]+\/\w+$/);
    }
  });
});

// ---------------------------------------------------------------------------
// 2. Key routes load real content (SSG smoke tests)
// ---------------------------------------------------------------------------

test.describe('SSG route smoke tests — key pages load content', () => {
  const keyRoutes = [
    '/docs/getting-started/installation',
    '/docs/getting-started/what-is-mat-expressive',
    '/docs/getting-started/licensing',
    '/docs/components/all-buttons/button',
    '/docs/components/all-buttons/button/api',
    '/docs/components/all-buttons/button/styling',
  ];

  for (const route of keyRoutes) {
    test(`${route} renders visible content`, async ({ page }) => {
      await page.goto(route);
      await waitForPageContent(page);
      await expect(page.locator('.markdown-body')).toBeVisible();
      await expect(page.locator('.markdown-body')).not.toBeEmpty();
    });
  }

  test('/pricing renders the pricing page component', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.locator('app-pricing-page')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('app-pricing-page')).not.toBeEmpty();
  });
});

// ---------------------------------------------------------------------------
// 3. 404 handling — unmatched paths render the not-found page
// ---------------------------------------------------------------------------

test.describe('404 / not-found handling', () => {
  test('navigating to an unknown path renders the not-found page', async ({ page }) => {
    await page.goto('/docs/this/path/definitely/does/not/exist');
    await waitForPageContent(page);
    await expect(page.locator('.not-found')).toBeVisible();
  });

  test('not-found page does not show a markdown body', async ({ page }) => {
    await page.goto('/docs/nonexistent-section/nonexistent-page');
    await waitForPageContent(page);
    await expect(page.locator('app-markdown')).not.toBeVisible();
  });

  test('recovering from a 404 to a valid page works', async ({ page }) => {
    await page.goto('/docs/does/not/exist');
    await waitForPageContent(page);
    await expect(page.locator('.not-found')).toBeVisible();

    await page.goto('/docs/getting-started/installation');
    await waitForPageContent(page);
    await expect(page.locator('.markdown-body')).toBeVisible();
    await expect(page.locator('.not-found')).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 4. angular.json prerender configuration — verified via nav-manifest.json
// ---------------------------------------------------------------------------

test.describe('Build pipeline artifacts', () => {
  test('nav-manifest.json is served', async ({ page }) => {
    const response = await page.request.get('/nav-manifest.json');
    expect(response.ok()).toBe(true);
    const manifest = (await response.json()) as Record<string, unknown>;
    expect(Array.isArray(manifest['nav'])).toBe(true);
  });

  test('api-manifest.json is served', async ({ page }) => {
    const response = await page.request.get('/api-manifest.json');
    expect(response.ok()).toBe(true);
    const manifest = await response.json();
    expect(typeof manifest).toBe('object');
  });

  test('playground-schemas.json is served', async ({ page }) => {
    const response = await page.request.get('/playground-schemas.json');
    expect(response.ok()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. API Reference routing (Wave 6b)
// ---------------------------------------------------------------------------

test.describe('API Reference routes', () => {
  test('/docs/api loads without 404 or redirect loop', async ({ page }) => {
    const response = await page.goto('/docs/api');
    expect(response?.status()).not.toBe(404);
    expect(page.url()).toContain('/docs/api');
    await expect(page.locator('app-root')).toBeVisible({ timeout: 10_000 });
  });

  test('/docs/api/mat-expressive/directives/MatExpressiveButton loads without 404', async ({
    page,
  }) => {
    const response = await page.goto('/docs/api/mat-expressive/directives/MatExpressiveButton');
    expect(response?.status()).not.toBe(404);
    expect(page.url()).toContain('/docs/api/mat-expressive/directives/MatExpressiveButton');
    await expect(page.locator('app-root')).toBeVisible({ timeout: 10_000 });
  });

  test('/docs/api/:package/:kind/:symbol does not fall through to not-found', async ({ page }) => {
    await page.goto('/docs/api/mat-expressive/classes/MatExpressiveSelectableButtonChange');
    await expect(page.locator('.not-found')).not.toBeVisible({ timeout: 10_000 });
    await expect(page.locator('app-root')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 10. Wave 10 — scope-first API URL restructure
// ---------------------------------------------------------------------------

test.describe('Wave 10 — API URL restructure', () => {
  test('old kind-first URL format renders "Symbol not found" instead of the real page', async ({
    page,
  }) => {
    await page.goto('/docs/api/directives/mat-expressive/MatExpressiveButton');
    await expect(page.locator('app-api-detail-page')).toContainText('Symbol not found', {
      timeout: 10_000,
    });
  });

  test('old kind-first URL format is absent from routes.txt', async ({ page }) => {
    const response = await page.request.get('/routes.txt');
    const text = await response.text();
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const oldFormat = lines.filter((l) =>
      /^\/docs\/api\/(components|directives|classes|interfaces|types|functions|constants)\/mat-expressive\//.test(
        l,
      ),
    );
    expect(oldFormat).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 6. Sidebar "API Reference" link (Wave 6b)
// ---------------------------------------------------------------------------

test.describe('Sidebar — API Reference link', () => {
  test('sidebar shows an "API Reference" link', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForPageContent(page);
    const link = page.locator('nav a', { hasText: 'API Reference' });
    await expect(link).toBeVisible({ timeout: 10_000 });
  });

  test('API Reference link points to /docs/api', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForPageContent(page);
    const link = page.locator('nav a', { hasText: 'API Reference' });
    const href = await link.getAttribute('href');
    expect(href).toContain('/docs/api');
  });

  test('clicking API Reference link navigates to /docs/api', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForPageContent(page);
    await page.locator('nav a', { hasText: 'API Reference' }).click();
    await expect(page).toHaveURL(/\/docs\/api$/, { timeout: 10_000 });
  });
});

// ---------------------------------------------------------------------------
// 7. Wave 8 — Shell architecture (standalone vs docs shell)
// ---------------------------------------------------------------------------

test.describe('Wave 8 — Shell architecture', () => {
  test('docs pages use the docs shell with sidebar', async ({ page }) => {
    await page.goto('/docs/getting-started/installation');
    await waitForPageContent(page);
    await expect(page.locator('app-docs-shell')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('app-sidebar-nav')).toBeVisible({ timeout: 10_000 });
  });

  test('standalone pages use the standalone shell without sidebar', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.locator('app-standalone-shell')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('app-sidebar-nav')).not.toBeVisible();
  });

  test('standalone shell has a logo link to the homepage', async ({ page }) => {
    await page.goto('/pricing');
    const logoLink = page.locator('app-standalone-shell header a[href="/"]');
    await expect(logoLink).toBeVisible({ timeout: 10_000 });
  });

  test('docs shell does not appear on standalone pages', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('app-docs-shell')).not.toBeVisible({ timeout: 10_000 });
  });
});

// ---------------------------------------------------------------------------
// 8. Wave 8 — License page at /license
// ---------------------------------------------------------------------------

test.describe('Wave 8 — License page', () => {
  test('/license renders the license page component', async ({ page }) => {
    await page.goto('/license');
    await expect(page.locator('app-license-page')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('app-license-page')).not.toBeEmpty();
  });

  test('/license is rendered inside the standalone shell', async ({ page }) => {
    await page.goto('/license');
    await expect(page.locator('app-standalone-shell')).toBeVisible({ timeout: 10_000 });
  });

  test('/license has no docs sidebar', async ({ page }) => {
    await page.goto('/license');
    await expect(page.locator('app-sidebar-nav')).not.toBeVisible({ timeout: 10_000 });
  });
});

// ---------------------------------------------------------------------------
// 9. Wave 8 — Landing page at /
// ---------------------------------------------------------------------------

test.describe('Wave 8 — Landing page', () => {
  test('/ renders the landing page component', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('app-landing-page')).toBeVisible({ timeout: 15_000 });
  });

  test('landing page hero section is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.hero-section')).toBeVisible({ timeout: 10_000 });
  });

  test('landing page hero contains primary CTA linking to /docs/getting-started/installation', async ({
    page,
  }) => {
    await page.goto('/');
    const cta = page.locator('.hero-section a[href*="/docs/getting-started/installation"]');
    await expect(cta).toBeVisible({ timeout: 10_000 });
  });

  test('landing page demo section shows interactive buttons', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.demo-section')).toBeVisible({ timeout: 10_000 });
    const buttons = page.locator('.demo-section button');
    await expect(buttons).toHaveCount(4);
  });

  test('landing page features section renders feature cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.features-section')).toBeVisible({ timeout: 10_000 });
    const cards = page.locator('.features-section .grid > div');
    await expect(cards).toHaveCount(6);
  });

  test('landing page quickstart section renders code snippet', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.quickstart-section')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('.quickstart-section app-markdown')).toBeVisible({ timeout: 15_000 });
  });

  test('/ is rendered inside the standalone shell', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('app-standalone-shell')).toBeVisible({ timeout: 10_000 });
  });

  test('/ has no docs sidebar', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('app-sidebar-nav')).not.toBeVisible({ timeout: 10_000 });
  });
});
