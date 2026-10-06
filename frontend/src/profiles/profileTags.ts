import { personalityFlag } from './personalityFlags';
import { browseGroups } from './ideologyGroups';
import type { Profile } from './types';

export function capitaliseTag(label: string): string {
  return label.replace(/\b\p{L}/gu, letter => letter.toUpperCase());
}

// Sitting national MPs checked on 6 October 2026. Keep this additional role
// alongside the primary position; senators and US representatives retain their
// own labels. Existing historical role metadata is handled below.
// Parliamentary sources:
// UK: https://api.parliament.uk/mnis-prodder/parse?filter=membership%3Dall%7Chouse%2Acommons
// Australia: https://www.aph.gov.au/Senators_and_Members
// Germany: https://www.bundestag.de/abgeordnete/biografien
// Canada: https://www.ourcommons.ca/members/en/mark-carney%2828286%29
// India: https://sansad.in/ls/members/biographyM/4589?from=members
// Israel: https://m.knesset.gov.il/en/mk/government/pages/governments.aspx
// South Africa: https://www.parliament.gov.za/person-details/5985
const currentMps = new Set([
  'allegra-spender', 'alice-weidel', 'andy-burnham', 'angus-taylor',
  'anthony-albanese', 'benjamin-netanyahu', 'jeremy-corbyn', 'julius-malema',
  'keir-starmer', 'mark-carney', 'narendra-modi', 'nigel-farage',
  'olaf-scholz', 'rishi-sunak', 'rupert-lowe', 'zali-steggall',
]);

// Current party leaders checked on 6 October 2026, independently of the
// historical assessment period and primary office. Includes co-leaders,
// parliamentary leaders and principal political leaders where chair is separate.
// Country never restricts membership. Sources accompany each entry.
// Adam Bandt is included as an owner-selected former leader.
const politicalPartyLeaders = new Set([
  'david-shoebridge', // https://greens.org.au/nsw/person/david-shoebridge
  'adam-bandt', // Owner-requested browse membership; retain his former-leader label.
  'alice-weidel', // https://www.afd.de/partei/bundesvorstand/
  'andy-burnham', // https://labour.org.uk/people/andy-burnham/
  'angus-taylor', // https://www.abc.net.au/news/2026-02-13/angus-taylor-becomes-liberal-leader/106339798
  'anthony-albanese', // https://www.alp.org.au/about/national-executive/
  'benjamin-netanyahu', // https://www.aljazeera.com/news/2026/8/17/netanyahus-likud-party-holds-primaries-ahead-of-israels-general-elections
  'donald-trump', // https://en.wikipedia.org/wiki/Republican_Party_(United_States)
  'javier-milei', // https://en.wikipedia.org/wiki/La_Libertad_Avanza
  'jeremy-corbyn', // https://www.yourparty.uk/cec/
  'julius-malema', // https://effonline.org/provincial-command-teams/
  'kim-jong-un', // https://en.yna.co.kr/view/AEN20260223000300315
  'mark-carney', // https://secure.liberal.ca/event/Markham2026
  'matt-canavan', // https://www.liberal.org.au/team/matt-canavan
  'narendra-modi', // https://www.presidentofindia.gov.in/press_releases/press-communique-13
  'nigel-farage', // https://www.reformparty.uk/
  'pauline-hanson', // https://www.onenation.org.au/pauline-hanson
  'recep-tayyip-erdogan', // https://www.akparti.org.tr/ak-kadro/genel-baskan/
  'rupert-lowe', // https://www.restorebritain.org.uk/
  'thomas-sewell', // https://www.abc.net.au/news/2026-09-08/white-australia-opens-arguments-appeal-against-hate-speech-laws/107129404
  'xi-jinping', // https://english.www.gov.cn/news/202508/29/content_WS68b165f0c6d0868f4e8f5282.html
]);

// Position labels from recorded role metadata.
// These are not calculated ideology matches or inferred from axis scores.
// Additional browse membership preserves each profile's specific office label.
// Browse membership covers rulers during documented dictatorial/authoritarian
// periods, including electoral authoritarianism and temporary dictatorship.
// It does not classify every year of their careers or derive labels from scores.
const dictators = new Set([
  'hugo-chavez', // https://www.hrw.org/news/2013/03/05/venezuela-chavezs-authoritarian-legacy
  'ian-smith', // https://history.state.gov/historicaldocuments/frus1964-68v24/d553
  'indira-gandhi', // Emergency, 1975–1977: https://history.state.gov/historicaldocuments/frus1969-76ve08/d208
  'lee-kuan-yew', // https://www.csis.org/analysis/lee-kuan-yews-enigma-authoritarian-yet-kind-democrat
  'mikhail-gorbachev', // Initial one-party Soviet leadership; later democratisation: https://www.britannica.com/biography/Mikhail-Gorbachev
  'recep-tayyip-erdogan', // https://freedomhouse.org/country/turkey/freedom-world/2025
  'adolf-hitler', 'augusto-pinochet', 'benito-mussolini', 'deng-xiaoping',
  'fidel-castro', 'ho-chi-minh', 'joseph-stalin', 'josip-broz-tito',
  'kim-jong-un', 'mao-zedong', 'ruhollah-khomeini', 'vladimir-lenin',
  'vladimir-putin', 'xi-jinping',
]);

export function profileTags(profile: Profile): string[] {
  const positions = primaryPositionTags(profile);
  if (profile.catalogue === 'personality') {
    if (currentMps.has(profile.id)) positions.push('MP');
    if (dictators.has(profile.id)) positions.push('Dictator');
  }
  return [...new Set(positions.map(compactPosition))];
}

// Detailed offices stay in metadata; browse labels use shared role categories.
function compactPosition(tag: string): string {
  const role = tag.split(':')[0].trim();
  if (/^(former )?leader$/i.test(role) || /fascist leader/i.test(role)) return 'Leader';
  if (/^founder$/i.test(role)) return 'Founder';
  if (/^MEP$/i.test(role)) return 'MEP';
  if (/^mayor$/i.test(role)) return 'Mayor';
  if (/^vice president$/i.test(role)) return 'Vice President';
  return role;
}

function primaryPositionTags(profile: Profile): string[] {
  if (profile.id === 'charlie-kirk') return ['Activist', 'Founder: Turning Point USA'];
  if (['kim-jong-un', 'augusto-pinochet', 'deng-xiaoping', 'ruhollah-khomeini', 'vladimir-lenin', 'joseph-stalin', 'mikhail-gorbachev', 'mao-zedong'].includes(profile.id)) return [];
  const shortRoles: Record<string, string> = {
    'heinrich-himmler': 'Leader: SS',
    'julius-malema': 'Leader: EFF',
    'dominik-tarczynski': 'MEP: Poland',
    'alice-weidel': 'Leader: AfD',
    'adam-bandt': 'Former Leader: Australian Greens',
    'david-shoebridge': 'Leader: Australian Greens',
    'elon-musk': 'Founder: SpaceX, Tesla',
    'bill-gates': 'Founder: Microsoft',
    'jeff-bezos': 'Founder: Amazon, Blue Origin',
    'mark-zuckerberg': 'Founder: Meta',
    'peter-thiel': 'Founder: PayPal, Palantir',
    'rupert-murdoch': 'Founder: News Corp',
    'jeremy-corbyn': 'Leader: Your Party',
    'angus-taylor': 'Leader: Liberal Party',
    'nigel-farage': 'Leader: Reform UK',
    'rupert-lowe': 'Leader: Restore Britain',
    'pauline-hanson': 'Leader: One Nation',
    'matt-canavan': 'Leader: Nationals',
    'thomas-sewell': 'Leader: White Australia Party',
    'benito-mussolini': 'Fascist leader',
    'fidel-castro': 'Prime minister',
    'frederick-douglass': 'Activist',
    'joh-bjelke-petersen': 'Premier',
    'mahatma-gandhi': 'Activist',
    'martin-luther-king-jr': 'Activist',
    'zohran-mamdani': 'Mayor: New York City',
  };
  if (shortRoles[profile.id]) return [shortRoles[profile.id]];
  const role = profile.metadata.role ?? '';
  const positions: [RegExp, string][] = [
    [/\bprime minister\b/i, 'Prime minister'],
    [/\bvice president\b/i, 'Vice President'],
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
    [/\btheorist\b/i, 'Political theorist'],
    [/\bpremier\b/i, 'Premier'],
    [/\bmayor\b/i, 'Mayor'],
    [/\bking\b|\bemperor\b|\btsar\b|\bsultan\b|\bmonarch\b/i, 'Monarch'],
    [/\bgeneral\b|\bcommander\b|\bchief of staff\b|\blord protector\b/i, 'Military leader'],
    [/\bfounder\b/i, 'Founder'],
    [/\bactivist\b|\bcampaigner\b|\babolitionist\b/i, 'Activist'],
    [/\bleader\b|\bhead of\b|\borganiser\b/i, 'Leader'],
  ];
  const position = positions.find(([pattern]) => pattern.test(role));
  if (position?.[1] === 'Vice President') {
    const country = personalityFlag(profile.id)?.name;
    return [country ? `Vice President: ${country}` : 'Vice President'];
  }
  return [position?.[1] ?? 'Politician'];
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
// Browse by role while retaining the specific organisation on profile tags.
export function profileFilterTagsForKind(profile: Profile, kind: ProfileTagKind): string[] {
  const tags = profileTagsForKind(profile, kind);
  if (kind !== 'position') return tags;
  const positions = [...new Set(tags.map(tag => {
    const role = tag.split(':')[0].trim();
    return role === 'Former Leader' ? 'Leader' : role;
  }))]
    .filter(tag => tag !== 'Fascist leader');
  if (profile.catalogue === 'personality') {
    if (politicalPartyLeaders.has(profile.id)) positions.push('Political Party Leaders');
    if (dictators.has(profile.id)) positions.push('Dictator');
  }
  return [...new Set(positions)];
}

export function profileTagsForKind(profile: Profile, kind: ProfileTagKind): string[] {
  if (kind === 'ideology' && profile.catalogue === 'country' && !profile.withdrawal && profile.historicalContext?.ideology) return [profile.historicalContext.ideology.name];
  if (kind === 'country') return [personalityFlag(profile.id)?.name ?? 'Country unavailable'];
  if (kind === 'position') return profileTags(profile);
  if (kind === 'ideology' && profile.catalogue === 'personality') return profile.closestIdeology?.ideologies.map(ideology => ideology.name) ?? [profile.withdrawal ? 'Match unavailable' : 'No match available'];
  if (kind === 'ideology' && profile.closestIdeology) return profile.closestIdeology.ideologies.map(ideology => ideology.name);
  const value = kind === 'leaning' ? profile.metadata.politicalLeaning : profile.metadata.ideology;
  return value ? [value] : [];
}
