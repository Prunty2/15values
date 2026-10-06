import { test, expect } from '@playwright/test';
import { profileFixture } from './fixtures/profile';
import { HISTORY_KEY } from '../src/quiz/history';
import type { ReligiousIdentity } from '../src/quiz/religion';
const make = (id: string, name: string, value: ReligiousIdentity, percent: number) => {
  const profile = profileFixture('ideology', id);
  return { ...profile, metadata: { ...profile.metadata, name }, religion: { value, basis: 'direct' as const, rationale: 'Explicit identity', sources: [{ title: 'Identity evidence', url: 'https://example.org/identity' }] }, scores: profile.scores.map(score => ({ ...score, leftPercent: percent, rightPercent: 100 - percent })) };
};
test('religious identity gates automatic quiz matches while general ideologies stay eligible', async ({ page }) => {
  const profiles = [make('hindu-nationalism', 'Hindu nationalism', 'hindu', 75), make('christian-conservatism', 'Christian conservatism', 'christian', 75), make('islamism', 'Islamism', 'muslim', 75), make('traditional-conservatism', 'Traditional conservatism', 'none', 70)];
  await page.route('**/profiles/catalogue.v1.json', route => route.fulfill({ json: { schemaVersion: 1, profiles } }));
  await page.goto('./#/results');
  for (const [identity, expected] of [['hindu', 'Hindu nationalism'], ['christian', 'Christian conservatism'], ['muslim', 'Islamism'], ['none', 'Traditional conservatism'], ['undisclosed', 'Traditional conservatism'], [undefined, 'Traditional conservatism']] as const) {
    const subject = profiles[0];
    const result = { id: 'religion-match', completedAt: '2026-10-06T00:00:00.000Z', length: 'short', questionBankVersion: subject.questionBankVersion, axesVersion: subject.axesVersion, scoringVersion: subject.scoringVersion, scores: subject.scores.map(score => ({ ...score, answered: 3, neutral: 0 })), ...(identity ? { religiousIdentity: identity } : {}) };
    await page.evaluate(({ key, result }) => localStorage.setItem(key, JSON.stringify({ schemaVersion: 1, results: [result] })), { key: HISTORY_KEY, result });
    await page.goto('./#/results?id=religion-match');
    await page.reload();
    await expect(page.getByRole('region', { name: 'Result comparisons' }).first().getByRole('heading', { name: expected, exact: true })).toBeVisible();
  }
});

test('published US country comparison excludes Hindu nationalism', async ({ page }) => {
  await page.goto('./#/countries/united-states');
  await expect(page.getByRole('heading', { name: 'United States', exact: true })).toBeVisible();
  const comparison = page.getByRole('region', { name: 'Closest ideology', exact: true });
  await expect(comparison.getByRole('link', { name: 'Nationalist Conservatism', exact: true })).toBeVisible();
  await expect(comparison.getByRole('link', { name: 'Hindu nationalism', exact: true })).toHaveCount(0);
});
