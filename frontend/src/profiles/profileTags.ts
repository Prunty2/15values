import { personalityFlag } from './personalityFlags';
import { browseGroups } from './ideologyGroups';
import type { Profile } from './types';

// Position labels from recorded role metadata.
// These are not calculated ideology matches or inferred from axis scores.
export function profileTags(profile: Profile): string[] {
  const shortRoles: Record<string, string> = {
    'elon-musk': 'Founder: SpaceX, Tesla',
    'bill-gates': 'Founder: Microsoft',
    'jeff-bezos': 'Founder: Amazon, Blue Origin',
    'mark-zuckerberg': 'Founder: Meta',
    'peter-thiel': 'Founder: PayPal, Palantir',
    'jeremy-corbyn': 'Leader: Your Party',
    'angus-taylor': 'Leader: Liberal Party',
    'nigel-farage': 'Leader: Reform UK',
    'rupert-lowe': 'Leader: Restore Britain',
    'pauline-hanson': 'Leader: One Nation',
    'matt-canavan': 'Leader: Nationals',
    'augusto-pinochet': 'Military ruler',
    'benito-mussolini': 'Fascist leader',
    'deng-xiaoping': 'Paramount leader',
    'frederick-douglass': 'Abolitionist',
    'joh-bjelke-petersen': 'Premier',
    'joseph-stalin': 'Soviet leader',
    'kim-jong-un': 'North Korean leader',
    'mahatma-gandhi': 'Independence leader',
    'mao-zedong': 'Communist leader',
    'mikhail-gorbachev': 'Soviet leader',
    'martin-luther-king-jr': 'Civil-rights leader',
    'nancy-pelosi': 'House speaker',
    'ruhollah-khomeini': 'Supreme leader',
    'zohran-mamdani': 'Mayor: New York City',
  };
  if (shortRoles[profile.id]) return [shortRoles[profile.id]];
  const role = profile.metadata.role ?? '';
  const positions: [RegExp, string][] = [
    [/\bprime minister\b/i, 'Prime minister'],
    [/\bvice president\b/i, 'Vice president'],
    [/(?<!vice )\bpresident\b/i, 'President'],
    [/\bchancellor\b/i, 'Chancellor'],
    [/\bsenator\b/i, 'Senator'],
    [/\bsecretary of state\b/i, 'Secretary of state'],
    [/\bmember of parliament\b|\bparliamentarian\b/i, 'MP'],
    [/\brepresentative\b/i, 'Representative'],
    [/\beconomist\b/i, 'Economist'],
    [/\bphilosopher\b/i, 'Philosopher'],
    [/\bpolitical thinker\b|\btheorist\b/i, 'Political theorist'],
    [/\bdictator\b/i, 'Dictator'],
    [/\bhead of government\b/i, 'Head of government'],
    [/\btheorist\b/i, 'Theorist'],
  ];
  const position = positions.find(([pattern]) => pattern.test(role));
  return [position?.[1] ?? (role.split(/[;,]/)[0] || 'Position unavailable')];
}

export function profileTagColor(tag: string): string {
  const group = browseGroups.find(group => group.name.replace('Far-', 'Far ').toLowerCase() === tag.toLowerCase());
  if (group) return group.color;
  const ideologyColors: Record<string, string> = {
    Nazism: '#283d59', Fascism: '#283d59',
    'Democratic socialism': '#487160', Socialism: '#914b53',
    Liberalism: '#59676d', Conservatism: '#385d85',
    'Economic nationalism': '#89603b',
  };
  return ideologyColors[tag] ?? '#67618a';
}

export type ProfileTagKind = 'leaning' | 'ideology' | 'position' | 'country';
export function profileTagsForKind(profile: Profile, kind: ProfileTagKind): string[] {
  if (kind === 'country') return [personalityFlag(profile.id)?.name ?? 'Country unavailable'];
  if (kind === 'position') return profileTags(profile);
  if (kind === 'ideology' && profile.catalogue === 'personality') return profile.closestIdeology?.ideologies.map(ideology => ideology.name) ?? [profile.withdrawal ? 'Match unavailable' : 'No match available'];
  if (kind === 'ideology' && profile.closestIdeology) return profile.closestIdeology.ideologies.map(ideology => ideology.name);
  const value = kind === 'leaning' ? profile.metadata.politicalLeaning : profile.metadata.ideology;
  return value ? [value] : [];
}
