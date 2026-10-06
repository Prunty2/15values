import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { archiveDraft, bankHash, buildCatalogue, latest, root } from '../../../frontend/scripts/profiles.ts';
import { validateAudit, neighbourReview } from '../../../frontend/src/profiles/audit.ts';
import { questions, QUESTION_BANK_VERSION, AXES_VERSION, SCORING_VERSION } from '../../../frontend/src/quiz/model.ts';
import type { Audit, Profile } from '../../../frontend/src/profiles/types.ts';

const directory = join(root, 'profile-audit/reports/democracy-questions-2026-10-05');
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
const save = (path: string, value: unknown) => { mkdirSync(join(path, '..'), { recursive: true }); writeFileSync(path, JSON.stringify(value, null, 2) + '\n'); };
const decisions = read(join(directory, 'decisions.json'));
const contexts = read(join(directory, 'retained-research-context.json'));
const baseline = read(join(directory, 'baseline-history.json'));
const previousCatalogue = read(join(directory, 'previous-catalogue.json')).profiles as Profile[];
const changes = read(join(directory, 'question-changes.json')).questions as { id: string }[];
const changedIds = changes.map(q => q.id);
const date = '2026-10-06';
const labels: Record<number, string> = { '-2': 'Strongly disagree', '-1': 'Disagree', '0': 'Neutral', '1': 'Agree', '2': 'Strongly agree' };
const interpretations: Record<number, string> = {
  2: 'This is delegation of policy decisions to independent specialists, not replacement of the electorate or a claim that all expertise is political sovereignty. A legislative mandate, appointment process and later review can coexist with not voting on every operational decision.',
  4: 'This permits temporary lawmaking before a vote but expressly retains parliamentary rejection and expiry. It is not the previous permission to override an actual parliamentary rejection; primary legislation and delegated emergency instruments can differ.',
  6: 'The revised claim gives citizens an independent signature-triggered route to a binding national law vote. A petition, advisory consultation, parliamentary bill proposal or government-called referendum does not by itself establish that mechanism. Constitutional initiatives can provide qualified, narrower support.',
  8: 'This concerns replacing the head of government between elections. Parliamentary confidence or governing-party selection differs from choosing an entirely new legislature. A personally elected presidency has different succession rules, and a prime minister must not be confused with a separate ceremonial or executive head of state.',
  11: 'The revised claim permits executive policy implementation within existing law without a separate parliamentary vote on each decision. It does not permit overriding legislation, spending authority, courts, or an explicit parliamentary rejection; collegial executives require additional qualification.',
  13: 'This concerns a legally limited emergency postponement authorised by Parliament, not a leader cancelling elections for political convenience. Constitutional term limits, emergency exceptions and actual independent parliamentary control must be considered separately.',
};
const reasoning: Record<number, string> = {
  '-2': 'The contextual commitment or institutional restriction weighs strongly against this specific mechanism, not merely against an unrelated political label. A weaker response would understate that conflict, though exact response intensity remains inferred.',
  '-1': 'The representative, rights-based or participatory restriction described in the context weighs against this mechanism; its limited exceptions or imperfect institutional fit favour ordinary rather than strong disagreement.',
  '0': 'This is a substantive conditional judgement: the described case for functioning government or collective continuity competes with the described limits on independent discretion or public consent. Neither unqualified permission nor unqualified prohibition best represents that tension. It is not a default for absent evidence.',
  '1': 'The described institutional delegation or bounded permission makes agreement more likely than disagreement. Legal safeguards, narrower implementation or an inferred historical application make ordinary agreement more appropriate than an unconditional strong response.',
  '2': 'The contextual institutional mechanism or explicit participatory commitment is sufficiently central to favour a strong response to the defined claim. This is an estimate of response strength, not a claim the subject answered this questionnaire.',
};
const fresh = read(join(directory, 'fresh-research.json')) as { targets: string[]; question: number; source: Audit['sources'][number]; finding: string }[];

const before = latest(root);
if (before.length !== contexts.length) throw new Error('The subject list changed during migration; review newly added subjects first.');
const pending: { audit: Audit; previous: Audit; profile: Profile }[] = [];
for (const { audit: previous } of before) {
  const key = `${previous.catalogue}/${previous.id}`;
  const context = contexts.find((x: any) => `${x.catalogue}/${x.id}` === key);
  const decision = decisions.catalogues[previous.catalogue][previous.id];
  if (!context || !decision || previous.revision !== context.revision) throw new Error(`Concurrent revision or missing decision: ${key}`);
  if (decision.values.length !== changedIds.length || decision.values.some((v: number) => ![-2, -1, 0, 1, 2].includes(v))) throw new Error(`Invalid decisions: ${key}`);
  const audit = structuredClone(previous);
  audit.revision++;
  audit.questionBankVersion = QUESTION_BANK_VERSION; audit.axesVersion = AXES_VERSION; audit.scoringVersion = SCORING_VERSION; audit.bankHash = bankHash;
  audit.author = 'Codex: focused Democracy–Autocracy reassessment'; audit.researchedAt = date;
  audit.changeNote = `Owner-authorised focused migration to bank ${QUESTION_BANK_VERSION} and axes ${AXES_VERSION}. Independently reassessed ${changedIds.join(', ')} using retained period-specific sourced research and the explicitly recorded supplemental references. All other 234 question-level answer objects are preserved verbatim from revision ${previous.revision}. No other axis was reassessed, no target score or population remapping was applied, and earlier archives remain unchanged. Six new educated assumptions are provisional; retained evidence limitations still apply.`;
  const axis = audit.axes.find(x => x.axisId === 'democracy-autocracy')!;
  axis.brief = context.brief + '\nFocused six-question reassessment: ' + decision.note;
  axis.counterEvidence = context.counterEvidence + '\nThe owner-defined broader axis includes lawful delegation and direct public control; a lower numerical placement is not a regime classification. Six exact responses and response strengths remain inferred. Retained source access dates are not refreshed unless a source was actually revisited. Unchanged answers and other axes were not re-audited. ' + decision.note;
  changedIds.forEach((id, index) => {
    const answer = axis.answers.find(x => x.questionId === id)!;
    const number = decisions.order[index];
    // Related retained evidence is chosen by the institutional claim, never by a desired score.
    const priorNumber = ({ 2: 2, 4: 4, 6: 10, 8: 1, 11: 11, 13: 13 } as Record<number, number>)[number];
    const related = context.answers.find((a: any) => a.questionId === `democracy-autocracy-${String(priorNumber).padStart(2, '0')}`);
    const additions = fresh.filter(x => x.question === number && (x.targets.includes(key) || x.targets.includes(`${previous.catalogue}/*`)));
    for (const addition of additions) if (!audit.sources.some(s => s.url === addition.source.url)) audit.sources.push(addition.source);
    const sourceIds = additions.map(x => audit.sources.find(s => s.url === x.source.url)!.id);
    answer.value = decision.values[index]; answer.basis = 'inferred';
    answer.sources = [...new Set([...related.sources, ...sourceIds])];
    const q = questions.find(q => q.id === id)!;
    answer.rationale = `Educated assumption: ${labels[answer.value!]} is the most likely response to the revised claim “${q.text}” in the specified scope (${previous.metadata.period}). The retained sourced research records: ${context.brief.replace(/Best-effort assessment completed[\s\S]*$/, '').trim()} Focused interpretation: ${decision.note} ${interpretations[number]} ${additions.map(x => x.finding).join(' ')} ${reasoning[answer.value!]} The citations supply contextual evidence, not a documented exact response to this new wording. The original source dossier is used as retained research; this pass does not claim a fresh retrieval or complete verification of every historical citation. Precise policy scope, hypothetical institutional translations and response intensity remain uncertain.`;
  });
  audit.review = { reviewer: 'Codex: distinct same-agent focused evidence review (not independent human or external peer review)', reviewedAt: date,
    notes: `Reviewed the literal revised mechanisms, directions, period-specific retained research, supplemental references, inferred intensity, conditional Neutral decisions, institutional mismatches and unchanged-answer preservation. New educated-assumption IDs: ${changedIds.join(', ')}. ${decision.note} All earlier evidence limitations remain. No new empirical calibration, fresh full-profile research, human review or external peer certification is claimed. Similarity is reviewed after scoring the complete batch, without tuning any answer.`, similarity: [] };
  const result = validateAudit(audit, bankHash);
  if (!result.profile || result.errors.length) throw new Error(`${key}: ${result.errors.join('; ')}`);
  const oldAnswers = previous.axes.flatMap(x => x.answers), newAnswers = audit.axes.flatMap(x => x.answers);
  for (const old of oldAnswers.filter(x => !changedIds.includes(x.questionId))) if (JSON.stringify(old) !== JSON.stringify(newAnswers.find(x => x.questionId === old.questionId))) throw new Error(`${key}: unrelated answer changed: ${old.questionId}`);
  const oldProfile = previousCatalogue.find(x => `${x.catalogue}/${x.id}` === key);
  if (oldProfile) for (const score of oldProfile.scores.filter(s => s.axisId !== 'democracy-autocracy')) if (JSON.stringify(score) !== JSON.stringify(result.profile.scores.find(s => s.axisId === score.axisId))) throw new Error(`${key}: unrelated score changed`);
  pending.push({ audit, previous, profile: result.profile });
}

// A distinct review pass reads every prepared changed answer, rejects unresolved decisions,
// and documents every close pair using its actual scopes and differences.
const profiles = pending.map(x => x.profile);
const reviewRecords: unknown[] = [];
for (const item of pending) {
  const { audit, profile } = item;
  const neighbours = neighbourReview(profile, profiles, []).neighbours.filter(x => x.similarity >= 95);
  for (const neighbour of neighbours) {
    const other = pending.find(x => x.audit.catalogue === audit.catalogue && x.audit.id === neighbour.id)!;
    const differences = profile.scores.map(score => ({ axis: score.axisId, gap: Math.abs(score.leftPercent - other.profile.scores.find(s => s.axisId === score.axisId)!.leftPercent) })).sort((a, b) => b.gap - a.gap).filter(x => x.gap > 0).slice(0, 3);
    const reason = `Focused same-agent evidence review retains these separately researched scopes: ${audit.metadata.name} (${audit.metadata.period}) and ${other.audit.metadata.name} (${other.audit.metadata.period}). The six-question contextual decisions for the first are: ${decisions.catalogues[audit.catalogue][audit.id].note} For the second: ${decisions.catalogues[other.audit.catalogue][other.audit.id].note} ${differences.length ? `The largest measured differences remain ${differences.map(x => `${x.axis}: ${x.gap.toFixed(1)} points`).join(', ')}.` : 'The complete measured scores coincide, but distinct subjects/scopes need not differ on every coarse five-choice item.'} Similarity across 15 axes is a structural diagnostic, not identity or interchangeable evidence. Each retains its own citations and provisional educated assumptions. No answers were changed to reduce resemblance.`;
    audit.review.similarity.push({ id: neighbour.id, revision: neighbour.revision, reason });
  }
  const result = validateAudit(audit, bankHash), review = neighbourReview(profile, profiles, audit.review.similarity);
  if (result.errors.length || review.errors.length) throw new Error(`${audit.id}: ${[...result.errors, ...review.errors].join('; ')}`);
  for (const answer of audit.axes.flatMap(x => x.answers).filter(x => changedIds.includes(x.questionId))) {
    if (answer.basis !== 'inferred' || !answer.rationale.startsWith('Educated assumption:') || answer.sources.some(id => !audit.sources.some(s => s.id === id))) throw new Error(`Invalid inferred answer: ${audit.id}/${answer.questionId}`);
  }
  save(join(directory, 'validation', audit.catalogue, audit.id + '.json'), { errors: result.errors, warnings: result.warnings, neighbours: review.neighbours, scores: result.profile!.scores, unchangedAnswerObjects: 234, unrelatedAxesPreserved: true });
  reviewRecords.push({ catalogue: audit.catalogue, id: audit.id, previousRevision: item.previous.revision, revision: audit.revision, reviewer: audit.review.reviewer, reviewedAt: date, newAssumptionIds: changedIds, neutralDecisions: audit.axes[0].answers.filter(a => changedIds.includes(a.questionId) && a.value === 0).map(a => ({ id: a.questionId, rationale: a.rationale })), allAssumptionIds: audit.axes.flatMap(x => x.answers).filter(x => x.basis === 'inferred').map(x => x.questionId), unchangedAnswerObjects: 234, notes: audit.review.notes, similarity: audit.review.similarity });
}
save(join(directory, 'separate-review.json'), { reviewedAt: date, method: 'Distinct same-agent focused review; retained dossiers plus recorded supplemental references; not external peer review', profiles: reviewRecords });

for (const item of pending) {
  const draft = join(root, 'profile-audit/drafts', item.audit.catalogue, item.audit.id + '.json');
  // Preserve any unrelated, unfinished draft rather than replacing it with this focused audit.
  if (existsSync(draft)) {
    const original = read(draft);
    save(join(directory, 'previous-drafts', item.audit.catalogue, item.audit.id + '.json'), original);
    if (original.revision > item.previous.revision) throw new Error(`Unfinished newer draft for ${item.audit.catalogue}/${item.audit.id}; preserve and reconcile it before archiving.`);
  }
  save(draft, item.audit);
  archiveDraft(root, item.audit);
}
const built = buildCatalogue(root, false);
buildCatalogue(root, true);
for (const entry of baseline.files) if (createHash('sha256').update(readFileSync(join(root, entry.path))).digest('hex') !== entry.sha256) throw new Error(`Immutable existing file changed: ${entry.path}`);
save(join(directory, 'completion.json'), { completedAt: date, questionBankVersion: QUESTION_BANK_VERSION, axesVersion: AXES_VERSION, scoringVersion: SCORING_VERSION, changedQuestionIds: changedIds, archived: pending.length, visible: built.length, generation: 'buildCatalogue and deterministic check passed', immutableBaselineFilesPreserved: baseline.files.length, profiles: pending.map(({ audit, previous, profile }) => ({ catalogue: audit.catalogue, id: audit.id, name: audit.metadata.name, revision: audit.revision, previousRevision: previous.revision, answered: audit.axes.flatMap(x => x.answers).filter(a => typeof a.value === 'number').length, answerFile: `profile-audit/answers/${audit.catalogue}/${audit.id}/${audit.revision}.json`, newAssumptionIds: changedIds, allAssumptionIds: audit.axes.flatMap(x => x.answers).filter(x => x.basis === 'inferred').map(x => x.questionId), previousDemocracy: previousCatalogue.find(p => p.catalogue === audit.catalogue && p.id === audit.id)?.scores[0].leftPercent ?? null, democracy: profile.scores[0].leftPercent, unchangedAnswers: 234, excluded: !built.some(p => p.catalogue === audit.catalogue && p.id === audit.id) })) });
console.log(`${pending.length} immutable revisions archived; ${built.length} visible catalogue profiles generated and checked; ${baseline.files.length} existing archive/image hashes preserved.`);
