const {test}=require('node:test');
const assert=require('node:assert/strict');
const M=require('../src/learning-map.js');
const S=require('../src/state.js');
const C=require('../src/course.js');

test('setup migration preserves learning and does not infer account access',()=>{
 const legacy=S.normalize({notes:'Keep my note',exercise:'practiced',checks:[1,2,3],quiz:{q1:[0],q2:[1],q3:[2]}});
 assert.equal(legacy.setup.files,'unknown');assert.equal(S.summary(legacy).complete,true);
 const updated=S.normalize({...legacy,setup:{complete:true,surface:'windows',workflow:'work',experience:'new'}});
 assert.equal(updated.setup.files,'unknown');assert.equal(updated.notes,'Keep my note');
 assert.deepEqual(updated.completions,legacy.completions);
 assert.deepEqual(S.normalize(updated),updated);
 assert.equal(S.courseSummary(S.normalize({setup:{complete:true,files:'available'}})).complete,0);
});
test('observations are bounded and invalid setup values stay unknown',()=>{
 const value=M.normalizeSetup({surface:'paid',workflow:null,files:'yes',modeLabel:123,modelLabel:' A\nB'+ 'x'.repeat(200)});
 assert.equal(value.surface,'unknown');assert.equal(value.workflow,'unknown');assert.equal(value.files,'unknown');
 assert.equal(value.modeLabel,'');assert.equal(value.modelLabel.length,100);assert.doesNotMatch(value.modelLabel,/\n/);
});
test('prepared prompt supplies missing observations rather than unfilled placeholders',()=>{
 const missing=M.inventoryPrompt({});assert.match(missing,/Mode label: Not found/);assert.match(missing,/Model label: Not found/);
 assert.doesNotMatch(missing,/\[.*?\]/);
 const actual=M.inventoryPrompt({surface:'windows',modeLabel:'Work',modelLabel:'My actual label'});
 assert.match(actual,/Model label: My actual label/);assert.match(actual,/Do not claim you can see my screen/);
});
test('coverage distinguishes unfinished teaching and links to real chapters',()=>{
 const ids=new Set(['foundation','context',...C.chapters.map(ch=>ch.id)]);
 assert.equal(new Set(M.items.map(item=>item.id)).size,M.items.length);
 for(const item of M.items){assert.ok(M.labels[item.status]);assert.ok(item.detail);if(item.chapter)assert.ok(ids.has(item.chapter),item.id);else assert.equal(item.status,item.id==='mini-lessons'?'outline':item.id==='glossary'?'reference':'planned');}
 assert.equal(M.items.find(item=>item.id==='passwords').status,'reference');
 assert.equal(M.items.find(item=>item.id==='subagents').status,'outline');
 assert.equal(M.items.find(item=>item.id==='glossary').status,'reference');
});
