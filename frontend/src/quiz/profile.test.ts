import { describe, expect, it } from 'vitest';
import { scoreAnswers, selectQuestions } from './model';
import type { Answers } from './model';
import { isCentristResult, tendency, wholePercent } from './profile';

const neutral = scoreAnswers('short', Object.fromEntries(selectQuestions('short').map(q => [q.id, 0])) as Answers);
describe('descriptive result profile', () => {
  it('rounds displayed percentages without favouring the left pole on half-point ties', () => {
    for (const value of [0, 12.5, 25, 37.5, 43.7, 50, 56.3, 62.5, 75, 87.5, 100]) {
      expect(wholePercent(value) + wholePercent(100 - value)).toBe(100);
    }
    expect(wholePercent(62.5)).toBe(63);
    expect(wholePercent(37.5)).toBe(37);
  });
  it('uses the same tendency thresholds for both poles', () => {
    for (const [distance, label] of [[0, 'Balanced'], [5, 'Balanced'], [5.4, 'Balanced'], [5.5, 'Leaning'], [6, 'Leaning'], [15, 'Leaning'], [15.4, 'Leaning'], [15.5, ''], [16, ''], [25, ''], [25.4, ''], [25.5, 'Strongly'], [26, 'Strongly'], [50, 'Strongly']] as const) {
      for (const direction of [-1, 1]) {
        const leftPercent = 50 + direction * distance;
        expect(tendency({ ...neutral[0], leftPercent, rightPercent: 100 - leftPercent })).toBe(label);
      }
    }
  });
});

it.each(['short', 'medium', 'long', 'comprehensive'] as const)('recognises all-neutral %s results as Centrism', length => {
  const scores = scoreAnswers(length, Object.fromEntries(selectQuestions(length).map(q => [q.id, 0])) as Answers);
  expect(scores.every(score => score.leftPercent === 50 && score.rightPercent === 50)).toBe(true);
  expect(isCentristResult({ scores })).toBe(true);
  expect(isCentristResult({ scores: scores.map((score, index) => index ? score : { ...score, leftPercent: 51, rightPercent: 49 }) })).toBe(false);
  expect(isCentristResult({ scores: [] })).toBe(false);
});
