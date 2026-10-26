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
    app=await electron.launch({executablePath:require('electron'),args:[root],cwd:root,env:{...process.env,QUEST_TEST_MODE:'1',QUEST_TEST_SHOW:'1',QUEST_TEST_DATA:data}});
    const page=await app.firstWindow();const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.locator('.hero').waitFor();
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
    await page.locator('[data-course-check]').check();
    assert.equal(await page.locator('[data-course-check]').evaluate(e=>e===document.activeElement),true);
    const newWindow=app.waitForEvent('window');
    await page.getByRole('button',{name:'Open compact companion',exact:true}).click();
    const companion=await newWindow;
    assert.ok(companion);await companion.locator('#title').waitFor();
    assert.match(await companion.locator('#title').innerText(),/Inspect your actual screen/);
    await companion.locator('#check').uncheck();
    await page.waitForFunction(()=>!document.querySelector('[data-course-check]').checked);
    await page.locator('[data-course-check]').check();
    await companion.waitForFunction(()=>document.querySelector('#check').checked);
    await companion.locator('#copy').click();
    await companion.waitForFunction(()=>document.querySelector('#copy-result').textContent.includes('Copied'));
    await page.locator('[data-action="course-next"]').click();
    await companion.waitForFunction(()=>document.querySelector('#text').textContent.includes('practice folder'));
    await companion.evaluate(()=>window.companion.check({key:'orientation:0',checked:true}));
    assert.equal(await page.locator('[data-course-check]').isChecked(),false,'stale companion step cannot tick another step');
    assert.equal(await companion.evaluate(()=>typeof window.quest),'undefined');
    await companion.locator('#pin').uncheck();
    assert.equal(await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows().find(w=>w.getTitle().includes('companion')).isAlwaysOnTop()),false);
    await companion.screenshot({path:path.join(data,'companion.png')});
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
      }
      await page.locator('[data-action="course"]').first().click();
    }
    await page.locator('[data-action="start"]').first().click();
    await page.locator('[data-tab="reference"]').click();
    await page.locator('[data-action="context"]').first().click();
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
    assert.equal(await page.locator('.prior-experience').getAttribute('open'),null);
    assert.doesNotMatch(await page.locator('main').innerText(),/not-recorded/);
    await page.locator('[data-view="lesson"]').click();
    await page.locator('[data-chapter="memory"]').first().click();
    await page.locator('[data-action="prior-experience"]').click();
    assert.equal(await page.locator('[data-record-id="memory"]').getAttribute('open'),'');
    assert.equal(await page.locator('[data-record-id="memory"] summary').evaluate(e=>e===document.activeElement),true);
    await page.locator('[data-view="milestones"]').click();
    assert.equal(await page.locator('.milestone-grid .award').count(),course.chapters.length+2);
    await page.setViewportSize({width:640,height:800});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    assert.deepEqual(errors,[]);
    console.log('PASS: orientation, chapter routes, references, library search/filter, visible copy feedback, keyboard focus/tabs, quiz retry feedback, companion synchronization/stale-step protection, milestones and narrow layout.');
    console.log('Isolated profile and screenshots: '+data);
  }finally{if(app)await app.close();}
}
verify().catch(error=>{console.error(error);process.exitCode=1;});
