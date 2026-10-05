import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const report=path.dirname(new URL(import.meta.url).pathname);
const root=path.resolve(report,'../../..');
const specs=JSON.parse(fs.readFileSync(path.join(report,'subjects.json'),'utf8'));
for(const spec of specs){
 const archive=path.join(root,'profile-audit/answers/ideology',spec.id,'1.json');
 if(fs.existsSync(archive)){console.log('Already archived '+spec.id);continue;}
 for(const command of ['validate','archive']){
  const result=spawnSync(process.execPath,['--experimental-strip-types','scripts/profiles.ts',command,'ideology',spec.id],{cwd:path.join(root,'frontend'),encoding:'utf8'});
  fs.writeFileSync(path.join(report,spec.id+'-'+command+'.log'),result.stdout+result.stderr);
  if(result.status!==0)throw Error(spec.id+' '+command+' failed: '+result.stderr);
 }
 console.log('Validated and archived '+spec.id+' revision 1');
}
