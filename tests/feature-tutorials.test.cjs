const {test}=require('node:test'),assert=require('node:assert/strict'),T=require('../src/feature-tutorials.js'),S=require('../src/state.js');
test('Scheduled pilot teaches the full feature lifecycle with direct learner actions',()=>{
 const lesson=T.scheduled;assert.equal(lesson.steps.length,8);assert.match(lesson.steps[0].body.join(' '),/saved instructions later/);
 for(const index of [1,2,3,4,5,6])assert.ok(lesson.steps[index].actions.length>=3);
 assert.match(lesson.steps[5].title,/Change/);assert.match(lesson.steps[6].title,/Pause/);assert.equal(lesson.steps.filter(step=>step.compose).length,1);
 assert.doesNotMatch(lesson.steps.map(step=>(step.actions||[]).join(' ')).join(' '),/run node|git init|check-tracker/i);
});
test('feature-trial history and resume round-trip without changing old chapter credit',()=>{
 const state=S.normalize({notes:'My old note',resume:{view:'feature'},featureTutorials:{scheduled:{step:99,practiced:true,unavailable:false}}});assert.equal(state.resume.view,'feature');assert.equal(state.featureTutorials.scheduled.step,7);assert.equal(state.featureTutorials.scheduled.practiced,true);assert.equal(S.courseSummary(state).complete,0);assert.equal(state.notes,'My old note');assert.deepEqual(S.normalize(JSON.parse(JSON.stringify(state))),state);
 const invalid=S.normalize({featureTutorials:{scheduled:{step:'7',practiced:'yes'}}});assert.equal(invalid.featureTutorials.scheduled.step,0);assert.equal(invalid.featureTutorials.scheduled.practiced,false);
});
test('each written feature has its own actionable lesson and visible coverage boundary',()=>{
 const sources=require('../src/course.js').sources;assert.equal(new Set(T.inventory.map(item=>item.id)).size,T.inventory.length);assert.equal(T.lessons.length,64);assert.equal(T.inventory.filter(item=>item.status==='to-write').length,0);
 assert.ok(new Set(T.lessons.map(lesson=>lesson.steps.length)).size>=3);
 for(const lesson of T.lessons){assert.ok(sources[lesson.source],lesson.id);for(const key of lesson.references||[])assert.ok(sources[key],key);for(const id of lesson.prerequisites||[]){assert.ok(T.get(id),lesson.id+' needs '+id);assert.notEqual(id,lesson.id);}assert.ok(lesson.controls.length>=2);assert.ok(lesson.transfer.length>20);assert.ok(lesson.steps.length>=3);assert.equal(lesson.steps.at(-1).finish,true);for(const step of lesson.steps){assert.ok(step.title);assert.ok(step.expect.length>20);if(step.actions)assert.ok(step.actions.length>=2);else assert.ok(step.body.length>0);assert.equal(step.prompt,undefined);}}
 for(const item of T.inventory.filter(item=>item.status==='to-write'))assert.equal(T.get(item.id),undefined);
});
test('independent feature notes, steps and availability normalize without altering earlier learning',()=>{
 const before=S.normalize({notes:'Earlier private note',checks:[1],featureTutorials:{projects:{step:900,practiced:true,unavailable:true,note:'x'.repeat(5000)},dictation:{step:900},'not-a-feature':{practiced:true}}}),summary=S.courseSummary(before);
 assert.equal(before.featureTutorials.projects.step,T.get('projects').steps.length-1);assert.equal(before.featureTutorials.dictation.step,2);assert.equal(before.featureTutorials.projects.note.length,4000);assert.equal(before.featureTutorials.projects.practiced,true);assert.equal(before.featureTutorials.projects.unavailable,true);assert.equal(before.featureTutorials['not-a-feature'],undefined);
 assert.equal(before.notes,'Earlier private note');assert.deepEqual(before.checks,[1]);assert.deepEqual(S.courseSummary(S.normalize(JSON.parse(JSON.stringify(before)))),summary);
});
test('resume selects the exact feature and retains the earlier Scheduled pilot fallback',()=>{
 assert.equal(S.normalize({resume:{view:'feature',feature:'image-edit'}}).resume.feature,'image-edit');assert.equal(S.normalize({resume:{view:'feature'}}).resume.feature,'scheduled');assert.equal(S.normalize({resume:{view:'feature',feature:'not-written'}}).resume.feature,'scheduled');
});

test('adding the second batch preserves an earlier feature record and starts new trials untouched',()=>{
 const state=S.normalize({resume:{view:'feature',feature:'projects'},featureTutorials:{projects:{step:2,practiced:true,unavailable:false,note:'My sources stay in this project.'}}});
 assert.equal(state.resume.feature,'projects');assert.equal(state.featureTutorials.projects.note,'My sources stay in this project.');assert.equal(state.featureTutorials.projects.practiced,true);
 for(const id of ['plus-menu','fresh-chat','screenshots','chatgpt-memory','plan-mode','usage'])assert.deepEqual(state.featureTutorials[id],{step:0,practiced:false,unavailable:false,note:''});
 assert.deepEqual(S.normalize(JSON.parse(JSON.stringify(state))),state);
});

test('new control tutorials preserve existing progress and never inherit practice from earlier chapters',()=>{
 const old={resume:{view:'feature',feature:'plan-mode'},featureTutorials:{'plan-mode':{step:2,practiced:true,note:'My reviewed plan.'}},notes:'Earlier chapter note'};
 const state=S.normalize(old);assert.equal(state.resume.feature,'plan-mode');assert.equal(state.featureTutorials['plan-mode'].step,2);assert.equal(state.featureTutorials['plan-mode'].note,'My reviewed plan.');assert.equal(state.notes,'Earlier chapter note');
 for(const id of ['goals','permissions','notifications','appshots','local-folders','mentions','skill-picker'])assert.deepEqual(state.featureTutorials[id],{step:0,practiced:false,unavailable:false,note:''});
 const trial=S.normalize({...state,resume:{view:'feature',feature:'skill-picker'},featureTutorials:{...state.featureTutorials,'skill-picker':{step:3,unavailable:true,note:'No suitable installed skill.'}}});
 assert.equal(trial.resume.feature,'skill-picker');assert.equal(trial.featureTutorials['skill-picker'].unavailable,true);assert.equal(trial.featureTutorials['skill-picker'].practiced,false);assert.equal(trial.featureTutorials.mentions.unavailable,false);assert.deepEqual(S.normalize(JSON.parse(JSON.stringify(trial))),trial);
});

test('the final inventory starts new advanced practice independently and keeps earlier feature notes',()=>{
 const remaining=require('../src/feature-lessons-remaining.js').lessons;
 const saved=S.normalize({featureTutorials:{projects:{practiced:true,step:2,note:'My project note.'},mcp:{practiced:true,step:3,note:'My earlier server trial.'}},resume:{view:'feature',feature:'mcp'}});
 assert.equal(remaining.length,24);assert.equal(saved.featureTutorials.mcp.note,'My earlier server trial.');assert.equal(saved.resume.feature,'mcp');
 for(const lesson of remaining)assert.deepEqual(saved.featureTutorials[lesson.id],{step:0,practiced:false,unavailable:false,note:''},lesson.id);
 const updated=S.normalize({...saved,resume:{view:'feature',feature:'worktrees'},featureTutorials:{...saved.featureTutorials,worktrees:{step:2,note:'My isolated path',unavailable:true}}});
 assert.equal(updated.resume.feature,'worktrees');assert.equal(updated.featureTutorials.worktrees.step,2);assert.equal(updated.featureTutorials.worktrees.practiced,false);assert.equal(updated.featureTutorials.git.unavailable,false);assert.deepEqual(S.normalize(JSON.parse(JSON.stringify(updated))),updated);
});
