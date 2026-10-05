import fs from 'node:fs';
const subjects=[{
id:'socialism',name:'Socialism',category:'Socialist',period:'Contemporary social-ownership ideal; philosophical literature through 2024',
scope:'An economic-core socialist ideal of social and worker control of productive assets, equality and solidarity, illustrated through pluralist participatory institutions. Both market and planned allocation can be socialist. This umbrella entry is not a claim that every socialist school shares one political, religious or cultural programme; Democratic Socialism separately profiles a specific contemporary US organisation.',
description:'A social-ownership tradition seeking collective and worker control of productive resources, material equality and solidarity, with several possible forms of economic coordination.',
phrase:'Society should place productive resources under social and worker control so that economic life serves shared needs, material equality and collective self-determination.',
sources:['socialism-sep','socialism-iep','social-democratic-principles'],
briefs:[
'Social control requires meaningful participation by those affected; the selected pluralist application favours competitive public accountability and workplace democracy rather than trade-union leaders simply replacing the electorate.',
'Freedom from domination and the ability to organise require civil liberties, while solidarity permits proportionate health and safety rules subject to independent legal safeguards.',
'Equal standing and opposition to inherited hierarchy favour cultural inclusion, with common civic participation and equal legal rules rather than an exemption for every distinct practice.',
'Solidarity across working populations supports migration and protection, while housing, service capacity and secure labour rights qualify an unconditional settlement guarantee.',
'Opposition to domination and costly conflict favours diplomacy and disarmament; collective defence and protecting people from aggression remain possible in this pluralist application.',
'Cross-border solidarity supports cooperation, while unaccountable international economic institutions must not displace democratic control of shared resources.',
'Social and worker control of productive assets is central. Public essential services and strategic ownership are plausible institutions, but cooperative social ownership is not equivalent to state ownership and the binary bank cannot fully represent it.',
'Exchange can serve collective needs, with labour protections and strategic capacity qualifying both blanket protectionism and unrestricted foreign control of productive assets.',
'Participatory investment and socially accountable production are central, but market socialism permits prices, consumer choice and independent cooperative entry; public coordination need not entail compulsory quotas for every enterprise.',
'Material equality and solidarity favour progressive contribution, strong income guarantees and redistribution of concentrated wealth; differences in individual choices can justify some differences in outcomes.',
'The selected pluralist institutions use civil legal reasons and equal freedom of conscience; religious socialist traditions exist, so personal religious motivation is not treated as a prohibition on socialism.',
'Equal self-development supports revisable customs, diverse families and opposition to imposed gender hierarchies; these are pluralist applications rather than universal positions of every socialist school.',
'Productive development and liberation from burdensome work favour useful science, while social consent, ecological harms and irreversible medical risks qualify speed alone as a decision rule.',
'Participatory local and workplace control coexist with national guarantees and coordinated investment; concentrating all decision power in a state can undermine social power rather than establish socialism.',
'Social institutions and unequal opportunities help explain behaviour and development; socialist social theory is not empirical proof that all psychological traits lack inherited components or that racial premises are valid.'
],
rows:`
E A E A E E E A A D A E A D A A
E D E E C B D D E E B D E E B A
B E B E D E B B C E E C B C E B
C D B E E C C D C D C C E B D C
B E B D D B D A E A B E B E B E
C D C E D D C E C D D E C E C E
A E A E A E B E A E B E B E B E
D C D D D B D D D C C E E C E D
D D D E D E D E B E A E D D C D
E A E A E B E A E A E B E A E B
E A E A E A E A D B D C E B E B
E B E B E C D C E B D B E D E B
C D C E D D C E C E C E B E D E
E C D C E B D C D E E E E D E E
E B D C D C E B D B E C D B E B
`.trim().split('\n'),
limits:'The encyclopedias explicitly distinguish socialist variants, social ownership from statism, and planning from market socialism. The Socialist International declaration supports one pluralist application, not every socialist school. The bank cannot represent worker cooperatives separately from private or state ownership. Non-economic policies and exact five-point intensities are provisional applications, not defining tests of membership in the socialist tradition.'
}];
fs.writeFileSync(new URL('subjects.json',import.meta.url),JSON.stringify(subjects,null,2)+'\n');
