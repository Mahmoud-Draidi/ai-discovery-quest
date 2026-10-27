const {test}=require('node:test');
const assert=require('node:assert/strict');
const M=require('../src/mini-lessons.js'),S=require('../src/state.js'),R=require('../src/recommendations.js'),J=require('../src/journey.js');
test('stable mini identities map old checks once; split capabilities start untried',()=>{
 const state=S.normalize({chapters:{'feature-lab':{checks:[1,2,3,4,5,6],exercise:'practiced'}}});
 assert.equal(new Set(M.items.map(i=>i.id)).size,M.items.length);
 assert.equal(M.mapped.length,60);assert.equal(M.mapped.filter(i=>i.legacy).length,5);
 for(const item of M.mapped){assert.equal(M.record(state,item).outcome,item.chapter==='feature-lab'?'practiced':'not-started');}
 for(const item of M.additions)assert.equal(M.record(state,item).outcome,'not-started');
 assert.equal(M.summary(state).total,67);assert.equal(S.courseSummary(state).total,17);
});
test('a mapped practical result shares its original check without bypassing chapter review',()=>{
 let state=S.normalize({});const item=M.get('foundation.first-note');M.outcome(state,item,'practiced');
 assert.deepEqual(state.checks,[1]);assert.equal(S.summary(state).complete,false);
 state=S.normalize(state);assert.equal(M.record(state,item).outcome,'practiced');
 M.outcome(state,item,'not-started');assert.deepEqual(state.checks,[]);
 M.outcome(state,item,'reviewed');assert.equal(M.record(state,item).outcome,'reviewed');assert.deepEqual(state.checks,[]);
});
test('independent outcomes, availability, observations and exact resume round-trip through backup data',()=>{
 let state=S.normalize({});const create=M.get('optional.image-create'),edit=M.get('optional.image-edit');
 M.availability(state,create,'unavailable');M.evidence(state,create,'No image tool in this client.');M.outcome(state,create,'reviewed');
 M.outcome(state,edit,'practiced');M.availability(state,edit,'unavailable');
 state.resume={view:'mini',chapter:'feature-lab',tab:'practice',mini:create.id};
 state=S.normalize(JSON.parse(JSON.stringify(state)));
 assert.equal(state.resume.mini,create.id);assert.equal(M.record(state,create).outcome,'reviewed');
 assert.equal(M.record(state,create).evidence,'No image tool in this client.');assert.equal(M.record(state,edit).outcome,'practiced');
 assert.equal(R.revisit(state).some(t=>t.miniId===create.id),true);assert.equal(R.revisit(state).some(t=>t.miniId===edit.id),false);
 assert.equal(S.courseSummary(state).complete,0);assert.equal(J.reward(0,17).xp,0);
});
test('adding mini work preserves existing chapter rewards and ignores corrupt new records',()=>{
 const state=S.normalize({});state.chapters.orientation.checks=[1,2,3];state.chapters.orientation.exercise='practiced';
 const C=require('../src/course.js').chapters.find(ch=>ch.id==='orientation');for(const q of C.questions)state.chapters.orientation.quiz[q.id]=[q.correct];
 state.completions.orientation.referencesReviewed=true;state.completions.orientation.notesVisited=true;assert.equal(S.finish(state,'orientation'),true);
 const before=S.courseSummary(state),reward=J.reward(before.complete,before.total);
 for(const item of M.additions){M.outcome(state,item,'practiced');M.availability(state,item,'unavailable');}
 assert.deepEqual(S.courseSummary(state),before);assert.deepEqual(J.reward(before.complete,before.total),reward);
 const invalid=S.normalize({miniLessons:{invalid:{outcome:'practiced'},'optional.image-edit':{outcome:'fake',availability:'fake',evidence:100}},resume:{view:'mini',mini:'missing'},miniFallbacks:['bad','optional.image-edit']});
 assert.equal(invalid.resume.view,'lesson');assert.equal(invalid.miniLessons.invalid,undefined);assert.deepEqual(invalid.miniFallbacks,[]);
 assert.equal(invalid.miniLessons['optional.image-edit'].outcome,'not-started');
});
test('new optional guides supply inspectable outcomes and invalid mutations cannot create credit',()=>{
 const state=S.normalize({});for(const item of M.additions){const guide=M.guide(state,item);for(const key of ['materials','prompt','expected','failure','recovery','check'])assert.ok(guide[key].length>20,item.id+':'+key);}
 const item=M.additions[0];M.outcome(state,item,'fake');M.availability(state,item,'fake');M.evidence(state,item,'x'.repeat(1500));
 assert.equal(M.record(state,item).outcome,'not-started');assert.equal(M.record(state,item).availability,'unknown');assert.equal(M.record(state,item).evidence.length,1000);
});
test('an entirely completed legacy course keeps its title when split activities are introduced',()=>{
 const C=require('../src/content.js'),Course=require('../src/course.js');const raw={checks:[1,2,3],exercise:'practiced',quiz:Object.fromEntries(C.questions.map(q=>[q.id,[q.correct]])),context:{checks:[1,2,3,4],exercise:'practiced',quiz:Object.fromEntries(C.context.questions.map(q=>[q.id,[q.correct]]))},chapters:Object.fromEntries(Course.chapters.map(ch=>[ch.id,{checks:ch.steps.map((_,i)=>i+1),exercise:'practiced',quiz:Object.fromEntries(ch.questions.map(q=>[q.id,[q.correct]]))}]))};
 const state=S.normalize(raw),summary=S.courseSummary(state);assert.equal(summary.complete,17);assert.equal(J.reward(summary.complete,summary.total).title,'AI Trailblazer');
 assert.equal(M.additions.every(i=>M.record(state,i).outcome==='not-started'),true);
 assert.equal(M.summary(state).practiced,55);
 const next=R.next(state);assert.ok(next.miniId);assert.match(next.reason,/Optional/);
 const restored=S.normalize(JSON.parse(JSON.stringify(state)));assert.deepEqual(S.courseSummary(restored),summary);
});
