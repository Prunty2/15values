// Country most associated with the person’s public career and reputation, not birthplace.
// Zohran Mamdani uses Uganda at the owner’s explicit request.
// Historical states use present-day country flags; Soviet leaders are grouped under Russia.
// Cross-border careers are editorial choices: Hayek → UK, Rousseau → France, Burke → UK.
// Requested batch: historical associations follow the existing present-day flag convention.
// Alexander → Macedon/Greece; Hannibal → Carthage/Tunisia; Saladin → Egypt; Charlemagne → Francia/France.
const countryProfiles: [string, string, readonly string[]][] = [
  ["Saudi Arabia","🇸🇦",["mohammed-bin-salman"]],
  ["Sweden","🇸🇪",["greta-thunberg"]],
  ["Greece","🇬🇷",["alexander-the-great"]],
  ["Mongolia","🇲🇳",["genghis-khan"]],
  ["Tunisia","🇹🇳",["hannibal-barca"]],
  ["Egypt","🇪🇬",["saladin"]],
  ["Austria","🇦🇹",["ludwig-von-mises","engelbert-dollfuss"]],
  ["Spain","🇪🇸",["pedro-sanchez","francisco-franco","jose-antonio-primo-de-rivera"]],
  ["Portugal","🇵🇹",["antonio-de-oliveira-salazar"]],

  ['Australia', '🇦🇺', ['anthony-albanese', 'pauline-hanson', 'gough-whitlam', 'bob-hawke', 'paul-keating', 'john-howard', 'matt-canavan', 'angus-taylor', 'robert-menzies', 'scott-morrison', 'tony-abbott', 'joh-bjelke-petersen', 'julia-gillard', 'kevin-rudd', 'malcolm-turnbull', 'adam-bandt', 'david-shoebridge', 'allegra-spender', 'zali-steggall', 'thomas-sewell', 'eric-campbell', 'john-curtin', 'malcolm-fraser']],
  ['Uganda', '🇺🇬', ['zohran-mamdani']],
  ['United Kingdom', '🇬🇧', ['andy-burnham', 'john-locke', 'john-maynard-keynes', 'john-stuart-mill', 'margaret-thatcher', 'nigel-farage', 'rupert-lowe', 'thomas-hobbes', 'winston-churchill', 'clement-attlee', 'tony-blair', 'jeremy-corbyn', 'adam-smith', 'mary-wollstonecraft', 'rishi-sunak', 'keir-starmer', 'liz-truss', 'theresa-may', 'boris-johnson', 'edmund-burke', 'friedrich-hayek', 'oswald-mosley', 'oliver-cromwell']],
  ['United States', '🇺🇸', ['rupert-murdoch', 'jeff-bezos', 'bill-gates', 'mark-zuckerberg', 'barack-obama', 'bernie-sanders', 'donald-trump', 'franklin-d-roosevelt', 'jd-vance', 'john-rawls', 'kamala-harris', 'marco-rubio', 'milton-friedman', 'ronald-reagan', 'joe-biden', 'abraham-lincoln', 'john-f-kennedy', 'richard-nixon', 'george-washington', 'thomas-jefferson', 'theodore-roosevelt', 'lyndon-b-johnson', 'jimmy-carter', 'george-w-bush', 'hillary-clinton', 'harry-s-truman', 'dwight-d-eisenhower', 'robert-f-kennedy', 'nancy-pelosi', 'alexandria-ocasio-cortez', 'martin-luther-king-jr', 'frederick-douglass', 'peter-thiel', 'elon-musk', 'ayn-rand', 'charlie-kirk', 'thomas-rousseau', 'woodrow-wilson', 'george-h-w-bush']],
  ['Germany', '🇩🇪', ['angela-merkel', 'karl-marx', 'adolf-hitler', 'rosa-luxemburg', 'olaf-scholz', 'friedrich-ebert', 'otto-von-bismarck', 'alice-weidel', 'heinrich-himmler', 'ernst-rohm', 'frederick-the-great']],
  ['Poland', '🇵🇱', ['dominik-tarczynski']],
  ['Serbia', '🇷🇸', ['josip-broz-tito']],
  ['Zimbabwe', '🇿🇼', ['ian-smith', 'robert-mugabe']],
  ['Italy', '🇮🇹', ['benito-mussolini', 'giovanni-gentile', 'giorgia-meloni', 'giuseppe-garibaldi', 'julius-caesar', 'augustus']],
  ['China', '🇨🇳', ['mao-zedong', 'xi-jinping', 'deng-xiaoping']],
  ['South Africa', '🇿🇦', ['nelson-mandela', 'julius-malema', 'helen-zille', 'constand-viljoen']],
  ['Russia', '🇷🇺', ['vladimir-putin', 'mikhail-bakunin', 'vladimir-lenin', 'mikhail-gorbachev', 'joseph-stalin', 'leon-trotsky', 'peter-the-great']],
  ['India', '🇮🇳', ['mahatma-gandhi', 'jawaharlal-nehru', 'narendra-modi', 'indira-gandhi']],
  ['Singapore', '🇸🇬', ['lee-kuan-yew']],
  ['France', '🇫🇷', ['charles-de-gaulle', 'emmanuel-macron', 'jean-jacques-rousseau', 'joseph-de-maistre', 'napoleon-bonaparte', 'charlemagne']],
  ['Cuba', '🇨🇺', ['fidel-castro']],
  ['Brazil', '🇧🇷', ['lula-da-silva']],
  ['Argentina', '🇦🇷', ['javier-milei']],
  ['New Zealand', '🇳🇿', ['jacinda-ardern']],
  ['Canada', '🇨🇦', ['justin-trudeau', 'mark-carney']],
  ['Vietnam', '🇻🇳', ['ho-chi-minh']],
  ['Chile', '🇨🇱', ['salvador-allende', 'augusto-pinochet']],
  ['Türkiye', '🇹🇷', ['recep-tayyip-erdogan']],
  ['Iran', '🇮🇷', ['ruhollah-khomeini']],
  ['Ukraine', '🇺🇦', ['volodymyr-zelenskyy']],
  ['North Korea', '🇰🇵', ['kim-jong-un', 'kim-il-sung']],
  ['Israel', '🇮🇱', ['benjamin-netanyahu']],
  ['Venezuela', '🇻🇪', ['hugo-chavez', 'simon-bolivar']],
];

export function personalityFlag(id: string) {
  const country = countryProfiles.find(([, , ids]) => ids.includes(id));
  return country ? { name: country[0], emoji: country[1] } : undefined;
}
