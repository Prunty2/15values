import fs from 'node:fs';
import {dir,subjects} from './research.mjs';
const s=(id,title,url,publisher,date='undated')=>({id,title,url,publisher,date,accessed:'2026-10-05'});
export const sources={
 'robert-menzies':[
 s('primary','Menzies 1949 election speech','https://www.moadoph.gov.au/explore/democracy/election-speeches/robert-menzies-1949','Museum of Australian Democracy','1949-11-10'),
 s('context','Sir Robert Gordon Menzies biography','https://adb.anu.edu.au/biography/menzies-sir-robert-gordon-bob-11111','Australian National University'),
 s('record','Menzies during office','https://www.naa.gov.au/explore-collection/australias-prime-ministers/robert-menzies/during-office','National Archives of Australia')],
 'tony-abbott':[
 s('primary','Abbott biographical statement','https://www.queens.ox.ac.uk/people/mr-tony-abbottma-oxf/','The Queen’s College Oxford'),
 s('context','Abbott on assimilation and immigration in 2026','https://www.abc.net.au/news/2026-02-13/tony-abbott-on-angus-taylor-one-nation-immigration-assimilation/106342458','ABC News','2026-02-13'),
 s('speech','Margaret Thatcher Lecture transcript','https://www.abc.net.au/news/2015-10-28/full-transcript-of-tony-abbott-speech/6891060','ABC News','2015-10-28')],
 'scott-morrison':[
 s('primary','Joint Leaders Statement on AUKUS','https://pmtranscripts.pmc.gov.au/release/transcript-44109','Department of Prime Minister and Cabinet','2021-09-16'),
 s('context','Religious discrimination bill and protections','https://www.abc.net.au/news/2021-11-25/scott-morrison-gay-students-teachers-religious-discrimination/100648846','ABC News','2021-11-25'),
 s('welfare','JobKeeper and JobSeeker response transcript','https://pmtranscripts.pmc.gov.au/release/transcript-42780','Department of Prime Minister and Cabinet')],
 'liz-truss':[
 s('primary','Growth Plan 2022','https://www.gov.uk/government/publications/the-growth-plan-2022-documents/the-growth-plan-2022-html','HM Treasury','2022-09-23'),
 s('context','Truss explains her failed premiership','https://apnews.com/article/1ec05e4ce542524037056cd91c0bce56','Associated Press','2023-02-05'),
 s('foreign','UN General Assembly speech','https://www.gov.uk/government/speeches/prime-minister-liz-trusss-speech-to-the-un-general-assembly-21-september-2022','UK Prime Minister’s Office','2022-09-21')],
 'theresa-may':[
 s('primary','The shared society','https://www.gov.uk/government/speeches/the-shared-society-article-by-theresa-may','UK Prime Minister’s Office','2017-01-08'),
 s('context','Windrush and the hostile environment','https://www.theguardian.com/uk-news/2018/apr/17/theresa-mays-hostile-environment-policy-at-heart-of-windrush-scandal','The Guardian','2018-04-17'),
 s('foreign','UK, EU and our place in the world','https://www.gov.uk/government/speeches/home-secretarys-speech-on-the-uk-eu-and-our-place-in-the-world','UK Home Office','2016-04-25')],
 'harry-s-truman':[
 s('primary','Civil rights message to Congress','https://www.trumanlibrary.gov/library/public-papers/20/special-message-congress-civil-rights','Harry S. Truman Presidential Library','1948-02-02'),
 s('context','Domestic affairs','https://millercenter.org/president/truman/domestic-affairs','University of Virginia Miller Center'),
 s('foreign','Foreign affairs','https://millercenter.org/president/truman/foreign-affairs','University of Virginia Miller Center')],
 'dwight-d-eisenhower':[
 s('primary','Farewell address','https://www.eisenhowerlibrary.gov/research/online-documents/farewell-address','Eisenhower Presidential Library','1961-01-17'),
 s('context','Domestic affairs','https://millercenter.org/president/eisenhower/domestic-affairs','University of Virginia Miller Center'),
 s('foreign','Foreign affairs','https://millercenter.org/president/eisenhower/foreign-affairs','University of Virginia Miller Center')],
 'robert-f-kennedy':[
 s('primary','Landon lecture: conflict in Vietnam and at home','https://www.k-state.edu/landon/speakers/robert-kennedy/transcript.html','Kansas State University','1968-03-18'),
 s('context','Address at Kansas State University','https://kennedyhumanrights.org/speech/address-at-kansas-state-university/','Robert and Ethel Kennedy Human Rights Center','1968-03-18'),
 s('record','Kennedy administration domestic affairs and Robert Kennedy’s civil-rights enforcement','https://millercenter.org/president/kennedy/domestic-affairs','University of Virginia Miller Center')],
 'nancy-pelosi':[
 s('primary','Pelosi biography and legislative record','https://pelosi.house.gov/biography','Office of Nancy Pelosi'),
 s('context','USMCA terms and Pelosi agreement','https://ny1.com/nyc/brooklyn/ap-online/2019/12/10/democrats-agree-to-north-america-trade-pact-whats-in-it','Associated Press via NY1','2019-12-10'),
 s('health','Health care programme','https://pelosi.house.gov/issues/health-care','Office of Nancy Pelosi'),
 s('immigration','Immigration reform','https://pelosi.house.gov/issues/immigration-reform','Office of Nancy Pelosi'),
 s('recent','2026 Homeland Security appropriations vote','https://pelosi.house.gov/news/press-releases/pelosi-statement-homeland-security-appropriations-act','Office of Nancy Pelosi','2026-01-22')],
 'alexandria-ocasio-cortez':[
 s('primary','Economic programme','https://ocasio-cortez.house.gov/legislation/economy','Office of Alexandria Ocasio-Cortez'),
 s('context','Ocasio-Cortez interview on progressive policies','https://abcnews.com/Politics/ocasio-cortez-responds-criticism-progressive-policies-debate-exclusive/story?id=64679531','ABC News US','2019-07-31'),
 s('immigration','Immigration programme','https://ocasio-cortez.house.gov/legislation/immigration','Office of Alexandria Ocasio-Cortez'),
 s('ai','AI data center moratorium proposal','https://ocasio-cortez.house.gov/media/press-releases/ocasio-cortez-introduces-house-version-ai-data-center-moratorium-act','Office of Alexandria Ocasio-Cortez','2026-06-24'),
 s('privacy','Ban Flock Act proposal','https://ocasio-cortez.house.gov/media/press-releases/news-ocasio-cortez-sanders-merkley-unveil-ban-flock-act-protect-americans','Office of Alexandria Ocasio-Cortez')],
 'volodymyr-zelenskyy':[
 s('primary','Internal resilience plan','https://www.president.gov.ua/en/news/volodimir-zelenskij-predstaviv-plan-vnutrishnoyi-stijkosti-u-94505','President of Ukraine','2024-11-19'),
 s('context','Zelensky, Yermak and wartime governance','https://www.osw.waw.pl/en/publikacje/osw-commentary/2024-08-14/zelensky-yermak-and-ukraines-wartime-governance','Centre for Eastern Studies','2024-08-14'),
 s('war','Reformation nation: wartime politics','https://ecfr.eu/publication/reformation-nation-wartime-politics-in-ukraine/','European Council on Foreign Relations'),
 s('recent','Elections and opposition in 2026','https://www.lemonde.fr/en/international/article/2026/08/19/ukraine-s-former-defense-minister-calls-for-elections-and-denounces-corruption-defying-zelensky_6756661_4.html','Le Monde','2026-08-19')],
 'kim-jong-un':[
 s('primary','Policy speech to Supreme People’s Assembly','https://ncnk.org/node/2517','National Committee on North Korea (KCNA text)','2024-01-15'),
 s('context','Religious freedom report: North Korea','https://2021-2025.state.gov/reports/2020-report-on-international-religious-freedom/north-korea/','US Department of State'),
 s('plan','Eighth Party Congress economic plan','https://www.ncnk.org/resources/publications/kju_8th_party_congress_speech_summary.pdf/file_view','National Committee on North Korea (KCNA text)','2021-01-09')],
 'benjamin-netanyahu':[
 s('primary','Economic reforms and their institutional context','https://www.timesofisrael.com/budget-shows-bennett-lapid-govt-aims-to-transform-israel-as-netanyahu-once-did/','The Times of Israel'),
 s('context','Government advances judicial overhaul','https://apnews.com/article/5d586384e4eff2b60c4af8e5245fc283','Associated Press','2023-02-20'),
 s('technology','Netanyahu discusses AI with Elon Musk','https://apnews.com/article/b3f8bb6d485cdc14c2e256e383c13aa4','Associated Press','2023-09-18')],
 'hugo-chavez':[
 s('primary','Chávez’s authoritarian legacy: conduct review','https://www.hrw.org/news/2013/03/05/venezuela-chavezs-authoritarian-legacy','Human Rights Watch','2013-03-05'),
 s('context','Venezuela’s Chávez era','https://www.cfr.org/articles/venezuelas-chavez-era','Council on Foreign Relations'),
 s('institutions','Venezuela political conditions and US policy','https://www.everycrsreport.com/reports/RL32488.html','Congressional Research Service')],
 'martin-luther-king-jr':[
 s('primary','Where do we go from here?','https://kinginstitute.stanford.edu/where-do-we-go-here','Stanford University King Institute','1967-08-16'),
 s('context','Martin Luther King Jr. biography','https://www.nps.gov/articles/featured_stories_malu.htm','US National Park Service'),
 s('religion','Social gospel','https://kinginstitute.stanford.edu/social-gospel','Stanford University King Institute'),
 s('war','Beyond Vietnam','https://kinginstitute.stanford.edu/encyclopedia/beyond-vietnam','Stanford University King Institute','1967-04-04')],
 'frederick-douglass':[
 s('primary','Our composite nationality','https://teachingamericanhistory.org/document/our-composite-nationality/','Ashbrook Center Teaching American History','1869-12-07'),
 s('context','Frederick Douglass biography','https://www.nps.gov/people/frederick-douglass.htm','US National Park Service')],
};

sources['frederick-douglass'].push(s('work','Self-Made Men: speech transcript','https://monadnock.net/douglass/self-made-men.html','Monadnock Valley Press','undated'));
sources['kim-jong-un'].push(s('recent','North Korea in 2026: frequently asked questions','https://commonslibrary.parliament.uk/research-briefings/CBP-12204/','UK House of Commons Library','2026-09-18'));
sources['benjamin-netanyahu'].push(s('recent','Israeli court battle and constitutional crisis','https://www.abc.net.au/news/2026-07-12/trumpian-clash-between-netanyahu-government-and-israel-court/106892674','ABC News','2026-07-12'),s('religion','Parliament approves religious draft exemptions','https://apnews.com/article/3f8939b7c601b1dbef16427f422590ed','Associated Press','2026-07-14'),s('knesset','Netanyahu on the balance of government branches','https://m.knesset.gov.il/EN/News/PressReleases/Pages/press2226e.aspx','Knesset','2026-02-02'));
for(const [id,name] of subjects)sources[id].push(s('wiki',`${name}: biography and source index`,'https://en.wikipedia.org/wiki/'+encodeURIComponent(name.replaceAll(' ','_')),'Wikipedia contributors'));
if(process.argv.includes('--fetch')){
 const access=[];
 for(const [id,list] of Object.entries(sources))for(const src of list.filter(s=>s.id!=='wiki')){
  try{const r=await fetch(src.url,{signal:AbortSignal.timeout(25000)});const html=await r.text();fs.writeFileSync(`${dir}/${id}-${src.id}-source.html`,html);access.push({profile:id,source:src.id,url:src.url,status:r.status});console.log(id,src.id,r.status)}catch(e){access.push({profile:id,source:src.id,url:src.url,error:e.message});console.log(id,src.id,e.message)}
  fs.writeFileSync(`${dir}/source-access.json`,JSON.stringify(access,null,2));
 }
}
