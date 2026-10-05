import { describe, expect, it } from 'vitest';
import { axes, formats, questions, scoreAnswers, selectQuestions } from './model';
import type { Answer, Answers, QuizLength } from './model';
import { readFileSync } from 'node:fs';

const answerAll = (length: QuizLength, value: Answer): Answers => Object.fromEntries(selectQuestions(length).map(question => [question.id, value]));
describe('versioned question bank', () => {
  it('preserves all source wording, direction and inclusion priorities', () => {
    expect(questions).toHaveLength(240);
    expect(new Set(questions.map(question => question.id)).size).toBe(240);
    for (const axis of axes) {
      const source = readFileSync(new URL(`../../../docs/questions/${axis.id}.md`, import.meta.url), 'utf8');
      const entries = [...source.matchAll(/^(\d+)\. (.+)$/gm)];
      const direction = [...source.matchAll(/^- ([^:]+): ([\d, ]+)\./gm)];
      const left = new Set(direction[0][2].split(',').map(Number));
      const bank = questions.filter(question => question.axisId === axis.id);
      expect(bank).toHaveLength(16);
      expect(bank.map(question => question.priority)).toEqual(Array.from({ length: 16 }, (_, i) => i + 1));
      bank.forEach((question, i) => {
        expect(question.text).toBe(entries[i][2]);
        expect(question.agreePole).toBe(left.has(question.priority) ? 'left' : 'right');
      });
    }
  });
  it('selects deterministic nested sets with balanced directions on every axis', () => {
    let previous: string[] = [];
    for (const format of formats) {
      const selected = selectQuestions(format.id);
      expect(selected).toHaveLength(format.questions);
      expect(selectQuestions(format.id)).toEqual(selected);
      expect(selected.slice(0, previous.length).map(question => question.id)).toEqual(previous);
      for (const axis of axes) {
        const subset = selected.filter(question => question.axisId === axis.id);
        expect(subset).toHaveLength(format.perAxis);
        expect(subset.map(question => question.priority)).toEqual(Array.from({ length: format.perAxis }, (_, i) => i + 1));
        const left = subset.filter(question => question.agreePole === 'left').length;
        expect(Math.abs(left - (format.perAxis - left))).toBe(format.perAxis % 2);
      }
      previous = selected.map(question => question.id);
    }
  });
});
describe.each(formats)('$name scoring', format => {
  it('scores neutral answers as exactly 50/50, with explicit neutral counts', () => {
    for (const score of scoreAnswers(format.id, answerAll(format.id, 0))) {
      expect(score).toMatchObject({ leftPercent: 50, rightPercent: 50, neutral: format.perAxis, answered: format.perAxis });
    }
  });
  it.each([['left', 100], ['right', 0]] as const)('reaches the %s pole without leaking into other axes', (pole, leftPercent) => {
    const answers: Answers = Object.fromEntries(selectQuestions(format.id).map(question => [question.id, question.agreePole === pole ? 2 : -2]));
    const result = scoreAnswers(format.id, answers);
    expect(result.every(score => score.leftPercent === leftPercent && score.rightPercent === 100 - leftPercent)).toBe(true);
    const first = selectQuestions(format.id)[0];
    answers[first.id] = 0;
    const changed = scoreAnswers(format.id, answers);
    expect(changed[0]).not.toEqual(result[0]);
    expect(changed.slice(1)).toEqual(result.slice(1));
  });
  it('keeps ordinary agreement halfway between neutral and the strong response', () => {
    const answers: Answers = Object.fromEntries(selectQuestions(format.id).map(question => [question.id, question.agreePole === 'left' ? 1 : -1]));
    expect(scoreAnswers(format.id, answers).every(score => score.leftPercent === 75 && score.rightPercent === 25)).toBe(true);
  });
  it('is symmetric under reversing every response and preserves complements', () => {
    const values: Answer[] = [2, 0, -1, 1, -2];
    const answers: Answers = Object.fromEntries(selectQuestions(format.id).map((q, index) => [q.id, values[index % values.length]]));
    const reversed = Object.fromEntries(Object.entries(answers).map(([id, value]) => [id, -value])) as Answers;
    const first = scoreAnswers(format.id, answers);
    const second = scoreAnswers(format.id, reversed);
    first.forEach((score, index) => {
      expect(score.leftPercent + score.rightPercent).toBeCloseTo(100);
      expect(second[index].leftPercent).toBeCloseTo(score.rightPercent);
      expect(score.leftPercent).toBeGreaterThanOrEqual(0);
      expect(score.leftPercent).toBeLessThanOrEqual(100);
    });
  });
  it('rejects missing, extra, foreign-format and invalid answers', () => {
    const valid = answerAll(format.id, 0);
    const first = selectQuestions(format.id)[0].id;
    const incomplete = { ...valid }; delete incomplete[first];
    expect(() => scoreAnswers(format.id, incomplete)).toThrow();
    expect(() => scoreAnswers(format.id, { ...valid, unknown: 2 })).toThrow();
    for (const invalid of [null, undefined, 3, -3, NaN, Infinity, '0', true]) {
      expect(() => scoreAnswers(format.id, { ...valid, [first]: invalid } as Answers)).toThrow();
    }
  });
});
it('balances blanket responses in every format without privileging a pole', () => {
  for (const format of formats) for (const answer of [-2, -1, 0, 1, 2] as Answer[]) {
    expect(scoreAnswers(format.id, answerAll(format.id, answer)).every(score => score.leftPercent === 50 && score.rightPercent === 50)).toBe(true);
  }
});
it('gives each direction half the evidence and retains the comprehensive equal-weight result', () => {
  const answers = answerAll('short', 0);
  const firstAxis = selectQuestions('short').filter(q => q.axisId === axes[0].id);
  const left = firstAxis.filter(q => q.agreePole === 'left');
  const right = firstAxis.filter(q => q.agreePole === 'right');
  expect(left).toHaveLength(2);
  expect(right).toHaveLength(1);
  answers[left[0].id] = 2;
  expect(scoreAnswers('short', answers)[0].leftPercent).toBe(62.5);
  answers[left[1].id] = 2;
  expect(scoreAnswers('short', answers)[0].leftPercent).toBe(75);
  answers[right[0].id] = 2;
  expect(scoreAnswers('short', answers)[0].leftPercent).toBe(50);
  const comprehensive = answerAll('comprehensive', 0);
  comprehensive[selectQuestions('comprehensive')[0].id] = 2;
  expect(scoreAnswers('comprehensive', comprehensive)[0].leftPercent).toBe(53.1);
});
it('exhaustively checks all 125 short-axis patterns for symmetry, range and monotonicity', () => {
  const selected = selectQuestions('short').filter(q => q.axisId === axes[0].id);
  const values: Answer[] = [-2, -1, 0, 1, 2];
  const placements = new Set<number>();
  for (const a of values) for (const b of values) for (const c of values) {
    const answers = answerAll('short', 0);
    [a, b, c].forEach((value, i) => { answers[selected[i].id] = value; });
    const original = scoreAnswers('short', answers)[0];
    placements.add(original.leftPercent);
    const reversed = Object.fromEntries(Object.entries(answers).map(([id, value]) => [id, -value])) as Answers;
    expect(scoreAnswers('short', reversed)[0].leftPercent).toBe(original.rightPercent);
    expect(original.leftPercent).toBeGreaterThanOrEqual(0);
    expect(original.leftPercent).toBeLessThanOrEqual(100);
    for (const question of selected) {
      const value = answers[question.id];
      if (value === 2) continue;
      const next = scoreAnswers('short', { ...answers, [question.id]: value + 1 } as Answers)[0];
      expect((next.leftPercent - original.leftPercent) * (question.agreePole === 'left' ? 1 : -1)).toBeGreaterThan(0);
    }
  }
  expect(placements.size).toBe(17);
  expect(placements.has(66.7)).toBe(false);
  expect(placements.has(33.3)).toBe(false);
});
