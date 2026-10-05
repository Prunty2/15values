import { browseGroups } from './ideologyGroups';
import type { Profile } from './types';

// Broad presentation groups for the assessed periods. These are editorial
// colour associations, not calculated closest-ideology matches or axis scores.
const personalityIds: Record<string, readonly string[]> = {
  'Far-Left': ['joseph-stalin', 'karl-marx', 'mao-zedong', 'rosa-luxemburg', 'xi-jinping'],
  Left: ['andy-burnham', 'anthony-albanese', 'bernie-sanders', 'franklin-d-roosevelt', 'julia-gillard', 'nelson-mandela'],
  Centre: ['barack-obama', 'john-locke', 'john-maynard-keynes', 'john-rawls', 'john-stuart-mill', 'kamala-harris'],
  Right: ['boris-johnson', 'donald-trump', 'edmund-burke', 'jd-vance', 'marco-rubio', 'margaret-thatcher', 'nigel-farage', 'pauline-hanson', 'ronald-reagan', 'rupert-lowe', 'vladimir-putin', 'winston-churchill'],
  'Far-Right': ['adolf-hitler', 'benito-mussolini'],
  Libertarian: ['friedrich-hayek', 'milton-friedman'],
  Religious: ['angela-merkel'],
  Other: ['thomas-hobbes'],
};

export function personalityGroup(profile: Profile) {
  return browseGroups.find(group => personalityIds[group.name]?.includes(profile.id))
    ?? browseGroups.find(group => group.name === 'Other')!;
}
