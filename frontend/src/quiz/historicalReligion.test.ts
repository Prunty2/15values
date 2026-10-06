import { expect, it } from 'vitest';
import { countryReligionEligible, isCountryReligionAssessment } from './religion';

it('accepts historical population evidence while retaining sourced-share eligibility', () => {
  const assessment = {
    eligibleReligions: ['christian'] as const,
    populationShares: { christian: 99.8 },
    sourceYear: 1770,
    rationale: 'Dated historical census summary, distinct from state religious policy.',
    sources: [{ title: 'Historical population evidence', url: 'https://example.org/census' }],
  };
  expect(isCountryReligionAssessment(assessment)).toBe(true);
  expect(isCountryReligionAssessment({ ...assessment, sourceYear: 0 })).toBe(false);
  expect(isCountryReligionAssessment({ ...assessment, sourceYear: 1770.5 })).toBe(false);
  expect(isCountryReligionAssessment({ ...assessment, populationShares: { christian: 19.9 } })).toBe(false);
  expect(isCountryReligionAssessment({ ...assessment, sources: [] })).toBe(false);
  const missing = { ...assessment, eligibleReligions: [], populationShares: {} };
  expect(isCountryReligionAssessment(missing)).toBe(true);
  expect(countryReligionEligible('christian', missing)).toBe(false);
  expect(countryReligionEligible(undefined, missing)).toBe(true);
});
