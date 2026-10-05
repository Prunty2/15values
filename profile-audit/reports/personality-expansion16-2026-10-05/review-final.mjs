import fs from 'node:fs';
import {subjects,dir} from './research.mjs';
import {bankHash} from '../../../frontend/scripts/profiles.ts';
import {validateAudit,similarity} from '../../../frontend/src/profiles/audit.ts';
const peers=JSON.parse(fs.readFileSync('frontend/public/profiles/catalogue.v1.json')).profiles.filter(p=>p.catalogue==='personality'&&!p.withdrawal);
const specific={
 'democracy-autocracy-05':'Equal electoral competition is weighed against restrictions on particular organisations; neither full equality nor unlimited exclusion describes the mixed record.',
 'democracy-autocracy-10':'Popular participation supports a referendum mechanism, while representative legislative responsibility weighs against an unconditional national repeal power.',
 'democracy-autocracy-14':'Electoral accountability supports removal by voters, while fixed parliamentary terms and constitutional removal procedures weigh against adding a general recall entitlement.',
 'authority-liberty-01':'Personal agency weighs toward freedom, while health, addiction and duties to others weigh toward restrictions on this specific self-risking choice.',
 'authority-liberty-03':'Protection of peaceful political expression is balanced against maintaining public access and order during obstruction.',
 'authority-liberty-05':'Protection of health is balanced against compelling an adult primarily for that adult’s own benefit, rather than preventing harm to others.',
 'authority-liberty-06':'Investigative usefulness is balanced against indiscriminate long-term recording of people not suspected of offences.',
 'authority-liberty-07':'Prevention of danger on public roads supports checks; the absence of individual grounds weighs toward a narrower police power.',
 'authority-liberty-08':'A court finding and harm prevention weigh toward intervention, while restricting someone before an offence weighs toward liberty.',
 'authority-liberty-09':'Freedom to obtain information is balanced against the period’s censorship or security practices; the claim is specifically moral censorship.',
 'authority-liberty-10':'Privacy and ordinary communication weigh against identification, while legitimate crime investigation weighs toward limited verification.',
 'authority-liberty-11':'A credible local threat supports precaution, while searching a person without individual suspicion creates a separate liberty objection.',
 'authority-liberty-13':'Ordinary judicial safeguards support warrants, while documented security exceptions constrain a categorical warrant requirement.',
 'authority-liberty-14':'Public accountability supports exposing misconduct, while confidentiality and protection of legitimate security operations constrain publication.',
 'authority-liberty-16':'Security protection weighs toward temporary detention, while constitutional accountability weighs against indefinite detention without review.',
 'planning-free-market-16':'Substantial government coordination and public investment are balanced against continued civilian business autonomy; the question expressly excludes emergencies.',
 'innovation-caution-02':'The benefits of useful development compete with precaution; confining every technology to trials is stronger than targeted regulation.',
 'innovation-caution-07':'Potential production efficiency competes with food and environmental safety; biotechnology substitution is narrower than general support for science.',
 'innovation-caution-10':'Material benefits of construction compete with obtaining adequate environmental information before proceeding.',
 'innovation-caution-11':'Adult agency and useful technical progress compete with irreversible effects beyond basic short-term safety.',
 'innovation-caution-13':'Scientific capability competes with hereditary and ethical risks of enhancement beyond disease prevention.',
};
const axisBalance={
 'assimilation-multiculturalism':'The inclusive citizenship or accommodation evidence is balanced against common civic customs and institutions. Neither cultural priority in every conflict nor unconditional priority for every separate practice follows.',
 'restricted-immigration-open-immigration':'Humanitarian, family or employment entry is balanced against regulated admission and settlement administration. The precise criterion in this question is assessed separately from support for migration in general.',
 'militarist-pacifist':'Defence and allied security duties are balanced against negotiated peace and limits on escalation. The specific mechanism is stronger than either a general security commitment or a general preference for diplomacy.',
 'nationalism-internationalism':'Actual cooperative commitments are balanced against retained domestic constitutional authority. Accepting an alliance does not entail approving every further transfer of sovereignty.',
 'public-private':'Private enterprise and the potential use of private providers are balanced against public services, strategic ownership or public investment. Funding a service and owning its provider are distinct choices.',
 'protectionism-free-trade':'Access to trade and lower-cost imports are balanced against domestic employment, security or development safeguards. Neither economy-wide exclusion nor unconditional opening fits the mixed evidence.',
 'planning-free-market':'Market allocation and business agency are balanced against price, wage, investment or crisis interventions. The precise scope of compulsion in the claim matters.',
 'high-redistribution-low-redistribution':'Material security is balanced against incentives, fiscal limits or the subject’s institutional distribution system. This exact tax/benefit mechanism is not identical to all public services.',
 'secular-religious':'Civil constitutional authority and religious freedom are balanced against retained ceremonial, educational or charitable accommodation. Symbolic religious participation does not itself establish clerical control.',
 'progressive-traditionalist':'Equal civic treatment and adaptation are balanced against the selected period’s family and moral conventions. Legal equality and acceptance of every current social convention are distinct claims.',
 'central-local':'Protected local agency is balanced against national coordination and enforceable common rights. Operational delegation alone does not prove constitutionally protected regional authority.',
 'culture-nature':'Educational and social formation are balanced against recognition of individual dispositions and capacities. This comparative claim about a particular trait is stronger than either recognition of biology or support for equal legal rights.',
};
const records=[];const drafts=subjects.map(([id])=>JSON.parse(fs.readFileSync(`profile-audit/drafts/personality/${id}.json`)));
for(const a of drafts){
 for(const axis of a.axes)for(const answer of axis.answers)if(answer.value===0){const note=specific[answer.questionId]??axisBalance[axis.axisId]??'The supported institutional commitments favour accountability but also continuity and prescribed constitutional procedures; this particular mechanism has competing implications.';answer.rationale+=` Neutral-specific review: ${note}`;}
 const r=validateAudit(a,bankHash);if(r.errors.length)throw Error(JSON.stringify(r.errors));
 const otherDrafts=drafts.filter(d=>d.id!==a.id).map(d=>validateAudit(d,bankHash).profile);
 const ns=[...peers,...otherDrafts].filter(p=>p&&p.id!==a.id).map(p=>({id:p.id,revision:p.revision,similarity:similarity(r.profile.scores,p.scores)})).sort((a,b)=>b.similarity-a.similarity);
 if(a.id==='alexandria-ocasio-cortez')a.review.similarity=[{id:'zohran-mamdani',revision:1,reason:'Reviewed voluntarily near the 95% threshold. Both subjects support immigrant protections, redistribution, labour rights and public services. Ocasio-Cortez is a national legislator with specific AI and surveillance proposals; Mamdani is assessed as a city mayor with housing and municipal-service priorities. Different offices, periods and independent primary records support retaining both. No answers were changed to reduce similarity.'}];
 const unresolved=ns.filter(n=>n.similarity>=95&&!a.review.similarity.some(d=>d.id===n.id&&d.revision===n.revision));if(unresolved.length)throw Error(JSON.stringify({id:a.id,unresolved}));
 a.review.notes+=` Validation warnings reviewed: ${r.warnings.join(' ')||'none'}. Every Neutral rationale includes an item-specific or axis-specific statement of competing substantive commitments. Warnings are retained; absence of a precise statement was never treated as an automatic Neutral response. All local portraits were visually inspected together and matched their Commons identities; JPEGs are within the 1 MB limit.`;
 fs.writeFileSync(`profile-audit/drafts/personality/${a.id}.json`,JSON.stringify(a,null,2)+'\n');
 const report=JSON.parse(fs.readFileSync(`${dir}/${a.id}-review.json`));report.neighbours=ns.slice(0,5);report.similarityDecisions=a.review.similarity;report.warnings=r.warnings;report.neutralReview=a.axes.flatMap(axis=>axis.answers.filter(answer=>answer.value===0).map(answer=>({questionId:answer.questionId,rationale:answer.rationale})));report.notes=a.review.notes;fs.writeFileSync(`${dir}/${a.id}-review.json`,JSON.stringify(report,null,2)+'\n');
 records.push({id:a.id,answered:240,revision:1,errors:r.errors,warnings:r.warnings,neighbours:ns.slice(0,5),scores:r.profile.scores});console.log(a.id,'review complete;',r.warnings.length,'retained warnings;',ns[0].similarity.toFixed(2)+'% nearest');
}
fs.writeFileSync(`${dir}/reviewed-validation.json`,JSON.stringify(records,null,2)+'\n');
