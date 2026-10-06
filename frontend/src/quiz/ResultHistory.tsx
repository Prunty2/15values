import Arrow from '../components/Arrow';
import type { CSSProperties } from 'react';
import { ProfileOverview, resultColour, useResultCatalogue } from './ResultProfile';
import { getFormat } from './model';
import type { QuizResult } from './model';
import s from './ResultHistory.module.css';

export function ResultHistory({ results, activeId, onView, onDelete }: { results: QuizResult[]; activeId?: string; onView: (result: QuizResult) => void; onDelete: (id: string) => void }) {
  const catalogue = useResultCatalogue(results.length > 0);
  return <ul className={s.grid}>{results.map((result, index) => {
    const format = getFormat(result.length);
    const date = new Date(result.completedAt);
    const colour = resultColour(result, catalogue.profiles);
    return <li className={s.card} key={result.id} style={{ '--saved-colour': colour } as CSSProperties}>
      <div className={s.top}><span className={s.format}>{format.questions} questions</span>{activeId === result.id ? <span className={s.label}>Viewing</span> : index === 0 ? <span className={s.label}>Latest result</span> : null}</div>
      <div className={s.summary}>
        <div className={s.calendar} aria-hidden="true"><span>{date.toLocaleDateString(undefined, { month: 'short' })}</span><strong>{date.getDate()}</strong></div>
        <div><h3>Quiz type: {format.name}</h3><p className={s.meta}><time dateTime={result.completedAt}>{date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</time><span>{date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</span></p></div>
      </div>
      <ProfileOverview result={result} state={catalogue} compact />
      {result.scoringVersion === '1.0.0' ? <p className={s.legacy}>Original scoring</p> : null}
      <div className={s.actions}><button className={s.view} onClick={() => onView(result)}>View result <Arrow /></button><button className={s.delete} aria-label={`Delete ${format.name.toLowerCase()} result from ${date.toLocaleString()}`} onClick={() => onDelete(result.id)}>Delete</button></div>
    </li>;
  })}</ul>;
}

export function EmptyHistory({ unavailable }: { unavailable: boolean }) {
  return <div className={s.empty}>
    <div className={s.illustration} aria-hidden="true"><div>{[35, 67, 44, 75, 56].map((position, index) => <span key={index}><i style={{ left: `${position}%` }} /></span>)}</div></div>
    <h3>{unavailable ? 'Your history is unavailable' : 'Your first perspective starts here.'}</h3>
    <p>{unavailable ? 'You can still take a quiz and view your results.' : 'Take a quiz to explore your views across 15 axes. Your completed results will be saved here.'}</p>
    <a className={s.start} href="#/quiz">{unavailable ? 'Take a quiz' : 'Take your first quiz'} <Arrow /></a>
  </div>;
}
