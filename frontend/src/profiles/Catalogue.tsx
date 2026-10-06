import { religionOptions } from '../quiz/religion';
import { useEffect, useState } from 'react';
import { ResultAxes } from '../quiz/ResultProfile';
import { parseCatalogue } from './catalogueData';
import Ideologies from './Ideologies';
import IdeologyHeader from './IdeologyHeader';
import PersonalityHeader from './PersonalityHeader';
import CountryHeader from './CountryHeader';
import ProfileCard from './ProfileCard';
import { capitaliseTag, profileFilterTagsForKind, type ProfileTagKind } from './profileTags';
import { personalityImageCredits } from './personalityImageCredits';
import type { Catalogue as CatalogueKind, Profile } from './types';
import a from '../App.module.css';
import s from './Catalogue.module.css';

export const catalogueRoutes = { ideologies: 'ideology', countries: 'country', personalities: 'personality' } as const;
export type CatalogueRoute = keyof typeof catalogueRoutes;
const descriptions: Record<CatalogueKind, string> = {
  ideology: 'Explore political ideas through the same 15 values.',
  country: '',
  personality: '',
};
const personalityGroups = [
  { name: 'Politicians', ids: null },
  { name: 'Business', ids: ['jeff-bezos', 'elon-musk', 'bill-gates', 'mark-zuckerberg', 'peter-thiel', 'rupert-murdoch'] },
  { name: 'Political Theorists', ids: ['john-locke', 'john-stuart-mill', 'edmund-burke', 'thomas-hobbes', 'john-rawls', 'karl-marx', 'rosa-luxemburg', 'mary-wollstonecraft', 'ayn-rand', 'jean-jacques-rousseau', 'mikhail-bakunin'] },
  { name: 'Economists', ids: ['john-maynard-keynes', 'friedrich-hayek', 'milton-friedman', 'adam-smith'] },
] as const;
const personalityGroup = (profile: Profile) => personalityGroups.find(group => group.ids?.some(id => id === profile.id))?.name ?? 'Politicians';
const familyNames: Record<string, string> = { 'mao-zedong': 'Mao', 'xi-jinping': 'Xi' };
const lastName = (profile: Profile) => familyNames[profile.id] ?? profile.metadata.name.trim().split(/\s+/).at(-1) ?? profile.metadata.name;
const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

export default function Catalogue({ route, id }: { route: CatalogueRoute; id?: string }) {
  const [state, setState] = useState<{ profiles?: Profile[]; error?: string }>({});
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [filters, setFilters] = useState<Record<ProfileTagKind, string>>({ leaning: '', ideology: '', position: '', country: '' });
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
  if (profile) return <div className={`${a.container} ${a.pageContent} ${profile.catalogue === 'ideology' ? s.ideologyDetail : profile.catalogue === 'personality' ? s.personalityDetail : s.countryDetail}`}>
    {profile.catalogue === 'ideology' ? <IdeologyHeader profile={profile} profiles={state.profiles!} /> : profile.catalogue === 'personality' ? <PersonalityHeader profile={profile} profiles={state.profiles!} /> : <CountryHeader profile={profile} profiles={state.profiles!} />}
    {profile.metadata.phrase && profile.catalogue !== 'ideology' ? <blockquote className={s.phrase}>{profile.metadata.phrase}</blockquote> : null}
    {profile.withdrawal ? <section className={s.scope} aria-label="Assessment withdrawn"><h2>Placements withdrawn</h2><p>{profile.withdrawal.reason}</p><p>The earlier percentages are not reliable. A new assessment must pass the evidence review before placements return.</p></section> : <ResultAxes result={{ scores: profile.scores }} compact={profile.catalogue === 'ideology'} />}
    {profile.catalogue === 'ideology' && profile.religion ? <section className={s.scope} aria-label="Religion assessment"><h2>{profile.catalogue === 'ideology' ? 'Religious eligibility' : 'Religious identity'}</h2><p>{profile.catalogue === 'ideology' && profile.religion.value === 'none' ? 'No religious prerequisite — available to every religious identity.' : profile.religion.value === 'undisclosed' ? 'Not publicly established or disputed' : religionOptions.find(option => option.value === profile.religion!.value)?.label}</p><p>{profile.religion.rationale}</p><ul>{profile.religion.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a></li>)}</ul><a href={asset(`profiles/religion-assessments/${profile.religionRevision ?? 1}.json`)} download>Download religion answers · Revision {profile.religionRevision ?? 1}</a></section> : null}
    <details className={s.evidence}><summary className={s.evidenceToggle}>Sources and assessment</summary>
      <p>{profile.withdrawal ? 'The download preserves the withdrawn assessment for transparency. It is not a validated current placement.' : 'Review the evidence and the reasoning behind all 240 answers.'}</p>
      <a href={asset(profile.auditPath)} download={`${profile.id}-audit-r${profile.revision}.json`}>{profile.withdrawal ? 'Download the withdrawn assessment' : 'Download the full assessment'}</a>
      <ul>{profile.sources.map(source => <li key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a> · {source.publisher}</li>)}</ul>
      {profile.selection ? <section aria-label="Ideology Matching evidence"><h3>Ideology Matching evidence</h3><p>These additional answers affect eligibility, not axis scores. Other matching positions remain unassessed.</p>{profile.selection.evidence.map(item => <div key={item.questionId}><p>{item.rationale}</p><ul>{item.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a></li>)}</ul></div>)}</section> : null}
      <details><summary>Assessment versions</summary><p>Revision {profile.revision} · Questions {profile.questionBankVersion} · Scoring {profile.scoringVersion} · Axes {profile.axesVersion}</p></details>
      {profile.metadata.image ? <p>Image: {imageCredit?.creator ?? profile.metadata.image.creator} · <a href={profile.metadata.image.sourceUrl}>Source</a> · <a href={imageCredit?.licenseUrl ?? profile.metadata.image.licenseUrl}>{imageCredit?.license ?? profile.metadata.image.license}</a></p> : null}
    </details>
  </div>;
  if (route === 'ideologies') return <Ideologies profiles={profiles} />;
  const filterLabels = { leaning: 'Political leaning', ideology: route === 'countries' ? 'Ideology comparison' : 'Closest ideology', position: 'Position', country: 'Country of origin' };
  const filterKinds: ProfileTagKind[] = route === 'countries' ? ['ideology'] : ['ideology', 'position', 'country'];
  const matchesSearch = (profile: Profile) => `${profile.metadata.name} ${profile.metadata.category} ${profile.metadata.description} ${profile.historicalContext?.label ?? ''} ${profile.historicalContext?.ideology?.name ?? ''}`.toLowerCase().includes(query.toLowerCase().trim());
  const matchesFilters = (profile: Profile, except?: ProfileTagKind) => filterKinds.every(kind => kind === except || !filters[kind] || profileFilterTagsForKind(profile, kind).includes(filters[kind]));
  const availableTags = (kind: ProfileTagKind) => {
    const tags = profiles.filter(profile => matchesSearch(profile) && matchesFilters(profile, kind) && (route !== 'countries' || !category || profile.metadata.category === category))
      .flatMap(profile => profileFilterTagsForKind(profile, kind));
    // Keep an active selection visible when a search has no matches, so it can be cleared.
    if (filters[kind]) tags.push(filters[kind]);
    return [...new Set(tags)].sort((left, right) => left.localeCompare(right));
  };
  const categories = [...new Set(profiles.filter(profile => matchesSearch(profile) && matchesFilters(profile)).map(profile => profile.metadata.category).concat(category ? [category] : []))].sort((left, right) => left.localeCompare(right));
  const filtered = profiles.filter(profile => matchesSearch(profile) && matchesFilters(profile) && (route !== 'countries' || !category || profile.metadata.category === category));
  return <div className={`${a.container} ${a.pageContent}`}>
    <div className={s.intro}><h1>{heading}</h1>{descriptions[catalogueRoutes[route]] ? <p>{descriptions[catalogueRoutes[route]]}</p> : null}</div>
    {profiles.length === 0 ? <div className={a.catalogueEmpty}><h2>No {route} added yet.</h2><p>There are no {catalogueRoutes[route]} profiles to explore here yet. In the meantime, get to know the values that underpin the site.</p><a className={a.primaryButton} href="#/?section=values">Explore the 15 values</a></div> : <>
      <div className={s.browseToolbar}>
      <label className={s.search}><span className={s.visuallyHidden}>Search {heading.toLowerCase()}</span><input type="search" placeholder={`Search ${heading.toLowerCase()}`} value={query} onChange={event => setQuery(event.target.value)} /></label>
      <div className={s.filterToolbar}>
        {filterKinds.map(kind => <label key={kind} className={s.filterLabel}><span className={s.visuallyHidden}>{filterLabels[kind]}</span>
          <select value={filters[kind]} onChange={event => setFilters(current => ({ ...current, [kind]: event.target.value }))}>
            <option value="">{kind === 'country' ? 'All Countries' : kind === 'ideology' ? 'All Ideologies' : 'All Positions'}</option>
            {availableTags(kind).map(tag => <option key={tag} value={tag}>{capitaliseTag(tag)}</option>)}
          </select>
        </label>)}
        {route === 'countries' ? <label className={s.filterLabel}><span className={s.visuallyHidden}>Category</span><select value={category} onChange={event => setCategory(event.target.value)}><option value="">All Categories</option>{categories.map(value => <option key={value} value={value}>{value}</option>)}</select></label> : null}
        {query || (route === 'countries' && category) || filterKinds.some(kind => filters[kind]) ? <button className={s.clearFilters} onClick={() => { setQuery(''); setCategory(''); setFilters({ leaning: '', ideology: '', position: '', country: '' }); }}>Clear filters</button> : null}
      </div>
      </div>
      <p role="status">{filtered.length} {filtered.length === 1 ? 'profile' : 'profiles'}</p>
      {route === 'personalities' ? <div className={s.personalityGroups}>{personalityGroups.map(group => {
        const members = filtered.filter(profile => personalityGroup(profile) === group.name)
          .sort((left, right) => lastName(left).localeCompare(lastName(right), 'en')
            || left.metadata.name.localeCompare(right.metadata.name, 'en'));
        return members.length ? <section key={group.name} className={s.personalityGroup} aria-label={group.name}>
          <div className={s.groupHeading}><h2>{group.name}</h2><span>{members.length}</span></div>
          <div className={s.profileGrid}>{members.map(profile => <ProfileCard key={profile.id} profile={profile} route="personalities" />)}</div>
        </section> : null;
      })}</div> : <div className={`${s.profileGrid} ${s.countryGrid}`}>{filtered.map(profile => <ProfileCard key={profile.id} profile={profile} route="countries" />)}</div>}
      {!filtered.length ? <p>{(route === 'countries' && category) || filterKinds.some(kind => filters[kind]) ? 'No profiles match your filters. Try another selection or clear filters.' : 'No profiles match your search.'}</p> : null}
    </>}
  </div>;
}
