import { test, expect } from '@playwright/test';

test('refresh draws another assessed personality with a calculated ideology match', async ({ page }) => {
  await page.addInitScript(() => {
    const previous = sessionStorage.getItem('example-test');
    sessionStorage.setItem('example-test', 'visited');
    Math.random = () => previous ? 0.99 : 0;
  });
  await page.goto('./');
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.fonts.check('700 16px "Clarity City"'))).toBe(true);
  const example = page.getByRole('region', { name: 'Example comparison' });
  const person = example.locator('a[href^="#/personalities/"]');
  await expect(person).toBeVisible();
  const first = await person.getAttribute('href');
  await expect(example.getByRole('img', { name: /% similarity across 15 axes/ })).toBeVisible();
  await expect(example.locator('a[href^="#/ideologies/"]')).toBeVisible();
  await page.reload();
  await expect(person).toBeVisible();
  await expect(person).not.toHaveAttribute('href', first!);
  await expect(example.getByText('Switzerland', { exact: true })).toHaveCount(0);
});
