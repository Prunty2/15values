import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { axes, AXES_VERSION, QUESTION_BANK_VERSION, SCORING_VERSION, scoreAnswers, selectQuestions } from '../src/quiz/model';
import type { Answer, Answers, QuizResult } from '../src/quiz/model';
import { ideologyGroup } from '../src/profiles/ideologyGroups';
import { matchResultIdeology, matchResultProfiles } from '../src/profiles/ideologyMatching';
import { parseCatalogue } from '../src/profiles/catalogueData';
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

test('profile layout, all endpoints, help controls and complementary percentages work at every width', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('./#/results');
  await page.getByLabel('Import result history', { exact: true }).setInputFiles({ name: 'profile.json', mimeType: 'application/json', buffer: Buffer.from(serializeHistory([result])) });
  await page.getByRole('button', { name: 'View result', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your perspective profile.');
  const profiles = parseCatalogue(JSON.parse(readFileSync('public/profiles/catalogue.v1.json', 'utf8')));
  const match = matchResultIdeology(result, profiles)!;
  const groupColours = match.ideologies.map(item => ideologyGroup(profiles.find(profile => profile.catalogue === 'ideology' && profile.id === item.id)!).color);
  const expectedColour = groupColours.every(colour => colour === groupColours[0]) ? groupColours[0] : '#59676d';
  const comparisons = page.getByRole('region', { name: 'Result comparisons' }).first();
  await expect(comparisons).toBeVisible();
  await expect.poll(() => comparisons.evaluate(element => getComputedStyle(element).getPropertyValue('--result-color').trim())).toBe(expectedColour);
  const quote = page.getByRole('region', { name: 'Ideology perspective' });
  expect(Math.abs((await comparisons.boundingBox())!.width - (await quote.boundingBox())!.width)).toBeLessThan(1);
  for (const ideology of match.ideologies) {
    await expect(comparisons.getByRole('link', { name: ideology.name, exact: true })).toHaveAttribute('href', '#/ideologies/' + ideology.id);
  }
  await expect(comparisons.getByText((100 - match.meanAbsoluteDistance).toFixed(1) + '%', { exact: true })).toBeVisible();
  for (const kind of ['personality', 'country'] as const) {
    const match = matchResultProfiles(result, profiles, kind)!;
    const row = comparisons.locator('[aria-label="Most compatible ' + kind + '"]');
    for (const profile of match.profiles) {
      await expect(row.getByRole('link', { name: profile.metadata.name, exact: true })).toHaveAttribute('href', '#/' + (kind === 'personality' ? 'personalities' : 'countries') + '/' + profile.id);
    }
    await expect(row.getByText((100 - match.meanAbsoluteDistance).toFixed(1) + '% similarity', { exact: true })).toBeVisible();
  }
  await expect(page.locator('blockquote')).toHaveText(match.ideologies.map(ideology => profiles.find(profile => profile.catalogue === 'ideology' && profile.id === ideology.id)!.metadata.phrase!));
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
    }
    const culture = page.getByRole('article', { name: 'Culture vs Nature', exact: true });
    await culture.getByText('?', { exact: true }).click();
    await expect(culture.getByText(axes[14].description, { exact: true })).toBeVisible();
    const popover = await culture.locator('details > div').boundingBox();
    expect(popover!.x).toBeGreaterThanOrEqual(0);
    expect(popover!.x + popover!.width).toBeLessThanOrEqual(width);
    await culture.getByText('?', { exact: true }).click();
  }
  expect(errors).toEqual([]);
});

test('legacy results display and export their original method without recalculation', async ({ page }) => {
  const legacy = { ...result, scoringVersion: '1.0.0', scores: result.scores.map(score => ({ ...score, leftPercent: 66.7, rightPercent: 33.3 })) };
  await page.goto('./#/results');
  await page.getByLabel('Import result history', { exact: true }).setInputFiles({ name: 'legacy.json', mimeType: 'application/json', buffer: Buffer.from(serializeHistory([legacy])) });
  await expect(page.getByText('Original scoring', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'View result', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Result comparisons' }).first().getByRole('status')).toContainText('No compatible ideology assessments');
  await expect(page.locator('blockquote')).toHaveCount(0);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export result', exact: true }).click();
  const file = JSON.parse(readFileSync((await (await download).path())!, 'utf8'));
  expect(file.results).toEqual([legacy]);
});

test('empty history and saved cards are responsive, and saved profiles reopen after reload', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('./#/results');
  await expect(page.getByRole('heading', { name: 'Your first perspective starts here.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Import JSON', exact: true })).toBeVisible();
  await expect(page.getByText('Your browser · Your history')).toHaveCount(0);
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 950 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  const older = { ...result, id: 'older-result', completedAt: '2026-10-03T01:00:00.000Z' };
  await page.getByLabel('Import result history', { exact: true }).setInputFiles({ name: 'history.json', mimeType: 'application/json', buffer: Buffer.from(serializeHistory([older, result])) });
  await expect(page.getByRole('button', { name: 'View result', exact: true })).toHaveCount(2);
  await expect(page.getByRole('img', { name: /^15-axis preview/ })).toHaveCount(0);
  await expect(page.getByLabel('Most compatible personality')).toHaveCount(2);
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 950 });
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

test('comparison fetch failure can be retried without losing the result', async ({ page }) => {
  await page.route('**/profiles/catalogue.v1.json', route => route.abort());
  await page.goto('./#/results');
  await page.getByLabel('Import result history', { exact: true }).setInputFiles({ name: 'profile.json', mimeType: 'application/json', buffer: Buffer.from(serializeHistory([result])) });
  await page.getByRole('button', { name: 'View result', exact: true }).click();
  await expect(page.getByRole('alert').first()).toHaveText('Profile comparisons could not be loaded.');
  await page.unroute('**/profiles/catalogue.v1.json');
  await page.getByRole('button', { name: 'Try again', exact: true }).first().click();
  await expect(page.getByRole('region', { name: 'Result comparisons' }).first().getByRole('link')).not.toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your perspective profile.');
});

test('searchable comparison picker scrolls, supports keyboard selection and compares ideologies and personalities', async ({ page }) => {
  const profiles = parseCatalogue(JSON.parse(readFileSync('public/profiles/catalogue.v1.json', 'utf8')));
  const ideology = profiles.find(profile => profile.catalogue === 'ideology' && !profile.withdrawal)!;
  const personality = profiles.find(profile => profile.catalogue === 'personality' && !profile.withdrawal)!;
  await page.goto('./#/results');
  await page.getByLabel('Import result history', { exact: true }).setInputFiles({ name: 'profile.json', mimeType: 'application/json', buffer: Buffer.from(serializeHistory([result])) });
  await page.getByRole('button', { name: 'View result', exact: true }).click();
  const button = page.getByRole('button', { name: 'Compare', exact: true });
  await button.click();
  const dialog = page.getByRole('dialog', { name: 'Compare with a profile' });
  const search = dialog.getByRole('combobox');
  await expect(search).toBeFocused();
  const suggestions = dialog.getByRole('listbox');
  await expect(suggestions.getByRole('option').first()).toBeVisible();
  expect(await suggestions.evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true);
  await search.press('ArrowUp');
  await expect(search).toHaveAttribute('aria-activedescendant', /compare-option-/);
  expect(await suggestions.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  await search.fill('no such profile xyz');
  await expect(dialog.getByRole('status')).toHaveText('No matching profiles. Try another name.');
  await search.fill(ideology.metadata.name);
  await search.press('ArrowDown');
  await search.press('Enter');
  await expect(dialog).not.toBeVisible();
  await expect(button).toBeFocused();
  const legend = page.getByRole('list', { name: 'Compared profiles' });
  await expect(legend.getByRole('link', { name: ideology.metadata.name })).toBeVisible();
  const axis = axes[0];
  const theirs = ideology.scores.find(score => score.axisId === axis.id)!;
  const row = page.getByRole('article', { name: axis.name, exact: true });
  const dot = row.locator('span[title]').first();
  await expect(dot).toHaveAttribute('style', new RegExp('left: ' + theirs.rightPercent + '%'));
  await expect(dot).toHaveAttribute('title', ideology.metadata.name + ': ' + axis.left + ' ' + theirs.leftPercent + '%, ' + axis.right + ' ' + theirs.rightPercent + '%');
  await expect(page.locator('article span[title]')).toHaveCount(15);
  await button.click();
  await search.fill(personality.metadata.name);
  await dialog.getByRole('option', { name: personality.metadata.name + ' Personality', exact: true }).click();
  await expect(legend.getByRole('link', { name: personality.metadata.name })).toBeVisible();
  await expect(page.locator('article span[title]')).toHaveCount(30);
  await button.click();
  await search.fill(personality.metadata.name);
  await search.press('Enter');
  await expect(page.locator('article span[title]')).toHaveCount(30);
  await page.getByRole('article', { name: axes[0].name, exact: true }).scrollIntoViewIfNeeded();
  await expect(legend.getByRole('link', { name: personality.metadata.name })).toHaveAttribute('href', '#/personalities/' + personality.id);
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await button.click();
    await expect(search).toBeFocused();
    await search.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(button).toBeFocused();
  }
  await legend.getByRole('button', { name: 'Remove ' + ideology.metadata.name + ' comparison' }).click();
  await expect(page.locator('article span[title]')).toHaveCount(15);
  await legend.getByRole('button', { name: 'Remove ' + personality.metadata.name + ' comparison' }).click();
  await expect(page.locator('article span[title]')).toHaveCount(0);
  await expect(legend).toHaveCount(0);
});
