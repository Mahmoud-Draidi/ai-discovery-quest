const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{execFileSync}=require('node:child_process');
const {sourceSnapshot}=require('../scripts/release-preflight.cjs');
function fixture(fn){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'quest-release-preflight-'));const git=(...args)=>execFileSync('git',args,{cwd:dir,encoding:'utf8',windowsHide:true,stdio:['ignore','pipe','pipe'],env:{...process.env,GIT_CONFIG_GLOBAL:path.join(dir,'no-global-config'),GIT_CONFIG_NOSYSTEM:'1',GIT_AUTHOR_NAME:'Release test fixture',GIT_AUTHOR_EMAIL:'fixture@example.invalid',GIT_COMMITTER_NAME:'Release test fixture',GIT_COMMITTER_EMAIL:'fixture@example.invalid'}});
 try{fs.mkdirSync(path.join(dir,'src'));git('init','-b','main');fs.writeFileSync(path.join(dir,'src/main.cjs'),'// Runtime fixture\n');fs.writeFileSync(path.join(dir,'src/index.html'),'<!doctype html><title>Fixture</title>');fs.writeFileSync(path.join(dir,'.gitignore'),'src/progress.json\nwork/\n');git('add','.');git('-c','commit.gpgsign=false','commit','-m','Public runtime fixture');return fn(dir,git);}finally{const resolved=path.resolve(dir),temp=path.resolve(os.tmpdir());assert.ok(resolved.startsWith(temp+path.sep)&&path.basename(resolved).startsWith('quest-release-preflight-'));fs.rmSync(resolved,{recursive:true,force:true});}}
test('release payload includes tracked runtime files and excludes ignored notes and work',()=>fixture((dir,git)=>{
 fs.writeFileSync(path.join(dir,'src/progress.json'),'Fixture private note — never ship');fs.mkdirSync(path.join(dir,'work'));fs.writeFileSync(path.join(dir,'work/note.txt'),'Fixture scratch data');
 const snapshot=sourceSnapshot(dir);assert.deepEqual(snapshot.sourceFiles,['src/index.html','src/main.cjs']);assert.equal(snapshot.sourceCommit,git('rev-parse','HEAD').trim());assert.equal(snapshot.sourceDirty,false);
}));
test('dirty or untracked source and a nested folder cannot be packaged as a clean revision',()=>fixture(dir=>{
 fs.appendFileSync(path.join(dir,'src/main.cjs'),'// Uncommitted change');assert.throws(()=>sourceSnapshot(dir),/must be clean/);
 assert.throws(()=>sourceSnapshot(path.join(dir,'src')),/repository root/);
}));
test('a mistakenly tracked private progress file is rejected even in a clean checkout',()=>fixture((dir,git)=>{
 fs.writeFileSync(path.join(dir,'src/progress.json'),'Non-sensitive test fixture');git('add','-f','src/progress.json');git('-c','commit.gpgsign=false','commit','-m','Deliberately invalid fixture payload');assert.throws(()=>sourceSnapshot(dir),/private file/);
}));
test('untracked runtime code requires a reviewed commit before packaging',()=>fixture(dir=>{
 fs.writeFileSync(path.join(dir,'src/new-ui.js'),'// New uncommitted runtime');assert.throws(()=>sourceSnapshot(dir),/must be clean/);
}));
