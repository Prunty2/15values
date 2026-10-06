import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { HISTORY_KEY, serializeHistory } from '../src/quiz/history';
import type { QuizResult } from '../src/quiz/model';
import type { Profile } from '../src/profiles/types';
const profiles: Profile[] = JSON.parse(readFileSync(new URL('../public/profiles/catalogue.v1.json', import.meta.url), 'utf8')).profiles;
const merit = profiles.find(profile => profile.id === 'meritocracy')!;

test('identity preferences prevent Meritocracy even with identical axis scores', async ({ page }) => {
  for (const preference of [-1, 1] as const) {
    const result: QuizResult = { id: 'selection-browser', completedAt: '2026-10-06T00:00:00.000Z', length: 'short', axesVersion: merit.axesVersion, questionBankVersion: merit.questionBankVersion, scoringVersion: merit.scoringVersion, scores: merit.scores.map(score => ({ ...score, answered: 3, neutral: 0 })), selection: { version: '3.0.0', answers: { 'matching-preference': preference, 'matching-ownership': -1, 'matching-state': -1, 'matching-party': -1 } } };
    await page.goto('./#/results');
    await page.evaluate(({ key, history }) => localStorage.setItem(key, history), { key: HISTORY_KEY, history: serializeHistory([result]) });
    await page.goto('./#/results?id=selection-browser');
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Your perspective profile.' })).toBeVisible();
    const card = page.getByRole('region', { name: 'Result comparisons' });
    await expect(card.locator('a[href^="#/ideologies/"]').first()).toBeVisible();
    const link = card.locator('a[href="#/ideologies/meritocracy"]');
    if (preference > 0) await expect(link).toHaveCount(0);
    else await expect(link.first()).toBeVisible();
  }
});

test('Harris displays a compatible alternative and no Meritocracy similarity card', async ({ page }) => {
  await page.goto('./#/personalities/kamala-harris');
  await expect(page.getByRole('heading', { name: 'Kamala Harris', exact: true })).toBeVisible();
  await expect(page.locator('a[href="#/ideologies/meritocracy"]')).toHaveCount(0);
  const harris = profiles.find(profile => profile.id === 'kamala-harris')!;
  for (const match of harris.closestIdeology!.ideologies) await expect(page.locator(`a[href="#/ideologies/${match.id}"]`).first()).toBeVisible();
});

test('one disagreement about the state blocks an otherwise identical anarchist match', async ({ page }) => {
  const anarchist = profiles.find(profile => profile.id === 'anarcho-capitalism')!;
  for (const state of [-1, 1] as const) {
    const result: QuizResult = { id: 'fringe-browser', completedAt: '2026-10-06T00:00:00.000Z', length: 'short', axesVersion: anarchist.axesVersion, questionBankVersion: anarchist.questionBankVersion, scoringVersion: anarchist.scoringVersion, scores: anarchist.scores.map(score => ({ ...score, answered: 3, neutral: 0 })), selection: { version: '3.0.0', answers: { 'matching-preference': 1, 'matching-ownership': -1, 'matching-state': state, 'matching-party': -1 } } };
    await page.goto('./#/results');
    await page.evaluate(({ key, history }) => localStorage.setItem(key, history), { key: HISTORY_KEY, history: serializeHistory([result]) });
    await page.goto('./#/results?id=fringe-browser');
    await page.reload();
    const card = page.getByRole('region', { name: 'Result comparisons' });
    await expect(card.locator('a[href^="#/ideologies/"]').first()).toBeVisible();
    const link = card.locator('a[href="#/ideologies/anarcho-capitalism"]');
    if (state < 0) await expect(link).toHaveCount(0);
    else await expect(link.first()).toBeVisible();
  }
});
