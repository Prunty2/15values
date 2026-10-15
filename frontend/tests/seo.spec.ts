import { test, expect } from '@playwright/test';

test('public pages contain crawlable HTML and distinct canonical metadata', async ({ page, request }) => {
  for (const path of ['', 'quiz/', 'ideologies/', 'personalities/', 'countries/', 'ideologies/alt-lite/']) {
    const response = await request.get('./' + path);
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain('<h1');
    expect(html).not.toContain('href="#/');
    expect(html).toContain('rel="canonical"');
    expect(html).toContain('application/ld+json');
    await page.goto('./' + path);
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow, max-image-preview:large');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://prunty2.github.io/15values/' + path);
  }
  const sitemap = await (await request.get('./sitemap.xml')).text();
  expect(sitemap).toContain('https://prunty2.github.io/15values/ideologies/alt-lite/');
  expect(sitemap).not.toContain('/results');
  expect(sitemap).not.toContain('#/');
});

test('clean routes support quiz navigation, history and legacy links', async ({ page }) => {
  await page.goto('./');
  await expect(page).toHaveTitle('15 Values — Free Political Quiz & Ideology Test');
  await page.getByRole('link', { name: 'Explore the quiz' }).first().click();
  await expect(page).toHaveURL(/\/quiz\/$/);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'What is my political ideology?' })).toBeVisible();
  await page.goto('./#/results');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
});
