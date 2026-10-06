import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { parseCatalogue } from './catalogueData';
import { profileFilterTagsForKind, profileTags } from './profileTags';

const profiles = parseCatalogue(JSON.parse(readFileSync(new URL('../../public/profiles/catalogue.v1.json', import.meta.url), 'utf8')));
const person = (id: string) => profiles.find(p => p.catalogue === 'personality' && p.id === id)!;

it('groups detailed historical and organisational offices into shared roles', () => {
  for (const [id, tag] of [
    ['helen-zille', 'Premier'], ['thomas-rousseau', 'Founder'],
    ['jose-antonio-primo-de-rivera', 'Founder'], ['ernst-rohm', 'Military leader'],
    ['constand-viljoen', 'Military leader'], ['alexander-the-great', 'Monarch'],
    ['greta-thunberg', 'Activist'], ['eric-campbell', 'Leader'],
  ]) {
    expect(profileTags(person(id))).toContain(tag);
    expect(profileFilterTagsForKind(person(id), 'position')).toContain(tag);
  }
});

it('does not create a filter from an unrecognised detailed office', () => {
  const profile = { ...person('helen-zille'), id: 'unrecognised', metadata: { ...person('helen-zille').metadata, role: 'Special regional office with unique qualifications' } };
  expect(profileTags(profile)).toEqual(['Politician']);
  expect(profileFilterTagsForKind(profile, 'position')).toEqual(['Politician']);
});

it('preserves additional documented browse membership and compact organisation tags', () => {
  expect(profileTags(person('alice-weidel'))).toEqual(['Leader', 'MP']);
  expect(profileFilterTagsForKind(person('alice-weidel'), 'position')).toContain('Political Party Leaders');
  expect(profileTags(person('vladimir-lenin'))).toContain('Dictator');
  expect(profileTags(person('bill-gates'))).toEqual(['Founder']);
});
