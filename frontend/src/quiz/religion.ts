/** A separate, unscored identity answer. `none` is not an ideology prerequisite. */
export const religionOptions = [
  { value: 'hindu', label: 'Hinduism' },
  { value: 'muslim', label: 'Islam' },
  { value: 'christian', label: 'Christianity' },
  { value: 'jewish', label: 'Judaism' },
  { value: 'buddhist', label: 'Buddhism' },
  { value: 'sikh', label: 'Sikhism' },
  { value: 'other', label: 'Another religion' },
  { value: 'none', label: 'No religion' },
  { value: 'undisclosed', label: 'Prefer not to say' },
] as const;
export type ReligiousIdentity = typeof religionOptions[number]['value'];
export const isReligiousIdentity = (value: unknown): value is ReligiousIdentity => religionOptions.some(option => option.value === value);
export type ReligionAssessment = {
  value: ReligiousIdentity;
  basis: 'direct' | 'inferred' | 'undisclosed';
  rationale: string;
  sources: { title: string; url: string }[];
};
/** Only explicitly faith-specific ideologies impose a prerequisite. */
export function religionEligible(requirement: ReligiousIdentity | undefined, identity: ReligiousIdentity | undefined) {
  return !requirement || requirement === 'none' || (requirement !== 'undisclosed' && requirement === identity);
}

/** Country context allows several faiths; it is not a personal identity answer. */
export type CountryReligionAssessment = {
  eligibleReligions: ReligiousIdentity[];
  populationShares: Partial<Record<ReligiousIdentity, number>>;
  sourceYear: number;
  rationale: string;
  sources: { title: string; url: string }[];
};
export function countryReligionEligible(requirement: ReligiousIdentity | undefined, assessment: CountryReligionAssessment | undefined) {
  return !requirement || requirement === 'none' || (requirement !== 'undisclosed' && !!assessment?.eligibleReligions.includes(requirement));
}
export function isCountryReligionAssessment(value: unknown): value is CountryReligionAssessment {
  const data = value as CountryReligionAssessment | null;
  return !!data && Array.isArray(data.eligibleReligions) && new Set(data.eligibleReligions).size === data.eligibleReligions.length &&
    data.eligibleReligions.every(item => isReligiousIdentity(item) && item !== 'none' && item !== 'undisclosed' && item !== 'other') &&
    Number.isInteger(data.sourceYear) && data.sourceYear >= 1900 && !!data.rationale?.trim() &&
    !!data.populationShares && Object.entries(data.populationShares).every(([key, share]) => isReligiousIdentity(key) && Number.isFinite(share) && share >= 0 && share <= 100) &&
    data.eligibleReligions.every(item => (data.populationShares[item] ?? 0) >= 20) &&
    Object.entries(data.populationShares).every(([key, share]) => key === 'none' || key === 'undisclosed' || key === 'other' || (share < 20 || data.eligibleReligions.includes(key as ReligiousIdentity))) &&
    Array.isArray(data.sources) && data.sources.length > 0 && data.sources.every(source => !!source.title?.trim() && /^https?:\/\//.test(source.url));
}
