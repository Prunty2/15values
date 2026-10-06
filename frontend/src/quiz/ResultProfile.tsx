import SimilarityRing from '../components/SimilarityRing';
import FittedHeading from '../components/FittedHeading';
import { useEffect, useState, type CSSProperties } from 'react';
import { similarity } from '../profiles/audit';
import { parseCatalogue } from '../profiles/catalogueData';
import { matchCentristProfiles, matchResultIdeology, matchResultProfiles } from '../profiles/ideologyMatching';
import { ideologyGroup } from '../profiles/ideologyGroups';
import { personalityGroup } from '../profiles/personalityGroups';
import type { Profile } from '../profiles/types';
import ValueIcon from '../components/ValueIcon';
import { axes, axesForVersion, topics, QUESTION_BANK_VERSION, AXES_VERSION, SCORING_VERSION } from './model';
import type { QuizResult } from './model';
import { isCentristResult, tendency, wholePercent } from './profile';
import a from '../App.module.css';
import s from './ResultProfile.module.css';

const comparisonColour = (profile: Profile) => (profile.catalogue === 'ideology' ? ideologyGroup(profile) : personalityGroup(profile)).color;

const colours = ['#b82d62', '#3e6184', '#8c4a75', '#a56526', '#6b802d', '#b75527', '#cc4834', '#377773', '#87683d', '#94613e', '#7263a0', '#398077', '#687c36', '#447892', '#936449'];

const softBreaks: Record<string, string> = { Multiculturalism: 'Multi\u00adculturalism', Internationalism: 'Inter\u00adnationalism', Traditionalist: 'Tradi\u00adtionalist', Redistribution: 'Redis\u00adtribution' };
const poleLabel = (label: string) => label.replace(/Multiculturalism|Internationalism|Traditionalist|Redistribution/g, word => softBreaks[word]);

export function useResultCatalogue(enabled: boolean, results: QuizResult[] = []) {
  const [state, setState] = useState<{ profiles?: Profile[]; error?: string; failedVersions?: string[] }>({});
  const [attempt, setAttempt] = useState(0);
  const versionKeys = [...new Set(results.map(result => [result.questionBankVersion, result.axesVersion, result.scoringVersion].join('-')))].sort().join(',') || [QUESTION_BANK_VERSION, AXES_VERSION, SCORING_VERSION].join('-');
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    setState({});
    const versions = versionKeys.split(',');
    Promise.allSettled(versions.map(key => {
      // No published assessments use the original scoring algorithm.
      if (key.split('-')[2] !== SCORING_VERSION) return Promise.resolve([] as Profile[]);
      const current = key === [QUESTION_BANK_VERSION, AXES_VERSION, SCORING_VERSION].join('-');
      return fetch(import.meta.env.BASE_URL + (current ? 'profiles/catalogue.v1.json' : 'profiles/result-catalogues/' + key + '.v1.json'), { signal: controller.signal })
        .then(response => { if (!response.ok) throw new Error('Unavailable'); return response.json(); })
        .then(value => parseCatalogue(value));
    }))
      .then(groups => {
        if (controller.signal.aborted) return;
        setState({
          profiles: groups.flatMap(group => group.status === 'fulfilled' ? group.value : []),
          failedVersions: versions.filter((_, index) => groups[index].status === 'rejected'),
          error: groups.every(group => group.status === 'rejected') ? 'Profile comparisons could not be loaded.' : undefined,
        });
      });
    return () => controller.abort();
  }, [attempt, enabled, versionKeys]);
  return { ...state, retry: () => setAttempt(value => value + 1) };
}

const compatibleResultProfile = (result: QuizResult, profile: Profile) => profile.questionBankVersion === result.questionBankVersion && profile.axesVersion === result.axesVersion && profile.scoringVersion === result.scoringVersion;

export function resultColour(result: QuizResult, profiles?: Profile[]) {
  if (isCentristResult(result)) return '#59676d';
  profiles = profiles?.filter(profile => compatibleResultProfile(result, profile));
  const match = profiles ? matchResultIdeology(result, profiles) : null;
  const groups = match?.ideologies.map(item => ideologyGroup(profiles!.find(profile => profile.catalogue === 'ideology' && profile.id === item.id)!));
  return groups?.length ? groups.every(group => group.color === groups[0].color) ? groups[0].color : '#59676d' : undefined;
}

export function ProfileOverview({ result, state, compact = false }: { result: QuizResult; state: ReturnType<typeof useResultCatalogue>; compact?: boolean }) {
  const version = [result.questionBankVersion, result.axesVersion, result.scoringVersion].join('-');
  const failed = state.failedVersions?.includes(version);
  state = { ...state,
    profiles: failed ? undefined : state.profiles?.filter(profile => compatibleResultProfile(result, profile)),
    error: failed ? 'Profile comparisons could not be loaded.' : state.error,
  };
  const centrist = isCentristResult(result);
  const match = !centrist && state.profiles ? matchResultIdeology(result, state.profiles) : null;
  const matched = match?.ideologies.map(ideology => state.profiles!.find(profile => profile.catalogue === 'ideology' && profile.id === ideology.id)!) ?? [];
  const status = state.error ?? (state.profiles ? 'No compatible ideology assessments are available for this result’s question-bank, axes and scoring versions.' : 'Loading ideology comparisons…');
  return <div className={`${s.overview} ${compact ? s.savedOverview : ''}`}>
    <section className={`${a.exampleResult} ${s.comparison}`} aria-label="Result comparisons">
      <div className={a.resultHeader}>
        <div className={`${a.resultIdeology} ${s.ideologyCopy}`}><span className={a.positionBadge}>{centrist ? 'Your result' : `Closest ${matched.length > 1 ? 'ideologies' : 'ideology'}`}</span>
          {centrist ? <><h2>Centrism</h2><p>Your answers place every axis at its midpoint.</p></> : matched.length ? matched.map(profile => <FittedHeading key={profile.id} className={s.fittedHeading}><a href={'#/ideologies/' + profile.id}>{profile.metadata.name}</a></FittedHeading>) : <><h2>Comparison unavailable</h2><p role={state.error ? 'alert' : 'status'}>{status}</p>{state.error ? <button className={a.primaryButton} onClick={state.retry}>Try again</button> : null}</>}
        </div>
        {match ? <SimilarityRing percentage={100 - match.meanAbsoluteDistance} /> : null}
      </div>
      {(['personality', 'country'] as const).map(kind => {
        const match = state.profiles ? centrist ? matchCentristProfiles(result, state.profiles, kind) : matchResultProfiles(result, state.profiles, kind, matched) : null;
        return <div className={`${a.comparisonRow} ${s.profileRow} ${!match ? s.noMatchRow : ''}`} key={kind} aria-label={'Most compatible ' + kind}>
          {match?.profiles.some(profile => profile.metadata.image) ? <div className={s.matchImages}>
            {match.profiles.map(profile => profile.metadata.image ? <img key={profile.id} className={`${s.matchImage} ${kind === 'country' ? s.flagImage : ''}`} src={import.meta.env.BASE_URL + profile.metadata.image.path} alt={profile.metadata.image.alt} loading="lazy" /> : null)}
          </div> : <div className={s.placeholderIcon} aria-hidden="true">{kind === 'personality' ? <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="16" cy="11" r="5" /><path d="M6 28v-3a10 10 0 0 1 20 0v3" /></svg> : <ValueIcon value="Internationalism" />}</div>}
          <div className={a.comparisonCopy}><span className={a.comparisonLabel}>Most compatible {kind}</span>
            {match ? <>{match.profiles.map(profile => <h3 key={profile.id}><a href={'#/' + (kind === 'personality' ? 'personalities' : 'countries') + '/' + profile.id}>{profile.metadata.name}</a></h3>)}</> : <><h3>{centrist && state.profiles && !state.error ? 'No close match' : 'Comparison unavailable'}</h3><span>{state.error ? 'Profile comparisons could not be loaded.' : state.profiles && centrist ? 'No compatible ' + kind + ' assessment is within 15 percentage points of the midpoint on every axis.' : state.profiles ? 'No compatible ' + kind + ' assessments meet this result’s version' + (kind === 'country' ? ' and displayed ideology religion' : '') + ' requirements.' : 'Loading ' + kind + ' comparisons…'}</span></>}
          </div>
          {match ? <SimilarityRing percentage={100 - match.meanAbsoluteDistance} className={s.profileRing} /> : null}
        </div>;
      })}
    </section>
    {!compact ? <section className={s.quote} aria-label="Ideology perspective">
      <span className={s.quoteMark} aria-hidden="true">“</span>
      <div>
        {matched.map(profile => <div key={profile.id}>{matched.length > 1 ? <h3>{profile.metadata.name}</h3> : null}<blockquote>{profile.metadata.phrase}</blockquote></div>)}
        {centrist ? <p>Each axis is balanced at 50% / 50%. Neutral answers do not establish support for a particular political tradition.</p> : !matched.length ? <p>A profile’s supplied statement appears when a compatible comparison is available.</p> : null}

      </div>
    </section> : null}
  </div>;
}

export function ResultAxes({ result, compact = false, comparisons = [], picker, onRemove }: { result: Pick<QuizResult, 'scores'> & Partial<Pick<QuizResult, 'axesVersion'>>; compact?: boolean; comparisons?: Profile[]; picker?: React.ReactNode; onRemove?: (profile: Profile) => void }) {
  return <section className={`${s.axes} ${compact ? s.compact : ''}`} aria-labelledby="axes-results-title">
    <div className={s.sectionHeading}><span>— Political axes</span><h2 id="axes-results-title">Percentage result per axis</h2>{picker}</div>
    {comparisons.length ? <ul className={s.legend} aria-label="Compared profiles"><li><i className={s.yourDot} />You</li>{comparisons.map((profile, index) => <li key={profile.catalogue + '/' + profile.id}><i style={{ background: comparisonColour(profile) }}>{index + 1}</i><a href={'#/' + (profile.catalogue === 'ideology' ? 'ideologies' : 'personalities') + '/' + profile.id}>{profile.metadata.name}</a><span>{similarity(result.scores, profile.scores).toFixed(1)}% similarity</span><button aria-label={'Remove ' + profile.metadata.name + ' comparison'} onClick={() => onRemove?.(profile)}>×</button></li>)}</ul> : null}
    <div>{axesForVersion(result.axesVersion).map((axis, index) => {
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
