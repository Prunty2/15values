import { describe, expect, it } from 'vitest';
import { scoreAnswers, selectQuestions } from './model';
import type { Answers } from './model';
import { tendency, wholePercent } from './profile';

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
    for (const [leftPercent, label] of [[40, 'Balanced'], [60, 'Balanced'], [39.9, 'Leaning'], [60.1, 'Leaning'], [25, 'Strong'], [75, 'Strong']] as const) {
      expect(tendency({ ...neutral[0], leftPercent, rightPercent: 100 - leftPercent })).toBe(label);
    }
  });
});
