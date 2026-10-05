import { useEffect, useState, type CSSProperties } from 'react';
import { similarity } from '../profiles/audit';
import { parseCatalogue } from '../profiles/catalogueData';
import { ideologyComparisonDetails, matchResultIdeology } from '../profiles/ideologyMatching';
import { ideologyGroup } from '../profiles/ideologyGroups';
import { personalityGroup } from '../profiles/personalityGroups';
import type { Profile } from '../profiles/types';
import ValueIcon from '../components/ValueIcon';
import { axes, topics } from './model';
import type { QuizResult } from './model';
import { tendency, wholePercent } from './profile';
import a from '../App.module.css';
import s from './ResultProfile.module.css';

const comparisonColour = (profile: Profile) => (profile.catalogue === 'ideology' ? ideologyGroup(profile) : personalityGroup(profile)).color;

const colours = ['#b82d62', '#3e6184', '#8c4a75', '#a56526', '#6b802d', '#b75527', '#cc4834', '#377773', '#87683d', '#94613e', '#7263a0', '#398077', '#687c36', '#447892', '#936449'];

const softBreaks: Record<string, string> = { Multiculturalism: 'Multi\u00adculturalism', Internationalism: 'Inter\u00adnationalism', Traditionalist: 'Tradi\u00adtionalist', Redistribution: 'Redis\u00adtribution' };
const poleLabel = (label: string) => label.replace(/Multiculturalism|Internationalism|Traditionalist|Redistribution/g, word => softBreaks[word]);

export function useResultCatalogue(enabled: boolean) {
  const [state, setState] = useState<{ profiles?: Profile[]; error?: string }>({});
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    setState({});
    fetch(import.meta.env.BASE_URL + 'profiles/catalogue.v1.json', { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error('Unavailable'); return response.json(); })
      .then(value => { if (!controller.signal.aborted) setState({ profiles: parseCatalogue(value) }); })
      .catch(() => { if (!controller.signal.aborted) setState({ error: 'Ideology comparisons could not be loaded.' }); });
    return () => controller.abort();
  }, [attempt, enabled]);
  return { ...state, retry: () => setAttempt(value => value + 1) };
}

export function resultColour(result: QuizResult, profiles?: Profile[]) {
  const match = profiles ? matchResultIdeology(result, profiles) : null;
  const groups = match?.ideologies.map(item => ideologyGroup(profiles!.find(profile => profile.catalogue === 'ideology' && profile.id === item.id)!));
  return groups?.length ? groups.every(group => group.color === groups[0].color) ? groups[0].color : '#59676d' : undefined;
}

export function ProfileOverview({ result, state }: { result: QuizResult; state: ReturnType<typeof useResultCatalogue> }) {
  const match = state.profiles ? matchResultIdeology(result, state.profiles) : null;
  const details = state.profiles ? ideologyComparisonDetails(result, state.profiles) : null;
  const matched = match?.ideologies.map(ideology => state.profiles!.find(profile => profile.catalogue === 'ideology' && profile.id === ideology.id)!) ?? [];
  const status = state.error ?? (state.profiles ? 'No compatible ideology assessments are available for this result’s question-bank, axes and scoring versions.' : 'Loading ideology comparisons…');
  return <div className={s.overview}>
    <section className={`${a.exampleResult} ${s.comparison}`} aria-label="Result comparisons">
      <div className={a.resultHeader}>
        <div className={a.resultIdeology}><span className={a.positionBadge}>Closest {matched.length > 1 ? 'ideologies' : 'ideology'}</span>
          {matched.length ? matched.map(profile => <h2 key={profile.id}><a href={'#/ideologies/' + profile.id}>{profile.metadata.name}</a></h2>) : <><h2>Comparison unavailable</h2><p role={state.error ? 'alert' : 'status'}>{status}</p>{state.error ? <button className={a.primaryButton} onClick={state.retry}>Try again</button> : null}</>}
        </div>
        {match ? <div className={s.gap}><strong>{(100 - match.meanAbsoluteDistance).toFixed(1)}%</strong><span>Similarity</span></div> : null}
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
      <div><h2 id="profile-sentence-title">The closest ideology’s perspective</h2>
        {matched.map(profile => <div key={profile.id}>{matched.length > 1 ? <h3>{profile.metadata.name}</h3> : null}<blockquote>{profile.metadata.phrase}</blockquote></div>)}
        {!matched.length ? <p>A profile’s supplied statement appears when a compatible comparison is available.</p> : null}
        <p>Compared with assessed catalogue ideologies using 100 minus the average absolute score gap across all 15 axes, weighted equally. Higher percentages mean closer scores; all closest ties are shown. This describes resemblance, not identity or confidence. Profile assessments include educated assumptions, and the question bank has not been empirically validated.</p>
        {details?.next ? <p>The next closest assessment is {details.next.profile.metadata.name}, {details.next.margin.toFixed(2)} points further away on average. This is a score margin, not statistical confidence.</p> : null}
        {details?.neighbours.map(({ profile, gaps }) => <details key={profile.id}><summary>{profile.metadata.name}: largest axis gap {gaps[0].gap.toFixed(1)} points; scope and disagreements</summary>
          <p>{profile.metadata.period}. {profile.metadata.scope}</p>
          <p>Largest axis gap: {gaps[0].gap.toFixed(1)} percentage points. Average similarity can conceal a large disagreement on one axis.</p>
          <ul>{gaps.slice(0, 3).map(gap => <li key={gap.axisId}>{axes.find(axis => axis.id === gap.axisId)!.name}: {gap.gap.toFixed(1)} points apart.</li>)}</ul>
        </details>)}
      </div>
    </section>
  </div>;
}

export function ResultAxes({ result, compact = false, comparisons = [], picker, onRemove }: { result: Pick<QuizResult, 'scores'>; compact?: boolean; comparisons?: Profile[]; picker?: React.ReactNode; onRemove?: (profile: Profile) => void }) {
  return <section className={`${s.axes} ${compact ? s.compact : ''}`} aria-labelledby="axes-results-title">
    <div className={s.sectionHeading}><span>— Political axes</span><h2 id="axes-results-title">Percentage result per axis</h2>{picker}</div>
    {comparisons.length ? <ul className={s.legend} aria-label="Compared profiles"><li><i className={s.yourDot} />You</li>{comparisons.map((profile, index) => <li key={profile.catalogue + '/' + profile.id}><i style={{ background: comparisonColour(profile) }}>{index + 1}</i><a href={'#/' + (profile.catalogue === 'ideology' ? 'ideologies' : 'personalities') + '/' + profile.id}>{profile.metadata.name}</a><span>{similarity(result.scores, profile.scores).toFixed(1)}% similarity</span><button aria-label={'Remove ' + profile.metadata.name + ' comparison'} onClick={() => onRemove?.(profile)}>×</button></li>)}</ul> : null}
    <div>{axes.map((axis, index) => {
      const score = result.scores.find(score => score.axisId === axis.id)!;
      const label = tendency(score);
      const balanced = label === 'Balanced';
      const left = wholePercent(score.leftPercent);
      const position = score.rightPercent;
      const colour = balanced ? '#98978b' : colours[index];
      return <article className={s.axis} key={axis.id} aria-label={axis.name} style={{ '--axis-colour': `var(--result-color, ${colour})` } as CSSProperties}>
        <div className={s.axisHeading}>
          <div className={s.topic}><h3>{topics[axis.id]}</h3><details className={s.info}><summary aria-label={`About ${axis.name}`}><span className={s.helpIcon} aria-hidden="true">?</span></summary><div><strong>{axis.name}</strong><p>{axis.description.trim()}</p><p>{score.answered} questions · {score.neutral === score.answered ? 'All responses neutral' : `${score.neutral} neutral ${score.neutral === 1 ? 'response' : 'responses'}`}</p><p>{axis.left}: {score.leftPercent}% · {axis.right}: {score.rightPercent}%</p></div></details></div>
          <span className={s.badge}><i />{balanced ? label : `${label ? `${label} ` : ''}${score.leftPercent > 50 ? axis.left : axis.right}`}</span>
        </div>
        <div className={s.scale}>
          <div className={s.pole} data-active={!balanced && score.leftPercent > 50}><ValueIcon value={axis.left} /><div><strong aria-label={axis.left}>{poleLabel(axis.left)}</strong><span>{left}%</span></div></div>
          <div className={s.track} style={comparisons.length ? { height: 24 + comparisons.length * 20 } : undefined} role="img" aria-label={`${axis.left}: ${score.leftPercent}%; ${axis.right}: ${score.rightPercent}%${comparisons.map(profile => { const other = profile.scores.find(value => value.axisId === axis.id)!; return `; ${profile.metadata.name}: ${axis.left} ${other.leftPercent}%, ${axis.right} ${other.rightPercent}%`; }).join('')}`}>
            <span className={s.trackBase} /><span className={s.trackFill} style={{ left: `${Math.min(50, position)}%`, width: `${Math.abs(position - 50)}%` }} /><span className={s.midpoint} />{comparisons.map((profile, index) => { const other = profile.scores.find(value => value.axisId === axis.id)!; return <span key={profile.catalogue + '/' + profile.id} className={s.comparisonMarker} title={`${profile.metadata.name}: ${axis.left} ${other.leftPercent}%, ${axis.right} ${other.rightPercent}%`} style={{ left: `${other.rightPercent}%`, top: 24 + index * 20, background: comparisonColour(profile) }}>{index + 1}</span>; })}<span className={s.marker} style={{ left: `${position}%` }} />
          </div>
          <div className={`${s.pole} ${s.rightPole}`} data-active={!balanced && score.rightPercent > 50}><ValueIcon value={axis.right} /><div><strong aria-label={axis.right}>{poleLabel(axis.right)}</strong><span>{100 - left}%</span></div></div>
        </div>
        {score.neutral === score.answered ? <span className={s.neutralNote}>All responses neutral</span> : null}
      </article>;
    })}</div>
  </section>;
}
