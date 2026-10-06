import { test, expect } from '@playwright/test';
import { axes } from '../src/quiz/model';
import { readFileSync } from 'node:fs';
import { HISTORY_KEY } from '../src/quiz/history';

test('comparison text fits its rings and cards at narrow and wide sizes', async ({ page }, testInfo) => {
  const result = { id: 'fit-test', completedAt: '2026-10-06T10:00:00.000Z', length: 'short', questionBankVersion: '2.0.0', axesVersion: '2.0.0', scoringVersion: '2.0.0', scores: axes.map(axis => ({ axisId: axis.id, leftPercent: 50, rightPercent: 50, answered: 3, neutral: 3 })) };
  await page.addInitScript(({ key, result }) => localStorage.setItem(key, JSON.stringify({ schemaVersion: 1, results: [result] })), { key: HISTORY_KEY, result });
  const catalogue = JSON.parse(readFileSync('public/profiles/result-catalogues/2.0.0-2.0.0-2.0.0.v1.json', 'utf8'));
  const profiles = ['personality', 'country'].map(kind => {
    const source = catalogue.profiles.find((profile: { catalogue: string }) => profile.catalogue === kind);
    const { closestIdeology: _match, ...profile } = source;
    return { ...profile, scores: profile.scores.map((score: object) => ({ ...score, leftPercent: 57.8, rightPercent: 42.2 })) };
  });
  await page.route('**/profiles/result-catalogues/2.0.0-2.0.0-2.0.0.v1.json', route => route.fulfill({ json: { schemaVersion: 1, profiles } }));
  for (const width of [320, 390, 768, 1114, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ['./#/results', './#/results?id=fit-test']) {
      await page.goto(route);
      const comparison = page.getByLabel('Most compatible personality', { exact: true }).first();
      await expect(comparison.getByRole('link').first()).toBeVisible();
      const ring = comparison.getByRole('img', { name: /similarity across 15 axes/ });
      const fits = await ring.evaluate(el => {
        const ring = el.getBoundingClientRect();
        const text = el.querySelector('strong')!.getBoundingClientRect();
        const safeInset = ring.width * .12;
        return text.left >= ring.left + safeInset && text.right <= ring.right - safeInset;
      });
      expect(fits, `ring at ${width} on ${route}`).toBe(true);
      expect(await comparison.evaluate(el => el.scrollWidth <= el.clientWidth), `card at ${width}`).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (width === 1114 && route.endsWith('id=fit-test')) await page.screenshot({ path: testInfo.outputPath('comparison-fit.png'), fullPage: true });
    }
  }
});
