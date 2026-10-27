const {test}=require('node:test'),assert=require('node:assert/strict');
const S=require('../src/state.js'),R=require('../src/recommendations.js'),C=require('../src/course.js'),B=require('../src/content.js');
test('fresh recommendation is an untested opening exercise, not assumed account access',()=>{
 const state=S.normalize(),next=R.next(state);assert.equal(next.id,'orientation');assert.equal(next.index,0);assert.equal(next.availability,'unknown');assert.match(next.reason,/untested/);assert.equal(S.courseSummary(state).complete,0);
});
test('postponing the opening task preserves it and recommends an independent exercise',()=>{
 const state=S.normalize({chapters:{orientation:{stepStatus:{1:'deferred'},stepReasons:{1:'later'}}}});
 const next=R.next(state);assert.equal(next.id,'orientation');assert.equal(next.index,1);assert.equal(R.revisit(state)[0].index,0);assert.equal(state.chapters.orientation.stepStatus[1],'deferred');assert.equal(S.courseSummary(state).complete,0);
});
test('unavailable images are excluded while a reported available prepared activity can be suggested',()=>{
 const state=S.normalize({preparation:{'feature-lab':true},resume:{view:'chapter',chapter:'feature-lab',tab:'practice'},chapters:{'feature-lab':{step:1,stepAvailability:{1:'available',2:'unavailable'},stepStatus:{2:'deferred'},stepReasons:{2:'unavailable'}}}});
 const next=R.next(state);assert.equal(next.id,'feature-lab');assert.equal(next.index,0);assert.equal(next.availability,'available');assert.equal(R.revisit(state).some(t=>t.id==='feature-lab'&&t.index===1),true);
});
test('recommendations name missing preparation and do not complete it on behalf of the learner',()=>{
 const state=S.normalize();for(const task of R.tasks(state)){const v=R.value(state,task.id);v.stepStatus[task.index+1]='deferred';}
 delete state.stepStatus[1];
 const next=R.next(state);assert.equal(next.kind,'prepare');assert.equal(next.id,'foundation');assert.match(next.reason,/orientation|Start here/);assert.equal(S.summary(state).complete,false);
 state.preparation.foundation=true;assert.equal(R.next(state).kind,'practice');assert.equal(S.courseSummary(state).complete,0);
});
test('finishing practice recommends the actual unfinished stage instead of more exercises',()=>{
 const state=S.normalize({completionFlow:1,checks:[1,2,3],exercise:'practiced'});
 assert.equal(R.next(state).kind,'quiz');state.quiz=Object.fromEntries(B.questions.map(q=>[q.id,[q.correct]]));assert.equal(R.next(state).kind,'reference');state.completions.foundation.referencesReviewed=true;assert.equal(R.next(state).kind,'notes');assert.equal(S.summary(state).complete,false);
});
test('availability and explicit equivalent preparation never erase or award prior completion',()=>{
 const ch=C.chapters[0],legacy=S.normalize({chapters:{[ch.id]:{checks:ch.steps.map((_,i)=>i+1),exercise:'practiced',quiz:Object.fromEntries(ch.questions.map(q=>[q.id,[q.correct]]))}}});
 const before=S.courseSummary(legacy);legacy.chapters[ch.id].stepAvailability[1]='unavailable';legacy.preparation.foundation=true;
 assert.deepEqual(S.courseSummary(S.normalize(legacy)),before);assert.equal(R.revisit(legacy).some(t=>t.id===ch.id),false);
});
test('all postponed work has no automatic completion or endlessly repeated recommendation',()=>{
 const state=S.normalize();for(const task of R.tasks(state))R.value(state,task.id).stepStatus[task.index+1]='deferred';
 assert.equal(R.next(state),null);assert.equal(R.revisit(state).length,R.tasks(state).length);assert.equal(S.courseSummary(state).complete,0);
});
test('older all-checked but unconfirmed practice has an explicit recovery route',()=>{
 const state=S.normalize({checks:[1,2,3],exercise:'skipped'});
 const next=R.next(state);assert.equal(next.id,'foundation');assert.equal(next.kind,'practice');assert.match(next.reason,/Undo/);assert.equal(S.summary(state).complete,false);
});
test('question panels and reason/availability metadata round-trip safely without changing the review gate',()=>{
 const title=C.chapters[0].library[0].title;
 const state=S.normalize({questionPanels:{orientation:[title,title,'<script>']},chapters:{orientation:{stepStatus:{1:'deferred'},stepReasons:{1:'help'},stepAvailability:{1:'needs-setup'}}}});
 assert.deepEqual(state.questionPanels.orientation,[title]);assert.deepEqual(S.normalize(JSON.parse(JSON.stringify(state))),state);assert.equal(state.completions.orientation.referencesReviewed,false);
 const unknown=S.normalize({stepStatus:{1:'deferred'},stepReasons:{1:'unavailable'},stepAvailability:{}});assert.equal(unknown.stepAvailability[1],undefined);assert.deepEqual(S.normalize(unknown),unknown);
});
