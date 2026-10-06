import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

test('Values navigation opens the home axes section from another page and on repeated clicks', async ({ page }, testInfo) => {
  await page.goto('./#/credits');
  const clickValues = async () => {
    if (testInfo.project.name === 'mobile') await page.getByRole('button', { name: 'Open navigation' }).click();
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Values', exact: true }).click();
  };
  await clickValues();
  await expect(page).toHaveURL(/#\/\?section=values$/);
  await expect(page.locator('#values article')).toHaveCount(15);
  await expect(page.locator('#landing-axes-title')).toBeInViewport();
  await page.evaluate(() => window.scrollTo(0, 0));
  await clickValues();
  await expect(page.locator('#landing-axes-title')).toBeInViewport();
  await page.reload();
  await expect(page.locator('#landing-axes-title')).toBeInViewport();
});

test('catalogue pages are intentionally empty and link to the values', async ({ page }, testInfo) => {
  await page.route('**/profiles/catalogue.v1.json', route => route.fulfill({ json: { schemaVersion: 1, profiles: [] } }));
  for (const name of ['ideologies', 'personalities', 'countries']) {
    await page.goto(`./#/${name}`);
    await expect(page.getByRole('heading', { name: `No ${name} added yet.` })).toBeVisible();
    await expect(page.locator('article')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Explore the 15 values' })).toHaveAttribute('href', '#/?section=values');
    await expect(page).toHaveTitle(new RegExp(`${name}`, 'i'));
  }
});

test('navigation supports back, reload, current page, and keyboard focus', async ({ page }, testInfo) => {
  await page.goto('./');
  if (testInfo.project.name === 'desktop') {
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    const bounds = await nav.boundingBox();
    expect(Math.abs(bounds!.x + bounds!.width / 2 - (await page.evaluate(() => document.documentElement.clientWidth)) / 2)).toBeLessThan(1);
    await expect(nav).toHaveCSS('font-size', '17px');
  }
  if (testInfo.project.name === 'mobile') await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Values', exact: true }).click();
  await expect(page.locator('main')).toBeFocused();
  if (testInfo.project.name === 'mobile') await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Values', exact: true })).toHaveAttribute('href', '#/?section=values');
  await page.reload();
  await expect(page.locator('#values article')).toHaveCount(15);
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Your Politics');
  if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused();
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeHidden();
  }
});

test('pages do not overflow at narrow widths or with reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const route of ['', 'values', 'quiz', 'ideologies', 'personalities', 'countries', 'about', 'credits', 'feedback']) {
    await page.goto(`./#/${route}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
});

test('removed and unrecognised routes offer a working return to home', async ({ page }) => {
  for (const route of ['missing', 'how-it-works']) {
    await page.goto(`./#/${route}`);
    await expect(page.getByRole('heading', { name: 'That page isn’t here.' })).toBeVisible();
  }
  await page.locator('main').getByRole('link', { name: 'Back to home' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Your Politics');
  await expect(page.getByRole('link', { name: 'How it works', exact: true })).toHaveCount(0);
});

test('skip link appears on keyboard focus and moves focus to the content', async ({ page, browserName }) => {
  await page.goto('./');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toHaveCSS('opacity', '0');
  // WebKit on macOS uses Option-Tab to include links in keyboard navigation.
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
  await expect(skip).toBeFocused();
  await expect(skip).toHaveCSS('opacity', '1');
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await expect(skip).toHaveCSS('opacity', '0');
  await expect(page).not.toHaveURL(/#main-content/);
});


test('all four home format cards start their corresponding quiz', async ({ page }) => {
  for (const name of ['short', 'medium', 'long', 'comprehensive']) {
    await page.goto('./');
    await page.getByRole('link', { name: `Choose ${name} quiz`, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`length=${name}$`));
    await expect(page.getByRole('radio')).toHaveCount(5);
    await expect(page.getByRole('checkbox', { name: 'Advance on answer' })).toBeChecked();
  }
});

test('mobile primary action precedes the example and is visible without scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('./');
  await page.evaluate(() => document.fonts.ready);
  const action = page.locator('main').getByRole('link', { name: 'Explore the quiz', exact: true });
  const button = await action.boundingBox();
  const example = await page.getByRole('region', { name: 'Example comparison', exact: true }).boundingBox();
  expect(button!.y + button!.height).toBeLessThan(740);
  expect(button!.y + button!.height).toBeLessThan(example!.y);
});

test('landing axis cards cover all 15 agreed axes and replace the old sections', async ({ page }) => {
  await page.goto('./');
  const axes = page.getByRole('region', { name: 'What does each axis mean?' });
  await expect(axes.locator('article')).toHaveCount(15);
  await expect(axes.locator('[data-value-icon]')).toHaveCount(30);
  const data = JSON.parse(readFileSync(new URL('../src/data/axes.v2.json', import.meta.url), 'utf8'));
  for (const axis of data.axes) {
    await expect(axes.getByLabel(axis.name, { exact: true })).toBeVisible();
    await expect(axes.getByText(axis.description.trim(), { exact: true })).toBeVisible();
    await expect(axes.locator(`[data-value-icon="${axis.left}"]`)).toHaveCount(1);
    await expect(axes.locator(`[data-value-icon="${axis.right}"]`)).toHaveCount(1);
  }
  await expect(page.getByRole('heading', { name: 'Different questions. Different dimensions.' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'From your answers to your axes.' })).toHaveCount(0);
  await page.getByRole('link', { name: 'Image credits', exact: true }).click();
  await expect(page.getByRole('link', { name: 'CC BY 2.0 licence' })).toHaveAttribute('href', 'https://creativecommons.org/licenses/by/2.0/');
});



test('social preview assets resolve under the GitHub Pages subpath', async ({ page, request }) => {
  await page.goto('./');
  const image = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(image).not.toContain('__');
  const response = await request.get(new URL(image!, page.url()).href);
  expect(response.ok()).toBe(true);
  expect(response.headers()['content-type']).toContain('image/png');
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
});


test('landing section navigation moves focus and returns to the top on the same route', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./#/');
  await page.getByRole('button', { name: 'Find your format' }).click();
  await expect(page.getByRole('heading', { name: 'Choose your depth.' })).toBeFocused();
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await page.getByRole('contentinfo').getByRole('link', { name: 'Back to home' }).click();
  await expect(page.locator('main')).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});
