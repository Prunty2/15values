import { afterEach, describe, expect, it, vi } from 'vitest';
import { AXES_VERSION, QUESTION_BANK_VERSION, SCORING_VERSION, scoreAnswers, selectQuestions } from './model';
import type { Answers, QuizResult } from './model';
import { clearHistory, HISTORY_KEY, mergeHistory, parseHistory, readHistory, serializeHistory, writeHistory } from './history';
const result: QuizResult = {
  id: 'test-result', completedAt: '2026-10-03T14:00:00.000Z', length: 'short', questionBankVersion: QUESTION_BANK_VERSION,
  scoringVersion: SCORING_VERSION, axesVersion: AXES_VERSION,
  scores: scoreAnswers('short', Object.fromEntries(selectQuestions('short').map(q => [q.id, 0])) as Answers),
};
afterEach(() => vi.unstubAllGlobals());
describe('history validation', () => {
  it('retains the unscored religion answer and rejects invalid identities', () => {
    const religious = { ...result, religiousIdentity: 'hindu' as const };
    expect(parseHistory(serializeHistory([religious]))).toEqual([religious]);
    expect(() => parseHistory(JSON.stringify({ schemaVersion: 1, results: [{ ...result, religiousIdentity: 'invented' }] }))).toThrow();
    expect(parseHistory(serializeHistory([result]))[0].religiousIdentity).toBeUndefined();
  });
  it('round-trips supported scores without keeping raw answers or extra fields', () => {
    const withExtras = { ...result, answers: { private: 2 }, unwanted: 'data' };
    expect(parseHistory(serializeHistory([withExtras]))).toEqual([result]);
  });
  it('preserves legacy scores and version alongside current results', () => {
    const legacy = { ...result, id: 'legacy-result', scoringVersion: '1.0.0', scores: result.scores.map(score => ({ ...score, leftPercent: 66.7, rightPercent: 33.3 })) };
    expect(parseHistory(serializeHistory([legacy, result]))).toEqual([legacy, result]);
  });
  it('preserves version 1 bank and axis records after the version 2 upgrade', () => {
    const legacy = { ...result, questionBankVersion: '1.0.0', axesVersion: '1.0.0' };
    expect(parseHistory(serializeHistory([legacy]))).toEqual([legacy]);
    expect(() => parseHistory(serializeHistory([{ ...legacy, axesVersion: '2.0.0' }]))).toThrow();
  });
  it('rejects malformed, incompatible, oversized and duplicate results', () => {
    for (const input of ['invalid', 'null', '[]', '{"schemaVersion":2,"results":[]}', ' '.repeat(1_000_001)]) expect(() => parseHistory(input)).toThrow();
    const invalids = [
      { ...result, id: '<script>' }, { ...result, completedAt: 'tomorrow' }, { ...result, completedAt: '2026-13-10' },
      { ...result, length: 'unknown' }, { ...result, scoringVersion: 'future' }, { ...result, questionBankVersion: 'future' },
      { ...result, axesVersion: 'future' }, { ...result, scores: result.scores.slice(1) },
      { ...result, scores: result.scores.map(() => result.scores[0]) },
    ];
    invalids.forEach(value => expect(() => parseHistory(serializeHistory([value as QuizResult]))).toThrow());
    expect(() => parseHistory(serializeHistory([result, result]))).toThrow();
    expect(() => parseHistory(serializeHistory(Array.from({ length: 101 }, (_, i) => ({ ...result, id: `test-${i}` }))))).toThrow();
  });
  it.each([{ leftPercent: 120 }, { leftPercent: null }, { rightPercent: 55 }, { neutral: 4 }, { neutral: -1 }, { neutral: 1.5 }, { answered: 5 }, { axisId: 'unknown' }])('rejects malformed scores %j', change => {
    const edited = { ...result, scores: [{ ...result.scores[0], ...change }, ...result.scores.slice(1)] };
    expect(() => parseHistory(serializeHistory([edited as QuizResult]))).toThrow();
  });
  it('deduplicates repeat imports and rejects conflicting IDs without overwriting', () => {
    expect(mergeHistory([result], [result])).toEqual([result]);
    expect(() => mergeHistory([result], [{ ...result, completedAt: '2026-10-03T15:00:00.000Z' }])).toThrow(/conflicts/);
  });
});
describe('unavailable or invalid storage', () => {
  it('does not throw when localStorage access is denied', () => {
    vi.stubGlobal('window', { get localStorage() { throw new Error('Access denied'); } });
    expect(readHistory().error).toBeTruthy();
    expect(writeHistory([result])).toBeTruthy();
    expect(clearHistory()).toBeTruthy();
  });
  it('reads and writes only the owned key, reports quota errors and allows clearing corruption', () => {
    const values = new Map<string, string>([['other-app', 'preserve']]);
    const localStorage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } };
    vi.stubGlobal('window', { localStorage });
    expect(readHistory()).toEqual({ results: [], error: null });
    expect(writeHistory([result])).toBeNull();
    expect(readHistory().results).toEqual([result]);
    values.set(HISTORY_KEY, 'broken');
    expect(readHistory().error).toBeTruthy();
    expect(values.get(HISTORY_KEY)).toBe('broken');
    expect(clearHistory()).toBeNull();
    expect(values.get('other-app')).toBe('preserve');
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new Error('Quota'); });
    expect(writeHistory([result])).toMatch(/could not save/);
  });
});

it('preserves bank 2 history after the Authority–Liberty revision, without recalculating scores', () => {
  const previous = { ...result, questionBankVersion: '2.0.0', axesVersion: '2.0.0' };
  expect(parseHistory(serializeHistory([previous]))).toEqual([previous]);
});

it('preserves bank 3 scores after the bounded-policy revision', () => {
  const previous = { ...result, questionBankVersion: '3.0.0', axesVersion: '2.0.0', scores: result.scores.map(s => ({ ...s, leftPercent: 46.9, rightPercent: 53.1 })) };
  expect(parseHistory(serializeHistory([previous]))).toEqual([previous]);
});
