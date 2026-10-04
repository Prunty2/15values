import { useState, type CSSProperties } from 'react';
import ValueIcon from '../components/ValueIcon';
import { axes, topics } from '../quiz/model';
import type { Profile } from './types';
import s from './Ideologies.module.css';
import { browseGroups, groupFor } from './ideologyGroups';

const tint = (color: string): CSSProperties => ({ '--tradition-color': color } as CSSProperties);
const profileCount = (count: number) => `${count} ${count === 1 ? 'profile' : 'profiles'}`;

function AxisStrip({ profile }: { profile: Profile }) {
  if (profile.withdrawal) return <p>Placements withdrawn · Evidence review required</p>;
  return <div className={s.axisStrip} aria-label={`${profile.metadata.name}: 15 axis placements`}>
    {axes.map(axis => {
      const score = profile.scores.find(score => score.axisId === axis.id)!;
      const balanced = Math.abs(score.leftPercent - 50) < 0.5;
      const pole = score.leftPercent >= 50 ? axis.left : axis.right;
      const leftPercent = Math.round(score.leftPercent);
      const placement = `${axis.left} ${leftPercent}% · ${axis.right} ${100 - leftPercent}%`;
      return <span key={axis.id} className={s.axisPlacement} tabIndex={0} aria-label={placement}>
        <span className={s.axisSymbol} style={{ opacity: 0.4 + Math.abs(score.leftPercent - 50) / 50 * 0.6 }}><ValueIcon value={pole} /></span>
        <span className={s.tooltip} role="tooltip"><strong>{topics[axis.id]}</strong>{placement}{balanced ? <small>Balanced placement</small> : null}</span>
      </span>;
    })}
  </div>;
}

export default function Ideologies({ profiles }: { profiles: Profile[] }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const traditions = browseGroups.map(group => ({ ...group, profiles: profiles.filter(profile => groupFor(profile) === group.name).sort((a, b) => a.metadata.name.localeCompare(b.metadata.name)) }));
  const search = query.trim().toLowerCase();
  const groups = traditions.filter(group => selected === null || selected === group.name).map(group => ({ ...group, profiles: group.profiles.filter(profile => `${profile.metadata.name} ${profile.metadata.category} ${profile.metadata.description} ${profile.metadata.scope}`.toLowerCase().includes(search)) })).filter(group => group.profiles.length > 0);
  const shown = groups.reduce((total, group) => total + group.profiles.length, 0);

  return <div className={s.page}>
    <nav className={s.breadcrumb} aria-label="Breadcrumb"><a href="#/">Home</a><span aria-hidden="true">/</span><span>Ideologies</span></nav>
    <header className={s.hero}>
      <h1>Political ideologies</h1>
      <p className={s.description}>Explore the ideas that shape politics. Profiles use the same 15 values; placements are withheld when their evidence needs correction.</p>
      <dl className={s.stats}><div><dt>ideologies</dt><dd>{profiles.length}</dd></div><div><dt>groups</dt><dd>{browseGroups.length}</dd></div><div><dt>axes per profile</dt><dd>{axes.length}</dd></div></dl>
    </header>

    {profiles.length ? <>
      <section className={s.distribution} aria-labelledby="distribution-title">
        <h2 id="distribution-title" className={s.eyebrow}>Distribution across the groups</h2>
        <div className={s.spectrum} aria-hidden="true">{traditions.filter(group => group.profiles.length).map(group => <span key={group.name} style={{ background: group.color, flex: group.profiles.length }} />)}</div>
        <div className={s.distributionLegend}>{traditions.map(group => <button key={group.name} onClick={() => setSelected(selected === group.name ? null : group.name)} aria-pressed={selected === group.name} style={tint(group.color)}><span className={s.dot} /><span>{group.name}</span><span className={s.count}>{group.profiles.length}</span></button>)}</div>
      </section>

      <section className={s.toolbar} aria-label="Find ideologies">
        <label className={s.search}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg><input type="search" aria-label="Search ideologies" placeholder="Search ideology…" value={query} onChange={event => setQuery(event.target.value)} /></label>
        <div className={s.filters} aria-label="Filter by group"><button aria-pressed={selected === null} onClick={() => setSelected(null)}>All groups <span>{profiles.length}</span></button>{traditions.map(group => <button key={group.name} style={tint(group.color)} aria-pressed={selected === group.name} onClick={() => setSelected(selected === group.name ? null : group.name)}><span className={s.dot} />{group.name}<span>{group.profiles.length}</span></button>)}</div>
      </section>

      <section className={s.guide} aria-label="Reading the profiles">
        <p><strong>15 values, at a glance.</strong> Each icon shows the pole a profile leans towards. A stronger colour means a stronger leaning. Hover, focus or tap an icon to see both percentages.</p>
        <details><summary>Explore the 15 axes</summary><div className={s.axisLegend}>{axes.map(axis => <span key={axis.id}><ValueIcon value={axis.left} /><ValueIcon value={axis.right} /><span>{axis.name}</span></span>)}</div></details>
      </section>
      <div className={s.resultMeta}><p role="status">Showing {profileCount(shown)}{selected ? ` · ${selected}` : ''}</p>{selected || query ? <button onClick={() => { setSelected(null); setQuery(''); }}>Clear filters <span aria-hidden="true">×</span></button> : null}</div>
      <div className={s.groups}>{groups.map((group, index) => <section key={group.name} className={`${s.group} ${group.profiles.length === 1 ? s.smallGroup : ''}`} style={tint(group.color)} aria-labelledby={`tradition-${index}`}>
        <header className={s.groupHeader}><div><span className={s.groupMarker} /><h2 id={`tradition-${index}`}>{group.name}</h2></div><span className={s.badge}>{profileCount(group.profiles.length)}</span></header>
        <div className={s.grid}>{group.profiles.map(profile => {
          const match = /^(.*?)\s*\((.*)\)$/.exec(profile.metadata.name);
          return <article key={profile.id} className={s.card}>
            <div className={s.cardBody}><h3><a href={`#/ideologies/${profile.id}`} aria-label={profile.metadata.name}>{match?.[1] ?? profile.metadata.name}</a></h3>{match ? <p className={s.tradition}>{match[2]}</p> : null}<p className={s.cardDescription}>{profile.metadata.description}</p></div>
            <div className={s.cardFooter}><AxisStrip profile={profile} /><a className={s.profileLink} href={`#/ideologies/${profile.id}`} aria-label={`View ${profile.metadata.name} profile`}>View profile <span aria-hidden="true">→</span></a></div>
          </article>;
        })}</div>
      </section>)}</div>
      {!shown ? <div className={s.empty}><h2>No profiles match your search.</h2><p>Try another name or choose a different group.</p><button onClick={() => { setQuery(''); setSelected(null); }}>Show all ideologies <span aria-hidden="true">→</span></button></div> : null}
      <p className={s.researchNote}>These broad browsing groups can overlap: religious and libertarian traditions also hold positions across the political spectrum. Profiles describe specific traditions and periods. Open a profile to review its scope, sources and complete assessment.</p>
    </> : <div className={s.empty}><h2>No ideologies added yet.</h2><p>Get to know the values that underpin the site.</p><a href="#/?section=values">Explore the 15 values</a></div>}
  </div>;
}
