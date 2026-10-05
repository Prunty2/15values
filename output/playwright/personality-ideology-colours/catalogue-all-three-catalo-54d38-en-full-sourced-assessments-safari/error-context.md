# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: catalogue.spec.ts >> all three catalogues browse, search and open full sourced assessments
- Location: tests/catalogue.spec.ts:24:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Test ideology', exact: true })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: 'Test ideology', exact: true }) with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Test ideology', exact: true })

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { readFileSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
  3   | import { fileURLToPath } from 'node:url';
  4   | import { join } from 'node:path';
  5   | import { fixture, profileFixture } from './fixtures/profile';
  6   | 
  7   | const generatedFixtures = new Set<string>();
  8   | for (const [kind, route, id] of [['ideology', 'ideologies', 'communism'], ['personality', 'personalities', 'test-personality']] as const) {
  9   | test(`withdrawn ${kind} has no placements but preserves the historical assessment link`, async ({ page }) => {
  10  |   const profile = { ...profileFixture(kind, id), scores: [], withdrawal: { date: '2026-10-04', reason: 'Question-level evidence did not support the archived assessment.' } };
  11  |   await page.route('**/profiles/catalogue.v1.json', route => route.fulfill({ json: { schemaVersion: 1, profiles: [profile] } }));
  12  |   await page.goto(`./#/${route}`);
  13  |   await expect(page.getByText('Placements withdrawn · Evidence review required')).toBeVisible();
  14  |   await expect(page.locator('main article [tabindex="0"]')).toHaveCount(0);
  15  |   await page.goto(`./#/${route}/${id}`);
  16  |   await expect(page.getByRole('heading', { name: 'Placements withdrawn' })).toBeVisible();
  17  |   await expect(page.locator('main article')).toHaveCount(0);
  18  |   if (kind === 'ideology') await page.locator('summary').filter({ hasText: 'Sources and assessment' }).click();
  19  |   await expect(page.getByRole('link', { name: 'Download the withdrawn assessment' })).toHaveAttribute('href', /\/1.json$/);
  20  | });
  21  | }
  22  | test.afterEach(() => { for (const path of generatedFixtures) rmSync(path, { recursive: true, force: true }); generatedFixtures.clear(); });
  23  | 
  24  | test('all three catalogues browse, search and open full sourced assessments', async ({ page }, testInfo) => {
  25  |   await page.emulateMedia({ reducedMotion: 'reduce' });
  26  |   const id = `test-profile-${testInfo.project.name}`;
  27  |   const profiles = (['ideology', 'country', 'personality'] as const).map(kind => profileFixture(kind, id));
  28  |   // Native browser downloads bypass route interception: serve temporary files from
  29  |   // the ignored build output, never source archives or public catalogue data.
  30  |   for (const profile of profiles) {
  31  |     const directory = fileURLToPath(new URL(`../dist/profiles/audits/${profile.catalogue}/${id}/`, import.meta.url));
  32  |     mkdirSync(directory, { recursive: true }); generatedFixtures.add(directory);
  33  |     writeFileSync(join(directory, '1.json'), JSON.stringify(fixture(profile.catalogue, id)));
  34  |   }
  35  |   await page.route('**/profiles/catalogue.v1.json', route => route.fulfill({ json: { schemaVersion: 1, profiles } }));
  36  |   // Reuse an existing local asset for rendering only; no fixture enters public/.
  37  |   await page.route('**/profiles/images/*', route => route.fulfill({ path: fileURLToPath(new URL('../public/social-preview.png', import.meta.url)), contentType: 'image/png' }));
  38  |   for (const [path, kind] of [['ideologies', 'ideology'], ['countries', 'country'], ['personalities', 'personality']] as const) {
  39  |     await page.goto(`./#/${path}`);
> 40  |     await expect(page.getByRole('heading', { name: `Test ${kind}`, exact: true })).toBeVisible();
      |                                                                                    ^ Error: expect(locator).toBeVisible() failed
  41  |     if (kind === 'country') {
  42  |       const classification = page.getByRole('list', { name: 'Political classification' }).getByRole('listitem');
  43  |       await expect(classification).toHaveCount(1);
  44  |       await expect(classification.nth(0)).toHaveText('Test ideology');
  45  |       await expect(classification.nth(0)).toHaveAttribute('aria-label', 'Closest ideology: Test ideology');
  46  |       await expect(page.getByRole('list', { name: 'Profile tags' })).toHaveCount(0);
  47  |     }
  48  |     await page.getByRole('searchbox').fill('missing subject');
  49  |     await expect(page.getByText('No profiles match your search.')).toBeVisible();
  50  |     await page.getByRole('searchbox').fill('');
  51  |     await page.getByRole('link', { name: `Test ${kind}`, exact: true }).click();
  52  |     await expect(page).toHaveURL(new RegExp(`#/${path}/${id}$`));
  53  |     await expect(page).toHaveTitle(`Test ${kind} — 15 Values`);
  54  |     await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Test ${kind}`);
  55  |     if (kind === 'ideology') {
  56  |       const placeholders = page.getByRole('complementary', { name: 'Reference placeholders' });
  57  |       await expect(placeholders.getByRole('heading', { name: 'Key figure', exact: true })).toBeVisible();
  58  |       await expect(placeholders.getByRole('heading', { name: 'Reference country', exact: true })).toBeVisible();
  59  |       await expect(placeholders.getByText('To be added', { exact: true })).toHaveCount(2);
  60  |       await expect(placeholders.getByRole('img')).toHaveCount(0);
  61  |       await expect(placeholders.getByRole('link')).toHaveCount(0);
  62  |       await expect(page.locator('main blockquote')).toHaveText(profiles[0].metadata.phrase!);
  63  |     }
  64  |     if (kind === 'personality') {
  65  |       const header = page.locator('dl[aria-label="Profile comparisons"]');
  66  |       await expect(header.getByRole('link', { name: 'Test ideology', exact: true })).toHaveAttribute('href', `#/ideologies/${id}`);
  67  |     }
  68  |     if (kind !== 'ideology') {
  69  |       const comparison = page.getByRole('region', { name: 'Closest ideology', exact: true });
  70  |       await expect(comparison.getByRole('link', { name: 'Test ideology', exact: true })).toHaveAttribute('href', `#/ideologies/${id}`);
  71  |       await expect(comparison).toContainText('Average axis gap: 0.0 percentage points');
  72  |     }
  73  |     await expect(page.locator('main article')).toHaveCount(15);
  74  |     if (kind === 'ideology') await page.locator('summary').filter({ hasText: 'Sources and assessment' }).click();
  75  |     await expect(page.getByRole('link', { name: 'Test source 1', exact: true })).toHaveAttribute('href', 'https://example.org/source-1');
  76  |     const downloadPromise = page.waitForEvent('download');
  77  |     await page.getByRole('link', { name: 'Download the full assessment' }).click();
  78  |     const download = await downloadPromise;
  79  |     const audit = JSON.parse(readFileSync((await download.path())!, 'utf8'));
  80  |     expect(audit.axes.flatMap((axis: { answers: unknown[] }) => axis.answers)).toHaveLength(240);
  81  |     if (kind !== 'ideology') {
  82  |       expect(await page.getByRole('img', { name: 'Test image', exact: true }).evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  83  |       await expect(page.getByRole('link', { name: 'CC0', exact: true })).toHaveAttribute('href', 'https://creativecommons.org/publicdomain/zero/1.0/');
  84  |     }
  85  |     expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  86  |     if (kind === 'personality') await page.screenshot({ path: testInfo.outputPath('profile-detail.png'), fullPage: true });
  87  |     await page.reload();
  88  |     await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Test ${kind}`);
  89  |     await page.getByRole('link', { name: `All ${path}` }).click();
  90  |     await expect(page.getByRole('searchbox')).toBeVisible();
  91  |   }
  92  | });
  93  | 
  94  | test('catalogue failures can be retried and missing profiles have a way back', async ({ page }) => {
  95  |   let fail = true;
  96  |   await page.route('**/profiles/catalogue.v1.json', route => fail ? route.fulfill({ status: 503 }) : route.fulfill({ json: { schemaVersion: 1, profiles: [] } }));
  97  |   await page.goto('./#/countries');
  98  |   await expect(page.getByRole('alert')).toContainText('could not be loaded');
  99  |   fail = false;
  100 |   await page.getByRole('button', { name: 'Try again' }).click();
  101 |   await expect(page.getByRole('heading', { name: 'No countries added yet.' })).toBeVisible();
  102 |   await page.goto('./#/countries/missing');
  103 |   await expect(page.getByRole('heading', { name: 'Profile not found' })).toBeVisible();
  104 |   await expect(page.getByRole('link', { name: 'Back to countries' })).toHaveAttribute('href', '#/countries');
  105 | });
  106 | 
  107 | test('malformed catalogue data is not rendered as a profile', async ({ page }) => {
  108 |   const profile = profileFixture(); profile.sources[0].url = 'javascript:alert(1)';
  109 |   await page.route('**/profiles/catalogue.v1.json', route => route.fulfill({ json: { schemaVersion: 1, profiles: [profile] } }));
  110 |   await page.goto('./#/ideologies/test-profile');
  111 |   await expect(page.getByRole('alert')).toBeVisible();
  112 |   await expect(page.locator('main article')).toHaveCount(0);
  113 | });
  114 | 
  115 | test('ideology groups combine with search and show only pronounced placements', async ({ page }) => {
  116 |   const profiles = [profileFixture('ideology', 'communism'), profileFixture('ideology', 'marxism'), profileFixture('ideology', 'liberalism')];
  117 |   profiles[0].metadata.name = 'Communism fixture';
  118 |   profiles[1].metadata.name = 'Marxism fixture';
  119 |   profiles[2].metadata.name = 'Liberalism fixture';
  120 |   const percentages = [34.5, 35, 65, 65.5, 25, 75, 50, 45, 55];
  121 |   profiles[1].scores.forEach((score, index) => {
  122 |     score.leftPercent = percentages[index] ?? 50;
  123 |     score.rightPercent = 100 - score.leftPercent;
  124 |   });
  125 |   await page.route('**/profiles/catalogue.v1.json', route => route.fulfill({ json: { schemaVersion: 1, profiles } }));
  126 |   await page.goto('./#/ideologies');
  127 |   await expect(page.locator('main article')).toHaveCount(3);
  128 |   await page.getByRole('button', { name: 'Far-Left 2', exact: true }).last().click();
  129 |   await expect(page.locator('main article')).toHaveCount(2);
  130 |   await page.getByRole('searchbox').fill('marxism');
  131 |   await expect(page.locator('main article')).toHaveCount(1);
  132 |   const placements = page.locator('main article [tabindex="0"]');
  133 |   await expect(placements).toHaveCount(4);
  134 |   await placements.first().focus();
  135 |   await expect(page.getByRole('tooltip').first()).toBeVisible();
  136 |   await expect(page.getByRole('tooltip').first()).toContainText('Democracy');
  137 |   await page.getByRole('button', { name: 'Clear filters' }).click();
  138 |   await expect(page.locator('main article')).toHaveCount(3);
  139 |   await expect(page.getByRole('searchbox')).toHaveValue('');
  140 |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
```