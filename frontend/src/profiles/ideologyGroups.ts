import type { Profile } from './types';

export const browseGroups = [
  { name: 'Far-Left', color: '#914b53', ids: ['communism', 'cuban-socialism', 'democratic-socialism', 'ecosocialism', 'fanonism', 'leninism', 'luxemburgism', 'maoism', 'marxism', 'marxism-leninism', 'socialism', 'titoism', 'trotskyism'] },
  { name: 'Left', color: '#487160', ids: ['communitarianism', 'environmentalism', 'green-politics', 'left-wing-populism', 'liberal-feminism', 'nordic-social-democracy', 'postmodernism', 'progressive-liberalism', 'social-democracy'] },
  { name: 'Centre', color: '#59676d', ids: ['civic-nationalism', 'conservative-centrism', 'kantian-republicanism', 'liberalism', 'meritocracy', 'republicanism', 'social-liberalism', 'third-way'] },
  { name: 'Right', color: '#385d85', ids: ['alt-lite', 'american-conservatism', 'capitalism', 'cultural-nationalism', 'hansonism', 'liberal-conservatism', 'nationalist-conservatism', 'nativism', 'neoconservatism', 'neoliberalism', 'right-wing-populism', 'thatcherism', 'traditional-conservatism'] },
  { name: 'Far-Right', color: '#283d59', ids: ['authoritarian-capitalism', 'fascism', 'militarism', 'nazism', 'neo-nazism', 'ultranationalism'] },
  { name: 'Libertarian', color: '#986b22', ids: ['anarcho-capitalism', 'classical-liberalism', 'libertarianism', 'minarchism', 'objectivism', 'social-anarchism'] },
  { name: 'Religious', color: '#67618a', ids: ['christian-accelerationism', 'christian-conservatism', 'christian-democracy', 'christian-nationalism', 'christian-socialism', 'hindu-nationalism', 'islamic-fundamentalism', 'islamic-socialism', 'islamism'] },
  { name: 'Other', color: '#89603b', ids: ['constitutional-monarchism', 'bonapartism', 'japanese-imperial-ultranationalism', 'dutch-commercial-republicanism'] },
];
export const groupFor = (profile: Profile) => browseGroups.find(group => group.ids.includes(profile.id))?.name ?? 'Other';
export const ideologyGroup = (profile: Profile) => browseGroups.find(group => group.name === groupFor(profile))!;

// Explicit labels for clearly scoped traditions, independent of axis scores.
const secondaryLeanings: Record<string, string> = {
  'hindu-nationalism': 'Right',
  'christian-conservatism': 'Right',
  'christian-nationalism': 'Right',
  'christian-socialism': 'Left',
  'islamic-socialism': 'Left',
};
export const secondaryLeaningFor = (profile: Profile) => secondaryLeanings[profile.id];
