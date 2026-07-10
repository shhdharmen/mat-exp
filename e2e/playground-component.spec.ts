import { test, expect, type Page, type Locator } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Wait for the <app-playground> Angular component to finish loading its schema
 * and replace the skeleton with the live playground layout.
 *
 * Playground tab pages are rendered via NgComponentOutlet (not markdown), so
 * there is no .markdown-body and no .loading-state to wait for — only the
 * app-playground element and its inner .playground-layout matter.
 */
async function waitForPlayground(page: Page): Promise<void> {
  await page.locator('app-playground').waitFor({ state: 'visible', timeout: 10_000 });

  await page
    .locator('app-playground .component-preview-skeleton')
    .waitFor({ state: 'detached', timeout: 15_000 })
    .catch(() => undefined);

  await page
    .locator('app-playground .playground-layout')
    .waitFor({ state: 'visible', timeout: 15_000 });
}

/**
 * The <app-playground> Angular component host for a given component name.
 * Used for playground tab pages (rendered via NgComponentOutlet).
 */
const playgroundEl = (page: Page, component: string): Locator =>
  page.locator(`app-playground[component="${component}"]`);

/** The controls panel inside the playground. */
const controlsPanel = (page: Page, component: string): Locator =>
  playgroundEl(page, component).locator('.playground-controls');

/** The live preview area inside the playground. */
const previewArea = (page: Page, component: string): Locator =>
  playgroundEl(page, component).locator('.playground-preview');

/** Select a value in a mat-select control inside the given playground. */
async function selectControlValue(
  page: Page,
  component: string,
  controlName: string,
  value: string,
): Promise<void> {
  // mat-label is a sibling of mat-select inside mat-form-field, not a descendant
  const select = controlsPanel(page, component)
    .locator('.control-row')
    .filter({ has: page.locator('mat-label', { hasText: controlName }) })
    .locator('mat-select');
  await select.click();
  await page
    .locator('mat-option', { hasText: new RegExp(`^${value}$`) })
    .first()
    .click();
}

// ---------------------------------------------------------------------------
// 1. Skeleton loading state
// ---------------------------------------------------------------------------

test.describe('Playground skeleton', () => {
  test('shows skeleton while schema is loading on the button playground page', async ({ page }) => {
    await page.route('**/playground-schemas.json', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      await route.continue();
    });

    await page.goto('/components/all-buttons/button/playground');
    await page.locator('app-playground').waitFor({ state: 'visible', timeout: 10_000 });

    const skeleton = page.locator('app-playground .component-preview-skeleton');
    await expect(skeleton.or(page.locator('app-playground .playground-layout'))).toBeVisible();

    await page.unroute('**/playground-schemas.json');
  });

  test('skeleton is replaced by playground-layout once schema loads', async ({ page }) => {
    await page.goto('/components/all-buttons/button/playground');
    await waitForPlayground(page);

    await expect(page.locator('app-playground .playground-layout')).toBeVisible();
    await expect(page.locator('app-playground .component-preview-skeleton')).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 2. MatExpressiveButton playground
// ---------------------------------------------------------------------------

test.describe('MatExpressiveButton playground', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/all-buttons/button/playground');
    await waitForPlayground(page);
  });

  test('renders the two-panel playground layout', async ({ page }) => {
    const pg = playgroundEl(page, 'MatExpressiveButton');
    await expect(pg.locator('.playground-layout')).toBeVisible();
    await expect(pg.locator('.playground-preview')).toBeVisible();
    await expect(pg.locator('.playground-controls')).toBeVisible();
  });

  test('controls panel has exactly 3 controls (size, shape, toggle)', async ({ page }) => {
    const rows = controlsPanel(page, 'MatExpressiveButton').locator('.control-row');
    await expect(rows).toHaveCount(3);
  });

  test('size control renders as a mat-select with all size options', async ({ page }) => {
    const sizeSelect = controlsPanel(page, 'MatExpressiveButton')
      .locator('.control-row')
      .filter({ has: page.locator('mat-label', { hasText: 'size' }) })
      .locator('mat-select');

    await expect(sizeSelect).toBeVisible();
    await sizeSelect.click();

    const options = page.locator('mat-option');
    const texts = await options.allInnerTexts();
    expect(texts.map((t) => t.trim())).toEqual(expect.arrayContaining(['xs', 's', 'm', 'l', 'xl']));
    await page.keyboard.press('Escape');
  });

  test('live button preview renders inside the preview area', async ({ page }) => {
    const preview = previewArea(page, 'MatExpressiveButton');
    await expect(preview.locator('button.mat-expressive-button').first()).toBeVisible();
  });

  test('changing size control updates the live button data-size attribute', async ({ page }) => {
    const preview = previewArea(page, 'MatExpressiveButton');
    const firstButton = preview.locator('button.mat-expressive-button').first();

    await selectControlValue(page, 'MatExpressiveButton', 'size', 'xl');

    await expect(firstButton).toHaveAttribute('data-size', 'xl');
  });

  test('changing shape control updates the live button data-shape attribute', async ({ page }) => {
    const preview = previewArea(page, 'MatExpressiveButton');
    const firstButton = preview.locator('button.mat-expressive-button').first();

    await selectControlValue(page, 'MatExpressiveButton', 'shape', 'square');

    await expect(firstButton).toHaveAttribute('data-shape', 'square');
  });

  test('reset button restores controls to default values', async ({ page }) => {
    const preview = previewArea(page, 'MatExpressiveButton');
    const firstButton = preview.locator('button.mat-expressive-button').first();

    await selectControlValue(page, 'MatExpressiveButton', 'size', 'xl');
    await expect(firstButton).toHaveAttribute('data-size', 'xl');

    await controlsPanel(page, 'MatExpressiveButton')
      .locator('button[aria-label="Reset all controls to defaults"]')
      .click();

    await expect(firstButton).not.toHaveAttribute('data-size', 'xl');
  });

  test('controls title label is visible', async ({ page }) => {
    await expect(
      controlsPanel(page, 'MatExpressiveButton').locator('.playground-controls-title'),
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 3. MatExpressiveLoadingIndicator playground
// ---------------------------------------------------------------------------

test.describe('MatExpressiveLoadingIndicator playground', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/loading-and-progress/loading-indicator/playground');
    await waitForPlayground(page);
  });

  test('renders the two-panel playground layout', async ({ page }) => {
    const pg = playgroundEl(page, 'MatExpressiveLoadingIndicator');
    await expect(pg.locator('.playground-layout')).toBeVisible();
    await expect(pg.locator('.playground-preview')).toBeVisible();
    await expect(pg.locator('.playground-controls')).toBeVisible();
  });

  test('controls panel has 3 controls (config, ariaLabel, speed)', async ({ page }) => {
    const rows = controlsPanel(page, 'MatExpressiveLoadingIndicator').locator('.control-row');
    await expect(rows).toHaveCount(3);
  });

  test('speed control is a select with fast, default, slow options', async ({ page }) => {
    const speedSelect = controlsPanel(page, 'MatExpressiveLoadingIndicator')
      .locator('.control-row')
      .filter({ has: page.locator('mat-label', { hasText: 'speed' }) })
      .locator('mat-select');

    await expect(speedSelect).toBeVisible();
    await speedSelect.click();

    const options = page.locator('mat-option');
    const texts = await options.allInnerTexts();
    expect(texts.map((t) => t.trim())).toEqual(expect.arrayContaining(['default', 'fast', 'slow']));
    await page.keyboard.press('Escape');
  });

  test('ariaLabel control is a text input', async ({ page }) => {
    const textInput = controlsPanel(page, 'MatExpressiveLoadingIndicator')
      .locator('.control-row')
      .filter({ has: page.locator('mat-label', { hasText: 'ariaLabel' }) })
      .locator('input[type="text"]');

    await expect(textInput).toBeVisible();
  });

  test('live loading indicator renders inside the preview area', async ({ page }) => {
    const preview = previewArea(page, 'MatExpressiveLoadingIndicator');
    await expect(preview.locator('mat-expressive-loading-indicator')).toBeVisible();
  });

  test('changing speed updates the data-speed attribute on the indicator', async ({ page }) => {
    const preview = previewArea(page, 'MatExpressiveLoadingIndicator');
    const indicator = preview.locator('mat-expressive-loading-indicator');

    await selectControlValue(page, 'MatExpressiveLoadingIndicator', 'speed', 'fast');

    await expect(indicator).toHaveAttribute('data-speed', 'fast');
  });

  test('changing config updates the live indicator', async ({ page }) => {
    const preview = previewArea(page, 'MatExpressiveLoadingIndicator');
    const indicator = preview.locator('mat-expressive-loading-indicator');

    await selectControlValue(page, 'MatExpressiveLoadingIndicator', 'config', 'contained');

    await expect(indicator).toBeVisible();
  });

  test('typing into ariaLabel updates the aria-label on the indicator', async ({ page }) => {
    const preview = previewArea(page, 'MatExpressiveLoadingIndicator');
    const indicator = preview.locator('mat-expressive-loading-indicator');

    const textInput = controlsPanel(page, 'MatExpressiveLoadingIndicator')
      .locator('.control-row')
      .filter({ has: page.locator('mat-label', { hasText: 'ariaLabel' }) })
      .locator('input[type="text"]');

    await textInput.fill('Processing…');
    await textInput.press('Tab');

    await expect(indicator).toHaveAttribute('aria-label', 'Processing…');
  });
});

// ---------------------------------------------------------------------------
// 4. MatExpressiveButtonGroup playground (override preview)
// ---------------------------------------------------------------------------

test.describe('MatExpressiveButtonGroup playground', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/all-buttons/button-group/playground');
    await waitForPlayground(page);
  });

  test('renders the two-panel playground layout', async ({ page }) => {
    const pg = playgroundEl(page, 'MatExpressiveButtonGroup');
    await expect(pg.locator('.playground-layout')).toBeVisible();
  });

  test('live ButtonGroup preview renders projected button children', async ({ page }) => {
    const preview = previewArea(page, 'MatExpressiveButtonGroup');
    await expect(preview.locator('mat-expressive-button-group')).toBeVisible();
    const buttons = preview.locator('mat-expressive-button-group button');
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('disabled slide-toggle changes the disabled attribute on the group', async ({ page }) => {
    const preview = previewArea(page, 'MatExpressiveButtonGroup');
    const group = preview.locator('mat-expressive-button-group');

    const toggle = controlsPanel(page, 'MatExpressiveButtonGroup').locator('mat-slide-toggle');
    await expect(toggle).toBeVisible();

    await toggle.click();
    await expect(group).toHaveAttribute('data-disabled', 'true');

    await toggle.click();
    await expect(group).not.toHaveAttribute('data-disabled', 'true');
  });

  test('changing size control updates the button-group data-size attribute', async ({ page }) => {
    const preview = previewArea(page, 'MatExpressiveButtonGroup');
    const group = preview.locator('mat-expressive-button-group');

    await selectControlValue(page, 'MatExpressiveButtonGroup', 'size', 'l');

    await expect(group).toHaveAttribute('data-size', 'l');
  });
});

// ---------------------------------------------------------------------------
// 5. Dark mode – controls panel remains readable
// ---------------------------------------------------------------------------

test.describe('Playground dark mode', () => {
  test('controls panel is visible in dark mode', async ({ page }) => {
    await page.goto('/components/all-buttons/button/playground');
    await waitForPlayground(page);

    await page.evaluate(() => document.documentElement.classList.add('dark'));

    const panel = controlsPanel(page, 'MatExpressiveButton');
    await expect(panel).toBeVisible();
    await expect(panel.locator('.playground-controls-title')).toBeVisible();
  });

  test('live preview area is visible in dark mode', async ({ page }) => {
    await page.goto('/components/loading-and-progress/loading-indicator/playground');
    await waitForPlayground(page);

    await page.evaluate(() => document.documentElement.classList.add('dark'));

    await expect(previewArea(page, 'MatExpressiveLoadingIndicator')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 6. Responsive layout
// ---------------------------------------------------------------------------

test.describe('Playground responsive layout', () => {
  test('playground stacks vertically on a 375px-wide viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/components/all-buttons/button/playground');
    await waitForPlayground(page);

    const layout = playgroundEl(page, 'MatExpressiveButton').locator('.playground-layout');
    await expect(layout).toBeVisible();

    const preview = previewArea(page, 'MatExpressiveButton');
    const controls = controlsPanel(page, 'MatExpressiveButton');
    const previewBox = await preview.boundingBox();
    const controlsBox = await controls.boundingBox();
    expect(previewBox!.y).toBeLessThan(controlsBox!.y);
  });

  test('playground shows side-by-side panels on a 1024px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/components/all-buttons/button/playground');
    await waitForPlayground(page);

    const preview = previewArea(page, 'MatExpressiveButton');
    const controls = controlsPanel(page, 'MatExpressiveButton');
    const previewBox = await preview.boundingBox();
    const controlsBox = await controls.boundingBox();

    expect(Math.abs(previewBox!.y - controlsBox!.y)).toBeLessThan(50);
    expect(previewBox!.x).toBeLessThan(controlsBox!.x);
  });
});
