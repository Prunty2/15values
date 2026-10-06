import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { axes, scoreAnswers, selectQuestions } from '../src/quiz/model';
import { serializeHistory } from '../src/quiz/history';
import type { Answers, QuizResult } from '../src/quiz/model';



test('bank 3 results preserve scores through import, reload and export without new-bank matches', async ({ page }) => {
  const scores = scoreAnswers('short', Object.fromEntries(selectQuestions('short').map(q => [q.id, 0])) as Answers);
  scores.find(s => s.axisId === 'authority-liberty')!.leftPercent = 37.5;
  scores.find(s => s.axisId === 'authority-liberty')!.rightPercent = 62.5;
  const previous: QuizResult = { id: 'before-authority-change', completedAt: '2026-10-05T10:00:00.000Z', length: 'short', questionBankVersion: '3.0.0', axesVersion: '2.0.0', scoringVersion: '2.0.0', scores };
  await page.goto('./#/results');
  await page.getByLabel('Import result history', { exact: true }).setInputFiles({ name: 'previous-bank.json', mimeType: 'application/json', buffer: Buffer.from(serializeHistory([previous])) });
  await page.getByRole('button', { name: 'View result', exact: true }).click();
  await expect(page).toHaveURL(/#\/results\?id=/);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Your perspective profile.' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Result comparisons' }).first().getByRole('link').first()).toBeVisible();
  await expect(page.getByRole('article', { name: axes.find(a => a.id === 'authority-liberty')!.name, exact: true })).toBeVisible();
  const waiting = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export history', exact: true }).click();
  expect(JSON.parse(readFileSync((await (await waiting).path())!, 'utf8')).results).toEqual([previous]);
});

test('review artifact exposes all 209 assessments and the actual six old and new statements', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('./profiles/authority-liberty-policy-review.html');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Review the revised Authority–Liberty answers');
  await expect(page.locator('#subject option')).toHaveCount(209);
  for (const subject of ['personality/ronald-reagan', 'country/united-kingdom', 'ideology/libertarianism']) {
    await page.locator('#subject').selectOption(subject);
    await expect(page.locator('#answers article')).toHaveCount(6);
    await expect(page.locator('#status')).toContainText('240/240');
    await expect(page.locator('#answers')).not.toContainText('undefined');
    await expect(page.locator('#answers article').first()).toContainText('Previous wording: Police should need a court warrant');
    await page.locator('#answers article').nth(1).locator('summary').click();
    await expect(page.locator('#answers article').nth(1)).toContainText('Educated assumption:');
    await expect(page.locator('#answers article').nth(1).getByRole('link').first()).toHaveAttribute('href', /^https?:/);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

