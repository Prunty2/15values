import { test, expect } from '@playwright/test';
import { selectQuestions } from '../src/quiz/model';

test('current-page links do not add history and Back/Forward restores each route without reloads', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => Object.assign(window, { navigationDocument: 'original' }));
  const initialLength = await page.evaluate(() => history.length);
  await page.getByRole('banner').getByRole('link', { name: '15 Values home', exact: true }).click();
  expect(await page.evaluate(() => history.length)).toBe(initialLength);
  await page.getByRole('contentinfo').getByRole('link', { name: 'Image credits', exact: true }).click();
  await page.getByRole('contentinfo').getByRole('link', { name: 'Quiz formats', exact: true }).click();
  await page.getByRole('button', { name: 'Start short quiz', exact: true }).click();
  await page.goBack();
  await expect(page.getByRole('button', { name: 'Start short quiz', exact: true })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/#\/credits$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Your Politics');
  await page.goForward();
  await expect(page).toHaveURL(/#\/credits$/);
  expect(await page.evaluate(() => (window as unknown as { navigationDocument: string }).navigationDocument)).toBe('original');
});

test('default auto advance completes a quiz and leaves the final submission explicit', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('./');
  await page.getByRole('link', { name: 'Choose short quiz', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: 'Advance on answer' })).toBeChecked();
  for (const question of selectQuestions('short')) {
    await expect(page.locator('#question-title')).toHaveText(question.text);
    await page.getByRole('radio', { name: 'Agree', exact: true }).click();
  }
  await expect(page.getByRole('button', { name: 'See my results', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'See my results', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Your perspective profile.' })).toBeVisible();
});

test('all question wordings fit laptop, phone and landscape windows without scrolling or clipping', async ({ page }) => {
  await page.goto('./#/quiz/run?length=comprehensive');
  await page.evaluate(() => document.fonts.ready);
  const fonts = await page.evaluate(() => [...document.fonts].map(font => ({ family: font.family, status: font.status })));
  expect(fonts).toEqual(expect.arrayContaining([expect.objectContaining({ family: 'Clarity City', status: 'loaded' }), expect.objectContaining({ family: 'Bitcount Ink', status: 'loaded' })]));
  for (const size of [{ width: 1200, height: 630 }, { width: 1366, height: 650 }, { width: 1920, height: 1080 }, { width: 320, height: 640 }, { width: 390, height: 700 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(size);
    // Exercise every source wording in the actual question layout, without altering answers.
    const overflow = await page.evaluate(texts => {
      const title = document.querySelector<HTMLElement>('#question-title')!;
      return texts.filter(text => {
        title.textContent = text;
        const titleBox = title.getBoundingClientRect();
        const answers = document.querySelector('fieldset')!.getBoundingClientRect();
        return document.documentElement.scrollHeight > innerHeight || document.documentElement.scrollWidth > innerWidth || (titleBox.bottom > answers.top && titleBox.right > answers.left);
      });
    }, selectQuestions('comprehensive').map(question => question.text));
    expect(overflow, `${size.width} × ${size.height}`).toEqual([]);
  }
});
