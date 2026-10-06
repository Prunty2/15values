import { test, expect } from '@playwright/test';

test('quiz navigation never replaces the page with a loading screen', async ({ page }) => {
  await page.route(/\/(?:src\/quiz\/QuizFlow\.tsx|assets\/QuizFlow-[^/]+\.js)(?:\?|$)/, async route => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    await route.continue();
  });
  await page.addInitScript(() => {
    const seen: string[] = [];
    Object.assign(window, { navigationScreens: seen });
    new MutationObserver(() => {
      if (document.body?.textContent?.includes('Loading your quiz…')) seen.push('loading');
    }).observe(document, { childList: true, subtree: true });
  });
  await page.goto('./');
  await page.locator('main').getByRole('link', { name: 'Explore the quiz', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Start short quiz', exact: true })).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { navigationScreens: string[] }).navigationScreens)).toEqual([]);
  await page.getByRole('link', { name: 'Back to home', exact: true }).click();
  await page.getByRole('contentinfo').getByRole('link', { name: 'Quiz formats', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Start short quiz', exact: true })).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { navigationScreens: string[] }).navigationScreens)).toEqual([]);
});

for (const [length, count] of [['short', 45], ['medium', 75], ['long', 135], ['comprehensive', 240]] as const) {
  test(`${length}: a direct quiz link and reload open a working first question`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`./#/quiz/run?length=${length}`);
    await expect(page.getByRole('radio')).toHaveCount(5);
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuemax', String(count + 1));
    await expect(page.getByRole('checkbox', { name: 'Advance on answer' })).toBeChecked();
    await page.getByRole('checkbox', { name: 'Advance on answer' }).uncheck();
    await page.getByRole('radio', { name: 'Agree', exact: true }).check();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Back', exact: true })).toBeEnabled();
    page.once('dialog', dialog => dialog.accept());
    await page.reload();
    await expect(page.getByRole('radio')).toHaveCount(5);
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    await expect(page.getByRole('button', { name: 'Back', exact: true })).toBeDisabled();
    expect(errors).toEqual([]);
  });
}

test('returning from the home page to an old quiz link starts normally', async ({ page }) => {
  await page.goto('./#/quiz');
  await page.getByRole('button', { name: 'Start short quiz', exact: true }).click();
  await page.getByRole('radio', { name: 'Neutral', exact: true }).check();
  await page.getByRole('link', { name: '15 Values home', exact: true }).click();
  await page.getByRole('button', { name: 'Leave quiz', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Your Politics');
  await page.goBack();
  await expect(page.getByRole('radio')).toHaveCount(5);
  await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
});

test('invalid quiz links show the usable format selector', async ({ page }) => {
  for (const suffix of ['', '?length=unknown']) {
    await page.goto(`./#/quiz/run${suffix}`);
    await expect(page.getByRole('button', { name: 'Start short quiz', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Start short quiz', exact: true }).click();
    await expect(page.getByRole('radio')).toHaveCount(5);
  }
});
