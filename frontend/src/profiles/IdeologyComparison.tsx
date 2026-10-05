import type { Profile } from './types';
import { axes } from '../quiz/model';
import { ideologyComparisonDetails } from './ideologyMatching';
export default function IdeologyComparison({ profile, profiles }: { profile: Profile; profiles: Profile[] }) {
  const match = profile.closestIdeology;
  const details = !profile.withdrawal ? ideologyComparisonDetails(profile, profiles) : null;
  return <section aria-label="Closest ideology"><h2>Closest ideology</h2>
    {match ? <>
      <p>{match.ideologies.map((ideology, index) => <span key={ideology.id}>{index ? ' · ' : ''}<a href={`#/ideologies/${ideology.id}`}>{ideology.name}</a></span>)}</p>
      <p>Average axis gap: {match.meanAbsoluteDistance.toFixed(1)} percentage points across all 15 axes, weighted equally.{match.ideologies.length > 1 ? ' These ideologies tie for closest.' : ''}</p>
      <p>This compares assessed scores within the current catalogue. It does not establish ideological identity; estimates in either assessment affect the match.</p>
      {details?.neighbours.map(({ profile: candidate, gaps }) => <p key={candidate.id}>{candidate.metadata.name} covers {candidate.metadata.period}. Largest disagreement: {axes.find(axis => axis.id === gaps[0].axisId)!.name}, {gaps[0].gap.toFixed(1)} percentage points apart.</p>)}
      {details?.next ? <p>The next closest assessment is <a href={`#/ideologies/${details.next.profile.id}`}>{details.next.profile.metadata.name}</a>, only {details.next.margin.toFixed(2)} percentage points further away on average. This margin is a numerical difference, not statistical confidence.</p> : null}
      {details?.neighbours.map(({ profile: candidate, gaps }) => <details key={candidate.id}>
        <summary>{candidate.metadata.name}: scope and axis disagreements</summary>
        <p>Assessed period: {candidate.metadata.period}. {candidate.metadata.scope}</p>
        <p>Largest axis gap: {gaps[0].gap.toFixed(1)} percentage points. A high average similarity can coexist with a large disagreement on an individual axis.</p>
        <ul>{gaps.map(gap => <li key={gap.axisId}>{axes.find(axis => axis.id === gap.axisId)!.name}: {gap.subject.toFixed(1)}% versus {gap.candidate.toFixed(1)}% on the left pole; gap {gap.gap.toFixed(1)} points.</li>)}</ul>
      </details>)}
    </> : <p>{profile.withdrawal ? 'Unavailable while placements are withdrawn.' : 'No compatible ideology assessments available.'}</p>}
  </section>;
}
