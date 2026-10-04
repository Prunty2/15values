import axisData from '../data/axes.v1.json' with { type: 'json' };
import questionData from '../data/questions.v1.json' with { type: 'json' };

export const axes = axisData.axes;
export const QUESTION_BANK_VERSION = questionData.version;
export const SCORING_VERSION = '2.0.0';
export const AXES_VERSION = axisData.version;
export const formats = [
  { id: 'short', name: 'Short', perAxis: 3, questions: 45, description: 'A first look at your political values.' },
  { id: 'medium', name: 'Medium', perAxis: 5, questions: 75, description: 'More room to reflect on your views.' },
  { id: 'long', name: 'Long', perAxis: 9, questions: 135, description: 'A deeper exploration of your beliefs.' },
  { id: 'comprehensive', name: 'Comprehensive', perAxis: 16, questions: 240, description: 'The full set of questions on every axis.' },
] as const;
export type QuizLength = typeof formats[number]['id'];
export const answerOptions = [
  { value: 2, label: 'Strongly agree', symbol: '++' },
  { value: 1, label: 'Agree', symbol: '+' },
  { value: 0, label: 'Neutral', symbol: '·' },
  { value: -1, label: 'Disagree', symbol: '−' },
  { value: -2, label: 'Strongly disagree', symbol: '−−' },
] as const;
export type Answer = typeof answerOptions[number]['value'];
export type Answers = Record<string, Answer>;
export type Question = { id: string; axisId: string; priority: number; agreePole: 'left' | 'right'; text: string; status: string };
export const questions = questionData.questions as Question[];
export const topics: Record<string, string> = {
  'democracy-autocracy': 'Representation', 'authority-liberty': 'Power & freedom',
  'assimilation-multiculturalism': 'Cultural identity', 'restricted-immigration-open-immigration': 'Immigration',
  'militarist-pacifist': 'Military & diplomacy', 'nationalism-internationalism': 'Sovereignty',
  'public-private': 'Ownership', 'protectionism-free-trade': 'Trade', 'planning-free-market': 'Economic control',
  'high-redistribution-low-redistribution': 'Redistribution', 'secular-religious': 'Religion & government',
  'progressive-traditionalist': 'Social change', 'innovation-caution': 'Development',
  'central-local': 'Government structure', 'culture-nature': 'Human behaviour',
};
export function isQuizLength(value: unknown): value is QuizLength {
  return formats.some(format => format.id === value);
}
export function getFormat(length: QuizLength) {
  const format = formats.find(format => format.id === length);
  if (!format) throw new Error('Unknown quiz length.');
  return format;
}

/** Fixed rounds across the axes: all priority-1 items, then priority-2, and so on. */
export function selectQuestions(length: QuizLength): Question[] {
  const { perAxis } = getFormat(length);
  const axisOrder = new Map(axes.map((axis, index) => [axis.id, index]));
  return questions.filter(question => question.priority <= perAxis)
    .sort((a, b) => a.priority - b.priority || axisOrder.get(a.axisId)! - axisOrder.get(b.axisId)!);
}
export type AxisScore = { axisId: string; leftPercent: number; rightPercent: number; answered: number; neutral: number };
export type QuizResult = {
  id: string; completedAt: string; length: QuizLength;
  questionBankVersion: string; scoringVersion: string; axesVersion: string; scores: AxisScore[];
};
const round = (value: number) => Math.round(value * 10) / 10;

/** Each agreement-direction group supplies half the axis evidence; equal weights within groups. */
export function scoreAnswers(length: QuizLength, answers: Answers): AxisScore[] {
  const selected = selectQuestions(length);
  const allowed = new Set(selected.map(question => question.id));
  if (Object.keys(answers).length !== selected.length || Object.keys(answers).some(id => !allowed.has(id))) {
    throw new Error('A result requires exactly the questions in the chosen quiz.');
  }
  const totals = new Map(axes.map(axis => [axis.id, { left: { total: 0, count: 0 }, right: { total: 0, count: 0 }, answered: 0, neutral: 0 }]));
  for (const question of selected) {
    const answer = answers[question.id];
    if (!Object.hasOwn(answers, question.id) || !answerOptions.some(option => option.value === answer)) {
      throw new Error('Every question needs a valid answer before calculating a result.');
    }
    const score = totals.get(question.axisId)!;
    score[question.agreePole].total += answer;
    score[question.agreePole].count++;
    score.answered++;
    if (answer === 0) score.neutral++;
  }
  return axes.map(axis => {
    const { left, right, answered, neutral } = totals.get(axis.id)!;
    const displacement = 12.5 * (left.total / left.count - right.total / right.count);
    // Round distance from the midpoint so reversing all answers remains exactly symmetric.
    const leftPercent = round(50 + Math.sign(displacement) * round(Math.abs(displacement)));
    return { axisId: axis.id, leftPercent, rightPercent: round(100 - leftPercent), answered, neutral };
  });
}
