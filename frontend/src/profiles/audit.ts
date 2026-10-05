import { axes, questions, scoreAnswers, QUESTION_BANK_VERSION, AXES_VERSION, SCORING_VERSION } from '../quiz/model.ts';
import type { Answers } from '../quiz/model.ts';
import { catalogues } from './types.ts';
import type { Audit, Profile } from './types.ts';

const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
export const isSlug = (value: unknown): value is string => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 100;
const date = (value: unknown) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
export const httpUrl = (value: unknown) => {
  if (typeof value !== 'string') return false;
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password; } catch { return false; }
};
export const imagePath = (value: unknown) => typeof value === 'string' && /^profiles\/images\/[a-z0-9-]+\.(png|jpg|jpeg|webp)$/.test(value);

/** Diagnostic resemblance only: equal-axis mean absolute distance on a 0–100 scale. */
export function similarity(a: Profile['scores'], b: Profile['scores']) {
  if (a.length !== axes.length || b.length !== axes.length) throw new Error('Similarity requires all 15 axes.');
  const values = (scores: Profile['scores']) => new Map(scores.map(score => [score.axisId, score.leftPercent]));
  const left = values(a), right = values(b);
  if (left.size !== axes.length || right.size !== axes.length || axes.some(axis =>
    !Number.isFinite(left.get(axis.id)) || !Number.isFinite(right.get(axis.id)) ||
    left.get(axis.id)! < 0 || left.get(axis.id)! > 100 || right.get(axis.id)! < 0 || right.get(axis.id)! > 100)) {
    throw new Error('Similarity requires valid, unique axis scores.');
  }
  return 100 - axes.reduce((sum, axis) => sum + Math.abs(left.get(axis.id)! - right.get(axis.id)!), 0) / axes.length;
}

/** Validate untrusted JSON before scoring. Evidence quality still requires source review. */
export function validateAudit(input: unknown, bankHash: string): { errors: string[]; warnings: string[]; profile?: Profile } {
  const errors: string[] = [], warnings: string[] = [];
  const require = (condition: unknown, message: string) => { if (!condition) errors.push(message); };
  if (!object(input)) return { errors: ['Audit must be an object.'], warnings };
  const allowed = new Set(['schemaVersion', 'catalogue', 'id', 'revision', 'questionBankVersion', 'axesVersion', 'scoringVersion', 'bankHash', 'researchedAt', 'author', 'changeNote', 'metadata', 'sources', 'axes', 'review']);
  require(Object.keys(input).every(key => allowed.has(key)), 'Unexpected audit fields; do not supply vectors, weights or archetypes.');
  require(input.schemaVersion === 1, 'Unsupported audit schema.');
  require(catalogues.includes(input.catalogue as never), 'Unknown catalogue.');
  require(isSlug(input.id), 'ID must be a lowercase hyphenated slug.');
  require(Number.isSafeInteger(input.revision) && Number(input.revision) > 0, 'Revision must be a positive integer.');
  require(input.questionBankVersion === QUESTION_BANK_VERSION && input.axesVersion === AXES_VERSION && input.scoringVersion === SCORING_VERSION && input.bankHash === bankHash, 'Stale bank, axes or scoring version: re-audit against the current bank.');
  require(date(input.researchedAt), 'Research date must be YYYY-MM-DD.');
  require(text(input.author) && text(input.changeNote), 'Author and change note are required.');
  const m = object(input.metadata) ? input.metadata : {};
  const metadataKeys = new Set(['name', 'description', 'category', 'period', 'scope', 'image',
    ...(input.catalogue === 'ideology' ? ['phrase'] : input.catalogue === 'country' ? ['historical'] : ['role', 'lifespan'])]);
  require(Object.keys(m).every(key => metadataKeys.has(key)), 'Unexpected metadata fields for this catalogue.');
  for (const key of ['name', 'description', 'category', 'period', 'scope']) require(text(m[key]), `Metadata ${key} is required.`);
  if (input.catalogue === 'ideology') require(text(m.phrase), 'Ideology phrase is required.');
  if (input.catalogue === 'country') require(typeof m.historical === 'boolean', 'Country historical flag is required.');
  if (input.catalogue === 'personality') require(text(m.role) && text(m.lifespan), 'Personality role and lifespan are required.');
  if (input.catalogue !== 'ideology' || m.image !== undefined) {
    const img = object(m.image) ? m.image : {};
    require(imagePath(img.path), 'A local PNG/JPEG/WebP image under profiles/images is required.');
    require(text(img.alt) && text(img.creator) && text(img.license), 'Image alt text, creator and licence are required.');
    require(httpUrl(img.sourceUrl) && httpUrl(img.licenseUrl), 'Image source and licence URLs must be HTTP(S).');
  }
  const sourceIds = new Set<string>(), publishers = new Set<string>(), sourceUrls = new Set<string>();
  require(Array.isArray(input.sources), 'Sources must be an array.');
  for (const item of Array.isArray(input.sources) ? input.sources : []) {
    if (!object(item)) { errors.push('Invalid source.'); continue; }
    require(isSlug(item.id) && !sourceIds.has(item.id as string), 'Source IDs must be unique slugs.');
    if (typeof item.id === 'string') sourceIds.add(item.id);
    require(text(item.title) && text(item.publisher), 'Source title and publisher are required.');
    require(httpUrl(item.url) && !sourceUrls.has(String(item.url)), 'Sources need distinct HTTP(S) URLs.');
    sourceUrls.add(String(item.url));
    require(date(item.accessed) && (date(item.date) || item.date === 'undated'), 'Source dates must be YYYY-MM-DD (publication may be undated).');
    if (text(item.publisher)) publishers.add(item.publisher.trim().toLowerCase());
  }
  require(sourceIds.size >= 3 && publishers.size >= 3, 'At least three sources from distinct publishers are required; verify independence manually.');
  const review = object(input.review) ? input.review : {};
  require(text(review.reviewer) && date(review.reviewedAt) && text(review.notes), 'A completed evidence review is required.');
  require(Array.isArray(review.similarity), 'Review similarity decisions must be an array.');
  for (const decision of Array.isArray(review.similarity) ? review.similarity : []) {
    require(object(decision) && isSlug(decision.id) && Number.isSafeInteger(decision.revision) && Number(decision.revision) > 0 && text(decision.reason), 'Invalid similarity review decision.');
  }
  const seenAxes = new Set<string>(), seenQuestions = new Set<string>(), answers: Answers = {};
  require(Array.isArray(input.axes) && input.axes.length === axes.length, 'Exactly 15 axis assessments are required.');
  for (const item of Array.isArray(input.axes) ? input.axes : []) {
    if (!object(item)) { errors.push('Invalid axis assessment.'); continue; }
    const axisId = String(item.axisId);
    require(axes.some(axis => axis.id === axisId) && !seenAxes.has(axisId), `Unknown or duplicate axis: ${axisId}.`);
    seenAxes.add(axisId);
    require(text(item.brief) && text(item.counterEvidence), `${axisId}: brief and counter-evidence review are required.`);
    require(Array.isArray(item.answers) && item.answers.length === 16, `${axisId}: exactly 16 answers are required.`);
    let neutral = 0;
    for (const answer of Array.isArray(item.answers) ? item.answers : []) {
      if (!object(answer)) { errors.push(`${axisId}: invalid answer.`); continue; }
      const id = String(answer.questionId);
      require(questions.some(question => question.id === id && question.axisId === axisId) && !seenQuestions.has(id), `Unknown, misplaced or duplicate question: ${id}.`);
      seenQuestions.add(id);
      require(typeof answer.value === 'number' && [-2, -1, 0, 1, 2].includes(answer.value), `${id}: unresolved or invalid answer.`);
      require(['direct', 'inferred'].includes(String(answer.basis)), `${id}: unknown evidence cannot be scored as Neutral.`);
      require(text(answer.rationale), `${id}: answer rationale is required.`);
      require(Array.isArray(answer.sources) && answer.sources.length > 0 && answer.sources.every(id => typeof id === 'string' && sourceIds.has(id)), `${id}: cite existing source IDs.`);
      answers[id] = answer.value as Answers[string];
      if (answer.value === 0) neutral++;
    }
    if (neutral > 4) warnings.push(`${axisId}: ${neutral}/16 neutral answers; check that these express a supported position, not missing evidence.`);
  }
  if (text(m.description) && m.description.length > 450) warnings.push('Description is long; keep catalogue copy concise.');
  if (errors.length) return { errors, warnings };
  const audit = input as unknown as Audit;
  const scores = scoreAnswers('comprehensive', answers);
  return { errors, warnings, profile: {
    catalogue: audit.catalogue, id: audit.id, revision: audit.revision, metadata: audit.metadata,
    researchedAt: audit.researchedAt, questionBankVersion: audit.questionBankVersion,
    axesVersion: audit.axesVersion, scoringVersion: audit.scoringVersion, scores,
    sources: audit.sources, auditPath: `profiles/audits/${audit.catalogue}/${audit.id}/${audit.revision}.json`,
  } };
}

export function neighbourReview(profile: Profile, peers: Profile[], decisions: Audit['review']['similarity']) {
  const neighbours = peers.filter(peer => peer.catalogue === profile.catalogue && peer.id !== profile.id)
    .map(peer => ({ id: peer.id, revision: peer.revision, similarity: similarity(profile.scores, peer.scores) }))
    .sort((a, b) => b.similarity - a.similarity || a.id.localeCompare(b.id));
  const unresolved = neighbours.filter(peer => peer.similarity >= 95 && !decisions.some(decision => decision.id === peer.id && decision.revision === peer.revision && decision.reason.trim()));
  return { neighbours, errors: unresolved.map(peer => `${peer.id} revision ${peer.revision}: ${peer.similarity.toFixed(1)}% similarity needs a documented review decision. Preserve evidence-supported answers.`) };
}
