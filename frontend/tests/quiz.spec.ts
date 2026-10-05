import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { answerOptions, formats, getFormat, scoreAnswers, selectQuestions } from '../src/quiz/model';
import type { Answers, QuizLength } from '../src/quiz/model';
import { HISTORY_KEY } from '../src/quiz/history';

async function start(page: Page, length: QuizLength = 'short') {
  await page.goto(`./#/quiz?length=${length}`);
  await page.getByRole('button', { name: `Start ${length} quiz`, exact: true }).click();
  await expect(page.locator('#question-title')).toBeVisible();
  await page.getByRole('checkbox', { name: 'Advance on answer' }).uncheck();
}
async function finish(page: Page, length: QuizLength = 'short', varying = false, capture?: (name: string) => string, keyboard = false) {
  await page.getByRole('checkbox', { name: 'Advance on answer' }).uncheck();
  const answers: Answers = {};
  for (const [index, question] of selectQuestions(length).entries()) {
    const option = varying ? answerOptions[index % 5] : answerOptions[2];
    await expect(page.locator('#question-title')).toHaveText(question.text);
    if (index === getFormat(length).questions - 1) await expect(page.getByText('100% complete', { exact: true })).toHaveCount(0);
    if (capture && (question.id === 'militarist-pacifist-08' || index === getFormat(length).questions - 1)) {
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const geometry = await page.locator('#question-title').evaluate(element => {
        const intro = element.parentElement!.parentElement!;
        const topic = element.previousElementSibling!.getBoundingClientRect();
        const number = intro.lastElementChild!.getBoundingClientRect();
        return { horizontalOverlap: Math.min(topic.right, number.right) - Math.max(topic.left, number.left), verticalOverlap: Math.min(topic.bottom, number.bottom) - Math.max(topic.top, number.top) };
      });
      expect(geometry.horizontalOverlap <= 0 || geometry.verticalOverlap <= 0).toBe(true);
      await page.screenshot({ path: capture(`question-${index + 1}.png`), fullPage: true });
    }
    const radio = page.getByRole('radio', { name: option.label, exact: true });
    if (keyboard) {
      await radio.focus();
      await radio.press('Space');
      await expect(radio).toBeChecked();
    } else await radio.check();
    if (index === getFormat(length).questions - 1) await expect(page.getByText('100% complete', { exact: true })).toBeVisible();
    answers[question.id] = option.value;
    const next = page.getByRole('button', { name: index === getFormat(length).questions - 1 ? 'See my results' : 'Next', exact: true });
    if (keyboard) await next.press('Enter');
    else await next.click();
  }
  await expect(page.getByRole('heading', { name: 'Your perspective profile.' })).toBeVisible();
  return answers;
}
for (const format of formats) {
  test(`${format.name}: complete every question and export the expected independent scores`, async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    // Content/scoring coverage uses reduced motion; comprehensive also exercises keyboard completion.
    // Pointer input, animations and auto-advance have separate coverage.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await start(page, format.id);
    const answers = await finish(page, format.id, true, format.id === 'comprehensive' ? name => testInfo.outputPath(name) : undefined, format.id === 'comprehensive');
    await expect(page.locator('article')).toHaveCount(15);
    await expect(page.getByRole('region', { name: 'Comparison placeholders' })).toBeVisible();
    await expect(page.getByText('Personality placeholder', { exact: true })).toBeVisible();
    await expect(page.getByText(`Analysis based on your responses to ${format.questions} questions based on 15 dimensions of political ideology.`, { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(JSON.parse((await page.evaluate(key => localStorage.getItem(key), HISTORY_KEY))!).results).toHaveLength(1);
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export result', exact: true }).click();
    const download = await downloadPromise;
    const file = JSON.parse(readFileSync((await download.path())!, 'utf8'));
    expect(file.results).toHaveLength(1);
    expect(file.results[0].scores).toEqual(scoreAnswers(format.id, answers));
    expect(file.results[0].length).toBe(format.id);
    expect(file.results[0]).not.toHaveProperty('answers');
    expect(errors).toEqual([]);
    if (format.id === 'short') await page.screenshot({ path: testInfo.outputPath('results.png'), fullPage: true });
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
  await expect(page.getByRole('button', { name: 'Saved in this browser', exact: true })).toBeDisabled();
  const downloadPromise = page.waitForEvent('download');
  await page.getByText('Manage history', { exact: true }).click();
  await page.getByRole('button', { name: 'Export history', exact: true }).click();
  const path = (await (await downloadPromise).path())!;
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Your perspective profile.', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'All saved results' }).click();
  await expect(page.getByRole('heading', { name: 'Saved results.', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'View result', exact: true })).toHaveCount(1);
  await page.getByRole('button', { name: 'View result', exact: true }).click();
  await expect(page.locator('article')).toHaveCount(15);
  await page.getByText('Manage history', { exact: true }).click();
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
test('blocked browser storage and corrupt imports never prevent completion or export', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get: () => { throw new Error('Storage blocked'); } }); });
  await start(page);
  await finish(page);
  await expect(page.getByRole('alert')).toContainText('storage may be unavailable');
  await expect(page.getByRole('button', { name: 'Save in this browser', exact: true })).toBeDisabled();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export result', exact: true }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('15-values-result.json');
});
test('reviewing answers recalculates the result and final submission is always explicit', async ({ page }) => {
  await start(page);
  await finish(page);
  await page.getByRole('button', { name: 'Review answers', exact: true }).click();
  await expect(page.locator('#question-title')).toHaveText(selectQuestions('short')[44].text);
  await page.getByRole('checkbox', { name: 'Advance on answer' }).check();
  await page.getByRole('radio', { name: 'Strongly agree', exact: true }).check();
  await expect(page.getByRole('button', { name: 'See my results', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'See my results', exact: true }).click();
  const culture = page.getByRole('article', { name: 'Culture vs Nature', exact: true });
  await expect(culture.getByRole('img')).toHaveAttribute('aria-label', 'Culture: 62.5%; Nature: 37.5%');
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
test('large desktop and small mobile layouts are readable, with both fonts loaded', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await start(page);
  for (const viewport of [{ width: 2560, height: 1440 }, { width: 1920, height: 1200 }, { width: 1440, height: 900 }, { width: 1366, height: 768 }, { width: 390, height: 844 }, { width: 320, height: 740 }]) {
    await page.setViewportSize(viewport);
    await page.evaluate(() => document.fonts.ready);
    const fonts = await page.evaluate(() => [...document.fonts].map(font => ({ family: font.family, status: font.status })));
    expect(fonts).toEqual(expect.arrayContaining([expect.objectContaining({ family: 'Clarity City', status: 'loaded' }), expect.objectContaining({ family: 'Bitcount Ink', status: 'loaded' })]));
    const card = page.getByRole('region', { name: selectQuestions('short')[0].text, exact: true });
    const bounds = await card.boundingBox();
    expect(bounds!.width / viewport.width).toBeGreaterThan(.84);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight)).toBe(true);
    await expect(page.getByRole('radio')).toHaveCount(5);
    if (viewport.width >= 1366) {
      const next = await page.getByRole('button', { name: 'Next', exact: true }).boundingBox();
      expect(next!.y + next!.height).toBeLessThan(viewport.height);
    }
    await page.screenshot({ path: testInfo.outputPath(`quiz-${viewport.width}.png`), fullPage: true });
  }
});

test('narrow results and invalid stored history stay usable without overwriting data', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('./#/results');
  await page.evaluate(key => localStorage.setItem(key, '{broken}'), HISTORY_KEY);
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('Saved history could not be read');
  expect(await page.evaluate(key => localStorage.getItem(key), HISTORY_KEY)).toBe('{broken}');
  await page.getByText('Manage history', { exact: true }).click();
  await page.getByRole('button', { name: 'Clear saved history', exact: true }).click();
  await page.getByRole('button', { name: 'Clear history', exact: true }).click();
  await page.getByRole('link', { name: 'Take your first quiz' }).click();
  await page.getByRole('button', { name: 'Start short quiz', exact: true }).click();
  await finish(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const full = page.getByRole('article', { name: 'Restricted Immigration vs Open Immigration', exact: true });
  await full.scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('narrow-results.png') });
});

test('a failed automatic save preserves the result and can be retried without duplicates', async ({ page }) => {
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
  await page.getByRole('button', { name: 'Save in this browser', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Save in this browser', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Save in this browser', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Saved in this browser', exact: true })).toBeDisabled();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Your perspective profile.' })).toBeVisible();
  expect(JSON.parse((await page.evaluate(key => localStorage.getItem(key), HISTORY_KEY))!).results).toHaveLength(1);
});
