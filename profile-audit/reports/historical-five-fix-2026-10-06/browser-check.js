async (page) => {
  const base = 'http://127.0.0.1:5176/';
  const report = '/Users/liam/Documents/GitHub/15values/profile-audit/reports/historical-five-fix-2026-10-06/';
  const fixes = [
    ['first-french-empire', 'First French Empire', 'bonapartism', 'Bonapartism'],
    ['japanese-empire', 'Japanese Empire', 'japanese-imperial-ultranationalism', 'Japanese Imperial Ultranationalism'],
    ['dutch-republic', 'Dutch Republic', 'dutch-commercial-republicanism', 'Dutch Commercial Republicanism'],
    ['east-germany', 'East Germany', 'marxism-leninism', 'Marxism–Leninism'],
    ['yugoslavia', 'Yugoslavia', 'titoism', 'Titoism'],
  ];
  const checks = [];
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const [id, name, ideologyId, ideologyName] of fixes) {
      await page.goto(base + '#/countries/' + id);
      await page.getByRole('heading', { name, exact: true, level: 1 }).waitFor();
      const comparison = page.getByRole('region', { name: 'Historical ideology comparison', exact: true });
      const link = comparison.getByRole('link', { name: ideologyName, exact: true });
      await link.waitFor();
      if (await link.getAttribute('href') !== '#/ideologies/' + ideologyId) throw Error('Wrong comparison link: ' + id);
      if (!/\d+\.\d% similarity/.test(await comparison.innerText())) throw Error('Missing calculated similarity: ' + id);
      if (await page.locator('main [role="img"]').count() !== 15) throw Error('Missing axis rows: ' + id);
      await page.locator('main header figure img').evaluate(img => img.decode());
      if (await page.getByText('Historical sources', { exact: true }).count()) throw Error('Removed disclosure returned');
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw Error('Horizontal overflow: ' + id);
      await page.getByText('Sources and assessment', { exact: true }).click();
      const download = page.getByRole('link', { name: 'Download the full assessment', exact: true });
      const href = await download.getAttribute('href');
      const response = await page.request.get(new URL(href, base).href);
      const audit = await response.json();
      if (audit.axes.flatMap(axis => axis.answers).length !== 240) throw Error('Invalid downloadable audit: ' + id);
      checks.push({ width, id, ideologyId, rows: 15, downloadedAnswers: 240, flag: 'decoded', overflow: false });
      if (id === 'first-french-empire' || id === 'japanese-empire') await page.locator('main header').screenshot({ path: report + id + '-' + width + '.png' });
    }
    for (const [id, name] of fixes.slice(0, 3).map(([, , id, name]) => [id, name])) {
      await page.goto(base + '#/ideologies/' + id);
      await page.getByRole('heading', { name, exact: true, level: 1 }).waitFor();
      if (await page.locator('main [role="img"]').count() < 15) throw Error('Missing doctrine axes: ' + id);
      await page.getByText('No religious prerequisite — available to every religious identity.', { exact: true }).waitFor();
      await page.getByText('Sources and assessment', { exact: true }).click();
      const href = await page.getByRole('link', { name: 'Download the full assessment', exact: true }).getAttribute('href');
      const response = await page.request.get(new URL(href, base).href);
      const audit = await response.json();
      if (audit.axes.flatMap(axis => axis.answers).length !== 240 || audit.revision !== 1) throw Error('Incomplete doctrine: ' + id);
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw Error('Doctrine overflow: ' + id);
      checks.push({ width, id, downloadedAnswers: 240, revision: 1, overflow: false });
    }
    await page.goto(base + '#/countries');
    await page.getByRole('heading', { name: 'Countries', exact: true, level: 1 }).waitFor();
    await page.getByRole('link', { name: 'First French Empire', exact: true }).waitFor();
    for (const [, name, , ideologyName] of fixes) {
      const card = page.getByRole('article').filter({ has: page.getByRole('link', { name, exact: true }) });
      await card.getByLabel('Historical ideology: ' + ideologyName, { exact: true }).waitFor();
    }
    const search = page.getByRole('searchbox');
    await search.fill('Bonapartism');
    await page.getByRole('link', { name: 'First French Empire', exact: true }).waitFor();
    checks.push({ width, countryCards: 5, historicalIdeologySearch: 'passed' });
  }
  return checks;
}
