const {test}=require('node:test'),assert=require('node:assert/strict'),L=require('../src/lesson-support.js');
test('required beginner vocabulary has a short definition and a concrete course example',()=>{
 for(const id of ['model','tool','skill','plugin','mcp','context','token','runtime','repository','staging','commit','branch','remote','push','pr','worktree']){const term=L.terms.find(t=>t.id===id);assert.ok(term,id);assert.ok(term.definition.length>20);assert.ok(term.example.length>20);}
 assert.equal(new Set(L.terms.map(t=>t.id)).size,L.terms.length);
});
test('worked Git example distinguishes local files, staged content, commits and the online base',()=>{
 assert.deepEqual(L.git.map(s=>s.id),['working','staging','commit','branch','push','pr','merge']);
 assert.notEqual(L.git[0].working,L.git[0].staged);assert.equal(L.git[1].working,L.git[1].staged);assert.notEqual(L.git[1].staged,L.git[1].committed);
 assert.equal(L.git[2].online,'Not uploaded');assert.match(L.git[4].online,/base unchanged/);assert.match(L.git[5].online,/base unchanged/);
 assert.match(L.git[6].text,/local checkout does not update/);
 assert.match(L.git[0].diff,/- const title.*\n\+ const title/);
});
test('recovery and context comparison cover the promised beginner boundaries',()=>{
 for(const id of ['zip','tools','identity','folder','push','conflict','handoff']){const help=L.recovery.find(t=>t.id===id);assert.ok(help);assert.ok(help.prompt.length>100);}
 assert.match(L.recovery.find(t=>t.id==='identity').prompt,/Do not invent/);
 assert.match(L.recovery.find(t=>t.id==='push').prompt,/Do not.*force-push/);
 assert.deepEqual(L.boundaries.map(t=>t.id),['message','project','file','fresh','scope']);
 for(const item of L.boundaries){assert.ok(item.input);assert.ok(item.expected);assert.ok(item.limit);}
});
test('tracker and staging example match an actual disposable local Git repository',()=>{
 const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{execFileSync}=require('node:child_process');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'quest-git-example-')),file=path.join(dir,'learning-tracker.cjs');
 const git=(...args)=>execFileSync('git',args,{cwd:dir,encoding:'utf8',windowsHide:true,env:{...process.env,GIT_CONFIG_GLOBAL:path.join(dir,'no-global-config'),GIT_CONFIG_NOSYSTEM:'1',GIT_AUTHOR_NAME:'Learning example',GIT_AUTHOR_EMAIL:'example@example.invalid',GIT_COMMITTER_NAME:'Learning example',GIT_COMMITTER_EMAIL:'example@example.invalid'}});
 try{
  fs.writeFileSync(file,L.tracker);assert.match(execFileSync(process.execPath,[file],{encoding:'utf8',windowsHide:true}),/2 of 3 completed/);
  git('init','-b','main');git('add','--','learning-tracker.cjs');git('-c','commit.gpgsign=false','commit','-m','Initial fictional tracker');
  const edited=L.tracker.replace("'My AI Journey'","'My Practice Journey'");fs.writeFileSync(file,edited);
  assert.match(git('diff','--','learning-tracker.cjs'),/-const title.*\n\+const title/);assert.equal(git('show',':learning-tracker.cjs'),L.tracker);
  git('add','--','learning-tracker.cjs');assert.equal(git('show',':learning-tracker.cjs'),edited);
  fs.writeFileSync(file,edited+'// Later working edit\n');assert.notEqual(git('show',':learning-tracker.cjs'),fs.readFileSync(file,'utf8'));
  git('-c','commit.gpgsign=false','commit','-m','Rename fictional tracker');assert.equal(git('show','HEAD:learning-tracker.cjs'),edited);
  fs.writeFileSync(file,edited);git('switch','-c','exercise/remaining');
  fs.appendFileSync(file,'console.log(`Remaining: ${lessons.filter(lesson => !lesson.completed).length}`);\n');
  assert.match(execFileSync(process.execPath,[file],{encoding:'utf8',windowsHide:true}),/Remaining: 1/);
  assert.equal(git('show','main:learning-tracker.cjs'),edited);assert.ok(git('diff','--','learning-tracker.cjs').includes('Remaining:'));
 }finally{const resolved=path.resolve(dir),tempRoot=path.resolve(os.tmpdir());assert.ok(resolved.startsWith(tempRoot+path.sep)&&path.basename(resolved).startsWith('quest-git-example-'));fs.rmSync(resolved,{recursive:true,force:true});}
});
