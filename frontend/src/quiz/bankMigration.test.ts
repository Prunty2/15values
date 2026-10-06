import { describe, expect, it } from 'vitest';
import legacyQuestions from '../data/questions.v1.json' with { type: 'json' };
import previousQuestions from '../data/questions.v2.json' with { type: 'json' };
import authorityQuestions from '../data/questions.v3.json' with { type: 'json' };
import legacyAxes from '../data/axes.v1.json' with { type: 'json' };
import { axes, axesForVersion, AXES_VERSION, questions, selectQuestions, formats, QUESTION_BANK_VERSION, SCORING_VERSION } from './model';

describe('Democracy–Autocracy bank migration', () => {
  it('changes only the six authorised statements while preserving IDs, directions and priorities', () => {
    expect(previousQuestions.version).toBe('2.0.0');
    expect(AXES_VERSION).toBe('2.0.0');
    expect(SCORING_VERSION).toBe('2.0.0');
    const changed: string[] = [];
    for (const [index, question] of previousQuestions.questions.entries()) {
      const old = legacyQuestions.questions[index];
      expect({ ...question, text: old.text }).toEqual(old);
      if (question.text !== old.text) changed.push(question.id);
    }
    expect(changed).toEqual([2, 4, 6, 8, 11, 13].map(n => `democracy-autocracy-${String(n).padStart(2, '0')}`));
    expect(axes.map(a => a.name)).toEqual(legacyAxes.axes.map(a => a.name));
    expect(axes.slice(1)).toEqual(legacyAxes.axes.slice(1));
  });
  it('uses the original definition for historical results', () => {
    expect(axesForVersion('1.0.0')[0].description).toBe(legacyAxes.axes[0].description);
    expect(axesForVersion('2.0.0')).toBe(axes);
  });
});

describe('Authority–Liberty bank migration', () => {
  it('changes only the nine reviewed items and keeps scoring, axes, directions and nested priorities', () => {
    expect(authorityQuestions.version).toBe('3.0.0');
    expect(AXES_VERSION).toBe('2.0.0');
    expect(SCORING_VERSION).toBe('2.0.0');
    const changed: string[] = [];
    for (const [index, question] of authorityQuestions.questions.entries()) {
      const old = previousQuestions.questions[index];
      expect({ ...question, text: old.text }).toEqual(old);
      if (question.text !== old.text) changed.push(question.id);
    }
    expect(changed).toEqual([1, 2, 3, 4, 7, 8, 11, 12, 13].map(n => 'authority-liberty-' + String(n).padStart(2, '0')));
    const bank = authorityQuestions.questions.filter(q => q.axisId === 'authority-liberty');
    expect(bank[0].text).toBe(previousQuestions.questions.find(q => q.id === 'authority-liberty-04')!.text);
    expect(bank[2].text).toBe(previousQuestions.questions.find(q => q.id === 'authority-liberty-13')!.text);
    expect(bank[3].text).toBe(previousQuestions.questions.find(q => q.id === 'authority-liberty-01')!.text);
    expect(bank[12].text).toBe(previousQuestions.questions.find(q => q.id === 'authority-liberty-03')!.text);
    expect(bank[1].text).toContain('in bulk');
    expect(bank[7].text).toContain('independent court');
  });
});


describe('bounded-policy Authority–Liberty bank migration', () => {
  it('changes six records with unchanged directions, priorities, axis definitions and scoring', () => {
    expect(QUESTION_BANK_VERSION).toBe('4.0.0');
    expect(AXES_VERSION).toBe('2.0.0');
    expect(SCORING_VERSION).toBe('2.0.0');
    const changed: string[] = [];
    for (const [index, question] of questions.entries()) {
      const old = authorityQuestions.questions[index];
      expect({ ...question, text: old.text }).toEqual(old);
      if (question.text !== old.text) changed.push(question.id);
    }
    expect(changed).toEqual([3, 7, 8, 11, 12, 15].map(n => 'authority-liberty-' + String(n).padStart(2, '0')));
    const bank = questions.filter(q => q.axisId === 'authority-liberty');
    expect(bank[2].text).toBe(authorityQuestions.questions.find(q => q.id === 'authority-liberty-15')!.text);
    expect(bank[14].text).toBe(authorityQuestions.questions.find(q => q.id === 'authority-liberty-03')!.text);
    expect(bank.filter(q => q.agreePole === 'left')).toHaveLength(8);
    expect(bank.filter(q => q.agreePole === 'right')).toHaveLength(8);
    expect(bank[7].text).toContain('regular judicial review');
    expect(bank[10].text).toContain('for a limited period');
    expect(bank[11].text).toContain('does not directly threaten violence');
  });
});

it.each(formats)("$name includes civilian firearm rights", format => {
  const selected = selectQuestions(format.id).filter(q => q.axisId === "authority-liberty");
  expect(selected.filter(q => q.text.includes("own firearms"))).toHaveLength(1);
});
