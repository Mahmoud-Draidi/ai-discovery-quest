const C = window.QuestContent;
const S = window.QuestState;
const Course = window.QuestCourse;
const J = window.QuestJourney;
let selectedChapter = Course.chapters[0].id;
let chapterTab = "learn";
let chapterQuestion = 0;
const main = document.getElementById("main");
const status = document.getElementById("save-status");
const names = { home: "Overview", lesson: "Learning journey", context: "Learning journey", course: "Learning journey", chapter: "Learning journey", journal: "Progress & backups", library: "Reference library", notes: "My notes" };
let state;
let view = "home";
let tab = "learn";
let questionIndex = 0;
let contextTab = "learn";
let contextQuestion = 0;
let saveRevision = 0;
let pendingImport = null;
const exercisePrompt = "Create a file called MY-FIRST-NOTE.md in my chosen practice folder. Write three beginner-friendly sentences explaining a model, a tool, and a skill. Add one everyday example below each. Tell me where you saved it. If you cannot create files here, explain that and provide the text instead.";
const esc = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function button(label, action, className = "primary") { return `<button class="${className}" data-action="${action}">${label}</button>`; }
let noticeTimer;
function announce(text) {
  document.getElementById("announcement").textContent=text;
  const notice=document.getElementById("notice");notice.textContent=text;
  clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>{notice.textContent="";},6500);
}
function save() {
  if (["lesson", "context", "chapter"].includes(view)) state.resume = { view, chapter: selectedChapter, tab: view === "lesson" ? tab : view === "context" ? contextTab : chapterTab };
  state = S.normalize(state);
  const revision = ++saveRevision;
  status.textContent = "Saving…";
  status.classList.remove("error");
  return window.quest.save(state).then(() => {
    if (revision === saveRevision) status.textContent = "All changes saved";
  }).catch(() => {
    status.textContent = "Could not save — keep this window open and try again";
    status.classList.add("error");
    announce("Your latest changes could not be saved.");
  });
}
function chapterBadge() {
  const info = S.summary(state);
  if (info.complete) return "Practiced & checked";
  if (state.exercise === "skipped") return "Exercise skipped";
  if (state.exercise === "deferred") return "Exercise deferred";
  return info.started ? "In progress" : "Ready to explore";
}
function intro(eyebrow, title, description) { return `<div class="page-intro"><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${description}</p></div>`; }
function noteEditor() {
  return `<section class="panel note-panel"><div class="section-heading"><div><h2>A thought worth keeping</h2><p>Your questions, examples, and discoveries from this chapter.</p></div><span class="pill">PERSONAL</span></div><label for="lesson-note">Models, tools, and skills · My notes</label><textarea id="lesson-note" maxlength="20000" placeholder="Today I discovered…">${esc(state.notes)}</textarea><div class="note-bottom"><span>Stored on this device, separate from the course.</span>${button("Save note", "save-note", "secondary")}</div></section>`;
}
function overview() {
  const info = S.summary(state);
  return `${intro("SMALL STEPS. REAL DISCOVERIES.", "Make AI something<br>you know how to <em>use.</em>", "Learn by trying. Check what happens. Build confidence, one useful skill at a time.")}
  <section class="panel course-progress"><span class="pill accent">YOUR WHOLE JOURNEY</span><h2>${S.courseSummary(state).complete} of ${S.courseSummary(state).total} chapters practiced & checked</h2><progress max="100" value="${S.courseSummary(state).percent}" aria-label="Whole course progress">${S.courseSummary(state).percent}%</progress><p>${esc(S.nextAction(state))}</p>${button("Continue where I left off →", "resume")}${button("Explore all chapters →", "course", "secondary")}${button("My learning record", "journal", "text-button")}</section>
  <section class="hero panel"><div class="hero-copy"><span class="pill accent">YOUR NEXT DISCOVERY</span><h2>Find your controls.<br>Try something useful.</h2><p>Start with the app tour, then create your AI field guide and turn it into a practical learning tracker.</p><div class="hero-actions">${chapterButton("orientation", "Start with the app tour →", "primary")}</div></div><div class="orbit" aria-hidden="true"><div class="orbit-ring"></div><div class="orbit-core">✦</div><span class="orbit-label orbit-model">MODEL <b>Think</b></span><span class="orbit-label orbit-tool">TOOL <b>Act</b></span><span class="orbit-label orbit-skill">SKILL <b>Guide</b></span></div></section>
  <div class="section-heading"><h2>Choose your next topic</h2><span class="muted">Choose your pace</span></div><section class="roadmap">${catalogCards()}</section>`;
}
function learn() {
  return `<h2 class="tab-heading">Three parts. Different jobs.</h2><p class="lead">One assistant can combine all three. Recognizing their roles helps you ask for the right kind of help.</p><div class="concepts">${C.concepts.map((c, i) => `<article class="panel concept"><span class="concept-index">0${i + 1}</span><h3>${c.name}</h3><div class="concept-verb">${c.verb}</div><p>${c.text}</p><div class="example"><span>EVERYDAY EXAMPLE</span><p>${c.example}</p></div></article>`).join("")}</div><div class="callout"><span>✦</span><p><strong>Try describing an outcome.</strong> “Help me plan a week of meals.” The model reasons, tools can find information or save files, and a skill can guide the method. Available tools depend on your assistant.</p></div><div class="section-heading"><h2>Understanding becomes useful through practice.</h2>${button("Try the exercise →", "practice")}</div>`;
}
function practice() {
  const checks = ["I opened the actual note and checked its three definitions and examples.", "I requested one change and checked that the saved note reflected it.", "I can identify the model, the file-writing tool, and where reusable instructions would fit."];
  return `<h2 class="tab-heading">Make your first AI-assisted note.</h2><p class="lead">Use an assistant you already have. Your goal is to inspect a real result—not just accept “done.”</p><div class="practice-grid"><section class="panel"><span class="pill">STEP 01 · DO</span><h3>Ask for a useful result</h3><p>Start with the app tour if you have only used web chat. In Codex, select an empty practice folder. In web chat, request the note text and save it yourself; file-tool practice can be deferred. Copy the prompt into your chosen assistant.</p><pre class="prompt" id="exercise-prompt">${esc(exercisePrompt)}</pre>${button("Copy prompt", "copy-prompt", "secondary")}<p id="copy-status" role="status" class="muted"></p><div class="small-callout"><strong>No file tools?</strong> Save the supplied text in your own editor. You can practice the concepts; record AI-operated file creation as deferred rather than claiming it happened.</div></section><section class="panel"><span class="pill">STEP 02 · VERIFY</span><h3>Check what really happened</h3><p>Create the note, ask for an edit, and inspect both results. Use the checklist after doing the actions.</p><div class="checklist">${checks.map((text, i) => `<label><input type="checkbox" data-check="${i + 1}" ${state.checks.includes(i + 1) ? "checked" : ""}><span>${text}</span></label>`).join("")}</div><p class="honesty">This checklist is your report. The app cannot observe your external chat or files.</p><button class="primary" data-action="mark-practiced" ${state.checks.length === 3 ? "" : "disabled"}>Mark exercise practiced</button><div class="exercise-options">${button("Skip for now", "skip", "text-button")}${button("Tools unavailable", "defer", "text-button")}</div><p class="exercise-state" role="status">Exercise: <strong>${esc(state.exercise.replace("not-started", "still to do"))}</strong></p></section></div><div class="callout"><span>↗</span><p><strong>Next, explain it in your own words.</strong> The knowledge check helps connect what you did with the concepts.</p>${button("Knowledge check", "quiz", "secondary")}</div>`;
}
function quiz() {
  const info = S.summary(state);
  if (info.correct === C.questions.length && questionIndex >= C.questions.length) return `<section class="panel quiz-finish"><span class="large-spark">✧</span><h2>You know the difference.</h2><p>All questions are understood. ${state.exercise === "practiced" ? "Your practical exercise is complete too. Your learner XP has been updated." : "Complete the practical exercise to earn AI Explorer. Reading and answering alone do not complete this chapter."}</p>${button(state.exercise === "practiced" ? "See my progress" : "Return to exercise", state.exercise === "practiced" ? "home" : "practice")}</section>`;
  const q = C.questions[Math.min(questionIndex, C.questions.length - 1)];
  const attempts = state.quiz[q.id];
  const last = attempts.at(-1);
  const correct = S.solved(state, q);
  const feedback = last !== undefined;
  return `<section class="panel quiz-card"><div class="section-heading"><span class="pill">QUESTION ${questionIndex + 1} OF ${C.questions.length}</span><span class="muted">No rush. Retries are part of learning.</span></div><h2>${q.prompt}</h2><div class="answers">${C.concepts.map((c, i) => `<button data-answer="${i}" class="answer ${last === i ? correct ? "correct" : "incorrect" : ""}" ${correct || quizLocked(q,attempts) ? "disabled" : ""}><span>${String.fromCharCode(65 + i)}</span>${c.name}${correct && last === i ? "<b>✓</b>" : ""}</button>`).join("")}</div>${feedback ? `<div class="feedback ${correct ? "positive" : "retry"}" role="status"><strong>${correct ? "That's right." : "Not quite—give it another try."}</strong><p>${esc(q.feedback?.[last] || q.explanation)}</p></div>` : ""}${quizRetry(q,attempts)}${correct ? button(questionIndex === C.questions.length - 1 ? "Finish knowledge check →" : "Next question →", "next-question") : `<p class="muted">Choose the role that fits the action described.</p>`}</section>`;
}
function lesson() {
  return `${intro("CHAPTER 01 · THE FOUNDATIONS", "Models, tools, and skills.", "Understand the roles. Create something real. Check your understanding.")}<div class="lesson-meta"><span class="pill accent">${chapterBadge()}</span><span>Exercise + knowledge check</span><span class="study-time" title="Reading, practice and knowledge check; setup may take extra time.">${esc(J.estimate("foundation"))}</span></div><div class="tabs" role="tablist" aria-label="Chapter sections">${[["learn", "01", "Understand"], ["practice", "02", "Try it"], ["quiz", "03", "Check"], ["reference", "04", "Questions & sources"], ["notes", "05", "My note"]].map(([id, number, label]) => `<button role="tab" aria-selected="${tab === id}" data-tab="${id}" class="${tab === id ? "selected" : ""}"><span>${number}</span>${label}</button>`).join("")}</div><section class="tab-content" role="tabpanel" aria-label="${tab}">${tab === "learn" ? learn() : tab === "practice" ? practice() : tab === "quiz" ? quiz() : tab === "reference" ? earlyReference("foundation") : noteEditor()}</section>${otherTools("foundation")}${nextChapterLink("foundation")}`;
}
function chapterLinks() {
  return `<div class="chapter-links" aria-label="Available chapters">${button("01 · Models, tools & skills", "start", "secondary")}${button("02 · Files, context & continuity", "context", "secondary")}${button("All chapters", "course", "secondary")}${button("I already know this", "prior-experience", "text-button")}</div>`;
}
function contextSources() { return C.context.sources.map(s => `<button class="text-button" data-source="${s.url}">${esc(s.label)} ↗</button>`).join(""); }
function contextNoteEditor() {
  return `<section class="panel note-panel"><h2>Your context discoveries</h2><label for="context-note">Files, context, and continuity · My notes</label><textarea id="context-note" maxlength="20000" placeholder="What helped the new chat resume?">${esc(state.context.notes)}</textarea><div class="note-bottom"><span>Saved separately from your chapter-one note.</span>${button("Save context note", "save-note", "secondary")}</div></section>`;
}
function contextNextQuestion() {
  const index = C.context.questions.findIndex(q => !state.context.quiz[q.id].includes(q.correct));
  return index < 0 ? C.context.questions.length : index;
}
function contextPractice() {
  const index = state.context.step;
  const step = C.context.steps[index];
  const checked = state.context.checks.includes(index + 1);
  return `<nav class="practice-route" aria-label="Context practice steps"><p>Explore any step; unfinished work stays unfinished.</p>${C.context.steps.map((step,i)=>`<button class="secondary" data-context-step="${i}" ${i===index ? 'aria-current="step"' : ""}>${i+1}. ${esc(step.title)} · ${state.context.checks.includes(i+1) ? "Checked" : esc(statusLabel(state.context.stepStatus[i+1] || "not-started"))}</button>`).join("")}</nav><section class="panel context-step"><span class="pill">STEP ${index + 1} OF ${C.context.steps.length}</span><h2 id="context-step-title" tabindex="-1">${esc(step.title)}</h2><p class="lead">${esc(step.text)}</p><pre class="prompt">${esc(step.prompt)}</pre><button class="secondary" data-copy-context="${index}">Copy this prompt</button><div class="small-callout">${esc(step.hint)}</div>${index === 0 ? `<details><summary>Need a sample first note?</summary><pre class="prompt">${esc(C.context.sampleNote)}</pre><button class="secondary" data-copy-context="sample">Copy sample note</button><p>Save this as MY-FIRST-NOTE.md, then attach it or place it in your accessible practice workspace.</p></details>` : ""}${practiceSupport(step,`context:${index}`)}<div class="checklist"><label><input type="checkbox" data-context-check="${index + 1}" ${checked ? "checked" : ""}><span>${esc(step.check)}</span></label></div><p class="honesty">Your report of work in another assistant. This app cannot inspect that chat or enable its file access.</p><div class="hero-actions">${index > 0 ? button("← Previous step", "context-back", "secondary") : ""}${index < C.context.steps.length - 1 ? `<button class="primary" data-action="context-next" >Next step →</button>` : `<button class="primary" data-action="context-practiced" ${state.context.checks.length === C.context.steps.length ? "" : "disabled"}>Mark context exercise practiced</button>`}</div><p class="exercise-state" role="status">Context exercise: <strong>${esc(statusLabel(state.context.exercise))}</strong> · ${state.context.checks.length} / ${C.context.steps.length} checks</p><div class="exercise-options">${button("Skip this step", "context-step-skip", "text-button")}${button("Unavailable / revisit this step", "context-step-defer", "text-button")}</div><details><summary>Set aside the whole context exercise</summary><div class="exercise-options">${button("Skip context exercise", "context-skip", "text-button")}${button("Context tools unavailable", "context-defer", "text-button")}</div></details>${button("Knowledge check →", "context-quiz", "secondary")}</section>`;
}
function contextQuiz() {
  const info = S.contextSummary(state);
  if (contextQuestion >= C.context.questions.length) return `<section class="panel quiz-finish"><span class="large-spark">✧</span><h2>You can distinguish access from context.</h2><p>All questions understood. ${info.complete ? "You also practiced the file-and-resume exercise. Your learner XP has been updated." : "Complete the four practical steps to finish this chapter. Quiz answers alone do not complete external practice."}</p>${button("Return to practical steps", "context-practice")}</section>`;
  const q = C.context.questions[contextQuestion];
  const attempts = state.context.quiz[q.id];
  const correct = attempts.includes(q.correct);
  const last = attempts.at(-1);
  return `<section class="panel quiz-card"><span class="pill">QUESTION ${contextQuestion + 1} OF ${C.context.questions.length}</span><h2>${esc(q.prompt)}</h2><div class="answers">${q.choices.map((choice, i) => `<button class="answer ${last === i ? correct ? "correct" : "incorrect" : ""}" data-context-answer="${i}" ${correct || quizLocked(q,attempts) ? "disabled" : ""}><span>${String.fromCharCode(65 + i)}</span>${esc(choice)}</button>`).join("")}</div>${last !== undefined ? `<div class="feedback ${correct ? "positive" : "retry"}" role="status"><strong>${correct ? "That's right." : "Not quite—give it another try."}</strong><p>${esc(q.feedback?.[last] || q.explanation)}</p></div>` : ""}${quizRetry(q,attempts)}${correct ? button(contextQuestion === C.context.questions.length - 1 ? "Finish context check →" : "Next context question →", "context-next-question") : ""}</section>`;
}
function contextLesson() {
  const info = S.contextSummary(state);
  const badge = info.complete ? "Practiced & checked" : state.context.exercise === "skipped" ? "Exercise skipped" : state.context.exercise === "deferred" ? "Exercise deferred" : state.context.checks.length || info.correct ? "In progress" : "Ready to explore";
  return `${chapterLinks()}${intro("CHAPTER 02 · GIVE AI USEFUL CONTEXT", "Files, context, and continuity.", "Supply the right source. Inspect the answer. Save a useful record for the next chat.")}<div class="lesson-meta"><span class="pill accent">${badge}</span><span>${info.percent}% · ${info.correct} / ${C.context.questions.length} questions</span><span class="study-time">${esc(J.estimate("context"))}</span></div><div class="tabs" role="tablist" aria-label="Context chapter sections">${[["learn", "Understand"], ["practice", "Try it"], ["quiz", "Check"], ["reference", "Questions & sources"], ["notes", "My note"]].map(([id, label]) => `<button role="tab" aria-selected="${contextTab === id}" data-context-tab="${id}" class="${contextTab === id ? "selected" : ""}">${label}</button>`).join("")}</div><section class="tab-content" role="tabpanel" aria-label="Context ${contextTab}">${contextTab === "practice" ? contextPractice() : contextTab === "quiz" ? contextQuiz() : contextTab === "notes" ? contextNoteEditor() : contextTab === "reference" ? earlyReference("context") : `<div class="callout"><span>↗</span><p><strong>Does putting a file in a project mean the AI has read it?</strong> File access makes a source available. Ask the assistant to read the relevant file, then check its answer against that source.</p></div><div class="concepts">${[["Available", "A supported attachment or workspace makes a file accessible. A path alone does not grant access."], ["Used for this task", "Ask the assistant to read the relevant source. Compare the answer with the actual file."], ["Useful next time", "Keep working preferences in project instructions and completed work in a progress note."]].map(([title, text]) => `<article class="panel concept"><h3>${title}</h3><p>${text}</p></article>`).join("")}</div><section class="panel"><h2>Choose how to supply the file</h2><p>In a chat with uploads, attach the note. In a supported local project, use its accessible workspace. A ChatGPT project's shared uploaded or connected sources are different from a folder on your computer.</p><h3>Keep useful instructions and progress</h3><p>Codex uses AGENTS.md for project guidance; other surfaces may provide instruction settings. Record what you completed and the next step in a progress note, then test resuming in another chat.</p><p>Memory is a separate capability and is not required for this exercise. If a tool is unavailable, note the limitation and use the supported alternative.</p>${button("Start the context exercise →", "context-practice")}</section><section class="sources panel"><h2>Official references</h2><p>Product controls can differ. Links need internet; the chapter itself works offline.</p>${contextSources()}</section>`}</section>${otherTools("context")}${nextChapterLink("context")}`;
}
function referenceEntries() { return [...C.library, ...C.context.library, ...Course.chapters.flatMap(ch => ch.library)]; }
function library() {
  return `${intro("A PLACE TO COME BACK TO", "Keep the useful bits close.", "Find clear answers about AI concepts, tools, and practical workflows.")}<label class="search-label" for="library-search">Search this reference library</label><input id="library-search" class="search" type="search" placeholder="Try “files”, “skill”, or “verification”…"><label class="search-label" for="library-topic">Filter by topic</label><select id="library-topic"><option value="">All topics</option>${[...new Set(referenceEntries().map(e=>e.tag))].map(tag=>`<option value="${esc(tag)}">${esc(tag)}</option>`).join("")}</select><p class="muted" id="search-count">${referenceEntries().length} entries</p><div class="library-grid">${referenceEntries().map(entry => `<article class="panel library-entry" data-tag="${esc(entry.tag)}" data-search="${esc((entry.title + " " + entry.tag + " " + entry.text).toLowerCase())}"><span class="pill">${entry.tag}</span><h2>${entry.title}</h2><p>${entry.text}</p></article>`).join("")}</div><p class="muted">This reference grows as chapters are added.</p><div class="sources panel"><h2>Go to the source</h2><p>These official references open in your browser and need an internet connection. Bundled chapters work offline.</p>${courseSources(Object.keys(Course.sources))}</div>`;
}
function render() {
  renderLearnerHeader();
  applySidebar();
  const active=document.activeElement;
  const focusAttrs=active && main.contains(active)?[...active.attributes].filter(a=>a.name.startsWith("data-")).map(a=>[a.name,a.value]):[];
  const focusId=active && main.contains(active)?active.id:null;
  for (const item of document.querySelectorAll("nav [data-view]")) { const active = item.dataset.view === view || (["context", "course", "chapter"].includes(view) && item.dataset.view === "lesson"); item.classList.toggle("active", active); item.setAttribute("aria-current", active ? "page" : "false"); }
  document.getElementById("breadcrumb").textContent = names[view];
  main.innerHTML = view === "home" ? overview() : view === "lesson" ? chapterLinks() + lesson() : view === "context" ? contextLesson() : view === "course" ? courseIndex() : view === "chapter" ? courseChapter() : view === "journal" ? journeyJournal() : view === "library" ? library() : view === "notes" ? intro("YOUR PERSONAL FIELD NOTES", "Make it yours.", "Capture the examples, questions, and discoveries you want to remember.") + noteEditor() + contextNoteEditor() + courseNotePicker() : overview();
  for(const list of main.querySelectorAll('[role="tablist"]')) {
    const tabs=[...list.querySelectorAll('[role="tab"]')];const panel=main.querySelector('[role="tabpanel"]');
    tabs.forEach((el,i)=>{el.tabIndex=el.getAttribute('aria-selected')==='true'?0:-1;el.id=`section-tab-${i}`;el.setAttribute('aria-controls','chapter-panel');});
    if(panel){panel.id='chapter-panel';panel.setAttribute('aria-labelledby',tabs.find(el=>el.tabIndex===0)?.id||tabs[0].id);}
  }
  if(view==='library'){document.getElementById('library-search').value=filterQuery;document.getElementById('library-topic').value=filterTag;filterLibrary();}
  const focusTarget=focusId?document.getElementById(focusId):focusAttrs.length?[...main.querySelectorAll('button,input,select')].find(el=>focusAttrs.every(([key,value])=>el.getAttribute(key)===value)):null;
  if(focusTarget && !focusTarget.disabled)focusTarget.focus({preventScroll:true});
  else if(focusAttrs.some(([key])=>key.includes('answer'))) {const feedback=main.querySelector('.feedback');if(feedback){feedback.tabIndex=-1;feedback.focus({preventScroll:true});}}
  if(['lesson','context','chapter'].includes(view)) {
    const contentPanel=main.querySelector('.tab-content');
    if(contentPanel && (view==='lesson'?tab:view==='context'?contextTab:chapterTab)==='practice') contentPanel.insertAdjacentHTML('afterbegin',button('Open compact companion','companion','secondary'));
  }
  window.quest.updateCompanion?.(companionStep()).catch(()=>{});

}
function navigate(nextView) {
  view = nextView;
  if (view === "lesson") { state.lessonSeen = true; save(); }
  else if (["context", "chapter"].includes(view)) save();
  render();
  main.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}
document.addEventListener("click", async event => {
  const target = event.target.closest("button, a");
  if (!target || !state) return;
  if (target.matches(".brand")) { event.preventDefault(); navigate("home"); return; }
  if (target.dataset.chapter) {
    const chapter = Course.chapters.find(ch => ch.id === target.dataset.chapter);
    if (!chapter) return;
    selectedChapter = chapter.id; chapterTab = "learn";
    state.chapters[selectedChapter].seen = true; save(); navigate("chapter"); return;
  }
  if (target.dataset.chapterTab) {
    chapterTab = target.dataset.chapterTab;
    if (chapterTab === "quiz") chapterQuestion = nextCourseQuestion();
    save(); render(); return;
  }
  if (target.dataset.courseAnswer !== undefined) {
    const ch = currentChapter(); const value = state.chapters[ch.id]; const q = ch.questions[chapterQuestion];
    if (!q || value.quiz[q.id].includes(q.correct) || quizLocked(q,value.quiz[q.id])) return;
    value.quiz[q.id].push(Number(target.dataset.courseAnswer)); save(); render();
    announce(value.quiz[q.id].includes(q.correct) ? "Correct. Continue when ready." : "Read the explanation and try again."); return;
  }
  if (target.dataset.copyStarter !== undefined) {
    const key = target.dataset.copyStarter;
    const step = view === "context" ? C.context.steps[state.context.step] : view === "chapter" ? currentChapter().steps[state.chapters[selectedChapter].step] : null;
    const activeKey = view === "context" ? `context:${state.context.step}` : view === "chapter" ? `${selectedChapter}:${state.chapters[selectedChapter].step}` : "";
    if (key !== activeKey || !step?.starter) return;
    try { await navigator.clipboard.writeText(step.starter.prompt); announce("Fictional handoff copied. It is sample data, not your completed work."); } catch { announce("Select the fictional handoff text and copy it manually."); }
    return;
  }
  if (target.dataset.copyCourse !== undefined) {
    try { await navigator.clipboard.writeText(currentChapter().steps[Number(target.dataset.copyCourse)].prompt); announce("Copied. Paste into your chosen assistant."); }
    catch { announce("Select the prompt and use Ctrl+C."); }
    return;
  }
  if (target.dataset.contextTab) {
    contextTab = target.dataset.contextTab;
    if (contextTab === "quiz") contextQuestion = contextNextQuestion();
    save(); render(); return;
  }
  if (target.dataset.contextAnswer !== undefined) {
    const q = C.context.questions[contextQuestion];
    if (!q || state.context.quiz[q.id].includes(q.correct) || quizLocked(q,state.context.quiz[q.id])) return;
    state.context.quiz[q.id].push(Number(target.dataset.contextAnswer));
    save(); render();
    announce(state.context.quiz[q.id].includes(q.correct) ? "Correct. Continue when ready." : "Read the feedback and try again.");
    return;
  }
  if (target.dataset.copyContext !== undefined) {
    const text = target.dataset.copyContext === "sample" ? C.context.sampleNote : C.context.steps[Number(target.dataset.copyContext)].prompt;
    try { await navigator.clipboard.writeText(text); announce("Copied. Paste into your chosen assistant or editor."); }
    catch { announce("Select the text and copy it with Ctrl+C."); }
    return;
  }
  if (target.dataset.copyFollowup) {
    const item = Course.followUps.find(item => item.id === target.dataset.copyFollowup);
    if (item) try { await navigator.clipboard.writeText(item.prompt); announce("Follow-up prompt copied. Use it with the relevant real AI tool."); } catch { announce("Select the prompt and copy it with Ctrl+C."); }
    return;
  }
  if (target.dataset.view) { navigate(target.dataset.view === "lesson" ? "course" : target.dataset.view); return; }
  if (target.dataset.tab) {
    tab = target.dataset.tab;
    if (tab === "quiz") { questionIndex = C.questions.findIndex(q => !S.solved(state, q)); if (questionIndex < 0) questionIndex = C.questions.length; }
    save(); render(); return;
  }
  if (target.dataset.answer !== undefined) {
    const q = C.questions[questionIndex];
    if (S.solved(state, q) || quizLocked(q,state.quiz[q.id])) return;
    state.quiz[q.id].push(Number(target.dataset.answer));
    save(); render();
    announce(S.solved(state, q) ? "Correct. You can continue to the next question." : "Not quite. Read the explanation and try again.");
    return;
  }
  if (target.dataset.contextStep !== undefined) {
    const step=Number(target.dataset.contextStep);
    if(view==="context" && Number.isInteger(step) && step>=0 && step<C.context.steps.length) {state.context.step=step; save(); render(); document.getElementById("context-step-title")?.focus();}
    return;
  }
  if (target.dataset.courseStep !== undefined) {
    const step = Number(target.dataset.courseStep);
    if (view === "chapter" && Number.isInteger(step) && step >= 0 && step < currentChapter().steps.length) { state.chapters[selectedChapter].step = step; save(); render(); document.getElementById("course-step-title")?.focus(); }
    return;
  }
  if (target.dataset.source) { window.quest.openSource(target.dataset.source).catch(() => announce("The source could not be opened.")); return; }
  switch (target.dataset.action) {
    case "resume": {
      const resume = state.resume;
      selectedChapter = resume.chapter;
      if (resume.view === "lesson") { tab = resume.tab; if (tab === "quiz") { questionIndex = C.questions.findIndex(q => !S.solved(state, q)); if (questionIndex < 0) questionIndex = C.questions.length; } }
      else if (resume.view === "context") { contextTab = resume.tab; if (contextTab === "quiz") contextQuestion = contextNextQuestion(); }
      else { chapterTab = resume.tab; if (chapterTab === "quiz") chapterQuestion = nextCourseQuestion(); }
      navigate(resume.view); break;
    }
    case "retry-question": {
      const q=view==="chapter"?currentChapter().questions[chapterQuestion]:view==="context"?C.context.questions[contextQuestion]:C.questions[questionIndex];
      const attempts=view==="chapter"?state.chapters[selectedChapter].quiz[q.id]:view==="context"?state.context.quiz[q.id]:state.quiz[q.id];
      reviewedAttempts.add(`${q.id}:${attempts.length}`);render();main.querySelector('.answer:not(:disabled)')?.focus();break;
    }
    case "journal": navigate("journal"); break;
    case "companion": await window.quest.openCompanion(companionStep()); break;
    case "prior-experience": {
      const id=view==="lesson"?"foundation":view==="context"?"context":selectedChapter;
      navigate("journal");const panel=main.querySelector('.prior-experience');
      if(panel){panel.open=true;const record=[...panel.querySelectorAll('[data-record-id]')].find(el=>el.dataset.recordId===id);if(record){record.open=true;record.scrollIntoView();record.querySelector('summary').focus();}}
      break;
    }
    case "export-progress": try { await save(); const exported = await window.quest.exportProgress(); announce(exported ? "Personal backup exported. Keep it private." : "Export cancelled."); } catch { announce("The backup could not be exported. Your current progress remains available."); } break;
    case "cancel-import": pendingImport = null; render(); break;
    case "confirm-import": if (pendingImport) { try { state = S.normalize(await window.quest.importProgress(pendingImport)); pendingImport = null; status.textContent = "All changes saved"; render(); announce("Backup imported. Previous progress was backed up in the local data folder."); } catch { announce("Import failed. Inspect your saved progress before continuing."); } } break;
    case "course": navigate("course"); break;
    case "course-practice": chapterTab = "practice"; navigate("chapter"); break;
    case "course-next": { const value = state.chapters[selectedChapter]; value.step = Math.min(currentChapter().steps.length - 1, value.step + 1); save(); render(); document.getElementById("course-step-title")?.focus(); break; }
    case "course-scope-guide": chapterTab="learn"; navigate("chapter"); document.getElementById("scope-guide-title")?.focus(); break;
    case "course-control-map": chapterTab = "learn"; navigate("chapter"); main.querySelector(".control-map")?.scrollIntoView(); break;
    case "course-step-skip":
    case "course-step-defer": { const value = state.chapters[selectedChapter]; const n = value.step + 1; value.checks = value.checks.filter(check => check !== n); value.stepStatus[n] = target.dataset.action === "course-step-skip" ? "skipped" : "deferred"; value.exercise = "not-started"; save(); render(); announce("Step saved to revisit. You can explore another step without claiming completion."); break; }
    case "course-back": state.chapters[selectedChapter].step = Math.max(0, state.chapters[selectedChapter].step - 1); save(); render(); break;
    case "course-practiced": { const value = state.chapters[selectedChapter]; if (value.checks.length === currentChapter().steps.length) { value.exercise = "practiced"; save(); render(); announce("Practice recorded from your report."); } break; }
    case "course-skip": state.chapters[selectedChapter].exercise = "skipped"; save(); render(); break;
    case "course-defer": state.chapters[selectedChapter].exercise = "deferred"; save(); render(); break;
    case "course-bookmark": state.chapters[selectedChapter].bookmarked = !state.chapters[selectedChapter].bookmarked; save(); render(); break;
    case "course-quiz": chapterTab = "quiz"; chapterQuestion = nextCourseQuestion(); navigate("chapter"); break;
    case "course-next-question": chapterQuestion++; render(); break;
    case "context": contextTab = "learn"; navigate("context"); break;
    case "context-practice": contextTab = "practice"; navigate("context"); break;
    case "context-next": { state.context.step = Math.min(C.context.steps.length - 1, state.context.step + 1); save(); render(); document.getElementById("context-step-title")?.focus(); } break;
    case "context-step-skip":
    case "context-step-defer": {const n=state.context.step+1; state.context.checks=state.context.checks.filter(check=>check!==n); state.context.stepStatus[n]=target.dataset.action==="context-step-skip"?"skipped":"deferred"; state.context.exercise="not-started"; save(); render(); announce("Step saved to revisit. Choose another step when ready."); break;}
    case "context-back": state.context.step = Math.max(0, state.context.step - 1); save(); render(); break;
    case "context-practiced": if (state.context.checks.length === C.context.steps.length) { state.context.exercise = "practiced"; save(); render(); announce("Practice recorded. This is your report of the external work."); } break;
    case "context-skip": state.context.exercise = "skipped"; save(); render(); break;
    case "context-defer": state.context.exercise = "deferred"; save(); render(); break;
    case "context-quiz": contextTab = "quiz"; contextQuestion = contextNextQuestion(); navigate("context"); break;
    case "context-next-question": contextQuestion++; render(); break;
    case "start": tab = state.exercise === "practiced" && S.summary(state).correct < C.questions.length ? "quiz" : "learn"; if (tab === "quiz") questionIndex = C.questions.findIndex(q => !S.solved(state, q)); navigate("lesson"); break;
    case "bookmark": state.bookmarked = !state.bookmarked; save(); render(); break;
    case "practice": tab = "practice"; navigate("lesson"); break;
    case "quiz": tab = "quiz"; questionIndex = C.questions.findIndex(q => !S.solved(state, q)); if (questionIndex < 0) questionIndex = C.questions.length; navigate("lesson"); break;
    case "next-question": questionIndex++; render(); break;
    case "mark-practiced": if (state.checks.length === 3) { state.exercise = "practiced"; save(); render(); announce("Practical exercise recorded as practiced."); } break;
    case "skip": state.exercise = "skipped"; save(); render(); break;
    case "defer": state.exercise = "deferred"; save(); render(); break;
    case "milestones":
    case "home": navigate("home"); break;
    case "profile": openProfile(); break;
    case "save-note": await save(); announce("Note save requested. Check the save status above."); break;
    case "copy-prompt": try { await navigator.clipboard.writeText(exercisePrompt); document.getElementById("copy-status").textContent = "Copied. Paste it into your chosen assistant."; announce("Prompt copied. Paste it into your assistant."); } catch { document.getElementById("copy-status").textContent = "Select the prompt text above and copy it with Ctrl+C."; } break;
  }
});
document.addEventListener("change", async event => {
  if (event.target.id === "progress-import") {
    const file = event.target.files[0];
    if (!file) return;
    try {
      if (file.size > 2000000) throw new Error("This file is too large for a progress backup.");
      const raw = JSON.parse(await file.text());
      if (raw?.kind && raw.kind !== "ai-discovery-quest") throw new Error("Unrecognized backup format.");
      const value = raw?.kind === "ai-discovery-quest" ? raw.progress : raw;
      if (!value || typeof value !== "object" || Array.isArray(value) || !(typeof value.notes === "string" || value.quiz || value.chapters)) throw new Error("This is not a recognized progress record.");
      pendingImport = S.normalize(value); render(); announce("Backup preview ready. Current progress has not been replaced.");
    } catch (error) { pendingImport = null; announce(`Cannot import: ${error.message}`); }
    return;
  }
  if (event.target.dataset.recordStatus || event.target.dataset.followStatus) {
    const collection = event.target.dataset.recordStatus ? state.records : state.followUps;
    const id = event.target.dataset.recordStatus || event.target.dataset.followStatus;
    if (collection[id]) { collection[id].status = event.target.value; save(); }
    return;
  }
  if (event.target.id === "library-topic") {filterTag=event.target.value;filterLibrary();return;}
  if (event.target.id === "notes-chapter-picker") { selectedChapter = event.target.value; render(); return; }
  if (event.target.dataset.courseCheck) {
    const value = state.chapters[selectedChapter]; const number = Number(event.target.dataset.courseCheck);
    value.checks = event.target.checked ? [...new Set([...value.checks, number])] : value.checks.filter(n => n !== number);
    if (value.checks.length !== currentChapter().steps.length && value.exercise === "practiced") value.exercise = "not-started";
    save(); render(); return;
  }
  if (event.target.dataset.contextCheck) {
    const number = Number(event.target.dataset.contextCheck);
    state.context.checks = event.target.checked ? [...new Set([...state.context.checks, number])] : state.context.checks.filter(n => n !== number);
    if (state.context.checks.length !== C.context.steps.length && state.context.exercise === "practiced") state.context.exercise = "not-started";
    save(); render(); return;
  }
  if (event.target.dataset.check) {
    const number = Number(event.target.dataset.check);
    state.checks = event.target.checked ? [...new Set([...state.checks, number])] : state.checks.filter(n => n !== number);
    if (state.exercise === "practiced" && state.checks.length !== 3) state.exercise = "not-started";
    save(); render();
  }
});
document.addEventListener("input", event => {
  if (event.target.dataset.recordNote || event.target.dataset.followNote) {
    const collection = event.target.dataset.recordNote ? state.records : state.followUps;
    const id = event.target.dataset.recordNote || event.target.dataset.followNote;
    if (collection[id]) { collection[id].note = event.target.value; save(); }
  }
  if (event.target.id === "course-note") { state.chapters[selectedChapter].notes = event.target.value; save(); }
  if (event.target.id === "context-note") { state.context.notes = event.target.value; save(); }
  if (event.target.id === "lesson-note") {
    state.notes = event.target.value;
    // Send every edit to the main process so closing during a debounce cannot lose it.
    save();
  }
  if (event.target.id === "library-search") {
    filterQuery=event.target.value.trim().toLowerCase();filterLibrary();
  }
});
window.quest.load().then(saved => { state = S.normalize(saved); status.textContent = "All changes saved"; render(); if(!state.profile.setupComplete)openProfile(); }).catch(error => {
  status.textContent = "Saved progress needs attention"; status.classList.add("error");
  main.innerHTML = `<section class="panel"><h1>Your progress has been kept intact.</h1><p>${esc(error.message)}</p><p>No new progress will be written in this session. Close this window and get help recovering the saved file.</p></section>`;
});

document.addEventListener('keydown', event => {
  const list=event.target.closest('[role="tablist"]');if(!list)return;
  const tabs=[...list.querySelectorAll('[role="tab"]')];let i=tabs.indexOf(event.target);
  if(i<0)return;
  if(event.key==='ArrowRight')i=(i+1)%tabs.length;
  else if(event.key==='ArrowLeft')i=(i+tabs.length-1)%tabs.length;
  else if(event.key==='Home')i=0;
  else if(event.key==='End')i=tabs.length-1;
  else return;
  event.preventDefault();tabs[i].focus();tabs[i].click();
});
window.quest.onCompanionCheck?.(payload=>{
  const current=companionStep();if(payload?.key!==current.key||current.readOnly)return;
  const box=main.querySelector(view==='context'?'[data-context-check]':'[data-course-check]');
  if(box && box.checked!==payload.checked)box.click();
});

window.quest.onCompanionAction?.(payload=>{
  const current=companionStep();
  if(payload?.key!==current.key)return;
  if(payload.action==="next" && current.canNext && view==="chapter" && chapterTab==="practice") {
    state.chapters[selectedChapter].step++; save(); render(); document.getElementById("course-step-title")?.focus();
  } else if(payload.action==="next" && current.canNext && view==="context" && contextTab==="practice") {
    state.context.step++; save(); render(); document.getElementById("context-step-title")?.focus();
  } else if(payload.action==="notes" && current.canNotes && view==="context") {
    contextTab="notes"; navigate("context"); document.getElementById("context-note")?.focus();
  } else if(payload.action==="notes" && current.canNotes && view==="chapter") {
    chapterTab="notes"; navigate("chapter"); document.getElementById("course-note")?.focus();
  }
});

let previousLevel;
function renderLearnerHeader() {
  if(!state)return;
  const info=S.courseSummary(state), earned=J.reward(info.complete,info.total);
  document.getElementById("learner-header").innerHTML=`<div class="learner-heading"><div><p class="greeting">${esc(J.greeting(new Date().getHours()))}, <button class="learner-name" data-action="profile" aria-label="Edit learner name"><bdi>${esc(state.profile.name || "Learner")}</bdi></button></p><h2>${esc(earned.title)} <span>Level ${earned.level}</span></h2></div><div class="learner-totals"><strong>${earned.xp} XP</strong><span>${earned.complete} / ${earned.total} chapters · ${earned.percent}% complete</span></div></div><progress id="level-progress" max="100" value="${earned.levelPercent}" aria-label="Progress through current learner level">${earned.levelPercent}%</progress><div class="level-caption"><span>${earned.nextTitle ? `${earned.xpToNext} XP to ${esc(earned.nextTitle)}` : "Highest title reached. Keep putting your skills to use."}</span><span>100 XP per completed chapter</span></div>`;
  if(previousLevel!==undefined && earned.level>previousLevel)announce(`Level up! You are now an ${earned.title}.`);
  previousLevel=earned.level;
}
function applySidebar() {
  const collapsed=state.ui.sidebarCollapsed;
  document.body.classList.toggle("nav-collapsed",collapsed);
  document.getElementById("sidebar").hidden=collapsed;
  const control=document.getElementById("sidebar-toggle");
  control.setAttribute("aria-expanded",String(!collapsed));
  control.setAttribute("aria-label",collapsed?"Open navigation":"Close navigation");
}
document.getElementById("sidebar-toggle").addEventListener("click",()=>{state.ui.sidebarCollapsed=!state.ui.sidebarCollapsed;applySidebar();save();});
function openProfile() {
  const dialog=document.getElementById("profile-dialog");
  document.getElementById("learner-name").value=state.profile.name;
  if(!dialog.open)dialog.showModal();
  document.getElementById("learner-name").focus();
}
async function finishProfile(name) {
  state.profile={name,setupComplete:true};
  await save();renderLearnerHeader();document.getElementById("profile-dialog").close();
  document.querySelector(".learner-name")?.focus();
}
document.getElementById("profile-form").addEventListener("submit",event=>{event.preventDefault();finishProfile(document.getElementById("learner-name").value);});
document.getElementById("profile-skip").addEventListener("click",()=>finishProfile(""));
document.getElementById("profile-dialog").addEventListener("cancel",()=>finishProfile(state.profile.name));
setInterval(()=>{if(state)renderLearnerHeader();},60000);
