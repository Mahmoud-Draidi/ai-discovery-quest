// Shared screens for the curated journey chapters. Personal state stays separate from content.
function currentChapter() { return Course.chapters.find(ch => ch.id === selectedChapter); }
function courseSources(ids) {
  return [...new Set(ids)].map(id => {
    const source = Course.sources[id];
    return `<button class="text-button" data-source="${esc(source[1])}">${esc(source[0])} ↗</button>`;
  }).join("");
}
function courseBadge(value, info) {
  return info.complete ? "Practiced & checked" : value.exercise === "skipped" ? "Exercise skipped" : value.exercise === "deferred" ? "Exercise deferred" : Object.keys(value.stepStatus || {}).length ? "Some steps to revisit" : info.started ? "In progress" : "Ready to explore";
}
function catalogCards() {
  return learningOrder().map(id => {
    const ch=Course.chapters.find(ch=>ch.id===id);
    const info=id==="foundation"?S.summary(state):id==="context"?S.contextSummary(state):S.chapterSummary(state,ch);
    const value=id==="foundation"?state:id==="context"?state.context:state.chapters[id];
    const requires=ch?.prerequisites?.length?`Bring: ${ch.prerequisites.map(chapterTitle).join("; ")}`:id==="context"?"Bring your first note, or use the supplied sample":"Start here or bring equivalent experience";
    return `<article class="panel roadmap-card"><div><span class="pill">${ch?.number===0?"START HERE":`CHAPTER ${ch?.number|| (id==="foundation"?1:2)}`}</span><h3>${esc(chapterTitle(id))}${value.bookmarked?" ★":""}</h3><p>${esc(courseBadge(value,info))} · ${info.percent}%</p><p class="prerequisite">${esc(requires)}</p>${chapterButton(id,"Open chapter →")}</div></article>`;
  }).join("");
}
function courseIndex() {
  const info = S.courseSummary(state);
  return `${intro("YOUR AI LEARNING COURSE", "Learn it. Try it. Come back to it.", "Learn AI concepts and put them to work with practical exercises, clear checks, and useful reference.")}<section class="panel course-progress"><span class="pill accent">YOUR PERSONAL PROGRESS</span><h2>${info.complete} / ${info.total} chapters practiced & checked</h2><progress max="100" value="${info.percent}" aria-label="Whole course progress">${info.percent}%</progress><p>Your checklist, quiz answers, and notes help you track what you have learned. Complete the practical steps and knowledge check to finish a chapter.</p></section><section class="roadmap">${catalogCards()}</section><div class="callout"><span>↗</span><p><strong>Follow the route or revisit a topic.</strong> Each chapter lists its preparation and provides a task to try one step at a time. Tools and accounts are required only for the relevant external exercise. Skip or defer unavailable practice without claiming it succeeded.</p></div>`;
}
function recordEditor(id, title, follow = false) {
  const value = (follow ? state.followUps : state.records)[id];
  const prefix = follow ? "follow" : "record";
  const options = [["not-recorded", "Not recorded"], ["practiced", "Practiced"], ["explained", "Explained only"], ["skipped", "Skipped by choice"], ["deferred", "Deferred / preparation missing"]];
  return `<label for="${prefix}-status-${id}">My status · ${esc(title)}</label><select id="${prefix}-status-${id}" data-${prefix}-status="${id}">${options.map(([key,label]) => `<option value="${key}" ${value.status === key ? "selected" : ""}>${label}</option>`).join("")}</select><label for="${prefix}-note-${id}">Evidence or next question</label><textarea id="${prefix}-note-${id}" data-${prefix}-note="${id}" maxlength="5000">${esc(value.note)}</textarea>`;
}
function journeyJournal() {
  const items = [{id:"foundation",title:"Models, tools, and skills"},{id:"context",title:"Files, context, and continuity"},...Course.chapters];
  const recorded = Object.values(state.records).filter(value => value.status === "practiced").length;
  const preview = pendingImport ? `<section class="panel import-preview"><h2>Review the backup before replacing progress</h2><p>${S.courseSummary(pendingImport).complete} / ${S.courseSummary(pendingImport).total} chapter checks completed; ${Object.values(pendingImport.records).filter(r => r.status === "practiced").length} topics with prior practice recorded. This replaces this app's saved notes, answers, progress, and records. A copy of the previous state will be kept in the local data folder.</p>${button("Replace saved progress with this backup", "confirm-import")}${button("Cancel import", "cancel-import", "secondary")}</section>` : "";
  return `${intro("PROGRESS & BACKUPS", "Keep your progress. Choose what comes next.", "Export a private backup or choose optional practice. Recording earlier experience is optional.")}<section class="panel"><h2>Your learning record stays on this device</h2><p>New to AI? Start with the app tour. Existing experience is optional and can be recorded below; it does not create quiz passes.</p><h3>Where the practical work happens</h3><p>Each exercise names the AI chat, browser, file tool, coding environment, or connected service to use. Follow its steps, inspect the result, and save what you learned here.</p></section>${preview}<section class="panel backup-panel"><h2>Back up or continue on another computer</h2><p>The backup contains your personal notes and progress. Keep it private. You can import an app backup or a compatible local progress record. Inspect the preview before replacing anything.</p>${button("Export my learning backup", "export-progress", "secondary")}<label for="progress-import">Choose a progress backup to preview</label><input type="file" id="progress-import" accept=".json,application/json"></section><section class="chapter-questions"><h2>Unfinished or optional explorations</h2><p>Choose an extra topic when you are ready. Check the preparation, try the task, and record your result.</p>${Course.followUps.map(item => `<details class="panel journey-question personal-record"><summary>${esc(item.title)} · ${esc(statusLabel(state.followUps[item.id].status))}</summary><p>${esc(item.text)}</p><pre class="prompt">${esc(item.prompt)}</pre><button class="secondary" data-copy-followup="${item.id}">Copy follow-up prompt</button>${recordEditor(item.id,item.title,true)}</details>`).join("")}</section><details class="panel prior-experience"><summary>I already know some of this — record existing practice</summary><section class="chapter-questions"><h2>Your existing practice, by topic</h2><p>Use this to preserve work you already did elsewhere. Record what you tried and what remains unverified; you do not need to repeat it just to fill the app.</p>${items.map(item => `<details class="panel journey-question personal-record" data-record-id="${esc(item.id)}"><summary>${esc(item.title)} · ${esc(statusLabel(state.records[item.id].status))}</summary>${recordEditor(item.id,item.title)}</details>`).join("")}</section></details>`;
}
function nextCourseQuestion() {
  const ch = currentChapter();
  const index = ch.questions.findIndex(q => !state.chapters[ch.id].quiz[q.id].includes(q.correct));
  return index < 0 ? ch.questions.length : index;
}
function courseNoteEditor() {
  const ch = currentChapter();
  return `<section class="panel note-panel"><h2>Your ${esc(ch.title.toLowerCase())} discoveries</h2><label for="course-note">${esc(ch.title)} · My notes</label><textarea id="course-note" maxlength="20000" placeholder="What did you try, check, or want to revisit?">${esc(state.chapters[ch.id].notes)}</textarea><div class="note-bottom"><span>Saved on this device, separately for this chapter.</span>${button("Save chapter note", "save-note", "secondary")}</div></section>`;
}
function courseNotePicker() {
  return `<section class="panel chapter-note-picker"><label for="notes-chapter-picker">More chapter notes</label><select id="notes-chapter-picker">${Course.chapters.map(ch => `<option value="${ch.id}" ${ch.id === selectedChapter ? "selected" : ""}>${String(ch.number).padStart(2, "0")} · ${esc(ch.title)}</option>`).join("")}</select></section>${courseNoteEditor()}`;
}
function coursePractice() {
  const ch = currentChapter();
  const value = state.chapters[ch.id];
  const index = value.step;
  const item = ch.steps[index];
  const checked = value.checks.includes(index + 1);
  const outcome = value.stepStatus[index + 1];
  const steps = `<nav class="practice-route" aria-label="Practice steps"><p>Choose any step to explore. Only inspected work counts toward completion.</p>${ch.steps.map((step, i) => `<button class="secondary" data-course-step="${i}" ${i === index ? 'aria-current="step"' : ""}>${i + 1}. ${esc(step.title)} · ${value.checks.includes(i + 1) ? "Checked" : statusLabel(value.stepStatus[i + 1] || "not-started")}</button>`).join("")}</nav>`;
  return `${steps}<section class="panel context-step"><span class="pill">STEP ${index + 1} OF ${ch.steps.length}</span><h2 id="course-step-title" tabindex="-1">${esc(item.title)}</h2><p class="lead">${esc(item.text)}</p>${ch.id === "orientation" ? button("Open the control map", "course-control-map", "secondary") : ""}<pre class="prompt">${esc(item.prompt)}</pre><button class="secondary" data-copy-course="${index}">Copy practice prompt</button><div class="checklist"><label><input type="checkbox" data-course-check="${index + 1}" ${checked ? "checked" : ""}><span>${esc(item.check)}</span></label></div><p class="honesty">Record only what you actually tried and inspected. The app cannot observe another chat, authorize its actions, or create accounts for you.</p><div class="hero-actions">${index ? button("← Previous step", "course-back", "secondary") : ""}${index < ch.steps.length - 1 ? `<button class="primary" data-action="course-next" >Next practice step →</button>` : `<button class="primary" data-action="course-practiced" ${value.checks.length === ch.steps.length ? "" : "disabled"}>Mark chapter exercise practiced</button>`}</div><p class="exercise-state" role="status">This step: <strong>${checked ? "Checked" : esc(statusLabel(outcome || "not-started"))}</strong>. Exercise: <strong>${esc(statusLabel(value.exercise))}</strong> · ${value.checks.length} / ${ch.steps.length} practical checks</p><div class="exercise-options">${button("Skip this step", "course-step-skip", "text-button")}${button("Unavailable / revisit this step", "course-step-defer", "text-button")}</div><p>Deferred and skipped steps remain unfinished. Choose another step above or use Next; return here when ready.</p><details><summary>Set aside the whole exercise</summary><div class="exercise-options">${button("Skip this practice", "course-skip", "text-button")}${button("Defer: tools or preparation missing", "course-defer", "text-button")}</div></details>${button("Open chapter knowledge check →", "course-quiz", "secondary")}</section>`;
}
function courseQuiz() {
  const ch = currentChapter();
  const value = state.chapters[ch.id];
  const info = S.chapterSummary(state, ch);
  if (chapterQuestion >= ch.questions.length) return `<section class="panel quiz-finish"><span class="large-spark">✧</span><h2>You checked the key distinctions.</h2><p>${info.correct} / ${ch.questions.length} understood. ${info.complete ? `Your practical exercise is recorded too. ${esc(ch.award)} earned.` : "Quiz answers alone do not complete practical work. Return to the exercise or record it as deferred if preparation is missing."}</p>${button("Return to chapter practice", "course-practice")}${button("Explore all chapters", "course", "secondary")}</section>`;
  const q = ch.questions[chapterQuestion];
  const attempts = value.quiz[q.id];
  const last = attempts.at(-1);
  const correct = attempts.includes(q.correct);
  return `<section class="panel quiz-card"><span class="pill">QUESTION ${chapterQuestion + 1} OF ${ch.questions.length}</span><h2>${esc(q.prompt)}</h2><div class="answers">${q.choices.map((choice, i) => `<button data-course-answer="${i}" class="answer ${last === i ? correct ? "correct" : "incorrect" : ""}" ${correct || quizLocked(q,attempts) ? "disabled" : ""}><span>${String.fromCharCode(65 + i)}</span>${esc(choice)}</button>`).join("")}</div>${last !== undefined ? `<div class="feedback ${correct ? "positive" : "retry"}" role="status"><strong>${correct ? "That's right." : "Not quite—give it another try."}</strong><p>${esc(q.feedback?.[last] || q.explanation)}</p></div>` : ""}${quizRetry(q,attempts)}${correct ? button(chapterQuestion === ch.questions.length - 1 ? "Finish chapter check →" : "Next chapter question →", "course-next-question") : ""}</section>`;
}
function courseReference(ch) {
  return `<section class="chapter-questions"><h2>Common questions</h2>${ch.library.map(item => `<details class="panel journey-question"><summary>${esc(item.title)}</summary><p>${esc(item.text)}</p></details>`).join("")}</section><section class="sources panel"><h2>Official references</h2><p>Content reviewed: ${esc(ch.reviewedOn || Course.checkedOn)}. Verify product availability in the linked documentation and your account; this date is not proof every feature was executed.</p>${courseSources(ch.sourceIds)}</section>`;
}
function courseChapter() {
  const ch = currentChapter();
  const value = state.chapters[ch.id];
  const info = S.chapterSummary(state, ch);
  const section = chapterTab === "practice" ? coursePractice() : chapterTab === "quiz" ? courseQuiz() : chapterTab === "notes" ? courseNoteEditor() : chapterTab === "reference" ? courseReference(ch) : `${ch.id === "orientation" ? controlMap() : ""}<section class="panel preparation"><h2>Before you try it</h2><p>${esc(ch.preparation)}</p>${prerequisitePanel(ch.id)}<h3>Your project thread</h3><p>${esc(ch.projectTask)}</p></section><div class="chapter-explanations">${ch.sections.map(item => `<article class="panel"><h2>${esc(item.title)}</h2><p>${esc(item.text)}</p></article>`).join("")}</div><div class="callout"><span>↗</span><p><strong>Now inspect a real result.</strong> Use the supplied prompt in the relevant AI tool, inspect its output, and check it against the requirements.</p>${button("Try this chapter →", "course-practice")}</div>`;
  return `<div class="chapter-links">${button("← All chapters", "course", "secondary")}${button("I already know this", "prior-experience", "text-button")}${button(value.bookmarked ? "★ Chapter saved" : "☆ Save this chapter", "course-bookmark", "text-button")}</div>${intro(`CHAPTER ${String(ch.number).padStart(2, "0")} · PRACTICAL AI SKILLS`, esc(ch.title), esc(ch.subtitle))}<div class="lesson-meta"><span class="pill accent">${esc(courseBadge(value, info))}</span><span>${info.percent}% · ${info.correct} / ${ch.questions.length} questions</span><span>Flexible pace</span></div><div class="tabs course-tabs" role="tablist" aria-label="Journey chapter sections">${[["learn", "Understand"], ["practice", "Try it"], ["quiz", "Check"], ["reference", "Questions & sources"], ["notes", "My note"]].map(([id, label]) => `<button role="tab" aria-selected="${chapterTab === id}" class="${chapterTab === id ? "selected" : ""}" data-chapter-tab="${id}">${label}</button>`).join("")}</div><section class="tab-content" role="tabpanel" aria-label="Chapter ${chapterTab}">${section}</section>${otherTools(ch.id)}${nextChapterLink(ch.id)}`;
}
function courseMilestone(ch) {
  const value = state.chapters[ch.id];
  const info = S.chapterSummary(state, ch);
  return `<section class="panel award ${info.complete ? "earned" : ""}"><div class="award-symbol">✧</div><span class="pill">${info.complete ? "EARNED" : `CHAPTER ${ch.number}`}</span><h2>${esc(ch.award)}</h2><p>${esc(ch.title)}</p><ul class="award-requirements"><li>${value.exercise === "practiced" ? "✓" : "○"} All ${ch.steps.length} practical checks recorded</li><li>${info.correct === ch.questions.length ? "✓" : "○"} Knowledge check: ${info.correct} / ${ch.questions.length}</li></ul><button class="primary" data-chapter="${ch.id}">Open this chapter</button></section>`;
}
