import fs from 'node:fs';import {execFileSync} from 'node:child_process';
const dir='profile-audit/reports/personality-additions-second-2026-10-06';
const fields=JSON.parse(fs.readFileSync(dir+'/image-fields.json'));
const creators={'robert-mugabe':'Press Service of the President of Russia / Kremlin.ru','joseph-de-maistre':'Carl Christian Vogel von Vogelstein','antonio-de-oliveira-salazar':'Manuel Alves de San Payo','ernst-rohm':'Uncredited photographer; National Archives and Records Administration, record 162122137','oswald-mosley':'Uncredited photographer; Liverpool Daily Post, 23 October 1934'};
const images={};
for(const c of JSON.parse(fs.readFileSync(dir+'/portrait-candidates.json'))){
 const output='frontend/public/profiles/images/'+c.id+'-r1.jpg';
 if(!fs.existsSync(output)){
 const url=new URL(c.original.replaceAll('&amp;','&'));url.search='';const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(c.id+' '+r.status);
 const raw=dir+'/'+c.id+'-raw';fs.writeFileSync(raw,Buffer.from(await r.arrayBuffer()));
 execFileSync('/usr/bin/sips',['-s','format','jpeg','-s','formatOptions','80','-Z','800',raw,'--out',output],{stdio:'ignore'});fs.unlinkSync(raw);}
 if(fs.statSync(output).size>1e6)throw Error(c.id+' oversized');const f=fields[c.id];
 images[c.id]={path:'profiles/images/'+c.id+'-r1.jpg',alt:'Portrait of '+c.name,sourceUrl:c.sourceUrl,creator:creators[c.id]??f.author?.replaceAll('Unknown authorUnknown author','Unknown photographer'),license:f.license==='PDM'?'Public domain':f.license,licenseUrl:f.licenseUrl??'https://creativecommons.org/publicdomain/mark/1.0/'};
 if(!images[c.id].creator)throw Error(c.id+' missing creator');console.log(c.id,fs.statSync(output).size);
}
fs.writeFileSync(dir+'/images.json',JSON.stringify(images,null,2)+'\n');
