import { browseGroups } from './ideologyGroups';
import type { Profile } from './types';

export const matchedIdeologyGroup = (id: string) => browseGroups.find(group => group.ids.includes(id)) ?? browseGroups.find(group => group.name === 'Other')!;

// Follow the matched ideology palette. Cross-group ties have no single group colour.
export function personalityGroup(profile: Profile) {
  const matches = profile.closestIdeology?.ideologies;
  if (matches?.length) {
    const groups = matches.map(match => matchedIdeologyGroup(match.id));
    if (groups.every(group => group.name === groups[0].name)) return groups[0];
    return { name: 'Tied ideologies', color: '#59676d', ids: [] };
  }
  return { name: 'Unclassified', color: '#59676d', ids: [] };
}
