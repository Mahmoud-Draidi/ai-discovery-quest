const C = window.QuestContent;
const S = window.QuestState;
const main = document.getElementById("main");
const status = document.getElementById("save-status");
const names = { home: "Overview", lesson: "Learning journey", library: "Reference library", notes: "My notes", milestones: "Milestones" };
let state;
let view = "home";
let tab = "learn";
let questionIndex = 0;
let saveRevision = 0;
const exercisePrompt = "Create a file called MY-FIRST-NOTE.md in my chosen practice folder. Write three beginner-friendly sentences explaining a model, a tool, and a skill. Add one everyday example below each. Tell me where you saved it. If you cannot create files here, explain that and provide the text instead.";
const esc = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function button(label, action, className = "primary") { return `<button class="${className}" data-action="${action}">${label}</button>`; }
function announce(text) { document.getElementById("announcement").textContent = text; }
function save() {
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
  <section class="hero panel"><div class="hero-copy"><span class="pill accent">YOUR NEXT DISCOVERY</span><h2>Models, tools,<br>and skills.</h2><p>Meet the three parts behind an AI assistant—and put them to work on your first note.</p><div class="hero-actions">${button(info.complete ? "Revisit chapter <span>↗</span>" : info.started ? "Continue learning <span>↗</span>" : "Start your journey <span>↗</span>", "start")}${button(state.bookmarked ? "★ Saved" : "☆ Save chapter", "bookmark", "text-button")}</div></div><div class="orbit" aria-hidden="true"><div class="orbit-ring"></div><div class="orbit-core">✦</div><span class="orbit-label orbit-model">MODEL <b>Think</b></span><span class="orbit-label orbit-tool">TOOL <b>Act</b></span><span class="orbit-label orbit-skill">SKILL <b>Guide</b></span></div></section>
  <section class="stats" aria-label="Your progress"><div class="panel stat"><span>FIRST CHAPTER</span><strong>${info.percent}<small>%</small></strong><progress max="100" value="${info.percent}" aria-label="First chapter progress">${info.percent}%</progress><p>${chapterBadge()}</p></div><div class="panel stat"><span>KNOWLEDGE CHECK</span><strong>${info.correct}<small> / 3</small></strong><p>Questions understood</p></div><div class="panel stat"><span>YOUR FIRST MILESTONE</span><strong class="milestone-name">${info.complete ? "✧ AI Explorer" : "◇ AI Explorer"}</strong><p>${info.complete ? "Earned through practice" : "Complete the exercise + knowledge check"}</p></div></section>
  <div class="section-heading"><h2>The journey ahead</h2><span class="muted">Built one chapter at a time</span></div><section class="roadmap"><button class="roadmap-card available" data-action="start"><span class="chapter-number">01</span><div><h3>Models, tools & skills</h3><p>Understand the parts. Try your first task.</p></div><span>↗</span></button>${C.roadmap.map((title, i) => `<div class="roadmap-card upcoming"><span class="chapter-number">${String(i + 2).padStart(2, "0")}</span><div><h3>${title}</h3><p>Planned chapter · not yet available</p></div></div>`).join("")}</section>`;
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
function library() {
  return `${intro("A PLACE TO COME BACK TO", "Keep the useful bits close.", "Search the first chapter's concepts and the practical questions behind them.")}<label class="search-label" for="library-search">Search this reference library</label><input id="library-search" class="search" type="search" placeholder="Try “files”, “skill”, or “verification”…"><p class="muted" id="search-count">${C.library.length} entries</p><div class="library-grid">${C.library.map(entry => `<article class="panel library-entry" data-search="${esc((entry.title + " " + entry.tag + " " + entry.text).toLowerCase())}"><span class="pill">${entry.tag}</span><h2>${entry.title}</h2><p>${entry.text}</p></article>`).join("")}</div><p class="muted">This reference grows as chapters are added.</p><div class="sources panel"><h2>Go to the source</h2><p>These official references open in your browser and need an internet connection. The bundled chapter works offline.</p><button class="text-button" data-source="https://learn.chatgpt.com/docs/skills-and-plugins">OpenAI · Skills and plugins ↗</button><button class="text-button" data-source="https://learn.chatgpt.com/docs/prompting">OpenAI · Prompting ↗</button></div>`;
}
function milestones() {
  const info = S.summary(state);
  return `${intro("PROOF OF PRACTICE", "Small wins. Real understanding.", "Titles celebrate what you've tried and checked—not how many pages you've opened.")}<section class="panel award ${info.complete ? "earned" : ""}"><div class="award-symbol">✧</div><span class="pill ${info.complete ? "accent" : ""}">${info.complete ? "EARNED" : "YOUR FIRST MILESTONE"}</span><h2>AI Explorer</h2><p>Understand the model, tool, and skill behind your first AI-assisted task.</p><ul class="award-requirements"><li>${state.exercise === "practiced" ? "✓" : "○"} Practical exercise recorded as practiced</li><li>${info.correct === 3 ? "✓" : "○"} Knowledge check: ${info.correct} / 3 understood</li></ul>${button(info.complete ? "Revisit the chapter" : "Continue the chapter", "start")}</section>`;
}
function render() {
  for (const item of document.querySelectorAll("nav [data-view]")) { item.classList.toggle("active", item.dataset.view === view); item.setAttribute("aria-current", item.dataset.view === view ? "page" : "false"); }
  document.getElementById("breadcrumb").textContent = names[view];
  main.innerHTML = view === "home" ? overview() : view === "lesson" ? lesson() : view === "library" ? library() : view === "notes" ? intro("YOUR PERSONAL FIELD NOTES", "Make it yours.", "Capture the examples, questions, and discoveries you want to remember.") + noteEditor() : milestones();
}
function navigate(nextView) {
  view = nextView;
  if (view === "lesson") { state.lessonSeen = true; save(); }
  render();
  main.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}
document.addEventListener("click", async event => {
  const target = event.target.closest("button, a");
  if (!target || !state) return;
  if (target.matches(".brand")) { event.preventDefault(); navigate("home"); return; }
  if (target.dataset.view) { navigate(target.dataset.view); return; }
  if (target.dataset.tab) {
    tab = target.dataset.tab;
    if (tab === "quiz") { questionIndex = C.questions.findIndex(q => !S.solved(state, q)); if (questionIndex < 0) questionIndex = 3; }
    render(); return;
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
document.addEventListener("change", event => {
  if (event.target.dataset.check) {
    const number = Number(event.target.dataset.check);
    state.checks = event.target.checked ? [...new Set([...state.checks, number])] : state.checks.filter(n => n !== number);
    if (state.exercise === "practiced" && state.checks.length !== 3) state.exercise = "not-started";
    save(); render();
  }
});
document.addEventListener("input", event => {
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
