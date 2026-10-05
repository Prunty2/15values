import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { template, prompt, latest, root } from '../../../frontend/scripts/profiles.ts';
import { questions } from '../../../frontend/src/quiz/model.ts';
import { notes, qualifications } from './research-notes.mjs';
const report=path.dirname(new URL(import.meta.url).pathname);
const selected=JSON.parse(fs.readFileSync(path.join(report,'selected.json')));
const matrices={};
for(let i=1;i<=4;i++)Object.assign(matrices,(await import(`./decisions-${i}.mjs`)).default);
const priorEntries=latest(root).filter(e=>e.audit.catalogue==='ideology');
const labels=['Strongly disagree','Disagree','Neutral','Agree','Strongly agree'];
const oldHelper=fs.readFileSync(path.join(root,'profile-audit/reports/ideology-expansion-2026-10-05/review.mjs'),'utf8');
const mapStart=oldHelper.indexOf('const issues=['),mapEnd=oldHelper.indexOf('if(issues.some');
if(mapStart<0||mapEnd<0)throw Error('Missing literal question issue map');
const issueModule=path.join(report,'question-issues.mjs');
fs.writeFileSync(issueModule,oldHelper.slice(mapStart,mapEnd)+'\nexport {issues};\n');
const {issues}=await import('./question-issues.mjs');
if(issues.length!==15||issues.some(a=>a.length!==16))throw Error('Issue coverage mismatch');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const initialized=[];
for(const p of selected){
 const previous=priorEntries.find(e=>e.audit.id===p.id)?.audit;
 if(!previous||previous.revision!==p.previousRevision)throw Error('Revision changed since scope selection: '+p.id);
 const draft=path.join(root,'profile-audit/drafts/ideology',p.id+'.json');
 const backup=path.join(report,p.id+'-previous-draft.json');
 if(fs.existsSync(draft)&&(!fs.existsSync(backup)||hash(draft)!==hash(backup)))throw Error('Unrecognized draft edits: '+p.id);
 const audit=template('ideology',p.id,p.nextRevision);
 audit.metadata={...previous.metadata,scope:`Provisional AI assessment of ${previous.metadata.name}; ${previous.metadata.period}. ${notes[p.id]} Every question has a most-likely interpretation, disclosed as an inferred educated assumption; exact response strength and historical applications remain estimates. This is a distinct same-agent assessment/review, not external peer certification or a survey of adherents.`};
 fs.mkdirSync(path.join(report,'prompts'),{recursive:true});
 fs.writeFileSync(path.join(report,'prompts',p.id+'.txt'),prompt(audit));
 audit.researchedAt='2026-10-05';
 audit.author='Codex (GPT-6), independent question decisions with disclosed educated assumptions';
 audit.changeNote='Owner-requested complete re-audit of every ideology labelled Strongly on any displayed axis. All 240 responses freshly specified from scoped evidence and literal wording; previous answer values and desired percentages were not used as decision inputs. Archive history is preserved.';
 audit.sources=previous.sources.map(s=>({...s}));
 if(p.id==='right-wing-populism'){
  const primary=audit.sources.find(s=>s.url.includes('Reform_UK_Our_Contract'));
  primary.url='https://reformuk.org.uk/wp-content/uploads/2025/10/Reform_UK_Our_Contract_with_You.pdf';
  primary.title='Our Contract with You, Reform UK 2024 (recovered official upload)';primary.accessed='2026-10-05';
 }
 if(p.id==='militarism')audit.sources.push({id:'militarism-prio',title:'On Militarism and Security: a Special Issue Introduction',url:'https://www.prio.org/comments/1261',publisher:'Peace Research Institute Oslo',date:'2018-03-27',accessed:'2026-10-05'});
 const rows=matrices[p.id].trim().split('\n').map(r=>r.replace(/\s/g,''));
 if(rows.length!==15||rows.some(r=>!/^[ABCDE]{16}$/.test(r)))throw Error('Invalid independent matrix: '+p.id);
 for(let i=0;i<15;i++){
  const axis=audit.axes[i];
  // Only evidence briefs and citation IDs are carried forward as research context.
  // Previous numeric values, scores and answer rationales are not imported.
  axis.brief=previous.axes[i].brief;
  axis.counterEvidence=`${qualifications[i]} Subject-specific cross-check: ${notes[p.id]} The cited research is contextual, not a completed questionnaire. A position open in the wider school is assessed within this profile’s stated variant and period, rather than interpreted as unanimous doctrine.`;
  if(p.id==='democratic-socialism'&&i===0)axis.brief='The April–June 2026 DSA programme supports multiparty elections and broad franchise, but chooses an executive and judiciary subordinate to Congress. Referendum and recall mechanisms are inferred separately; legislative supremacy is counter-evidence to independent constitutional judicial override.';
  if(p.id==='maoism'&&i===6)axis.brief='Mao’s 1927–1976 doctrine advances strategic socialist ownership and later collectivization, but New Democracy expressly permits private capitalist production outside dominant livelihood sectors and private peasant ownership. These transitional exceptions qualify strongest agreement with every public-ownership proposition.';
  if(p.id==='marxism'&&i===9)axis.brief='Transitional progressive taxation and common social provision favor redistribution, but Gotha’s first phase recognizes unequal labor-linked returns and differing endowments. Ownership transformation is not a direct prescription for every modern cash benefit, marginal tax or compensated land-transfer instrument.';
  if(p.id==='nordic-social-democracy'&&i===8)axis.brief='Ordinary production and prices follow markets, with public investment and collective bargaining. Negotiated and sometimes legally extended wage floors must be distinguished from a state statutory minimum wage; the Nordic countries do not implement that instrument uniformly.';
  if(p.id==='christian-social-democracy'&&i===14)axis.brief='Tro och Solidaritet emphasizes equal opportunity and social conditions while explicitly recognizing differing circumstances and abilities from birth. This does not quantify biological causes for individual traits and does not support racial biological claims.';
  if(p.id==='republicanism'&&i===0)axis.brief='Equal contestation and institutional control prevent arbitrary power. Republican scholarship expressly debates strong constitutional judicial review; mixed government, recall and referendum mechanisms are distinct institutional choices, not entailed by non-domination alone.';
  if(p.id==='christian-conservatism'&&i===10)axis.brief='Christian public moral advocacy coexists with the Baptist source’s explicit church/state separation, equal religious liberty and rejection of taxes supporting religion. Ceremonial heritage and tax exemptions are separate from official doctrinal law, clerical vetoes and compulsory public-school conversion.';
  const axisSourceIds=[...new Set(previous.axes[i].answers.flatMap(a=>a.sources))];
  if(p.id==='militarism'&&[0,1,4,13].includes(i))axisSourceIds.push('militarism-prio');
  for(let j=0;j<16;j++){
   const answer=axis.answers[j];const q=questions.find(q=>q.id===answer.questionId);
   const value='ABCDE'.indexOf(rows[i][j])-2;const [proposal,alternative]=issues[i][j];
   answer.value=value;answer.basis='inferred';answer.sources=axisSourceIds;
   const judgment=value===0?`The scoped position gives substantive weight to ${proposal} and ${alternative}; the unconditional wording would privilege one without the other’s relevant safeguard. Neutral records this competing institutional or causal commitment, rather than missing evidence.`:value>0?`The choice gives ${proposal} greater weight than ${alternative} under the axis brief’s scoped principle.`:`The choice gives ${alternative} greater weight than ${proposal} under the axis brief’s scoped principle.`;
   const intensity=Math.abs(value)===2?'Strong intensity reflects a core commitment or incompatibility identified in the research, rather than a requirement to produce an extreme axis score. It remains an estimated five-point judgment.':Math.abs(value)===1?'Qualified intensity allows relevant exceptions, competing aims and breadth limits rather than claiming an unconditional rule.':'';
   const special=i===14?' Normative political commitments do not prove empirical genetic causes; biological temperament and learned behavior can coexist. Racial premises and the pay-gap item’s causal conflation are assessed as limitations of the statement, not accepted as scientific findings.':i===12?' Any historical application to current technology is analogical. Ordinary development benefits do not remove consent, reliability, external-harm or irreversible-risk concerns.':p.id==='social-anarchism'&&[0,6,8,9,13].includes(i)?' The state institution in the statement does not fully represent voluntary communal organization; opposing one offered institution does not establish the other as the doctrine’s ideal.':p.id==='anarcho-capitalism'&&[0,5,9,13].includes(i)?' Stateless association is not election of a national government, a coercive international state or compulsory local taxation; the institutional mismatch remains explicit.':'';
   answer.rationale=`Educated assumption: Within ${audit.metadata.period}, the most likely response to “${q.text}” is ${labels[value+2]}. ${judgment} ${intensity}${special} Contextual evidence is explained in this axis’s research brief and qualification, with source IDs ${answer.sources.join(', ')}. The evidence does not document this exact questionnaire response; application and intensity remain provisional and other adherents may differ.`;
  }
 }
 audit.review={reviewer:'Codex (GPT-6), distinct same-agent review pending',reviewedAt:'2026-10-05',notes:'Independent 240-question assessment prepared; a separate substantive review is required before archive.',similarity:[]};
 fs.writeFileSync(draft,JSON.stringify(audit,null,2)+'\n');
 initialized.push({id:p.id,previousRevision:p.previousRevision,revision:p.nextRevision,answered:240,educatedAssumptionIds:audit.axes.flatMap(a=>a.answers.map(q=>q.questionId)),researchNotes:notes[p.id],sourcePublishers:[...new Set(audit.sources.map(s=>s.publisher))]});
}
fs.writeFileSync(path.join(report,'assessment-progress.json'),JSON.stringify(initialized,null,2)+'\n');
console.log(`Prepared ${initialized.length} complete fresh assessments and prompts. Separate review and archive remain pending.`);
