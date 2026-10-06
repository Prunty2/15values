import { test, expect } from '@playwright/test';
import { axes } from '../src/quiz/model';
import { HISTORY_KEY } from '../src/quiz/history';

for (const bank of ['1.0.0', '2.0.0', '3.0.0', '4.0.0']) {
  test(`saved Centrism bank ${bank} explains the absence of close personality and country matches`, async ({ page }) => {
    const result = { id: 'centrist-test', completedAt: '2026-10-05T14:22:00.000Z', length: 'short',
      questionBankVersion: bank, axesVersion: bank === '1.0.0' ? '1.0.0' : '2.0.0', scoringVersion: '2.0.0',
      scores: axes.map(axis => ({ axisId: axis.id, leftPercent: 50, rightPercent: 50, answered: 3, neutral: 3 })) };
    const saved = JSON.stringify({ schemaVersion: 1, results: [result] });
    await page.addInitScript(({ key, saved }) => localStorage.setItem(key, saved), { key: HISTORY_KEY, saved });
    await page.goto('./#/results');
    await expect(page.getByRole('heading', { name: 'Centrism', exact: true })).toBeVisible();
    for (const kind of ['personality', 'country']) {
      const comparison = page.getByLabel('Most compatible ' + kind, { exact: true });
      await expect(comparison.getByRole('heading').first()).toHaveText('No close match');
      await expect(comparison).toContainText('within 15 percentage points');
      await expect(comparison.getByRole('link')).toHaveCount(0);
    }
    await page.getByRole('button', { name: 'View result', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Your perspective profile.' })).toBeVisible();
    for (const kind of ['personality', 'country']) await expect(page.getByLabel('Most compatible ' + kind, { exact: true }).first().getByRole('heading').first()).toHaveText('No close match');
    expect(await page.evaluate(key => localStorage.getItem(key), HISTORY_KEY)).toBe(saved);
  });
}

test('an original-scoring result does not prevent comparisons for other saved results', async ({ page }) => {
  const result = { id: 'current-midpoint', completedAt: '2026-10-06T10:00:00.000Z', length: 'short',
    questionBankVersion: '4.0.0', axesVersion: '2.0.0', scoringVersion: '2.0.0',
    scores: axes.map(axis => ({ axisId: axis.id, leftPercent: 50, rightPercent: 50, answered: 3, neutral: 3 })) };
  const original = { ...result, id: 'original-scoring', questionBankVersion: '1.0.0', axesVersion: '1.0.0', scoringVersion: '1.0.0',
    scores: result.scores.map(score => ({ ...score, leftPercent: 60, rightPercent: 40, neutral: 0 })) };
  await page.addInitScript(({ key, results }) => localStorage.setItem(key, JSON.stringify({ schemaVersion: 1, results })), { key: HISTORY_KEY, results: [result, original] });
  await page.goto('./#/results');
  const card = page.getByRole('listitem').filter({ has: page.getByRole('heading', { name: 'Centrism', exact: true }) });
  for (const kind of ['personality', 'country']) await expect(card.getByLabel('Most compatible ' + kind, { exact: true }).getByRole('heading').first()).toHaveText('No close match');
  await expect(page.getByText('Original scoring', { exact: true })).toBeVisible();
});
