const {test}=require('node:test');
const assert=require('node:assert/strict');
const S=require('../src/state.js');
const C=require('../src/content.js');
const Course=require('../src/course.js');

function readyState(id) {
  const state=S.normalize({completionFlow:1});
  const value=id==='foundation'?state:id==='context'?state.context:state.chapters[id];
  const questions=id==='foundation'?C.questions:id==='context'?C.context.questions:Course.chapters.find(ch=>ch.id===id).questions;
  const steps=id==='foundation'?[1,2,3]:id==='context'?C.context.steps:Course.chapters.find(ch=>ch.id===id).steps;
  value.checks=steps.map((_,i)=>i+1);value.exercise='practiced';
  value.quiz=Object.fromEntries(questions.map(q=>[q.id,[q.correct]]));
  return state;
}

test('every chapter needs reference review and an explicit finish; notes are optional',()=>{
  for(const id of Course.order) {
    const state=readyState(id), flow=state.completions[id];
    assert.equal(S.getSummary(state,id).ready,true);
    assert.equal(S.getSummary(state,id).complete,false);
    assert.ok(S.getSummary(state,id).percent<100);
    assert.equal(S.finish(state,id),false);
    flow.referencesReviewed=true;
    assert.equal(S.finish(state,id),false);
    flow.notesVisited=true;
    assert.equal(S.getSummary(state,id).complete,false);
    assert.equal(S.finish(state,id),true);
    assert.equal(S.getSummary(state,id).complete,true);
    assert.equal(S.getSummary(state,id).percent,100);
    assert.equal(S.courseSummary(state).complete,1);
    assert.equal(S.finish(state,id),true);
    assert.equal(S.courseSummary(state).complete,1,'revisits never award extra completion');
    assert.deepEqual(S.normalize(state),state,'completion survives normalization and backup round trips');
  }
});

test('the finish action cannot bypass missing or deferred practical work',()=>{
  for(const id of Course.order) {
    const state=readyState(id), value=id==='foundation'?state:id==='context'?state.context:state.chapters[id];
    state.completions[id]={referencesReviewed:true,notesVisited:true,completed:false};
    value.exercise='deferred';
    assert.equal(S.finish(state,id),false);
    assert.equal(S.getSummary(state,id).complete,false);
  }
});

test('existing completions migrate once; fresh quiz passes never auto-complete',()=>{
  const fresh=readyState('foundation');
  assert.equal(S.summary(S.normalize(fresh)).complete,false);
  const legacy=structuredClone(fresh);delete legacy.completionFlow;delete legacy.completions;
  const migrated=S.normalize(legacy);
  assert.equal(S.summary(migrated).complete,true);
  assert.deepEqual(S.normalize(migrated),migrated);
  assert.equal(migrated.notes,'');
  const incomplete=structuredClone(legacy);incomplete.checks=[];
  assert.equal(S.summary(S.normalize(incomplete)).complete,false);
});
