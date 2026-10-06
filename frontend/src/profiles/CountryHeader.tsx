import type { CSSProperties } from 'react';
import type { Profile } from './types';
import { ideologyGroup } from './ideologyGroups';
import { IdeologyMatchCard } from './PersonalityHeader';
import comparisonStyles from './PersonalityHeader.module.css';
import s from './CountryHeader.module.css';

export default function CountryHeader({ profile, profiles }: { profile: Profile; profiles: Profile[] }) {
  const { metadata } = profile;
  const ideology = profiles.find(candidate => candidate.catalogue === 'ideology' && candidate.id === profile.closestIdeology?.ideologies[0]?.id);
  return <div className={s.graphic} style={{ '--profile-color': ideology ? ideologyGroup(ideology).color : 'var(--accent)' } as CSSProperties}>
    <nav className={s.breadcrumb} aria-label="Breadcrumb">
      <a href="#/">Home</a><span aria-hidden="true">/</span>
      <a href="#/countries" aria-label="All countries">Countries</a><span aria-hidden="true">/</span>
      <span aria-current="page">{metadata.name}</span>
    </nav>
    <header className={s.hero}>
      <div className={s.intro}>
        <p className={s.category}>{metadata.category}</p>
        <h1>{metadata.name}</h1>
        <p className={s.description}>{metadata.description}</p>
        <section className={comparisonStyles.comparisons} aria-label="Closest ideology">
          <h2 className={comparisonStyles.comparisonHeading}>Similar</h2>
          <dl aria-label="Profile comparisons"><IdeologyMatchCard profile={profile} /></dl>
        </section>
      </div>
      {metadata.image ? <figure className={s.flag}>
        <img src={`${import.meta.env.BASE_URL}${metadata.image.path}`} alt={metadata.image.alt} />
      </figure> : null}
    </header>
  </div>;
}
