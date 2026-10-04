import type { Profile } from './types';

export const browseGroups = [
  { name: 'Far-Left', color: '#914b53', ids: ['communism', 'luxemburgism', 'marxism'] },
  { name: 'Left', color: '#487160', ids: ['democratic-socialism', 'green-politics', 'liberal-feminism', 'social-democracy'] },
  { name: 'Centre', color: '#59676d', ids: ['civic-nationalism', 'conservative-centrism', 'liberalism', 'social-liberalism'] },
  { name: 'Right', color: '#385d85', ids: ['american-conservatism', 'liberal-conservatism', 'nationalist-conservatism', 'neoconservatism', 'thatcherism'] },
  { name: 'Far-Right', color: '#283d59', ids: ['fascism', 'nazism'] },
  { name: 'Libertarian', color: '#986b22', ids: ['anarcho-capitalism', 'libertarianism', 'minarchism', 'objectivism', 'social-anarchism'] },
  { name: 'Religious', color: '#67618a', ids: ['christian-democracy', 'islamism'] },
  { name: 'Other', color: '#89603b', ids: [] },
];
export const groupFor = (profile: Profile) => browseGroups.find(group => group.ids.includes(profile.id))?.name ?? 'Other';
export const ideologyGroup = (profile: Profile) => browseGroups.find(group => group.name === groupFor(profile))!;
