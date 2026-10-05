import type { AxisScore } from './model';

// Round distance from 50 so half-point ties treat the two poles symmetrically.
export const wholePercent = (percent: number) => 50 + Math.sign(percent - 50) * Math.round(Math.abs(percent - 50));

// Both poles use the same thresholds. These describe distance, never confidence.
export function tendency(score: AxisScore) {
  const distance = Math.abs(wholePercent(score.leftPercent) - 50);
  return distance <= 5 ? 'Balanced' : distance <= 15 ? 'Leaning' : distance <= 25 ? '' : 'Strongly';
}

