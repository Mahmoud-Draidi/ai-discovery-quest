const {test}=require('node:test'),assert=require('node:assert/strict');
const G=require('../src/practice-guides.js'),C=require('../src/course.js'),S=require('../src/state.js');
test('every existing exercise has specific inputs, expected result, failure and recovery',()=>{
 let total=0;
 for(const id of C.order){const count=id==='foundation'?3:id==='context'?4:C.chapters.find(ch=>ch.id===id).steps.length;
  for(let i=0;i<count;i++){
   const guide=G.get(id,i);assert.ok(guide,`${id}:${i}`);
   for(const key of ['title','prompt','materials','expected','failure','recovery','minutes','learnerAction','assistantAction'])assert.ok(typeof guide[key]==='string'&&guide[key].length>10,`${id}:${i} ${key}`);
   assert.notEqual(guide.expected,guide.failure);assert.notEqual(guide.failure,guide.recovery);assert.doesNotMatch(guide.prompt,/\[(?:label|app name|visible label|exact model)\]/);
   if(guide.inputChapter)assert.ok(C.order.includes(guide.inputChapter));total++;
  }
 }
 assert.equal(total,60);assert.match(G.get('artifacts',1).expected,/2.*3/);assert.match(G.get('artifacts',3).expected,/150/);
 assert.equal(G.get('missing',0),null);
});
test('new practice metadata does not alter legacy checks, completions or earned progress',()=>{
 const old=S.normalize({notes:'Private note',checks:[1,2,3],exercise:'practiced',quiz:{q1:[0],q2:[1],q3:[2]}}),before=S.courseSummary(old);
 const after=S.normalize({...old,stepEvidence:{1:'Opened my file'},stepReasons:{2:'unavailable'}});
 assert.deepEqual(S.courseSummary(after),before);assert.deepEqual(after.checks,old.checks);assert.deepEqual(after.completions,old.completions);assert.equal(after.notes,'Private note');assert.deepEqual(after.stepReasons,{});
});
test('unavailable reasons preserve other checked exercises and survive backup normalization',()=>{
 const id=C.chapters[0].id;
 const state=S.normalize({chapters:{[id]:{checks:[1],stepStatus:{2:'deferred'},stepReasons:{1:'unavailable',2:'unavailable'},stepEvidence:{2:'Tool absent in this chat'}}}});
 assert.deepEqual(state.chapters[id].checks,[1]);assert.deepEqual(state.chapters[id].stepReasons,{2:'unavailable'});assert.equal(S.courseSummary(state).complete,0);assert.deepEqual(S.normalize(JSON.parse(JSON.stringify(state))),state);
});
test('imported exercise observations are bounded and invalid maps cannot become evidence',()=>{
 const state=S.normalize({stepEvidence:{1:'x'.repeat(1500),2:42,88:'Invalid step'},context:{stepEvidence:['Not a map']}});
 assert.equal(state.stepEvidence[1].length,1000);assert.equal(state.stepEvidence[2],undefined);assert.equal(state.stepEvidence[88],undefined);assert.deepEqual(state.context.stepEvidence,{});
 assert.deepEqual(S.normalize({stepEvidence:'abc'}).stepEvidence,{});
});
