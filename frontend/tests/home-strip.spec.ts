import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { profileFixture } from './fixtures/profile';

const catalogue = JSON.parse(readFileSync(new URL('../public/profiles/catalogue.v1.json', import.meta.url), 'utf8'));
const profiles = catalogue.profiles.filter((profile: { catalogue: string }) => ['ideology', 'personality'].includes(profile.catalogue));

test('home strip uses published profiles and links to both types of detail page', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  const strip = page.getByRole('region', { name: 'Explore ideologies and personalities' });
  const links = strip.getByRole('link');
  await expect(links).toHaveCount(profiles.length);
  await expect(strip.getByText('Placeholder', { exact: true })).toHaveCount(0);
  // Read the whole strip once; hundreds of protocol round trips exceeded CI's timeout.
  const cards = await links.evaluateAll(elements => elements.map(element => ({
    href: element.getAttribute('href'),
    labels: Array.from(element.querySelectorAll('small'), label => label.textContent),
    name: Array.from(element.querySelectorAll('span')).at(-1)?.textContent,
  })));
  for (const profile of profiles) {
    const route = profile.catalogue === 'ideology' ? 'ideologies' : 'personalities';
    const card = cards.find(card => card.href === '#/' + route + '/' + profile.id)!;
    expect(card.labels).toHaveLength(2);
    expect(card.labels[0]).toBe(profile.catalogue === 'ideology' ? 'Ideology' : profile.metadata.category);
    if (profile.catalogue === 'personality') {
      const leaning = profile.metadata.politicalLeaning?.replace('-', ' ').toLowerCase();
      const label = ['Far-Left', 'Left', 'Centre', 'Right', 'Far-Right', 'Libertarian', 'Religious', 'Other']
        .find(label => label.replace('-', ' ').toLowerCase() === leaning) ?? 'Unclassified';
      expect(card.labels[1]).toBe(label);
    }
    expect(card.name).toBe(profile.metadata.name.replace(/\s*\(.*\)$/, '').trim());
  }
  await expect(strip.locator('a[href="#/ideologies/american-conservatism"]').first().locator('small').last()).toHaveText('Right');
  await expect(strip.locator('a[href="#/ideologies/communism"]').first().locator('small').last()).toHaveText('Far-Left');
  for (const type of ['ideology', 'personality']) {
    const profile = profiles.filter((profile: { catalogue: string }) => profile.catalogue === type).sort((a: { metadata: { name: string } }, b: { metadata: { name: string } }) => a.metadata.name.localeCompare(b.metadata.name))[0];
    await strip.locator(`a[href="#/${type === 'ideology' ? 'ideologies' : 'personalities'}/${profile.id}"]`).first().click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(profile.metadata.name);
    await page.goto('./');
  }
});

test('home strip uses explicit personality leaning metadata and falls back when absent', async ({ page }) => {
  const labelled = profileFixture('personality', 'labelled');
  labelled.metadata.politicalLeaning = 'Far right';
  const unclassified = profileFixture('personality', 'unclassified');
  delete unclassified.metadata.politicalLeaning;
  await page.route('**/profiles/catalogue.v1.json', route => route.fulfill({ json: { schemaVersion: 1, profiles: [labelled, unclassified] } }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  const strip = page.getByRole('region', { name: 'Explore ideologies and personalities' });
  await expect(strip.locator('a[href="#/personalities/labelled"]').first().locator('small').last()).toHaveText('Far-Right');
  await expect(strip.locator('a[href="#/personalities/unclassified"]').first().locator('small').last()).toHaveText('Unclassified');
});

test('strip loops evenly, pauses, resumes and stops for keyboard interaction', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('./');
  const strip = page.getByRole('region', { name: 'Explore ideologies and personalities' });
  const track = strip.locator('[data-paused]');
  await expect(strip.getByRole('link')).toHaveCount(profiles.length);
  const widths = await track.locator('ul').evaluateAll(groups => groups.map(group => group.getBoundingClientRect().width));
  expect(widths[0]).toBeCloseTo(widths[1], 1);
  expect(await track.evaluate(element => element.getBoundingClientRect().width)).toBeCloseTo(widths[0] * 2, 0);
  const transform = () => track.evaluate(element => getComputedStyle(element).transform);
  const initial = await transform();
  await expect.poll(transform).not.toBe(initial);
  await strip.getByRole('button', { name: 'Pause scrolling' }).click();
  await expect(track).toHaveCSS('animation-play-state', 'paused');
  const paused = await transform();
  await page.waitForTimeout(150);
  expect(await transform()).toBe(paused);
  await strip.getByRole('button', { name: 'Resume scrolling' }).press('Enter');
  await expect(strip.getByRole('button', { name: 'Pause scrolling' })).toBeFocused();
  await expect(track).toHaveCSS('animation-play-state', 'running');
  await expect.poll(transform).not.toBe(paused);
  await strip.getByRole('link').first().focus();
  await expect(track).toHaveCSS('animation-play-state', 'paused');
  const portrait = strip.locator('ul').first().locator('img').first();
  await portrait.scrollIntoViewIfNeeded();
  await expect.poll(() => portrait.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
});

test('reduced motion allows manual scrolling without duplicate links or page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  const strip = page.getByRole('region', { name: 'Explore ideologies and personalities' });
  await expect(strip.getByRole('link')).toHaveCount(profiles.length);
  const track = strip.locator('[data-paused]');
  await expect(track).toHaveCSS('animation-name', 'none');
  await expect(strip.getByRole('button')).toHaveCount(0);
  const window = track.locator('..');
  await window.evaluate(element => { element.scrollLeft = 300; });
  expect(await window.evaluate(element => element.scrollLeft)).toBe(300);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

for (const mode of ['empty', 'unavailable', 'invalid']) {
  test(`home offers catalogue links when profile data is ${mode}`, async ({ page }) => {
    await page.route('**/profiles/catalogue.v1.json', route => route.fulfill(mode === 'unavailable' ? { status: 503 } : { json: mode === 'empty' ? { schemaVersion: 1, profiles: [] } : { schemaVersion: 99, profiles: [] } }));
    await page.goto('./');
    const strip = page.getByRole('region', { name: 'Explore ideologies and personalities' });
    await expect(strip.getByRole('link', { name: 'Explore ideologies' })).toHaveAttribute('href', '#/ideologies');
    await expect(strip.getByRole('link', { name: 'Explore personalities' })).toHaveAttribute('href', '#/personalities');
    await expect(strip.getByRole('button')).toHaveCount(0);
  });
}
