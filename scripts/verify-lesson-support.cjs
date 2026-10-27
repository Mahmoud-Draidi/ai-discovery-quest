const {earlierHome,earlierCourse,earlierGuide}=require('./qa-earlier-navigation.cjs');
const path=require('node:path'),assert=require('node:assert/strict');
const {_electron}=require(process.env.QUEST_PLAYWRIGHT||'playwright');
const root=path.resolve(__dirname,'..'),data=path.join(root,'test-results','lesson-support-'+Date.now());
async function run(){let app;try{
 app=await _electron.launch({executablePath:require('electron'),args:[root],cwd:root,env:{...process.env,QUEST_TEST_MODE:'1',QUEST_TEST_SHOW:'1',QUEST_TEST_DATA:data}});
 const page=await app.firstWindow(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:1240,height:950});await page.emulateMedia({reducedMotion:'reduce'});
 await page.locator('#profile-skip').click();await earlierHome(page);await earlierCourse(page);await page.locator('[data-chapter="coding"]').first().click();
 const term=page.locator('.term-link[data-define="repository"]').first();await term.scrollIntoViewIfNeeded();await term.focus();const position=await page.evaluate(()=>scrollY),before=await page.evaluate(()=>JSON.stringify(state));await term.click();
 await page.locator('#glossary-dialog').waitFor({state:'visible'});assert.match(await page.locator('#glossary-definition').innerText(),/Repository/);
 await page.locator('#glossary-search').fill('staging');await page.locator('#glossary-results [data-define="staging"]').click();assert.match(await page.locator('#glossary-definition').innerText(),/exact file content/);
 await page.screenshot({path:path.join(data,'glossary.png')});await page.keyboard.press('Escape');
 assert.equal(await page.locator('#glossary-dialog').isVisible(),false);assert.equal(await page.evaluate(()=>scrollY),position);assert.equal(await term.evaluate(el=>document.activeElement===el),true);assert.equal(await page.evaluate(()=>JSON.stringify(state)),before);
 await page.locator('.git-walkthrough > summary').click();await page.locator('[data-git-stage="1"]').click();assert.match(await page.locator('#git-example-detail').innerText(),/Staging has not made a commit/);
 await page.locator('[data-git-stage="4"]').click();assert.match(await page.locator('#git-example-detail').innerText(),/Exercise branch updated; base unchanged/);
 await page.locator('[data-git-stage="5"]').click();assert.match(await page.locator('#git-example-detail').innerText(),/Draft PR open; base unchanged/);
 assert.equal(await page.locator('.git-walkthrough .practice-help').count(),7);assert.equal(await page.evaluate(()=>JSON.stringify(state)),before);
 await page.screenshot({path:path.join(data,'git-walkthrough.png'),fullPage:true});
 await page.locator('[data-chapter-tab="practice"]').click();assert.equal(await page.locator('.git-walkthrough').count(),1);
 await earlierCourse(page);await page.locator('[data-chapter="memory"]').first().click();await page.locator('.memory-comparison > summary').click();assert.equal(await page.locator('.memory-comparison article').count(),5);
 await page.setViewportSize({width:620,height:900});await page.locator('[data-open-glossary]').click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 const bounds=await page.locator('#glossary-dialog').boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=620);await page.screenshot({path:path.join(data,'glossary-narrow.png')});
 await page.locator('[data-close-glossary]').click();await page.locator('[data-chapter-tab="notes"]').click();await page.locator('#course-note').fill('A supplied record is not proof of automatic memory.');await page.locator('[data-open-glossary]').click();await page.locator('[data-close-glossary]').click();assert.equal(await page.locator('#course-note').inputValue(),'A supplied record is not proof of automatic memory.');
 assert.equal(await page.evaluate(()=>S.courseSummary(state).complete),0);assert.deepEqual(errors,[]);
 console.log('PASS: inline definitions/search, keyboard close and exact focus/scroll return, unchanged progress, worked Git stages/recovery, memory comparison, notes and narrow layout.\nScreenshots: '+data);
}finally{await app?.close();}}
run().catch(e=>{console.error(e);process.exitCode=1;});
