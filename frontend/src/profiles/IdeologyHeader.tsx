import type { CSSProperties } from 'react';
import ValueIcon from '../components/ValueIcon';
import { matchResultProfiles } from './ideologyMatching';
import { ideologyGroup, secondaryLeaningFor } from './ideologyGroups';
import type { Profile } from './types';
import s from './PersonalityHeader.module.css';
import i from './IdeologyHeader.module.css';

export default function IdeologyHeader({ profile, profiles }: { profile: Profile; profiles: Profile[] }) {
  const group = ideologyGroup(profile);
  const summary = profile.id === 'american-conservatism'
    ? 'Platform of the Republican Party, combining border security and deportations, tariffs and industrial protectionism, tax cuts and deregulation, gun rights, Christian values and returning abortion to the states.'
    : profile.metadata.description;
  const name = /^(.*?)\s*\((.*)\)$/.exec(profile.metadata.name);
  return <div className={s.graphic} style={{ '--profile-color': group.color } as CSSProperties}>
    <nav className={s.breadcrumb} aria-label="Breadcrumb"><a href="#/">Home</a><span aria-hidden="true">/</span><a href="#/ideologies" aria-label="All ideologies">Ideologies</a><span aria-hidden="true">/</span><span aria-current="page">{name?.[1] ?? profile.metadata.name}</span></nav>
    <header className={s.hero + ' ' + s.withoutPortrait}>
      <div className={s.intro}>
        <div className={s.badges}><span className={s.role}>{group.name}</span>{secondaryLeaningFor(profile) ? <span>{secondaryLeaningFor(profile)}</span> : null}<span>Ideology</span></div>
        <h1 className={i.title}>{name ? <>{name[1]} <span className={i.variant}>({name[2]})</span></> : profile.metadata.name}</h1>
        <p className={s.description}>{summary}</p>
        <section className={s.comparisons} aria-label="Most similar profiles">
          <h2 className={s.comparisonHeading}>Similar</h2>
          <dl aria-label="Profile comparisons">
            {(['personality', 'country'] as const).map(kind => {
              const representative = kind === 'personality' && profile.representativePersonalityId ? profiles.find(candidate => candidate.catalogue === 'personality' && candidate.id === profile.representativePersonalityId && !candidate.withdrawal) : undefined;
              const match = profile.withdrawal ? null : representative ? { profiles: [representative] } : matchResultProfiles(profile, profiles, kind);
              return <div className={s.matchCard} key={kind}>
                <dt className={s.srOnly}>{kind === 'personality' ? 'Person' : 'Country'}</dt>
                <dd>{match ? match.profiles.map(candidate => <a className={s.matchLink} key={candidate.id} href={'#/' + (kind === 'personality' ? 'personalities' : 'countries') + '/' + candidate.id}>
                  {candidate.metadata.image ? <img className={kind === 'personality' ? s.matchPortrait : i.matchFlag} src={import.meta.env.BASE_URL + candidate.metadata.image.path} alt="" loading="lazy" /> : <span className={s.matchIcon} aria-hidden="true">{kind === 'personality' ? candidate.metadata.name.split(/\s+/).map(word => word[0]).slice(0, 2).join('') : <ValueIcon value="Internationalism" />}</span>}
                  <span className={i.matchName}>{candidate.metadata.name}{representative ? <small> · Selected representative</small> : null}</span>
                </a>) : <span className={i.unavailable}>{profile.withdrawal ? 'Comparison unavailable' : 'No compatible assessment available'}</span>}</dd>
              </div>;
            })}
          </dl>
        </section>
      </div>
    </header>
  </div>;
}
