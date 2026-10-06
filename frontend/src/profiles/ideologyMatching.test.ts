import { describe, expect, it } from 'vitest';
import { closestIdeology, ideologyComparisonDetails, matchResultIdeology, matchResultProfiles, withIdeologyMatches } from './ideologyMatching';
import { parseCatalogue } from './catalogueData';
import { profileFixture } from '../../tests/fixtures/profile';

const profile = (kind: 'ideology' | 'country' | 'personality', id: string, percent: number) => {
  const result = profileFixture(kind, id);
  result.scores = result.scores.map(score => ({ ...score, leftPercent: percent, rightPercent: 100 - percent }));
  return result;
};
describe('closest ideology', () => {
  it.each(['country', 'personality'] as const)('matches %s by scores, independent of labels and axis order', kind => {
    const subject = profile(kind, 'subject', 60);
    subject.metadata.ideology = 'An unrelated label';
    subject.scores.reverse();
    const near = profile('ideology', 'near', 65), far = profile('ideology', 'far', 20);
    expect(closestIdeology(subject, [far, near])?.ideologies[0].id).toBe('near');
    expect(closestIdeology(subject, [far, near])?.meanAbsoluteDistance).toBe(5);
  });
  it('keeps exact ties and chooses using unrounded distances', () => {
    const subject = profile('personality', 'subject', 50);
    const a = profile('ideology', 'a', 40), b = profile('ideology', 'b', 60);
    expect(closestIdeology(subject, [b, a])?.ideologies.map(value => value.id)).toEqual(['a', 'b']);
    b.scores[0].leftPercent = 59.9; b.scores[0].rightPercent = 40.1;
    expect(closestIdeology(subject, [a, b])?.ideologies.map(value => value.id)).toEqual(['b']);
  });
  it('weights every axis equally and handles opposite placements', () => {
    const subject = profile('country', 'subject', 0), candidate = profile('ideology', 'candidate', 0);
    candidate.scores[0].leftPercent = 100; candidate.scores[0].rightPercent = 0;
    expect(closestIdeology(subject, [candidate])?.meanAbsoluteDistance).toBeCloseTo(100 / 15);
    expect(closestIdeology(subject, [profile('ideology', 'opposite', 100)])?.meanAbsoluteDistance).toBe(100);
    const details = ideologyComparisonDetails(subject, [candidate, profile('ideology', 'opposite', 100)])!;
    expect(details.neighbours[0].gaps[0].gap).toBe(100);
    expect(details.next?.margin).toBeCloseTo(100 - 100 / 15);
    subject.scores.reverse();
    expect(ideologyComparisonDetails(subject, [candidate])?.neighbours[0].gaps[0].gap).toBe(100);
  });
  it('reports all tied neighbours and the first genuinely more distant candidate', () => {
    const subject = profile('personality', 'subject', 50);
    const a = profile('ideology', 'a', 40), b = profile('ideology', 'b', 60), c = profile('ideology', 'c', 60.1);
    expect(ideologyComparisonDetails(subject, [c, b, a])?.neighbours.map(item => item.profile.id)).toEqual(['a', 'b']);
    expect(ideologyComparisonDetails(subject, [c, b, a])?.next?.margin).toBeCloseTo(0.1);
    expect(ideologyComparisonDetails(subject, [a, b])?.next).toBeNull();
    expect(ideologyComparisonDetails(subject, [{ ...c, scoringVersion: 'old' }])).toBeNull();
  });
  it('excludes withdrawn and incompatible candidates and handles unavailable matches', () => {
    const subject = profile('personality', 'subject', 50), candidate = profile('ideology', 'candidate', 50);
    expect(closestIdeology(subject, [])).toBeNull();
    expect(closestIdeology(subject, [{ ...candidate, scoringVersion: 'old' }])).toBeNull();
    expect(closestIdeology(subject, [{ ...candidate, scores: [], withdrawal: { date: '2026-10-05', reason: 'Withdrawn' } }])).toBeNull();
    expect(closestIdeology({ ...subject, withdrawal: { date: '2026-10-05', reason: 'Withdrawn' } }, [candidate])).toBeNull();
  });
  it('rejects stale stored matches and recalculates when candidates change', () => {
    const profiles = [profile('country', 'subject', 50), profile('ideology', 'candidate', 60)];
    const matched = withIdeologyMatches(profiles);
    expect(parseCatalogue({ schemaVersion: 1, profiles: matched })).toEqual(matched);
    matched[1].scores[0].leftPercent = 61; matched[1].scores[0].rightPercent = 39;
    expect(() => parseCatalogue({ schemaVersion: 1, profiles: matched })).toThrow('stale');
    expect(withIdeologyMatches(matched)[0].closestIdeology).not.toEqual(matched[0].closestIdeology);
  });
});

it('matches quiz results with the same distance and retains compatible ties', () => {
  const subject = profile('personality', 'subject', 50);
  const result = { scores: [...subject.scores].reverse(), axesVersion: subject.axesVersion, questionBankVersion: subject.questionBankVersion, scoringVersion: subject.scoringVersion };
  const candidates = [profile('ideology', 'b', 60), profile('ideology', 'a', 40)];
  expect(matchResultIdeology(result, candidates)).toEqual(closestIdeology(subject, candidates));
  expect(matchResultIdeology({ ...result, scoringVersion: '1.0.0' }, candidates)).toBeNull();
});

it.each(['personality', 'country'] as const)('matches quiz results to %s with ties and compatible versions', kind => {
  const subject = profile('ideology', 'subject', 50);
  const a = profile(kind, 'a', 40), b = profile(kind, 'b', 60);
  const wrongKind = profile('ideology', 'exact', 50);
  const withdrawn = { ...profile(kind, 'withdrawn', 50), withdrawal: { date: '2026-10-05', reason: 'Withdrawn' } };
  expect(matchResultProfiles(subject, [b, a, wrongKind, withdrawn, { ...a, id: 'old', scoringVersion: 'old' }], kind)?.profiles.map(item => item.id)).toEqual(['a', 'b']);
  expect(matchResultProfiles(subject, [a, b], kind)?.meanAbsoluteDistance).toBe(10);
  b.scores[0].leftPercent = 59.9; b.scores[0].rightPercent = 40.1;
  expect(matchResultProfiles(subject, [a, b], kind)?.profiles.map(item => item.id)).toEqual(['b']);
  expect(matchResultProfiles({ ...subject, scoringVersion: 'old' }, [a, b], kind)).toBeNull();
  expect(matchResultProfiles(subject, [], kind)).toBeNull();
});
