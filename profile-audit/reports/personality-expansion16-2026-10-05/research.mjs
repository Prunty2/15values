import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
export const dir='profile-audit/reports/personality-expansion16-2026-10-05';
export const subjects=[
 ['robert-menzies','Robert Menzies','1894–1978','1949–1966','Australian prime minister','Liberal conservative'],
 ['tony-abbott','Tony Abbott','1957–present','2009–5 October 2026','Former Australian prime minister','Liberal conservative'],
 ['scott-morrison','Scott Morrison','1968–present','2013–2022','Former Australian prime minister','Liberal conservative'],
 ['liz-truss','Liz Truss','1975–present','2019–2022','Former UK prime minister','Free-market conservative'],
 ['theresa-may','Theresa May','1956–present','2010–2019','Former UK prime minister and home secretary','One-nation conservative'],
 ['harry-s-truman','Harry S. Truman','1884–1972','1945–1953','US president','New Deal liberal'],
 ['dwight-d-eisenhower','Dwight D. Eisenhower','1890–1969','1953–1961','US president','Moderate Republican'],
 ['robert-f-kennedy','Robert F. Kennedy','1925–1968','1961–1968; emphasis on 1968 campaign','US attorney general, senator and presidential candidate','Liberal Democrat'],
 ['nancy-pelosi','Nancy Pelosi','1940–present','2007–5 October 2026','US representative and former House speaker','Liberal Democrat'],
 ['alexandria-ocasio-cortez','Alexandria Ocasio-Cortez','1989–present','2019–5 October 2026','US representative','Democratic socialist'],
 ['volodymyr-zelenskyy','Volodymyr Zelenskyy','1978–present','2019–5 October 2026; peace and wartime presidency','Ukrainian president','Liberal reformer and wartime leader'],
 ['kim-jong-un','Kim Jong Un','1984–present (birth year disputed)','2011–5 October 2026','North Korean leader','Juche and state socialism'],
 ['benjamin-netanyahu','Benjamin Netanyahu','1949–present','2009–5 October 2026','Israeli prime minister','National conservative'],
 ['hugo-chavez','Hugo Chávez','1954–2013','1999–2013','Venezuelan president','Bolivarian socialist'],
 ['martin-luther-king-jr','Martin Luther King Jr.','1929–1968','1955–1968; emphasis on final economic and antiwar programme','US civil-rights leader and Baptist minister','Civil-rights and social-gospel reformer'],
 ['frederick-douglass','Frederick Douglass','1818–1895','1845–1895','US abolitionist, writer and civil-rights advocate','Abolitionist and equal-rights Republican'],
];
const strip=x=>String(x??'').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const get=async url=>{for(let i=0;i<5;i++){const r=await fetch(url,{signal:AbortSignal.timeout(60000)});if(r.ok)return r;if(r.status===429){await new Promise(resolve=>setTimeout(resolve,15000*(i+1)));continue;}throw Error(`${r.status} ${url}`)}throw Error('Rate limit '+url)};
if(process.argv.includes('--fetch')){
 const images=fs.existsSync(`${dir}/images.json`)?JSON.parse(fs.readFileSync(`${dir}/images.json`)):{};
 for(const [id,name] of subjects){
  if(images[id])continue;
  await new Promise(r=>setTimeout(r,4000));
  const wiki='https://en.wikipedia.org/w/api.php?action=query&titles='+encodeURIComponent(name==='Martin Luther King Jr.'?'Martin Luther King Jr.':name)+'&prop=extracts|pageimages&explaintext=1&piprop=original&format=json&redirects=1';
  const data=await(await get(wiki)).json(),p=Object.values(data.query.pages)[0];
  fs.writeFileSync(`${dir}/${id}-wikipedia.txt`,p.extract);fs.writeFileSync(`${dir}/${id}-wikipedia.json`,JSON.stringify(p,null,2));
  let file=decodeURIComponent(new URL(p.original.source).pathname.split('/').at(-1));
  const api='https://commons.wikimedia.org/w/api.php?action=query&titles='+encodeURIComponent('File:'+file)+'&prop=imageinfo&iiprop=url|extmetadata&format=json';
  const info=await(await get(api)).json(),m=Object.values(info.query.pages)[0].imageinfo?.[0];
  if(!m)throw Error(`${id}: no Commons imageinfo for ${file}`);
  fs.writeFileSync(`${dir}/${id}-commons.json`,JSON.stringify(m,null,2));
  fs.writeFileSync(`${dir}/${id}-commons.html`,await(await get(m.descriptionurl)).text());
  const tmp=`${dir}/${id}-raw`,dest=`frontend/public/profiles/images/${id}-r1.jpg`;
  if(fs.existsSync(dest))throw Error('Refuse overwrite '+dest);
  fs.writeFileSync(tmp,Buffer.from(await(await get(m.url)).arrayBuffer()));
  execFileSync('/usr/bin/sips',['-s','format','jpeg','-s','formatOptions','80','-Z','800',tmp,'--out',dest]);fs.unlinkSync(tmp);
  if(fs.statSync(dest).size>1000000)throw Error('Large image');
  const e=m.extmetadata;images[id]={path:`profiles/images/${id}-r1.jpg`,alt:`Portrait of ${name}`,sourceUrl:m.descriptionurl,creator:strip(e.Artist?.value),license:e.LicenseShortName?.value,licenseUrl:e.LicenseUrl?.value||'https://creativecommons.org/publicdomain/mark/1.0/'};
  fs.writeFileSync(`${dir}/images.json`,JSON.stringify(images,null,2));console.log(id,JSON.stringify(images[id]));
 }
}
