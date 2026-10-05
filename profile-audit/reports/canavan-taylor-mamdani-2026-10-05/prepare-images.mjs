import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const dir='profile-audit/reports/canavan-taylor-mamdani-2026-10-05';
const files={ 'matt-canavan':'Matt Canavan.jpg', 'angus-taylor':'Angus Taylor 2015 b.jpg', 'zohran-mamdani':'New York State Assemblymember Zohran Mamdani.jpg' };
const strip=x=>String(x??'').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const images={};
for(const [id,file] of Object.entries(files)) {
 const url='https://commons.wikimedia.org/w/api.php?action=query&titles='+encodeURIComponent('File:'+file)+'&prop=imageinfo&iiprop=url|extmetadata&format=json';
 const r=await fetch(url,{signal:AbortSignal.timeout(30000)}); if(!r.ok)throw Error('Commons '+r.status);
 const data=await r.json(), m=Object.values(data.query.pages)[0].imageinfo[0];
 fs.writeFileSync(`${dir}/${id}-commons.json`,JSON.stringify(m,null,2));
 const page=await fetch(m.descriptionurl);if(!page.ok)throw Error('File page '+page.status);fs.writeFileSync(`${dir}/${id}-commons.html`,await page.text());
 const raw=await fetch(m.url,{signal:AbortSignal.timeout(30000)});if(!raw.ok)throw Error('Image '+raw.status);
 const tmp=`${dir}/${id}-raw.jpg`,dest=`frontend/public/profiles/images/${id}-r1.jpg`;
 if(fs.existsSync(dest))throw Error('Refuse image overwrite');
 fs.writeFileSync(tmp,Buffer.from(await raw.arrayBuffer()));
 execFileSync('/usr/bin/sips',['-s','format','jpeg','-s','formatOptions','80','-Z','800',tmp,'--out',dest]);fs.unlinkSync(tmp);
 if(fs.statSync(dest).size>1000000)throw Error('Large image');
 const e=m.extmetadata; images[id]={path:`profiles/images/${id}-r1.jpg`,alt:`Portrait of ${id==='matt-canavan'?'Matt Canavan':id==='angus-taylor'?'Angus Taylor':'Zohran Mamdani'}`,sourceUrl:m.descriptionurl,creator:strip(e.Artist.value),license:e.LicenseShortName.value,licenseUrl:e.LicenseUrl.value};
 console.log(id,images[id]);
}
fs.writeFileSync(`${dir}/images.json`,JSON.stringify(images,null,2));
