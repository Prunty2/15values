import { template, bankHash } from '../../scripts/profiles';
import { validateAudit } from '../../src/profiles/audit';
import type { Audit, Catalogue } from '../../src/profiles/types';

/** Fictional test data only; never archived in the repository or shipped in public/. */
export function fixture(catalogue: Catalogue = 'ideology', id = 'test-profile'): Audit {
  const audit = template(catalogue, id);
  audit.metadata = { ...audit.metadata, name: `Test ${catalogue}`, description: 'A fictional entry used only to verify the assessment workflow.', category: 'Test category', period: 'Test period', scope: 'Synthetic fixture, not a researched political profile.' };
  if (catalogue === 'ideology') audit.metadata.phrase = `A fictional society used to test ${id}.`;
  if (catalogue === 'personality') { audit.metadata.role = 'Fictional public figure'; audit.metadata.lifespan = '1900–1980'; }
  if (audit.metadata.image) Object.assign(audit.metadata.image, { alt: 'Test image', sourceUrl: 'https://example.org/image', creator: 'Test creator', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/' });
  audit.researchedAt = '2026-10-04'; audit.author = 'Test assessment'; audit.changeNote = 'Initial synthetic assessment.';
  audit.sources = [1, 2, 3].map(id => ({ id: `source-${id}`, title: `Test source ${id}`, url: `https://example.org/source-${id}`, publisher: `Test publisher ${id}`, date: '2026-10-01', accessed: '2026-10-04' }));
  audit.axes.forEach(axis => {
    axis.brief = 'Synthetic evidence covers this axis.';
    axis.counterEvidence = 'Synthetic counter-evidence reviewed for this test.';
    axis.answers.forEach(answer => { answer.value = 1; answer.basis = 'direct'; answer.rationale = 'A synthetic answer rationale for test coverage.'; answer.sources = ['source-1']; });
  });
  audit.review = { reviewer: 'Test review pass', reviewedAt: '2026-10-04', notes: 'Synthetic review for automated tests only.', similarity: [] };
  return audit;
}
export function profileFixture(catalogue: Catalogue = 'ideology', id = 'test-profile') {
  const result = validateAudit(fixture(catalogue, id), bankHash);
  if (!result.profile) throw new Error(result.errors.join('\n'));
  return result.profile;
}
