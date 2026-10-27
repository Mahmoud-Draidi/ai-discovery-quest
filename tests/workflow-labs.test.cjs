const {test}=require('node:test'),assert=require('node:assert/strict'),W=require('../src/workflow-labs.js'),S=require('../src/state.js');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawnSync}=require('node:child_process');
function scratch(fn){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'quest-workflow-'));try{return fn(dir);}finally{const resolved=path.resolve(dir),root=path.resolve(os.tmpdir());assert.ok(resolved.startsWith(root+path.sep)&&path.basename(resolved).startsWith('quest-workflow-'));fs.rmSync(resolved,{recursive:true,force:true});}}
const run=(dir,file,...args)=>spawnSync(process.execPath,[path.join(dir,file),...args],{cwd:dir,encoding:'utf8',timeout:10000,windowsHide:true});
test('eight labs supply setup, intermediate examples, checks, recovery and cleanup with valid sources',()=>{
 assert.equal(W.labs.length,8);assert.equal(new Set(W.labs.map(l=>l.id)).size,8);const sources=require('../src/course.js').sources;
 for(const lab of W.labs){for(const key of ['setup','recovery','cleanup'])assert.ok(lab[key].length>50,lab.id+key);for(const id of lab.sources)assert.ok(sources[id]);assert.ok(lab.steps.length>=3);for(const step of lab.steps){for(const key of ['title','action','prompt','example','check'])assert.ok(step[key].length>10);assert.doesNotMatch(step.prompt,/\[(?:folder|model|time|timezone|path)\]/i);}}
 assert.equal(W.forExercise('delegation',0).id,'subagents');assert.equal(W.forExercise('delegation',1).id,'models');assert.equal(W.forExercise('delegation',2).id,'chats');assert.equal(W.forExercise('capstone',3).id,'schedule');assert.equal(W.forExercise('feature-lab',0),null);
});
test('guide positions survive saves without granting exercise checks or XP',()=>{
 const before=S.normalize({notes:'Keep my note',workflowSteps:{models:2,hook:999,review:-8,browser:'3',unknown:1}}),progress=S.courseSummary(before);
 assert.equal(before.workflowSteps.models,2);assert.equal(before.workflowSteps.hook,3);assert.equal(before.workflowSteps.review,0);assert.equal(before.workflowSteps.browser,0);assert.equal(before.workflowSteps.unknown,undefined);
 assert.deepEqual(S.normalize(JSON.parse(JSON.stringify(before))),before);assert.equal(progress.complete,0);assert.deepEqual(before.checks,[]);
 before.workflowSteps.models=0;assert.deepEqual(S.courseSummary(before),progress);assert.equal(before.notes,'Keep my note');
});
test('supplied starter actually runs; checker reports real failure after data changes',()=>scratch(dir=>{
 for(const file of W.files)fs.writeFileSync(path.join(dir,file.name),file.text);
 assert.equal(run(dir,'learning-tracker.cjs').status,0);assert.match(run(dir,'learning-tracker.cjs').stdout,/2 of 3 completed/);
 assert.equal(run(dir,'check-tracker.cjs').status,0);
 const file=path.join(dir,'learning-tracker.cjs');fs.writeFileSync(file,fs.readFileSync(file,'utf8').replace('completed: false','completed: true'));
 const failed=run(dir,'check-tracker.cjs');assert.equal(failed.status,1);assert.match(failed.stderr,/FAIL/);
}));
test('disclosed empty-input defect fails; a minimal guard passes all supplied regression cases',()=>scratch(dir=>{
 fs.writeFileSync(path.join(dir,'completion.cjs'),W.bug);fs.writeFileSync(path.join(dir,'test-completion.cjs'),W.tests);
 const broken=run(dir,'test-completion.cjs');assert.equal(broken.status,1);assert.match(broken.stderr,/NaN/);
 fs.writeFileSync(path.join(dir,'completion.cjs'),W.bug.replace('Math.round(done / lessons.length * 100)','lessons.length === 0 ? 0 : Math.round(done / lessons.length * 100)'));
 const repaired=run(dir,'test-completion.cjs');assert.equal(repaired.status,0);assert.match(repaired.stdout,/four percentage cases and unchanged input/);
}));
test('manual hook helper emits valid non-blocking JSON and logs only its local checker result',()=>scratch(dir=>{
 for(const file of W.files)fs.writeFileSync(path.join(dir,file.name),file.text);fs.writeFileSync(path.join(dir,'quest-hook-demo.cjs'),W.hook);
 let result=run(dir,'quest-hook-demo.cjs');assert.equal(result.status,0);const output=JSON.parse(result.stdout);assert.match(output.systemMessage,/passed/);assert.equal(output.decision,undefined);
 let lines=fs.readFileSync(path.join(dir,'quest-hook-demo.log'),'utf8').trim().split('\n').map(JSON.parse);assert.equal(lines.length,1);assert.equal(lines[0].source,'manual');assert.equal(lines[0].passed,true);
 fs.writeFileSync(path.join(dir,'learning-tracker.cjs'),'process.exitCode=1;');result=run(dir,'quest-hook-demo.cjs');assert.equal(result.status,0);assert.match(JSON.parse(result.stdout).systemMessage,/failed/);
 lines=fs.readFileSync(path.join(dir,'quest-hook-demo.log'),'utf8').trim().split('\n').map(JSON.parse);assert.equal(lines.length,2);assert.equal(lines[1].passed,false);
}));
test('related guide choices are validated and survive backup without changing completed chapters',()=>{
 const base=S.normalize({workflowChoices:{'delegation:0':'models','capstone:3':'schedule','bad-key':'hook','mini:delegation.parallel-agents':'subagents','coding:0':'missing'}});
 assert.equal(base.workflowChoices['delegation:0'],'models');assert.equal(base.workflowChoices['mini:delegation.parallel-agents'],'subagents');assert.equal(base.workflowChoices['bad-key'],undefined);assert.equal(base.workflowChoices['coding:0'],undefined);
 assert.deepEqual(S.normalize(JSON.parse(JSON.stringify(base))).workflowChoices,base.workflowChoices);assert.equal(S.courseSummary(base).complete,0);assert.deepEqual(base.chapters.delegation.checks,[]);
});
