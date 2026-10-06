import type { CSSProperties } from 'react';
import s from '../App.module.css';

export default function SimilarityRing({ percentage, className = '', decimals = 1 }: { percentage: number; className?: string; decimals?: number }) {
  const value = percentage.toFixed(decimals);
  return <div className={`${s.matchRing} ${className}`} style={{ '--match-percentage': `${percentage} 100` } as CSSProperties} role="img" aria-label={`${value}% similarity across 15 axes`}>
    <svg viewBox="0 0 104 104" aria-hidden="true"><circle className={s.ringTrack} cx="52" cy="52" r="47" /><circle className={s.ringFill} cx="52" cy="52" r="47" pathLength="100" /></svg>
    <div><strong>{value}%</strong><span>Similarity</span></div>
  </div>;
}
