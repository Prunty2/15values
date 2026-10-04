import { axes, AXES_VERSION, QUESTION_BANK_VERSION, SCORING_VERSION } from '../quiz/model';
import { catalogues } from './types';
import type { Profile } from './types';

const string = (value: unknown) => typeof value === 'string' && value.trim().length > 0;
const url = (value: unknown) => { try { return typeof value === 'string' && /^https?:$/.test(new URL(value).protocol); } catch { return false; } };

/** Fail closed on a missing, incompatible or malformed static catalogue. */
export function parseCatalogue(value: unknown): Profile[] {
  const data = value as { schemaVersion?: unknown; profiles?: unknown } | null;
  if (data?.schemaVersion !== 1 || !Array.isArray(data.profiles)) throw new Error('Invalid catalogue.');
  const seen = new Set<string>();
  for (const profile of data.profiles as Profile[]) {
    const key = `${profile?.catalogue}/${profile?.id}`;
    if (!profile || !catalogues.includes(profile.catalogue) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(profile.id) || seen.has(key) ||
      !Number.isSafeInteger(profile.revision) || profile.revision < 1 ||
      profile.axesVersion !== AXES_VERSION || profile.questionBankVersion !== QUESTION_BANK_VERSION || profile.scoringVersion !== SCORING_VERSION ||
      !profile.metadata || !['name', 'description', 'category', 'period', 'scope'].every(field => string(profile.metadata[field as keyof Profile['metadata']])) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(profile.researchedAt) ||
      profile.auditPath !== `profiles/audits/${profile.catalogue}/${profile.id}/${profile.revision}.json` ||
      !Array.isArray(profile.scores) ||
      (profile.withdrawal !== undefined
        ? !profile.withdrawal || !/^\d{4}-\d{2}-\d{2}$/.test(profile.withdrawal.date) || !string(profile.withdrawal.reason) || profile.scores.length !== 0
        : profile.scores.length !== axes.length || axes.some(axis => profile.scores.filter(score => score?.axisId === axis.id).length !== 1)) ||
      profile.scores.some(score => !Number.isFinite(score.leftPercent) || !Number.isFinite(score.rightPercent) || score.leftPercent < 0 || score.leftPercent > 100 || Math.abs(score.leftPercent + score.rightPercent - 100) > 0.0001 || score.answered !== 16 || !Number.isInteger(score.neutral) || score.neutral < 0 || score.neutral > 16) ||
      !Array.isArray(profile.sources) || profile.sources.some(source => !source || !string(source.title) || !string(source.publisher) || !url(source.url))) throw new Error('Invalid profile data.');
    if (profile.catalogue === 'ideology' && !string(profile.metadata.phrase)) throw new Error('Missing ideology phrase.');
    const image = profile.metadata.image;
    if (image && (!/^profiles\/images\/[a-z0-9-]+\.(png|jpg|jpeg|webp)$/.test(image.path) || !url(image.sourceUrl) || !url(image.licenseUrl) || !string(image.alt) || !string(image.creator) || !string(image.license))) throw new Error('Invalid profile image.');
    seen.add(key);
  }
  return data.profiles as Profile[];
}
