import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const catalogue = JSON.parse(readFileSync(new URL('../public/profiles/catalogue.v1.json', import.meta.url), 'utf8'));
const profiles = catalogue.profiles.filter((profile: { catalogue: string }) => ['ideology', 'personality'].includes(profile.catalogue));

test('home strip uses published profiles and links to both types of detail page', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  const strip = page.getByRole('region', { name: 'Explore ideologies and personalities' });
  const links = strip.getByRole('link');
  await expect(links).toHaveCount(profiles.length);
  await expect(strip.getByText('Placeholder', { exact: true })).toHaveCount(0);
  for (const profile of profiles) {
    const route = profile.catalogue === 'ideology' ? 'ideologies' : 'personalities';
    const card = strip.locator(`a[href="#/${route}/${profile.id}"]`).first();
    await expect(card.locator('small')).toHaveCount(2);
    await expect(card.locator('small').first()).toHaveText(profile.catalogue === 'ideology' ? 'Ideology' : profile.metadata.category);
    await expect(card.locator('span').last()).toHaveText(profile.metadata.name.replace(/\s*\(.*\)$/, '').trim());
    await expect(card).toHaveAttribute('href', `#/${route}/${profile.id}`);
  }
  await expect(strip.locator('a[href="#/ideologies/american-conservatism"]').first().locator('small').last()).toHaveText('Right');
  await expect(strip.locator('a[href="#/ideologies/communism"]').first().locator('small').last()).toHaveText('Far-Left');
  await expect(strip.locator('a[href="#/personalities/adolf-hitler"]').first().locator('small').last()).toHaveText('Far-Right');
  for (const type of ['ideology', 'personality']) {
    const profile = profiles.filter((profile: { catalogue: string }) => profile.catalogue === type).sort((a: { metadata: { name: string } }, b: { metadata: { name: string } }) => a.metadata.name.localeCompare(b.metadata.name))[0];
    await strip.locator(`a[href="#/${type === 'ideology' ? 'ideologies' : 'personalities'}/${profile.id}"]`).first().click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(profile.metadata.name);
    await page.goto('./');
  }
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
