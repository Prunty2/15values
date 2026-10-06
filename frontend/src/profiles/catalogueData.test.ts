import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { parseCatalogue } from './catalogueData';

it('loads the published catalogue through the browser validation boundary', () => {
  const data = JSON.parse(readFileSync(new URL('../../public/profiles/catalogue.v1.json', import.meta.url), 'utf8'));
  expect(parseCatalogue(data)).toHaveLength(data.profiles.length);
});

it('rejects unknown and mixed bank/axis versions', () => {
  const data = JSON.parse(readFileSync(new URL('../../public/profiles/catalogue.v1.json', import.meta.url), 'utf8'));
  for (const versions of [ { axesVersion: 'future' }, { questionBankVersion: 'future' }, { axesVersion: '2.0.0', questionBankVersion: '1.0.0' } ]) {
    expect(() => parseCatalogue({ ...data, profiles: [{ ...data.profiles[0], ...versions }] })).toThrow();
  }
});

it('keeps bank 3 catalogue snapshots readable after bank 4 without rewriting them', () => {
  const data = JSON.parse(readFileSync(new URL('../../../profile-audit/reports/authority-liberty-policy-2026-10-06/previous-catalogue.json', import.meta.url), 'utf8'));
  const parsed = parseCatalogue(data);
  expect(parsed).toHaveLength(data.profiles.length);
  expect(parsed.every(p => p.questionBankVersion === '3.0.0')).toBe(true);
  expect(parsed.map(p => p.scores)).toEqual(data.profiles.map((p: { scores: unknown }) => p.scores));
});
