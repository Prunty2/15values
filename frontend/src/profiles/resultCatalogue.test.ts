import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { matchResultProfiles } from './ideologyMatching';
import { parseCatalogue } from './catalogueData';
import { axes } from '../quiz/model';

it('provides compatible personality and country comparisons for saved midpoint results', () => {
  for (const bank of ['1.0.0', '2.0.0', '3.0.0', '4.0.0']) {
    const path = bank === '4.0.0' ? 'public/profiles/catalogue.v1.json' : 'public/profiles/result-catalogues/' + bank + '-' + (bank === '1.0.0' ? '1.0.0' : '2.0.0') + '-2.0.0.v1.json';
    const current = parseCatalogue(JSON.parse(readFileSync(path, 'utf8')));
    const subject = { questionBankVersion: bank, axesVersion: bank === '1.0.0' ? '1.0.0' : '2.0.0', scoringVersion: '2.0.0',
      scores: axes.map(axis => ({ axisId: axis.id, leftPercent: 50, rightPercent: 50, answered: 3, neutral: 3 })) };
    for (const kind of ['personality', 'country'] as const) expect(matchResultProfiles(subject, current, kind), `${bank} ${kind}`).not.toBeNull();
  }
});
