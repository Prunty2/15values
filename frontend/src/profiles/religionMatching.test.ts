import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { matchResultIdeology, matchResultProfiles, closestIdeology } from './ideologyMatching';
import { religionEligible, religionOptions } from '../quiz/religion';
import type { ReligiousIdentity } from '../quiz/religion';
import type { Profile } from './types';
import { profileFixture } from '../../tests/fixtures/profile';
import { parseCatalogue } from './catalogueData';
const faith = (kind: Profile['catalogue'], id: string, value: ReligiousIdentity, percent = 50): Profile => ({ ...profileFixture(kind, id), religion: { value, basis: 'direct', rationale: 'Test identity', sources: [{ title: 'Evidence', url: 'https://example.org/identity' }] }, scores: profileFixture(kind, id).scores.map(s => ({ ...s, leftPercent: percent, rightPercent: 100 - percent })) });
describe('religion eligibility without changing distance', () => {
  it('filters result countries by displayed ideology, rather than the respondent’s identity', () => {
    const person = faith('personality', 'subject', 'christian');
    const result = { scores: person.scores, axesVersion: person.axesVersion, questionBankVersion: person.questionBankVersion, scoringVersion: person.scoringVersion, religiousIdentity: 'christian' as const };
    const country = (id: string, value: ReligiousIdentity, percent: number) => ({ ...faith('country', id, 'none', percent), countryReligion: { eligibleReligions: [value], populationShares: { [value]: 60 }, sourceYear: 2020, rationale: 'Country context', sources: [{ title: 'Evidence', url: 'https://example.org' }] } });
    const india = country('india', 'hindu', 50);
    const christianCountry = country('christian-country', 'christian', 60);
    const religious = faith('ideology', 'christian-accelerationism', 'christian');
    const general = faith('ideology', 'conservatism', 'none');
    const countries = [india, christianCountry, profileFixture('country', 'missing')];
    expect(matchResultProfiles(result, countries, 'country', [religious])?.profiles.map(p => p.id)).toEqual(['christian-country']);
    expect(matchResultProfiles(result, countries, 'country', [general])?.profiles.map(p => p.id)).toContain('india');
    expect(matchResultProfiles(result, countries, 'country', [general, religious])?.profiles.map(p => p.id)).toEqual(['christian-country']);
    expect(matchResultProfiles(result, [india], 'country', [religious])).toBeNull();
    expect(matchResultProfiles(result, countries, 'country', [religious])?.meanAbsoluteDistance).toBe(10);
    expect(result.scores.every(s => s.leftPercent === 50)).toBe(true);
  });
  it.each(['hindu', 'muslim', 'christian'] as const)('requires matching identity for %s ideologies, and never forces a match', value => {
    const religious = faith('ideology', 'religious', value), general = faith('ideology', 'general', 'none', 55);
    for (const option of religionOptions) {
      const result = { ...faith('personality', 'subject', option.value), religiousIdentity: option.value };
      expect(matchResultIdeology(result, [general, religious])?.ideologies[0].id).toBe(option.value === value ? 'religious' : 'general');
      expect(result.scores.every(s => s.leftPercent === 50)).toBe(true);
    }
    expect(matchResultIdeology(faith('personality', 'subject', value, 55), [religious, general])?.ideologies[0].id).toBe('general');
    expect(matchResultIdeology(profileFixture('personality', 'legacy'), [religious, general])?.ideologies[0].id).toBe('general');
  });
  it('excludes Hindu ideologies for a Christian country in both directions', () => {
    const country = { ...faith('country', 'united-states', 'christian'), countryReligion: { eligibleReligions: ['christian'] as ReligiousIdentity[], populationShares: { christian: 64 }, sourceYear: 2020, rationale: 'Country context', sources: [{ title: 'Evidence', url: 'https://example.org' }] } };
    const hindu = faith('ideology', 'hindu-nationalism', 'hindu');
    const general = faith('ideology', 'conservatism', 'none', 55);
    expect(closestIdeology(country, [hindu, general])?.ideologies[0].id).toBe('conservatism');
    expect(matchResultProfiles(hindu, [country], 'country')).toBeNull();
  });
  it('allows mixed country contexts, general alternatives, and tied eligible matches', () => {
    const country = { ...faith('country', 'mixed', 'none'), countryReligion: { eligibleReligions: ['christian', 'muslim'] as ReligiousIdentity[], populationShares: { christian: 45, muslim: 45 }, sourceYear: 2020, rationale: 'Mixed country', sources: [{ title: 'Evidence', url: 'https://example.org' }] } };
    const profiles = [faith('ideology', 'christian', 'christian'), faith('ideology', 'muslim', 'muslim'), faith('ideology', 'hindu', 'hindu'), faith('ideology', 'general', 'none')];
    expect(closestIdeology(country, profiles)?.ideologies.map(p => p.id)).toEqual(['christian', 'general', 'muslim']);
    expect(closestIdeology(profileFixture('country', 'missing'), profiles)?.ideologies.map(p => p.id)).toEqual(['general']);
    expect(closestIdeology(country, profiles.map(p => ({ ...p, questionBankVersion: '1.0.0' })))).toBeNull();
    expect(country.scores.every(s => s.leftPercent === 50)).toBe(true);
    for (const identity of religionOptions) {
      const candidate = faith('ideology', 'candidate', identity.value);
      const eligible = identity.value === 'none' || country.countryReligion.eligibleReligions.includes(identity.value);
      expect(!!closestIdeology(country, [candidate]), identity.value).toBe(eligible);
      expect(!!matchResultProfiles(candidate, [country], 'country'), identity.value).toBe(eligible);
    }
  });
  it('filters a religious ideology’s nearest personalities', () => {
    const hindu = faith('ideology', 'hindu-nationalism', 'hindu');
    const christian = faith('personality', 'rubio', 'christian');
    const modi = faith('personality', 'modi', 'hindu', 60);
    expect(matchResultProfiles(hindu, [christian, modi], 'personality')?.profiles[0].id).toBe('modi');
    expect(matchResultProfiles(faith('ideology', 'conservatism', 'none'), [christian, modi], 'personality')?.profiles[0].id).toBe('rubio');
  });
});
it('checks every existing personality and ideology answer, representative, and computed match', () => {
  const profiles = parseCatalogue(JSON.parse(readFileSync(new URL('../../public/profiles/catalogue.v1.json', import.meta.url), 'utf8')));
  const people = profiles.filter(p => p.catalogue === 'personality');
  const ideologies = profiles.filter(p => p.catalogue === 'ideology');
  expect(people.length).toBeGreaterThan(100);
  expect(ideologies.length).toBeGreaterThan(50);
  for (const p of [...people, ...ideologies]) expect(p.religion, p.id).toBeDefined();
  for (const person of people) for (const match of closestIdeology(person, profiles)?.ideologies ?? []) {
    const ideology = ideologies.find(p => p.id === match.id)!;
    expect(religionEligible(ideology.religion?.value, person.religion?.value), person.id + ' -> ' + ideology.id).toBe(true);
  }
  for (const country of profiles.filter(p => p.catalogue === 'country')) {
    expect(country.countryReligion, country.id).toBeDefined();
    for (const match of closestIdeology(country, profiles)?.ideologies ?? []) {
      const requirement = ideologies.find(p => p.id === match.id)!.religion?.value;
      expect(!requirement || requirement === 'none' || country.countryReligion!.eligibleReligions.includes(requirement), country.id + ' -> ' + match.id).toBe(true);
    }
  }
  const usa = profiles.find(p => p.catalogue === 'country' && p.id === 'united-states')!;
  expect(usa.countryReligion?.eligibleReligions).toEqual(['christian']);
  expect(usa.closestIdeology?.ideologies.map(p => p.id)).not.toContain('hindu-nationalism');
  for (const ideology of ideologies) for (const country of matchResultProfiles(ideology, profiles, 'country')?.profiles ?? []) {
    const requirement = ideology.religion?.value;
    expect(!requirement || requirement === 'none' || country.countryReligion!.eligibleReligions.includes(requirement), ideology.id + ' -> ' + country.id).toBe(true);
  }
  expect(ideologies.find(p => p.id === 'hindu-nationalism')?.representativePersonalityId).toBe('narendra-modi');
  expect(people.find(p => p.id === 'narendra-modi')?.religion?.value).toBe('hindu');
  expect(people.find(p => p.id === 'marco-rubio')?.religion?.value).toBe('christian');
});
