import { isReligiousIdentity } from './religion';
import { axes, AXES_VERSION, QUESTION_BANK_VERSION, SCORING_VERSION, getFormat, isQuizLength } from './model';
import type { QuizResult } from './model';

export const HISTORY_KEY = '15-values:history:v1';
export const MAX_RESULTS = 100;
export type HistoryFile = { schemaVersion: 1; results: QuizResult[] };
export type HistoryState = { results: QuizResult[]; error: string | null };
const invalid = () => new Error('This is not a supported 15 Values history file. No saved results have been changed.');
const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

/** Validate untrusted imports/storage, then rebuild only the fields we actually retain. */
export function parseHistory(text: string): QuizResult[] {
  if (text.length > 1_000_000) throw invalid();
  const value: unknown = JSON.parse(text);
  if (!record(value) || value.schemaVersion !== 1 || !Array.isArray(value.results) || value.results.length > MAX_RESULTS) throw invalid();
  const ids = new Set<string>();
  return value.results.map((result: unknown) => {
    if (!record(result) || typeof result.id !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(result.id) || ids.has(result.id)
      || typeof result.completedAt !== 'string' || !Number.isFinite(Date.parse(result.completedAt))
      || new Date(result.completedAt).toISOString() !== result.completedAt || !isQuizLength(result.length)
      || !(((result.questionBankVersion === QUESTION_BANK_VERSION || result.questionBankVersion === '2.0.0' || result.questionBankVersion === '3.0.0') && result.axesVersion === AXES_VERSION) || (result.questionBankVersion === '1.0.0' && result.axesVersion === '1.0.0')) || (result.scoringVersion !== SCORING_VERSION && result.scoringVersion !== '1.0.0')
      || !Array.isArray(result.scores) || result.scores.length !== axes.length) throw invalid();
    if (result.religiousIdentity !== undefined && !isReligiousIdentity(result.religiousIdentity)) throw invalid();
    ids.add(result.id);
    const perAxis = getFormat(result.length).perAxis;
    const rawScores = result.scores;
    const scores = axes.map(axis => {
      const matches = rawScores.filter((score: unknown) => record(score) && score.axisId === axis.id);
      if (matches.length !== 1) throw invalid();
      const score = matches[0];
      if (!record(score) || typeof score.leftPercent !== 'number' || !Number.isFinite(score.leftPercent) || score.leftPercent < 0 || score.leftPercent > 100
        || typeof score.rightPercent !== 'number' || !Number.isFinite(score.rightPercent) || Math.abs(score.leftPercent + score.rightPercent - 100) > 0.00001
        || score.rightPercent < 0 || score.rightPercent > 100 || score.answered !== perAxis
        || typeof score.neutral !== 'number' || !Number.isInteger(score.neutral) || score.neutral < 0 || score.neutral > perAxis) throw invalid();
      return { axisId: axis.id, leftPercent: score.leftPercent, rightPercent: score.rightPercent, answered: perAxis, neutral: score.neutral };
    });
    return { ...(result.religiousIdentity !== undefined ? { religiousIdentity: result.religiousIdentity } : {}), id: result.id, completedAt: result.completedAt, length: result.length, questionBankVersion: result.questionBankVersion as string, scoringVersion: result.scoringVersion as string, axesVersion: result.axesVersion as string, scores };
  });
}
export function serializeHistory(results: QuizResult[]): string {
  return JSON.stringify({ schemaVersion: 1, results } satisfies HistoryFile, null, 2);
}
export function readHistory(): HistoryState {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return { results: raw === null ? [] : parseHistory(raw), error: null };
  } catch {
    return { results: [], error: 'Saved history could not be read. Browser storage may be unavailable, or the saved data may be invalid. Export your current result, or clear history to try again.' };
  }
}
export function writeHistory(results: QuizResult[]): string | null {
  try {
    if (results.length > MAX_RESULTS) return 'History is full (100 results). Export or delete an older result before saving another.';
    const text = serializeHistory(results);
    parseHistory(text);
    window.localStorage.setItem(HISTORY_KEY, text);
    return null;
  } catch {
    return 'This browser could not save your results. You can still export them as a JSON file.';
  }
}
export function clearHistory(): string | null {
  try { window.localStorage.removeItem(HISTORY_KEY); return null; }
  catch { return 'This browser could not clear history. Check your browser’s storage settings.'; }
}
export function mergeHistory(existing: QuizResult[], incoming: QuizResult[]): QuizResult[] {
  const byId = new Map(existing.map(result => [result.id, result]));
  for (const result of incoming) {
    const saved = byId.get(result.id);
    if (saved && JSON.stringify(saved) !== JSON.stringify(result)) throw new Error('A result ID conflicts with your saved history. Nothing has been changed.');
    byId.set(result.id, result);
  }
  const combined = [...byId.values()];
  if (combined.length > MAX_RESULTS) throw new Error('Import would exceed 100 saved results. Delete or export older results first.');
  return combined.sort((a, b) => b.completedAt.localeCompare(a.completedAt));
}
export function downloadResults(results: QuizResult[], filename: string) {
  const url = URL.createObjectURL(new Blob([serializeHistory(results)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
