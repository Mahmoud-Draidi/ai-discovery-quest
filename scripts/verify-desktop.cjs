// Optional desktop QA. Point QUEST_PLAYWRIGHT at an existing Playwright installation.
const path=require('node:path');
const assert=require('node:assert/strict');
const {_electron:electron}=require(process.env.QUEST_PLAYWRIGHT || 'playwright');
const root=path.resolve(__dirname,'..');
const course=require('../src/course.js');
const data=path.join(root,'test-results','review-qa-'+Date.now());
async function verify(){
  let app;
  try{
    app=await electron.launch({executablePath:process.env.QUEST_EXECUTABLE || require('electron'),args:process.env.QUEST_EXECUTABLE?[]:[root],cwd:root,env:{...process.env,QUEST_TEST_MODE:'1',QUEST_TEST_SHOW:'1',QUEST_TEST_DATA:data}});
    const page=await app.firstWindow();await page.emulateMedia({reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.locator('#profile-dialog').waitFor({state:'visible'});
    await page.screenshot({path:path.join(data,'welcome.png')});
    await page.locator('#learner-name').fill('Avery');
    await page.locator('#profile-form button[type="submit"]').click();
    await page.locator('#profile-dialog').waitFor({state:'hidden'});
    assert.match(await page.locator('#learner-header').innerText(),/Avery/);
    assert.match(await page.locator('#learner-header').innerText(),/0 XP/);
    assert.equal(await page.locator('.brand-logo').evaluate(img=>img.complete && img.naturalWidth>0),true);
    await page.locator('#sidebar-toggle').click();
    assert.equal(await page.locator('#sidebar nav').isHidden(),true);
    await page.reload();
    await page.locator('#learner-header').waitFor();
    await page.waitForFunction(()=>document.querySelector('#learner-header').textContent.includes('Avery'));
    assert.equal(await page.locator('#profile-dialog').isVisible(),false);
    assert.equal(await page.locator('#sidebar nav').isHidden(),true,'sidebar preference survives reload');
    await page.locator('#sidebar-toggle').click();
    await page.getByRole('button',{name:'Edit learner name'}).click();
    await page.locator('#learner-name').fill('Avery <Learner>');
    await page.locator('#profile-form button[type="submit"]').click();
    assert.equal(await page.locator('.learner-name').innerText(),'Avery <Learner>');
    assert.equal(await page.locator('.learner-name learner').count(),0,'learner name is text, not HTML');
    await page.getByRole('button',{name:'Edit learner name'}).click();
    await page.locator('#learner-name').fill('Avery');
    await page.locator('#profile-form button[type="submit"]').click();
    await page.locator('.hero').waitFor();
    for(const width of [620,1240,2560]) {
      await page.setViewportSize({width,height:width===2560?1440:860});
      for(const collapsed of [false,true]) {
        if(await page.locator('#sidebar nav').isHidden()!==collapsed)await page.locator('#sidebar-toggle').click();
        const header=await page.locator('#learner-header').boundingBox();
        const main=await page.locator('main').boundingBox();
        const intro=await page.locator('main .page-intro').first().boundingBox();
        assert.ok(Math.abs(header.x-main.x)<=1,`header/main left alignment at ${width}, collapsed=${collapsed}`);
        assert.ok(Math.abs(header.width-main.width)<=1,`header/main width alignment at ${width}, collapsed=${collapsed}`);
        assert.ok(Math.abs(header.x-intro.x)<=1,`header/intro alignment at ${width}, collapsed=${collapsed}`);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
        if(width===2560 && !collapsed)await page.screenshot({path:path.join(data,'layout-wide.png')});
      }
    }
    await page.setViewportSize({width:1240,height:860});
    if(await page.locator('#sidebar nav').isHidden())await page.locator('#sidebar-toggle').click();
    assert.equal(await page.locator('.roadmap').count(),0,'overview has no chapter catalog');
    await page.locator('[data-view="lesson"]').click();
    assert.equal(await page.locator('.roadmap .study-time').count(),course.chapters.length+2);
    assert.equal(await page.locator('.roadmap .prerequisite').count(),course.chapters.length+2);
    assert.match(await page.locator('.roadmap-card').first().innerText(),/Recommended first: None — start here/);
    assert.doesNotMatch(await page.locator('.roadmap').innerText(),/Bring:/);
    assert.doesNotMatch(await page.locator('main').innerText(),/Start here or bring equivalent experience/);
    await page.locator('[data-view="home"]').click();
    assert.equal(await page.locator('.overview-journey').count(),1);
    assert.equal(await page.locator('.hero .orbit').count(),1);
    assert.equal(await page.locator('[data-action="resume"]').count(),1);
    assert.equal(await page.locator('.course-progress').count(),0,'overview uses one merged card');
    await page.screenshot({path:path.join(data,'learner-home.png')});
    await page.getByRole('button',{name:'Start with the app tour →',exact:true}).click();
    await page.getByRole('heading',{name:'Your app, at a glance'}).waitFor();
    assert.equal(await page.locator('.control-map article').count()>=12,true);
    await page.screenshot({path:path.join(data,'orientation.png'),fullPage:true});
    await page.screenshot({path:path.join(data,'orientation-preview.png')});
    await page.locator('[data-chapter-tab="learn"]').focus();
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('[data-chapter-tab="practice"]').getAttribute('aria-selected'),'true');
    assert.equal(await page.locator('[data-chapter-tab="practice"]').evaluate(e=>e===document.activeElement),true);
    await page.locator('[data-copy-course]').click();
    await page.waitForFunction(()=>document.querySelector('#notice').textContent.includes('Copied'));
    assert.match(await page.locator('#notice').innerText(),/Copied/);
    await page.locator('[data-action="exercise-done"]').click();
    assert.equal(await page.locator('.exercise-done').count(),1);
    const newWindow=app.waitForEvent('window');
    await page.getByRole('button',{name:'Open compact companion',exact:true}).click();
    const companion=await newWindow;
    assert.ok(companion);await companion.locator('#title').waitFor();
    assert.match(await companion.locator('#title').innerText(),/Inspect your actual screen/);
    await companion.locator('#check').uncheck();
    await page.waitForFunction(()=>!!document.querySelector('[data-action="exercise-done"]'));
    await page.locator('[data-action="exercise-done"]').click();
    await companion.waitForFunction(()=>document.querySelector('#check').checked);
    await companion.locator('#copy').click();
    await companion.waitForFunction(()=>document.querySelector('#copy-result').textContent.includes('Copied'));
    await page.locator('[data-action="exercise-next"]').click();
    await companion.waitForFunction(()=>document.querySelector('#text').textContent.includes('practice folder'));
    await companion.evaluate(()=>window.companion.check({key:'orientation:0',checked:true}));
    assert.equal(await page.locator('.exercise-done').count(),0,'stale companion step cannot tick another step');
    assert.equal(await companion.evaluate(()=>typeof window.quest),'undefined');
    await companion.locator('#pin').uncheck();
    assert.equal(await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows().find(w=>w.getTitle().includes('companion')).isAlwaysOnTop()),false);
    await companion.locator('#next').click();
    await page.waitForFunction(()=>document.querySelector('[data-course-step="2"]').getAttribute('aria-current')==='step');
    assert.equal(await page.locator('.exercise-done').count(),0,'companion next does not fabricate practice');
    await companion.evaluate(()=>window.companion.action({key:'orientation:0',action:'next'}));
    assert.equal(await page.locator('[data-course-step="2"]').getAttribute('aria-current'),'step','stale next cannot navigate');
    await page.locator('[data-course-step="0"]').click();
    await page.locator('[data-action="exercise-defer"]').click();
    assert.match(await page.locator('[data-course-step="0"]').innerText(),/Deferred/);
    assert.equal(await page.locator('.exercise-done').count(),0);
    await page.reload();
    await page.locator('[data-action="resume"]').click();
    assert.match(await page.locator('[data-course-step="0"]').innerText(),/Deferred/,'deferral survives restart');
    await page.locator('[data-action="exercise-next"]').click();
    assert.equal(await page.locator('[data-course-step="1"]').getAttribute('aria-current'),'step');
    await page.locator('[data-action="course-control-map"]').click();
    assert.equal(await page.locator('.control-map').count(),1);
    await page.locator('[data-chapter-tab="practice"]').click();
    await companion.screenshot({path:path.join(data,'companion.png')});
    await companion.locator('#notes').click();
    await page.locator('#course-note').waitFor();
    await page.locator('#course-note').fill('QA note: a deferred step is still unfinished.');
    await page.waitForFunction(()=>document.querySelector('#save-status').textContent==='All changes saved');
    await page.locator('[data-chapter-tab="practice"]').click();
    await companion.close();
    await page.locator('[data-chapter-tab="quiz"]').click();
    await page.locator('[data-course-answer="0"]').click();
    assert.match(await page.locator('.feedback').innerText(),/path names a file/);
    assert.equal(await page.locator('.answer:not(:disabled)').count(),0);
    await page.locator('[data-action="retry-question"]').click();
    await page.locator('[data-course-answer="1"]').click();
    assert.match(await page.locator('.feedback').innerText(),/supported attachment/);
    await page.locator('[data-action="course"]').first().click();
    await page.screenshot({path:path.join(data,'course.png'),fullPage:true});
    for(const ch of course.chapters){
      await page.locator(`[data-chapter="${ch.id}"]`).first().click();
      assert.ok(await page.locator('.next-chapter').count());
      assert.ok(await page.locator('.other-tools').count());
      for(const tab of ['practice','quiz','reference','notes']){
        await page.locator(`[data-chapter-tab="${tab}"]`).click();
        assert.doesNotMatch(await page.locator('main').innerText(),/not-started|not-recorded|original journey|actual journey request/);
      }
      if(ch.id==='memory'){
        await page.locator('#course-note').fill('Private test observation: explicit records are distinct from recall.');
        await page.waitForFunction(()=>document.querySelector('#save-status').textContent==='All changes saved');
        await page.reload();
        await page.locator('[data-action="resume"]').click();
        assert.equal(await page.locator('#course-note').inputValue(),'Private test observation: explicit records are distinct from recall.');
        await page.locator('[data-chapter-tab="learn"]').click();
        assert.equal(await page.locator('.scope-guide tbody tr').count(),6);
        assert.equal(await page.locator('.scope-guide caption').count(),1);
        await page.setViewportSize({width:640,height:800});
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'scope table stays inside narrow page');
        await page.locator('#scope-guide-title').scrollIntoViewIfNeeded();
        await page.locator('.scope-guide').screenshot({path:path.join(data,'memory-scope.png')});
        await page.setViewportSize({width:1240,height:860});
        await page.locator('[data-chapter-tab="practice"]').click();
        assert.match(await page.locator('.practice-help').first().innerText(),/What success looks like/);
        await page.locator('[data-action="course-scope-guide"]').click();
        assert.equal(await page.locator('#scope-guide-title').evaluate(e=>e===document.activeElement),true);
        await page.locator('[data-chapter-tab="practice"]').click();
        await page.locator('[data-course-step="2"]').click();
        assert.match(await page.locator('.context-step pre.prompt').innerText(),/A training team uses AI/,'fresh chat prompt supplies its own note');
      }
      await page.locator('[data-action="course"]').first().click();
    }
    await page.locator('[data-action="start"]').first().click();
    await page.locator('[data-tab="reference"]').click();
    await page.locator('[data-action="context"]').first().click();
    await page.locator('[data-context-tab="practice"]').click();
    await page.locator('[data-action="exercise-defer"]').click();
    assert.match(await page.locator('[data-context-step="0"]').innerText(),/Deferred/);
    await page.locator('[data-context-step="3"]').click();
    assert.equal(await page.locator('.exercise-done').count(),0);
    assert.equal(await page.getByRole('button',{name:'Continue to knowledge check →',exact:true}).count(),0);
    await page.getByText('Fictional handoff starter',{exact:true}).click();
    await page.locator('[data-copy-starter="context:3"]').click();
    await page.waitForFunction(()=>document.querySelector('#notice').textContent.includes('Fictional handoff copied'));
    const copied=await app.evaluate(({clipboard})=>clipboard.readText());
    assert.match(copied,/This is a fictional continuity exercise/);
    assert.match(copied,/Not completed: Creating my own note or testing automatic memory/);
    assert.equal(await page.locator('.exercise-done').count(),0,'copying an example does not record personal practice');
    await page.locator('[data-context-tab="reference"]').click();
    await page.locator('[data-view="library"]').click();
    for(const term of ['memory','passwords','maps']){
      await page.locator('#library-search').fill(term);
      assert.ok(await page.locator('.library-entry:visible').count()>0,term);
    }
    await page.locator('#library-search').fill('');
    await page.locator('#library-topic').selectOption('Memory, instructions, and account boundaries');
    assert.ok(await page.locator('.library-entry:visible').count()>0);
    const tags=await page.locator('.library-entry:visible').evaluateAll(nodes=>nodes.map(n=>n.dataset.tag));
    assert.ok(tags.every(t=>t==='Memory, instructions, and account boundaries'));
    const urls=await page.locator('.sources [data-source]').evaluateAll(nodes=>nodes.map(n=>n.dataset.source));
    assert.equal(new Set(urls).size,urls.length,'source list is not duplicated');
    await page.locator('[data-view="journal"]').click();
    assert.doesNotMatch(await page.locator('main').innerText(),/Unfinished or optional explorations/);
    assert.equal(await page.locator('.prior-experience').count(),0);
    assert.doesNotMatch(await page.locator('main').innerText(),/not-recorded/);
    await page.locator('[data-view="lesson"]').click();
    await page.locator('[data-chapter="memory"]').first().click();
    assert.equal(await page.locator('[data-action="prior-experience"]').count(),0);
    assert.equal(await page.locator('[data-view="milestones"]').count(),0);
    // One action records each exercise; finishing the last records practice automatically.
    for(const id of ['foundation','context','orientation']) {
      await page.evaluate(id=>{
        state=S.normalize({completionFlow:1,profile:{name:'Avery',setupComplete:true}});
        if(id==='foundation'){tab='practice';navigate('lesson');}
        else if(id==='context'){contextTab='practice';navigate('context');}
        else{selectedChapter=id;chapterTab='practice';navigate('chapter');}
      },id);
      assert.equal(await page.locator('.tab-content input[type="checkbox"]').count(),0);
      assert.equal(await page.locator('[data-action="mark-practiced"], [data-action="course-practiced"], [data-action="context-practiced"]').count(),0);
      const total=await page.evaluate(()=>exerciseTotal());
      for(let i=0;i<total;i++) {
        await page.locator('[data-action="exercise-done"]').click();
        assert.equal(await page.locator('.exercise-counter').innerText(),`${i+1} of ${total} exercises done`);
        if(i<total-1)await page.locator('[data-action="exercise-next"]').click();
      }
      assert.equal(await page.evaluate(()=>exerciseValue().exercise),'practiced');
      assert.equal(await page.evaluate(()=>S.courseSummary(state).complete),0,'practice alone does not complete a chapter');
      assert.equal(await page.getByRole('button',{name:'Continue to knowledge check →',exact:true}).count(),1);
      await page.locator('[data-action="exercise-undo"]').click();
      assert.equal(await page.evaluate(()=>exerciseValue().exercise),'not-started');
      assert.equal(await page.locator('.exercise-counter').innerText(),`${total-1} of ${total} exercises done`);
      await page.locator('[data-action="exercise-done"]').click();
      await page.reload();
      await page.locator('[data-action="resume"]').click();
      assert.equal(await page.locator('.exercise-counter').innerText(),`${total} of ${total} exercises done`);
      if(id==='orientation')await page.screenshot({path:path.join(data,'simplified-exercises.png')});
    }
    // Exercise all three chapter implementations through the new final steps.
    for (const id of ['foundation','context','orientation']) {
      await page.evaluate(async id=>{
        state=S.normalize({completionFlow:1,profile:{name:'Avery',setupComplete:true}});
        const value=id==='foundation'?state:id==='context'?state.context:state.chapters[id];
        const questions=id==='foundation'?C.questions:id==='context'?C.context.questions:Course.chapters.find(ch=>ch.id===id).questions;
        const steps=id==='foundation'?[1,2,3]:id==='context'?C.context.steps:Course.chapters.find(ch=>ch.id===id).steps;
        value.checks=steps.map((_,i)=>i+1);value.exercise='practiced';
        value.quiz=Object.fromEntries(questions.map(q=>[q.id,[q.correct]]));
        if(id==='foundation'){tab='quiz';questionIndex=questions.length-1;navigate('lesson');}
        else if(id==='context'){contextTab='quiz';contextQuestion=questions.length-1;navigate('context');}
        else{selectedChapter=id;chapterTab='quiz';chapterQuestion=questions.length-1;navigate('chapter');}
        await save();
      },id);
      assert.match(await page.locator('#learner-header').innerText(),/0 XP/);
      await page.locator(`[data-action="${id==='foundation'?'next-question':id==='context'?'context-next-question':'course-next-question'}"]`).click();
      assert.match(await page.locator('[role="tab"][aria-selected="true"]').innerText(),/Questions & sources/);
      const noteTab=id==='foundation'?'data-tab':id==='context'?'data-context-tab':'data-chapter-tab';
      await page.locator(`[${noteTab}="notes"]`).click();
      assert.equal(await page.locator('[data-action="finish-chapter"]').isDisabled(),true,'direct note tab cannot bypass reference review');
      await page.locator('[data-action="review-questions"]').click();
      assert.equal(await page.evaluate(()=>window.scrollY),0,'reference navigation starts at the top');
      assert.equal(await page.locator('[data-action="review-references"]').isDisabled(),true);
      assert.equal(await page.locator('.tab-content').evaluate(el=>!!(el.querySelector('.finish-panel').compareDocumentPosition(el.querySelector('.sources')) & Node.DOCUMENT_POSITION_FOLLOWING)),true,'reflection comes before official references');
      const commonQuestions=page.locator('.tab-content .chapter-questions > details > summary');
      const questionCount=await commonQuestions.count();
      for(let i=0;i<questionCount-1;i++)await commonQuestions.nth(i).click();
      assert.equal(await page.locator('[data-action="review-references"]').isDisabled(),true,'every question must be expanded');
      await commonQuestions.last().click();
      await page.waitForFunction(()=>!document.querySelector('[data-action="review-references"]').disabled);
      await commonQuestions.first().click();
      await page.waitForFunction(()=>document.querySelector('[data-action="review-references"]').disabled);
      await commonQuestions.first().click();
      await page.waitForFunction(()=>!document.querySelector('[data-action="review-references"]').disabled);
      await page.locator('[data-action="review-references"]').click();
      assert.equal(await page.evaluate(()=>window.scrollY),0,'note navigation starts at the top');
      assert.match(await page.locator('[role="tab"][aria-selected="true"]').innerText(),/My note/);
      assert.equal(await page.locator('.note-panel textarea').inputValue(),'','note remains optional');
      await page.locator('[data-action="finish-chapter"]').click();
      await page.locator('#chapter-celebration').waitFor();
      assert.equal(await page.locator('#breadcrumb').innerText(),'Overview');
      assert.match(await page.locator('#learner-header').innerText(),/100 XP/);
      if(id==='orientation')await page.screenshot({path:path.join(data,'chapter-celebration.png')});
      await page.locator('#dismiss-celebration').click();
      assert.equal(await page.evaluate(id=>{
        const resumed=state.resume.view==='lesson'?'foundation':state.resume.view==='context'?'context':state.resume.chapter;
        return resumed!==id && !S.getSummary(state,resumed).complete;
      },id),true,'resume moves to an unfinished chapter after completion');
      if(id==='orientation')assert.equal(await page.getByRole('button',{name:'Start with the app tour →',exact:true}).count(),0);
      await page.locator('[data-view="lesson"]').click();
      assert.equal(await page.locator('.chapter-completed').count(),1);
      assert.equal(await page.locator('.chapter-completed button').innerText(),'Review chapter →');
      await page.locator('.chapter-completed button').click();
      assert.equal(await page.locator('.chapter-navigation').count(),1);
      assert.equal(await page.locator('.chapter-navigation button').count(),2,'every chapter uses All chapters and Save');
      assert.equal(await page.locator('.completed-badge').count(),1);
      assert.equal(await page.locator('.completed-badge').evaluate(el=>getComputedStyle(el).color),'rgb(164, 239, 198)');
      await page.locator('[data-action="toggle-chapter-bookmark"]').click();
      assert.match(await page.locator('.chapter-navigation').innerText(),/Chapter saved/);
      await page.reload();
      await page.locator('#learner-header').waitFor();
      await page.waitForFunction(()=>document.querySelector('#learner-header').textContent.includes('100 XP'));

    }
    await page.evaluate(async()=>{state.notes='Foundation note';state.context.notes='';await save();});
    await page.locator('[data-view="notes"]').click();
    assert.equal(await page.locator('.note-panel').count(),1);
    assert.equal(await page.locator('#notes-chapter-picker option').count(),course.chapters.length+2);
    assert.match(await page.locator('#notes-chapter-picker option[value="foundation"]').innerText(),/Added note/);
    await page.locator('#notes-chapter-picker').selectOption('foundation');
    assert.equal(await page.locator('#lesson-note').inputValue(),'Foundation note');
    await page.locator('#notes-chapter-picker').selectOption('context');
    await page.locator('#context-note').fill('New context note');
    assert.match(await page.locator('#notes-chapter-picker option[value="context"]').innerText(),/Added note/);
    assert.match(await page.locator('#notes-chapter-picker selectedcontent').innerText(),/Added note/,'closed picker updates while typing');
    assert.equal(await page.locator('#notes-chapter-picker selectedcontent .added-note').evaluate(el=>getComputedStyle(el).color),'rgb(153, 198, 223)');
    assert.equal(await page.locator('#context-note').evaluate(el=>el===document.activeElement),true,'typing keeps focus');
    await page.locator('#context-note').fill('   ');
    assert.doesNotMatch(await page.locator('#notes-chapter-picker selectedcontent').innerText(),/Added note/,'empty note removes status immediately');
    await page.locator('#context-note').fill('New context note');
    await page.locator('#notes-chapter-picker').selectOption('memory');
    await page.locator('#course-note').fill('Unified memory note');
    assert.match(await page.locator('#notes-chapter-picker selectedcontent').innerText(),/Added note/);
    await page.locator('#notes-chapter-picker').selectOption('foundation');
    assert.equal(await page.locator('#lesson-note').inputValue(),'Foundation note');
    await page.screenshot({path:path.join(data,'unified-notes.png')});
    await page.reload();
    await page.locator('[data-view="notes"]').click();
    await page.locator('#notes-chapter-picker').selectOption('memory');
    assert.equal(await page.locator('#course-note').inputValue(),'Unified memory note');
    // Crossing a title threshold queues a distinct celebration after the chapter reward.
    await page.evaluate(async()=>{
      state=S.normalize({completionFlow:1,profile:{name:'Avery',setupComplete:true}});
      for(const [index,ch] of Course.chapters.slice(0,4).entries()) {
        state.chapters[ch.id]={...state.chapters[ch.id],exercise:'practiced',checks:ch.steps.map((_,i)=>i+1),quiz:Object.fromEntries(ch.questions.map(q=>[q.id,[q.correct]]))};
        state.completions[ch.id]={referencesReviewed:true,notesVisited:true,completed:index<3};
      }
      selectedChapter=Course.chapters[3].id;chapterTab='notes';navigate('chapter');await save();
    });
    await page.locator('[data-action="finish-chapter"]').click();
    await page.locator('#chapter-celebration').waitFor();
    assert.equal(await page.locator('#level-celebration').count(),0);
    await page.locator('#dismiss-celebration').click();
    await page.locator('#level-celebration').waitFor();
    assert.match(await page.locator('#level-celebration').innerText(),/AI Explorer/);
    assert.match(await page.locator('#level-celebration').innerText(),/Level 2/);
    await page.screenshot({path:path.join(data,'level-celebration.png')});
    await page.locator('#dismiss-celebration').click();
    await page.reload();
    await page.waitForFunction(()=>document.querySelector('#learner-header').textContent.includes('400 XP'));
    assert.equal(await page.locator('.chapter-celebration').count(),0,'existing titles do not replay on reload');
    await page.screenshot({path:path.join(data,'merged-overview.png')});
    // Motion is enabled for this check: the button follows the panel edge.
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.setViewportSize({width:1240,height:860});
    const beforeToggle=await page.locator('#sidebar-toggle').boundingBox();
    await page.locator('#sidebar-toggle').click();
    await page.waitForFunction(()=>Math.abs(document.querySelector('.workspace').getBoundingClientRect().left-76)<1);
    const afterToggle=await page.locator('#sidebar-toggle').boundingBox();
    assert.equal(await page.locator('#sidebar-toggle').evaluate(el=>!!el.closest('#sidebar')),true,'toggle stays inside sidebar');
    assert.equal(await page.locator('.brand-logo').isVisible(),true,'logo stays visible in compact rail');
    await page.locator('#sidebar-toggle').click();
    await page.waitForFunction(()=>document.querySelector('.workspace').getBoundingClientRect().left>=227);
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.evaluate(async()=>{
      for(const ch of Course.chapters.slice(0,4)){state.completions[ch.id]={referencesReviewed:true,notesVisited:true,completed:true};state.chapters[ch.id]={...state.chapters[ch.id],exercise:'practiced',checks:ch.steps.map((_,i)=>i+1),quiz:Object.fromEntries(ch.questions.map(q=>[q.id,[q.correct]]))};}
      await save();navigate('home');
    });
    assert.match(await page.locator('#learner-header').innerText(),/AI Explorer/);
    assert.match(await page.locator('#learner-header').innerText(),/400 XP/);
    assert.equal(await page.locator('#level-progress').getAttribute('value'),'0');
    await page.screenshot({path:path.join(data,'level-up.png')});
    await page.setViewportSize({width:640,height:800});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await page.locator('#sidebar-toggle').click();
    assert.equal(await page.locator('#sidebar nav').isHidden(),true);
    await page.locator('#learner-header').screenshot({path:path.join(data,'learner-narrow.png')});
    assert.deepEqual(errors,[]);
    await app.close();app=undefined;
    app=await electron.launch({executablePath:process.env.QUEST_EXECUTABLE || require('electron'),args:process.env.QUEST_EXECUTABLE?[]:[root],cwd:root,env:{...process.env,QUEST_TEST_MODE:'1',QUEST_TEST_SHOW:'1',QUEST_TEST_DATA:data+'-guest'}});
    const guest=await app.firstWindow();
    await guest.locator('#profile-dialog').waitFor({state:'visible'});
    await guest.locator('#profile-skip').click();
    await guest.locator('#profile-dialog').waitFor({state:'hidden'});
    await guest.reload();
    await guest.waitForFunction(()=>document.querySelector('#learner-header').textContent.includes('Learner'));
    assert.equal(await guest.locator('#profile-dialog').isVisible(),false,'guest choice is remembered');
    console.log('PASS: named profile/reload/rename, logo, XP/level header, chapter estimates, sidebar persistence, simplified backups, chapter routes, quiz/notes/search, companion controls and narrow layout.');
    console.log('Isolated profile and screenshots: '+data);
  }finally{if(app)await app.close();}
}
verify().catch(error=>{console.error(error);process.exitCode=1;});
