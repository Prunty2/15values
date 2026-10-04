import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { axes, AXES_VERSION, QUESTION_BANK_VERSION, SCORING_VERSION, scoreAnswers, selectQuestions } from '../src/quiz/model';
import type { Answer, Answers, QuizResult } from '../src/quiz/model';
import { serializeHistory } from '../src/quiz/history';

const patterns: Answer[][] = [[2, 2, 2], [-1, -1, 0], [0, 0, 0], [1, 2, 0], [-2, -2, -2], [2, 1, 0], [2, 2, 1], [-2, 0, 1], [0, -1, -1], [2, 0, 1], [0, 2, 1], [-1, -2, 0], [1, 1, -1], [1, -2, 1], [-2, 1, 0]];
const answers = Object.fromEntries(selectQuestions('short').map(question => {
  const index = axes.findIndex(axis => axis.id === question.axisId);
  const directed = patterns[index][question.priority - 1];
  return [question.id, directed * (question.agreePole === 'left' ? 1 : -1)];
})) as Answers;
const result: QuizResult = {
  id: 'results-visual-check', completedAt: '2026-10-04T02:00:00.000Z', length: 'short',
  questionBankVersion: QUESTION_BANK_VERSION, scoringVersion: SCORING_VERSION, axesVersion: AXES_VERSION,
  scores: scoreAnswers('short', answers),
};

test('profile layout, all endpoints, help controls and complementary percentages work at every width', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('./#/results');
  await page.getByLabel('Import result history', { exact: true }).setInputFiles({ name: 'profile.json', mimeType: 'application/json', buffer: Buffer.from(serializeHistory([result])) });
  await page.getByRole('button', { name: 'View result', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your perspective profile.');
  await expect(page.getByRole('region', { name: 'Comparison placeholders' })).toBeVisible();
  await expect(page.locator('blockquote')).toHaveText('Your ideology’s perspective will appear here.');
  await expect(page.getByText('Your results · 15 independent axes', { exact: true })).toHaveCount(0);
  for (const [index, axis] of axes.entries()) {
    const row = page.getByRole('article', { name: axis.name, exact: true });
    const score = result.scores[index];
    await expect(row.getByRole('img')).toHaveAttribute('aria-label', `${axis.left}: ${score.leftPercent}%; ${axis.right}: ${score.rightPercent}%`);
    const displayed = await row.locator('[data-active] span').allTextContents();
    expect(displayed.map(Number.parseFloat).reduce((a, b) => a + b, 0)).toBe(100);
    const marker = await row.getByRole('img').locator('span').last().getAttribute('style');
    expect(marker).toContain(`left: ${score.rightPercent}%`);
  }
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const heading = await page.getByRole('heading', { level: 1 }).boundingBox();
    expect(Math.abs(heading!.x + heading!.width / 2 - width / 2)).toBeLessThan(2);
    if (width >= 1440) {
      const lines = await page.getByText(/^Analysis based on your responses to/).evaluate(element => {
        const range = document.createRange();
        range.selectNodeContents(element);
        return range.getClientRects().length;
      });
      expect(lines).toBe(1);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: testInfo.outputPath('profile-heading.png') });
    }
    const culture = page.getByRole('article', { name: 'Culture vs Nature', exact: true });
    await culture.getByText('?', { exact: true }).click();
    await expect(culture.getByText(axes[14].description, { exact: true })).toBeVisible();
    const popover = await culture.locator('details > div').boundingBox();
    expect(popover!.x).toBeGreaterThanOrEqual(0);
    expect(popover!.x + popover!.width).toBeLessThanOrEqual(width);
    await culture.getByText('?', { exact: true }).click();
    await page.screenshot({ path: testInfo.outputPath(`profile-${width}.png`), fullPage: true });
  }
  expect(errors).toEqual([]);
});

test('legacy results display and export their original method without recalculation', async ({ page }) => {
  const legacy = { ...result, scoringVersion: '1.0.0', scores: result.scores.map(score => ({ ...score, leftPercent: 66.7, rightPercent: 33.3 })) };
  await page.goto('./#/results');
  await page.getByLabel('Import result history', { exact: true }).setInputFiles({ name: 'legacy.json', mimeType: 'application/json', buffer: Buffer.from(serializeHistory([legacy])) });
  await expect(page.getByText('Original scoring', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'View result', exact: true }).click();
  await page.getByText('How these scores are calculated', { exact: false }).click();
  await expect(page.getByText(/This saved result uses the original scoring method/)).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export result', exact: true }).click();
  const file = JSON.parse(readFileSync((await (await download).path())!, 'utf8'));
  expect(file.results).toEqual([legacy]);
});

test('empty history and saved cards are responsive, and saved profiles reopen after reload', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('./#/results');
  await expect(page.getByRole('heading', { name: 'Your first perspective starts here.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Import JSON', exact: true })).toBeHidden();
  await expect(page.getByText('Your browser · Your history')).toHaveCount(0);
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 950 });
    await page.screenshot({ path: testInfo.outputPath(`empty-history-${width}.png`), fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  const older = { ...result, id: 'older-result', completedAt: '2026-10-03T01:00:00.000Z' };
  await page.getByText('Manage history', { exact: true }).click();
  await page.getByLabel('Import result history', { exact: true }).setInputFiles({ name: 'history.json', mimeType: 'application/json', buffer: Buffer.from(serializeHistory([older, result])) });
  await expect(page.getByRole('button', { name: 'View result', exact: true })).toHaveCount(2);
  await expect(page.getByRole('img', { name: /^15-axis preview/ })).toHaveCount(2);
  await page.getByText('Manage history', { exact: true }).click();
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 950 });
    await page.screenshot({ path: testInfo.outputPath(`saved-cards-${width}.png`), fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.getByRole('button', { name: 'View result', exact: true }).first().click();
  await expect(page).toHaveURL(/id=results-visual-check/);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Your perspective profile.' })).toBeVisible();
  await page.getByRole('button', { name: 'All saved results', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Saved results.', exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Your perspective profile.' })).toBeVisible();
  await page.goForward();
  await page.getByRole('button', { name: /^Delete short result/ }).first().click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'View result', exact: true })).toHaveCount(1);
  await page.goto('./#/results?id=results-visual-check');
  await expect(page.getByRole('alert')).toHaveText('This result is no longer saved in this browser.');
  expect(errors).toEqual([]);
});
