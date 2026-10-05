import fs from 'node:fs';
const subjects=[];
function add(id,name,category,period,scope,description,phrase,sources,briefs,rows,limits){subjects.push({id,name,category,period,scope,description,phrase,sources,briefs,rows:rows.trim().split('\n'),limits});}
add('classical-liberalism','Classical Liberalism','Liberal','Smith–Mill tradition, 1776–1861; modern applications inferred',
'Constitutional market liberalism grounded in Smith and Mill, including public goods and qualified nineteenth-century representation; distinct from a minimal-state or anarchist doctrine.',
'A liberal tradition favouring personal liberty, private enterprise, open exchange and constitutional limits, while allowing public goods and some social provision.',
'Society should protect personal freedom and private enterprise through constitutional government, open exchange and public institutions that enable people to pursue their own lives.',
['liberalism','mill','smith'],[
'Representative government and opposition constrain rulers, but Mill’s educational qualifications and preference for deliberative representation qualify universal franchise and direct referendums.',
'The harm principle protects adult self-regarding conduct and expression; judicially controlled measures against harm to others are compatible with liberty.',
'Individual freedom protects cultural affiliation; common civic communication can be useful without requiring cultural uniformity or funding every practice.',
'Movement and voluntary employment are favoured, while receiving welfare and remaining after unlawful entry are distinct claims with weaker doctrinal support.',
'Commercial cooperation and peaceful diplomacy are favoured; defence against aggression and proportionate preventive measures are not ruled out.',
'Voluntary international cooperation and trade are compatible with self-government; binding supranational authority is qualified rather than assumed.',
'Private enterprise is generally preferred, but infrastructure, public goods and natural monopoly qualify an across-the-board privatisation rule.',
'Smith’s criticism of mercantilism supports open trade, while defence-sensitive industries can justify limited exceptions.',
'Competitive prices and voluntary production are preferred; public goods and anti-harm regulation do not amount to compulsory national production planning.',
'A basic income floor and fair taxation can be justified, but narrowing all disposable-income differences is not the governing purpose of this school.',
'Freedom of conscience and civil justification oppose ecclesiastical vetoes; inherited holidays and voluntary religion need not be abolished.',
'Individual self-development challenges enforced gender and family conventions, though modern marriage, abortion and identity questions are historical extrapolations.',
'Improvement and voluntary experimentation are valued, while evidence of external harm justifies safety scrutiny; development is not an unconditional licence for irreversible risk.',
'Decentralised initiative and local knowledge are valued, with national functions for common rights, defence and cross-region emergencies.',
'Mill’s account of education, habits and social conditioning supports cultural explanations; the tradition does not establish genetic findings, and biological temperament can coexist with learned behaviour.'
],`
D B B A E E E A A B A E A B A A
E D D E A A D D E E B D E E D A
B D B E D D B A C D D C B C D C
B E B E E C B B B E B B E A C C
B E B D D B D B E A B E B D D D
D B D D E C D D C D D D D E D D
E C E B D D E B E B D B E C D B
A E B E B E A E B E B E C E B E
E A E B E B E A E B D C E B E A
B D D D C D C D B D D D C D B D
E A E A E A E A D B D C E B E B
D B D B D C D C D B D B E D D C
D C D D D B D D C D D D C D D D
D C C B D B D B D C D C D C D D
D B D C D C D C D B D C D B E B
`, 'Smith and Mill differ over public provision and representation. Historical restrictions are disclosed rather than replaced with a fictitious unanimous modern platform.');
add('traditional-conservatism','Traditional Conservatism','Conservative','Burkean and Kirkian tradition, 1790–1993; modern applications inferred',
'Anglo-American constitutional traditionalism in Burke and Kirk, favouring gradual reform and inherited institutions rather than absolute monarchy or a universal laissez-faire programme.',
'A conservative tradition valuing inherited institutions, social obligations, private property, religious heritage and gradual reform.',
'Society should preserve its inherited institutions, moral traditions and local associations while reforming abuses cautiously and maintaining constitutional order.',
['conservatism','kirk','burke'],[
'Inherited representative institutions constrain rulers; resistance to revolutionary democratic redesign does not imply permission for military coups or personal rule.',
'Order and social obligations justify proportionate policing, while established legal procedures protect homes and constrain indefinite detention.',
'Continuity of national customs and language is favoured, with toleration of private cultural identities and recognition of historically rooted minorities.',
'Gradual, manageable settlement and cultural integration are favoured; family reunion and protection against persecution qualify a blanket exclusion.',
'Defence and prudent national resolve matter, but Burkean caution weighs against unnecessary wars and risky unilateral expansion.',
'National institutions and inherited sovereignty are favoured, with alliances and negotiated cooperation accepted without unlimited foreign authority.',
'Private property sustains independence and continuity, while strategic infrastructure and established public institutions can justify retained ownership.',
'Commercial exchange is accepted, but protecting vulnerable traditional communities and strategic capacities can qualify free-trade absolutism.',
'Local enterprise and market knowledge are generally preferred; pragmatic support for established regulation differs from compulsory national production schedules.',
'Social obligation supports a safety net and aid to low-paid households, while inherited property and family continuity qualify redistributive taxation.',
'Religious heritage may inform public institutions, schooling and ceremonies; this does not require clerical government or religious approval of every law.',
'Traditional family roles and inherited moral customs are preferred; gradual correction of abuse is compatible with preserving continuity.',
'Prudence and intergenerational responsibility favour scrutiny of irreversible changes, while useful incremental development can be accepted.',
'Local associations and established regional rights are valued, with national coordination for common law, employment protections and emergencies.',
'Human fallibility is treated as enduring, but that moral view is not a genetic explanation of racial crime or national IQ; habits and self-control are also cultivated through institutions.'
],`
D B D A D E D A B B A E A B A A
B D B D D B D D B C D D E C D B
E B E D E D E A E C E B E B C E
E B D D C B D E E D D D D D B B
D D D E B D C B D A D D D C D C
E B E D E B E C D B E D E D E C
D D D B D D D C D C D C D D C D
D D D D D B D D D D D D D D D D
D B D C D D D C D D B D D C D B
C D D D D D B D B D D D D D B D
C D D D C D D C B D B E D D C C
B E B E B E A E B E B E C E B E
B E C E C D B E B E B E B E C E
E C B C E B D C E C D C D C D D
C B C D C D D C C C D D C B D C
`, 'Kirk’s respect for variety and Burke’s reformism qualify authoritarian or culturally uniform interpretations. Moral imperfection is not biological determinism.');
add('zionism','Zionism','National','Herzlian political Zionism, 1896–1904; modern applications inferred',
'Foundational political Zionism seeking an internationally recognised Jewish national home/state, chiefly Herzl’s civic and institutional proposals; not a profile of all later Zionist branches or current Israeli policy.',
'A national movement seeking Jewish collective self-determination and a secure national home, assessed here through Herzl’s foundational political proposals.',
'The Jewish people should have a secure, internationally recognised national home in which they can govern their collective affairs and protect civil and religious rights.',
['herzl','zionism-nli','herzl-institute'],[
'Herzl favoured organised representative institutions but also elite leadership and constitutional restraint; modern competitive elections are an inference, not a settled proposal in the text.',
'A secure lawful civic order and individual rights coexist; judicial safeguards are more compatible with this design than arbitrary police power.',
'Jewish collective identity is central, while religious and civil equality for other residents qualify uniform assimilation; no later Hebrew-only policy is imported.',
'Jewish migration and refuge are constitutive goals, while selective national settlement is different from a universal right to migrate to any state.',
'Diplomatic recognition and security are central; the founding programme does not establish offensive militarism or later Israeli military choices.',
'National self-determination is pursued through international agreement; recognition and cooperation do not imply surrendering sovereign control.',
'Herzl’s development company and organised land/infrastructure schemes coexist with private enterprise, giving a mixed rather than wholly socialist ownership design.',
'Economic development and international commerce are valued; strategic settlement and domestic capacity may qualify completely unrestricted foreign control.',
'Organised settlement and coordinated development coexist with enterprise; this is more interventionist than laissez-faire without a complete state production plan.',
'Herzl’s labour and welfare proposals support material security, while private property and differentiated occupations qualify income equalisation.',
'Herzl explicitly separates clerical authority from state government while retaining religious respect; Jewish nationhood is not itself theocracy.',
'Modernisation and civic equality coexist with inherited community identity; present-day family and gender positions are not established by the national project.',
'Scientific development and modern infrastructure serve settlement, but modern biomedical enhancement and irreversible ecosystem risk require separate inferred judgments.',
'The national project needs coordinated institutions, while communities and municipal administration retain functions; this is not a regional-secession programme.',
'Herzl explains collective behaviour substantially through persecution, institutions and historical experience; Jewish identity does not imply a theory of biological causal primacy.'
],`
D C D B D D D B C B B D B C B B
D D D D C B D D D D C D E D C B
D C D E D D D B C D E C D C D D
D D C E E D C D D D D C E D D C
B E C D D C D B D A C D B D D D
E C D E D C E D C D D E D E D D
D D C D C D D D C D C D D D C D
B D C D D C D D D D C D D D D D
D C D D D D D D C D B D D D C D
D B D C D C D B C C D B D B C C
E A E B E B E A C B C D E B E B
D C D C C C C C D C D C D D D D
D C E D D C D D C D D D C D E D
C D B D C D C D C D C D D D C D
D B D C D C D C C B D C D B E B
`, 'The charter spans distinct Jewish political traditions. Herzl’s elite constitutional preferences, cultural pluralism and organised commercial development complicate both a modern liberal-democratic and an authoritarian-nationalist stereotype.');
add('maoism','Maoism','Socialist','Mao Zedong Thought, 1927–1976; modern applications inferred',
'Mao’s Chinese revolutionary doctrine, New Democracy and the transition to party-led socialism; not later post-Mao market reform or every contemporary Marxist–Leninist–Maoist movement.',
'A revolutionary socialist doctrine emphasizing peasant mobilisation, Communist Party leadership, collective production and continued struggle against class hierarchy.',
'Workers and peasants should transform society through a party-led revolution, collective control of production and mass participation aimed at overcoming class hierarchy and foreign domination.',
['mao','mao-democracy','mao-state','mao-peasant'],[
'Participation is organised under revolutionary class and Party leadership, with opponents excluded; this differs from competitive pluralist elections but not from all representative accountability.',
'Revolutionary mobilisation and control of counter-revolution constrain liberty; participation and criticism within the revolutionary camp qualify unlimited personal police power.',
'A common revolutionary national culture is preferred alongside recognition of national minorities; cultural unity is not equivalent to a racial hierarchy.',
'National revolutionary development favours controlled settlement, with solidarity and refuge for oppressed peoples qualifying exclusion solely by skill or culture.',
'People’s war and armed revolutionary defence are justified; tactical diplomacy does not establish pacifism or support for indiscriminate expansion.',
'Anti-imperial national sovereignty and international revolutionary solidarity coexist; Western supranational authority is not identical to socialist internationalism.',
'Collective and public ownership become the socialist goal, while New Democracy temporarily permits national private enterprise; the later collectivising doctrine receives priority here.',
'Autonomous development and control over strategic foreign capital are favoured; exchange with friendly states remains compatible with sovereignty.',
'Socialist transformation coordinates production and credit, while local initiative under national political direction qualifies purely bureaucratic central planning.',
'Ending class exploitation, land reform and broad provision support substantial redistribution; modern tax-and-cash-transfer tools are an institutional analogy.',
'Materialist secular state organisation rejects religious vetoes; respecting some popular practices during coalition-building is not doctrinal religious government.',
'Women’s emancipation and transformation of old hierarchies are core; modern same-sex marriage and gender language remain extrapolations beyond the historical texts.',
'Industrial and scientific transformation are valued, but autonomous weapons and human enhancement are unaddressed; technological progress is not assumed to override every safety concern.',
'Party-led nationwide transformation is central, while mobilisation of local initiative occurs within unified political authority rather than sovereign regional independence.',
'Mao’s transformative account of social practice and class relations supports learned and institutional explanations; it does not establish genetic conclusions about national IQ or race.'
],`
B D E C A D B B E C D D D D B C
B E D B D D E E B B E E C B B D
D C D D E E D B D D E C D B D D
D C C D D C D D D C D C D B D C
D D E E B E C C D A D D D C E C
E B E D E B E C D C E D E C E D
A E A E A E A E A E A E A E A E
E B E C E B E B E B E C E B E C
A E B E B E C E A E A E B E B E
E A E A E B E A E B E B E A D B
E A E A E A E A E A E B E A E A
E A D B C C C B D C C B D D C B
D C E C E B D D D C C D C C E D
B E A E C E B E C E B E C E C E
E A E B E B E B D B E C D A E B
`, 'New Democracy permits private enterprise and coalition forms before later collectivisation; the US diplomatic memorandum notes tactical changes. These qualifications are retained, and modern technology and sexuality are explicitly inferred.');
add('trotskyism','Trotskyism','Socialist','Trotsky’s Transitional Programme, 1938; modern applications inferred',
'The revolutionary internationalist programme of the founding Fourth International, including workers’ control and anti-bureaucratic soviet democracy; not the behaviour of every later organisation.',
'A revolutionary Marxist tradition seeking workers’ power, democratic control of a planned economy and international socialist revolution.',
'Workers should replace capitalist rule with democratically accountable councils, social ownership and an internationally coordinated socialist transformation.',
['trotsky','trotsky-democracy','socialism-iep','socialism-sep'],[
'Soviet and workers’ democracy require accountability and competing working-class currents, while the revolutionary class framework does not promise equal electoral access to every capitalist party.',
'Workers’ mobilisation, speech and anti-bureaucratic scrutiny are protected; revolutionary defence remains compatible with some coercion against armed counter-revolution.',
'International class solidarity and opposition to national oppression favour cultural equality, without demanding that all communities remain separate from shared civic life.',
'International solidarity opposes exclusion of workers by national origin; the historical programme does not specify every modern visa or welfare-entitlement rule.',
'Imperialist wars are opposed while workers’ armed defence and revolutionary struggle are accepted; neither national military supremacy nor absolute pacifism follows.',
'International revolution and coordination are core; existing capitalist interstate institutions are not automatically legitimate vehicles for that internationalism.',
'Expropriation of major industries and banks under workers’ control favours social ownership rather than a general preference for private providers.',
'Planning and control over strategic capital are favoured without nationalist exclusion of international workers or an end to all foreign exchange.',
'Workers’ control, public credit and coordinated production replace market-led allocation; wage protection and needs take priority over unrestricted capital movement.',
'Employment, sliding wages, land reform and material guarantees support broad economic equality; modern taxation is an analogy to a programme primarily transforming ownership.',
'A secular socialist public order favours freedom of conscience and rejects religious authority over civil legislation.',
'Emancipation and opposition to social hierarchy support changing restrictive conventions; contemporary sexuality and identity answers are inferred, not direct historical declarations.',
'Productive and scientific development serve emancipatory goals; labour displacement and irreversible harms qualify automatic approval of every new technique.',
'Local councils and workers’ control matter within coordinated revolutionary institutions; accountability from below differs from unlimited regional sovereignty.',
'Class relations, education and social practice shape behaviour in this materialist account; temperament can still have biological components without supporting racial determinism.'
],`
D B E A C E D B D E A E A E A A
D D E E B A D D E E B D E E E B
B E B E D E B B C E E D B C E B
B E A E E D B B B E B B E A E D
B E B D C D D B E A D E B D D D
B C B D D C B D B D C E C D B D
A E A E A E B E A E B E B E B E
D C D D D C D C D C B D E C E D
B E B E B E C E A E B E D E B E
E A E A E B E A E A E B E A E B
E A E A E A E A E A E B E A E A
E A E B D B D C E B D B E C E B
D C E D D B D D C D C D C D E D
D D B D D C C D C E D D D D D D
E A E B E B E B D B E C D A E B
`, 'The programme supports pluralism among working-class currents and revolutionary coercion, a genuine institutional tension. Workers’ ownership need not mean unlimited personal dictatorship or private-market allocation.');
add('neoliberalism','Neoliberalism','Liberal','Hayek–Friedman–Buchanan school, 1947–1990s; modern applications inferred',
'Constitutional market liberalism in the Mont Pelerin tradition, with competition, limited democratic discretion and a modest welfare floor; not every government called neoliberal by critics.',
'A market liberal doctrine advocating private enterprise, competitive allocation, open exchange and constitutional restraints, with limited social protection.',
'Society should organise economic life around competitive markets and private enterprise, constrain arbitrary government power and maintain a limited safety net.',
['neoliberalism','mps','imf'],[
'Competitive democracy operates within constitutional limits protecting rights and stable rules; technical expertise is advisory rather than a substitute for all electoral accountability.',
'Individual liberty and predictable legal constraints oppose arbitrary surveillance and detention; targeted judicial measures against harm remain legitimate.',
'Voluntary cultural association is favoured, while common civic rules and reluctance to fund differentiated services qualify expansive state multicultural provision.',
'Labour mobility and skilled exchange are useful, but welfare eligibility and unlawful settlement are separate contested issues; Friedman’s welfare-state qualification matters.',
'Trade and cooperation are favoured, with defence and deterrence legitimate; the economic doctrine does not prescribe national military dominance or absolute pacifism.',
'Open international markets and negotiated rules are favoured, while constitutional limits and competition among jurisdictions qualify political federation.',
'Private providers and privatisation are generally preferred; genuinely necessary public goods or monopoly networks can justify narrower public ownership.',
'Trade barriers and favoured domestic suppliers distort competition; national security and unfair subsidies can qualify unrestricted foreign control.',
'Prices, investment and entry should generally follow competition; rules supporting competition differ from direction through compulsory national production plans.',
'A modest floor, sometimes through income supplements, can coexist with unequal rewards; large redistributive programmes and wealth taxes are generally disfavoured.',
'Civil law and freedom of conscience oppose ecclesiastical vetoes, while voluntary religion and some inherited public observances remain compatible with limited government.',
'Individual choice and legal equality generally qualify enforced traditions, while proponents differ over conservative personal and social norms.',
'Innovation and competitive experimentation are favoured; evidence of external harms and irreversible risk can justify proportionate safety rules.',
'Jurisdictional competition and local knowledge favour decentralisation, with national rules for stable law and responses to cross-regional emergencies.',
'Incentives, learning and institutional settings explain much behaviour; acceptance of unequal outcomes is not a demonstrated genetic claim about national IQ or racial crime.'
],`
E B E A E E E A A C A E A C A A
E D D E A A D D E E B D E E D A
B C B E D D B A C D D B B C D C
D D C E D B C D D E D D D A B C
C D D D C C C B D A D D C D D C
D C D D E C D D C D D D D E D D
E B E A E C E B E B E B E B E B
A E A E B E A E B E C E C E D E
E A E A E B E A E B E B E B E A
B D D E C E B D B E C E D D B D
E A E A E A E A D B D C E B E B
D B D C D C D C D C C C D D D C
D C D D E B D D D C D D C C E D
E B C B E B E B E B D C D B D D
C B D C D C D C C C D D C B D C
`, 'A constitutional market order is not identical to anarcho-capitalism. The IMF indexed critique was used only for capital-flow and inequality caveats; the full blocked article is not claimed to have been read.');
for(const file of fs.readdirSync(new URL('.',import.meta.url)).filter(x=>/^batch\d+\.mjs$/.test(x)).sort())(await import('./'+file)).default(add);
fs.writeFileSync(new URL('subjects.json',import.meta.url),JSON.stringify(subjects,null,2)+'\n');
