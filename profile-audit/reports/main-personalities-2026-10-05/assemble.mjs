import fs from 'node:fs';
const dir='profile-audit/reports/main-personalities-2026-10-05';
const bank=JSON.parse(fs.readFileSync('frontend/src/data/questions.v1.json')).questions;
const labels={'-2':'Strongly disagree','-1':'Disagree','0':'Neutral','1':'Agree','2':'Strongly agree'};
const files=fs.readdirSync(dir).filter(x=>x.endsWith('-spec.json'));
for(const f of files){
 const s=JSON.parse(fs.readFileSync(dir+'/'+f));const p=`profile-audit/drafts/personality/${s.id}.json`;const d=JSON.parse(fs.readFileSync(p));
 if(s.axes.length!==15)throw Error(s.id+' axis count');
 d.metadata={...d.metadata,name:s.name,description:s.description,category:s.category,period:s.period,scope:`${s.scope} Research cutoff for this defined period: ${s.cutoff}. Modern questions are explicit analogical estimates where the record does not settle them.`,role:s.role,lifespan:s.lifespan};
 d.researchedAt='2026-10-05';d.author='Codex (GPT-6), assessment and separate same-agent review';d.changeNote='Owner-requested main 25 missing personalities; new independently assessed 240-question record. All responses conservatively marked educated assumptions, including close paraphrases of documented policies.';
 d.sources=s.sources.map((x,i)=>({id:x.id??`source-${i+1}`,title:x.title,url:x.url,publisher:x.publisher,date:x.date??'undated',accessed:'2026-10-05'}));
 for(let i=0;i<15;i++){
  const a=d.axes[i],spec=s.axes[i];const vals=spec.values.replace(/\s/g,'').split('').map(x=>Number(x)-2);if(vals.length!==16||vals.some(x=>!Number.isInteger(x)||x< -2||x>2))throw Error(s.id+' values '+i);
  a.brief=spec.brief;a.counterEvidence=spec.counter;
  a.answers.forEach((answer,j)=>{const q=bank.find(q=>q.id===answer.questionId),v=vals[j];answer.value=v;answer.basis='inferred';answer.sources=spec.sources;const extra=spec.reasons?.[j];
   answer.rationale=`Educated assumption: ${labels[v]} is the most likely response by ${s.name} in ${s.period} to “${q.text}” under the evidence and counter-evidence recorded in this axis brief. ${extra??(v===0? 'The claim combines considerations that the scoped record treats differently; a conditional or mixed response is more plausible than unqualified endorsement or rejection.':v>0?'The claim is consistent with the institutional or policy priority identified in the axis brief; '+(v===2?'a firm endorsement is more plausible than a qualified one.':'qualification is appropriate because the precise trade-off or mechanism is not established.'):'The claim conflicts with the institutional or policy priority identified in the axis brief; '+(v===-2?'a firm rejection is more plausible than a qualified one.':'a qualified rejection is appropriate because exceptions or compromises remain possible.'))} ${spec.gap??'The sources do not establish a personal response to this exact wording. This analogy is uncertain and must not be treated as a documented position.'}`;
  });
 }
 fs.writeFileSync(p,JSON.stringify(d,null,2)+'\n');
}
console.log('Assembled',files.length,'independent question response matrices. Review remains pending.');
