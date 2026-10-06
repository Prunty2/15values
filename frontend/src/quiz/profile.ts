import { axes, type AxisScore } from './model';

// Round distance from 50 so half-point ties treat the two poles symmetrically.
export const wholePercent = (percent: number) => 50 + Math.sign(percent - 50) * Math.round(Math.abs(percent - 50));

// Both poles use the same thresholds. These describe distance, never confidence.
export function tendency(score: AxisScore) {
  const distance = Math.abs(wholePercent(score.leftPercent) - 50);
  return distance <= 5 ? 'Balanced' : distance <= 15 ? 'Leaning' : distance <= 25 ? '' : 'Strongly';
}


/** A descriptive midpoint result, independent of the available political catalogue. */
export function isCentristResult(result: { scores: AxisScore[] }) {
  return result.scores.length === axes.length && axes.every(axis => {
    const score = result.scores.find(item => item.axisId === axis.id);
    return score?.leftPercent === 50 && score.rightPercent === 50;
  });
}
