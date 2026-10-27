// Shared screens for the curated journey chapters. Personal state stays separate from content.
function currentChapter() { return Course.chapters.find(ch => ch.id === selectedChapter); }
function courseSources(ids) {
  return [...new Set(ids)].map(id => {
    const source = Course.sources[id];
    return `<button class="text-button" data-source="${esc(source[1])}">${esc(source[0])} ↗</button>`;
  }).join("");
}
function courseBadge(value, info) {
  return info.complete ? "Completed" : value.exercise === "skipped" ? "Exercise skipped" : value.exercise === "deferred" ? "Exercise deferred" : Object.keys(value.stepStatus || {}).length ? "Some steps to revisit" : info.started ? "In progress" : "Ready to explore";
}
function catalogCards() {
  return learningOrder().map(id => {
    const ch=Course.chapters.find(ch=>ch.id===id);
    const info=id==="foundation"?S.summary(state):id==="context"?S.contextSummary(state):S.chapterSummary(state,ch);
    const value=id==="foundation"?state:id==="context"?state.context:state.chapters[id];
    const requires=recommendationText(id);
    return `<article class="panel roadmap-card ${info.complete ? "chapter-completed" : ""}"><div><span class="pill">${ch?.number===0?"START HERE":`CHAPTER ${ch?.number|| (id==="foundation"?1:2)}`}</span><h3>${esc(chapterTitle(id))}${value.bookmarked?" ★":""}</h3><p>${esc(courseBadge(value,info))} · ${info.percent}%</p><p class="study-time" title="Estimated reading, practice and knowledge check. Account setup and waiting are extra.">${esc(J.estimate(id))}</p>${requires ? `<p class="prerequisite">${esc(requires)}</p>` : ""}${chapterButton(id,info.complete ? "Review chapter →" : info.started ? "Back to chapter →" : "Open chapter →")}</div></article>`;
  }).join("");
}
function legacyCourseIndex() {
  const info = S.courseSummary(state);
  return `${intro("YOUR AI LEARNING COURSE", "Learn it. Try it. Come back to it.", "Learn AI concepts and put them to work with practical exercises, clear checks, and useful reference.")}<section class="panel feature-reset"><h2>Earlier course archive</h2><p>These prompt-led chapters and their records are preserved. The new learning journey teaches app features directly.</p>${button("Browse feature tutorials","course","primary")}${button("Earlier overview","legacy-home","text-button")}</section><section class="panel course-progress"><span class="pill accent">YOUR PERSONAL PROGRESS</span><h2>${info.complete} / ${info.total} chapters completed</h2><progress max="100" value="${info.percent}" aria-label="Whole course progress">${info.percent}%</progress><p>Your checklist, quiz answers, and notes help you track what you have learned. Complete the practice and knowledge check, review Questions & sources, then finish from My note. Writing a note is optional.</p></section><section class="panel mini-entry"><h2>Prefer one capability at a time?</h2><p>Mini-lessons have separate availability and practical outcomes. New optional activities do not change the chapter XP track.</p>${button("Explore mini-lessons →","mini-catalog")}</section><h2>Earlier course material</h2><p>The prompt-led lessons below are being rewritten. Their saved records are preserved.</p><section class="roadmap">${catalogCards()}</section><div class="callout"><span>↗</span><p><strong>Follow the route or revisit a topic.</strong> Each chapter lists its preparation and provides a task to try one step at a time. Tools and accounts are required only for the relevant external exercise. Skip or defer unavailable practice without claiming it succeeded.</p></div>`;
}
function journeyJournal() {
  const noteCount=pendingImport?[pendingImport.notes,pendingImport.context.notes,...Course.chapters.map(ch=>pendingImport.chapters[ch.id].notes),...Object.values(pendingImport.featureTutorials).map(record=>record.note)].filter(note=>note.trim()).length:0;
  const preview = pendingImport ? `<section class="panel import-preview"><h2>Review the backup before replacing progress</h2><p>${Object.values(pendingImport.featureTutorials).filter(record=>record.practiced).length} feature trials practiced; ${noteCount} saved note${noteCount===1?'':'s'}. Earlier chapters: ${S.courseSummary(pendingImport).complete} / ${S.courseSummary(pendingImport).total} completed. Mini-lesson results, availability, observations and saved guide positions are included. This replaces this app's learner name, navigation preference, notes, answers, progress, and records. A copy of the previous state will be kept in the local data folder.</p>${button("Replace saved progress with this backup", "confirm-import")}${button("Cancel import", "cancel-import", "secondary")}</section>` : "";
  return `${intro("PROGRESS & BACKUPS", "Keep your progress. Choose what comes next.", "Export a private backup or continue learning on another computer.")}<section class="panel"><h2>Your learning record stays on this device</h2><p>Your feature practice, tutorial positions, notes and earlier chapter records are saved locally as you learn.</p><h3>Where the practical work happens</h3><p>Each exercise names the AI chat, browser, file tool, coding environment, or connected service to use. Follow its steps, inspect the result, and save what you learned here.</p></section>${preview}<section class="panel backup-panel"><h2>Back up or continue on another computer</h2><p>The backup contains your personal notes and progress. Keep it private. You can import an app backup or a compatible local progress record. Inspect the preview before replacing anything.</p>${button("Export my learning backup", "export-progress", "secondary")}<label for="progress-import">Choose a progress backup to preview</label><input type="file" id="progress-import" accept=".json,application/json"></section>`;
}
function nextCourseQuestion() {
  const ch = currentChapter();
  const index = ch.questions.findIndex(q => !state.chapters[ch.id].quiz[q.id].includes(q.correct));
  return index < 0 ? ch.questions.length : index;
}
function courseNoteEditor() {
  const ch = view === "notes" ? Course.chapters.find(ch => ch.id === notesChapter) : currentChapter();
  return `<section class="panel note-panel"><h2>Your ${esc(ch.title.toLowerCase())} discoveries</h2><label for="course-note">${esc(ch.title)} · My notes</label><textarea id="course-note" maxlength="20000" placeholder="What did you try, check, or want to revisit?">${esc(state.chapters[ch.id].notes)}</textarea><div class="note-bottom"><span>Saved automatically on this device.</span></div></section>`;
}
function courseNotePicker() {
  const feature=notesChapter.startsWith('feature:')?window.QuestFeatureTutorials.get(notesChapter.slice(8)):null;
  const editor=feature?featureNoteEditor(feature):notesChapter==='foundation'?noteEditor():notesChapter==='context'?contextNoteEditor():courseNoteEditor();
  return `<section class="panel chapter-note-picker"><label for="notes-chapter-picker">Your notes</label><select id="notes-chapter-picker"><button type="button"><selectedcontent></selectedcontent></button><optgroup label="Feature tutorials">${window.QuestFeatureTutorials.lessons.map(lesson=>{const id='feature:'+lesson.id;return `<option value="${id}" ${id===notesChapter?'selected':''}>${noteOptionContent(id)}</option>`;}).join('')}</optgroup><optgroup label="Earlier chapters">${learningOrder().map(id=>`<option value="${esc(id)}" ${id===notesChapter?'selected':''}>${noteOptionContent(id)}</option>`).join('')}</optgroup></select></section>${editor}`;
}
function featureNoteEditor(lesson){return `<section class="panel note-panel"><h2>${esc(lesson.title)}</h2><label for="feature-note">My discoveries and questions</label><textarea id="feature-note" maxlength="4000">${esc(state.featureTutorials[lesson.id].note)}</textarea><p class="muted">Saved automatically on this device.</p></section>`;}
function chapterNote(id) { return id.startsWith('feature:')?state.featureTutorials[id.slice(8)].note:id==='foundation'?state.notes:id==='context'?state.context.notes:state.chapters[id].notes; }
function noteOptionLabel(id, includeStatus=true) {
 const title=id.startsWith('feature:')?window.QuestFeatureTutorials.get(id.slice(8)).title:`${id==='foundation'?'01':id==='context'?'02':String(Course.chapters.find(ch=>ch.id===id).number).padStart(2,'0')} · ${chapterTitle(id)}`;
 return title+(includeStatus&&chapterNote(id).trim()?' · Added note':'');
}
function noteOptionContent(id){return `<span>${esc(noteOptionLabel(id,false))}</span>${chapterNote(id).trim()?'<span class="added-note"> · Added note</span>':''}`;}
function updateNoteOption() {
  const picker = document.getElementById('notes-chapter-picker');
  if (!picker) return;
  const option = [...picker.options].find(el => el.value === notesChapter);
  const content = noteOptionContent(notesChapter);
  if (option) option.innerHTML = content;
  // Chromium can leave the closed picker's cloned label stale after option edits.
  const selected = picker.querySelector('selectedcontent');
  if (selected) selected.innerHTML = content;
}
function coursePractice() {
  const ch = currentChapter();
  if(ch.id === "orientation" && state.chapters.orientation.step === 0)return orientationInventory();
  const value = state.chapters[ch.id];
  const index = value.step;
  const item = practiceGuide(ch.id,index);
  const checked = value.checks.includes(index + 1);
  const outcome = value.stepStatus[index + 1];
  const steps = `<nav class="practice-route" aria-label="Practice steps"><p>Choose any step to explore. Only inspected work counts toward completion.</p>${ch.steps.map((step, i) => `<button class="secondary" data-course-step="${i}" ${i === index ? 'aria-current="step"' : ""}>${i + 1}. ${esc(step.title)} · ${value.checks.includes(i + 1) ? "Done" : statusLabel(value.stepStatus[i + 1] || "not-started")}</button>`).join("")}</nav>`;
  return `${steps}<section class="panel context-step"><span class="pill">STEP ${index + 1} OF ${ch.steps.length}</span><h2 id="course-step-title" tabindex="-1">${esc(item.title)}</h2><p class="lead">${esc(item.text)}</p>${exerciseBrief(item)}${ch.id === "orientation" ? button("Open the control map", "course-control-map", "secondary") : ""}<h3>Try this</h3><p>Send this message in your AI chat.</p><pre class="prompt">${esc(item.prompt)}</pre><button class="secondary" data-copy-course="${index}">Copy message</button>${ch.scopeGuide ? button("Open the scope table", "course-scope-guide", "secondary") : ""}${practiceSupport(item,`${ch.id}:${index}`)}<p class="exercise-verify">Before marking done: ${esc(item.check)}</p>${exerciseControls(value,ch.steps.length)}</section>`;
}
function courseQuiz() {
  const ch = currentChapter();
  const value = state.chapters[ch.id];
  const info = S.chapterSummary(state, ch);
  if (chapterQuestion >= ch.questions.length) return quizRecap();
  const q = ch.questions[chapterQuestion];
  const attempts = value.quiz[q.id];
  const last = attempts.at(-1);
  const correct = attempts.includes(q.correct);
  return `<section class="panel quiz-card"><span class="pill">QUESTION ${chapterQuestion + 1} OF ${ch.questions.length}</span><h2>${esc(q.prompt)}</h2><div class="answers">${q.choices.map((choice, i) => `<button data-course-answer="${i}" class="answer ${last === i ? correct ? "correct" : "incorrect" : ""}" ${correct || quizLocked(q,attempts) ? "disabled" : ""}><span>${String.fromCharCode(65 + i)}</span>${esc(choice)}</button>`).join("")}</div>${last !== undefined ? `<div class="feedback ${correct ? "positive" : "retry"}" role="status"><strong>${correct ? "That's right." : "Not quite—give it another try."}</strong><p>${esc(q.feedback?.[last] || q.explanation)}</p></div>` : ""}${quizRetry(q,attempts)}${correct ? button(chapterQuestion === ch.questions.length - 1 ? "Finish chapter check →" : "Next chapter question →", "course-next-question") : ""}</section>`;
}
function courseReference(ch) {
  return `${ch.id === "orientation" ? fullControlMap() : ""}<section class="chapter-questions"><h2>Common questions</h2>${ch.library.map(item => `<details class="panel journey-question" data-question-chapter="${ch.id}" data-question-title="${esc(item.title)}" ${state.questionPanels[ch.id].includes(item.title)?"open":""}><summary>${esc(item.title)}</summary><p>${esc(item.text)}</p></details>`).join("")}</section><section class="sources panel"><h2>Official references</h2><p>Content reviewed: ${esc(ch.reviewedOn || Course.checkedOn)}. Verify product availability in the linked documentation and your account; this date is not proof every feature was executed.</p>${courseSources(ch.sourceIds)}</section>`;
}
function courseChapter() {
  const ch = currentChapter();
  const value = state.chapters[ch.id];
  const info = S.chapterSummary(state, ch);
  const section = chapterTab === "practice" ? coursePractice() : chapterTab === "quiz" ? courseQuiz() : chapterTab === "notes" ? courseNoteEditor() : chapterTab === "reference" ? courseReference(ch) : ch.id === "orientation" ? firstStepsOverview() : `${scopeGuide(ch)}<section class="panel preparation"><h2>Before you try it</h2><p>${esc(ch.preparation)}</p>${prerequisitePanel(ch.id)}<h3>Your project thread</h3><p>${esc(ch.projectTask)}</p></section><div class="chapter-explanations">${ch.sections.map(item => `<article class="panel"><h2>${esc(item.title)}</h2><p>${esc(item.text)}</p></article>`).join("")}</div><div class="callout"><span>↗</span><p><strong>Now inspect a real result.</strong> Use the supplied prompt in the relevant AI tool, inspect its output, and check it against the requirements.</p>${button("Try this chapter →", "course-practice")}</div>`;
  return `${chapterNavigation(ch.id)}${intro(`CHAPTER ${String(ch.number).padStart(2, "0")} · PRACTICAL AI SKILLS`, esc(ch.title), esc(ch.subtitle))}<div class="lesson-meta"><span class="pill accent ${info.complete ? "completed-badge" : ""}">${esc(courseBadge(value, info))}</span><span>${info.percent}% · ${info.correct} / ${ch.questions.length} questions</span><span class="study-time" title="Estimated reading, practice and knowledge check. Setup and waiting are extra.">${esc(J.estimate(ch.id))}</span></div>${chapterRemaining(ch.id)}<div class="tabs course-tabs" role="tablist" aria-label="Journey chapter sections">${[["learn", "Understand"], ["practice", "Try it"], ["quiz", "Check"], ["reference", "Questions & sources"], ["notes", "My note"]].map(([id, label]) => `<button role="tab" aria-selected="${chapterTab === id}" class="${chapterTab === id ? "selected" : ""}" data-chapter-tab="${id}">${label}</button>`).join("")}</div><section class="tab-content" role="tabpanel" aria-label="Chapter ${chapterTab}">${section}</section>${nextChapterLink(ch.id)}`;
}
