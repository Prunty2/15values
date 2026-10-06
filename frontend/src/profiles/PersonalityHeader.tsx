import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import type { Profile } from './types';
import { personalityGroup } from './personalityGroups';
import { similarPersonalities } from './profileComparisons';
import { profileTags } from './profileTags';
import ValueIcon from '../components/ValueIcon';
import s from './PersonalityHeader.module.css';

function useFittedName<T extends HTMLElement>(name: string) {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    let active = true;
    const fit = () => {
      if (!active) return;
      element.style.fontSize = '';
      const preferred = parseFloat(getComputedStyle(element).fontSize);
      if (element.scrollWidth > element.clientWidth && element.clientWidth > 0) {
        element.style.fontSize = preferred * element.clientWidth / element.scrollWidth + 'px';
      }
    };
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    fit();
    void document.fonts.ready.then(fit);
    return () => { active = false; observer.disconnect(); };
  }, [name]);
  return ref;
}

function MatchName({ children }: { children: string }) {
  const ref = useFittedName<HTMLSpanElement>(children);
  return <span ref={ref} className={s.matchName}>{children}</span>;
}

export function IdeologyMatchCard({ profile }: { profile: Profile }) {
  return <div className={s.matchCard}>
              <dt className={s.srOnly}>Ideology</dt>
              <dd>{profile.closestIdeology ? profile.closestIdeology.ideologies.map(ideology => <a className={s.matchLink} key={ideology.id} href={`#/ideologies/${ideology.id}`}>
                <span className={s.matchIcon} aria-hidden="true">{ideology.id === 'christian-accelerationism' ? <svg data-ideology-icon="cross" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M10 3h4v5h5v4h-5v9h-4v-9H5V8h5Z" /></svg> : <ValueIcon value="Democracy" />}</span>
                <MatchName>{ideology.name}</MatchName>
              </a>) : profile.withdrawal ? 'Unavailable' : 'No match available'}</dd>
            </div>;
}

export default function PersonalityHeader({ profile, profiles }: { profile: Profile; profiles: Profile[] }) {
  const { metadata } = profile;
  const titleRef = useFittedName<HTMLHeadingElement>(metadata.name);
  const image = metadata.image;
  const group = personalityGroup(profile);
  const people = similarPersonalities(profile, profiles);
  return <div className={s.graphic} style={{ '--profile-color': group.color } as CSSProperties}>
    <nav className={s.breadcrumb} aria-label="Breadcrumb">
      <a href="#/">Home</a><span aria-hidden="true">/</span>
      <a href="#/personalities" aria-label="All personalities">Personalities</a><span aria-hidden="true">/</span>
      <span aria-current="page">{metadata.name}</span>
    </nav>
    <header className={`${s.hero} ${!image ? s.withoutPortrait : ''}`}>
      <div className={s.intro}>
        <div className={s.badges}>
          <span className={s.role}>{profileTags(profile)[0]}</span>
          <span>{metadata.category}</span>
          {metadata.lifespan ? <span>{metadata.lifespan}</span> : null}
        </div>
        <h1 ref={titleRef}>{metadata.name}</h1>
        <p className={s.description}>{metadata.description}</p>
        <div className={s.comparisons}>
          <h2 className={s.comparisonHeading}>Similar</h2>
          <dl aria-label="Profile comparisons">
            <IdeologyMatchCard profile={profile} />
            <div className={s.matchCard}>
              <dt className={s.srOnly}>Personality</dt>
              <dd>{people.length ? people.map(({ profile: person }) => <a className={s.matchLink} key={person.id} href={`#/personalities/${person.id}`}>
                {person.metadata.image ? <img className={s.matchPortrait} src={`${import.meta.env.BASE_URL}${person.metadata.image.path}`} alt="" loading="lazy" /> : <span className={s.matchIcon} aria-hidden="true">{person.metadata.name.split(/\s+/).map(word => word[0]).slice(0, 2).join('')}</span>}
                <MatchName>{person.metadata.name}</MatchName>
              </a>) : profile.withdrawal ? 'Unavailable' : 'No match available'}</dd>
            </div>
          </dl>
        </div>
      </div>
      {image ? <figure className={s.portrait}>
        <img src={`${import.meta.env.BASE_URL}${image.path}`} alt={image.alt} />
        <figcaption><a href={image.sourceUrl} target="_blank" rel="noreferrer">Wikimedia Commons · Source</a></figcaption>
      </figure> : null}
    </header>
  </div>;
}
