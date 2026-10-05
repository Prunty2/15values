import type { CSSProperties } from 'react';
import ValueIcon from '../components/ValueIcon';
import { axes, topics } from './model';
import type { QuizResult } from './model';
import { tendency, wholePercent } from './profile';
import a from '../App.module.css';
import s from './ResultProfile.module.css';

const colours = ['#b82d62', '#3e6184', '#8c4a75', '#a56526', '#6b802d', '#b75527', '#cc4834', '#377773', '#87683d', '#94613e', '#7263a0', '#398077', '#687c36', '#447892', '#936449'];

const softBreaks: Record<string, string> = { Multiculturalism: 'Multi\u00adculturalism', Internationalism: 'Inter\u00adnationalism', Traditionalist: 'Tradi\u00adtionalist', Redistribution: 'Redis\u00adtribution' };
const poleLabel = (label: string) => label.replace(/Multiculturalism|Internationalism|Traditionalist|Redistribution/g, word => softBreaks[word]);

export function ProfileOverview() {
  return <div className={s.overview}>
    <section className={`${a.exampleResult} ${s.comparison}`} aria-label="Comparison placeholders">
      <div className={a.resultHeader}>
        <div className={a.resultIdeology}><span className={a.positionBadge}>Ideology placeholder</span><h2>Your ideology</h2></div>
        <div className={a.matchRing} role="img" aria-label="Ideology match not yet calculated">
          <svg viewBox="0 0 104 104" aria-hidden="true"><circle className={a.ringTrack} cx="52" cy="52" r="47" /></svg>
          <div><strong>—</strong><span>Match</span></div>
        </div>
      </div>
      <div className={a.comparisonRow}>
        <div className={s.placeholderIcon} aria-hidden="true"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="16" cy="11" r="5" /><path d="M6 28v-3a10 10 0 0 1 20 0v3" /></svg></div>
        <div className={a.comparisonCopy}><span className={a.comparisonLabel}>Most compatible personality</span><h3>Coming soon</h3><span className={a.comparisonDescription}>Personality placeholder</span></div>
      </div>
      <div className={a.comparisonRow}>
        <div className={s.placeholderIcon}><ValueIcon value="Internationalism" /></div>
        <div className={a.comparisonCopy}><span className={a.comparisonLabel}>Most compatible country</span><h3>Coming soon</h3><span className={a.comparisonDescription}>Country placeholder</span></div>
      </div>
    </section>
    <section className={s.quote} aria-labelledby="profile-sentence-title">
      <span className={s.quoteMark} aria-hidden="true">“</span>
      <div><h2 id="profile-sentence-title">— A sentence that describes you</h2><blockquote>Your ideology’s perspective will appear here.</blockquote><p>A broad statement about the society your ideology envisions. Coming with ideology matching.</p></div>
    </section>
  </div>;
}

export function ResultAxes({ result, compact = false }: { result: Pick<QuizResult, 'scores'>; compact?: boolean }) {
  return <section className={`${s.axes} ${compact ? s.compact : ''}`} aria-labelledby="axes-results-title">
    <div className={s.sectionHeading}><span>— Political axes</span><h2 id="axes-results-title">Percentage result per axis</h2></div>
    <div>{axes.map((axis, index) => {
      const score = result.scores.find(score => score.axisId === axis.id)!;
      const label = tendency(score);
      const balanced = label === 'Balanced';
      const left = wholePercent(score.leftPercent);
      const position = score.rightPercent;
      const colour = balanced ? '#98978b' : colours[index];
      return <article className={s.axis} key={axis.id} aria-label={axis.name} style={{ '--axis-colour': colour } as CSSProperties}>
        <div className={s.axisHeading}>
          <div className={s.topic}><h3>{topics[axis.id]}</h3><details className={s.info}><summary aria-label={`About ${axis.name}`}><span className={s.helpIcon} aria-hidden="true">?</span></summary><div><strong>{axis.name}</strong><p>{axis.description.trim()}</p><p>{score.answered} questions · {score.neutral === score.answered ? 'All responses neutral' : `${score.neutral} neutral ${score.neutral === 1 ? 'response' : 'responses'}`}</p><p>{axis.left}: {score.leftPercent}% · {axis.right}: {score.rightPercent}%</p></div></details></div>
          <span className={s.badge}><i />{label}{balanced ? '' : ` · ${score.leftPercent > 50 ? axis.left : axis.right}`}</span>
        </div>
        <div className={s.scale}>
          <div className={s.pole} data-active={!balanced && score.leftPercent > 50}><ValueIcon value={axis.left} /><div><strong aria-label={axis.left}>{poleLabel(axis.left)}</strong><span>{left}%</span></div></div>
          <div className={s.track} role="img" aria-label={`${axis.left}: ${score.leftPercent}%; ${axis.right}: ${score.rightPercent}%`}>
            <span className={s.trackBase} /><span className={s.trackFill} style={{ left: `${Math.min(50, position)}%`, width: `${Math.abs(position - 50)}%` }} /><span className={s.midpoint} /><span className={s.marker} style={{ left: `${position}%` }} />
          </div>
          <div className={`${s.pole} ${s.rightPole}`} data-active={!balanced && score.rightPercent > 50}><ValueIcon value={axis.right} /><div><strong aria-label={axis.right}>{poleLabel(axis.right)}</strong><span>{100 - left}%</span></div></div>
        </div>
        {score.neutral === score.answered ? <span className={s.neutralNote}>All responses neutral</span> : null}
      </article>;
    })}</div>
  </section>;
}
