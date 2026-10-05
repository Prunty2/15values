import { expect, it } from 'vitest';
import { profileFixture } from '../../tests/fixtures/profile';
import { politicalLeanings, similarPersonalities } from './profileComparisons';

it('excludes self, withdrawn and incompatible people and retains closest ties', () => {
  const subject = profileFixture('personality', 'subject');
  const a = profileFixture('personality', 'a'), b = profileFixture('personality', 'b');
  a.scores.reverse();
  const old = { ...a, id: 'old', scoringVersion: 'old' };
  const withdrawn = { ...a, id: 'withdrawn', scores: [], withdrawal: { date: '2026-10-05', reason: 'Withdrawn' } };
  const candidates = [subject, b, a, old, withdrawn, profileFixture('ideology', 'ideology')];
  expect(similarPersonalities(subject, candidates).map(item => item.profile.id)).toEqual(['a', 'b']);
  expect(similarPersonalities(subject, [subject, old, withdrawn])).toEqual([]);
  expect(similarPersonalities({ ...subject, withdrawal: withdrawn.withdrawal }, candidates)).toEqual([]);
  b.scores[0].leftPercent += 0.01;
  b.scores[0].rightPercent -= 0.01;
  expect(similarPersonalities(subject, candidates).map(item => item.profile.id)).toEqual(['a']);
});

it('derives leaning from closest ideologies rather than the person and falls back to catalogue groups', () => {
  const ideology = profileFixture('ideology', 'social-democracy');
  ideology.metadata.politicalLeaning = undefined;
  expect(politicalLeanings(ideology, [ideology])).toEqual(['Left']);
  const subject = profileFixture('personality', 'subject');
  subject.metadata.politicalLeaning = 'Unrelated label';
  subject.closestIdeology = { method: 'equal-axis-mae-v1', meanAbsoluteDistance: 0, ideologies: [{ id: ideology.id, revision: ideology.revision, name: ideology.metadata.name }] };
  expect(politicalLeanings(subject, [ideology])).toEqual(['Left']);
  ideology.metadata.politicalLeaning = 'Centre-left';
  expect(politicalLeanings(subject, [ideology])).toEqual(['Centre-left']);
  expect(politicalLeanings(subject, [])).toEqual([]);
});
