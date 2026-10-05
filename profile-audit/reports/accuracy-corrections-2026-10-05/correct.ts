import { readFileSync, writeFileSync, mkdirSync, renameSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { latest, bankHash, archiveDraft, buildCatalogue } from '../../../frontend/scripts/profiles.ts';
import { validateAudit, similarity } from '../../../frontend/src/profiles/audit.ts';
import { questions } from '../../../frontend/src/quiz/model.ts';
import type { Audit, Source } from '../../../frontend/src/profiles/types.ts';

// Targeted amendments to complete assessments, not a claim that their remaining
// educated assumptions have become documented personal answers.
const root = process.cwd();
const report = resolve(root, 'profile-audit/reports/accuracy-corrections-2026-10-05');
const date = '2026-10-05';
const additions: Record<string, Source[]> = {};
type Correction = { id: string; questionId: string; value: -2 | -1 | 0 | 1 | 2; reason: string; sources: string[] };
const corrections: Correction[] = [];
function source(id: string, key: string, title: string, url: string, publisher: string, published = 'undated') {
  additions[id] ??= [];
  additions[id].push({ id: key, title, url, publisher, date: published, accessed: date });
  return key;
}
function answer(id: string, axis: string, number: number, value: Correction['value'], reason: string, sources: string[]) {
  corrections.push({ id, questionId: `${axis}-${String(number).padStart(2, '0')}`, value, reason, sources });
}

const allende = 'salvador-allende', indira = 'indira-gandhi', ho = 'ho-chi-minh';
const nationalisation = source(indira, 'correction-banks', '1969 Indian political crisis and nationalisation of fourteen banks', 'https://history.state.gov/historicaldocuments/frus1969-76ve07/d27', 'US Department of State, Office of the Historian', '1969-07-16');
const hoDoctrine = source(ho, 'correction-leninism', 'The Path Which Led Me to Leninism (April 1960; exact day unverified)', 'https://www.marxists.org/reference/archive/ho-chi-minh/works/1960/04/x01.htm', 'Marxists Internet Archive');
for (const [id, refs, context] of [
  [allende, ['source-2', 'source-3'], 'Allende defended nationalising copper and other basic resources, and expanding the social-property sector, while retaining private and mixed areas.'],
  [indira, [nationalisation, 'source-2'], 'Indira Gandhi nationalised fourteen major banks in 1969 and expanded strategic public ownership within a continuing mixed economy.'],
  [ho, [hoDoctrine, 'source-1'], 'Ho defended socialist reconstruction and the move toward socialism and communism; North Vietnamese ownership expanded through state enterprises and cooperatives. Cooperatives are not automatically government-owned.'],
] as const) {
  const contextNote = context + ' These actions make rejection of a general sale policy more likely than endorsement; they do not prove an answer to every modern ownership trade-off.';
  answer(id, 'public-private', 9, -2, contextNote, [...refs]);
  answer(id, 'public-private', 3, -1, context + ' Comparable delivery does not establish a preference for private ownership over the public sector. A qualified rejection best fits selective public expansion, rather than claiming every business must be nationalised.', [...refs]);
  answer(id, 'public-private', 11, -1, context + ' Strategic ownership was itself a policy instrument, so regulation alone is unlikely to have been regarded as sufficient grounds to retain private ownership in all security-sensitive businesses.', [...refs]);
  answer(id, 'public-private', 15, -1, context + ' Financial support alone does not establish a presumption of sale; maintaining strategic capacity and social purposes makes a qualified rejection more likely. The record does not settle every loss-making firm.', [...refs]);
}

for (const [id, url, publisher, context] of [
  ['tony-blair', 'https://www.gov.uk/government/history/past-prime-ministers/tony-blair', 'UK Government', 'Blair committed British forces to Kosovo, Afghanistan and Iraq during his premiership.'],
  ['john-howard', 'https://www.naa.gov.au/explore-collection/cabinet/latest-cabinet-release/2003-cabinet-papers-context', 'National Archives of Australia', 'Howard committed Australian forces to Afghanistan and Iraq, including forces pre-deployed overseas and operations alongside allied forces.'],
  ['richard-nixon', 'https://www.nixonlibrary.gov/president-nixon', 'Richard Nixon Presidential Library and Museum', 'Nixon sustained US combat and bombing in Vietnam and extended operations into Cambodia, while implementing Vietnamisation and negotiated withdrawal.'],
] as const) {
  const key = source(id, 'correction-overseas-forces', 'Official record of overseas military commitments', url, publisher);
  answer(id, 'militarist-pacifist', 11, 2, context + ' Maintaining the capacity for prolonged combat abroad is different from wanting every deployment to continue indefinitely. Strong agreement is more likely than the previous strong rejection. This translates conduct into the exact capability claim, rather than claiming a submitted quiz response.', [key]);
  answer(id, 'militarist-pacifist', 15, 1, context + ' Operational military commitments make intelligence collection against opponents more plausible than a general rejection of military espionage. Deteriorating relations can constrain its use, so qualified rather than strong agreement is warranted; no exact response to this trade-off is documented.', [key]);
}
const gandhi = source('mahatma-gandhi', 'correction-soul-force', 'Hind Swaraj (1909), chapter XVII: Passive Resistance; exact day unverified', 'https://www.mkgandhi.org/hindswaraj/chap17_passiveresistance.php', 'Bombay Sarvodaya Mandal / Gandhi Research Foundation');
answer('mahatma-gandhi', 'militarist-pacifist', 11, -2, 'Gandhi explicitly contrasts nonviolent resistance with reliance on arms and extends that principle to nations. A standing capability for prolonged foreign combat conflicts with this preferred means. His earlier wartime recruitment and allowance that violence can be preferable to cowardice qualify a simple absolute-pacifist label, but do not support strong endorsement of expeditionary forces. The 1909 text is background to the scoped 1915–1948 leadership.', [gandhi, 'source-1']);
answer('mahatma-gandhi', 'militarist-pacifist', 12, 2, 'Nonviolent resistance and a refusal to settle disputes through armed coercion make accepting an unresolved territorial claim more likely than starting a war to settle it. The prior rejection reversed the direction of the question. This is an inference from the method, not a recorded answer to a particular border dispute.', [gandhi]);

const rand = 'ayn-rand';
for (const [n, v, reason] of [
  [4, 2, 'Rand limits state force to protecting rights against initiation of force; causing offence by criticism does not itself violate another person’s rights. Her moral judgments cannot be treated as support for state prohibition.'],
  [5, -2, 'Rand’s political theory expressly rejects forcing adults to become healthy. The question concerns protecting those adults themselves, rather than preventing infectious harm to others, so strong rejection is supported.'],
  [6, -2, 'Rand limits legitimate coercive government to objective law and protection against initiation of force. Multiyear movement records about people not suspected of an offence exceed that rationale. No statement about this exact surveillance technology was found; a strong rights-based rejection is an analogy.'],
  [11, -1, 'Rand supports protection against threats but also objective limits on coercion. A threat in an area does not identify every person as an aggressor, making a qualified rejection of suspicionless searches more likely; an exact search policy was not found.'],
] as const) answer(rand, 'authority-liberty', n, v, reason, ['source-2']);
answer(rand, 'public-private', 6, -2, 'Rand’s laissez-faire ideal excludes government ownership of commercial infrastructure. Her support for rights-protecting police and courts is not evidence for publicly owned railways. No specific response about rail infrastructure was found, so the literal ownership inference remains explicit.', ['source-2']);
answer(rand, 'secular-religious', 11, 2, 'Rand’s atheist, rights-based political justification gives no role to state endorsement of a faith. Her rejection of religious foundations for political coercion makes agreement more likely; private religious expression is distinct from an official government symbol.', ['source-2']);

// Accountability is assessed separately from whether a ruler works with a party
// committee. Do not turn collective authoritarian rule into personal autocracy.
for (const [id, refs, context] of [
  ['deng-xiaoping', ['source-2', 'source-3'], 'Deng’s Four Basic Principles protected Communist Party leadership and rejected dissent challenging that monopoly.'],
  ['fidel-castro', ['source-2'], 'Castro’s government denied equal national competition to opposition parties and retained a monopoly on political organisation.'],
  ['vladimir-lenin', ['source-2', 'source-3'], 'Lenin’s government displaced the Constituent Assembly and excluded rival political forces from genuine competition.'],
] as const) {
  answer(id, 'democracy-autocracy', 9, 2, context + ' Exclusion because of political position was a governing practice; strong rejection of this power contradicts that record.', [...refs]);
  answer(id, 'democracy-autocracy', 4, 1, context + ' Party-led executive decisions were not subordinated to a freely opposing parliament. Qualified agreement fits this practice; collective party institutions prevent equating it with unconstrained individual lawmaking.', [...refs]);
  answer(id, 'democracy-autocracy', 15, 1, context + ' Leaders were not meaningfully removable through independent voter or representative scrutiny. Formal councils and internal party accountability are counter-evidence to total absence of accountability, so qualified agreement is more defensible than either extreme.', [...refs]);
}
const dissolve = source('vladimir-lenin', 'correction-assembly', 'Speech on the Dissolution of the Constituent Assembly', 'https://www.marxists.org/archive/lenin/works/1918/jan/06b.htm', 'Marxists Internet Archive', '1918-01-19');
answer('vladimir-lenin', 'democracy-autocracy', 13, 1, 'Lenin defended replacing the elected Constituent Assembly with revolutionary Soviet authority rather than submitting to its electoral mandate. This supports subordinating electoral continuity to revolutionary power, but does not document unrestricted unilateral postponement by one individual; qualified agreement acknowledges that institutional distinction.', [dissolve]);

const ceremony = source('narendra-modi', 'correction-ayodhya', 'Prime Minister’s address at the consecration of Ram Lalla, Ayodhya', 'https://www.pmindia.gov.in/en/news_updates/pms-address-at-the-pran-pratishtha-of-shree-ram-lalla-at-ayodhya-ji/', 'Prime Minister’s Office, India', '2024-01-22');
answer('narendra-modi', 'secular-religious', 9, -2, 'Modi participated centrally in the Ram temple consecration in his public capacity and addressed the nation through the official Prime Minister’s Office. This is evidence for religion in official public ceremony, not merely a personal religious belief. Strong rejection of a blanket prohibition is more likely.', [ceremony, 'source-3']);
answer('narendra-modi', 'secular-religious', 11, -1, 'The Ayodhya address presents a particular religious symbol as part of national public life. That supports a qualified rejection of a categorical prohibition on official religious endorsement, though it does not directly document his preferred rule for every government building; this remains an uncertain analogy.', [ceremony, 'source-3']);
const hagia = source('recep-tayyip-erdogan', 'correction-hagia-sophia', 'President Erdoğan performs Friday prayer at Hagia Sophia after reopening to worship', 'https://www.iletisim.gov.tr/english/haberler/detay/president-erdogan-performs-friday-prayer-at-hagia-sophia-grand-mosque-reopened-to-worship-after-86-years', 'Directorate of Communications, Republic of Türkiye', '2020-07-24');
answer('recep-tayyip-erdogan', 'secular-religious', 9, -2, 'The Presidency’s public account records Erdoğan joining the first Friday prayers at state-reconverted Hagia Sophia. Presidential participation in the official reopening supports rejection of a blanket ban on worship in government ceremonies. This concerns state-sponsored religious public life, not faith alone.', [hagia]);
answer('recep-tayyip-erdogan', 'secular-religious', 11, -1, 'The state-directed conversion of a public museum to a mosque and the presidential reopening publicly endorse Islamic symbolism. A qualified rejection of a categorical ban is more plausible than endorsement; the exact policy for ordinary administrative buildings is not directly established.', [hagia]);

// These corrections do not infer modern sexual-policy endorsement from economic
// egalitarianism, abolition of slavery or female political participation.
const lincolnFamily = source('abraham-lincoln', 'correction-family', 'Young Lincoln: marriage and family records', 'https://www.loc.gov/exhibits/lincoln/young-lincoln.html', 'Library of Congress');
for (const n of [9, 15]) answer('abraham-lincoln', 'progressive-traditionalist', n, -1,
  n === 9 ? 'Lincoln’s emancipation policies address slavery, not equal social recognition of same-sex adoptive households. His recorded family institutions and the scoped assessment’s conventional marriage model make a qualified rejection more likely than the prior unsupported endorsement. Personal marriage alone cannot prove a view about other families; no direct answer was found and this historical analogy has substantial uncertainty.' : 'Lincoln’s education and emancipation record does not establish a commitment to teaching modern sexual-orientation and gender-identity categories against family expectations. Conventional family institutions make qualified opposition to this specific override more likely than endorsement. No direct statement exists in the material reviewed; the inference is weak and must not be presented as documented policy.', [lincolnFamily, 'source-2']);
for (const n of [9, 15]) answer('richard-nixon', 'progressive-traditionalist', n, -1,
  n === 9 ? 'Nixon’s conventional family politics and resistance to counterculture make qualified rejection of equal social recognition for same-sex adoptive households more likely. His civil-rights and women’s appointments are not evidence on this distinct question. The exact adoption position is not established by the sources reviewed.' : 'Nixon’s resistance to counterculture and conventional family politics do not support overriding traditional family expectations to teach modern identity categories. A qualified rejection is more likely than the previous endorsement. This remains an analogy; his support for educational sex equality does not settle the curriculum claim.', ['source-2']);
const marriage = source('deng-xiaoping', 'correction-marriage', 'Marriage Law of the People’s Republic of China, adopted 1980 (consolidated 2001 translation)', 'https://natlex.ilo.org/dyn/natlex2/natlex2/files/download/37821/CHN37821%20Eng.pdf', 'International Labour Organization / NATLEX', '2001-04-28');
answer('deng-xiaoping', 'progressive-traditionalist', 5, -1, 'The marriage regime adopted during Deng’s leadership defined spouses as man and woman, alongside sex equality and freedom of marriage. Qualified rejection better fits the implemented institution than extrapolating same-sex marriage from women’s participation. The cited translation is consolidated after the scope; it provides legal context, not a contemporaneous personal statement, and later amendments are not attributed to Deng.', [marriage, 'source-1']);
answer('deng-xiaoping', 'progressive-traditionalist', 9, -1, 'The scoped marriage and family system remained organised around male–female spouses; its equality reforms did not establish equal recognition of same-sex adoptive households. A qualified rejection is more likely, but statutory marriage categories do not prove personal attitudes about adoption. This is contextual inference with substantial uncertainty.', [marriage, 'source-1']);
answer('deng-xiaoping', 'progressive-traditionalist', 15, -1, 'Deng’s social reforms retained conventional marital categories and a politically directed family system. They do not establish endorsement of modern identity instruction overriding traditional families. Qualified opposition is a best-effort historical analogy, weaker than the marriage evidence; no direct curriculum position was found.', [marriage, 'source-1']);
for (const n of [5, 9]) answer('fidel-castro', 'progressive-traditionalist', n, -1, 'The scoped record includes persecution of homosexual people and conventional marital institutions, followed by some easing during the later leadership years. These changes qualify the inference but do not establish support for same-sex marriage or equal adoptive-family acceptance. Qualified rejection fits the mixed period better than the previous endorsement; post-2006 policies or retrospective regrets are not attributed to this leadership period.', ['source-1']);
const zetkin = source('vladimir-lenin', 'correction-sexual-morality', 'Clara Zetkin’s recollections: Lenin on the Women’s Question', 'https://www.marxists.org/archive/zetkin/1920/lenin/zetkin1.htm', 'Marxists Internet Archive', 'undated');
answer('vladimir-lenin', 'progressive-traditionalist', 15, -1, 'Zetkin records Lenin discouraging youth organisations’ preoccupation with sexual questions while supporting women’s emancipation and criticising bourgeois marriage. Qualified rejection of this specific modern curriculum claim is more likely than automatically projecting his economic revolution into gender-identity teaching. A recollection of a 1920 conversation is not a direct statement about today’s curriculum and has substantial interpretive uncertainty.', [zetkin]);
for (const n of [5, 9]) answer('vladimir-lenin', 'progressive-traditionalist', n, 0, 'Lenin’s revolutionary government changed civil marriage, divorce and sexual law, while Zetkin’s recollections show his criticism of indiscriminate sexual liberation and concern for family and social obligations. A mixed response best fits these competing indications on this specific modern same-sex family-recognition claim. This is not Neutral merely because evidence is missing: it reflects the tension between institutional emancipation and restrictive social expectations. No direct same-sex marriage or adoption endorsement was found.', [zetkin, 'source-1']);

const active = latest(root);
const baseline = JSON.parse(readFileSync(resolve(report, 'baseline.json'), 'utf8'));
for (const id of new Set(corrections.map(correction => correction.id))) {
  const expected = baseline.catalogue.profiles.find((profile: any) => profile.catalogue === 'personality' && profile.id === id);
  const current = active.find(entry => entry.audit.catalogue === 'personality' && entry.audit.id === id);
  if (current?.audit.revision !== expected?.revision) throw new Error(`Correction already archived or subject changed: ${id}. Regenerate reports instead of appending duplicate revisions.`);
}
const drafts: Audit[] = [];
const changes: unknown[] = [];
for (const id of [...new Set(corrections.map(correction => correction.id))]) {
  const entry = active.find(entry => entry.audit.catalogue === 'personality' && entry.audit.id === id)!;
  const previous = entry.audit;
  const draftPath = resolve(root, 'profile-audit/drafts/personality', `${id}.json`);
  if (existsSync(draftPath) && JSON.stringify(JSON.parse(readFileSync(draftPath, 'utf8'))) !== JSON.stringify(previous)) throw new Error(`Unrelated unfinished draft: ${id}`);
  if (existsSync(draftPath)) renameSync(draftPath, resolve(report, `${id}-previous-draft.json`));
  const draft: Audit = structuredClone(previous);
  draft.revision++;
  draft.researchedAt = date;
  draft.author = 'Codex (GPT-6), targeted accuracy corrections to the existing complete assessment';
  draft.changeNote = 'Correct literal answer/evidence contradictions identified in the overall accuracy audit; retain the scoped period, unchanged evidence-supported responses and immutable prior revision. No desired ideology match was used as a scoring target.';
  const sourceAliases = new Map<string, string>();
  for (const addition of additions[id] ?? []) {
    const existing = draft.sources.find(source => source.url === addition.url);
    if (existing) sourceAliases.set(addition.id, existing.id);
    else draft.sources.push(addition);
  }
  const entries = corrections.filter(correction => correction.id === id);
  for (const correction of entries) {
    correction.sources = correction.sources.map(source => sourceAliases.get(source) ?? source);
    const axis = draft.axes.find(axis => axis.answers.some(answer => answer.questionId === correction.questionId))!;
    const target = axis.answers.find(answer => answer.questionId === correction.questionId)!;
    changes.push({ id, oldRevision: previous.revision, revision: draft.revision, questionId: target.questionId,
      question: questions.find(question => question.id === target.questionId)!.text, oldValue: target.value, value: correction.value, reason: correction.reason, sources: correction.sources });
    target.value = correction.value;
    target.basis = 'inferred';
    target.rationale = `Educated assumption: ${correction.reason} The numerical response is an assessment of the literal question, not a personal questionnaire response.`;
    target.sources = correction.sources;
  }
  const assumed = draft.axes.flatMap(axis => axis.answers).filter(answer => answer.basis === 'inferred').map(answer => answer.questionId);
  draft.review = { reviewer: 'Codex (GPT-6), distinct same-agent literal wording and counter-evidence review; no independent human review', reviewedAt: date,
    notes: `Targeted amendment review: checked the changed answers against literal wording, recorded scope, government ownership versus cooperatives, military capability versus withdrawal, collective leadership versus electoral accountability, and sexual-policy evidence versus unrelated egalitarian reform. Checked all 240 responses for completeness and valid source references; retained responses are previous assessed inferences, not independently newly researched positions. This is not a fresh substantive certification of all 240 answers. Changed question IDs: ${entries.map(entry => entry.questionId).join(', ')}. Every inferred question remains uncertain and flagged in the separate corrections review: ${assumed.join(', ')}. No questionnaire, axis, scoring weight or similarity formula was changed.`, similarity: [] };
  drafts.push(draft);
}
const revised = new Map(drafts.map(draft => [draft.id, draft]));
const peers = active.filter(entry => entry.audit.catalogue === 'personality').map(entry => revised.get(entry.audit.id) ?? entry.audit);
for (const draft of drafts) {
  const checked = validateAudit(draft, bankHash);
  if (!checked.profile) throw new Error(checked.errors.join('\n'));
  // Archive is sequential; both the existing and new peer revision may be used
  // while this batch is being appended. Document each actual high-similarity pair.
  for (const peer of [...active.filter(entry => entry.audit.catalogue === 'personality').map(entry => entry.audit), ...peers]) {
    if (peer.id === draft.id || draft.review.similarity.some(item => item.id === peer.id && item.revision === peer.revision)) continue;
    const peerCheck = validateAudit(peer, bankHash);
    if (!peerCheck.profile) throw new Error(`${peer.id}: ${peerCheck.errors.join('\n')}`);
    const candidate = peerCheck.profile;
    if (similarity(checked.profile.scores, candidate.scores) < 95) continue;
    const gaps = checked.profile.scores.map(score => ({ axisId: score.axisId, gap: Math.abs(score.leftPercent - candidate.scores.find(other => other.axisId === score.axisId)!.leftPercent) })).sort((a, b) => b.gap - a.gap);
    draft.review.similarity.push({ id: peer.id, revision: peer.revision, reason: `${draft.metadata.name} (${draft.metadata.period}) and ${peer.metadata.name} (${peer.metadata.period}) are distinct individuals and periods. The largest difference is ${gaps[0].axisId}: ${draft.axes.find(axis => axis.axisId === gaps[0].axisId)!.brief} Counter-evidence: ${draft.axes.find(axis => axis.axisId === gaps[0].axisId)!.counterEvidence} The peer's assessment instead records: ${peer.axes.find(axis => axis.axisId === gaps[0].axisId)!.brief} Retain the independently recorded subjects and this evidence-based correction; do not alter responses to manufacture distance.` });
  }
  writeFileSync(resolve(root, 'profile-audit/drafts/personality', `${draft.id}.json`), JSON.stringify(draft, null, 2) + '\n');
  const path = archiveDraft(root, draft);
  writeFileSync(resolve(report, `${draft.id}-review.json`), JSON.stringify({ id: draft.id, revision: draft.revision, answerPath: path, answered: 240,
    changes: changes.filter((change: any) => change.id === draft.id), assumptions: draft.axes.flatMap(axis => axis.answers).filter(answer => answer.basis === 'inferred').map(answer => answer.questionId), review: draft.review }, null, 2) + '\n');
  console.log(`Archived ${draft.id} r${draft.revision}: 240/240; ${corrections.filter(correction => correction.id === draft.id).length} targeted corrections.`);
}
writeFileSync(resolve(report, 'changes.json'), JSON.stringify(changes, null, 2) + '\n');
const generated = buildCatalogue(root, false);
console.log(`Generated ${generated.length} profiles.`);
