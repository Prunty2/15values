import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseCatalogue } from './catalogueData';
import { matchResultIdeology } from './ideologyMatching';
import { historicalIdeologyComparison, validHistoricalContext } from './historicalContext';
import { similarity } from './audit';
import { profileTagsForKind } from './profileTags';

const catalogue = () => JSON.parse(readFileSync(new URL('../../public/profiles/catalogue.v1.json', import.meta.url), 'utf8'));

describe('historical descriptions and numerical comparisons', () => {
  it('gives the five reviewed states sourced historical comparisons with computed similarity', () => {
    const profiles = parseCatalogue(catalogue());
    const references = {
      'first-french-empire': 'bonapartism',
      'japanese-empire': 'ultranationalism',
      'dutch-republic': 'dutch-commercial-republicanism',
      'east-germany': 'marxism-leninism',
      yugoslavia: 'titoism',
    };
    for (const [id, ideologyId] of Object.entries(references)) {
      const profile = profiles.find(candidate => candidate.id === id)!;
      const comparison = historicalIdeologyComparison(profile, profiles)!;
      expect(comparison.ideology.id).toBe(ideologyId);
      expect(comparison.similarity).toBe(similarity(profile.scores, comparison.ideology.scores));
      expect(profileTagsForKind(profile, 'ideology')).toEqual([comparison.ideology.metadata.name]);
      expect(profile.closestIdeology).toEqual(matchResultIdeology(profile, profiles));
    }
    expect(profiles.filter(profile => profile.historicalContext?.ideology)).toHaveLength(5);
  });

  it('rejects stale, incompatible, ineligible or missing historical ideology references', () => {
    const profiles = parseCatalogue(catalogue());
    const profile = profiles.find(candidate => candidate.id === 'east-germany')!;
    const doctrine = profiles.find(candidate => candidate.id === 'marxism-leninism')!;
    expect(historicalIdeologyComparison(profile, profiles.filter(candidate => candidate !== doctrine))).toBeNull();
    for (const changed of [
      { ...doctrine, revision: doctrine.revision + 1 },
      { ...doctrine, questionBankVersion: '3.0.0' },
      { ...doctrine, metadata: { ...doctrine.metadata, name: 'Different doctrine' } },
      { ...doctrine, religion: { ...doctrine.religion!, value: 'hindu' as const } },
    ]) expect(historicalIdeologyComparison(profile, profiles.map(candidate => candidate === doctrine ? changed : candidate))).toBeNull();
    expect(historicalIdeologyComparison({ ...profile, selection: undefined }, profiles)).toBeNull();
    const raw = catalogue();
    raw.profiles.find((entry: { id: string }) => entry.id === 'east-germany').historicalContext.ideology.revision++;
    expect(() => parseCatalogue(raw)).toThrow('Invalid historical ideology reference');
  });
  it('gives every historical country sourced, period-specific context', () => {
    const profiles = parseCatalogue(catalogue());
    const historical = profiles.filter(profile => profile.catalogue === 'country' && profile.metadata.historical);
    expect(historical).toHaveLength(20);
    for (const profile of historical) expect(validHistoricalContext(profile.historicalContext, profile), profile.id).toBe(true);
    expect(historical.find(profile => profile.id === 'first-french-empire')!.historicalContext!.label).toBe('Napoleonic imperial rule');
    expect(historical.find(profile => profile.id === 'east-germany')!.historicalContext!.label).toBe('Marxism–Leninism');
    expect(historical.find(profile => profile.id === 'yugoslavia')!.historicalContext!.label).toBe('Titoism and self-management socialism');
    expect(historical.find(profile => profile.id === 'japanese-empire')!.historicalContext!.label).toBe('Emperor-centred ultranationalism');
  });

  it('does not alter equal-axis matches when a historical description is present', () => {
    const profiles = parseCatalogue(catalogue());
    for (const profile of profiles.filter(profile => profile.historicalContext)) {
      const { historicalContext: _context, ...withoutContext } = profile;
      expect(matchResultIdeology(profile, profiles)).toEqual(matchResultIdeology(withoutContext, profiles));
      expect(profile.closestIdeology).toEqual(matchResultIdeology(profile, profiles));
    }
  });

  it('rejects descriptions attached to the wrong period, revision or catalogue', () => {
    const profile = parseCatalogue(catalogue()).find(profile => profile.id === 'first-french-empire')!;
    expect(validHistoricalContext({ ...profile.historicalContext, period: '1933–1945' }, profile)).toBe(false);
    expect(validHistoricalContext({ ...profile.historicalContext, assessmentRevision: profile.revision + 1 }, profile)).toBe(false);
    expect(validHistoricalContext(profile.historicalContext, { ...profile, catalogue: 'personality' })).toBe(false);
    const raw = catalogue();
    raw.profiles.find((entry: { id: string }) => entry.id === profile.id).historicalContext.sources = [];
    expect(() => parseCatalogue(raw)).toThrow('Invalid historical political context');
  });
});
