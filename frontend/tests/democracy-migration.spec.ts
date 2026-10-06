import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import legacyAxes from '../src/data/axes.v1.json' with { type: 'json' };
import { QUESTION_BANK_VERSION, axes, scoreAnswers, selectQuestions } from '../src/quiz/model';
import { serializeHistory } from '../src/quiz/history';
import type { Answers, QuizResult } from '../src/quiz/model';
import type { Audit, Profile } from '../src/profiles/types';

const catalogue = JSON.parse(readFileSync(new URL('../public/profiles/catalogue.v1.json', import.meta.url), 'utf8')).profiles as Profile[];

test('the original bank survives import, reload and export without being matched to the new bank', async ({ page }) => {
  const scores = scoreAnswers('short', Object.fromEntries(selectQuestions('short').map(q => [q.id, 0])) as Answers);
  scores[0] = { ...scores[0], leftPercent: 66.7, rightPercent: 33.3, neutral: 0 };
  const legacy: QuizResult = { id: 'pre-democracy-revision', completedAt: '2026-10-05T10:00:00.000Z', length: 'short', questionBankVersion: '1.0.0', axesVersion: '1.0.0', scoringVersion: '2.0.0', scores };
  await page.goto('./#/results');
  await page.getByLabel('Import result history', { exact: true }).setInputFiles({ name: 'original-bank.json', mimeType: 'application/json', buffer: Buffer.from(serializeHistory([legacy])) });
  await page.getByRole('button', { name: 'View result', exact: true }).click();
  await expect(page).toHaveURL(/#\/results\?id=/);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Your perspective profile.' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Result comparisons' }).first().getByRole('link').first()).toBeVisible();
  const row = page.getByRole('article', { name: axes[0].name, exact: true });
  await row.getByLabel(`About ${axes[0].name}`).click();
  await expect(row.getByText(legacyAxes.axes[0].description.trim(), { exact: true })).toBeVisible();
  const waiting = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export history', exact: true }).click();
  expect(JSON.parse(readFileSync((await (await waiting).path())!, 'utf8')).results).toEqual([legacy]);
});

test('real revised profiles render and download their complete new immutable assessments', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  for (const [kind, route, id] of [['ideology', 'ideologies', 'liberalism'], ['personality', 'personalities', 'angela-merkel'], ['country', 'countries', 'australia']] as const) {
    const profile = catalogue.find(p => p.catalogue === kind && p.id === id)!;
    await page.goto(`./#/${route}/${id}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(profile.metadata.name);
    await expect(page.locator('main article')).toHaveCount(15);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('summary').filter({ hasText: 'Sources and assessment' }).click();
    const waiting = page.waitForEvent('download');
    await page.getByRole('link', { name: 'Download the full assessment' }).click();
    const audit = JSON.parse(readFileSync((await (await waiting).path())!, 'utf8')) as Audit;
    expect(audit.revision).toBe(profile.revision);
    expect(audit.questionBankVersion).toBe(QUESTION_BANK_VERSION);
    expect(audit.axesVersion).toBe('2.0.0');
    const answers = audit.axes.flatMap(a => a.answers);
    expect(answers).toHaveLength(240);
    expect(answers.every(a => typeof a.value === 'number')).toBe(true);
    for (const n of [2, 4, 6, 8, 11, 13]) {
      const answer = answers.find(a => a.questionId === `democracy-autocracy-${String(n).padStart(2, '0')}`)!;
      expect(answer.basis).toBe('inferred');
      expect(answer.rationale).toMatch(/^Educated assumption:/);
    }
  }
  expect(errors).toEqual([]);
});

test('focused answer review shows the six changed questions and their sourced reasoning', async ({ page }) => {
  await page.goto('./profiles/democracy-review.html');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Review the revised Democracy–Autocracy answers');
  await expect(page.locator('#subject option')).toHaveCount(catalogue.length);
  await page.locator('#subject').selectOption('country/australia');
  await expect(page.locator('#answers article')).toHaveCount(6);
  await expect(page.locator('#status')).toContainText('240/240');
  await page.locator('#answers article').first().locator('summary').click();
  await expect(page.locator('#answers article').first()).toContainText('Educated assumption:');
  await expect(page.locator('#answers article').first().getByRole('link').first()).toHaveAttribute('href', /^https?:/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
