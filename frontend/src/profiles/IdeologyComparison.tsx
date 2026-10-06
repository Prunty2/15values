import type { Profile } from './types';
export default function IdeologyComparison({ profile }: { profile: Profile; profiles: Profile[] }) {
  const match = profile.closestIdeology;
  return <section aria-label="Closest ideology"><h2>Closest ideology</h2>
    {match ? <>
      <p>{match.ideologies.map((ideology, index) => <span key={ideology.id}>{index ? ' · ' : ''}<a href={`#/ideologies/${ideology.id}`}>{ideology.name}</a></span>)}</p>
      <p>{(100 - match.meanAbsoluteDistance).toFixed(1)}% similarity</p>
    </> : <p>{profile.withdrawal ? 'Unavailable while placements are withdrawn.' : 'No compatible ideology assessments available.'}</p>}
  </section>;
}
