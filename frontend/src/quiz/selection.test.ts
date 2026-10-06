import { describe, expect, it } from 'vitest';
import { selectionEligible, isSelectionAnswers, isSelectionAssessment } from './selection';
import { closestIdeology, matchResultIdeology, matchResultProfiles } from '../profiles/ideologyMatching';
import { profileFixture } from '../../tests/fixtures/profile';
import { parseHistory, serializeHistory } from './history';
import { scoreAnswers, selectQuestions } from './model';
import type { QuizResult } from './model';
import type { SelectionAssessment, SelectionAnswers } from './selection';
const selection = (hiring: number, admissions: number, access: number): SelectionAnswers => ({ version: '1.0.0', answers: { 'selection-hiring': hiring, 'selection-admissions': admissions, 'selection-access': access } } as SelectionAnswers);
const assessment = (answers: SelectionAnswers): SelectionAssessment => ({ ...answers, evidence: Object.keys(answers.answers).map(questionId => ({ questionId, basis: 'direct', rationale: 'Fixture evidence.', sources: [{ title: 'Fixture', url: 'https://example.org/evidence' }] })) });
describe('selection prerequisites', () => {
  it.each([-2, -1, 0, 1, 2])('checks each defining statement independently (%s)', answer => {
    expect(selectionEligible('meritocracy', selection(answer, 2, 2))).toBe(answer > 0);
    expect(selectionEligible('meritocracy', selection(2, answer, 2))).toBe(answer > 0);
  });
  it('allows barrier removal and does not infer agreement from missing evidence', () => {
    expect(selectionEligible('meritocracy', selection(2, 2, 2))).toBe(true);
    expect(selectionEligible('meritocracy', selection(2, 2, -2))).toBe(true);
    expect(selectionEligible('meritocracy')).toBe(false);
    expect(selectionEligible('meritocracy', { version: '1.0.0', answers: { 'selection-admissions': -1 } })).toBe(false);
    expect(selectionEligible('progressive-liberalism')).toBe(true);
    expect(selectionEligible('constructor')).toBe(true);
    expect(isSelectionAnswers({ version: 'unknown', answers: {} })).toBe(false);
    expect(isSelectionAnswers({ version: '1.0.0', answers: { 'selection-hiring': 3 } })).toBe(false);
    expect(isSelectionAssessment({ ...selection(2, 2, 2), evidence: [] })).toBe(false);
  });
  it('blocks a perfect numerical match in both directions while retaining eligible alternatives', () => {
    const merit = profileFixture('ideology', 'meritocracy');
    const subject = { ...profileFixture('personality', 'subject'), scores: merit.scores, selection: assessment(selection(2, -1, 2)) };
    const alternative = { ...profileFixture('ideology', 'alternative'), scores: merit.scores };
    expect(closestIdeology(subject, [merit, alternative])?.ideologies.map(item => item.id)).toEqual(['alternative']);
    expect(matchResultIdeology(subject, [merit])).toBeNull();
    expect(matchResultProfiles(merit, [subject], 'personality')).toBeNull();
    expect(matchResultProfiles(alternative, [subject], 'personality')?.profiles).toHaveLength(1);
    subject.selection = assessment(selection(1, 1, 2));
    expect(closestIdeology(subject, [merit])?.meanAbsoluteDistance).toBe(0);
    expect(matchResultProfiles(merit, [subject], 'personality')?.profiles).toHaveLength(1);
  });
  it('round-trips supplemental answers, preserves older results and leaves scores unchanged', () => {
    const answers = Object.fromEntries(selectQuestions('short').map(question => [question.id, 1 as const]));
    const scores = scoreAnswers('short', answers);
    const result: QuizResult = { id: 'selection-test', completedAt: '2026-10-06T00:00:00.000Z', length: 'short', questionBankVersion: '4.0.0', axesVersion: '2.0.0', scoringVersion: '2.0.0', scores, selection: selection(2, -1, 2) };
    expect(parseHistory(serializeHistory([result]))[0]).toEqual(result);
    expect(parseHistory(serializeHistory([{ ...result, selection: undefined }]))[0].selection).toBeUndefined();
    expect(parseHistory(serializeHistory([result]))[0].scores).toEqual(scoreAnswers('short', answers));
    expect(() => parseHistory(serializeHistory([{ ...result, selection: { ...result.selection!, version: 'invalid' } } as unknown as QuizResult]))).toThrow();
  });
});

describe('five-topic ideology matching', () => {
  const current = (changes: Record<string, -2 | -1 | 0 | 1 | 2> = {}): SelectionAnswers => ({ version: '2.0.0', answers: { 'matching-merit': 1, 'selection-access': 1, 'matching-ownership': 1, 'matching-state': 1, 'matching-party': 1, ...changes } });
  it.each([
    ['meritocracy', 'matching-merit'], ['meritocracy', 'selection-access'],
    ['socialism', 'matching-ownership'], ['democratic-socialism', 'matching-ownership'],
    ['social-anarchism', 'matching-ownership'], ['social-anarchism', 'matching-state'],
    ['anarcho-capitalism', 'matching-state'], ['marxism-leninism', 'matching-ownership'], ['marxism-leninism', 'matching-party'],
  ])('%s requires affirmative evidence on %s', (id, question) => {
    expect(selectionEligible(id, current())).toBe(true);
    for (const value of [-2, -1, 0] as const) expect(selectionEligible(id, current({ [question]: value }))).toBe(false);
    expect(selectionEligible(id)).toBe(false);
  });
  it('one fringe disagreement cannot be averaged away by fifteen perfectly matching axes', () => {
    const anarchist = profileFixture('ideology', 'social-anarchism');
    const other = { ...profileFixture('ideology', 'alternative'), scores: anarchist.scores };
    const subject = { ...profileFixture('personality', 'subject'), scores: anarchist.scores, selection: assessment(current({ 'matching-state': -1 })) };
    expect(matchResultIdeology(subject, [anarchist, other])?.ideologies.map(item => item.id)).toEqual(['alternative']);
    subject.selection = assessment(current());
    expect(matchResultIdeology(subject, [anarchist])?.meanAbsoluteDistance).toBe(0);
    expect(matchResultProfiles(anarchist, [subject], 'personality')?.profiles).toHaveLength(1);
  });
  it('keeps both supplement versions readable without changing their question meanings', () => {
    expect(isSelectionAnswers(selection(1, 1, 1))).toBe(true);
    expect(isSelectionAnswers(current())).toBe(true);
    expect(isSelectionAnswers({ version: '2.0.0', answers: { 'selection-admissions': 1 } })).toBe(false);
    const scores = scoreAnswers('short', Object.fromEntries(selectQuestions('short').map(question => [question.id, 1 as const])));
    const result: QuizResult = { id: 'matching-v2', completedAt: '2026-10-06T00:00:00.000Z', length: 'short', questionBankVersion: '4.0.0', axesVersion: '2.0.0', scoringVersion: '2.0.0', scores, selection: current() };
    expect(parseHistory(serializeHistory([result]))[0]).toEqual(result);
  });
});

describe('approved preference question and religion fifth', () => {
  const current = (preference: -2 | -1 | 0 | 1 | 2): SelectionAnswers => ({ version: '3.0.0', answers: { 'matching-preference': preference, 'matching-ownership': 1, 'matching-state': 1, 'matching-party': 1 } });
  it.each([-2, -1, 0, 1, 2] as const)('Meritocracy eligibility follows opposition to preferences (%s)', preference => {
    expect(selectionEligible('meritocracy', current(preference))).toBe(preference < 0);
    expect(selectionEligible('socialism', current(preference))).toBe(true);
  });
  it('preserves the new answer version through export/import and rejects removed question IDs', () => {
    const scores = scoreAnswers('short', Object.fromEntries(selectQuestions('short').map(question => [question.id, 1 as const])));
    const result: QuizResult = { id: 'matching-v3', completedAt: '2026-10-06T00:00:00.000Z', length: 'short', questionBankVersion: '4.0.0', axesVersion: '2.0.0', scoringVersion: '2.0.0', scores, selection: current(-1), religiousIdentity: 'none' };
    expect(parseHistory(serializeHistory([result]))[0]).toEqual(result);
    expect(isSelectionAnswers({ version: '3.0.0', answers: { 'selection-access': 1 } })).toBe(false);
    expect(isSelectionAnswers({ version: '3.0.0', answers: { 'matching-merit': 1 } })).toBe(false);
  });
});
