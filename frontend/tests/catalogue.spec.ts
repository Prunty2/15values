import { test, expect } from '@playwright/test';
import { readFileSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { fixture, profileFixture } from './fixtures/profile';

const generatedFixtures = new Set<string>();
for (const [kind, route, id] of [['ideology', 'ideologies', 'communism'], ['personality', 'personalities', 'test-personality']] as const) {
test(`withdrawn ${kind} has no placements but preserves the historical assessment link`, async ({ page }) => {
  const profile = { ...profileFixture(kind, id), scores: [], withdrawal: { date: '2026-10-04', reason: 'Question-level evidence did not support the archived assessment.' } };
  await page.route('**/profiles/catalogue.v1.json', route => route.fulfill({ json: { schemaVersion: 1, profiles: [profile] } }));
  await page.goto(`./#/${route}`);
  await expect(page.getByText('Placements withdrawn · Evidence review required')).toBeVisible();
  await expect(page.locator('main article [tabindex="0"]')).toHaveCount(0);
  await page.goto(`./#/${route}/${id}`);
  await expect(page.getByRole('heading', { name: 'Placements withdrawn' })).toBeVisible();
  await expect(page.locator('main article')).toHaveCount(0);
  await page.locator('summary').filter({ hasText: 'Sources and assessment' }).click();
  await expect(page.getByRole('link', { name: 'Download the withdrawn assessment' })).toHaveAttribute('href', /\/1.json$/);
});
}
test.afterEach(() => { for (const path of generatedFixtures) rmSync(path, { recursive: true, force: true }); generatedFixtures.clear(); });

test('all three catalogues browse, search and open full sourced assessments', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const id = `test-profile-${testInfo.project.name}`;
  const profiles = (['ideology', 'country', 'personality'] as const).map(kind => profileFixture(kind, id));
  // Native browser downloads bypass route interception: serve temporary files from
  // the ignored build output, never source archives or public catalogue data.
  for (const profile of profiles) {
    const directory = fileURLToPath(new URL(`../dist/profiles/audits/${profile.catalogue}/${id}/`, import.meta.url));
    mkdirSync(directory, { recursive: true }); generatedFixtures.add(directory);
    writeFileSync(join(directory, '1.json'), JSON.stringify(fixture(profile.catalogue, id)));
  }
  await page.route('**/profiles/catalogue.v1.json', route => route.fulfill({ json: { schemaVersion: 1, profiles } }));
  // Reuse an existing local asset for rendering only; no fixture enters public/.
  await page.route('**/profiles/images/*', route => route.fulfill({ path: fileURLToPath(new URL('../public/social-preview.png', import.meta.url)), contentType: 'image/png' }));
  for (const [path, kind] of [['ideologies', 'ideology'], ['countries', 'country'], ['personalities', 'personality']] as const) {
    await page.goto(`./#/${path}`);
    await expect(page.getByRole('heading', { name: `Test ${kind}`, exact: true })).toBeVisible();
    if (kind === 'country') {
      const classification = page.getByRole('list', { name: 'Political classification' }).getByRole('listitem');
      await expect(classification).toHaveCount(1);
      await expect(classification.nth(0)).toHaveText('Test ideology');
      await expect(classification.nth(0)).toHaveAttribute('aria-label', 'Closest ideology: Test ideology');
      await expect(page.getByRole('list', { name: 'Profile tags' })).toHaveCount(0);
    }
    await page.getByRole('searchbox').fill('missing subject');
    await expect(page.getByText('No profiles match your search.')).toBeVisible();
    await page.getByRole('searchbox').fill('');
    await page.getByRole('link', { name: `Test ${kind}`, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#/${path}/${id}$`));
    await expect(page).toHaveTitle(`Test ${kind} — 15 Values`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Test ${kind}`);
    if (kind === 'ideology') {
      const comparisons = page.getByRole('region', { name: 'Most similar profiles' });
      await expect(comparisons.getByText('Similar person', { exact: true })).toHaveCount(0);
      await expect(comparisons.getByText('Similar country', { exact: true })).toHaveCount(0);
      await expect(comparisons.getByRole('link', { name: 'Test personality' })).toHaveAttribute('href', '#/personalities/' + id);
      await expect(comparisons.getByRole('link', { name: 'Test country' })).toHaveAttribute('href', '#/countries/' + id);
      await expect(comparisons.getByText(/% similarity/)).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await expect(page.locator('main blockquote')).toHaveCount(0);
    }
    if (kind === 'personality') {
      const header = page.locator('dl[aria-label="Profile comparisons"]');
      await expect(header.getByRole('link', { name: 'Test ideology', exact: true })).toHaveAttribute('href', `#/ideologies/${id}`);
      await expect(page.locator('main header').first()).toHaveCSS('border-top-color', 'rgb(137, 96, 59)');
    }
    const countryComparison = page.getByRole('region', { name: 'Closest ideology', exact: true });
    await expect(countryComparison).toHaveCount(kind === 'country' ? 1 : 0);
    if (kind === 'country') {
      await expect(countryComparison.getByRole('link', { name: 'Test ideology', exact: true })).toHaveAttribute('href', `#/ideologies/${id}`);
      await expect(countryComparison.locator('svg')).toBeVisible();
      await expect(countryComparison.getByRole('heading', { name: 'Similar', exact: true })).toBeVisible();
      await expect(page.locator('main header img')).toBeVisible();
      await expect(page.locator('main header')).toContainText(profiles[1].metadata.description);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
    await expect(page.locator('main article')).toHaveCount(15);
    await page.locator('summary').filter({ hasText: 'Sources and assessment' }).click();
    await expect(page.getByRole('link', { name: 'Test source 1', exact: true })).toHaveAttribute('href', 'https://example.org/source-1');
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name: 'Download the full assessment' }).click();
    const download = await downloadPromise;
    const audit = JSON.parse(readFileSync((await download.path())!, 'utf8'));
    expect(audit.axes.flatMap((axis: { answers: unknown[] }) => axis.answers)).toHaveLength(240);
    if (kind !== 'ideology') {
      expect(await page.getByRole('img', { name: 'Test image', exact: true }).evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
      await expect(page.getByRole('link', { name: 'CC0', exact: true })).toHaveAttribute('href', 'https://creativecommons.org/publicdomain/zero/1.0/');
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Test ${kind}`);
    await page.getByRole('link', { name: `All ${path}` }).click();
    await expect(page.getByRole('searchbox')).toBeVisible();
  }
});

test('catalogue failures can be retried and missing profiles have a way back', async ({ page }) => {
  let fail = true;
  await page.route('**/profiles/catalogue.v1.json', route => fail ? route.fulfill({ status: 503 }) : route.fulfill({ json: { schemaVersion: 1, profiles: [] } }));
  await page.goto('./#/countries');
  await expect(page.getByRole('alert')).toContainText('could not be loaded');
  fail = false;
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByRole('heading', { name: 'No countries added yet.' })).toBeVisible();
  await page.goto('./#/countries/missing');
  await expect(page.getByRole('heading', { name: 'Profile not found' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back to countries' })).toHaveAttribute('href', '#/countries');
});

test('malformed catalogue data is not rendered as a profile', async ({ page }) => {
  const profile = profileFixture(); profile.sources[0].url = 'javascript:alert(1)';
  await page.route('**/profiles/catalogue.v1.json', route => route.fulfill({ json: { schemaVersion: 1, profiles: [profile] } }));
  await page.goto('./#/ideologies/test-profile');
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.locator('main article')).toHaveCount(0);
});

test('ideology groups combine with search and show only pronounced placements', async ({ page }) => {
  const profiles = [profileFixture('ideology', 'communism'), profileFixture('ideology', 'marxism'), profileFixture('ideology', 'liberalism')];
  profiles[0].metadata.name = 'Communism fixture';
  profiles[1].metadata.name = 'Marxism fixture';
  profiles[2].metadata.name = 'Liberalism fixture';
  const percentages = [34.5, 35, 65, 65.5, 25, 75, 50, 45, 55];
  profiles[1].scores.forEach((score, index) => {
    score.leftPercent = percentages[index] ?? 50;
    score.rightPercent = 100 - score.leftPercent;
  });
  await page.route('**/profiles/catalogue.v1.json', route => route.fulfill({ json: { schemaVersion: 1, profiles } }));
  await page.goto('./#/ideologies');
  await expect(page.locator('main article')).toHaveCount(3);
  await page.getByRole('button', { name: 'Far-Left 2', exact: true }).last().click();
  await expect(page.locator('main article')).toHaveCount(2);
  await page.getByRole('searchbox').fill('marxism');
  await expect(page.locator('main article')).toHaveCount(1);
  const placements = page.locator('main article [tabindex="0"]');
  await expect(placements).toHaveCount(4);
  await placements.first().focus();
  await expect(page.getByRole('tooltip').first()).toBeVisible();
  await expect(page.getByRole('tooltip').first()).toContainText('Democracy');
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('main article')).toHaveCount(3);
  await expect(page.getByRole('searchbox')).toHaveValue('');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('personality filter options follow the other selections and search', async ({ page }) => {
  const profiles = [profileFixture('personality', 'anthony-albanese'), profileFixture('personality', 'donald-trump')];
  profiles[0].metadata.name = 'Test Australian PM';
  profiles[0].metadata.role = 'Prime minister';
  profiles[1].metadata.name = 'Test US President';
  profiles[1].metadata.role = 'President';
  const ideologies = [profileFixture('ideology', 'social-democracy'), profileFixture('ideology', 'conservatism')];
  ideologies[0].metadata.name = 'Social democracy';
  ideologies[1].metadata.name = 'Conservatism';
  profiles.forEach((profile, index) => {
    profile.scores = profile.scores.map(score => ({ ...score, leftPercent: index ? 0 : 100, rightPercent: index ? 100 : 0 }));
    ideologies[index].scores = profile.scores.map(score => ({ ...score }));
  });
  await page.route('**/profiles/catalogue.v1.json', route => route.fulfill({ json: { schemaVersion: 1, profiles: [...profiles, ...ideologies] } }));
  await page.goto('./#/personalities');
  const position = page.getByRole('combobox', { name: 'Position', exact: true });
  const ideology = page.getByRole('combobox', { name: 'Closest ideology', exact: true });
  const country = page.getByRole('combobox', { name: 'Country of origin' });
  await position.selectOption('Prime minister');
  await expect(ideology.locator('option')).toHaveText(['All Ideologies', 'Social Democracy']);
  await expect(country.locator('option')).toHaveText(['All Countries', 'Australia']);
  await ideology.selectOption('Social democracy');
  await expect(position.locator('option[value="President"]')).toHaveCount(0);
  await expect(page.locator('main article')).toHaveCount(1);
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(ideology.locator('option')).toHaveCount(3);
  await expect(country.locator('option')).toHaveCount(3);
  await page.getByRole('searchbox').fill('US President');
  await expect(ideology.locator('option')).toHaveText(['All Ideologies', 'Conservatism']);
  await expect(country.locator('option')).toHaveText(['All Countries', 'United States']);
});

test('personality filters combine with search and clear together', async ({ page }) => {
  const profiles = [profileFixture('personality', 'andy-burnham'), profileFixture('personality', 'donald-trump')];
  profiles[0].metadata.name = 'Andy Burnham';
  profiles[0].metadata.role = 'Prime Minister';
  profiles[0].metadata.description = 'Advocates democratic socialism.';
  profiles[0].metadata.politicalLeaning = 'Left';
  profiles[0].metadata.ideology = 'Democratic socialism';
  profiles[1].metadata.politicalLeaning = 'Right';
  profiles[1].metadata.name = 'Donald Trump';
  profiles[1].metadata.role = 'President';
  await page.route('**/profiles/catalogue.v1.json', route => route.fulfill({ json: { schemaVersion: 1, profiles } }));
  await page.goto('./#/personalities');
  await expect(page.locator('main article')).toHaveCount(2);
  await page.getByRole('combobox', { name: 'Country of origin' }).selectOption('United Kingdom');
  await page.getByRole('combobox', { name: 'Closest ideology', exact: true }).selectOption('No match available');
  await page.getByRole('combobox', { name: 'Position', exact: true }).selectOption('Prime minister');
  await expect(page.locator('main article')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Andy Burnham' })).toBeVisible();
  await page.getByRole('searchbox').fill('Trump');
  await expect(page.locator('main article')).toHaveCount(0);
  await expect(page.getByText('No profiles match your filters.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('main article')).toHaveCount(2);
  await expect(page.getByRole('searchbox')).toHaveValue('');
  for (const select of await page.getByRole('combobox').all()) await expect(select).toHaveValue('');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('Political Party Leaders includes different countries and primary offices', async ({ page }) => {
  const profiles = [
    profileFixture('personality', 'anthony-albanese'),
    profileFixture('personality', 'alice-weidel'),
    profileFixture('personality', 'kim-jong-un'),
    profileFixture('personality', 'adam-bandt'),
    profileFixture('personality', 'elon-musk'),
  ];
  const names = ['Anthony Albanese', 'Alice Weidel', 'Kim Jong Un', 'Adam Bandt', 'Elon Musk'];
  profiles.forEach((profile, index) => { profile.metadata.name = names[index]; });
  profiles[0].metadata.role = 'Prime minister';
  profiles[1].metadata.role = 'Co-leader of Alternative for Germany';
  profiles[2].metadata.role = 'North Korean leader';
  profiles[3].metadata.role = 'Australian Greens leader (2020–2025)';
  await page.route('**/profiles/catalogue.v1.json', route => route.fulfill({ json: { schemaVersion: 1, profiles } }));
  await page.goto('./#/personalities');
  await page.getByRole('combobox', { name: 'Position', exact: true }).selectOption('Political Party Leaders');
  await expect(page.locator('main article')).toHaveCount(4);
  for (const name of names.slice(0, 4)) await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Position', exact: true }).locator('option', { hasText: 'Former Leader' })).toHaveCount(0);
  await page.getByRole('combobox', { name: 'Position', exact: true }).selectOption('Leader');
  await expect(page.getByRole('heading', { name: 'Adam Bandt', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Adam Bandt', exact: true }).getByRole('listitem', { name: 'Position: Leader', exact: true })).toBeVisible();
  await page.getByRole('combobox', { name: 'Position', exact: true }).selectOption('Political Party Leaders');
  await page.getByRole('combobox', { name: 'Country of origin' }).selectOption('Germany');
  await expect(page.locator('main article')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Alice Weidel', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('main article')).toHaveCount(5);
});

test('profile comparisons omit political leaning and link similar people', async ({ page }) => {
  const subject = profileFixture('personality', 'subject');
  const neighbour = profileFixture('personality', 'neighbour');
  neighbour.metadata.name = 'Similar person';
  const ideology = profileFixture('ideology', 'social-democracy');
  ideology.metadata.politicalLeaning = 'Centre-left';
  await page.route('**/profiles/catalogue.v1.json', route => route.fulfill({ json: { schemaVersion: 1, profiles: [subject, neighbour, ideology] } }));
  await page.goto('./#/personalities/subject');
  const comparisons = page.locator('dl[aria-label="Profile comparisons"]');
  await expect(page.locator('main')).not.toContainText('Political leaning');
  await expect(page.getByRole('heading', { name: 'Similar', exact: true })).toBeVisible();
  await expect(page.getByText('How these comparisons work')).toHaveCount(0);
  await expect(comparisons.getByRole('link', { name: 'Similar person' })).toHaveAttribute('href', '#/personalities/neighbour');
  await expect(comparisons.getByRole('link', { name: subject.metadata.name })).toHaveCount(0);
  await comparisons.getByRole('link', { name: 'Similar person' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Similar person');
  await page.goto('./#/ideologies/social-democracy');
  await expect(page.locator('main')).not.toContainText('Political leaning');
});

test('personality card has exactly ideology, position and origin tags', async ({ page }) => {
  const profiles = [profileFixture('personality', 'vladimir-lenin'), profileFixture('ideology', 'socialism')];
  profiles[0].metadata.role = 'Revolutionary and Soviet head of government';
  profiles[0].metadata.category = 'Bolshevism / Marxism–Leninism';
  profiles[0].metadata.politicalLeaning = 'Far left';
  profiles[0].selection = {
    version: '3.0.0', answers: { 'matching-ownership': 1 },
    evidence: [{ questionId: 'matching-ownership', basis: 'direct', rationale: 'Synthetic ownership commitment for the matching fixture.', sources: [{ title: 'Synthetic fixture evidence', url: 'https://example.org/ownership' }] }],
  };
  profiles[1].metadata.name = 'Calculated ideology';
  await page.route('**/profiles/catalogue.v1.json', route => route.fulfill({ json: { schemaVersion: 1, profiles } }));
  await page.goto('./#/personalities');
  const tags = page.getByRole('list', { name: 'Profile tags' }).getByRole('listitem');
  await expect(tags).toHaveCount(3);
  await expect(tags.nth(0)).toHaveText('Calculated ideology');
  await expect(tags.nth(1)).toHaveText('Dictator');
  await expect(tags.nth(2)).toHaveAttribute('aria-label', 'Best-known country: Russia');
});

test('ideology pages show linked portraits and flags without labels or percentages', async ({ page }) => {
  await page.route('**/profiles/images/*', route => route.fulfill({ path: fileURLToPath(new URL('../public/social-preview.png', import.meta.url)), contentType: 'image/png' }));
  const profiles = (['ideology', 'personality', 'country'] as const).map(kind => profileFixture(kind, 'match-' + kind));
  await page.route('**/profiles/catalogue.v1.json', route => route.fulfill({ json: { schemaVersion: 1, profiles } }));
  await page.goto('./#/ideologies/match-ideology');
  const comparisons = page.getByRole('region', { name: 'Most similar profiles' });
  await expect(comparisons.locator('img')).toHaveCount(2);
  await expect(page.locator('header figure')).toHaveCount(0);
  for (const image of await comparisons.locator('img').all()) await expect(image).toHaveJSProperty('naturalWidth', 1200);
  await expect(comparisons.getByRole('link', { name: 'Test personality' })).toHaveAttribute('href', '#/personalities/match-personality');
  await expect(comparisons.getByRole('link', { name: 'Test country' })).toHaveAttribute('href', '#/countries/match-country');
  await expect(comparisons.getByText(/% similarity/)).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await comparisons.getByRole('link', { name: 'Test country' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Test country');
});

test('Hindu nationalism shows Right, Modi and sourced Hindu eligibility', async ({ page }) => {
  await page.goto('./#/ideologies/hindu-nationalism');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hindu nationalism');
  await expect(page.locator('header').getByText('Right', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /Narendra Modi.*Selected representative/ })).toHaveAttribute('href', '#/personalities/narendra-modi');
  await expect(page.getByRole('region', { name: 'Religion assessment' })).toContainText('Hinduism');
  await expect(page.getByRole('region', { name: 'Religion assessment' })).toContainText('Educated assumption:');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('country filters combine with search and clear together', async ({ page }) => {
  const profiles = [profileFixture('country', 'test-republic'), profileFixture('country', 'test-monarchy')];
  profiles[0].metadata.name = 'Test republic';
  profiles[0].metadata.category = 'Republic';
  profiles[1].metadata.name = 'Test monarchy';
  profiles[1].metadata.category = 'Monarchy';
  profiles[0].metadata.ideology = 'Liberalism';
  profiles[1].metadata.ideology = 'Conservatism';
  await page.route('**/profiles/catalogue.v1.json', route => route.fulfill({ json: { schemaVersion: 1, profiles } }));
  await page.goto('./#/countries');
  await expect(page.locator('main article')).toHaveCount(2);
  await page.getByRole('combobox', { name: 'Category', exact: true }).selectOption('Republic');
  await expect(page.locator('main article')).toHaveCount(1);
  await expect(page.getByRole('combobox', { name: 'Ideology comparison' }).locator('option')).toHaveText(['All Ideologies', 'Liberalism']);
  await page.getByRole('combobox', { name: 'Ideology comparison' }).selectOption('Liberalism');
  await page.getByRole('searchbox').fill('no such country');
  await expect(page.locator('main article')).toHaveCount(0);
  await expect(page.getByText('No profiles match your filters.', { exact: false })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Category', exact: true })).toHaveValue('Republic');
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('main article')).toHaveCount(2);
  await expect(page.getByRole('searchbox')).toHaveValue('');
  await expect(page.getByRole('combobox', { name: 'Category', exact: true })).toHaveValue('');
  await expect(page.getByRole('combobox', { name: 'Ideology comparison' })).toHaveValue('');
});
