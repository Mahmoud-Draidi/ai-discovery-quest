const path=require('node:path');
const {spawnSync}=require('node:child_process');
function sourceSnapshot(root){
 const git=(...args)=>{const result=spawnSync('git',args,{cwd:root,encoding:'utf8',windowsHide:true});if(result.error||result.status!==0)throw new Error('Release packaging requires an accessible Git checkout.');return result.stdout;};
 const canonical=value=>process.platform==='win32'?path.resolve(value).toLowerCase():path.resolve(value);
 if(canonical(git('rev-parse','--show-toplevel').trim())!==canonical(root))throw new Error('Build from the app repository root, not a folder inside another repository.');
 const sourceCommit=git('rev-parse','HEAD').trim();if(!/^[a-f0-9]{40,64}$/.test(sourceCommit))throw new Error('Cannot identify a committed source revision.');
 if(git('status','--porcelain','--untracked-files=normal').trim())throw new Error('Commit or preserve the reviewed changes before release packaging. The source checkout must be clean.');
 const sourceFiles=git('ls-files','-z','--','src').split('\0').filter(Boolean);
 if(!sourceFiles.includes('src/main.cjs')||!sourceFiles.includes('src/index.html'))throw new Error('Tracked runtime entry files are missing.');
 for(const file of sourceFiles){if(!file.startsWith('src/')||file.split('/').some(part=>part==='..'||part==='.git')||/(?:^|\/)(?:progress(?:-before-import-[^/]*)?\.json|AI-Discovery-Quest-progress\.json|LOCAL-LEARNING-RESUME\.json|\.env(?:\.[^/]*)?)$/i.test(file))throw new Error('Unexpected or private file in the tracked runtime payload: '+file);}
 return {sourceCommit,sourceDirty:false,sourceFiles};
}
module.exports={sourceSnapshot};
