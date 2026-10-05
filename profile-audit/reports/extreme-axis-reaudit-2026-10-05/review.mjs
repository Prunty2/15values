import fs from 'node:fs';
import path from 'node:path';
import { root, bankHash, latest } from '../../../frontend/scripts/profiles.ts';
import { questions } from '../../../frontend/src/quiz/model.ts';
import { validateAudit, neighbourReview } from '../../../frontend/src/profiles/audit.ts';
import { notes, qualifications } from './research-notes.mjs';
import { issues } from './question-issues.mjs';
const report=path.dirname(new URL(import.meta.url).pathname);
const selected=JSON.parse(fs.readFileSync(path.join(report,'selected.json')));
const labels=['Strongly disagree','Disagree','Neutral','Agree','Strongly agree'];
const corrections={
 'christian-conservatism':{
  'secular-religious-02':[-1,'The Baptist source separates civil authority from church doctrine. Moral advocacy does not make religious teaching an official legal source.'],
  'secular-religious-10':[-1,'The Baptist source expressly rejects taxation supporting religion. Ceremonial heritage does not warrant public spending to cultivate belief.']
 },
 'christian-social-democracy':{
  'planning-free-market-12':[-1,'The Swedish lineage relies on negotiated wage floors, not a government statutory minimum wage. Support for higher wages does not establish the specific instrument.']
 },
 'cuban-socialism':{
  'democracy-autocracy-04':[-1,'The head of government is constitutionally distinct from the Assembly and Council of State. PCC dominance does not grant the prime minister a unilateral legislative override.']
 },
 'objectivism':{
  'authority-liberty-14':[1,'Objective rights support exposing misconduct, but Rand’s protective state and military-security commitments qualify an absolute publication entitlement for every confidential disclosure.']
 },
 'minarchism':{
  'authority-liberty-14':[1,'Accountability supports exposing wrongdoing, with rights-protecting secrecy and harm to innocent parties qualifying unconditional disclosure.']
 }
};
const questionNotes={
 'democracy-autocracy-07':'Independent judicial override is a distinct mechanism: parliamentary sovereignty, council rule, rights-limited constitutionalism and contested republican designs must be distinguished.',
 'democracy-autocracy-10':'Citizen repeal can strengthen participation, but representative deliberation and constitutional minority rights can qualify an unrestricted binding-referendum mechanism.',
 'democracy-autocracy-14':'Defined recall is not implied by regular elections; council recall has particular historical support, while representative traditions may favor fixed accountable terms.',
 'assimilation-multiculturalism-14':'The wording specifies unequal covering rules. Cultural tolerance alone does not settle whether this exemption is justified rather than generally equal permission or restriction.',
 'planning-free-market-12':'A statutory government floor is not the same as a wage achieved through collective bargaining or cooperative income allocation.',
 'high-redistribution-low-redistribution-15':'Compensation is part of the literal proposition. Expropriation, restitution and public compensation are different instruments, and general land reform does not entail all three.',
 'secular-religious-03':'A religious reason for policy does not necessarily require formal approval by religious leaders.',
 'progressive-traditionalist-13':'Distinct family responsibilities do not necessarily imply rejecting every adult taking a cross-sex occupational or social role.',
 'innovation-caution-13':'Embryo enhancement adds consent, inherited-risk and moral-status questions beyond support for ordinary technological productivity.',
 'culture-nature-14':'This records the doctrine’s most-likely response, not acceptance of the statement’s unestablished racial premise or an empirical genetic conclusion.',
 'culture-nature-16':'Economic valuation and social expectations are the offered explanations. This item does not directly isolate heredity, so market rewards cannot substitute for a biological causal claim.'
};
const entries=[];
for(const p of selected){
 const file=path.join(root,'profile-audit/drafts/ideology',p.id+'.json');
 const audit=JSON.parse(fs.readFileSync(file));
 const applied=[];
 for(let i=0;i<15;i++)for(let j=0;j<16;j++){
  const a=audit.axes[i].answers[j],q=questions.find(q=>q.id===a.questionId);
  if(!q||q.axisId!==audit.axes[i].axisId||q.priority!==j+1)throw Error('Question/direction review mismatch: '+p.id+' '+a.questionId);
  const correction=corrections[p.id]?.[a.questionId];
  if(correction&&a.value!==correction[0]){
   applied.push({questionId:a.questionId,before:a.value,after:correction[0],reason:correction[1]});
   a.value=correction[0];
   a.rationale=a.rationale.replace(/is (Strongly disagree|Strongly agree|Disagree|Neutral|Agree)\./,`is ${labels[a.value+2]}.`);
   const [proposal,alternative]=issues[i][j];
   a.rationale=`Educated assumption: ${correction[1]} The most likely response to “${q.text}” is ${labels[a.value+2]}. ${a.value>0?proposal:alternative} has greater weight under the scoped evidence, with the opposing consideration qualifying the response strength. Contextual sources: ${a.sources.join(', ')}. Neither this exact five-point answer nor every modern application is directly documented; the judgment remains provisional within ${audit.metadata.period}.`;
  }
  if(questionNotes[a.questionId])a.rationale+=' Separate wording review: '+questionNotes[a.questionId];
  if(a.value===0)a.rationale+=' Neutral was retained after checking the specific competing considerations against the axis brief; it is not a placeholder or a general response to unavailable evidence.';
  if(a.basis!=='inferred'||!a.rationale.startsWith('Educated assumption:')||!Number.isInteger(a.value))throw Error('Incomplete inference disclosure');
 }
 audit.review={reviewer:'Codex (GPT-6), same agent performing a distinct evidence and literal-wording review; no external reviewer',reviewedAt:'2026-10-05',notes:`Reviewed all 240 statements, agreement directions, five-point intensities and contextual citations after the independent assessment pass. ${notes[p.id]} Every response is conservatively disclosed as inferred, including exact strength. Neutral choices were checked for the explicit competing commitments described in the axis research rather than used for missing evidence. Retained extremes were checked against doctrinal prohibitions or commitments, without caps or desired score distributions. Sources and doctrinal briefs from the preceding research were retained as context and cross-checked with fresh primary/scholarly extracts; inaccessible full texts and prior indexed/abstract-only sources are not claimed as newly read full articles. ${applied.length?applied.map(c=>c.questionId+': '+c.reason).join(' '):'No numeric correction was required in this distinct review.'} The separate review lists every assumption ID, every Neutral rationale, all warning resolutions and revision-specific similarity decisions. External peer review and empirical measurement validation remain pending.`,similarity:[]};
 const validation=validateAudit(audit,bankHash);
 if(validation.errors.length)throw Error(p.id+': '+validation.errors.join('; '));
 entries.push({p,file,audit,profile:validation.profile,applied,validation});
}
const existing=latest(root).filter(e=>e.audit.catalogue==='ideology').map(e=>({audit:e.audit,profile:validateAudit(e.audit,bankHash).profile})).filter(e=>e.profile);
for(const entry of entries){
 // Include both old and new peers so sequential archives remain valid, and
 // retain exact named revisions for all reviewed >=95% similarities.
 const peers=[...existing.map(e=>e.profile),...entries.map(e=>e.profile)];
 const neighbours=neighbourReview(entry.profile,peers,[]).neighbours;
 for(const n of neighbours.filter(n=>n.similarity>=95)){
  const other=entries.find(e=>e.audit.id===n.id&&e.audit.revision===n.revision)||existing.find(e=>e.profile.id===n.id&&e.profile.revision===n.revision);
  const differences=entry.audit.axes.flatMap(a=>a.answers.map(q=>({questionId:q.questionId,value:q.value,otherValue:other.audit.axes.flatMap(a=>a.answers).find(o=>o.questionId===q.questionId)?.value}))).filter(q=>q.value!==q.otherValue).sort((a,b)=>Math.abs(b.value-b.otherValue)-Math.abs(a.value-a.otherValue)).slice(0,4);
  entry.audit.review.similarity.push({id:n.id,revision:n.revision,reason:`Retain both scoped doctrines after review: ${entry.audit.metadata.name} (${entry.audit.metadata.period}) — ${notes[entry.audit.id]} ${other.audit.metadata.name}, revision ${n.revision} (${other.audit.metadata.period}) — ${notes[n.id]||other.audit.metadata.description} Concrete answer differences: ${differences.map(d=>d.questionId+' '+labels[d.value+2]+' / '+(d.otherValue===null?'historically unresolved':labels[d.otherValue+2])).join('; ')||'The measured responses coincide; the specified institutional/intellectual scope remains distinct.'}. Axis averages omit these organizing commitments and can conceal question differences. No responses were changed to lower similarity.`});
 }
 const finalValidation=validateAudit(entry.audit,bankHash);
 const neighbourValidation=neighbourReview(entry.profile,peers,entry.audit.review.similarity);
 if(finalValidation.errors.length||neighbourValidation.errors.length)throw Error('Review validation failed '+entry.p.id);
 const educatedAssumptionIds=entry.audit.axes.flatMap(a=>a.answers.map(q=>q.questionId));
 const review={id:entry.p.id,revision:entry.audit.revision,answered:240,reviewer:entry.audit.review.reviewer,date:'2026-10-05',researchNotes:notes[entry.p.id],limitations:'Every five-point response is a contextual inference. Prior source dossiers remain part of the evidence; fresh browsing checks do not constitute new full-text access to every retained source. This is a distinct same-agent review, not independent peer certification. Stateless ideals and modern applications of historical writings have explicit institutional fit limits.',educatedAssumptionIds,corrections:entry.applied,similarity:entry.audit.review.similarity,validation:{errors:finalValidation.errors,warnings:finalValidation.warnings,neighbours},warningResolutions:entry.audit.axes.filter(a=>a.answers.filter(q=>q.value===0).length>4).map((a,i)=>({axisId:a.axisId,brief:a.brief,qualification:a.counterEvidence,neutralChoices:a.answers.filter(q=>q.value===0).map(q=>({questionId:q.questionId,rationale:q.rationale,sources:q.sources})),decision:'Retained after substantive mixed-priority review. The warning remains disclosed; validation does not establish empirical accuracy.'})),axisReview:entry.audit.axes.map(a=>({axisId:a.axisId,brief:a.brief,counterEvidence:a.counterEvidence,answers:a.answers.map(q=>({...q}))}))};
 fs.writeFileSync(entry.file,JSON.stringify(entry.audit,null,2)+'\n');
 fs.writeFileSync(path.join(report,entry.p.id+'-review.json'),JSON.stringify(review,null,2)+'\n');
 console.log(`${entry.p.id} r${entry.audit.revision}: 240 reviewed, ${entry.applied.length} corrections, ${finalValidation.warnings.length} disclosed warnings, ${entry.audit.review.similarity.length} close-neighbour decisions`);
}
fs.writeFileSync(path.join(report,'review-results.json'),JSON.stringify(entries.map(e=>({id:e.p.id,revision:e.audit.revision,answered:240,reviewPath:path.relative(root,path.join(report,e.p.id+'-review.json')),educatedAssumptionIds:e.audit.axes.flatMap(a=>a.answers.map(q=>q.questionId)),corrections:e.applied,similarity:e.audit.review.similarity,validation:e.validation})),null,2)+'\n');
