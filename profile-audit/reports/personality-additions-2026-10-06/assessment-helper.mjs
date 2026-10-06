import fs from 'node:fs';
export const dir='profile-audit/reports/personality-additions-2026-10-06';
export const source=(title,url,publisher,date='undated')=>({title,url,publisher,date});
export function save({id,name,period,lifespan,role,description,rows,sources,catalogue='personality',phrase,religion}){
 if(rows.length!==15)throw Error(id+' axis count');
 const axes=rows.map(([values,brief,counterEvidence,refs,qualifications={}])=>{if(values.length!==16||values.some(v=>![-2,-1,0,1,2].includes(v)))throw Error(id+' answers');return {values,brief,counterEvidence,refs,qualifications}});
 fs.writeFileSync(`${dir}/${id}-spec.json`,JSON.stringify({id,name,catalogue,period,lifespan,role,description,axes,sources,phrase,religion},null,2)+'\n');
}
