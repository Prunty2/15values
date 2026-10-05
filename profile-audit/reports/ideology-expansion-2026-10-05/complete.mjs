import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const report=path.dirname(new URL(import.meta.url).pathname),root=path.resolve(report,'../../..');
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
const subjects=read('profile-audit/reports/ideology-expansion-2026-10-05/subjects.json');
const catalogue=read('frontend/public/profiles/catalogue.v1.json');
const profiles=subjects.map(subject=>{
 const answerFile=`profile-audit/answers/ideology/${subject.id}/1.json`;
 const audit=read(answerFile),profile=catalogue.profiles.find(p=>p.catalogue==='ideology'&&p.id===subject.id);
 if(!profile)throw Error('Missing profile '+subject.id);
 const answers=audit.axes.flatMap(a=>a.answers);
 if(answers.length!==240||answers.some(a=>a.value===null||a.basis!=='inferred'||!a.rationale.startsWith('Educated assumption:')))throw Error('Invalid completed record '+subject.id);
 for(const width of [1440,390]){
  if(hash(`output/playwright/${subject.id}-${width}.json`)!==hash(answerFile))throw Error('Browser download differs '+subject.id+' '+width);
 }
 if(hash('frontend/public/'+profile.auditPath)!==hash(answerFile))throw Error('Generated archive differs '+subject.id);
 return {id:subject.id,name:subject.name,answerFile,answered:240,total:240,revision:1,educatedAssumptionIds:answers.map(a=>a.questionId),reviewFile:`profile-audit/reports/ideology-expansion-2026-10-05/${subject.id}-review.json`,scores:profile.scores};
});
const baseline=read('profile-audit/reports/ideology-expansion-2026-10-05/starting-hashes.json');
const changed=Object.entries(baseline).filter(([file,value])=>hash(file)!==value).map(([file])=>file);
if(changed.length)throw Error('Prior archives/images changed: '+changed.join(', '));
const browser=JSON.parse(read('output/playwright/batch-check-final.json').result);
const layout=JSON.parse(read('output/playwright/final-layout-result.json').result);
const completion={date:'2026-10-05',profiles,retained:{id:'marxism',answerFile:'profile-audit/answers/ideology/marxism/2.json',revision:2,answered:240,total:240},duplicateRemoved:'Zionism',generation:{result:'passed',newIdeologies:30,activeIdeologies:54,allCatalogues:111,withdrawn:0,existingExclusionsPreserved:true},verification:{npmCi:'passed',questionsCheck:'passed: 240 questions across 15 axes',profileValidation:'30/30 passed; neutral-density warnings reviewed and retained in separate reviews',catalogueCheck:'passed',unitTests:{passed:78,total:78,note:'Initial run failed on the system Git Xcode licence restriction; rerun with bundled Git passed.'},productionBuild:'passed: catalogue check, TypeScript and Vite',fullBrowserSuite:{passed:156,total:159,failed:3,reason:'Existing personality-tag mismatch in home-strip.spec.ts: expected Far-Right for Adolf Hitler, received Unclassified; identical failure on desktop, mobile and Safari. Existing source record remained unchanged.'},catalogueRegression:{passed:21,total:21,targets:['desktop','mobile','Safari']},requestedProfileBrowserChecks:browser,finalLayoutAndReview:layout,browserDownloadHashes:'All 60 saved browser downloads match permanent source archives byte-for-byte.',archiveHistory:{result:'failed against starting HEAD',reason:'24 pre-existing modified revision 1 ideology archives; preserved unchanged from the beginning of this task.',baselineRef:fs.readFileSync(path.join(report,'starting-head.txt'),'utf8').trim(),snapshotHashes:{checked:Object.keys(baseline).length,changed}}},limitations:['All 7,200 new answers are educated assumptions, including five-point intensities; exact question responses were not documented by sources.','The evidence review was a distinct same-agent pass, not external independent review.','Some sources were accessible only as indexed excerpts or scholarly abstracts; titles disclose those access limits.','Broad subjects use explicitly selected schools; axes outside the central doctrine are particularly provisional.','Christian Accelerationism is the owner-defined variant, not an exact assessment of Peter Thiel or Texas.'],publishedExternally:false};
fs.writeFileSync(path.join(report,'completion.json'),JSON.stringify(completion,null,2)+'\n');
console.log(JSON.stringify({profiles:profiles.length,answers:profiles.reduce((n,p)=>n+p.answered,0),activeIdeologies:completion.generation.activeIdeologies,browserChecks:browser.passed,priorArchivesAndImagesUnchanged:Object.keys(baseline).length},null,2));
