(function (root) {
  const content = typeof module !== "undefined" ? require("./content.js") : root.QuestContent;
  const course = typeof module !== "undefined" ? require("./course.js") : root.QuestCourse;
  const learningMap = typeof module !== "undefined" ? require("./learning-map.js") : root.QuestLearningMap;
  const minis = typeof module !== "undefined" ? require("./mini-lessons.js") : root.QuestMiniLessons;
  const workflows = typeof module !== "undefined" ? require("./workflow-labs.js") : root.QuestWorkflows;
  const tutorials = typeof module !== "undefined" ? require("./feature-tutorials.js") : root.QuestFeatureTutorials;
  const chapterIds = ["foundation", "context", ...course.chapters.map(ch => ch.id)];
  function normalizeResume(raw = {}) {
    const view = ["lesson", "context", "chapter", "journal", "mini", "feature"].includes(raw?.view) ? raw.view : "lesson";
    const chapter = view==="mini"&&minis.get(raw?.mini)?minis.get(raw.mini).chapter:course.chapters.some(ch => ch.id === raw?.chapter) ? raw.chapter : course.chapters[0].id;
    const tab = ["learn", "practice", "quiz", "notes", "reference"].includes(raw?.tab) ? raw.tab : "learn";
    return { view:view==="mini"&&!minis.get(raw?.mini)?"lesson":view, chapter, tab, mini:minis.get(raw?.mini)?.id||"", feature:view==="feature"?(tutorials.get(raw?.feature)?.id||"scheduled"):"" };
  }
  function normalizeRecords(raw = {}, ids = chapterIds) {
    return Object.fromEntries(ids.map(id => {
      const value = raw?.[id];
      return [id, { status: ["not-recorded", "practiced", "explained", "skipped", "deferred"].includes(value?.status) ? value.status : "not-recorded", note: typeof value?.note === "string" ? value.note.slice(0, 5000) : "" }];
    }));
  }
  function normalizeStepNotes(source,valid,checks,status) {
    const availability=source.stepAvailability && typeof source.stepAvailability==='object' && !Array.isArray(source.stepAvailability)?source.stepAvailability:{};
    const evidence=source.stepEvidence && typeof source.stepEvidence==='object' && !Array.isArray(source.stepEvidence)?source.stepEvidence:{};
    const reasons=source.stepReasons && typeof source.stepReasons==='object' && !Array.isArray(source.stepReasons)?source.stepReasons:{};
    return {
      stepAvailability:Object.fromEntries(valid.filter(n=>['available','needs-setup','unavailable'].includes(availability[n])||(!checks.includes(n)&&reasons[n]==='unavailable'&&source.stepAvailability===undefined)).map(n=>[n,availability[n]||'unavailable'])),
      stepReasons:Object.fromEntries(valid.filter(n=>!checks.includes(n)&&['deferred','skipped'].includes(status[n])&&['unavailable','preparation','help','later'].includes(reasons[n])).map(n=>[n,reasons[n]])),
      stepEvidence:Object.fromEntries(valid.filter(n=>typeof evidence[n]==='string').map(n=>[n,evidence[n].slice(0,1000)]))
    };
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
    return { ...normalizeStepNotes(source,validChecks,checks,stepStatus), notes: typeof source.notes === "string" ? source.notes.slice(0, 20000) : "", checks, stepStatus, quiz, exercise,
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
    return { ...normalizeStepNotes(source,content.context.steps.map((_,i)=>i+1),checks,stepStatus), bookmarked:source.bookmarked === true, notes: typeof source.notes === "string" ? source.notes.slice(0, 20000) : "", checks, stepStatus, quiz, exercise, step: Number.isInteger(source.step) ? Math.max(0, Math.min(source.step, content.context.steps.length - 1)) : 0 };
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
    const name=typeof source.profile?.name==="string"?source.profile.name.replace(/[\u0000-\u001f\u007f]/g,"").trim().slice(0,60):"";
    const result = { ...normalizeStepNotes(source,[1,2,3],checks,Object.fromEntries([1,2,3].map(n=>[n,source.stepStatus?.[n]]))), version: 1, setup:learningMap.normalizeSetup(source.setup), step:Number.isInteger(source.step)?Math.max(0,Math.min(2,source.step)):0,
      stepStatus:Object.fromEntries([1,2,3].filter(n=>!checks.includes(n)&&['skipped','deferred'].includes(source.stepStatus?.[n])).map(n=>[n,source.stepStatus[n]])), profile:{name,setupComplete:source.profile?.setupComplete===true || !!name}, ui:{sidebarCollapsed:source.ui?.sidebarCollapsed===true}, notes: typeof source.notes === "string" ? source.notes.slice(0, 20000) : "", exercise, checks, quiz, bookmarked: source.bookmarked === true, lessonSeen: source.lessonSeen === true, context: normalizeContext(source.context), chapters,
      resume: normalizeResume(source.resume || {view:"chapter",chapter:"orientation",tab:"learn"}), records: normalizeRecords(source.records), followUps: normalizeRecords(source.followUps, course.followUps.map(item => item.id)) };
    result.preparation=Object.fromEntries(chapterIds.filter(id=>source.preparation?.[id]===true).map(id=>[id,true]));
    result.questionPanels=Object.fromEntries(chapterIds.map(id=>{
      const entries=id==='foundation'?content.library:id==='context'?content.context.library:course.chapters.find(ch=>ch.id===id).library;
      const valid=new Set(entries.map(item=>item.title));
      return [id,[...new Set((Array.isArray(source.questionPanels?.[id])?source.questionPanels[id]:[]).filter(title=>valid.has(title)))]];
    }));
    result.miniLessons=minis.normalizeRecords(source.miniLessons);
    result.miniFallbacks=[...new Set((Array.isArray(source.miniFallbacks)?source.miniFallbacks:[]).filter(id=>minis.get(id)&&!minis.get(id).optional))];
    result.featureTutorials=tutorials.normalize(source.featureTutorials);
    result.workflowSteps=workflows.normalizeSteps(source.workflowSteps);
    result.workflowChoices=workflows.normalizeChoices(source.workflowChoices,[...minis.mapped.map(item=>`${item.chapter}:${item.index}`),...minis.items.map(item=>`mini:${item.id}`)]);
    result.curriculum='chapters-v1+mini-v1';
    result.completionFlow = 1;
    result.completions = Object.fromEntries(["foundation", "context", ...course.chapters.map(ch => ch.id)].map(id => {
      const old = source.completions?.[id];
      const info = getSummary(result, id);
      const legacy = source.completionFlow !== 1 && info.ready;
      return [id, { referencesReviewed: legacy || old?.referencesReviewed === true,
        notesVisited: legacy || old?.notesVisited === true, completed: legacy || old?.completed === true }];
    }));
    return result;
  }
  function solved(state, question) { return state.quiz[question.id].includes(question.correct); }
  function summary(state) {
    const correct = content.questions.filter(q => solved(state, q)).length;
    const started = state.lessonSeen || state.checks.length > 0 || correct > 0 || state.exercise !== "not-started";
    return resultSummary(state, "foundation", correct, content.questions.length, state.exercise, started);
  }
  function nextAction(state) {
    const ids=course.order || ["foundation","context",...course.chapters.map(ch=>ch.id)];
    for(const id of ids){
      const ch=course.chapters.find(ch=>ch.id===id);
      const info=id==="foundation"?summary(state):id==="context"?contextSummary(state):chapterSummary(state,ch);
      if(!info.complete) {
        const title=id==="foundation"?"Models, tools & skills":id==="context"?"Files, context & continuity":ch.title;
        return info.ready ? `Ready to finish: ${title}. Review Questions & sources, then mark the chapter completed from My note.` : `Next unfinished topic: ${title}. Try its practice, inspect the result, then check your understanding.`;
      }
    }
    return "All chapters completed. Revisit a chapter or put your skills to work.";
  }
  function contextSummary(state) {
    const value = normalizeContext(state.context);
    const correct = content.context.questions.filter(q => value.quiz[q.id].includes(q.correct)).length;
    return resultSummary(state, "context", correct, content.context.questions.length, value.exercise, value.checks.length > 0 || correct > 0 || value.exercise !== "not-started");
  }
  function chapterSummary(state, chapter) {
    const value = normalizeChapter(state.chapters?.[chapter.id], chapter);
    const correct = chapter.questions.filter(q => value.quiz[q.id].includes(q.correct)).length;
    return resultSummary(state, chapter.id, correct, chapter.questions.length, value.exercise, value.seen || value.checks.length > 0 || correct > 0 || value.exercise !== "not-started");
  }
  function resultSummary(state, id, correct, total, exercise, started) {
    const flow = state.completions?.[id];
    const ready = correct === total && exercise === "practiced";
    const complete = ready && flow?.completed === true && flow.referencesReviewed && flow.notesVisited;
    const units = (exercise === "practiced" ? 1 : 0) + correct;
    return { correct, ready, complete, started, percent: complete ? 100 : Math.round((units + (flow?.referencesReviewed ? 1 : 0)) / (total + 3) * 100) };
  }
  function getSummary(state, id) {
    return id === "foundation" ? summary(state) : id === "context" ? contextSummary(state) : chapterSummary(state, course.chapters.find(ch => ch.id === id));
  }
  function finish(state, id) {
    const flow = state.completions?.[id];
    if (!flow || !getSummary(state, id).ready || !flow.referencesReviewed || !flow.notesVisited) return false;
    flow.completed = true;
    return true;
  }
  function courseSummary(state) {
    const items = [summary(state), contextSummary(state), ...course.chapters.map(ch => chapterSummary(state, ch))];
    return { total: items.length, complete: items.filter(i => i.complete).length, percent: Math.round(items.reduce((sum, item) => sum + item.percent, 0) / items.length) };
  }
  const api = { normalize, solved, summary, nextAction, contextSummary, chapterSummary, courseSummary, getSummary, finish };
  if (typeof module !== "undefined") module.exports = api;
  else root.QuestState = api;
})(typeof window !== "undefined" ? window : globalThis);
