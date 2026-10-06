import type { CSSProperties } from 'react';
import type { Profile } from './types';
import s from './Catalogue.module.css';
import { profileTags, profileTagColor, profileTagsForKind } from './profileTags';
import { personalityGroup, matchedIdeologyGroup } from './personalityGroups';
import { personalityFlag } from './personalityFlags';

export default function ProfileCard({ profile, route }: { profile: Profile; route: 'personalities' | 'countries' }) {
  const { metadata } = profile;
  const country = profile.catalogue === 'country';
  const ideologyTags = profileTagsForKind(profile, 'ideology');
  const ideologyTagColor = (tag: string) => {
    if (profile.historicalContext?.ideology?.name === tag) return matchedIdeologyGroup(profile.historicalContext.ideology.id).color;
    const match = profile.closestIdeology?.ideologies.find(ideology => ideology.name === tag);
    return match ? matchedIdeologyGroup(match.id).color : profileTagColor(tag);
  };
  const classificationTags = <>
    {ideologyTags.map(tag => <li key={tag} aria-label={`${profile.historicalContext?.ideology ? 'Historical ideology' : profile.closestIdeology ? 'Closest ideology' : 'Recorded ideology'}: ${tag}`} style={{ '--tag-color': ideologyTagColor(tag) } as CSSProperties}>{tag}</li>)}
    {!ideologyTags.length ? <li>{profile.withdrawal ? 'Match unavailable' : 'Ideology not assessed'}</li> : null}
  </>;
  const flag = country ? undefined : personalityFlag(profile.id);
  return <article style={!country ? { '--profile-color': personalityGroup(profile).color } as CSSProperties : undefined} className={`${s.profileCard} ${country ? s.countryCard : ''}`}>
    <a className={s.profileLink} href={`#/${route}/${profile.id}`} aria-label={metadata.name}>
      <div className={s.profileBody}>
        <div className={s.profileImage}>
          {metadata.image ? <img src={`${import.meta.env.BASE_URL}${metadata.image.path}`} alt={metadata.image.alt} style={profile.id === 'thomas-sewell' ? { objectPosition: '75% 25%' } : undefined} loading="lazy" width="240" height="300" /> : <span className={s.imageFallback} aria-hidden="true">{metadata.name.split(/\s+/).map(word => word[0]).slice(0, 2).join('')}</span>}
        </div>
        <div className={s.profileCopy}>
          {!country ? <p className={s.profileCategory}>{profileTags(profile)[0]}</p> : null}
          <h3>{metadata.name}</h3>
          {metadata.lifespan && !country ? <p className={s.profileLifespan}>{metadata.lifespan}</p> : null}
          <p className={s.profileDescription}>{metadata.description}</p>
          {profile.withdrawal ? <p className={s.withdrawal}>Placements withdrawn · Evidence review required</p> : null}
        </div>
      </div>
      <div className={s.profileFooter}>{country ? <ul className={s.profileTags} aria-label="Political classification">
        {classificationTags}
      </ul> : <ul className={s.profileTags} aria-label="Profile tags"><li aria-label={`Closest ideology: ${ideologyTags.join(' / ')}`} style={{ '--tag-color': personalityGroup(profile).color } as CSSProperties}>{ideologyTags.join(' / ')}</li>{profileTags(profile).map(tag => <li key={tag} aria-label={`Position: ${tag}`} style={{ '--tag-color': profileTagColor(tag) } as CSSProperties}>{tag}</li>)}{flag ? <li className={s.flagTag} aria-label={`Best-known country: ${flag.name}`} title={`Best-known country: ${flag.name}`} style={{ '--tag-color': '#59676d' } as CSSProperties}>{flag.emoji}</li> : <li aria-label="Best-known country: Country unavailable" style={{ '--tag-color': '#59676d' } as CSSProperties}>Country unavailable</li>}</ul>}<span className={s.profileAction}>View profile <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span></div>
    </a>
  </article>;
}
