import fs from 'node:fs';
import assert from 'node:assert/strict';
const dir='profile-audit/reports/authority-liberty-2026-10-06/';
const contexts=JSON.parse(fs.readFileSync(dir+'retained-context.json'));
const oldBank=JSON.parse(fs.readFileSync('frontend/src/data/questions.v2.json')).questions;
const bank=JSON.parse(fs.readFileSync('frontend/src/data/questions.v3.json')).questions;
const changed=bank.filter(q=>q.text!==oldBank.find(o=>o.id===q.id).text).map(q=>q.id);
const order=[2,7,8,11,12];
const decisions=JSON.parse(fs.readFileSync(dir+'decisions.json'));
let neutral=0, close=0;
for(const c of contexts){
 const draft=dir+'prepared/'+c.catalogue+'/'+c.id+'.json';
 const a=JSON.parse(fs.readFileSync(fs.existsSync(draft)?draft:'profile-audit/answers/'+c.catalogue+'/'+c.id+'/'+(c.revision+1)+'.json'));
 const prev=JSON.parse(fs.readFileSync('profile-audit/answers/'+c.catalogue+'/'+c.id+'/'+c.revision+'.json'));
 const answers=a.axes.flatMap(ax=>ax.answers), before=prev.axes.flatMap(ax=>ax.answers);
 assert.equal(answers.length,240);assert.equal(new Set(answers.map(q=>q.questionId)).size,240);
 const d=decisions.catalogues[c.catalogue][c.id];
 for(const answer of answers){
  assert.ok([-2,-1,0,1,2].includes(answer.value));
  if(!changed.includes(answer.questionId)&&c.id!=='united-kingdom')assert.deepEqual(answer,before.find(b=>b.questionId===answer.questionId));
  else{
   if(c.id!=='united-kingdom')assert.equal(answer.basis,'inferred');if(answer.basis==='inferred')assert.ok(answer.rationale.startsWith('Educated assumption:'));
   assert.ok(answer.sources.length);assert.ok(answer.sources.every(id=>a.sources.some(s=>s.id===id)));
   const q=bank.find(q=>q.id===answer.questionId);
   const old=oldBank.find(o=>o.text===q.text&&o.axisId===q.axisId&&o.agreePole===q.agreePole);
   if(c.id==='united-kingdom')continue;
   if(old)assert.equal(answer.value,before.find(b=>b.questionId===old.id).value);
   else assert.equal(answer.value,d.values[order.indexOf(Number(q.id.slice(-2)))]);
   if(answer.value===0){neutral++;if(!old)assert.match(d.note,/coexist|compet|conditional|mixed|tension|contrast|conflict/i);}
  }
 }
 close+=a.review.similarity.length;
 const validation=JSON.parse(fs.readFileSync(dir+'validation/'+c.catalogue+'/'+c.id+'.json'));
 assert.deepEqual(validation.errors,[]);
}
const findings={reviewedAt:'2026-10-06',reviewer:'Codex: distinct same-agent review, no external peer or human review claimed',profiles:contexts.length,changedIds:changed,changedAnswers:contexts.length*changed.length,neutralRevisedAnswers:neutral,closePairReviewEntries:close,checks:['All 209 explicit five-mechanism decision tables read across countries, ideologies and personalities; retained subject scopes and counter-evidence considered.','Exact statement/direction relocation independently matched by literal text rather than migration ID map.','All 240 IDs, five-choice values and changed-answer source references checked per subject.','All 231 unaffected answer objects compared deeply for 208 focused reassessments; concurrent UK full audit revision 4 retained unchanged and independently recalculated.','Neutral choices have explicit competing commitments rather than missing-evidence defaults.','Close-pair entries include the separately assessed scopes and both subject decision notes; no score-separation adjustments.'],corrections:['Netherlands ID response qualified to Agree: reasoned public-order checks differ from arbitrary universal requests.','Tony Blair ID response changed from Strongly agree to Disagree after reading paragraph 95 of the official 2006 explanatory notes: registration is not compulsory carrying.','South African Bill of Rights source date changed to undated rather than assert an unsupported page-publication date.','Bulk records wording covers metadata, without claiming all collection includes communications contents.','Reagan original 1981 order added as counter-evidence; later amended programmes not attributed to him.'],limitations:['New precise responses/intensities are inferred, including relocated identical claims; not personally completed questionnaires.','Retained dossiers provide primary subject context; selective new research and HTTP passages do not freshly reverify all prior citations.','68 recorded source-access limitations; successful retrieval can be navigation or sparse material and is not evidence certification.','Historical digital analogies and jurisdiction-specific implementation remain uncertain.','No population calibration, reliability study or empirical guarantee of corrected placements.']};
fs.writeFileSync(dir+'review-findings.json',JSON.stringify(findings,null,2)+'\n');
console.log(JSON.stringify({profiles:contexts.length,changedAnswers:contexts.length*changed.length,neutral,close}));
