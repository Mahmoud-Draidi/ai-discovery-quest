const {earlierHome,earlierCourse,earlierGuide}=require('./qa-earlier-navigation.cjs');
const path=require('node:path'),assert=require('node:assert/strict');
const {_electron}=require(process.env.QUEST_PLAYWRIGHT||'playwright');
const root=path.resolve(__dirname,'..'),data=path.join(root,'test-results','mini-lessons-'+Date.now());
async function run(){let app;try{
 app=await _electron.launch({executablePath:require('electron'),args:[root],cwd:root,env:{...process.env,QUEST_TEST_MODE:'1',QUEST_TEST_SHOW:'1',QUEST_TEST_DATA:data}});
 const page=await app.firstWindow(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:1240,height:950});
 await page.locator('#profile-skip').click();await earlierHome(page);await earlierCourse(page);await page.locator('[data-action="mini-catalog"]').click();
 assert.equal(await page.locator('.mini-grid').first().locator('.mini-card').count(),67);
 await page.locator('#mini-filter').selectOption('optional');assert.equal(await page.locator('.mini-grid').first().locator('.mini-card').count(),12);
 await page.locator('#mini-search').fill('image');assert.equal(await page.locator('.mini-grid').first().locator('.mini-card').count(),2);
 await page.screenshot({path:path.join(data,'mini-catalog.png'),fullPage:true});
 await page.locator('[data-open-mini="optional.image-create"]').click();await page.locator('[data-action="mini-unavailable"]').click();
 await page.locator('.mini-fallback > summary').click();await page.locator('[data-action="mini-reviewed"]').click();
 assert.match(await page.locator('.mini-outcome').innerText(),/Fallback reviewed/);await page.locator('#mini-evidence').fill('No image tool; I reviewed the outcome and recovery.');
 await earlierHome(page);assert.match(await page.locator('.current-task-label').innerText(),/Mini-lesson.*Create an image/);
 assert.equal(await page.locator('.revisit-item [data-open-mini="optional.image-create"]').count(),1);
 await page.reload();await earlierHome(page);await page.locator('[data-action="resume"]').click();assert.match(await page.locator('h1').innerText(),/Create an image/);
 assert.equal(await page.locator('#mini-evidence').inputValue(),'No image tool; I reviewed the outcome and recovery.');
 await page.locator('[data-action="mini-catalog"]').click();await page.locator('[data-open-mini="optional.image-edit"]').click();await page.locator('[data-action="mini-practiced"]').click();
 assert.match(await page.locator('.mini-outcome').innerText(),/Practiced/);assert.equal(await page.evaluate(()=>S.courseSummary(state).complete),0);
 await page.locator('[data-action="mini-catalog"]').click();await page.locator('#mini-search').fill('');await page.locator('#mini-filter').selectOption('all');
 await page.locator('[data-open-mini="foundation.first-note"]').click();await page.locator('[data-action="mini-practiced"]').click();assert.deepEqual(await page.evaluate(()=>state.checks),[1]);
 await page.locator('[data-action="mini-undo"]').click();assert.deepEqual(await page.evaluate(()=>state.checks),[]);
 await page.setViewportSize({width:620,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.screenshot({path:path.join(data,'mini-lesson-narrow.png'),fullPage:true});
 assert.deepEqual(errors,[]);console.log('PASS: independent catalog/search, availability/fallback without credit, exact saved resume, separate image edit, mapped check/undo and narrow layout.\nScreenshots: '+data);
}finally{await app?.close();}}
run().catch(e=>{console.error(e);process.exitCode=1;});
