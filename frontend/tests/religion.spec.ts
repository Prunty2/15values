import { test, expect } from '@playwright/test';
import { profileFixture } from './fixtures/profile';
import { HISTORY_KEY } from '../src/quiz/history';
import type { ReligiousIdentity } from '../src/quiz/religion';
import { withIdeologyMatches } from '../src/profiles/ideologyMatching';
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

test('result countries follow the displayed ideology’s faith while general matches remain unrestricted', async ({ page }) => {
  const christian = make('christian-accelerationism', 'Christian accelerationism', 'christian', 75);
  const general = make('conservatism', 'Conservatism', 'none', 65);
  const country = (id: string, name: string, faith: ReligiousIdentity, percent: number) => {
    const profile = profileFixture('country', id);
    return { ...profile, metadata: { ...profile.metadata, name }, scores: profile.scores.map(score => ({ ...score, leftPercent: percent, rightPercent: 100 - percent })), countryReligion: { eligibleReligions: [faith], populationShares: { [faith]: 60 }, sourceYear: 2020, rationale: 'Synthetic country context', sources: [{ title: 'Test evidence', url: 'https://example.org' }] } };
  };
  const profiles = withIdeologyMatches([christian, general, country('india', 'India', 'hindu', 75), country('christian-country', 'Christian country', 'christian', 55)]);
  await page.route('**/profiles/catalogue.v1.json', route => route.fulfill({ json: { schemaVersion: 1, profiles } }));
  await page.goto('./#/results');
  for (const [percent, ideology, expectedCountry] of [[75, 'Christian accelerationism', 'Christian country'], [65, 'Conservatism', 'India']] as const) {
    const result = { id: 'country-religion', completedAt: '2026-10-06T00:00:00.000Z', length: 'short', questionBankVersion: christian.questionBankVersion, axesVersion: christian.axesVersion, scoringVersion: christian.scoringVersion, religiousIdentity: 'christian', scores: christian.scores.map(score => ({ ...score, leftPercent: percent, rightPercent: 100 - percent, answered: 3, neutral: 0 })) };
    await page.evaluate(({ key, result }) => localStorage.setItem(key, JSON.stringify({ schemaVersion: 1, results: [result] })), { key: HISTORY_KEY, result });
    await page.goto('./#/results?id=country-religion');
    await page.reload();
    const card = page.getByRole('region', { name: 'Result comparisons' }).first();
    await expect(card.getByRole('heading', { name: ideology, exact: true })).toBeVisible();
    const row = card.getByLabel('Most compatible country', { exact: true });
    await expect(row.getByRole('link', { name: expectedCountry, exact: true })).toBeVisible();
    if (percent === 75) await expect(row.getByRole('link', { name: 'India', exact: true })).toHaveCount(0);
  }
});
