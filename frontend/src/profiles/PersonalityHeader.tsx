import type { CSSProperties } from 'react';
import type { Profile } from './types';
import { personalityGroup } from './personalityGroups';
import s from './PersonalityHeader.module.css';

export default function PersonalityHeader({ profile }: { profile: Profile }) {
  const { metadata } = profile;
  const image = metadata.image;
  const group = personalityGroup(profile);
  return <div className={s.graphic} style={{ '--profile-color': group.color } as CSSProperties}>
    <nav className={s.breadcrumb} aria-label="Breadcrumb">
      <a href="#/">Home</a><span aria-hidden="true">/</span>
      <a href="#/personalities" aria-label="All personalities">Personalities</a><span aria-hidden="true">/</span>
      <span aria-current="page">{metadata.name}</span>
    </nav>
    <header className={`${s.hero} ${!image ? s.withoutPortrait : ''}`}>
      <div className={s.intro}>
        <div className={s.badges}>
          <span className={s.role}>{metadata.role ?? metadata.category}</span>
          <span>{metadata.category}</span>
          {metadata.lifespan ? <span>{metadata.lifespan}</span> : null}
        </div>
        <h1>{metadata.name}</h1>
        <p className={s.description}>{metadata.description}</p>
        <div className={s.comparisons}>
          <dl aria-label="Comparison placeholders">
            <div><dt>Closest spectrum</dt><dd>To be added</dd></div>
            <div><dt>Closest ideology</dt><dd>To be added</dd></div>
            <div><dt>Closest personality</dt><dd>To be added</dd></div>
          </dl>
          <p className={s.placeholderNote}>Placeholders · Profile comparisons are not yet calculated.</p>
        </div>
      </div>
      {image ? <figure className={s.portrait}>
        <img src={`${import.meta.env.BASE_URL}${image.path}`} alt={image.alt} />
        <figcaption><a href={image.sourceUrl} target="_blank" rel="noreferrer">Wikimedia Commons · Source</a></figcaption>
      </figure> : null}
    </header>
  </div>;
}
