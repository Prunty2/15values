import type { CSSProperties } from 'react';
import { axes, getFormat, topics } from './model';
import type { QuizResult } from './model';
import { wholePercent } from './profile';
import s from './ResultHistory.module.css';

export function ResultHistory({ results, activeId, onView, onDelete }: { results: QuizResult[]; activeId?: string; onView: (result: QuizResult) => void; onDelete: (id: string) => void }) {
  return <ul className={s.grid}>{results.map((result, index) => {
    const format = getFormat(result.length);
    const date = new Date(result.completedAt);
    return <li className={s.card} key={result.id}>
      <div className={s.top}><span className={s.format}>{format.name} quiz</span>{activeId === result.id ? <span className={s.label}>Viewing</span> : index === 0 ? <span className={s.label}>Latest result</span> : null}</div>
      <h3><time dateTime={result.completedAt}>{date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</time></h3>
      <p className={s.meta}>{date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })} · {format.questions} questions · 15 axes</p>
      <div className={s.preview} role="img" aria-label={`15-axis preview. ${axes.map(axis => { const score = result.scores.find(score => score.axisId === axis.id)!; return `${axis.left}: ${score.leftPercent}%, ${axis.right}: ${score.rightPercent}%`; }).join('. ')}`}>
        {axes.map(axis => {
          const score = result.scores.find(score => score.axisId === axis.id)!;
          const left = wholePercent(score.leftPercent);
          return <div className={s.axis} key={axis.id} title={`${axis.name}: ${left}% / ${100 - left}%`} aria-hidden="true"><span>{topics[axis.id]}</span><div className={s.track} style={{ '--position': `${score.rightPercent}%`, '--start': `${Math.min(50, score.rightPercent)}%`, '--distance': `${Math.abs(50 - score.rightPercent)}%` } as CSSProperties}><i /><b /></div></div>;
        })}
      </div>
      {result.scoringVersion === '1.0.0' ? <p className={s.legacy}>Original scoring</p> : null}
      <div className={s.actions}><button className={s.view} onClick={() => onView(result)}>View result <span aria-hidden="true">↗</span></button><button className={s.delete} aria-label={`Delete ${format.name.toLowerCase()} result from ${date.toLocaleString()}`} onClick={() => onDelete(result.id)}>Delete</button></div>
    </li>;
  })}</ul>;
}

export function EmptyHistory({ unavailable }: { unavailable: boolean }) {
  return <div className={s.empty}>
    <div className={s.illustration} aria-hidden="true"><div>{[35, 67, 44, 75, 56].map((position, index) => <span key={index}><i style={{ left: `${position}%` }} /></span>)}</div></div>
    <h3>{unavailable ? 'Your history is unavailable' : 'Your first perspective starts here.'}</h3>
    <p>{unavailable ? 'You can still take a quiz and view your results.' : 'Take a quiz to explore your views across 15 axes. Your completed results will be saved here.'}</p>
    <a className={s.start} href="#/quiz">{unavailable ? 'Take a quiz' : 'Take your first quiz'} <span aria-hidden="true">→</span></a>
  </div>;
}
