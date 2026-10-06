import { selectionQuestions } from '../src/quiz/selection';
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { QUESTION_BANK_VERSION, axes, scoreAnswers, selectQuestions, answerOptions, formats } from '../src/quiz/model';
import { serializeHistory } from '../src/quiz/history';
import type { Answers, QuizResult } from '../src/quiz/model';
import type { Profile } from '../src/profiles/types';

const catalogue = JSON.parse(readFileSync(new URL('../public/profiles/catalogue.v1.json', import.meta.url), 'utf8')).profiles as Profile[];

test('bank 2 results preserve scores through import, reload and export without new-bank matches', async ({ page }) => {
  const scores = scoreAnswers('short', Object.fromEntries(selectQuestions('short').map(q => [q.id, 0])) as Answers);
  scores.find(s => s.axisId === 'authority-liberty')!.leftPercent = 37.5;
  scores.find(s => s.axisId === 'authority-liberty')!.rightPercent = 62.5;
  const previous: QuizResult = { id: 'before-authority-change', completedAt: '2026-10-05T10:00:00.000Z', length: 'short', questionBankVersion: '2.0.0', axesVersion: '2.0.0', scoringVersion: '2.0.0', scores };
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

test('review artifact exposes all 209 assessments and the actual nine old and new statements', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('./profiles/authority-liberty-review.html');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Review the revised Authority–Liberty answers');
  await expect(page.locator('#subject option')).toHaveCount(209);
  for (const subject of ['personality/ronald-reagan', 'country/united-kingdom', 'ideology/libertarianism']) {
    await page.locator('#subject').selectOption(subject);
    await expect(page.locator('#answers article')).toHaveCount(9);
    await expect(page.locator('#status')).toContainText('240/240');
    await expect(page.locator('#answers')).not.toContainText('undefined');
    await expect(page.locator('#answers article').first()).toContainText('Previous wording: Adults should be allowed');
    await page.locator('#answers article').nth(1).locator('summary').click();
    await expect(page.locator('#answers article').nth(1)).toContainText('Educated assumption:');
    await expect(page.locator('#answers article').nth(1).getByRole('link').first()).toHaveAttribute('href', /^https?:/);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('every published profile serves its matching complete current-bank assessment', async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Static assessment downloads checked once; interactive coverage runs on all three browsers.');
  for (const profile of catalogue) {
    const response = await request.get('./' + profile.auditPath);
    expect(response.ok(), profile.catalogue + '/' + profile.id).toBe(true);
    const audit = await response.json();
    expect(audit.questionBankVersion).toBe(QUESTION_BANK_VERSION);
    expect(audit.revision).toBe(profile.revision);
    const answers = audit.axes.flatMap((a: { answers: { value: number }[] }) => a.answers);
    expect(answers).toHaveLength(240);
    expect(answers.every((a: { value: number }) => [-2, -1, 0, 1, 2].includes(a.value))).toBe(true);
  }
});

for (const format of formats) {
  test(`${format.name}: current bank completes and exports the independently calculated scores`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`./#/quiz/run?length=${format.id}`);
    await page.getByRole('checkbox', { name: 'Advance on answer' }).uncheck();
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuemax', String(format.questions + 5));
    const answers: Answers = {};
    for (const [index, question] of selectQuestions(format.id).entries()) {
      await expect(page.locator('#question-title')).toHaveText(question.text);
      const option = answerOptions[index % answerOptions.length];
      answers[question.id] = option.value;
      await page.getByRole('radio', { name: option.label, exact: true }).check();
      await page.getByRole('button', { name: 'Next', exact: true }).click();
    }
    for (const question of selectionQuestions) {
    await expect(page.locator('#question-title')).toHaveText(question.text);
    await page.getByRole('radio', { name: 'Agree', exact: true }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
  }
  await expect(page.locator('#question-title')).toHaveText('What religion do you identify with?');
    await page.getByRole('radio', { name: 'No religion', exact: true }).check();
    await page.getByRole('button', { name: 'See my results', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Your perspective profile.' })).toBeVisible();
    await expect(page.locator('main article')).toHaveCount(15);
    const waiting = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export history', exact: true }).click();
    const exported = JSON.parse(readFileSync((await (await waiting).path())!, 'utf8')).results;
    expect(exported).toHaveLength(1);
    expect(exported[0].questionBankVersion).toBe(QUESTION_BANK_VERSION);
    expect(exported[0].religiousIdentity).toBe('none');
    expect(exported[0].scores).toEqual(scoreAnswers(format.id, answers));
    expect(exported[0]).not.toHaveProperty('answers');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
