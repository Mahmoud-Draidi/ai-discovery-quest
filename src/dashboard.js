function learningTaskButton(task,label,cls='secondary'){
 if(task.miniId)return `<button class="${cls}" data-open-mini="${esc(task.miniId)}">${esc(label)}</button>`;
 return `<button class="${cls}" data-open-learning-task="${esc(task.id)}:${task.index}:${task.kind||'practice'}">${esc(label)}</button>`;
}
function openLearningTask(id,index,kind='practice'){
 const R=window.QuestRecommendations;
 if(!learningOrder().includes(id)||!Number.isInteger(index)||index<0||index>=R.steps(id).length)return;
 if(!['practice','prepare','quiz','reference','notes','learn'].includes(kind))return;
 selectedChapter=['foundation','context'].includes(id)?'orientation':id;
 R.value(state,id).step=index;
 const section=kind==='prepare'?'learn':kind;
 if(id==='foundation'){tab=section;if(tab==='quiz'){questionIndex=C.questions.findIndex(q=>!S.solved(state,q));if(questionIndex<0)questionIndex=C.questions.length;}}
 else if(id==='context'){contextTab=section;if(contextTab==='quiz')contextQuestion=contextNextQuestion();}
 else{chapterTab=section;if(chapterTab==='quiz')chapterQuestion=nextCourseQuestion();}
 navigate(id==='foundation'?'lesson':id==='context'?'context':'chapter');
}
function recommendationPanel(){
 const R=window.QuestRecommendations,next=R.next(state);
 const id=state.resume.view==='lesson'?'foundation':state.resume.view==='context'?'context':state.resume.chapter;
 const current=R.value(state,id),same=state.resume.view==='mini'?next?.miniId===state.resume.mini:next?.id===id&&next?.index===current.step&&(state.resume.tab===next?.kind||(state.resume.tab==='learn'&&next?.kind==='practice'));
 if(!next)return `<section class="panel next-activity"><h2>${S.courseSummary(state).complete===S.courseSummary(state).total?'You completed every chapter.':'Choose what to revisit.'}</h2><p>${S.courseSummary(state).complete===S.courseSummary(state).total?'Explore the reference or put your skills to work.':'The remaining exercises are postponed or unavailable. Nothing has been marked complete for you. Use the revisit list or choose a chapter.'}</p>${button('Choose a chapter','course','secondary')}</section>`;
 return `<section class="panel next-activity"><span class="pill">RECOMMENDED NEXT</span><h2>${esc(next.title)}</h2><p>${esc(next.chapter)}</p><p>${esc(next.reason)}</p>${same?'<p class="muted">This is also your current task. Use Resume to continue.</p>':learningTaskButton(next,next.kind==='prepare'?'Review preparation →':'Open recommended activity →','primary')}<p class="muted">This is a suggestion. You can choose any chapter; no new completion credit is granted by opening it.</p></section>`;
}
function revisitPanel(){
 const list=window.QuestRecommendations.revisit(state);
 if(!list.length)return '';
 return `<section class="panel revisit-panel"><div class="section-heading"><h2>Revisit later</h2><span>${list.length} exercise${list.length===1?'':'s'}</span></div>${list.length?`<p>Your completed work stays saved. Return when you have the tool, preparation or help you need.</p>${list.map(task=>`<details class="revisit-item"><summary>${esc(task.chapter)} · ${esc(task.title)} <span class="muted">— ${esc(task.availability==='unavailable'?'Unavailable':task.availability==='needs-setup'?'Needs setup':task.status==='skipped'?'Skipped':'Deferred')}</span></summary><p><strong>Next recovery step:</strong> ${esc(task.recovery)}</p><p class="muted">${task.reason?`Saved reason: ${esc(({unavailable:'tool unavailable',preparation:'preparation missing',help:'need help',later:'revisit later'})[task.reason]||task.reason)}`:'No reason recorded; you can add one in the exercise.'}</p>${learningTaskButton(task,'Return to this exercise →')}</details>`).join('')}`:'<p>No postponed exercises yet. Skip, Revisit later and Unavailable actions will keep tasks here without awarding completion.</p>'}</section>`;
}
function currentTaskDescription(){
 if(state.resume.view==='feature'){const lesson=window.QuestFeatureTutorials.get(state.resume.feature||'scheduled');return `${lesson.title} · ${lesson.steps[state.featureTutorials[lesson.id].step].title}`;}
 if(state.resume.view==='mini')return `Mini-lesson · ${window.QuestMiniLessons.get(state.resume.mini).title}`;
 const R=window.QuestRecommendations,id=state.resume.view==='lesson'?'foundation':state.resume.view==='context'?'context':state.resume.chapter;
 const section=state.resume.tab,v=R.value(state,id);
 const stage=section==='practice'?R.steps(id)[v.step].title:({learn:'Understand',quiz:'Knowledge check',reference:'Questions & sources',notes:'My note'})[section];
 return `${R.title(id)} · ${stage}`;
}
function chapterRemaining(id){
 const R=window.QuestRecommendations,summary=S.getSummary(state,id),v=R.value(state,id),left=R.steps(id).length-v.checks.length;
 if(summary.complete)return '';
 const total=id==='foundation'?C.questions.length:id==='context'?C.context.questions.length:Course.chapters.find(ch=>ch.id===id).questions.length;
 const parts=[left?`${left} exercise${left===1?'':'s'}`:null,summary.correct<total?`${total-summary.correct} knowledge question${total-summary.correct===1?'':'s'}`:null,!state.completions[id].referencesReviewed?'Questions & sources':null,'the final completion action'].filter(Boolean);
 return `<p class="remaining-work">Still to finish: ${esc(parts.join(', '))}. Writing a note is optional.</p>`;
}
