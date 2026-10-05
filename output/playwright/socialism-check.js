async page => {
 const base='http://127.0.0.1:4188/political-quiz/';
 const checks=[];
 await page.reload();
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:1000});
  await page.goto(base+'#/ideologies');
  await page.getByRole('heading',{level:1,name:'Political ideologies'}).waitFor();
  const farLeft=page.getByRole('region',{name:'Far-Left',exact:true});
  for(const name of ['Socialism','Democratic Socialism']){
   if(!await farLeft.getByRole('link',{name,exact:true}).isVisible())throw Error(name+' is not Far-Left');
  }
  const search=page.getByRole('searchbox',{name:'Search ideologies'});
  await search.fill('Socialism');
  await page.getByRole('link',{name:'Socialism',exact:true}).click();
  await page.getByRole('heading',{level:1,name:'Socialism',exact:true}).waitFor();
  if(await page.locator('main article[aria-label]').count()!==15)throw Error('Missing axis rows');
  if(!await page.getByRole('region',{name:'Provisional assessment'}).isVisible())throw Error('Missing estimates notice');
  await page.getByText('Sources and assessment',{exact:true}).click();
  const downloadPromise=page.waitForEvent('download');
  await page.getByRole('link',{name:'Download the full assessment',exact:true}).click();
  const download=await downloadPromise;
  if(download.suggestedFilename()!=='socialism-audit-r1.json')throw Error('Bad download filename');
  await download.saveAs('output/playwright/socialism-'+width+'.json');
  const response=await page.request.get(base+'profiles/audits/ideology/socialism/1.json');
  const audit=await response.json();
  if(audit.axes.flatMap(a=>a.answers).length!==240)throw Error('Incomplete assessment');
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('Overflow');
  await page.screenshot({path:'output/playwright/socialism-'+width+'.png',fullPage:true});
  checks.push({width,axes:15,answers:240,revision:1,bothProfilesInFarLeft:true,download:download.suggestedFilename()});
 }
 await page.goto(base+'profiles/ideology-review.html#socialism');
 await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Socialism · revision 1 · 240 of 240'));
 if(await page.locator('#answers article').count()!==240)throw Error('Review incomplete');
 return {checks,reviewAnswers:240};
}
