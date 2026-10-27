// Shared navigation, feedback, and study support. No external actions are automated here.
function activeChapterId() { return view === "lesson" ? "foundation" : view === "context" ? "context" : selectedChapter; }
function setChapterTab(next) {
  if (view === "lesson") tab = next;
  else if (view === "context") contextTab = next;
  else chapterTab = next;
  save(); render();
  const panel = main.querySelector('.tab-content');
  if (panel) { panel.tabIndex = -1; panel.focus({preventScroll:true}); }
  window.scrollTo({top:0,left:0,behavior:"instant"});
}
function quizRecap() {
  return `<section class="panel quiz-finish"><h2>Knowledge check finished</h2><p>Next, explore the chapter’s questions and sources before your optional note.</p>${button("Continue to Questions & sources →", "review-questions")}</section>`;
}
function chapterFinishPanel(id, activeTab) {
  const info = S.getSummary(state,id), flow = state.completions[id];
  if (activeTab === "reference") return `<section class="panel finish-panel"><h2>Ready for a quick reflection?</h2><p>Expand every Common question before continuing to My note. Writing a note is optional. Expanded questions are remembered; all must still be open to continue.</p><p class="muted" id="question-review-status" role="status"></p><button class="primary" data-action="review-references" aria-describedby="question-review-status" disabled>I’ve reviewed this — continue to My note →</button></section>`;
  if (activeTab !== "notes") return "";
  if (info.complete) return `<section class="panel finish-panel"><h2>Chapter completed ✓</h2><p>Your progress and XP are saved. You can revisit or add a note anytime.</p>${button("Back to overview", "home")}</section>`;
  return `<section class="panel finish-panel"><h2>Finish this chapter</h2><p>Your note is optional. ${!info.ready ? "Complete the practical exercise and knowledge check first." : !flow.referencesReviewed || !flow.notesVisited ? "Review Questions & sources, then use its continue button to return here." : "You’re ready. Mark the chapter completed to earn 100 XP."}</p>${!flow.referencesReviewed || !flow.notesVisited ? button("Review Questions & sources →", "review-questions", "secondary") : ""}<button class="primary" data-action="finish-chapter" ${info.ready && flow.referencesReviewed && flow.notesVisited ? "" : "disabled"}>Mark chapter completed ✓</button></section>`;
}
function allCommonQuestionsExpanded() {
  const questions = [...main.querySelectorAll('.tab-content .chapter-questions > details')];
  return questions.length > 0 && questions.every(question => question.open);
}
function updateQuestionReview() {
  const control = main.querySelector('[data-action="review-references"]');
  if (!control) return;
  const questions = [...main.querySelectorAll('.tab-content .chapter-questions > details')];
  const expanded = questions.filter(question => question.open).length;
  control.disabled = !allCommonQuestionsExpanded();
  document.getElementById('question-review-status').textContent = `${expanded} of ${questions.length} questions expanded${control.disabled ? ' — expand all to continue.' : ' — ready to continue.'}`;
}
let celebrationTimer;
function showCelebration(kind, heading, detail, reward, next) {
  document.querySelector('.chapter-celebration')?.remove();
  clearTimeout(celebrationTimer);
  const celebration = document.createElement('div');
  celebration.id = kind === 'level' ? 'level-celebration' : 'chapter-celebration';
  celebration.className = `chapter-celebration ${kind === 'level' ? 'level-celebration' : ''}`;
  celebration.innerHTML = `<div class="celebration-card" role="status"><span class="celebration-check" aria-hidden="true">${kind === 'level' ? '✦' : '✓'}</span><h2>${esc(heading)}</h2><p>${esc(detail)}</p><strong>${esc(reward)}</strong><p>${kind === 'level' ? 'A new title for the skills you’ve earned.' : 'One more skill to put to use.'}</p><button class="secondary" id="dismiss-celebration">${next ? 'See my new title →' : 'Keep exploring →'}</button></div><div class="confetti" aria-hidden="true">${Array.from({length:18},()=>'<i></i>').join('')}</div>`;
  const dismiss = () => { clearTimeout(celebrationTimer); celebration.remove(); if(next)next();else main.focus({preventScroll:true}); };
  celebration.querySelector('button').addEventListener('click',dismiss,{once:true});
  celebration.addEventListener('keydown',event=>{if(event.key==='Escape')dismiss();});
  document.body.append(celebration);
  celebration.querySelector('button').focus({preventScroll:true});
  announce(`${heading} ${detail}. ${reward}.`);
  celebrationTimer = setTimeout(dismiss,kind === 'level' ? 6000 : 4200);
}
function celebrateChapter(id, newLevel) {
  showCelebration('chapter','Chapter completed!',chapterTitle(id),'+100 XP',newLevel ? ()=>showCelebration('level','Level up!',`You are now an ${newLevel.title}`,`Level ${newLevel.level}`) : null);
}
function chapterNavigation(id) {
  const value = id === 'foundation' ? state : id === 'context' ? state.context : state.chapters[id];
  return `<div class="chapter-links chapter-navigation" aria-label="Chapter navigation">${button("← All chapters", "course", "secondary")}${button(value.bookmarked ? "★ Chapter saved" : "☆ Save this chapter", "toggle-chapter-bookmark", "text-button")}</div>`;
}
function recommendedChapters(id) {
  if(id === 'foundation')return ['orientation'];
  if(id === 'context')return ['foundation'];
  return Course.chapters.find(ch=>ch.id===id)?.prerequisites || [];
}
function chapterLabel(id) {
  return id === 'orientation' ? 'App tour' : `Chapter ${id==='foundation'?1:id==='context'?2:Course.chapters.find(ch=>ch.id===id)?.number} — ${chapterTitle(id)}`;
}
function recommendationText(id) {
  const ids=recommendedChapters(id);
  return ids.length ? `Recommended first: ${ids.map(chapterLabel).join('; ')}` : id==='orientation' ? 'Recommended first: None — start here.' : 'Recommended first: None — explore anytime.';
}
function chapterTitle(id) {
  return id === "foundation" ? "Models, tools & skills" : id === "context" ? "Files, context & continuity" : Course.chapters.find(ch => ch.id === id)?.title || id;
}
function learningOrder() { return Course.order || ["foundation", "context", ...Course.chapters.map(ch => ch.id)]; }
function chapterButton(id, label, cls = "secondary") {
  return `<button class="${cls}" ${id === "foundation" ? 'data-action="start"' : id === "context" ? 'data-action="context"' : `data-chapter="${esc(id)}"`}>${esc(label || chapterTitle(id))}</button>`;
}
function statusLabel(value) { return ({"not-started":"Not started", "not-recorded":"Not recorded",practiced:"Practiced",explained:"Explained only",skipped:"Skipped",deferred:"Deferred"})[value] || value; }
function followingChapter(id) {
  const ids = learningOrder(); return ids[ids.indexOf(id) + 1];
}
function nextChapterLink(id) {
  const next = followingChapter(id);
  return next ? `<section class="panel next-chapter"><h2>Up next: ${esc(chapterTitle(next))}</h2>${prerequisitePanel(next)}${chapterButton(next,"Next chapter →")}</section>` : `<section class="panel next-chapter"><h2>Keep using what you learned</h2><p>Revisit your field guide, unfinished practice, and reference notes. Try the tracker workflow on a small task of your own.</p>${button("Open progress & backups", "journal", "secondary")}</section>`;
}
function prerequisitePanel(id) {
  const ids = recommendedChapters(id);
  return `<div class="prerequisite"><p>${esc(recommendationText(id))}</p>${ids.length?`<p class="muted">${state.preparation[id]?"You reported equivalent preparation. This does not complete any chapter.":"Recommendations use recorded preparation. You may still explore any chapter."}</p><button class="text-button" data-equivalent-preparation="${esc(id)}">${state.preparation[id]?"Clear equivalent preparation":"I already have equivalent preparation"}</button>`:""}${ids.length ? `<p class="muted">Suggested preparation. You can explore chapters in any order.</p><div class="chapter-links">${ids.map(id=>chapterButton(id,chapterLabel(id))).join("")}</div>` : ""}</div>`;
}
function earlyReference(id) {
  const entries = id === "context" ? C.context.library : C.library;
  const ids = id === "context" ? ["projects","memories","files"] : ["plugins","prompting"];
  return `<section class="chapter-questions"><h2>Common questions</h2>${entries.map(item => `<details class="panel" data-question-chapter="${id}" data-question-title="${esc(item.title)}" ${state.questionPanels[id].includes(item.title)?"open":""}><summary>${esc(item.title)}</summary><p>${esc(item.text)}</p></details>`).join("")}</section><section class="panel sources"><h2>Official references</h2><p>Content review: ${esc(Course.checkedOn)}. Check the source and your app before relying on a product-specific control.</p>${courseSources(ids)}</section>`;
}
function scopeGuide(ch) {
  const guide=ch.scopeGuide;
  if(!guide)return "";
  return `<section class="panel scope-guide"><h2 id="scope-guide-title" tabindex="-1">Context and memory scope</h2><p>Use this comparison to decide what to supply and what to inspect. It does not certify your account settings or promise full conversation transfer.</p><div class="table-scroll" role="region" aria-label="Context and memory scope table" tabindex="0"><table><caption>${esc(guide.caption)}</caption><thead><tr>${guide.columns.map(label=>`<th scope="col">${esc(label)}</th>`).join("")}</tr></thead><tbody>${guide.rows.map(row=>`<tr>${row.map((cell,i)=>i?`<td>${esc(cell)}</td>`:`<th scope="row">${esc(cell)}</th>`).join("")}</tr>`).join("")}</tbody></table></div><p>Product details checked ${esc(ch.reviewedOn || Course.checkedOn)}. Inspect your actual account and host before relying on a setting.</p>${courseSources(["projects","memories"])}</section>`;
}
function practiceGuide(id,index){return window.QuestPracticeGuides.get(id,index,state.setup);}
function exerciseBrief(guide,copyAction='copy-exercise-input'){
 const preparation=guide.chapter==='foundation'&&guide.index===0?'':`<details class="practice-preparation"><summary>Before you start</summary><p>${esc(guide.materials)}</p>${guide.inputChapter?chapterButton(guide.inputChapter,'Open the earlier lesson →','text-button'):''}${guide.sample&&guide.chapter!=='foundation'?`<details><summary>Need an example to work with?</summary><p>Use this if you do not have your own material for the exercise.</p><pre class="prompt">${esc(guide.sample)}</pre>${button('Copy example',copyAction,'secondary')}</details>`:''}</details>`;
 return `<section class="exercise-brief"><p class="muted">${esc(guide.minutes)} · setup may take longer</p>${preparation}</section>`;
}
function practiceSupport(step, copyKey) {
 const example=step.chapter==='foundation'&&step.index===0?`<details class="practice-example"><summary>See an example answer</summary><p>Your answer can use different examples. Look for a clear explanation of each role.</p><pre class="prompt">${esc(step.sample)}</pre></details>`:'';
 return `<aside class="practice-help"><h3>Check the result</h3><p>${esc(step.expected)}</p>${example}</aside><details class="practice-help exercise-help"><summary>Need help?</summary><h3>What might go wrong</h3><p>${esc(step.failure)}</p><h3>Try this</h3><p>${esc(step.recovery)}</p><p>If the feature is missing, choose Unavailable on my account below and try another activity.</p></details>${step.starter ? `<details class="practice-help"><summary>${esc(step.starter.title)}</summary><p>${esc(step.starter.text)}</p><pre class="prompt">${esc(step.starter.prompt)}</pre><button class="secondary" data-copy-starter="${esc(copyKey)}">Copy example handoff</button></details>` : ""}`;
}
function controlMap() {
  const controls = [
    ["Mode selector", "Chat / Work / Codex", "Choose the workflow; tool access can differ."],
    ["Project or folder", "Where are my files?", "Select a local workspace or supply a supported attachment."],
    ["Location", "Computer / Cloud", "Identify the host that will execute the task."],
    ["Model & effort", "Who reasons?", "Choose the model and reasoning setting where available."],
    ["+ / @", "Context & capabilities", "Attach files, select a tool or skill, or reference an app."],
    ["/ commands", "Chat controls", "Inspect status, planning, model controls or side chats."],
    ["Approval control", "May an action proceed?", "Review requests separately from resource access and sandbox boundaries."],
    ["Stop", "Interrupt work", "Inspect saved changes afterward; stop is not undo."],
    ["Microphone / voice", "Speak or dictate", "Check the voice interface; do not infer it uses the selected text model."],
    ["Sidebar", "Projects, chats, scheduled work", "Organize work and find prior tasks; availability varies."],
    ["Plugins / connections", "Tools and account access", "Inspect capabilities, authorization and approval policy separately."],
    ["Settings", "Memory, safety, hooks, usage", "Inspect scope and descriptions before changing anything."],
    ["Sites / images / maps", "Create or inspect outputs", "Choose by the result you need, then open and test that result."],
    ["Pets / Mini", "Interface shortcuts", "Try only if available; shortcuts do not imply stronger models."],
    ["Plan / Goal", "Propose / pursue", "Plan before implementation; define a bounded outcome for a goal."],
    ["Code Review / Git", "Inspect proposed changes", "Review the relevant project and tests before a merge decision."]
  ];
  return `<section class="panel"><h2>Your app, at a glance</h2><p>This is a schematic legend, not a screenshot of your exact app. Find each available control on your screen; labels move across releases.</p><div class="control-map">${controls.map(([area,title,text]) => `<article><span class="pill">${esc(area)}</span><h3>${esc(title)}</h3><p>${esc(text)}</p></article>`).join("")}</div></section>`;
}
function exerciseValue() { return view === 'lesson' ? state : view === 'context' ? state.context : state.chapters[selectedChapter]; }
function exerciseTotal() { return view === 'lesson' ? 3 : view === 'context' ? C.context.steps.length : currentChapter().steps.length; }
function exerciseControls(value, total) {
  const done=value.checks.includes(value.step+1), all=value.checks.length===total;
  return `<div class="exercise-controls"><label class="availability-label" for="exercise-availability">Tool availability for this exercise</label><select id="exercise-availability" data-step-availability="${value.step+1}">${[['unknown','Unknown / not tested'],['available','Available — I checked'],['needs-setup','Needs setup'],['unavailable','Unavailable on my account']].map(([id,label])=>`<option value="${id}" ${(value.stepAvailability[value.step+1]||'unknown')===id?'selected':''}>${label}</option>`).join('')}</select><p class="muted">Availability is your observation, separate from completion. Updating it preserves work already done.</p><div class="hero-actions">${done ? `<span class="exercise-done">Done ✓</span>${button('Undo','exercise-undo','text-button')}` : button('Mark exercise done ✓','exercise-done')}</div><p class="exercise-counter" role="status">${value.checks.length} of ${total} exercises done</p><div class="hero-actions">${value.step>0?button('← Previous exercise','exercise-back','secondary'):''}${value.step<total-1?button('Next exercise →','exercise-next',done?'primary':'secondary'):''}${all?button('Continue to knowledge check →',view==='lesson'?'quiz':view==='context'?'context-quiz':'course-quiz'):''}</div><div class="exercise-options">${button('Need help','exercise-help','text-button')}${button('Unavailable on my account','exercise-unavailable','text-button')}${button('Skip','exercise-skip','text-button')}${button('Revisit later','exercise-defer','text-button')}</div>${value.stepReasons?.[value.step+1]==='unavailable'?'<p class="muted">Unavailable on your account — saved to revisit. Other completed exercises are preserved.</p>':''}${!done&&(value.stepStatus[value.step+1]||['unavailable','needs-setup'].includes(value.stepAvailability[value.step+1]))?`<label class="availability-label" for="exercise-reason">Why revisit?</label><select id="exercise-reason" data-step-reason="${value.step+1}">${[['later','I chose to return later'],['preparation','Preparation missing'],['help','I need help'],['unavailable','Tool unavailable']].map(([id,label])=>`<option value="${id}" ${value.stepReasons[value.step+1]===id?'selected':''}>${label}</option>`).join('')}</select>`:''}<details class="exercise-observation"><summary>My observation or saved file location (optional)</summary><label for="exercise-evidence">What did you actually see? Keep passwords and other secrets out.</label><textarea id="exercise-evidence" data-step-evidence="${value.step+1}" maxlength="1000">${esc(value.stepEvidence[value.step+1]||'')}</textarea><p class="muted">Saved automatically on this device. A path here does not attach or upload a file.</p></details></div>`;
}
function setExerciseDone(done) {
  const value=exerciseValue(), number=value.step+1;
  value.checks=done?[...new Set([...value.checks,number])]:value.checks.filter(n=>n!==number);
  delete value.stepStatus[number];
  delete value.stepReasons[number];
  value.exercise=value.checks.length===exerciseTotal()?'practiced':'not-started';
  save();render();
}
function companionStep() {
  if(view==='mini'){const item=window.QuestMiniLessons.get(selectedMini),guide=window.QuestMiniLessons.guide(state,item);return {...guide,key:`mini:${item.id}`,title:item.title,readOnly:true,canNext:false,canNotes:false};}
  if(['lesson','context','chapter'].includes(view) && (view==='lesson'?tab:view==='context'?contextTab:chapterTab)==='practice'){
    const id=activeChapterId(),value=exerciseValue(),guide=practiceGuide(id,value.step);
    return {key:`${id}:${value.step}`,title:guide.title,...guide,prompt:id==='orientation'&&value.step===0?window.QuestLearningMap.inventoryPrompt(state.setup):guide.prompt,checked:value.checks.includes(value.step+1),canNext:value.step<exerciseTotal()-1,canNotes:true};
  }
  return {key:'none',title:'Practice companion',text:'Open a chapter’s Try it tab to show its current exercise here.',prompt:'',readOnly:true};
}
let filterQuery="", filterTag="";
const reviewedAttempts=new Set();
function quizLocked(q,attempts) {
  return attempts.length>0 && !attempts.includes(q.correct) && !reviewedAttempts.has(`${q.id}:${attempts.length}`);
}
function quizRetry(q,attempts) {
  return quizLocked(q,attempts)?`<p>Before retrying, explain why the selected option does not fit this scenario. Then compare with the feedback.</p>${button("I reviewed the feedback — try again", "retry-question", "secondary")}`:"";
}
function filterLibrary() {
  let count=0;
  for(const card of document.querySelectorAll('.library-entry')) {
    card.hidden=!card.dataset.search.includes(filterQuery)||!!filterTag&&card.dataset.tag!==filterTag;
    if(!card.hidden) count++;
  }
  const label=document.getElementById('search-count');if(label)label.textContent=count?`${count} matching entries`:"No matching entries. Try another search or topic.";
}
