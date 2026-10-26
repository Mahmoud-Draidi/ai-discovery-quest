// Shared navigation, feedback, and study support. No external actions are automated here.
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
  const ch = Course.chapters.find(ch => ch.id === id);
  if (!ch?.prerequisites?.length) return "";
  return `<div class="prerequisite"><p><strong>Bring this preparation:</strong> ${ch.prerequisites.map(id => esc(chapterTitle(id))).join("; ")}. Completion is not locked: bring equivalent work or defer unavailable steps.</p><div class="chapter-links">${ch.prerequisites.map(id => chapterButton(id)).join("")}</div></div>`;
}
function otherTools(id) {
  const ch = Course.chapters.find(ch => ch.id === id);
  const items = ch?.otherTools || (id === "context" ? [
    {title:"Claude · Projects",text:"Projects organize supplied knowledge and instructions for focused chats. Compare the files you explicitly supplied; do not assume the full transcript of another chat was inherited.",sources:["claudeProjects"]},
    {title:"Claude Code and Copilot · repository guidance",text:"Compare CLAUDE.md with Copilot repository instructions and AGENTS.md. Inspect the scope the chosen client reads.",sources:["claudeMemory","copilotRepo"]}
  ] : [
    {title:"Claude Code · model, tools and skills",text:"Distinguish the reasoning model, action-performing tools, and reusable task guidance in the same way; inspect the installed capabilities.",sources:["claude"]},
    {title:"Copilot · chat and repository agents",text:"A chat answer, a file edit and a tested repository change provide different evidence even when the product groups them in one workflow.",sources:["copilotOverview"]}
  ]);
  return `<aside class="panel other-tools"><h2>In other tools</h2>${items.map(item => `<h3>${esc(item.title)}</h3><p>${esc(item.text)}</p>${courseSources(item.sources)}`).join("")}<p>Comparisons are reference, not a claim that you practiced another product. Extra subscriptions are optional.</p></aside>`;
}
function earlyReference(id) {
  const entries = id === "context" ? C.context.library : C.library;
  const ids = id === "context" ? ["projects","memories","files"] : ["plugins","prompting"];
  return `<section class="chapter-questions">${entries.map(item => `<details class="panel"><summary>${esc(item.title)}</summary><p>${esc(item.text)}</p></details>`).join("")}</section><section class="panel sources"><h2>Official references</h2><p>Content review: ${esc(Course.checkedOn)}. Check the source and your app before relying on a product-specific control.</p>${courseSources(ids)}</section>`;
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
function companionStep() {
  if (view === "chapter" && chapterTab === "practice") {
    const ch=currentChapter(), value=state.chapters[ch.id];return {key:`${ch.id}:${value.step}`,title:ch.title,...ch.steps[value.step],checked:value.checks.includes(value.step+1)};
  }
  if (view === "context" && contextTab === "practice") return {key:`context:${state.context.step}`,title:chapterTitle("context"),...C.context.steps[state.context.step],checked:state.context.checks.includes(state.context.step+1)};
  if (view === "lesson" && tab === "practice") return {key:"foundation:0",title:chapterTitle("foundation"),text:"Create, inspect, then edit your note. Keep the main window checklist accurate.",prompt:exercisePrompt,check:"I inspected the note; return to the main window to record the separate checks.",readOnly:true};
  return {key:"none",title:"Practice companion",text:"Open a chapter's Try it tab to show its current step here.",prompt:"",readOnly:true};
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
