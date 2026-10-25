const C = window.QuestContent;
const S = window.QuestState;
const Course = window.QuestCourse;
let selectedChapter = Course.chapters[0].id;
let chapterTab = "learn";
let chapterQuestion = 0;
const main = document.getElementById("main");
const status = document.getElementById("save-status");
const names = { home: "Overview", lesson: "Learning journey", context: "Learning journey", course: "Learning journey", chapter: "Learning journey", journal: "My journey", library: "Reference library", notes: "My notes", milestones: "Milestones" };
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
function announce(text) { document.getElementById("announcement").textContent = text; }
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
  <section class="panel course-progress"><span class="pill accent">YOUR WHOLE JOURNEY</span><h2>${S.courseSummary(state).complete} of ${S.courseSummary(state).total} chapters practiced & checked</h2><progress max="100" value="${S.courseSummary(state).percent}" aria-label="Whole course progress">${S.courseSummary(state).percent}%</progress><p>Track your practice, understanding, and next step.</p>${button("Continue where I left off →", "resume")}${button("Explore all chapters →", "course", "secondary")}${button("My existing practice & follow-ups", "journal", "text-button")}</section>
  <section class="hero panel"><div class="hero-copy"><span class="pill accent">YOUR NEXT DISCOVERY</span><h2>Models, tools,<br>and skills.</h2><p>Meet the three parts behind an AI assistant—and put them to work on your first note.</p><div class="hero-actions">${button(info.complete ? "Revisit chapter <span>↗</span>" : info.started ? "Continue learning <span>↗</span>" : "Start your journey <span>↗</span>", "start")}${button(state.bookmarked ? "★ Saved" : "☆ Save chapter", "bookmark", "text-button")}</div></div><div class="orbit" aria-hidden="true"><div class="orbit-ring"></div><div class="orbit-core">✦</div><span class="orbit-label orbit-model">MODEL <b>Think</b></span><span class="orbit-label orbit-tool">TOOL <b>Act</b></span><span class="orbit-label orbit-skill">SKILL <b>Guide</b></span></div></section>
  <section class="stats" aria-label="Your progress"><div class="panel stat"><span>FIRST CHAPTER</span><strong>${info.percent}<small>%</small></strong><progress max="100" value="${info.percent}" aria-label="First chapter progress">${info.percent}%</progress><p>${chapterBadge()}</p></div><div class="panel stat"><span>KNOWLEDGE CHECK</span><strong>${info.correct}<small> / 3</small></strong><p>Questions understood</p></div><div class="panel stat"><span>YOUR FIRST MILESTONE</span><strong class="milestone-name">${info.complete ? "✧ AI Explorer" : "◇ AI Explorer"}</strong><p>${info.complete ? "Earned through practice" : "Complete the exercise + knowledge check"}</p></div></section>
  <div class="section-heading"><h2>Choose your next topic</h2><span class="muted">13 chapters · choose your pace</span></div><section class="roadmap">${catalogCards()}</section>`;
}
function learn() {
  return `<h2 class="tab-heading">Three parts. Different jobs.</h2><p class="lead">One assistant can combine all three. Recognizing their roles helps you ask for the right kind of help.</p><div class="concepts">${C.concepts.map((c, i) => `<article class="panel concept"><span class="concept-index">0${i + 1}</span><h3>${c.name}</h3><div class="concept-verb">${c.verb}</div><p>${c.text}</p><div class="example"><span>EVERYDAY EXAMPLE</span><p>${c.example}</p></div></article>`).join("")}</div><div class="callout"><span>✦</span><p><strong>Try describing an outcome.</strong> “Help me plan a week of meals.” The model reasons, tools can find information or save files, and a skill can guide the method. Available tools depend on your assistant.</p></div><div class="section-heading"><h2>Understanding becomes useful through practice.</h2>${button("Try the exercise →", "practice")}</div>`;
}
function practice() {
  const checks = ["I opened the actual note and checked its three definitions and examples.", "I requested one change and checked that the saved note reflected it.", "I can identify the model, the file-writing tool, and where reusable instructions would fit."];
  return `<h2 class="tab-heading">Make your first AI-assisted note.</h2><p class="lead">Use an assistant you already have. Your goal is to inspect a real result—not just accept “done.”</p><div class="practice-grid"><section class="panel"><span class="pill">STEP 01 · DO</span><h3>Ask for a useful result</h3><p>Open a file-capable AI assistant and choose a practice folder. Copy this prompt, then send it there.</p><pre class="prompt" id="exercise-prompt">${esc(exercisePrompt)}</pre>${button("Copy prompt", "copy-prompt", "secondary")}<p id="copy-status" role="status" class="muted"></p><div class="small-callout"><strong>No file tools?</strong> Save the supplied text in your own editor. You can practice the concepts; record AI-operated file creation as deferred rather than claiming it happened.</div></section><section class="panel"><span class="pill">STEP 02 · VERIFY</span><h3>Check what really happened</h3><p>Create the note, ask for an edit, and inspect both results. Use the checklist after doing the actions.</p><div class="checklist">${checks.map((text, i) => `<label><input type="checkbox" data-check="${i + 1}" ${state.checks.includes(i + 1) ? "checked" : ""}><span>${text}</span></label>`).join("")}</div><p class="honesty">This checklist is your report. The app cannot observe your external chat or files.</p><button class="primary" data-action="mark-practiced" ${state.checks.length === 3 ? "" : "disabled"}>Mark exercise practiced</button><div class="exercise-options">${button("Skip for now", "skip", "text-button")}${button("Tools unavailable", "defer", "text-button")}</div><p class="exercise-state" role="status">Exercise: <strong>${esc(state.exercise.replace("not-started", "still to do"))}</strong></p></section></div><div class="callout"><span>↗</span><p><strong>Next, explain it in your own words.</strong> The three-question check helps connect what you did with the concepts.</p>${button("Knowledge check", "quiz", "secondary")}</div>`;
}
function quiz() {
  const info = S.summary(state);
  if (info.correct === 3 && questionIndex >= 3) return `<section class="panel quiz-finish"><span class="large-spark">✧</span><h2>You know the difference.</h2><p>All three questions are understood. ${state.exercise === "practiced" ? "Your practical exercise is complete too. You earned AI Explorer." : "Complete the practical exercise to earn AI Explorer. Reading and answering alone do not complete this chapter."}</p>${button(state.exercise === "practiced" ? "See my milestone" : "Return to exercise", state.exercise === "practiced" ? "milestones" : "practice")}</section>`;
  const q = C.questions[Math.min(questionIndex, 2)];
  const attempts = state.quiz[q.id];
  const last = attempts.at(-1);
  const correct = S.solved(state, q);
  const feedback = last !== undefined;
  return `<section class="panel quiz-card"><div class="section-heading"><span class="pill">QUESTION ${questionIndex + 1} OF 3</span><span class="muted">No rush. Retries are part of learning.</span></div><h2>${q.prompt}</h2><div class="answers">${C.concepts.map((c, i) => `<button data-answer="${i}" class="answer ${last === i ? correct ? "correct" : "incorrect" : ""}" ${correct ? "disabled" : ""}><span>${String.fromCharCode(65 + i)}</span>${c.name}${correct && last === i ? "<b>✓</b>" : ""}</button>`).join("")}</div>${feedback ? `<div class="feedback ${correct ? "positive" : "retry"}" role="status"><strong>${correct ? "That's right." : "Not quite—give it another try."}</strong><p>${q.explanation}</p></div>` : ""}${correct ? button(questionIndex === 2 ? "Finish knowledge check →" : "Next question →", "next-question") : `<p class="muted">Choose the role that fits the action described.</p>`}</section>`;
}
function lesson() {
  return `${intro("CHAPTER 01 · THE FOUNDATIONS", "Models, tools, and skills.", "Understand the roles. Create something real. Check your understanding.")}<div class="lesson-meta"><span class="pill accent">${chapterBadge()}</span><span>Exercise + 3 questions</span><span>Flexible pace</span></div><div class="tabs" role="tablist" aria-label="Chapter sections">${[["learn", "01", "Understand"], ["practice", "02", "Try it"], ["quiz", "03", "Check"], ["notes", "04", "Keep a note"]].map(([id, number, label]) => `<button role="tab" aria-selected="${tab === id}" data-tab="${id}" class="${tab === id ? "selected" : ""}"><span>${number}</span>${label}</button>`).join("")}</div><section class="tab-content" role="tabpanel" aria-label="${tab}">${tab === "learn" ? learn() : tab === "practice" ? practice() : tab === "quiz" ? quiz() : noteEditor()}</section>`;
}
function chapterLinks() {
  return `<div class="chapter-links" aria-label="Available chapters">${button("01 · Models, tools & skills", "start", "secondary")}${button("02 · Files, context & continuity", "context", "secondary")}${button("All 13 chapters", "course", "secondary")}</div>`;
}
function contextSources() { return C.context.sources.map(s => `<button class="text-button" data-source="${s.url}">${esc(s.label)} ↗</button>`).join(""); }
function contextNoteEditor() {
  return `<section class="panel note-panel"><h2>Your context discoveries</h2><label for="context-note">Files, context, and continuity · My notes</label><textarea id="context-note" maxlength="20000" placeholder="What helped the new chat resume?">${esc(state.context.notes)}</textarea><div class="note-bottom"><span>Saved separately from your chapter-one note.</span>${button("Save context note", "save-note", "secondary")}</div></section>`;
}
function contextNextQuestion() {
  const index = C.context.questions.findIndex(q => !state.context.quiz[q.id].includes(q.correct));
  return index < 0 ? 3 : index;
}
function contextPractice() {
  const index = state.context.step;
  const step = C.context.steps[index];
  const checked = state.context.checks.includes(index + 1);
  return `<section class="panel context-step"><span class="pill">STEP ${index + 1} OF 4</span><h2 id="context-step-title" tabindex="-1">${esc(step.title)}</h2><p class="lead">${esc(step.text)}</p><pre class="prompt">${esc(step.prompt)}</pre><button class="secondary" data-copy-context="${index}">Copy this prompt</button><div class="small-callout">${esc(step.hint)}</div>${index === 0 ? `<details><summary>Need a sample first note?</summary><pre class="prompt">${esc(C.context.sampleNote)}</pre><button class="secondary" data-copy-context="sample">Copy sample note</button><p>Save this as MY-FIRST-NOTE.md, then attach it or place it in your accessible practice workspace.</p></details>` : ""}<div class="checklist"><label><input type="checkbox" data-context-check="${index + 1}" ${checked ? "checked" : ""}><span>${esc(step.check)}</span></label></div><p class="honesty">Your report of work in another assistant. This app cannot inspect that chat or enable its file access.</p><div class="hero-actions">${index > 0 ? button("← Previous step", "context-back", "secondary") : ""}${index < 3 ? `<button class="primary" data-action="context-next" ${checked ? "" : "disabled"}>Next step →</button>` : `<button class="primary" data-action="context-practiced" ${state.context.checks.length === 4 ? "" : "disabled"}>Mark context exercise practiced</button>`}</div><p class="exercise-state" role="status">Context exercise: <strong>${esc(state.context.exercise)}</strong> · ${state.context.checks.length} / 4 checks</p><div class="exercise-options">${button("Skip context exercise", "context-skip", "text-button")}${button("Context tools unavailable", "context-defer", "text-button")}</div>${button("Knowledge check →", "context-quiz", "secondary")}</section>`;
}
function contextQuiz() {
  const info = S.contextSummary(state);
  if (contextQuestion >= 3) return `<section class="panel quiz-finish"><span class="large-spark">✧</span><h2>You can distinguish access from context.</h2><p>Three questions understood. ${info.complete ? "You also practiced the file-and-resume exercise. Context Navigator earned." : "Complete the four practical steps to finish this chapter. Quiz answers alone do not complete external practice."}</p>${button("Return to practical steps", "context-practice")}</section>`;
  const q = C.context.questions[contextQuestion];
  const attempts = state.context.quiz[q.id];
  const correct = attempts.includes(q.correct);
  const last = attempts.at(-1);
  return `<section class="panel quiz-card"><span class="pill">QUESTION ${contextQuestion + 1} OF 3</span><h2>${esc(q.prompt)}</h2><div class="answers">${q.choices.map((choice, i) => `<button class="answer ${last === i ? correct ? "correct" : "incorrect" : ""}" data-context-answer="${i}" ${correct ? "disabled" : ""}><span>${String.fromCharCode(65 + i)}</span>${esc(choice)}</button>`).join("")}</div>${last !== undefined ? `<div class="feedback ${correct ? "positive" : "retry"}" role="status"><strong>${correct ? "That's right." : "Not quite—give it another try."}</strong><p>${esc(q.explanation)}</p></div>` : ""}${correct ? button(contextQuestion === 2 ? "Finish context check →" : "Next context question →", "context-next-question") : ""}</section>`;
}
function contextLesson() {
  const info = S.contextSummary(state);
  const badge = info.complete ? "Practiced & checked" : state.context.exercise === "skipped" ? "Exercise skipped" : state.context.exercise === "deferred" ? "Exercise deferred" : state.context.checks.length || info.correct ? "In progress" : "Ready to explore";
  return `${chapterLinks()}${intro("CHAPTER 02 · GIVE AI USEFUL CONTEXT", "Files, context, and continuity.", "Supply the right source. Inspect the answer. Save a useful record for the next chat.")}<div class="lesson-meta"><span class="pill accent">${badge}</span><span>${info.percent}% · ${info.correct} / 3 questions</span></div><div class="tabs" role="tablist" aria-label="Context chapter sections">${[["learn", "Understand"], ["practice", "Try it"], ["quiz", "Check"], ["notes", "Keep a note"]].map(([id, label]) => `<button role="tab" aria-selected="${contextTab === id}" data-context-tab="${id}" class="${contextTab === id ? "selected" : ""}">${label}</button>`).join("")}</div><section class="tab-content" role="tabpanel" aria-label="Context ${contextTab}">${contextTab === "practice" ? contextPractice() : contextTab === "quiz" ? contextQuiz() : contextTab === "notes" ? contextNoteEditor() : `<div class="callout"><span>↗</span><p><strong>Does putting a file in a project mean the AI has read it?</strong> File access makes a source available. Ask the assistant to read the relevant file, then check its answer against that source.</p></div><div class="concepts">${[["Available", "A supported attachment or workspace makes a file accessible. A path alone does not grant access."], ["Used for this task", "Ask the assistant to read the relevant source. Compare the answer with the actual file."], ["Useful next time", "Keep working preferences in project instructions and completed work in a progress note."]].map(([title, text]) => `<article class="panel concept"><h3>${title}</h3><p>${text}</p></article>`).join("")}</div><section class="panel"><h2>Choose how to supply the file</h2><p>In a chat with uploads, attach the note. In a supported local project, use its accessible workspace. A ChatGPT project's shared uploaded or connected sources are different from a folder on your computer.</p><h3>Keep useful instructions and progress</h3><p>Codex uses AGENTS.md for project guidance; other surfaces may provide instruction settings. Record what you completed and the next step in a progress note, then test resuming in another chat.</p><p>Memory is a separate capability and is not required for this exercise. If a tool is unavailable, note the limitation and use the supported alternative.</p>${button("Start the context exercise →", "context-practice")}</section><section class="sources panel"><h2>Official references</h2><p>Product controls can differ. Links need internet; the chapter itself works offline.</p>${contextSources()}</section>`}</section>`;
}
function contextMilestone() {
  const info = S.contextSummary(state);
  return `<section class="panel award ${info.complete ? "earned" : ""}"><div class="award-symbol">✧</div><span class="pill">${info.complete ? "EARNED" : "CHAPTER TWO MILESTONE"}</span><h2>Context Navigator</h2><p>Supply a source, inspect an answer, and resume from a useful record.</p><ul class="award-requirements"><li>${state.context.exercise === "practiced" ? "✓" : "○"} Four practical steps recorded</li><li>${info.correct === 3 ? "✓" : "○"} Context check: ${info.correct} / 3 understood</li></ul>${button("Open context chapter", "context")}</section>`;
}
function referenceEntries() { return [...C.library, ...C.context.library, ...Course.chapters.flatMap(ch => ch.library)]; }
function library() {
  return `${intro("A PLACE TO COME BACK TO", "Keep the useful bits close.", "Find clear answers about AI concepts, tools, and practical workflows.")}<label class="search-label" for="library-search">Search this reference library</label><input id="library-search" class="search" type="search" placeholder="Try “files”, “skill”, or “verification”…"><p class="muted" id="search-count">${referenceEntries().length} entries</p><div class="library-grid">${referenceEntries().map(entry => `<article class="panel library-entry" data-search="${esc((entry.title + " " + entry.tag + " " + entry.text).toLowerCase())}"><span class="pill">${entry.tag}</span><h2>${entry.title}</h2><p>${entry.text}</p></article>`).join("")}</div><p class="muted">This reference grows as chapters are added.</p><div class="sources panel"><h2>Go to the source</h2><p>These official references open in your browser and need an internet connection. Bundled chapters work offline.</p><button class="text-button" data-source="https://learn.chatgpt.com/docs/skills-and-plugins">OpenAI · Skills and plugins ↗</button><button class="text-button" data-source="https://learn.chatgpt.com/docs/prompting">OpenAI · Prompting ↗</button>${contextSources()}${courseSources(Object.keys(Course.sources))}</div>`;
}
function milestones() {
  const info = S.summary(state);
  return `${intro("PROOF OF PRACTICE", "Small wins. Real understanding.", "Titles celebrate what you've tried and checked—not how many pages you've opened.")}<section class="panel award ${info.complete ? "earned" : ""}"><div class="award-symbol">✧</div><span class="pill ${info.complete ? "accent" : ""}">${info.complete ? "EARNED" : "YOUR FIRST MILESTONE"}</span><h2>AI Explorer</h2><p>Understand the model, tool, and skill behind your first AI-assisted task.</p><ul class="award-requirements"><li>${state.exercise === "practiced" ? "✓" : "○"} Practical exercise recorded as practiced</li><li>${info.correct === 3 ? "✓" : "○"} Knowledge check: ${info.correct} / 3 understood</li></ul>${button(info.complete ? "Revisit the chapter" : "Continue the chapter", "start")}</section>`;
}
function render() {
  for (const item of document.querySelectorAll("nav [data-view]")) { const active = item.dataset.view === view || (["context", "course", "chapter"].includes(view) && item.dataset.view === "lesson"); item.classList.toggle("active", active); item.setAttribute("aria-current", active ? "page" : "false"); }
  document.getElementById("breadcrumb").textContent = names[view];
  main.innerHTML = view === "home" ? overview() : view === "lesson" ? chapterLinks() + lesson() : view === "context" ? contextLesson() : view === "course" ? courseIndex() : view === "chapter" ? courseChapter() : view === "journal" ? journeyJournal() : view === "library" ? library() : view === "notes" ? intro("YOUR PERSONAL FIELD NOTES", "Make it yours.", "Capture the examples, questions, and discoveries you want to remember.") + noteEditor() + contextNoteEditor() + courseNotePicker() : milestones() + contextMilestone() + Course.chapters.map(ch => courseMilestone(ch)).join("");
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
    if (!q || value.quiz[q.id].includes(q.correct)) return;
    value.quiz[q.id].push(Number(target.dataset.courseAnswer)); save(); render();
    announce(value.quiz[q.id].includes(q.correct) ? "Correct. Continue when ready." : "Read the explanation and try again."); return;
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
    if (!q || state.context.quiz[q.id].includes(q.correct)) return;
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
    if (tab === "quiz") { questionIndex = C.questions.findIndex(q => !S.solved(state, q)); if (questionIndex < 0) questionIndex = 3; }
    save(); render(); return;
  }
  if (target.dataset.answer !== undefined) {
    const q = C.questions[questionIndex];
    if (S.solved(state, q)) return;
    state.quiz[q.id].push(Number(target.dataset.answer));
    save(); render();
    announce(S.solved(state, q) ? "Correct. You can continue to the next question." : "Not quite. Read the explanation and try again.");
    return;
  }
  if (target.dataset.source) { window.quest.openSource(target.dataset.source).catch(() => announce("The source could not be opened.")); return; }
  switch (target.dataset.action) {
    case "resume": {
      const resume = state.resume;
      selectedChapter = resume.chapter;
      if (resume.view === "lesson") { tab = resume.tab === "reference" ? "learn" : resume.tab; if (tab === "quiz") { questionIndex = C.questions.findIndex(q => !S.solved(state, q)); if (questionIndex < 0) questionIndex = 3; } }
      else if (resume.view === "context") { contextTab = resume.tab === "reference" ? "learn" : resume.tab; if (contextTab === "quiz") contextQuestion = contextNextQuestion(); }
      else { chapterTab = resume.tab; if (chapterTab === "quiz") chapterQuestion = nextCourseQuestion(); }
      navigate(resume.view); break;
    }
    case "journal": navigate("journal"); break;
    case "export-progress": try { await save(); const exported = await window.quest.exportProgress(); announce(exported ? "Personal backup exported. Keep it private." : "Export cancelled."); } catch { announce("The backup could not be exported. Your current progress remains available."); } break;
    case "cancel-import": pendingImport = null; render(); break;
    case "confirm-import": if (pendingImport) { try { state = S.normalize(await window.quest.importProgress(pendingImport)); pendingImport = null; status.textContent = "All changes saved"; render(); announce("Backup imported. Previous progress was backed up in the local data folder."); } catch { announce("Import failed. Inspect your saved progress before continuing."); } } break;
    case "course": navigate("course"); break;
    case "course-practice": chapterTab = "practice"; navigate("chapter"); break;
    case "course-next": { const value = state.chapters[selectedChapter]; if (value.checks.includes(value.step + 1)) { value.step = Math.min(currentChapter().steps.length - 1, value.step + 1); save(); render(); document.getElementById("course-step-title")?.focus(); } break; }
    case "course-back": state.chapters[selectedChapter].step = Math.max(0, state.chapters[selectedChapter].step - 1); save(); render(); break;
    case "course-practiced": { const value = state.chapters[selectedChapter]; if (value.checks.length === currentChapter().steps.length) { value.exercise = "practiced"; save(); render(); announce("Practice recorded from your report."); } break; }
    case "course-skip": state.chapters[selectedChapter].exercise = "skipped"; save(); render(); break;
    case "course-defer": state.chapters[selectedChapter].exercise = "deferred"; save(); render(); break;
    case "course-bookmark": state.chapters[selectedChapter].bookmarked = !state.chapters[selectedChapter].bookmarked; save(); render(); break;
    case "course-quiz": chapterTab = "quiz"; chapterQuestion = nextCourseQuestion(); navigate("chapter"); break;
    case "course-next-question": chapterQuestion++; render(); break;
    case "context": contextTab = "learn"; navigate("context"); break;
    case "context-practice": contextTab = "practice"; navigate("context"); break;
    case "context-next": if (state.context.checks.includes(state.context.step + 1)) { state.context.step = Math.min(3, state.context.step + 1); save(); render(); document.getElementById("context-step-title")?.focus(); } break;
    case "context-back": state.context.step = Math.max(0, state.context.step - 1); save(); render(); break;
    case "context-practiced": if (state.context.checks.length === 4) { state.context.exercise = "practiced"; save(); render(); announce("Practice recorded. This is your report of the external work."); } break;
    case "context-skip": state.context.exercise = "skipped"; save(); render(); break;
    case "context-defer": state.context.exercise = "deferred"; save(); render(); break;
    case "context-quiz": contextTab = "quiz"; contextQuestion = contextNextQuestion(); navigate("context"); break;
    case "context-next-question": contextQuestion++; render(); break;
    case "start": tab = state.exercise === "practiced" && S.summary(state).correct < 3 ? "quiz" : "learn"; if (tab === "quiz") questionIndex = C.questions.findIndex(q => !S.solved(state, q)); navigate("lesson"); break;
    case "bookmark": state.bookmarked = !state.bookmarked; save(); render(); break;
    case "practice": tab = "practice"; navigate("lesson"); break;
    case "quiz": tab = "quiz"; questionIndex = C.questions.findIndex(q => !S.solved(state, q)); if (questionIndex < 0) questionIndex = 3; navigate("lesson"); break;
    case "next-question": questionIndex++; render(); break;
    case "mark-practiced": if (state.checks.length === 3) { state.exercise = "practiced"; save(); render(); announce("Practical exercise recorded as practiced."); } break;
    case "skip": state.exercise = "skipped"; save(); render(); break;
    case "defer": state.exercise = "deferred"; save(); render(); break;
    case "milestones": navigate("milestones"); break;
    case "save-note": await save(); announce("Note save requested. Check the save status above."); break;
    case "copy-prompt": try { await navigator.clipboard.writeText(exercisePrompt); document.getElementById("copy-status").textContent = "Copied. Paste it into your chosen assistant."; } catch { document.getElementById("copy-status").textContent = "Select the prompt text above and copy it with Ctrl+C."; } break;
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
    if (state.context.checks.length !== 4 && state.context.exercise === "practiced") state.context.exercise = "not-started";
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
    const query = event.target.value.trim().toLowerCase();
    let count = 0;
    for (const card of document.querySelectorAll(".library-entry")) { card.hidden = !card.dataset.search.includes(query); if (!card.hidden) count++; }
    document.getElementById("search-count").textContent = count ? `${count} ${count === 1 ? "entry" : "entries"}` : "No matching entries. Try a different word.";
  }
});
window.quest.load().then(saved => { state = S.normalize(saved); status.textContent = "All changes saved"; render(); }).catch(error => {
  status.textContent = "Saved progress needs attention"; status.classList.add("error");
  main.innerHTML = `<section class="panel"><h1>Your progress has been kept intact.</h1><p>${esc(error.message)}</p><p>No new progress will be written in this session. Close this window and get help recovering the saved file.</p></section>`;
});
