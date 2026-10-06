import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { axes, questions, scoreAnswers } from '../quiz/model';
import type { Answers } from '../quiz/model';
import type { Audit, Profile } from './types';

const root = new URL('../../../', import.meta.url);
const read = (path: string) => JSON.parse(readFileSync(new URL(path, root), 'utf8'));
const report = 'profile-audit/reports/authority-liberty-policy-2026-10-06/';
const completion = read(report + 'completion.json') as { profiles: { catalogue: string; id: string; revision: number; previousRevision: number; answerFile: string; excluded: boolean; concurrentReassessment: boolean }[] };
const changes = read(report + 'question-changes.json').questions as { id: string; previousText: string; text: string }[];
const changed = new Set(changes.map(q => q.id));
const oldBank = read('frontend/src/data/questions.v3.json').questions as typeof questions;
const oldCatalogue = read(report + 'previous-catalogue.json').profiles as Profile[];
const catalogue = read('frontend/public/profiles/catalogue.v1.json').profiles as Profile[];
const fingerprint = createHash('sha256').update(JSON.stringify({ axes, questions, SCORING_VERSION: '2.0.0' })).digest('hex');

describe('complete bounded-policy Authority–Liberty reassessment', () => {
  it('preserves every recorded immutable archive, historical bank, image and faith supplement', () => {
    const baseline = read(report + 'baseline.json') as { files: { path: string; sha256: string }[] };
    for (const file of baseline.files) expect(createHash('sha256').update(readFileSync(new URL(file.path, root))).digest('hex'), file.path).toBe(file.sha256);
  });
  it('covers every previous subject exactly once, including excluded profiles', () => {
    const contexts = read(report + 'retained-context.json') as { catalogue: string; id: string }[];
    expect(completion.profiles).toHaveLength(209);
    expect(completion.profiles.map(p => p.catalogue + '/' + p.id).sort()).toEqual(contexts.map(p => p.catalogue + '/' + p.id).sort());
    expect(catalogue).toHaveLength(completion.profiles.filter(p => !p.excluded).length);
    for (const change of changes) {
      expect(change.previousText).toBe(oldBank.find(q => q.id === change.id)!.text);
      expect(change.text).toBe(questions.find(q => q.id === change.id)!.text);
      expect(change.text).not.toBe(change.previousText);
    }
  });
  it.each(completion.profiles)('$catalogue/$id retains 240 answers and only changes the authorised axis', entry => {
    const audit = read(entry.answerFile) as Audit;
    const previous = read(`profile-audit/answers/${entry.catalogue}/${entry.id}/${entry.previousRevision}.json`) as Audit;
    expect(audit.revision).toBe(entry.previousRevision + 1);
    expect([audit.questionBankVersion, audit.axesVersion, audit.scoringVersion]).toEqual(['4.0.0', '2.0.0', '2.0.0']);
    expect(audit.bankHash).toBe(fingerprint);
    if (!entry.concurrentReassessment) expect(audit.metadata).toEqual(previous.metadata);
    const answers = audit.axes.flatMap(a => a.answers);
    const oldAnswers = previous.axes.flatMap(a => a.answers);
    expect(answers).toHaveLength(240);
    expect(new Set(answers.map(a => a.questionId)).size).toBe(240);
    for (const answer of answers) {
      expect([-2, -1, 0, 1, 2]).toContain(answer.value);
      if (!changed.has(answer.questionId) && !entry.concurrentReassessment) expect(answer).toEqual(oldAnswers.find(a => a.questionId === answer.questionId));
      else if (changed.has(answer.questionId)) {
        if (!entry.concurrentReassessment) expect(answer.basis).toBe('inferred');
        if (answer.basis === 'inferred') expect(answer.rationale).toMatch(/^Educated assumption:/);
        expect(answer.sources.length).toBeGreaterThan(0);
        expect(answer.sources.every(id => audit.sources.some(source => source.id === id))).toBe(true);
        const q = questions.find(q => q.id === answer.questionId)!;
        const relocated = oldBank.find(old => old.text === q.text && old.axisId === q.axisId && old.agreePole === q.agreePole);
        if (relocated && !entry.concurrentReassessment) expect(answer.value).toBe(oldAnswers.find(a => a.questionId === relocated.id)!.value);
      }
    }
    const scores = scoreAnswers('comprehensive', Object.fromEntries(answers.map(a => [a.questionId, a.value])) as Answers);
    const previousScores = scoreAnswers('comprehensive', Object.fromEntries(oldAnswers.map(a => [a.questionId, a.value])) as Answers);
    expect(scores.filter(s => s.axisId !== 'authority-liberty')).toEqual(previousScores.filter(s => s.axisId !== 'authority-liberty'));
    const current = catalogue.find(p => p.catalogue === entry.catalogue && p.id === entry.id);
    expect(Boolean(current)).toBe(!entry.excluded);
    if (current) {
      expect(current.scores).toEqual(scores);
      expect(current.revision).toBe(audit.revision);
      const old = oldCatalogue.find(p => p.catalogue === entry.catalogue && p.id === entry.id)!;
      if (!entry.concurrentReassessment) expect(scores.filter(s => s.axisId !== 'authority-liberty')).toEqual(old.scores.filter(s => s.axisId !== 'authority-liberty'));
      const download = read(`frontend/public/${current.auditPath}`) as Audit;
      expect(download).toEqual(audit);
    }
  });
});
