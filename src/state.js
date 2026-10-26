(function (root) {
  const content = typeof module !== "undefined" ? require("./content.js") : root.QuestContent;
  const course = typeof module !== "undefined" ? require("./course.js") : root.QuestCourse;
  const chapterIds = ["foundation", "context", ...course.chapters.map(ch => ch.id)];
  function normalizeResume(raw = {}) {
    const view = ["lesson", "context", "chapter", "journal"].includes(raw?.view) ? raw.view : "lesson";
    const chapter = course.chapters.some(ch => ch.id === raw?.chapter) ? raw.chapter : course.chapters[0].id;
    const tab = ["learn", "practice", "quiz", "notes", "reference"].includes(raw?.tab) ? raw.tab : "learn";
    return { view, chapter, tab };
  }
  function normalizeRecords(raw = {}, ids = chapterIds) {
    return Object.fromEntries(ids.map(id => {
      const value = raw?.[id];
      return [id, { status: ["not-recorded", "practiced", "explained", "skipped", "deferred"].includes(value?.status) ? value.status : "not-recorded", note: typeof value?.note === "string" ? value.note.slice(0, 5000) : "" }];
    }));
  }
  function normalizeChapter(raw, chapter) {
    const source = raw && typeof raw === "object" ? raw : {};
    const validChecks = chapter.steps.map((_, i) => i + 1);
    const checks = [...new Set((Array.isArray(source.checks) ? source.checks : []).filter(n => validChecks.includes(n)))];
    const stepStatus = Object.fromEntries(validChecks.filter(n => !checks.includes(n) && ["deferred", "skipped"].includes(source.stepStatus?.[n])).map(n => [n, source.stepStatus[n]]));
    const quiz = {};
    for (const q of chapter.questions) quiz[q.id] = Array.isArray(source.quiz?.[q.id]) ? source.quiz[q.id].filter(a => Number.isInteger(a) && a >= 0 && a < q.choices.length).slice(-100) : [];
    let exercise = ["not-started", "practiced", "skipped", "deferred"].includes(source.exercise) ? source.exercise : "not-started";
    if (exercise === "practiced" && checks.length !== chapter.steps.length) exercise = "not-started";
    return { notes: typeof source.notes === "string" ? source.notes.slice(0, 20000) : "", checks, stepStatus, quiz, exercise,
      step: Number.isInteger(source.step) ? Math.max(0, Math.min(source.step, chapter.steps.length - 1)) : 0,
      bookmarked: source.bookmarked === true, seen: source.seen === true };
  }
  function normalizeContext(raw = {}) {
    const source = raw && typeof raw === "object" ? raw : {};
    const checks = [...new Set((Array.isArray(source.checks) ? source.checks : []).filter(n => content.context.steps.some((_, i) => i + 1 === n)))];
    const stepStatus = Object.fromEntries(content.context.steps.map((_,i)=>i+1).filter(n=>!checks.includes(n) && ["skipped","deferred"].includes(source.stepStatus?.[n])).map(n=>[n,source.stepStatus[n]]));
    const quiz = {};
    for (const q of content.context.questions) quiz[q.id] = Array.isArray(source.quiz?.[q.id]) ? source.quiz[q.id].filter(a => Number.isInteger(a) && a >= 0 && a < 3).slice(-100) : [];
    let exercise = ["not-started", "practiced", "skipped", "deferred"].includes(source.exercise) ? source.exercise : "not-started";
    if (exercise === "practiced" && checks.length !== content.context.steps.length) exercise = "not-started";
    return { notes: typeof source.notes === "string" ? source.notes.slice(0, 20000) : "", checks, stepStatus, quiz, exercise, step: Number.isInteger(source.step) ? Math.max(0, Math.min(source.step, content.context.steps.length - 1)) : 0 };
  }
  function normalize(raw = {}) {
    const source = raw && typeof raw === "object" ? raw : {};
    const quiz = {};
    for (const question of content.questions) {
      quiz[question.id] = Array.isArray(source.quiz?.[question.id])
        ? source.quiz[question.id].filter(a => Number.isInteger(a) && a >= 0 && a < 3).slice(-100)
        : [];
    }
    const checks = [...new Set((Array.isArray(source.checks) ? source.checks : []).filter(n => [1, 2, 3].includes(n)))];
    let exercise = ["not-started", "practiced", "skipped", "deferred"].includes(source.exercise) ? source.exercise : "not-started";
    if (exercise === "practiced" && checks.length !== 3) exercise = "not-started";
    const chapters = {};
    for (const chapter of course.chapters) chapters[chapter.id] = normalizeChapter(source.chapters?.[chapter.id], chapter);
    return { version: 1, notes: typeof source.notes === "string" ? source.notes.slice(0, 20000) : "", exercise, checks, quiz, bookmarked: source.bookmarked === true, lessonSeen: source.lessonSeen === true, context: normalizeContext(source.context), chapters,
      resume: normalizeResume(source.resume || {view:"chapter",chapter:"orientation",tab:"learn"}), records: normalizeRecords(source.records), followUps: normalizeRecords(source.followUps, course.followUps.map(item => item.id)) };
  }
  function solved(state, question) { return state.quiz[question.id].includes(question.correct); }
  function summary(state) {
    const correct = content.questions.filter(q => solved(state, q)).length;
    const complete = correct === content.questions.length && state.exercise === "practiced";
    const started = state.lessonSeen || state.checks.length > 0 || correct > 0 || state.exercise !== "not-started";
    return { correct, complete, started, percent: Math.round(((state.exercise === "practiced" ? 1 : 0) + correct) / (content.questions.length + 1) * 100) };
  }
  function nextAction(state) {
    const ids=course.order || ["foundation","context",...course.chapters.map(ch=>ch.id)];
    for(const id of ids){
      const ch=course.chapters.find(ch=>ch.id===id);
      const info=id==="foundation"?summary(state):id==="context"?contextSummary(state):chapterSummary(state,ch);
      if(!info.complete)return `Next unfinished topic: ${id==="foundation"?"Models, tools & skills":id==="context"?"Files, context & continuity":ch.title}. Try its practice, inspect the result, then check your understanding.`;
    }
    return "Revisit your field guide or choose an optional exploration.";
  }
  function contextSummary(state) {
    const value = normalizeContext(state.context);
    const correct = content.context.questions.filter(q => value.quiz[q.id].includes(q.correct)).length;
    return { correct, complete: correct === content.context.questions.length && value.exercise === "practiced", percent: Math.round(((value.exercise === "practiced" ? 1 : 0) + correct) / (content.context.questions.length + 1) * 100) };
  }
  function chapterSummary(state, chapter) {
    const value = normalizeChapter(state.chapters?.[chapter.id], chapter);
    const correct = chapter.questions.filter(q => value.quiz[q.id].includes(q.correct)).length;
    return { correct, complete: correct === chapter.questions.length && value.exercise === "practiced",
      started: value.seen || value.checks.length > 0 || correct > 0 || value.exercise !== "not-started",
      percent: Math.round(((value.exercise === "practiced" ? 1 : 0) + correct) / (chapter.questions.length + 1) * 100) };
  }
  function courseSummary(state) {
    const items = [summary(state), contextSummary(state), ...course.chapters.map(ch => chapterSummary(state, ch))];
    return { total: items.length, complete: items.filter(i => i.complete).length, percent: Math.round(items.reduce((sum, item) => sum + item.percent, 0) / items.length) };
  }
  const api = { normalize, solved, summary, nextAction, contextSummary, chapterSummary, courseSummary };
  if (typeof module !== "undefined") module.exports = api;
  else root.QuestState = api;
})(typeof window !== "undefined" ? window : globalThis);
