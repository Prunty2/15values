import fs from 'node:fs';
import {subjects} from './assessments.mjs';
import {interpretations} from './interpretations.mjs';
import {judgments} from './judgments.mjs';
const dir='profile-audit/reports/canavan-taylor-mamdani-2026-10-05';
const questions=JSON.parse(fs.readFileSync('frontend/src/data/questions.v1.json')).questions;
const images=JSON.parse(fs.readFileSync(`${dir}/images.json`));
const names={ '-2':'Strongly disagree','-1':'Disagree','0':'Neutral','1':'Agree','2':'Strongly agree' };
for(const [id,s] of Object.entries(subjects)){
 const path=`profile-audit/drafts/personality/${id}.json`, audit=JSON.parse(fs.readFileSync(path));
 if(audit.revision!==1)throw Error('Unexpected revision');
 audit.researchedAt='2026-10-05';audit.author='Codex (GPT-6), AI-assisted evidence assessment';
 audit.changeNote='Owner-requested new personality; 240 independently selected responses, all conservatively disclosed as educated assumptions. Separate same-agent review; no human review claimed.';
 audit.metadata={name:s.name,description:s.description,category:s.category,period:s.period,scope:'Public political positions and conduct in the stated period, as researched through 5 October 2026. National-policy questions outside the subject’s office and undocumented scientific or institutional details are provisional contextual estimates, not documented personal commitments.',role:s.role,lifespan:s.lifespan,image:images[id]};
 audit.sources=s.sources.map(([id,title,url,publisher,date])=>({id,title,url,publisher,date,accessed:'2026-10-05'}));
 const all=[];
 audit.axes.forEach((axis,i)=>{
  const [values,brief,refs,counter]=s.axes[i], reasons=judgments[id][i].split('|');
  if(values.length!==16||reasons.length!==16||interpretations[i].length!==16)throw Error(`${id} axis ${i} length mismatch`);
  axis.brief=brief;axis.counterEvidence=counter;
  axis.answers.forEach((a,j)=>{
   const q=questions.find(q=>q.id===a.questionId),v=values[j];
   if(!q||q.priority!==j+1)throw Error('Question order mismatch');
   a.value=v;a.basis='inferred';a.sources=refs.split(' ');
   const degree=v===0?'This is a mixed or conditional judgement, not a placeholder for missing research.':Math.abs(v)===1?'The qualified response is more likely than an unqualified extreme; the exact strength remains uncertain.':'The categorical wording and contextual principle make this extreme more likely than a mild response; exact endorsement remains unverified.';
   a.rationale=`Educated assumption: ${names[v]}. ${reasons[j]}. ${interpretations[i][j]} ${degree} The cited sources establish the context described in this axis brief, not an answer to this exact statement; applying it to ${s.name} remains provisional.`;
   all.push(a.questionId);
  });
 });
 audit.review={reviewer:'Pending distinct same-agent pass',reviewedAt:'2026-10-05',notes:'Draft assessment assembled; not yet archived. Evidence review follows in a separate pass.',similarity:[]};
 fs.writeFileSync(path,JSON.stringify(audit,null,2)+'\n');
 fs.writeFileSync(`${dir}/${id}-assumption-ids.json`,JSON.stringify(all,null,2)+'\n');
}
const creditPath='frontend/src/profiles/personalityImageCredits.ts';let credits=fs.readFileSync(creditPath,'utf8');
const additions=[];
for(const [id,s] of Object.entries(subjects)) {
 const image=images[id];if(credits.includes(image.sourceUrl))continue;
 additions.push({name:s.name+' (revision 1)',sourceUrl:image.sourceUrl,creator:image.creator,license:image.license,licenseUrl:image.licenseUrl,modifications:id==='angus-taylor'?'Resized to at most 800 pixels and JPEG compressed. Source derivative by Georgfotoart adjusts exposure and contrast; no additional crop.':'Resized to at most 800 pixels and JPEG compressed; no additional crop.'});
}
credits=credits.replace(/\]\s+as const;\s*$/,additions.map(x=>JSON.stringify(x,null,2)+',').join('\n')+'\n] as const;\n');
fs.writeFileSync(creditPath,credits);
console.log('Assembled three drafts: 720/720 inferred responses. Added verified Commons credits.');
