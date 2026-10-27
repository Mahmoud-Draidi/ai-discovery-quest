(function(root){
 const S=typeof module!=='undefined'?require('./state.js'):root.QuestState;
 const C=typeof module!=='undefined'?require('./course.js'):root.QuestCourse;
 const B=typeof module!=='undefined'?require('./content.js'):root.QuestContent;
 const G=typeof module!=='undefined'?require('./practice-guides.js'):root.QuestPracticeGuides;
 const M=typeof module!=='undefined'?require('./mini-lessons.js'):root.QuestMiniLessons;
 const title=id=>id==='foundation'?'Models, tools & skills':id==='context'?'Files, context & continuity':C.chapters.find(ch=>ch.id===id)?.title||id;
 const value=(state,id)=>id==='foundation'?state:id==='context'?state.context:state.chapters[id];
 const steps=id=>id==='foundation'?[0,1,2].map(i=>G.baseStep(id,i)):id==='context'?B.context.steps:C.chapters.find(ch=>ch.id===id).steps;
 const prerequisites=id=>id==='foundation'?['orientation']:id==='context'?['foundation']:C.chapters.find(ch=>ch.id===id)?.prerequisites||[];
 function tasks(state){return C.order.flatMap(id=>steps(id).map((step,index)=>{
  const v=value(state,id),done=v.checks.includes(index+1),availability=v.stepAvailability[index+1]||'unknown';
  const status=done?'done':v.stepStatus[index+1]||(['skipped','deferred'].includes(v.exercise)?v.exercise:'not-started');
  const missing=state.preparation[id]?[]:prerequisites(id).filter(dep=>!S.getSummary(state,dep).complete);
  // Later steps consume concrete earlier artifacts in these three opening routes.
  const prior=id==='foundation'&&index>0?0:id==='context'&&index>0?index-1:null;
  const needsEarlier=prior!==null&&!v.checks.includes(prior+1);
  return {key:`${id}:${index}`,id,index,title:step.title,chapter:title(id),done,availability,status,reason:v.stepReasons[index+1]||'',missing,needsEarlier,
   postponed:!done&&(['deferred','skipped'].includes(status)||['unavailable','needs-setup'].includes(availability)),recovery:G.get(id,index).recovery};
 }));}
 function optionalTasks(state){return M.additions.map(item=>{const r=M.record(state,item);return {miniId:item.id,id:item.chapter,index:-1,title:item.title,chapter:'Optional mini-lesson · '+title(item.chapter),done:r.outcome==='practiced',status:r.outcome,availability:r.availability,postponed:['deferred','skipped'].includes(r.outcome)||['unavailable','needs-setup'].includes(r.availability),recovery:M.guide(state,item).recovery};});}
 function revisit(state){return [...tasks(state).filter(task=>task.postponed),...optionalTasks(state).filter(task=>task.postponed&&!task.done)];}
 function next(state){
  const all=tasks(state),resumed=state.resume.view==='lesson'?'foundation':state.resume.view==='context'?'context':state.resume.chapter;
  // Finish the actual remaining chapter stages rather than recommending more practice.
  for(const id of C.order){
   const v=value(state,id),summary=S.getSummary(state,id);
   if(summary.complete)continue;
   if(v.exercise!=='practiced'&&steps(id).every((_,i)=>v.checks.includes(i+1)))return {id,index:v.step,kind:'practice',title:'Review your recorded practice',chapter:title(id),reason:'An older record has every exercise checked but practice is not confirmed. If you actually completed it, use Undo and Mark exercise done on the current exercise to confirm it.'};
   if(v.exercise==='practiced'&&steps(id).every((_,i)=>v.checks.includes(i+1))){
    const kind=!summary.ready?'quiz':!state.completions[id].referencesReviewed?'reference':'notes';
    return {id,index:v.step,kind,title:kind==='quiz'?'Check your understanding':kind==='reference'?'Review Questions & sources':'Finish this chapter',chapter:title(id),reason:kind==='quiz'?'Your practical exercises are done. The knowledge check remains.':kind==='reference'?'Practice and the knowledge check are done. Review the questions before your optional note.':'Your note is optional. Use the final completion button when ready.'};
   }
  }
  const candidates=all.filter(task=>!task.done&&!task.postponed&&!task.missing.length&&!task.needsEarlier&&!S.getSummary(state,task.id).complete);
  candidates.sort((a,b)=>{
   const score=t=>(t.id===resumed&&t.index===value(state,t.id).step?4:0)+(t.availability==='available'?2:0);
   return score(b)-score(a);
  });
  const task=candidates[0];
  if(task)return {...task,kind:'practice',reason:task.availability==='available'?'You reported the tool available, and preparation is recorded.':'No missing preparation is recorded. Availability is untested; check the listed tools before starting.'};
  // Optional capabilities never displace the core course. Offer them once its preparation is complete.
  if(C.order.every(id=>S.getSummary(state,id).complete)){
   const optional=optionalTasks(state).find(task=>!task.done&&!task.postponed&&task.status!=='reviewed');
   if(optional)return {...optional,kind:'practice',reason:'Optional independent practice. It does not change chapter completion or XP; verify access before trying it.'};
  }
  const blocked=all.find(task=>!task.done&&!task.postponed);
  return blocked?{...blocked,kind:'prepare',reason:blocked.needsEarlier?'This exercise uses an earlier result. Return to the preceding exercise first.':`Preparation is not recorded: ${blocked.missing.map(title).join('; ')}. You can explore it or explicitly record equivalent preparation.`}:null;
 }
 const api={tasks,optionalTasks,revisit,next,value,steps,prerequisites,title};if(typeof module!=='undefined')module.exports=api;else root.QuestRecommendations=api;
})(typeof window!=='undefined'?window:globalThis);
