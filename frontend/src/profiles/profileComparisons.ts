import { similarity } from './audit';
import { groupFor } from './ideologyGroups';
import type { Profile } from './types';

/** Compare assessed positions only, excluding self, withdrawn and incompatible profiles. */
export function similarPersonalities(subject: Profile, profiles: Profile[]) {
  if (subject.catalogue !== 'personality' || subject.withdrawal) return [];
  const ranked = profiles.filter(candidate => candidate.catalogue === 'personality' && candidate.id !== subject.id &&
    !candidate.withdrawal && candidate.axesVersion === subject.axesVersion &&
    candidate.questionBankVersion === subject.questionBankVersion && candidate.scoringVersion === subject.scoringVersion)
    .map(profile => ({ profile, similarity: similarity(subject.scores, profile.scores) }))
    .sort((a, b) => b.similarity - a.similarity || a.profile.id.localeCompare(b.profile.id));
  return ranked.filter(candidate => Math.abs(candidate.similarity - ranked[0].similarity) <= 1e-9);
}

/** Use the ideology's recorded leaning, falling back to its established browsing group. */
export function politicalLeanings(subject: Profile, profiles: Profile[]): string[] {
  if (subject.withdrawal) return [];
  const ideologies = subject.catalogue === 'ideology' ? [subject] :
    (subject.closestIdeology?.ideologies ?? []).flatMap(match =>
      profiles.filter(profile => profile.catalogue === 'ideology' && profile.id === match.id && profile.revision === match.revision));
  return [...new Set(ideologies.map(profile => profile.metadata.politicalLeaning ?? groupFor(profile)))];
}
