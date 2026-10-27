const {earlierHome,earlierCourse,earlierGuide}=require('./qa-earlier-navigation.cjs');
const path=require('node:path'),assert=require('node:assert/strict');
const {_electron}=require(process.env.QUEST_PLAYWRIGHT||'playwright');
const root=path.resolve(__dirname,'..'),data=path.join(root,'test-results','workflow-labs-'+Date.now());
async function run(){let app;try{
 app=await _electron.launch({executablePath:require('electron'),args:[root],cwd:root,env:{...process.env,QUEST_TEST_MODE:'1',QUEST_TEST_SHOW:'1',QUEST_TEST_DATA:data}});
 const page=await app.firstWindow(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:1240,height:950});await page.emulateMedia({reducedMotion:'reduce'});
 await page.locator('#profile-skip').click();await earlierHome(page);await earlierCourse(page);await page.locator('[data-chapter="delegation"]').first().click();await page.locator('[data-chapter-tab="practice"]').click();
 await page.locator('.workflow-lab > summary').click();assert.match(await page.locator('.workflow-lab > summary').innerText(),/Two independent reviewers/);assert.equal(await page.locator('#workflow-picker').count(),0);assert.match(await page.locator('.workflow-disclosure').innerText(),/does not run tools/);
 const before=await page.evaluate(()=>S.courseSummary(state));await page.locator('[data-course-step="1"]').click();await page.locator('.workflow-lab > summary').click();await page.locator('.workflow-contract > summary').click();assert.match(await page.locator('.workflow-contract').innerText(),/Empty array/);
 await page.locator('[data-workflow-step="2"]').first().click();assert.match(await page.locator('.workflow-stage').innerText(),/savings were not measured/);
 assert.equal(await page.evaluate(()=>state.workflowSteps.models),2);assert.deepEqual(await page.evaluate(()=>state.chapters.delegation.checks),[]);assert.deepEqual(await page.evaluate(()=>S.courseSummary(state)),before);
 await earlierHome(page);await page.reload();await earlierHome(page);await page.locator('[data-action="resume"]').click();await page.locator('.workflow-lab > summary').click();assert.match(await page.locator('.workflow-lab > summary').innerText(),/Plan, hand off/);assert.match(await page.locator('.workflow-stage').innerText(),/GUIDE STEP 3 OF 3/);
 const W=require('../src/workflow-labs.js');const routes={subagents:['delegation',0],models:['delegation',1],chats:['delegation',2],environments:['environments',0],schedule:['capstone',3],hook:['automation',0],review:['github',2],browser:['seeing',1]};
 async function openLab(id){const [chapter,index]=routes[id];await earlierCourse(page);await page.locator(`[data-chapter="${chapter}"]`).first().click();await page.locator('[data-chapter-tab="practice"]').click();await page.locator(`[data-course-step="${index}"]`).click();await page.locator('.workflow-lab > summary').click();}
 for(const lab of W.labs){await openLab(lab.id);assert.match(await page.locator('.workflow-lab').innerText(),/Finish and clean up/);assert.equal(await page.locator('.workflow-steps button').count(),lab.steps.length);for(let i=0;i<lab.steps.length;i++){await page.locator(`.workflow-steps [data-workflow-step="${i}"]`).click();assert.equal(await page.locator('.workflow-stage h3').innerText(),lab.steps[i].title);}}
 await openLab('review');await page.locator('.workflow-contract > summary').click();assert.match(await page.locator('.workflow-contract').innerText(),/deliberately defective/);await page.screenshot({path:path.join(data,'review-lab.png')});
 await openLab('hook');await page.locator('.workflow-hook > summary').click();assert.match(await page.locator('.workflow-hook').innerText(),/not active hook configuration/);
 await openLab('schedule');await page.locator('.workflow-steps [data-workflow-step="3"]').click();assert.match(await page.locator('.workflow-stage').innerText(),/paused state/);
 await page.setViewportSize({width:620,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.screenshot({path:path.join(data,'schedule-narrow.png')});
 await page.locator('[data-chapter-tab="learn"]').click();await page.locator('.workflow-lab > summary').click();await page.locator('#workflow-picker').selectOption('models');assert.equal(await page.locator('#workflow-picker option').count(),4);
 await earlierHome(page);await page.reload();await earlierHome(page);await page.locator('[data-action="resume"]').click();await page.locator('.workflow-lab > summary').click();assert.equal(await page.locator('#workflow-picker').inputValue(),'models');
 await earlierCourse(page);await page.locator('[data-action="mini-catalog"]').click();await page.locator('[data-open-mini="delegation.parallel-agents"]').click();assert.equal(await page.locator('.workflow-lab').count(),1);assert.equal(await page.locator('#workflow-picker').count(),0);
 assert.equal(await page.evaluate(()=>S.courseSummary(state).complete),0);assert.deepEqual(errors,[]);
 console.log('PASS: eight complete worked labs, example labels, saved lab/step selection, unchanged completion, seeded defect/logger guidance, cleanup, narrow layout and mini-lesson entry.\nScreenshots: '+data);
}finally{await app?.close();}}
run().catch(e=>{console.error(e);process.exitCode=1;});
