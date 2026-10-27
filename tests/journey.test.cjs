const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const os=require('node:os');
const path=require('node:path');
const J=require('../src/journey.js');
const S=require('../src/state.js');
const C=require('../src/course.js');
const {createStore}=require('../src/store.cjs');

test('learner XP follows completed chapters and exact level thresholds',()=>{
  for(let completed=0;completed<=17;completed++) {
    const reward=J.reward(completed,17);
    assert.equal(reward.xp,completed*100);
    assert.equal(reward.percent,Math.round(completed/17*100));
    assert.ok(reward.levelPercent>=0 && reward.levelPercent<=100);
    assert.ok(reward.xpToNext>=0);
  }
  assert.equal(J.reward(3,17).title,'AI Newcomer');
  assert.equal(J.reward(4,17).title,'AI Explorer');
  assert.equal(J.reward(4,17).levelPercent,0);
  assert.equal(J.reward(5,17).xpToNext,200);
  assert.equal(J.reward(17,17).title,'AI Trailblazer');
  assert.equal(J.reward(17,17).levelPercent,100);
  assert.equal(J.reward(17,17).nextTitle,null);
  assert.equal(J.reward(0,0).title,'AI Newcomer');
});

test('viewing, retries and reported prior experience cannot farm XP',()=>{
  const chapter=C.chapters[0];
  const state=S.normalize({lessonSeen:true,records:{foundation:{status:'practiced'}},chapters:{[chapter.id]:{seen:true,exercise:'deferred',quiz:Object.fromEntries(chapter.questions.map(q=>[q.id,[q.correct,q.correct]]))}}});
  const summary=S.courseSummary(state);
  assert.equal(J.reward(summary.complete,summary.total).xp,0);
  state.chapters[chapter.id].checks=chapter.steps.map((_,i)=>i+1);
  state.chapters[chapter.id].exercise='practiced';
  assert.equal(S.courseSummary(state).complete,0,'practice and quiz now require the final completion action');
  state.completions[chapter.id].referencesReviewed=true;
  state.completions[chapter.id].notesVisited=true;
  assert.equal(S.finish(state,chapter.id),true);
  const completed=S.courseSummary(state);
  assert.equal(J.reward(completed.complete,completed.total).xp,100);
  assert.deepEqual(J.reward(completed.complete,completed.total),J.reward(completed.complete,completed.total));
});

test('profile and sidebar preference migrate and survive storage with existing progress',async()=>{
  const legacy=S.normalize({notes:'Keep this note',checks:[1],followUps:{mini:{status:'deferred',note:'Keep the old optional record'}}});
  assert.deepEqual(legacy.profile,{name:'',setupComplete:false});
  const value=S.normalize({...legacy,profile:{name:'  نور <Learner>\n ',setupComplete:true},ui:{sidebarCollapsed:true}});
  assert.equal(value.profile.name,'نور <Learner>');
  const folder=await fs.mkdtemp(path.join(os.tmpdir(),'quest-profile-'));
  try {await createStore(folder).save(value);assert.deepEqual(await createStore(folder).load(),value);}
  finally {await fs.rm(folder,{recursive:true,force:true});}
  assert.equal(value.notes,legacy.notes);
  assert.deepEqual(value.followUps,legacy.followUps);
  assert.equal(S.normalize({profile:{name:123},ui:{sidebarCollapsed:'yes'}}).profile.name,'');
  assert.equal(S.normalize({profile:{name:'a'.repeat(90)}}).profile.name.length,60);
});

test('every existing chapter has a bounded study estimate and greetings match day periods',()=>{
  for(const id of C.order) {
    assert.ok(J.minutes[id],id);
    const [min,max]=J.minutes[id];assert.ok(min>0 && max>=min);
    assert.match(J.estimate(id),/min$/);
  }
  assert.equal(J.greeting(8),'Good morning');
  assert.equal(J.greeting(15),'Good afternoon');
  assert.equal(J.greeting(21),'Good evening');
});
