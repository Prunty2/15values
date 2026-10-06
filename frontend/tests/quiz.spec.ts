import { selectionQuestions } from '../src/quiz/selection';
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { answerOptions, formats, getFormat, scoreAnswers, selectQuestions } from '../src/quiz/model';
import type { Answers, QuizLength } from '../src/quiz/model';
import { HISTORY_KEY } from '../src/quiz/history';

async function start(page: Page, length: QuizLength = 'short') {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`./#/quiz?length=${length}`);
  await page.getByRole('button', { name: `Start ${length} quiz`, exact: true }).click();
  await expect(page.locator('#question-title')).toBeVisible();
  await page.getByRole('checkbox', { name: 'Advance on answer' }).uncheck();
}
async function finish(page: Page, length: QuizLength = 'short', varying = false, keyboard = false) {
  await page.getByRole('checkbox', { name: 'Advance on answer' }).uncheck();
  const answers: Answers = {};
  for (const [index, question] of selectQuestions(length).entries()) {
    const option = varying ? answerOptions[index % 5] : answerOptions[2];
    await expect(page.locator('#question-title')).toHaveText(question.text);
    if (index === getFormat(length).questions - 1) await expect(page.getByText('100% complete', { exact: true })).toHaveCount(0);
    const radio = page.getByRole('radio', { name: option.label, exact: true });
    if (keyboard) {
      await radio.focus();
      await radio.press('Space');
      await expect(radio).toBeChecked();
    } else await radio.check();
    if (index === getFormat(length).questions - 1) await expect(page.getByText('100% complete', { exact: true })).toHaveCount(0);
    answers[question.id] = option.value;
    const next = page.getByRole('button', { name: 'Next', exact: true });
    if (keyboard) await next.press('Enter');
    else await next.click();
  }
  for (const question of selectionQuestions) {
    await expect(page.getByText('Ideology Matching', { exact: true })).toBeVisible();
    await expect(page.locator('#question-title')).toHaveText(question.text);
    await page.getByRole('radio', { name: 'Agree', exact: true }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
  }
  await expect(page.locator('#question-title')).toHaveText('What religion do you identify with?');
  await expect(page.getByText('Ideology Matching', { exact: true })).toBeVisible();
  await expect(page.getByText('Ideology Matching · 5 of 5', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'See my results', exact: true })).toBeDisabled();
  await page.getByRole('radio', { name: 'No religion', exact: true }).check();
  await page.getByRole('button', { name: 'See my results', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Your perspective profile.' })).toBeVisible();
  return answers;
}
// Verify the required final identity step in every quiz length.
for (const format of formats) {
  test(`${format.name}: complete every question and export the expected independent scores`, async ({ page }) => {
    test.setTimeout(120_000);
    // Exercise all five responses and keyboard completion with reduced motion.
    // Pointer input, animations and auto-advance have separate coverage.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await start(page, format.id);
    const answers = await finish(page, format.id, true, true);
    await expect(page.locator('article')).toHaveCount(15);
    await expect(page.getByRole('region', { name: 'Result comparisons' }).first()).toBeVisible();
    await expect(page.getByText('Most compatible personality', { exact: true }).first()).toBeVisible();
    await expect(page.getByText(`Analysis based on your responses to ${format.questions} questions based on 15 dimensions of political ideology.`, { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(JSON.parse((await page.evaluate(key => localStorage.getItem(key), HISTORY_KEY))!).results).toHaveLength(1);
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export history', exact: true }).click();
    const download = await downloadPromise;
    const file = JSON.parse(readFileSync((await download.path())!, 'utf8'));
    expect(file.results).toHaveLength(1);
    expect(file.results[0].scores).toEqual(scoreAnswers(format.id, answers));
    expect(file.results[0].length).toBe(format.id);
    expect(file.results[0].religiousIdentity).toBe('none');
    expect(file.results[0].selection).toEqual({ version: '3.0.0', answers: Object.fromEntries(selectionQuestions.map(question => [question.id, 1])) });
    expect(file.results[0]).not.toHaveProperty('answers');
    expect(errors).toEqual([]);
  });
}
test('back, edits, keyboard, auto-advance and restart keep answers consistent', async ({ page }) => {
  await start(page);
  await expect(page.getByRole('button', { name: 'Back', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
  await page.getByRole('radio', { name: 'Agree', exact: true }).check();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.locator('#question-title')).toBeFocused();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByRole('radio', { name: 'Agree', exact: true })).toBeChecked();
  await page.getByRole('radio', { name: 'Neutral', exact: true }).check();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
  await page.getByRole('checkbox', { name: 'Advance on answer' }).check();
  await page.getByRole('radio', { name: 'Neutral', exact: true }).press('ArrowDown');
  await expect(page.locator('#question-title')).toHaveText(selectQuestions('short')[0].text);
  await expect(page.getByRole('radio', { name: 'Disagree', exact: true })).toBeChecked();
  await page.getByRole('radio', { name: 'Disagree', exact: true }).press('Enter');
  await expect(page.locator('#question-title')).toHaveText(selectQuestions('short')[1].text);
  await page.getByRole('radio', { name: 'Strongly agree', exact: true }).click();
  await expect(page.locator('#question-title')).toHaveText(selectQuestions('short')[2].text);
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2');
  await page.getByRole('button', { name: 'Restart quiz', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Keep going' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('#question-title')).toHaveText(selectQuestions('short')[2].text);
  await page.getByRole('button', { name: 'Restart quiz', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Restart quiz', exact: true }).click();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
});
test('history saves automatically, survives reload and supports import, deduplication and deletion', async ({ page }) => {
  await start(page);
  await finish(page);
  await expect(page.getByText('All responses neutral', { exact: true })).toHaveCount(15);
  await expect(page.getByRole('heading', { name: 'Centrism', exact: true }).first()).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Centrism', exact: true }).first()).toBeVisible();
  // Both comparison requests must settle before scrolling to controls below them.
  await expect(page.getByRole('heading', { name: 'No close match', exact: true })).toHaveCount(4);
  await expect(page.getByRole('button', { name: 'Saved in this browser', exact: true })).toHaveCount(0);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export history', exact: true }).click();
  const path = (await (await downloadPromise).path())!;
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Your perspective profile.', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'No close match', exact: true })).toHaveCount(4);
  await page.getByRole('button', { name: 'All saved results' }).click();
  await expect(page.getByRole('heading', { name: 'Saved results.', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'View result', exact: true })).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Quiz type: Short', exact: true })).toBeVisible();
  await expect(page.getByLabel('Most compatible personality')).toBeVisible();
  await expect(page.getByLabel('Most compatible country')).toBeVisible();
  await expect(page.getByRole('img', { name: /15-axis preview/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'View result', exact: true }).click();
  await expect(page.locator('article')).toHaveCount(15);
  await page.getByLabel('Import result history', { exact: true }).setInputFiles(path);
  await expect(page.getByRole('status')).toHaveText('Imported 0 new results.');
  await page.getByRole('button', { name: /^Delete short result/ }).click();
  await expect(page.getByRole('button', { name: 'View result', exact: true })).toHaveCount(0);
  await page.getByLabel('Import result history', { exact: true }).setInputFiles(path);
  await expect(page.getByRole('status')).toHaveText('Imported 1 new result.');
  await page.getByLabel('Import result history', { exact: true }).setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from('{broken}') });
  await expect(page.getByRole('status')).toContainText('not valid JSON');
  await expect(page.getByRole('button', { name: 'View result', exact: true })).toHaveCount(1);
  await page.getByRole('button', { name: 'Clear saved history', exact: true }).click();
  await page.getByRole('button', { name: 'Clear history', exact: true }).click();
  expect(await page.evaluate(key => localStorage.getItem(key), HISTORY_KEY)).toBeNull();
});
test('blocked browser storage never prevents completion', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get: () => { throw new Error('Storage blocked'); } }); });
  await start(page);
  await finish(page);
  await expect(page.getByRole('alert')).toContainText('storage may be unavailable');
  await expect(page.getByRole('button', { name: 'Export result', exact: true })).toHaveCount(0);
});
test('browser Back preserves the open session and leaving asks for confirmation', async ({ page }) => {
  await page.goto('./#/quiz?length=long');
  await page.getByRole('button', { name: 'Start long quiz', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Advance on answer' }).uncheck();
  await page.getByRole('radio', { name: 'Agree', exact: true }).check();
  await page.goBack();
  await expect(page.getByText('1 of 135 answered.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Continue quiz', exact: true }).click();
  await expect(page.getByRole('radio', { name: 'Agree', exact: true })).toBeChecked();
  await page.getByRole('link', { name: '15 Values home', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Leave this quiz?' })).toBeVisible();
  await page.getByRole('button', { name: 'Keep going', exact: true }).click();
  await expect(page.getByRole('radio', { name: 'Agree', exact: true })).toBeChecked();
});
test('narrow results and invalid stored history stay usable without overwriting data', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('./#/results');
  await page.evaluate(key => localStorage.setItem(key, '{broken}'), HISTORY_KEY);
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('Saved history could not be read');
  expect(await page.evaluate(key => localStorage.getItem(key), HISTORY_KEY)).toBe('{broken}');
  await page.getByRole('button', { name: 'Clear saved history', exact: true }).click();
  await page.getByRole('button', { name: 'Clear history', exact: true }).click();
  await page.getByRole('link', { name: 'Take your first quiz' }).click();
  await page.getByRole('button', { name: 'Start short quiz', exact: true }).click();
  await finish(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const full = page.getByRole('article', { name: 'Restricted Immigration vs Open Immigration', exact: true });
  await full.scrollIntoViewIfNeeded();
});

test('a failed automatic save preserves the displayed result', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await start(page);
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    let attempts = 0;
    Storage.prototype.setItem = function (key, value) {
      attempts += 1;
      if (attempts === 2) Storage.prototype.setItem = original;
      throw new DOMException(`Cannot write ${key} (${value.length})`, 'QuotaExceededError');
    };
  });
  await finish(page);
  await expect(page.getByRole('status')).toContainText('could not save');
  await expect(page.getByRole('heading', { name: 'Your perspective profile.' })).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), HISTORY_KEY)).toBeNull();
  await expect(page.getByRole('button', { name: 'Save in this browser', exact: true })).toHaveCount(0);
});
