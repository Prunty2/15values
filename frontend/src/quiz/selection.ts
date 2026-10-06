import legacy from '../data/selection.v1.json' with { type: 'json' };
import previous from '../data/selection.v2.json' with { type: 'json' };
import data from '../data/selection.v3.json' with { type: 'json' };
import type { Answer } from './model.ts';
export const selectionQuestions = data.questions;
export type SelectionAnswers = { version: '1.0.0' | '2.0.0' | '3.0.0'; answers: Record<string, Answer> };
export type SelectionAssessment = SelectionAnswers & { evidence: { questionId: string; basis: 'direct' | 'inferred'; rationale: string; sources: { title: string; url: string }[] }[] };
export function isSelectionAnswers(value: unknown): value is SelectionAnswers {
  if (!value || typeof value !== 'object') return false;
  const entry = value as SelectionAnswers;
  const bank = entry.version === legacy.version ? legacy : entry.version === previous.version ? previous : entry.version === data.version ? data : null;
  return !!bank && !!entry.answers && typeof entry.answers === 'object' && !Array.isArray(entry.answers) &&
    Object.entries(entry.answers).every(([id, answer]) => bank.questions.some(question => question.id === id) && [-2, -1, 0, 1, 2].includes(answer));
}
export function isSelectionAssessment(value: unknown): value is SelectionAssessment {
  if (!isSelectionAnswers(value)) return false;
  const assessment = value as SelectionAssessment;
  return Array.isArray(assessment.evidence) && assessment.evidence.length === Object.keys(assessment.answers).length &&
    new Set(assessment.evidence.map(item => item.questionId)).size === assessment.evidence.length && assessment.evidence.every(item =>
      Object.hasOwn(assessment.answers, item.questionId) && ['direct', 'inferred'].includes(item.basis) && !!item.rationale?.trim() &&
      (item.basis !== 'inferred' || item.rationale.startsWith('Educated assumption:')) && Array.isArray(item.sources) && item.sources.length > 0 &&
      item.sources.every(source => !!source.title?.trim() && /^https?:\/\//.test(source.url)));
}
/** A defining commitment needs evidence in its recorded direction; absence is not support. */
export function selectionEligible(ideologyId: string | undefined, assessment?: SelectionAnswers) {
  const historical: Record<string, string[]> | undefined = assessment?.version === '1.0.0' && ideologyId === 'meritocracy' ? legacy.requirements : assessment?.version === '2.0.0' ? previous.requirements : undefined;
  const requirements: Record<string, { questionId: string; agree: number }[]> = historical ? Object.fromEntries(Object.entries(historical).map(([id, questions]) => [id, questions.map(questionId => ({ questionId, agree: 1 }))])) : data.requirements;
  const required = ideologyId && Object.hasOwn(requirements, ideologyId) ? requirements[ideologyId] : undefined;
  return !required || (!!assessment && isSelectionAnswers(assessment) && required.every(({ questionId, agree }) => Object.hasOwn(assessment.answers, questionId) && assessment.answers[questionId] * agree > 0));
}
