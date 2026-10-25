(function (root) {
  const content = typeof module !== "undefined" ? require("./content.js") : root.QuestContent;
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
    return { version: 1, notes: typeof source.notes === "string" ? source.notes.slice(0, 20000) : "", exercise, checks, quiz, bookmarked: source.bookmarked === true, lessonSeen: source.lessonSeen === true };
  }
  function solved(state, question) { return state.quiz[question.id].includes(question.correct); }
  function summary(state) {
    const correct = content.questions.filter(q => solved(state, q)).length;
    const complete = correct === 3 && state.exercise === "practiced";
    const started = state.lessonSeen || state.checks.length > 0 || correct > 0 || state.exercise !== "not-started";
    return { correct, complete, started, percent: Math.round(((state.exercise === "practiced" ? 1 : 0) + correct) / 4 * 100) };
  }
  function nextAction(state) {
    if (summary(state).complete) return "Revisit your notes or explore the reference library.";
    if (state.exercise !== "practiced") return "Try the note exercise and inspect the actual result.";
    return "Finish your three-question knowledge check.";
  }
  const api = { normalize, solved, summary, nextAction };
  if (typeof module !== "undefined") module.exports = api;
  else root.QuestState = api;
})(typeof window !== "undefined" ? window : globalThis);
