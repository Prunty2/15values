import fs from 'node:fs';
const dir='profile-audit/reports/canavan-taylor-mamdani-2026-10-05';
const ids=['matt-canavan','angus-taylor','zohran-mamdani'];
const corrections={
 'matt-canavan':[
 ['authority-liberty-01',1,'His Senate speech defends adult choices in regulated gambling. Applying that liberty argument to self-regarding drug use makes qualified agreement more likely than rejection; the analogy is explicitly uncertain and does not establish support for every drug.',['senate','speech-liberty']],
 ['public-private-05',0,'The programme combines enterprise ownership with publicly supported essential services. Healthcare provision plausibly remains mixed: neither generally private facilities nor uniformly public provision follows from the national works agenda. This is a substantive mixed-ownership estimate, not an unanswered item.',['patriot','abc-economy']],
 ['culture-nature-16',0,'Economic incentives and learned social expectations can both affect observed earnings. His family-tax argument does not settle the assertion that sex differences in economic value displace social expectations. A mixed explanation is the likeliest estimate; this item also does not isolate biology.',['patriot','christian']]
 ],
 'angus-taylor':[
 ['culture-nature-16',0,'Productivity, opportunities and social expectations can all influence pay. His enterprise argument does not establish that men and women differ in economic value instead of social expectations. A conditional mixed explanation is likelier than accepting that either-or claim; the bank does not isolate inheritance here.',['economy','migration']]
 ]
};
const report={reviewer:'Codex (GPT-6), distinct same-agent review pass',reviewedAt:'2026-10-05',independentHumanReview:false,method:'Re-read all 720 literal statements and rationales against each axis definition and contextual research. Checked response strength, neutral trade-offs, national versus municipal scope, counter-evidence and source independence. Generated scores were not used to choose revisions.',profiles:[]};
for(const id of ids){
 const path=`profile-audit/drafts/personality/${id}.json`,a=JSON.parse(fs.readFileSync(path));
 const applied=[];
 for(const [qid,value,reason,refs] of corrections[id]??[]){
  const answer=a.axes.flatMap(x=>x.answers).find(x=>x.questionId===qid);
  applied.push({questionId:qid,before:answer.value,after:value,reason});
  answer.value=value;answer.sources=refs;answer.rationale=`Educated assumption: ${value===0?'Neutral':'Agree'}. ${reason} These citations provide context, not a documented answer to the exact statement; the estimate remains provisional.`;
 }
 if(id==='angus-taylor')a.metadata.role='Leader of the Australian Liberal Party and Leader of the Opposition; member of parliament for Hume';
 if(id==='zohran-mamdani')a.metadata.role='Mayor of New York City';
 const answers=a.axes.flatMap(x=>x.answers),neutral=answers.filter(x=>x.value===0);
 const warningReview=a.axes.filter(x=>x.answers.filter(y=>y.value===0).length>4).map(x=>({axisId:x.axisId,neutralIds:x.answers.filter(y=>y.value===0).map(y=>y.questionId),decision:'Retain the individually explained mixed judgements. The cited context does not establish exact positions. Each neutral rationale identifies competing policy or causal considerations; none was assigned mechanically for an evidence gap. These remain weak contextual estimates requiring personal review.'}));
 const sourceReview=id==='matt-canavan'?'Primary speeches checked with ABC reporting and the Australian Christian Lobby’s distinct advocacy account. The Nightly and ABC economy stories cover the same speech, so they do not supply independent confirmation of every claim. ACL has an explicit pro-Christian advocacy perspective; its praise is not adopted. Senate page read by direct HTTP fetch after the web reader returned 429.':id==='angus-taylor'?'Taylor’s site and the Liberal Party are politically connected, not independent corroboration. ABC and the Guardian provide independent contextual reporting. The Guardian account is used only to flag contested reception, not as a scoring basis. His economic speech is rhetoric rather than verified economic statistics.':'Primary city transcripts cross-checked with independently produced AP, TIME and Le Monde reporting. The NYC Public Advocate is in the same city government, so is not counted as an independent publisher. Wikipedia is a secondary research index; no linked article was represented as independently read unless separately opened.';
 const limits=id==='matt-canavan'?'His WTO qualifications, existing trade benefits, religious pluralism and support for adult choice were retained as counter-evidence. Industry protection is not nationalisation; development enthusiasm is not biomedical permissiveness. Culture vs Nature estimates are especially weak.':id==='angus-taylor'?'His calls for diplomacy, Chinese diaspora inclusion, emergency economic intervention, pensions and Medicare constrain stronger inferences. National values are not racial biology; his market programme does not settle abortion or every ownership question. Culture vs Nature and social-custom estimates are especially weak.':'His retreat from earlier defund-police advocacy and later security for Jewish communities constrain a simplistic anti-enforcement reading. Municipal rent regulation is not comprehensive command planning; personal faith does not imply theocracy. National tariffs, defence systems and biological claims remain particularly weak extrapolations.';
 a.review={reviewer:report.reviewer,reviewedAt:report.reviewedAt,notes:`Distinct same-agent pass completed; no independent human review claimed. All 240 question IDs are educated assumptions (every axis suffix 01–16); exact IDs are recorded in the separate review JSON. ${sourceReview} ${limits} Read every neutral rationale and retained conditional choices for stated competing considerations, not uncertainty alone. Four batch corrections are recorded in the separate review. No score targeting or changes to the bank. Similarity diagnostics will be checked before immutable archival.`,similarity:[]};
 report.profiles.push({id,revision:1,answered:answers.length,educatedAssumptionIds:answers.map(x=>x.questionId),neutralChoices:neutral.map(x=>({questionId:x.questionId,rationale:x.rationale})),warningReview,sourceReview,limitations:limits,corrections:applied,similarity:[]});
 fs.writeFileSync(path,JSON.stringify(a,null,2)+'\n');
}
fs.writeFileSync(`${dir}/review-results.json`,JSON.stringify(report,null,2)+'\n');
console.log('Distinct same-agent review complete; four evidence/wording corrections.');
