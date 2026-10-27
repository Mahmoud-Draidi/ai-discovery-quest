const {earlierHome,earlierCourse,earlierGuide}=require('./qa-earlier-navigation.cjs');
const path=require('node:path'),assert=require('node:assert/strict');
const {_electron}=require(process.env.QUEST_PLAYWRIGHT||'playwright');
const root=path.resolve(__dirname,'..'),data=path.join(root,'test-results','practice-guides-'+Date.now());
async function run(){let app;try{
 app=await _electron.launch({executablePath:require('electron'),args:[root],cwd:root,env:{...process.env,QUEST_TEST_MODE:'1',QUEST_TEST_SHOW:'1',QUEST_TEST_DATA:data}});
 const page=await app.firstWindow(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:1240,height:950});
 await page.locator('#profile-skip').click();await earlierHome(page);await earlierCourse(page);
 const ids=await page.evaluate(()=>learningOrder());let count=0;
 for(const id of ids){
  if(id==='foundation')await page.locator('[data-action="start"]').first().click();else if(id==='context')await page.locator('[data-action="context"]').first().click();else await page.locator(`[data-chapter="${id}"]`).first().click();
  const attr=id==='foundation'?'data-tab':id==='context'?'data-context-tab':'data-chapter-tab';await page.locator(`[${attr}="practice"]`).click();
  const total=await page.evaluate(()=>exerciseTotal());
  for(let index=0;index<total;index++){
   assert.equal(await page.locator('.exercise-brief').count(),1,`${id}:${index} inputs`);
   assert.equal(await page.locator('.exercise-roles').count(),0);
   assert.equal(await page.locator('.practice-preparation[open]').count(),0);
   assert.equal(await page.locator('.context-step button:visible').filter({hasText:/^Copy message$/}).count()>=1,id==='orientation'&&index===0?false:true);
   await page.locator('[data-action="exercise-help"]').click();assert.equal(await page.locator('.exercise-help').getAttribute('open'),'');
   assert.match(await page.locator('.exercise-help').innerText(),/What might go wrong/);
   if(id==='foundation'&&index===0){assert.equal(await page.locator('.practice-example[open]').count(),0);assert.equal(await page.locator('[data-action="copy-exercise-input"]').count(),0);await page.locator('[data-action="copy-prompt"]').click();const copied=await app.evaluate(({clipboard})=>clipboard.readText());assert.match(copied,/Explain a model/);await page.locator('.context-step').screenshot({path:path.join(data,'simple-first-practice.png')});}
   if(id==='artifacts'&&index===1){
    assert.match(await page.locator('.practice-help').first().innerText(),/2.*3/);
    await page.locator('.context-step').screenshot({path:path.join(data,'spreadsheet-guidance.png')});
   }
   if(index<total-1)await page.locator('[data-action="exercise-next"]').click();count++;
  }
  await page.locator('[data-action="exercise-unavailable"]').click();
  assert.match(await page.locator('.exercise-controls').innerText(),/Unavailable on your account/);
  await page.locator('.exercise-observation > summary').click();await page.locator('#exercise-evidence').fill(`Private ${id} observation <not markup>`);
  assert.equal(await page.locator('#exercise-evidence').evaluate(el=>el===document.activeElement),true);
  if(id==='foundation'){
   const ready=app.waitForEvent('window');await page.getByRole('button',{name:'Open compact companion',exact:true}).click();const companion=await ready;await companion.locator('#expected').waitFor();
   assert.equal(await companion.locator('#expected').innerText(),await page.evaluate(()=>practiceGuide(activeChapterId(),exerciseValue().step).expected));
   await companion.locator('details > summary').first().click();
   assert.equal(await companion.locator('#materials').innerText(),await page.evaluate(()=>practiceGuide(activeChapterId(),exerciseValue().step).materials));await companion.close();
  }
  await page.reload();await earlierHome(page);await page.locator('[data-action="resume"]').click();
  assert.equal(await page.locator('#exercise-evidence').inputValue(),`Private ${id} observation <not markup>`);
  assert.match(await page.locator('.exercise-controls').innerText(),/Unavailable on your account/);
  await page.locator('[data-action="exercise-done"]').click();assert.equal(await page.evaluate(()=>exerciseValue().stepReasons[exerciseValue().step+1]),undefined);
  await earlierCourse(page);
 }
 assert.equal(count,60);assert.deepEqual(errors,[]);
 await page.locator('[data-action="start"]').first().click();await page.locator('[data-tab="practice"]').click();await page.setViewportSize({width:620,height:900});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.screenshot({path:path.join(data,'practice-narrow.png'),fullPage:true});
 console.log('PASS: guidance rendered for all 60 chapter exercises; help, unavailable reasons, observations/reload, clearing unavailable on Done, companion input/result sync and narrow layout.\nScreenshots: '+data);
}finally{await app?.close();}}
run().catch(e=>{console.error(e);process.exitCode=1;});
