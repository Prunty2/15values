import type { Profile } from './types.ts';
import { similarity } from './audit.ts';
import { countryReligionEligible } from '../quiz/religion.ts';
import { selectionEligible } from '../quiz/selection.ts';

/** Historical descriptions and reviewed doctrinal references do not alter scores or nearest matches. */
export function validHistoricalContext(value: unknown, profile: Pick<Profile, 'catalogue' | 'revision' | 'metadata'>): value is NonNullable<Profile['historicalContext']> {
  const context = value as NonNullable<Profile['historicalContext']> | null;
  const text = (value: unknown) => typeof value === 'string' && !!value.trim();
  const url = (value: unknown) => { try { return typeof value === 'string' && ['https:', 'http:'].includes(new URL(value).protocol); } catch { return false; } };
  return !!context && profile.catalogue === 'country' && profile.metadata.historical === true &&
    Number.isSafeInteger(context.revision) && context.revision > 0 && context.assessmentRevision === profile.revision &&
    context.period === profile.metadata.period && text(context.label) && text(context.rationale) &&
    (context.ideology === undefined || (!!context.ideology && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(context.ideology.id) &&
      Number.isSafeInteger(context.ideology.revision) && context.ideology.revision > 0 && text(context.ideology.name) && text(context.ideology.rationale))) &&
    Array.isArray(context.sources) && context.sources.length > 0 && context.sources.every(source =>
      !!source && text(source.id) && text(source.title) && text(source.publisher) && url(source.url) &&
      /^\d{4}-\d{2}-\d{2}$/.test(source.accessed) && (source.date === 'undated' || /^\d{4}-\d{2}-\d{2}$/.test(source.date)));
}

/** A sourced historical comparison, explicitly separate from the nearest numerical neighbour. */
export function historicalIdeologyComparison(profile: Profile, profiles: Profile[]) {
  const reference = profile.historicalContext?.ideology;
  if (!reference || profile.withdrawal || !validHistoricalContext(profile.historicalContext, profile)) return null;
  const ideology = profiles.find(candidate => candidate.catalogue === 'ideology' && candidate.id === reference.id &&
    candidate.revision === reference.revision && candidate.metadata.name === reference.name && !candidate.withdrawal &&
    candidate.axesVersion === profile.axesVersion && candidate.questionBankVersion === profile.questionBankVersion &&
    candidate.scoringVersion === profile.scoringVersion && countryReligionEligible(candidate.religion?.value, profile.countryReligion) &&
    selectionEligible(candidate.id, profile.selection));
  return ideology ? { ideology, similarity: similarity(profile.scores, ideology.scores), rationale: reference.rationale } : null;
}
