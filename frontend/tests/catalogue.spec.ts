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
  if (kind === 'ideology') await page.locator('summary').filter({ hasText: 'Sources and assessment' }).click();
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
    await page.getByRole('searchbox').fill('missing subject');
    await expect(page.getByText('No profiles match your search.')).toBeVisible();
    await page.getByRole('searchbox').fill('');
    await page.getByRole('link', { name: `Test ${kind}`, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#/${path}/${id}$`));
    await expect(page).toHaveTitle(`Test ${kind} — 15 Values`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Test ${kind}`);
    if (kind === 'ideology') {
      const placeholders = page.getByRole('complementary', { name: 'Reference placeholders' });
      await expect(placeholders.getByRole('heading', { name: 'Key figure', exact: true })).toBeVisible();
      await expect(placeholders.getByRole('heading', { name: 'Reference country', exact: true })).toBeVisible();
      await expect(placeholders.getByText('To be added', { exact: true })).toHaveCount(2);
      await expect(placeholders.getByRole('img')).toHaveCount(0);
      await expect(placeholders.getByRole('link')).toHaveCount(0);
      await expect(page.locator('main blockquote')).toHaveText(profiles[0].metadata.phrase!);
    }
    await expect(page.locator('main article')).toHaveCount(15);
    if (kind === 'ideology') await page.locator('summary').filter({ hasText: 'Sources and assessment' }).click();
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
    if (kind === 'personality') await page.screenshot({ path: testInfo.outputPath('profile-detail.png'), fullPage: true });
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

test('ideology groups combine with search and expose all 15 placements', async ({ page }) => {
  const profiles = [profileFixture('ideology', 'communism'), profileFixture('ideology', 'marxism'), profileFixture('ideology', 'liberalism')];
  profiles[0].metadata.name = 'Communism fixture';
  profiles[1].metadata.name = 'Marxism fixture';
  profiles[2].metadata.name = 'Liberalism fixture';
  await page.route('**/profiles/catalogue.v1.json', route => route.fulfill({ json: { schemaVersion: 1, profiles } }));
  await page.goto('./#/ideologies');
  await expect(page.locator('main article')).toHaveCount(3);
  await page.getByRole('button', { name: 'Far-Left 2', exact: true }).last().click();
  await expect(page.getByRole('status')).toHaveText('Showing 2 profiles · Far-Left');
  await page.getByRole('searchbox').fill('marxism');
  await expect(page.locator('main article')).toHaveCount(1);
  const placements = page.locator('main article [tabindex="0"]');
  await expect(placements).toHaveCount(15);
  await placements.first().focus();
  await expect(page.getByRole('tooltip').first()).toBeVisible();
  await expect(page.getByRole('tooltip').first()).toContainText('Democracy');
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('main article')).toHaveCount(3);
  await expect(page.getByRole('searchbox')).toHaveValue('');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
