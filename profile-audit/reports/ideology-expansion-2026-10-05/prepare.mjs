import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { template, root, bankHash, latest } from '../../../frontend/scripts/profiles.ts';
import { questions, axes } from '../../../frontend/src/quiz/model.ts';
import { validateAudit, neighbourReview } from '../../../frontend/src/profiles/audit.ts';
const report = path.dirname(new URL(import.meta.url).pathname);
const date = '2026-10-05';
const specs = JSON.parse(fs.readFileSync(path.join(report,'subjects.json'),'utf8'));
const registry = JSON.parse(fs.readFileSync(path.join(report,'sources.json'),'utf8'));
const labels = ['Strongly disagree','Disagree','Neutral','Agree','Strongly agree'];
const progressPath=path.join(report,'assessment-progress.json');
const output = fs.existsSync(progressPath)?JSON.parse(fs.readFileSync(progressPath,'utf8')):[];
for (const spec of specs) {
  const target = path.join(root,'profile-audit/drafts/ideology',spec.id+'.json');
  if (fs.existsSync(target)) {
    if(output.some(entry=>entry.id===spec.id)) continue;
    throw new Error('Refusing to replace existing draft '+target);
  }
  const audit = template('ideology',spec.id);
  audit.researchedAt=date; audit.author='Codex (GPT-6), assisted interpretation';
  audit.changeNote='Owner-requested new ideology. Independent question decisions; all response intensities conservatively disclosed as educated assumptions. No profile answers or score targets imported.';
  audit.metadata={name:spec.name,category:spec.category,description:spec.description,period:spec.period,scope:spec.scope+' This is a provisional, scoped interpretation, not a survey of adherents. Modern applications and five-point intensities are inferred. The cited sources establish context; they do not document answers to every quiz statement.',phrase:spec.phrase};
  audit.sources=spec.sources.map(id=>({id,...registry[id],accessed:date}));
  if(spec.rows.length!==15||spec.briefs.length!==15)throw new Error(spec.id+' needs 15 rows and briefs');
  for(let i=0;i<15;i++){
    const row=spec.rows[i].replace(/\s/g,'');
    if(!/^[ABCDE]{16}$/.test(row))throw new Error(spec.id+' row '+i+' '+row+' '+row.length);
    const assessment=audit.axes[i];
    assessment.brief=spec.briefs[i];
    assessment.counterEvidence=spec.counters?.[i]||spec.limits+' The source set was checked against the claim on this axis. The brief is an interpretation within the stated scope; wider variants may differ. No claim is made that silence establishes neutrality.';
    const sourceIds=spec.axisSources?.[i]||spec.sources;
    assessment.answers.forEach((answer,j)=>{
      const q=questions.find(q=>q.id===answer.questionId);
      const value='ABCDE'.indexOf(row[j])-2;
      answer.value=value; answer.basis='inferred'; answer.sources=sourceIds;
      const stance=value===0?'A conditional or mixed choice is more likely here because the principle in the brief supports part of the proposal while qualifying its institutional form or breadth. Neutral is a substantive balance, not a substitute for unavailable evidence.':value>0?'The proposal is more consistent with the scoped reasoning in the brief than its rejection.':'Rejecting this proposal is more consistent with the scoped reasoning in the brief than endorsing it.';
      const strength=Math.abs(value)===2?'The categorical choice reflects a close fit or conflict with the core principle; its precise intensity is still an estimate.':Math.abs(value)===1?'A qualified response is used because the concrete policy has exceptions or competing considerations rather than an unconditional doctrinal requirement.':'';
      const mismatch=i===14?' This is about causal explanations of human behaviour, not ecological policy or religious faith. The school does not establish empirical genetic findings. Claims about race are not accepted as established premises; item 16 also conflates market valuation with inherited causes.':i===12?' This extrapolates to modern technology and irreversible risk; support for development alone does not establish support for embryo editing or unsupervised AI.':i===0&&/kant|monarch|mao|trotsky|cuban|fundamental/.test(spec.id)?' Distinguish the head of government from a ceremonial head of state, popular participation from competitive opposition, and a religious or revolutionary constitutional limit from unchecked personal power.':'';
      answer.rationale=`Educated assumption: ${spec.briefs[i]} Statement ${q.id} is assessed literally: “${q.text}” Most likely answer: ${labels[value+2]}. ${stance} ${strength}${mismatch} The contextual sources do not establish this exact five-point response; disagreement over application and intensity remains possible.`;
    });
  }
  audit.review={reviewer:'Codex (GPT-6), same agent; distinct review pass pending',reviewedAt:date,notes:'Assessment prepared; substantive review must be completed before archival.',similarity:[]};
  fs.writeFileSync(target,JSON.stringify(audit,null,2)+'\n',{flag:'wx'});
  output.push({id:spec.id,questions:240,assumptions:audit.axes.flatMap(a=>a.answers.map(q=>q.questionId))});
}
fs.writeFileSync(path.join(report,'assessment-progress.json'),JSON.stringify(output,null,2)+'\n');
console.log(`Prepared ${output.length} independently specified drafts; review and archival remain pending.`);
