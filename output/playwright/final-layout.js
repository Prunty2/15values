async page => {
 await page.reload();
 const base='http://127.0.0.1:4188/political-quiz/';
 const results=[];
 for(const width of [320,390]){
  await page.setViewportSize({width,height:844});
  await page.goto(base+'#/ideologies/christian-accelerationism');
  const heading=page.getByRole('heading',{level:1,name:'Christian Accelerationism'});
  await heading.waitFor();
  await page.evaluate(()=>document.fonts.ready);
  const wordRects=await heading.evaluate(el=>{
   const text=el.firstChild,range=document.createRange();
   const start=text.textContent.indexOf('Accelerationism');
   range.setStart(text,start);range.setEnd(text,start+'Accelerationism'.length);
   return range.getClientRects().length;
  });
  if(wordRects!==1)throw Error('Accelerationism breaks mid-word at '+width);
  await page.screenshot({path:'output/playwright/christian-accelerationism-'+width+'.png',fullPage:true});
  results.push({width,wordRects});
 }
 await page.goto(base+'profiles/ideology-review.html#christian-accelerationism');
 await page.waitForFunction(()=>document.getElementById('status').textContent.includes('240 of 240'));
 const count=await page.locator('select#ideology option').count();
 if(count!==54)throw Error('Review catalogue has '+count);
 if(await page.locator('#answers article').count()!==240)throw Error('Review does not show 240');
 if(!await page.locator('#scope').textContent().then(text=>text.includes('Peter Thiel is a contextual reference')))throw Error('Missing owner-defined scope');
 await page.goto(base+'#/credits');
 await page.getByRole('heading',{level:1,name:'Image credits'}).waitFor();
 return {results,reviewProfiles:count,reviewAnswers:240,creditsLoaded:true};
}
