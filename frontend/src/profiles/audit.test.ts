import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { archiveDraft, bankHash, buildCatalogue, prompt, root, run, template } from '../../scripts/profiles';
import { fixture, profileFixture } from '../../tests/fixtures/profile';
import { axes, questions, scoreAnswers } from '../quiz/model';
import type { Answers } from '../quiz/model';
import { neighbourReview, similarity, validateAudit } from './audit';
import { parseCatalogue } from './catalogueData';

const temporary: string[] = [];
const workspace = () => { const path = mkdtempSync(join(tmpdir(), '15-values-audit-')); temporary.push(path); return path; };
const save = (path: string, value: unknown) => { mkdirSync(join(path, '..'), { recursive: true }); writeFileSync(path, JSON.stringify(value)); };
afterEach(() => { vi.restoreAllMocks(); temporary.splice(0).forEach(path => rmSync(path, { recursive: true, force: true })); });

describe('assessment validation', () => {
  it('generates an unresolved template and includes every current question verbatim once', () => {
    const draft = template('personality', 'example');
    expect(draft.axes).toHaveLength(15);
    expect(draft.axes.flatMap(axis => axis.answers)).toHaveLength(240);
    expect(draft.axes.every(axis => axis.answers.length === 16 && axis.answers.every(answer => answer.value === null))).toBe(true);
    const instructions = prompt(draft);
    for (const question of questions) {
      expect(instructions.split(`${question.id} [`)).toHaveLength(2);
      expect(instructions).toContain(question.text);
    }
    expect(validateAudit(draft, bankHash).profile).toBeUndefined();
  });
  it.each(['ideology', 'country', 'personality'] as const)('scores %s with the exact user scoring function', catalogue => {
    const audit = fixture(catalogue);
    audit.axes.forEach((axis, index) => axis.answers.forEach((answer, n) => { answer.value = ((index + n) % 5 - 2) as Answers[string]; }));
    const result = validateAudit(audit, bankHash);
    expect(result.errors).toEqual([]);
    const answers = Object.fromEntries(audit.axes.flatMap(axis => axis.answers).map(answer => [answer.questionId, answer.value])) as Answers;
    expect(result.profile!.scores).toEqual(scoreAnswers('comprehensive', answers));
  });
  it.each([
    ['missing answer', (a: ReturnType<typeof fixture>) => a.axes[0].answers.pop()],
    ['duplicate answer', (a: ReturnType<typeof fixture>) => { a.axes[0].answers[1] = a.axes[0].answers[0]; }],
    ['misplaced answer', (a: ReturnType<typeof fixture>) => { a.axes[0].answers[0].questionId = a.axes[1].answers[0].questionId; }],
    ['extra axis', (a: ReturnType<typeof fixture>) => a.axes.push(a.axes[0])],
    ['unknown answer', (a: ReturnType<typeof fixture>) => { a.axes[0].answers[0].value = null; a.axes[0].answers[0].basis = 'unknown'; }],
    ['neutral masking unknown', (a: ReturnType<typeof fixture>) => { a.axes[0].answers[0].value = 0; a.axes[0].answers[0].basis = 'unknown'; }],
    ['invalid value', (a: ReturnType<typeof fixture>) => { a.axes[0].answers[0].value = 3 as never; }],
    ['missing reference', (a: ReturnType<typeof fixture>) => { a.axes[0].answers[0].sources = ['missing']; }],
    ['unsupported inference', (a: ReturnType<typeof fixture>) => { a.axes[0].answers[0].rationale = ''; }],
    ['empty review', (a: ReturnType<typeof fixture>) => { a.review.notes = ''; }],
    ['invalid date', (a: ReturnType<typeof fixture>) => { a.researchedAt = '2026-02-30'; }],
    ['duplicate sources', (a: ReturnType<typeof fixture>) => { a.sources[1].id = a.sources[0].id; }],
    ['unsafe link', (a: ReturnType<typeof fixture>) => { a.sources[0].url = 'javascript:alert(1)'; }],
    ['stale hash', (a: ReturnType<typeof fixture>) => { a.bankHash = 'old'; }],
    ['stale scoring', (a: ReturnType<typeof fixture>) => { a.scoringVersion = '1.0.0'; }],
    ['unsafe ID', (a: ReturnType<typeof fixture>) => { a.id = '../outside'; }],
    ['missing phrase', (a: ReturnType<typeof fixture>) => { delete a.metadata.phrase; }],
  ])('rejects %s before scoring', (_, mutate) => {
    const audit = fixture(); mutate(audit);
    const result = validateAudit(audit, bankHash);
    expect(result.errors.length).toBeGreaterThan(0); expect(result.profile).toBeUndefined();
  });
  it('does not force fabricated opinions when neutral answers are supported', () => {
    const audit = fixture(); audit.axes.forEach(axis => axis.answers.forEach(answer => { answer.value = 0; }));
    const result = validateAudit(audit, bankHash);
    expect(result.errors).toEqual([]); expect(result.warnings).toHaveLength(15);
    expect(result.profile!.scores.every(score => score.leftPercent === 50)).toBe(true);
  });
  it('rejects manual vectors and unexpected archetype blocks', () => {
    expect(validateAudit({ ...fixture(), vector: axes.map(() => 50) }, bankHash).profile).toBeUndefined();
    expect(validateAudit({ ...fixture(), archetype: {} }, bankHash).profile).toBeUndefined();
    for (const input of [null, [], 1, { axes: [null], sources: [null] }]) expect(() => validateAudit(input, bankHash)).not.toThrow();
  });
  it('reviews close neighbours without treating resemblance as evidence of an error', () => {
    const a = profileFixture('ideology', 'first'), b = profileFixture('ideology', 'second');
    expect(similarity(a.scores, b.scores)).toBe(100);
    expect(neighbourReview(a, [a, b, profileFixture('country')], []).errors).toHaveLength(1);
    expect(neighbourReview(a, [b], [{ id: b.id, revision: 1, reason: 'Independent evidence supports the same measured positions.' }]).errors).toEqual([]);
    expect(neighbourReview(a, [{ ...b, revision: 2 }], [{ id: b.id, revision: 1, reason: 'Old review.' }]).errors).toHaveLength(1);
    expect(() => similarity([], a.scores)).toThrow();
    const extremes = a.scores.map(score => ({ ...score, leftPercent: 0, rightPercent: 100 }));
    expect(similarity(extremes, extremes.map(score => ({ ...score, leftPercent: 100, rightPercent: 0 })))).toBe(0);
  });
});

describe('profile lifecycle', () => {
  it('withdraws only the disputed revision, preserves evidence, and restores a validated successor', () => {
    const base = workspace(), audit = fixture();
    const archived = archiveDraft(base, audit), original = readFileSync(archived, 'utf8');
    const manifest = join(base, 'profile-audit/withdrawals.json');
    save(manifest, [{ catalogue: audit.catalogue, id: audit.id, revision: 1, date: '2026-10-04', reason: 'Unsupported institutional inferences.' }]);
    const profiles = buildCatalogue(base, false);
    expect(profiles[0].scores).toEqual([]);
    expect(profiles[0].withdrawal?.reason).toContain('Unsupported');
    expect(parseCatalogue({ schemaVersion: 1, profiles })).toEqual(profiles);
    expect(() => parseCatalogue({ schemaVersion: 1, profiles: [{ ...profiles[0], scores: profileFixture().scores }] })).toThrow();
    expect(readFileSync(archived, 'utf8')).toBe(original);
    expect(JSON.parse(readFileSync(join(base, 'frontend/public', profiles[0].auditPath), 'utf8')).revision).toBe(1);
    audit.revision = 2; archiveDraft(base, audit);
    const restored = buildCatalogue(base, false)[0];
    expect(restored.withdrawal).toBeUndefined();
    expect(restored.scores).toHaveLength(15);
    save(manifest, [{ catalogue: audit.catalogue, id: audit.id, revision: 99, date: '2026-10-04', reason: 'Missing revision' }]);
    expect(() => buildCatalogue(base, false)).toThrow(/withdrawn revision/);
  });
  it('archives all three catalogues and reproduces generated scores and downloads', () => {
    const base = workspace();
    for (const catalogue of ['ideology', 'country', 'personality'] as const) {
      const audit = fixture(catalogue);
      if (audit.metadata.image) {
        const path = join(base, 'frontend/public', audit.metadata.image.path);
        mkdirSync(join(path, '..'), { recursive: true }); writeFileSync(path, Buffer.from([0xff, 0xd8, 0xff, 0xd9]));
      }
      archiveDraft(base, audit);
    }
    const profiles = buildCatalogue(base, false);
    expect(profiles).toHaveLength(3);
    expect(buildCatalogue(base, true)).toEqual(profiles);
    expect(parseCatalogue(JSON.parse(readFileSync(join(base, 'frontend/public/profiles/catalogue.v1.json'), 'utf8')))).toEqual(profiles);
    for (const profile of profiles) expect(JSON.parse(readFileSync(join(base, 'frontend/public', profile.auditPath), 'utf8')).axes).toHaveLength(15);
    const before = readFileSync(join(base, 'frontend/public/profiles/catalogue.v1.json'), 'utf8');
    buildCatalogue(base, false); expect(readFileSync(join(base, 'frontend/public/profiles/catalogue.v1.json'), 'utf8')).toBe(before);
  });
  it('preserves revisions, rejects overwrites and fails on manually altered generated scores', () => {
    const base = workspace(), audit = fixture();
    const first = archiveDraft(base, audit), bytes = readFileSync(first, 'utf8');
    expect(() => archiveDraft(base, audit)).toThrow(/revision/);
    audit.revision = 2; audit.axes[0].answers[0].value = -2; archiveDraft(base, audit);
    expect(readFileSync(first, 'utf8')).toBe(bytes);
    const profiles = buildCatalogue(base, false); expect(profiles[0].revision).toBe(2);
    save(join(base, 'frontend/public/profiles/catalogue.v1.json'), { schemaVersion: 1, profiles: [] });
    expect(() => buildCatalogue(base, true)).toThrow(/stale/);
    buildCatalogue(base, false);
    expect(buildCatalogue(base, true)).toHaveLength(1);
  });
  it('does not publish drafts and refuses missing or oversized images', () => {
    const base = workspace();
    save(join(base, 'profile-audit/drafts/personality/example.json'), template('personality', 'example'));
    expect(buildCatalogue(base, false)).toEqual([]);
    const audit = fixture('country');
    expect(() => archiveDraft(base, audit)).toThrow(/Missing image/);
    const path = join(base, 'frontend/public', audit.metadata.image!.path);
    mkdirSync(join(path, '..'), { recursive: true }); writeFileSync(path, Buffer.alloc(1_000_001));
    expect(() => archiveDraft(base, audit)).toThrow(/exceeds/);
    writeFileSync(path, '<html>not an image</html>'); expect(() => archiveDraft(base, audit)).toThrow(/contents/);
  });
  it('blocks close duplicates without a review even if the archive command is bypassed', () => {
    const base = workspace(), first = fixture('ideology', 'first'), second = fixture('ideology', 'second');
    archiveDraft(base, first);
    expect(() => archiveDraft(base, second)).toThrow(/similarity/);
    save(join(base, 'profile-audit/answers/ideology/second/1.json'), second);
    expect(() => buildCatalogue(base, false)).toThrow(/similarity/);
    second.review.similarity = [{ id: 'first', revision: 1, reason: 'Evidence reviewed; distinct subjects with the same measured positions.' }];
    save(join(base, 'profile-audit/answers/ideology/second/1.json'), second);
    expect(buildCatalogue(base, false)).toHaveLength(2);
  });
  it('rejects orphan downloads, archive path mismatches and stale current profiles', () => {
    const base = workspace(), audit = fixture(); archiveDraft(base, audit); buildCatalogue(base, false);
    const orphan = join(base, 'frontend/public/profiles/audits/orphan.json'); save(orphan, {});
    expect(() => buildCatalogue(base, true)).toThrow(/Orphan/); rmSync(orphan);
    const source = join(base, 'profile-audit/answers/ideology/test-profile/1.json');
    save(source, { ...audit, id: 'wrong-id' }); expect(() => buildCatalogue(base, true)).toThrow(/mismatch/);
    save(source, { ...audit, bankHash: 'old' }); expect(() => buildCatalogue(base, false)).toThrow(/Stale/);
  });
  it('runs the actual CLI, refuses draft overwrite and resumes from archived revisions', () => {
    const base = workspace(); vi.spyOn(console, 'log').mockImplementation(() => {});
    run(['init', 'ideology', 'example'], base);
    expect(() => run(['init', 'ideology', 'example'], base)).toThrow(/EEXIST/);
    expect(() => run(['archive', 'ideology', '../outside'], base)).toThrow();
    const audit = fixture('ideology', 'example'); save(join(base, 'profile-audit/drafts/ideology/example.json'), audit);
    run(['validate', 'ideology', 'example'], base); run(['archive', 'ideology', 'example'], base);
    run(['build'], base); run(['check'], base); run(['status'], base);
    rmSync(join(base, 'profile-audit/drafts/ideology/example.json'));
    run(['init', 'ideology', 'example'], base);
    const next = JSON.parse(readFileSync(join(base, 'profile-audit/drafts/ideology/example.json'), 'utf8'));
    expect(next.revision).toBe(2); expect(next.axes[0].answers[0].value).toBeNull(); expect(next.metadata.name).toBe(audit.metadata.name);
    const output = execFileSync(process.execPath, ['--experimental-strip-types', join(root, 'frontend/scripts/profiles.ts'), 'status'], { cwd: base, encoding: 'utf8' });
    expect(JSON.parse(output)).toHaveProperty('pending');
  });
  it('checks immutable archive history against a real Git base', () => {
    const base = workspace(); vi.spyOn(console, 'log').mockImplementation(() => {});
    const git = (args: string[]) => execFileSync('git', args, { cwd: base, stdio: 'pipe' });
    git(['init']); git(['config', 'user.name', 'Test']); git(['config', 'user.email', 'test@example.org']);
    const path = join(base, 'profile-audit/answers/ideology/example/1.json'); save(path, fixture());
    git(['add', '.']); git(['commit', '-m', 'Test base']);
    run(['history', 'HEAD'], base); writeFileSync(path, '{}');
    expect(() => run(['history', 'HEAD'], base)).toThrow(/immutable/);
    expect(() => run(['history', '--help'], base)).toThrow(/Usage/);
  });
});

describe('browser catalogue boundary', () => {
  it('accepts empty catalogues and rejects malformed or unsafe public data', () => {
    expect(parseCatalogue({ schemaVersion: 1, profiles: [] })).toEqual([]);
    const profile = profileFixture();
    expect(parseCatalogue({ schemaVersion: 1, profiles: [profile] })).toEqual([profile]);
    for (const value of [null, { schemaVersion: 2, profiles: [] }, { schemaVersion: 1, profiles: [profile, profile] },
      { schemaVersion: 1, profiles: [{ ...profile, auditPath: '../outside' }] },
      { schemaVersion: 1, profiles: [{ ...profile, sources: [{ ...profile.sources[0], url: 'javascript:alert(1)' }] }] }]) expect(() => parseCatalogue(value)).toThrow();
  });
});
