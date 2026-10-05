import fs from 'node:fs';
const dir='profile-audit/reports/main-personalities-2026-10-05';
const titles=['Clement Attlee','Tony Blair','Jeremy Corbyn','Joe Biden','Abraham Lincoln','John F. Kennedy','Richard Nixon','Gough Whitlam','Bob Hawke','Paul Keating','John Howard','Mahatma Gandhi','Jawaharlal Nehru','Narendra Modi','Lee Kuan Yew','Deng Xiaoping','Charles de Gaulle','Emmanuel Macron','Fidel Castro','Luiz Inácio Lula da Silva','Javier Milei','Vladimir Lenin','Adam Smith','Mary Wollstonecraft','Ayn Rand'];
const ids=JSON.parse(fs.readFileSync(dir+'/subjects.json'));
async function get(url){const r=await fetch(url,{headers:{'User-Agent':'15ValuesAssessment/1.0 (research and image attribution)'},signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(r.status+' '+url);return r.json()}
for(let i=0;i<ids.length;i++){
if(fs.existsSync(dir+'/'+ids[i]+'-commons.json'))continue;
await new Promise(r=>setTimeout(r,15000));
try{const title=titles[i];const wiki=await get('https://en.wikipedia.org/w/api.php?action=query&titles='+encodeURIComponent(title)+'&prop=extracts|pageimages&explaintext=1&piprop=original&format=json');const p=Object.values(wiki.query.pages)[0];fs.writeFileSync(dir+'/'+ids[i]+'-wikipedia.txt',p.extract);const filename=decodeURIComponent(new URL(p.original.source).pathname.split('/').at(-1));
const cm=await get('https://commons.wikimedia.org/w/api.php?action=query&titles='+encodeURIComponent('File:'+filename)+'&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=800&format=json');const cp=Object.values(cm.query.pages)[0];const ii=cp.imageinfo?.[0];if(!ii)throw Error('No Commons metadata '+filename);fs.writeFileSync(dir+'/'+ids[i]+'-commons.json',JSON.stringify({title:'File:'+filename,...ii},null,2));
const filePage=await fetch(ii.descriptionurl,{signal:AbortSignal.timeout(30000)});fs.writeFileSync(dir+'/'+ids[i]+'-commons.html',await filePage.text());console.log(ids[i],filename,ii.extmetadata.Artist?.value,ii.extmetadata.LicenseShortName?.value,ii.extmetadata.LicenseUrl?.value);
}catch(e){console.log('ERROR',ids[i],String(e))}
}
