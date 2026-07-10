import { test, expect, type Page } from '@playwright/test';

async function goToPricing(page: Page) {
  await page.goto('/pricing');
  await expect(page.locator('app-pricing-page')).toBeVisible({ timeout: 15_000 });
}

// ---------------------------------------------------------------------------
// 1. Route and page load
// ---------------------------------------------------------------------------

test.describe('Pricing page — route', () => {
  test('/pricing loads without 404', async ({ page }) => {
    const response = await page.goto('/pricing');
    expect(response?.status()).not.toBe(404);
    expect(page.url()).toContain('/pricing');
  });

  test('/pricing renders app-pricing-page component', async ({ page }) => {
    await goToPricing(page);
    await expect(page.locator('app-pricing-page')).toBeVisible();
  });

  test('/pricing does not show the not-found page', async ({ page }) => {
    await goToPricing(page);
    await expect(page.locator('.not-found')).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 2. Hero section
// ---------------------------------------------------------------------------

test.describe('Pricing page — hero section', () => {
  test('shows the main headline', async ({ page }) => {
    await goToPricing(page);
    await expect(page.locator('h1')).toContainText('Simple, transparent pricing');
  });

  test('shows the subheadline', async ({ page }) => {
    await goToPricing(page);
    await expect(page.locator('app-pricing-page')).toContainText(
      'Free for non-commercial use. One-time payment for commercial.',
    );
  });
});

// ---------------------------------------------------------------------------
// 3. Free / Non-Commercial card
// ---------------------------------------------------------------------------

test.describe('Pricing page — Non-Commercial card', () => {
  test('shows the "Non-Commercial" tier heading', async ({ page }) => {
    await goToPricing(page);
    await expect(page.locator('app-pricing-page')).toContainText('Non-Commercial');
  });

  test('shows "Free — forever" price', async ({ page }) => {
    await goToPricing(page);
    await expect(page.locator('app-pricing-page')).toContainText('Free — forever');
  });

  test('shows key feature bullets', async ({ page }) => {
    await goToPricing(page);
    const page_ = page.locator('app-pricing-page');
    await expect(page_).toContainText('Personal projects');
    await expect(page_).toContainText('Open-source');
    await expect(page_).toContainText('Students');
    await expect(page_).toContainText('Non-profit');
  });

  test('"Get Started" CTA links to /getting-started/installation', async ({ page }) => {
    await goToPricing(page);
    const cta = page.locator('a[aria-label="Get started with the non-commercial plan"]');
    await expect(cta).toBeVisible();
    const href = await cta.getAttribute('href');
    expect(href).toContain('/getting-started/installation');
  });

  test('"Get Started" CTA navigates to the installation page', async ({ page }) => {
    await goToPricing(page);
    await page.locator('a[aria-label="Get started with the non-commercial plan"]').click();
    await expect(page).toHaveURL(/\/getting-started\/installation/, { timeout: 10_000 });
  });
});

// ---------------------------------------------------------------------------
// 4. Commercial card
// ---------------------------------------------------------------------------

test.describe('Pricing page — Commercial card', () => {
  test('shows the "Commercial" tier heading', async ({ page }) => {
    await goToPricing(page);
    await expect(page.locator('app-pricing-page')).toContainText('Commercial');
  });

  test('shows the license price (not hardcoded — sourced from environment)', async ({ page }) => {
    await goToPricing(page);
    // Price is $49 per environment.licensePrice — confirm it renders a dollar amount
    await expect(page.locator('app-pricing-page')).toContainText('$49');
  });

  test('shows "one-time payment" label', async ({ page }) => {
    await goToPricing(page);
    await expect(page.locator('app-pricing-page')).toContainText('one-time payment');
  });

  test('shows lifetime/unlimited subtitle', async ({ page }) => {
    await goToPricing(page);
    await expect(page.locator('app-pricing-page')).toContainText('Lifetime license');
  });

  test('shows commercial feature bullets', async ({ page }) => {
    await goToPricing(page);
    const page_ = page.locator('app-pricing-page');
    await expect(page_).toContainText('For-profit products');
    await expect(page_).toContainText('Internal company tools');
    await expect(page_).toContainText('Client work');
  });

  test('"Buy License" CTA is an external link to the Polar.sh store', async ({ page }) => {
    await goToPricing(page);
    const cta = page.locator('a[aria-label*="Buy a commercial license"]');
    await expect(cta).toBeVisible();
    const href = await cta.getAttribute('href');
    expect(href).toContain('polar.sh');
  });

  test('"Buy License" CTA opens in a new tab', async ({ page }) => {
    await goToPricing(page);
    const cta = page.locator('a[aria-label*="Buy a commercial license"]');
    await expect(cta).toHaveAttribute('target', '_blank');
    await expect(cta).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

// ---------------------------------------------------------------------------
// 5. FAQ section
// ---------------------------------------------------------------------------

test.describe('Pricing page — FAQ section', () => {
  test('shows "Frequently Asked Questions" heading', async ({ page }) => {
    await goToPricing(page);
    await expect(page.locator('app-pricing-page')).toContainText('Frequently Asked Questions');
  });

  test('renders all five FAQ category headings', async ({ page }) => {
    await goToPricing(page);
    const page_ = page.locator('app-pricing-page');
    await expect(page_).toContainText('General');
    await expect(page_).toContainText('Licensing');
    await expect(page_).toContainText('Product');
    await expect(page_).toContainText('Support');
    await expect(page_).toContainText('Miscellaneous');
  });

  test('FAQ entries are collapsed by default (details/summary pattern)', async ({ page }) => {
    await goToPricing(page);
    const firstDetails = page.locator('app-pricing-page details').first();
    await expect(firstDetails).toBeVisible();
    // `open` attribute absent means collapsed
    const isOpen = await firstDetails.getAttribute('open');
    expect(isOpen).toBeNull();
  });

  test('clicking an FAQ summary expands the answer', async ({ page }) => {
    await goToPricing(page);
    const firstSummary = page.locator('app-pricing-page details summary').first();
    await firstSummary.click();
    const firstDetails = page.locator('app-pricing-page details').first();
    const isOpen = await firstDetails.getAttribute('open');
    expect(isOpen).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 6. Layout — two-card flex row on desktop
// ---------------------------------------------------------------------------

test.describe('Pricing page — layout', () => {
  test('pricing cards section is present', async ({ page }) => {
    await goToPricing(page);
    const cards = page.locator('section[aria-label="Pricing tiers"]');
    await expect(cards).toBeVisible();
  });

  test('two pricing cards are rendered', async ({ page }) => {
    await goToPricing(page);
    const cards = page.locator('section[aria-label="Pricing tiers"] > div');
    await expect(cards).toHaveCount(2);
  });
});

// ---------------------------------------------------------------------------
// 7. Sidebar "Pricing" link
// ---------------------------------------------------------------------------

test.describe('Sidebar — Pricing link', () => {
  test('sidebar shows a "Pricing" link', async ({ page }) => {
    await page.goto('/getting-started/installation');
    await page.locator('.markdown-body').waitFor({ state: 'visible', timeout: 15_000 });
    const link = page.locator('nav a', { hasText: 'Pricing' });
    await expect(link).toBeVisible({ timeout: 10_000 });
  });

  test('"Pricing" sidebar link points to /pricing', async ({ page }) => {
    await page.goto('/getting-started/installation');
    await page.locator('.markdown-body').waitFor({ state: 'visible', timeout: 15_000 });
    const link = page.locator('nav a', { hasText: 'Pricing' });
    const href = await link.getAttribute('href');
    expect(href).toContain('/pricing');
  });

  test('clicking "Pricing" sidebar link navigates to /pricing', async ({ page }) => {
    await page.goto('/getting-started/installation');
    await page.locator('.markdown-body').waitFor({ state: 'visible', timeout: 15_000 });
    await page.locator('nav a', { hasText: 'Pricing' }).click();
    await expect(page).toHaveURL(/\/pricing$/, { timeout: 10_000 });
  });
});

// ---------------------------------------------------------------------------
// 8. Header "Get Access" button (desktop viewport)
// ---------------------------------------------------------------------------

test.describe('Header — Get Access button', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('header shows a "Get Access" button on desktop', async ({ page }) => {
    await page.goto('/getting-started/installation');
    await page.locator('.markdown-body').waitFor({ state: 'visible', timeout: 15_000 });
    const btn = page.locator('header a, div a', { hasText: 'Get Access' }).first();
    await expect(btn).toBeVisible({ timeout: 10_000 });
  });

  test('"Get Access" button navigates to /pricing', async ({ page }) => {
    await page.goto('/getting-started/installation');
    await page.locator('.markdown-body').waitFor({ state: 'visible', timeout: 15_000 });
    const btn = page.locator('a[routerlink="/pricing"], a[href="/pricing"]', {
      hasText: 'Get Access',
    }).first();
    await expect(btn).toBeVisible({ timeout: 10_000 });
    await btn.click();
    await expect(page).toHaveURL(/\/pricing$/, { timeout: 10_000 });
  });
});

// ---------------------------------------------------------------------------
// 9. Licensing docs page (/getting-started/licensing)
// ---------------------------------------------------------------------------

test.describe('Licensing docs page', () => {
  test('/getting-started/licensing loads with markdown content', async ({ page }) => {
    await page.goto('/getting-started/licensing');
    await page.locator('.markdown-body').waitFor({ state: 'visible', timeout: 15_000 });
    await expect(page.locator('.markdown-body')).not.toBeEmpty();
  });

  test('licensing page shows free non-commercial content', async ({ page }) => {
    await page.goto('/getting-started/licensing');
    await page.locator('.markdown-body').waitFor({ state: 'visible', timeout: 15_000 });
    await expect(page.locator('.markdown-body')).toContainText('non-commercial');
  });

  test('licensing page shows commercial license requirement', async ({ page }) => {
    await page.goto('/getting-started/licensing');
    await page.locator('.markdown-body').waitFor({ state: 'visible', timeout: 15_000 });
    await expect(page.locator('.markdown-body')).toContainText('commercial');
  });

  test('licensing page does not show not-found page', async ({ page }) => {
    await page.goto('/getting-started/licensing');
    await page.locator('.markdown-body').waitFor({ state: 'visible', timeout: 15_000 });
    await expect(page.locator('.not-found')).not.toBeVisible();
  });
});
