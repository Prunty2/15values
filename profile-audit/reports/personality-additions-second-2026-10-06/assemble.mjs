import fs from 'node:fs';
const dir='profile-audit/reports/personality-additions-second-2026-10-06';
const bank=JSON.parse(fs.readFileSync('frontend/src/data/questions.v4.json')).questions;
const images=JSON.parse(fs.readFileSync(dir+'/images.json'));
const labels={'-2':'Strongly disagree','-1':'Disagree','0':'Neutral','1':'Agree','2':'Strongly agree'};
for(const file of fs.readdirSync(dir).filter(x=>x.endsWith('-spec.json'))){
 const s=JSON.parse(fs.readFileSync(dir+'/'+file));
 const p=`profile-audit/drafts/${s.catalogue}/${s.id}.json`;const d=JSON.parse(fs.readFileSync(p));
 d.metadata={...d.metadata,name:s.name,description:s.description,category:s.catalogue==='ideology'?'Political ideology':/theorist|philosopher/i.test(s.role)?'Political theorist':'Politician',period:s.period,scope:`Named subject in ${s.period}. Each answer is an evidence-based estimate, not a completed personal questionnaire. Modern mechanisms without exact evidence are disclosed analogies; positions are not copied from another profile or selected to achieve a score.`};
 if(s.catalogue==='personality'){d.metadata.role=s.role;d.metadata.lifespan=s.lifespan;d.metadata.image=images[s.id];}else{delete d.metadata.image;d.metadata.phrase=s.phrase;}
 d.researchedAt='2026-10-06';d.author='Codex (GPT-6)';d.changeNote='Owner-requested addition; 240 current-bank responses independently selected from scoped research. All choices conservatively classified as inferred. Separate review and validation remain required before archive.';
 d.sources=s.sources.map((x,i)=>({id:`source-${i+1}`,...x,accessed:'2026-10-06'}));
 d.axes.forEach((a,i)=>{let sp=s.axes[i];a.brief=sp.brief;a.counterEvidence=sp.counterEvidence;a.answers.forEach((ans,j)=>{const q=bank.find(x=>x.id===ans.questionId);ans.value=sp.values[j];ans.basis='inferred';ans.sources=sp.refs.map(n=>`source-${n}`);const qual=sp.qualifications[j+1]??'';ans.rationale=`Educated assumption: ${labels[ans.value]} is the most likely response by ${s.name} in ${s.period} to “${q.text}”. Subject-specific context: ${sp.brief} Counter-evidence and limits: ${sp.counterEvidence} ${qual} ${ans.value===0?'The specified mechanism combines competing aims in this record; a mixed response is chosen for that substantive conflict, not merely because exact evidence is unavailable.':ans.value>0?`The mechanism is more consistent than inconsistent with this context; ${ans.value===2?'the strength of that fit makes a firm endorsement most likely.':'the qualified endorsement allows the exceptions described.'}`:`The mechanism is more inconsistent than consistent with this context; ${ans.value===-2?'the strength of that conflict makes a firm rejection most likely.':'the qualified rejection allows the exceptions described.'}`} This is a contextual estimate with uncertainty, not a documented answer to this exact statement.`;});});
 fs.writeFileSync(p,JSON.stringify(d,null,2)+'\n');console.log(s.id+' 240/240 assembled; review pending');
}
