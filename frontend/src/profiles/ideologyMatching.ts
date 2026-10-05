import { similarity } from './audit.ts';
import type { QuizResult } from '../quiz/model.ts';
import type { Profile, IdeologyMatch } from './types.ts';

/** Labels and identity never affect distance; every independent axis has equal weight. */
export function closestIdeology(subject: Profile, profiles: Profile[]): IdeologyMatch | null {
  if (subject.catalogue === 'ideology' || subject.withdrawal) return null;
  return matchResultIdeology(subject, profiles);
}

export function matchResultIdeology(subject: Pick<QuizResult, 'scores' | 'axesVersion' | 'questionBankVersion' | 'scoringVersion'>, profiles: Profile[]): IdeologyMatch | null {
  const candidates = profiles.filter(profile => profile.catalogue === 'ideology' && !profile.withdrawal &&
    profile.axesVersion === subject.axesVersion && profile.questionBankVersion === subject.questionBankVersion &&
    profile.scoringVersion === subject.scoringVersion);
  let minimum = Infinity;
  let ideologies: IdeologyMatch['ideologies'] = [];
  for (const candidate of candidates) {
    const distance = 100 - similarity(subject.scores, candidate.scores);
    if (distance < minimum - 1e-9) { minimum = distance; ideologies = []; }
    if (Math.abs(distance - minimum) <= 1e-9) ideologies.push({ id: candidate.id, revision: candidate.revision, name: candidate.metadata.name });
  }
  if (!ideologies.length) return null;
  ideologies.sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  return { method: 'equal-axis-mae-v1', meanAbsoluteDistance: minimum, ideologies };
}
export function withIdeologyMatches(profiles: Profile[]): Profile[] {
  return profiles.map(profile => profile.catalogue === 'ideology' ? profile : { ...profile, closestIdeology: closestIdeology(profile, profiles) });
}

/** Explain the numerical neighbour without turning it into a classification. */
export function ideologyComparisonDetails(subject: Pick<QuizResult, 'scores' | 'axesVersion' | 'questionBankVersion' | 'scoringVersion'>, profiles: Profile[]) {
  const match = matchResultIdeology(subject, profiles);
  if (!match) return null;
  const scores = new Map(subject.scores.map(score => [score.axisId, score.leftPercent]));
  const compatible = profiles.filter(profile => profile.catalogue === 'ideology' && !profile.withdrawal &&
    profile.axesVersion === subject.axesVersion && profile.questionBankVersion === subject.questionBankVersion && profile.scoringVersion === subject.scoringVersion);
  const ranked = compatible.map(profile => ({ profile, distance: 100 - similarity(subject.scores, profile.scores) }))
    .sort((a, b) => a.distance - b.distance || a.profile.id.localeCompare(b.profile.id));
  const next = ranked.find(candidate => candidate.distance > match.meanAbsoluteDistance + 1e-9);
  return {
    match,
    next: next ? { profile: next.profile, margin: next.distance - match.meanAbsoluteDistance } : null,
    neighbours: match.ideologies.map(ideology => {
      const profile = compatible.find(candidate => candidate.id === ideology.id)!;
      const gaps = profile.scores.map(score => ({ axisId: score.axisId, subject: scores.get(score.axisId)!, candidate: score.leftPercent,
        gap: Math.abs(scores.get(score.axisId)! - score.leftPercent) })).sort((a, b) => b.gap - a.gap || a.axisId.localeCompare(b.axisId));
      return { profile, gaps };
    }),
  };
}
