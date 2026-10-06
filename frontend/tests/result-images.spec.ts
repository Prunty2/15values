import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { AXES_VERSION, QUESTION_BANK_VERSION, SCORING_VERSION, scoreAnswers, selectQuestions } from '../src/quiz/model';
import { serializeHistory } from '../src/quiz/history';
import type { Profile } from '../src/profiles/types';

test('matched portraits and flags load in saved cards and full results, including ties', async ({ page }) => {
  const result = { id: 'image-check', completedAt: '2026-10-06T00:00:00.000Z', length: 'short' as const, axesVersion: AXES_VERSION, questionBankVersion: QUESTION_BANK_VERSION, scoringVersion: SCORING_VERSION, scores: scoreAnswers('short', Object.fromEntries(selectQuestions('short').map(q => [q.id, 0]))) };
  const catalogue = JSON.parse(readFileSync('public/profiles/catalogue.v1.json', 'utf8'));
  const profiles: Profile[] = catalogue.profiles.filter((p: Profile) => ['winston-churchill', 'andy-burnham', 'united-kingdom'].includes(p.id) && p.catalogue !== 'ideology').map((p: Profile) => ({ ...p, closestIdeology: undefined, scores: result.scores.map(score => ({ ...score, answered: 16 })) }));
  expect(profiles).toHaveLength(3);
  await page.route('**/profiles/catalogue.v1.json', route => route.fulfill({ json: { schemaVersion: 1, profiles } }));
  await page.goto('./#/results');
  await page.getByLabel('Import result history', { exact: true }).setInputFiles({ name: 'images.json', mimeType: 'application/json', buffer: Buffer.from(serializeHistory([result])) });
  async function checkImages() {
    const comparisons = page.getByRole('region', { name: 'Result comparisons' }).first();
    for (const profile of profiles) {
      const image = comparisons.getByRole('img', { name: profile.metadata.image!.alt, exact: true });
      await expect(image).toBeVisible();
      expect(await image.evaluate((element: HTMLImageElement) => element.src)).toBe(new URL(profile.metadata.image!.path, page.url()).href);
      await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
    }
  }
  await checkImages();
  await page.getByRole('button', { name: 'View result', exact: true }).click();
  await checkImages();
  await page.setViewportSize({ width: 320, height: 900 });
  await checkImages();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
