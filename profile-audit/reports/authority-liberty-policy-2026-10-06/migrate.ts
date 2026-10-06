import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { archiveDraft, bankHash, buildCatalogue, root } from '../../../frontend/scripts/profiles.ts';
import { validateAudit, neighbourReview } from '../../../frontend/src/profiles/audit.ts';
import { questions, QUESTION_BANK_VERSION, AXES_VERSION, SCORING_VERSION } from '../../../frontend/src/quiz/model.ts';
import type { Audit, Profile, Source } from '../../../frontend/src/profiles/types.ts';

const directory = join(root, 'profile-audit/reports/authority-liberty-policy-2026-10-06');
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
const save = (path: string, value: unknown) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n');
};
const contexts = read(join(directory, 'retained-context.json'));
const decisions = read(join(directory, 'decisions.json'));
const previousCatalogue = read(join(directory, 'previous-catalogue.json')).profiles as Profile[];
const changes = read(join(directory, 'question-changes.json')).questions;
const changedIds = changes.map((q: { id: string }) => q.id) as string[];
const supplementary = read(join(directory, 'supplemental-research.json')).sources as { targets: string[]; questions: number[]; source: Source; finding: string }[];
const retrievals = read(join(directory, 'source-retrieval.json'));
const date = '2026-10-06';
const labels: Record<number, string> = { '-2': 'Strongly disagree', '-1': 'Disagree', 0: 'Neutral', 1: 'Agree', 2: 'Strongly agree' };
const relocated: Record<number, number> = { 3: 15, 15: 3 };
const related: Record<number, number[]> = { 7: [5, 7], 8: [8, 16], 11: [11, 15], 12: [1, 9, 12] };
const interpretation: Record<number, string> = {
  7: 'This is a vaccination requirement for adult access to shared spaces during a serious infectious outbreak. Protection of other people is distinct from paternalism over purely personal health choices. Support for vaccination or health care alone is not a documented mandate preference. Historical analogies and exemptions remain uncertain.',
  8: 'This permits preventive restrictions before an offence on a court assessment of serious violence risk, with meaningful regular review. Support for due process alone does not establish support for preventive restrictions; courts without independence do not satisfy the wording. An anarchist opposition to state courts must also be considered.',
  11: 'This permits time- and area-limited suspicionless searches in response to a credible serious safety threat. Ordinary reasonable-suspicion investigation and warrants are separate. Oversight and proportional limits support a qualified response, not automatic opposition or unqualified agreement.',
  12: 'This permits a restriction on public racial or religious hatred incitement that does not directly threaten violence. Criticism of government, religious doctrine and private belief are separate. Broad moral censorship does not automatically establish this group-protection preference; selective ideological hatred can be counter-evidence.',
};
const strength: Record<number, string> = {
  '-2': 'The specifically relevant liberty or institutional safeguard is sufficiently central to favour strong opposition to the defined permission. Exact response intensity remains inferred, but lack of a verbatim questionnaire response does not automatically weaken a strongly supported position.',
  '-1': 'The contextual rights or procedural constraints weigh against this expanded permission. Relevant exceptions, implementation variation or a narrower historical fit make ordinary disagreement more likely than an unconditional strong response.',
  0: 'This is a substantive mixed/conditional response: the described security or administrative permissions compete with the described privacy, remedies or autonomous civic rights. Neither unqualified permission nor prohibition best fits that retained scope. Absence of an exact statement alone was not used to choose Neutral.',
  1: 'The described security mechanism, administrative obligation or actual coercive practice makes permission more likely than opposition, with narrower legal limits or practical exceptions favouring ordinary agreement.',
  2: 'The specifically described broad-control mechanism or institutional practice is sufficiently central to favour strong agreement. This is not approval of the policy or a certainty rating; exact intensity remains an educated estimate.',
};
const key = (a: { catalogue: string; id: string }) => a.catalogue + '/' + a.id;
const pending: { previous: Audit; audit: Audit; profile: Profile; decision: { values: number[]; note: string } }[] = [];
if (QUESTION_BANK_VERSION !== '4.0.0' || AXES_VERSION !== '2.0.0' || SCORING_VERSION !== '2.0.0') throw new Error('Unexpected migration versions.');
for (const context of contexts) {
  const previous = read(join(root, 'profile-audit/answers', context.catalogue, context.id, context.revision + '.json')) as Audit;
  const decision = decisions.catalogues[context.catalogue]?.[context.id];
  if (!decision || decision.values.length !== 4 || decision.values.some((v: number) => ![-2, -1, 0, 1, 2].includes(v))) throw new Error('Missing independent decision: ' + key(context));
  const audit = structuredClone(previous);
  audit.revision++;
  audit.questionBankVersion = QUESTION_BANK_VERSION;
  audit.axesVersion = AXES_VERSION;
  audit.scoringVersion = SCORING_VERSION;
  audit.bankHash = bankHash;
  audit.researchedAt = date;
  audit.author = 'Codex: focused Authority–Liberty reassessment';
  audit.changeNote = `Owner-authorised bank 4.0.0 revision. Reassessed ${changedIds.join(', ')} in the retained subject period; two unchanged-wording claims move within the axis and four claims have new mechanisms. All other 234 answer objects and fourteen other axes are preserved verbatim from revision ${previous.revision}. Retained dossiers, logged source-retrieval passages and specifically recorded supplementary research supply context. New exact responses/intensities are conservatively inferred; this is not a fresh re-verification of every earlier citation or a comprehensive new assessment of later developments. Scoring, weights, axis definitions, images, catalogue exclusions and religion supplements are preserved. No target placement or political-label adjustment is applied.`;
  const axis = audit.axes.find(a => a.axisId === 'authority-liberty')!;
  axis.brief = context.axis.brief + '\nFocused bank 4.0.0 reassessment: ' + decision.note;
  axis.counterEvidence = context.axis.counterEvidence + '\nFocused review: distinguish adult shared-space outbreak conditions from purely personal paternalism, reviewed preventive controls from unreviewed detention, limited threat-area searches from routine suspicionless search, and nonviolent group-hatred incitement from criticism or moral-content censorship. ' + decision.note + ' Earlier evidence limitations remain; new questions do not establish empirical calibration.';
  for (const change of changes) {
    const n = Number(change.id.slice(-2));
    const q = questions.find(q => q.id === change.id)!;
    const originalNumber = relocated[n];
    const originals = context.axis.answers.filter((a: { questionId: string }) => (originalNumber ? [originalNumber] : related[n]).includes(Number(a.questionId.slice(-2))));
    const oldContext = !originalNumber && [8, 11].includes(n) ? context.priorBank2?.axis.answers.find((a: any) => a.questionId === q.id) : null;
    const oldSourceIds: string[] = [];
    for (const id of oldContext?.sources ?? []) {
      const source = context.priorBank2.sources.find((s: Source) => s.id === id);
      if (!source) throw new Error('Missing contextual source ' + id);
      let existing = audit.sources.find(s => s.url === source.url);
      if (!existing) {
        existing = { ...source, id: audit.sources.some(s => s.id === source.id) ? 'policy-context-' + source.id : source.id };
        audit.sources.push(existing);
      }
      oldSourceIds.push(existing.id);
    }
    const additions = supplementary.filter(s => s.targets.includes(key(audit)) && s.questions.includes(n));
    for (const item of additions) {
      const existing = audit.sources.find(s => s.url === item.source.url);
      if (existing) existing.accessed = date;
      else audit.sources.push(item.source);
    }
    const relevantSourceIds = [...new Set([
      ...originals.flatMap((a: { sources: string[] }) => a.sources),
      ...oldSourceIds,
      ...additions.map(s => audit.sources.find(source => source.url === s.source.url)!.id),
      // Retrieved subject-specific rights context is relevant to the new association/review claims.
      ...retrievals.filter((r: any) => r.key === key(audit) && r.retrieval.snippets?.length && [8, 12].includes(n)
        && /constitution|rights|freedom/i.test(r.source.id + ' ' + r.source.title)).map((r: any) => r.source.id),
    ])] as string[];
    const value = originalNumber ? originals[0].value : decision.values[decisions.order.indexOf(n)];
    if (![-2, -1, 0, 1, 2].includes(value) || !relevantSourceIds.length) throw new Error('Unresolved answer ' + key(audit) + '/' + q.id);
    const answer = axis.answers.find(a => a.questionId === q.id)!;
    answer.value = value;
    answer.basis = 'inferred';
    answer.sources = relevantSourceIds;
    const contextualBrief = context.axis.brief.split('Best-effort assessment completed')[0].trim();
    answer.rationale = originalNumber
      ? `Educated assumption: ${labels[value]} remains the most likely response to “${q.text}” within ${previous.metadata.period}. This exact statement is relocated from authority-liberty-${String(originalNumber).padStart(2, '0')}; its documented agreement direction is unchanged. The corresponding subject-specific evidence and prior interpretation were reviewed rather than reusing the answer previously attached to this ID. Retained evidence interpretation: ${originals[0].rationale} The sourced claim is unchanged; exact response intensity remains interpreted rather than a personal questionnaire answer. Retained scope and source-access limitations still apply. No other question’s response is used to force a desired placement.`
      : `Educated assumption: ${labels[value]} is the most likely response to the revised claim “${q.text}” within ${previous.metadata.period}. Subject-specific retained evidence: ${contextualBrief} ${oldContext ? "Earlier subject-specific preventive/search interpretation, reviewed as context rather than copied: " + oldContext.rationale : ""} Focused assessment: ${decision.note} ${interpretation[n]} ${additions.map(s => s.finding).join(' ')} ${strength[value]} The cited dossier and logged supplementary material are contextual evidence, not a documented exact answer to this new wording. Historical technology/institutional analogies, scope across jurisdictions and precise intensity remain uncertain. Failed retrievals are not claimed as newly read sources; older dossier citations retain their recorded dates unless explicitly revisited. This pass does not freshly certify every prior citation or every later policy development.`;
  }
  audit.review = {
    reviewer: 'Codex: distinct same-agent focused evidence review; no external peer or human review claimed',
    reviewedAt: date,
    notes: `Reviewed all six revised records under literal mechanisms and the retained period, including direction, counter-evidence, institutional fit, response intensity, source relevance and each conditional Neutral. New educated-assumption IDs: ${changedIds.join(', ')}. ${decision.note} Unchanged 234 objects and all other axes are preserved. Retrieval access alone does not establish evidence accuracy; retained source limitations and unavailable pages remain disclosed. Similarity decisions follow the complete batch, without adjusting answers to create separation.`,
    similarity: [],
  };
  const result = validateAudit(audit, bankHash);
  if (result.errors.length || !result.profile) throw new Error(key(audit) + ': ' + result.errors.join('; '));
  const oldAnswers = previous.axes.flatMap(a => a.answers), newAnswers = audit.axes.flatMap(a => a.answers);
  for (const answer of oldAnswers.filter(a => !changedIds.includes(a.questionId))) {
    if (JSON.stringify(answer) !== JSON.stringify(newAnswers.find(a => a.questionId === answer.questionId))) throw new Error('Unrelated answer changed: ' + key(audit) + '/' + answer.questionId);
  }
  const oldProfile = previousCatalogue.find(p => key(p) === key(audit));
  if (oldProfile) for (const score of oldProfile.scores.filter(s => s.axisId !== 'authority-liberty')) {
    if (JSON.stringify(score) !== JSON.stringify(result.profile.scores.find(s => s.axisId === score.axisId))) throw new Error('Unrelated score changed: ' + key(audit));
  }
  pending.push({ previous, audit, profile: result.profile, decision });
}

// Distinct review pass: reread the prepared answer records and quantify close pairs.
const profiles = pending.map(p => p.profile);
const reviewRecords: unknown[] = [];
for (const item of pending) {
  const { audit, profile } = item;
  const neighbours = neighbourReview(profile, profiles, []).neighbours.filter(n => n.similarity >= 95);
  for (const neighbour of neighbours) {
    const other = pending.find(p => p.audit.catalogue === audit.catalogue && p.audit.id === neighbour.id)!;
    const gaps = profile.scores.map(score => ({ axis: score.axisId, gap: Math.abs(score.leftPercent - other.profile.scores.find(s => s.axisId === score.axisId)!.leftPercent) })).sort((a, b) => b.gap - a.gap).filter(g => g.gap > 0).slice(0, 3);
    audit.review.similarity.push({ id: neighbour.id, revision: neighbour.revision,
      reason: `Retain independently assessed scopes ${audit.metadata.name} (${audit.metadata.period}) and ${other.audit.metadata.name} (${other.audit.metadata.period}). First subject's specific revised-mechanism reasoning: ${item.decision.note} Second subject's reasoning: ${other.decision.note} ${gaps.length ? 'Largest measured differences: ' + gaps.map(g => g.axis + ' ' + g.gap.toFixed(1) + ' points').join(', ') + '.' : 'The coarse measured scores coincide despite distinct scopes and separately cited evidence.'} Similarity over fifteen axes is not identity or evidence interchangeability. No answer was changed to reduce resemblance. Both retain disclosed educated assumptions and source limitations.` });
  }
  const result = validateAudit(audit, bankHash);
  const review = neighbourReview(profile, profiles, audit.review.similarity);
  if (result.errors.length || review.errors.length) throw new Error(key(audit) + ': ' + [...result.errors, ...review.errors].join('; '));
  const changedAnswers = audit.axes.flatMap(a => a.answers).filter(a => changedIds.includes(a.questionId));
  for (const answer of changedAnswers) if ((answer.basis !== 'inferred') || (answer.basis === 'inferred' && !answer.rationale.startsWith('Educated assumption:')) || answer.sources.some(id => !audit.sources.some(s => s.id === id))) throw new Error('Invalid inference: ' + key(audit) + '/' + answer.questionId);
  save(join(directory, 'prepared', audit.catalogue, audit.id + '.json'), audit);
  save(join(directory, 'validation', audit.catalogue, audit.id + '.json'), { errors: result.errors, warnings: result.warnings, neighbours: review.neighbours, scores: profile.scores, unchangedAnswerObjects: 234, unrelatedAxesPreserved: true });
  reviewRecords.push({ catalogue: audit.catalogue, id: audit.id, revision: audit.revision, previousRevision: item.previous.revision, reviewer: audit.review.reviewer, reviewedAt: date, newAssumptionIds: audit.axes.flatMap(a => a.answers).filter(a => changedIds.includes(a.questionId) && a.basis === 'inferred').map(a => a.questionId), allAssumptionIds: audit.axes.flatMap(a => a.answers).filter(a => a.basis === 'inferred').map(a => a.questionId), changedAnswers, notes: audit.review.notes, neutralDecisions: changedAnswers.filter(a => a.value === 0), similarity: audit.review.similarity, warnings: result.warnings });
}
save(join(directory, 'separate-review.json'), { method: 'Distinct same-agent focused review of subject-specific decisions; no external peer review, human certification or empirical validation', reviewedAt: date, profiles: reviewRecords });
save(join(directory, 'prepared-summary.json'), { profiles: pending.length, counts: Object.fromEntries(['country', 'ideology', 'personality'].map(c => [c, pending.filter(p => p.audit.catalogue === c).length])), changedRecords: pending.length * changedIds.length, substantiveNewMechanismDecisions: pending.length * 4, changedIds });
if (!process.argv.includes('--archive')) {
  console.log('Prepared and structurally validated ' + pending.length + ' complete revisions for focused review; nothing archived yet.');
} else {
  if (!existsSync(join(directory, 'review-findings.json'))) throw new Error('Record the actual distinct review findings before archiving.');
  for (const item of pending) {
    const draft = join(root, 'profile-audit/drafts', item.audit.catalogue, item.audit.id + '.json');
    const archive = join(root, 'profile-audit/answers', item.audit.catalogue, item.audit.id, item.audit.revision + '.json');
    if (existsSync(archive)) {
      if (JSON.stringify(read(archive)) !== JSON.stringify(item.audit)) throw new Error('Concurrent or different successor: ' + key(item.audit));
      continue;
    }
    if (existsSync(draft)) {
      const old = read(draft);
      if (old.revision > item.previous.revision) throw new Error('Unfinished newer draft: ' + key(item.audit));
      const backup = join(directory, 'previous-drafts', item.audit.catalogue, item.audit.id + '.json');
      if (JSON.stringify(old) !== JSON.stringify(item.previous) && !existsSync(backup)) save(backup, old);
    }
    save(draft, item.audit);
    archiveDraft(root, item.audit);
  }
  const built = buildCatalogue(root, false);
  buildCatalogue(root, true);
  const baseline = read(join(directory, 'baseline.json'));
  for (const file of baseline.files) if (createHash('sha256').update(readFileSync(join(root, file.path))).digest('hex') !== file.sha256) throw new Error('Immutable baseline changed: ' + file.path);
  save(join(directory, 'completion.json'), { completedAt: date, questionBankVersion: QUESTION_BANK_VERSION, axesVersion: AXES_VERSION, scoringVersion: SCORING_VERSION, changedQuestionIds: changedIds, archived: pending.length, concurrentCompletedReassessments: 0, retested: pending.length, visible: built.length, generation: 'buildCatalogue and deterministic generated-data check passed', immutableBaselineFilesPreserved: baseline.files.length,
    profiles: pending.map(({ audit, previous, profile }) => ({ catalogue: audit.catalogue, id: audit.id, name: audit.metadata.name, revision: audit.revision, previousRevision: previous.revision, answered: audit.axes.flatMap(a => a.answers).filter(a => typeof a.value === 'number').length, answerFile: `profile-audit/answers/${audit.catalogue}/${audit.id}/${audit.revision}.json`, newAssumptionIds: audit.axes.flatMap(a => a.answers).filter(a => changedIds.includes(a.questionId) && a.basis === 'inferred').map(a => a.questionId), allAssumptionIds: audit.axes.flatMap(a => a.answers).filter(a => a.basis === 'inferred').map(a => a.questionId), previousLiberty: previousCatalogue.find(p => key(p) === key(audit))?.scores.find(s => s.axisId === 'authority-liberty')?.rightPercent ?? null, liberty: profile.scores.find(s => s.axisId === 'authority-liberty')!.rightPercent, concurrentReassessment: false, unchangedAnswers: 234, excluded: !built.some(p => key(p) === key(audit)) })) });
  console.log(`${pending.length} complete immutable revisions archived; ${built.length} visible catalogue profiles generated and checked; ${baseline.files.length} baseline files preserved.`);
}
