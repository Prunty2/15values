import type { ReligionAssessment, CountryReligionAssessment } from '../quiz/religion';
import type { Answer, AxisScore } from '../quiz/model';

export const catalogues = ['ideology', 'country', 'personality'] as const;
export type Catalogue = typeof catalogues[number];
export type Source = { id: string; title: string; url: string; publisher: string; date: string; accessed: string };
export type ProfileImage = { path: string; alt: string; sourceUrl: string; creator: string; license: string; licenseUrl: string };
export type Metadata = {
  name: string; description: string; category: string; period: string;
  scope: string; ideology?: string | null; politicalLeaning?: string | null; phrase?: string; role?: string; lifespan?: string; historical?: boolean;
  image?: ProfileImage;
};
export type EvidenceAnswer = { questionId: string; value: Answer | null; basis: 'direct' | 'inferred' | 'unknown'; rationale: string; sources: string[] };
export type Audit = {
  schemaVersion: 1; catalogue: Catalogue; id: string; revision: number;
  questionBankVersion: string; axesVersion: string; scoringVersion: string; bankHash: string;
  researchedAt: string; author: string; changeNote: string; metadata: Metadata; sources: Source[];
  axes: { axisId: string; brief: string; counterEvidence: string; answers: EvidenceAnswer[] }[];
  review: { reviewer: string; reviewedAt: string; notes: string; similarity: { id: string; revision: number; reason: string }[] };
};
export type IdeologyMatch = {
  method: 'equal-axis-mae-v1';
  meanAbsoluteDistance: number;
  ideologies: { id: string; revision: number; name: string }[];
};
export type Profile = {
  countryReligion?: CountryReligionAssessment;
  religion?: ReligionAssessment;
  religionRevision?: number;
  representativePersonalityId?: string;
  catalogue: Catalogue; id: string; revision: number; metadata: Metadata;
  researchedAt: string; questionBankVersion: string; axesVersion: string; scoringVersion: string;
  scores: AxisScore[]; sources: Source[]; auditPath: string;
  closestIdeology?: IdeologyMatch | null;
  withdrawal?: { date: string; reason: string };
};
