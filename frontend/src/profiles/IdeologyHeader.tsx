import type { CSSProperties } from 'react';
import ValueIcon from '../components/ValueIcon';
import { ideologyGroup } from './ideologyGroups';
import type { Profile } from './types';
import s from './IdeologyHeader.module.css';

export default function IdeologyHeader({ profile }: { profile: Profile }) {
  const group = ideologyGroup(profile);
  const summary = profile.id === 'american-conservatism'
    ? 'Platform of the Republican Party, combining border security and deportations, tariffs and industrial protectionism, tax cuts and deregulation, gun rights, Christian values and returning abortion to the states.'
    : profile.metadata.description;
  const name = /^(.*?)\s*\((.*)\)$/.exec(profile.metadata.name);
  const titleSize = `${140 / (name?.[1] ?? profile.metadata.name).length}cqi`;
  return <div className={s.graphic} style={{ '--profile-color': group.color } as CSSProperties}>
    <nav className={s.breadcrumb} aria-label="Breadcrumb"><a href="#/">Home</a><span aria-hidden="true">/</span><a href="#/ideologies" aria-label="All ideologies">Ideologies</a><span aria-hidden="true">/</span><span>{name?.[1] ?? profile.metadata.name}</span></nav>
    <header className={s.hero}>
      <div className={s.intro}>
        <div className={s.badges}><span className={s.groupBadge}>{group.name}</span><span>Ideology</span></div>
        <h1 style={{ fontSize: `min(44px, ${titleSize})` }}>{name ? <>{name[1]} <span className={s.variant}>({name[2]})</span></> : profile.metadata.name}</h1>
        <p className={s.description}>{summary}</p>
      </div>
      <aside className={s.references} aria-label="Reference placeholders">
        <div className={s.referenceCard}><div className={s.placeholderIcon} aria-hidden="true"><svg viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="16" cy="10" r="5" /><path d="M6 28v-3a10 10 0 0 1 20 0v3" /></svg></div><div><h2>Key figure</h2><p className={s.placeholderTitle}>To be added</p><p className={s.placeholderLabel}>Placeholder</p></div></div>
        <div className={s.referenceCard}><div className={s.placeholderIcon} aria-hidden="true"><ValueIcon value="Internationalism" /></div><div><h2>Reference country</h2><p className={s.placeholderTitle}>To be added</p><p className={s.placeholderLabel}>Placeholder</p></div></div>
      </aside>
    </header>
    {profile.metadata.phrase ? <section className={s.sentence} aria-labelledby="ideology-sentence-title"><span className={s.quoteMark} aria-hidden="true">“</span><div><h2 id="ideology-sentence-title">— In one sentence</h2><blockquote>{profile.metadata.phrase}</blockquote><p>A summary of the society this assessed tradition envisions.</p></div></section> : null}
  </div>;
}
