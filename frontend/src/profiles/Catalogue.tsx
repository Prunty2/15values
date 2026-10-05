import { useEffect, useState } from 'react';
import { ResultAxes } from '../quiz/ResultProfile';
import { parseCatalogue } from './catalogueData';
import Ideologies from './Ideologies';
import IdeologyHeader from './IdeologyHeader';
import PersonalityHeader from './PersonalityHeader';
import { personalityImageCredits } from './personalityImageCredits';
import type { Catalogue as CatalogueKind, Profile } from './types';
import a from '../App.module.css';
import s from './Catalogue.module.css';

export const catalogueRoutes = { ideologies: 'ideology', countries: 'country', personalities: 'personality' } as const;
export type CatalogueRoute = keyof typeof catalogueRoutes;
const descriptions: Record<CatalogueKind, string> = {
  ideology: 'Explore political ideas through the same 15 values.',
  country: 'Explore the institutions and policies of countries during a defined period.',
  personality: 'Explore the documented political positions of public figures.',
};
const personalityGroups = [
  { name: 'Politicians', ids: null },
  { name: 'Political Theorists', ids: ['john-locke', 'john-stuart-mill', 'edmund-burke', 'thomas-hobbes', 'john-rawls', 'karl-marx', 'rosa-luxemburg'] },
  { name: 'Economists', ids: ['john-maynard-keynes', 'friedrich-hayek', 'milton-friedman'] },
] as const;
const personalityGroup = (profile: Profile) => personalityGroups.find(group => group.ids?.some(id => id === profile.id))?.name ?? 'Politicians';
const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

export default function Catalogue({ route, id }: { route: CatalogueRoute; id?: string }) {
  const [state, setState] = useState<{ profiles?: Profile[]; error?: string }>({});
  const [query, setQuery] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState({});
    fetch(asset('profiles/catalogue.v1.json'), { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error('Unavailable'); return response.json(); })
      .then(value => setState({ profiles: parseCatalogue(value) }))
      .catch(() => { if (!controller.signal.aborted) setState({ error: 'The profiles could not be loaded. Please try again.' }); });
    return () => controller.abort();
  }, [attempt]);
  const profiles = state.profiles?.filter(profile => profile.catalogue === catalogueRoutes[route]);
  const profile = id ? profiles?.find(profile => profile.id === id) : undefined;
  const imageCredit = profile?.catalogue === 'personality'
    ? personalityImageCredits.find(credit => credit.sourceUrl === profile.metadata.image?.sourceUrl)
    : undefined;
  useEffect(() => { if (profile) document.title = `${profile.metadata.name} — 15 Values`; }, [profile]);
  const heading = route[0].toUpperCase() + route.slice(1);
  if (state.error) return <div className={`${a.container} ${a.pageContent}`}><h1>{heading}</h1><p role="alert">{state.error}</p><button className={a.primaryButton} onClick={() => setAttempt(value => value + 1)}>Try again</button></div>;
  if (!profiles) return <div className={`${a.container} ${a.pageContent}`}><h1>{heading}</h1><p role="status">Loading profiles…</p></div>;
  if (id && !profile) return <div className={`${a.container} ${a.pageContent}`}><h1>Profile not found</h1><p>This profile is not in the published catalogue.</p><a href={`#/${route}`}>Back to {heading.toLowerCase()}</a></div>;
  if (profile) return <div className={`${a.container} ${a.pageContent} ${profile.catalogue === 'ideology' ? s.ideologyDetail : profile.catalogue === 'personality' ? s.personalityDetail : ''}`}>
    {profile.catalogue === 'ideology' ? <IdeologyHeader profile={profile} /> : profile.catalogue === 'personality' ? <PersonalityHeader profile={profile} /> : <>
    <a href={`#/${route}`}>← All {heading.toLowerCase()}</a>
    <header className={s.detailHeader}>
      {profile.metadata.image ? <img src={asset(profile.metadata.image.path)} alt={profile.metadata.image.alt} className={s.portrait} /> : null}
      <div><p>{profile.metadata.category} · {profile.metadata.period}</p><h1>{profile.metadata.name}</h1><p>{profile.metadata.description}</p>
        {profile.metadata.role ? <p>{profile.metadata.role} · {profile.metadata.lifespan}</p> : null}
      </div>
    </header>
    </>}
    {profile.catalogue !== 'ideology' ? <p className={s.scope}>{profile.metadata.scope}</p> : null}
    {profile.metadata.phrase && profile.catalogue !== 'ideology' ? <blockquote className={s.phrase}>{profile.metadata.phrase}</blockquote> : null}
    {profile.catalogue !== 'ideology' ? <p className={s.note}>Research as of {profile.researchedAt}. The assessment interprets documented evidence; the subject did not submit these answers. The question bank is still in development.</p> : null}
    {profile.withdrawal ? <section className={s.scope} aria-label="Assessment withdrawn"><h2>Placements withdrawn</h2><p>{profile.withdrawal.reason}</p><p>The earlier percentages are not reliable. A new assessment must pass the evidence review before placements return.</p></section> : <ResultAxes result={{ scores: profile.scores }} compact={profile.catalogue === 'ideology'} />}
    <details className={s.evidence} open={profile.catalogue !== 'ideology'}><summary className={s.evidenceToggle}>Sources and assessment</summary>
      <p>{profile.withdrawal ? 'The download preserves the withdrawn assessment for transparency. It is not a validated current placement.' : 'Review the evidence and the reasoning behind all 240 answers.'}{profile.catalogue === 'ideology' ? ` Research as of ${profile.researchedAt}.` : ''}</p>
      <a href={asset(profile.auditPath)} download={`${profile.id}-audit-r${profile.revision}.json`}>{profile.withdrawal ? 'Download the withdrawn assessment' : 'Download the full assessment'}</a>
      <ul>{profile.sources.map(source => <li key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a> · {source.publisher}</li>)}</ul>
      <details><summary>Assessment versions</summary><p>Revision {profile.revision} · Questions {profile.questionBankVersion} · Scoring {profile.scoringVersion} · Axes {profile.axesVersion}</p></details>
      {profile.metadata.image ? <p>Image: {imageCredit?.creator ?? profile.metadata.image.creator} · <a href={profile.metadata.image.sourceUrl}>Source</a> · <a href={imageCredit?.licenseUrl ?? profile.metadata.image.licenseUrl}>{imageCredit?.license ?? profile.metadata.image.license}</a></p> : null}
    </details>
  </div>;
  if (route === 'ideologies') return <Ideologies profiles={profiles} />;
  const filtered = profiles.filter(profile => `${profile.metadata.name} ${profile.metadata.category} ${profile.metadata.description}`.toLowerCase().includes(query.toLowerCase().trim()));
  return <div className={`${a.container} ${a.pageContent}`}>
    <div className={s.intro}><h1>{heading}</h1><p>{descriptions[catalogueRoutes[route]]}</p></div>
    {profiles.length === 0 ? <div className={a.catalogueEmpty}><h2>No {route} added yet.</h2><p>There are no {catalogueRoutes[route]} profiles to explore here yet. In the meantime, get to know the values that underpin the site.</p><a className={a.primaryButton} href="#/?section=values">Explore the 15 values</a></div> : <>
      <label className={s.search}>Search {heading.toLowerCase()}<input type="search" value={query} onChange={event => setQuery(event.target.value)} /></label>
      <p role="status">{filtered.length} {filtered.length === 1 ? 'profile' : 'profiles'}</p>
      {route === 'personalities' ? <div className={s.personalityGroups}>{personalityGroups.map(group => {
        const members = filtered.filter(profile => personalityGroup(profile) === group.name)
          .sort((left, right) => left.metadata.name.localeCompare(right.metadata.name));
        return members.length ? <section key={group.name} className={s.personalityGroup} aria-label={group.name}>
          <div className={s.groupHeading}><h2>{group.name}</h2><span>{members.length}</span></div>
          <div className={s.personalityGrid}>{members.map(profile => <article key={profile.id} className={s.personalityCard}>
            <a className={s.personalityLink} href={`#/${route}/${profile.id}`} aria-label={profile.metadata.name}>
              <div className={s.personalityImage}>{profile.metadata.image ? <img src={asset(profile.metadata.image.path)} alt={profile.metadata.image.alt} loading="lazy" width="400" height="400" /> : null}</div>
              <div className={s.personalityCopy}><h3>{profile.metadata.name}<span aria-hidden="true">↗</span></h3><p>{profile.metadata.description}</p>{profile.withdrawal ? <p>Placements withdrawn · Evidence review required</p> : null}</div>
            </a>
          </article>)}</div>
        </section> : null;
      })}</div> : <div className={s.grid}>{filtered.map(profile => <article key={profile.id} className={s.card}>
        {profile.metadata.image ? <img src={asset(profile.metadata.image.path)} alt={profile.metadata.image.alt} loading="lazy" width="96" height="96" /> : null}
        <p>{profile.metadata.category} · {profile.metadata.period}</p><h2><a href={`#/${route}/${profile.id}`}>{profile.metadata.name}</a></h2><p>{profile.metadata.description}</p>
      </article>)}</div>}
      {!filtered.length ? <p>No profiles match your search.</p> : null}
    </>}
  </div>;
}
