const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const course = require("../src/course.js");
const { normalize, chapterSummary, courseSummary } = require("../src/state.js");
const { createStore } = require("../src/store.cjs");

function completed(chapter) {
  return { notes: `My ${chapter.id} observation`, seen: true, bookmarked: true,
    exercise: "practiced", checks: chapter.steps.map((_, i) => i + 1), step: chapter.steps.length - 1,
    quiz: Object.fromEntries(chapter.questions.map(q => [q.id, [q.correct]])) };
}

test("all 13 chapters have usable content, preparation, exercises and answer feedback", () => {
  assert.deepEqual(course.chapters.map(ch => ch.number), Array.from({length: 11}, (_, i) => i + 3));
  assert.equal(new Set(course.chapters.map(ch => ch.id)).size, 11);
  const ids = new Set();
  for (const ch of course.chapters) {
    assert.ok(ch.title && ch.preparation && ch.award);
    assert.ok(ch.sections.length >= 3 && ch.library.length >= 4 && ch.steps.length >= 3);
    for (const step of ch.steps) assert.ok(step.title && step.text && step.prompt && step.check);
    assert.equal(ch.questions.length, 3);
    for (const q of ch.questions) {
      assert.ok(!ids.has(q.id)); ids.add(q.id);
      assert.equal(q.choices.length, 3);
      assert.ok(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.choices.length);
      assert.ok(q.prompt && q.explanation);
    }
    assert.ok(ch.sourceIds.length);
    for (const id of ch.sourceIds) {
      assert.ok(course.sources[id], `Missing source ${id}`);
      assert.equal(new URL(course.sources[id][1]).protocol, "https:");
    }
  }
  assert.equal(courseSummary(normalize()).total, 13);
  assert.equal(courseSummary(normalize()).complete, 0);
});

test("learner-facing content does not require knowledge of the course authors' history", () => {
  const content = require("../src/content.js");
  const forbidden = /\bour\b|\bwe\b|original learner|original journey|historical checkpoint|originally (skipped|deferred)/i;
  const visible = { chapters: course.chapters, followUps: course.followUps, context: content.context };
  assert.doesNotMatch(JSON.stringify(visible), forbidden);
  for (const ch of course.chapters) assert.equal(ch.evidence, undefined);
  const renderer = require("node:fs").readFileSync(path.join(__dirname, "../src/renderer.js"), "utf8");
  const screens = require("node:fs").readFileSync(path.join(__dirname, "../src/course-ui.js"), "utf8");
  assert.doesNotMatch(renderer + screens, /ORIGINAL JOURNEY|OUR REAL AI JOURNEY|THE JOURNEY WE ACTUALLY TOOK|Questions we asked|What we actually did|ch\.evidence/);
});

test("every chapter requires its own complete practice and quiz; skip/defer do not earn titles", () => {
  for (const ch of course.chapters) {
    const value = completed(ch);
    assert.equal(chapterSummary(normalize({chapters:{[ch.id]:value}}), ch).complete, true);
    for (const exercise of ["not-started", "skipped", "deferred"]) {
      assert.equal(chapterSummary(normalize({chapters:{[ch.id]:{...value, exercise}}}), ch).complete, false);
    }
    const missing = normalize({chapters:{[ch.id]:{...value, checks:value.checks.slice(1)}}});
    assert.equal(chapterSummary(missing, ch).complete, false);
    assert.equal(missing.chapters[ch.id].exercise, "not-started");
    const withoutQuiz = normalize({chapters:{[ch.id]:{...value, quiz:{}}}});
    assert.equal(chapterSummary(withoutQuiz, ch).complete, false);
  }
});

test("invalid saved answers and steps cannot grant course completion or escape chapter bounds", () => {
  const ch = course.chapters[0];
  const raw = {...completed(ch), step:999, checks:[1,1,"2",99], quiz:{[ch.questions[0].id]:["1",-1,8]}, notes:42};
  const state = normalize({chapters:{[ch.id]:raw, unknown:{exercise:"practiced"}}});
  assert.equal(state.chapters[ch.id].step, ch.steps.length - 1);
  assert.deepEqual(state.chapters[ch.id].checks,[1]);
  assert.deepEqual(state.chapters[ch.id].quiz[ch.questions[0].id],[]);
  assert.equal(state.chapters[ch.id].notes, "");
  assert.equal(state.chapters.unknown, undefined);
  assert.equal(courseSummary(state).complete, 0);
});

test("aggregate course progress includes old chapters without marking new ones learned", () => {
  const state = normalize({notes:"Keep original", exercise:"practiced", checks:[1,2,3], quiz:{q1:[0],q2:[1],q3:[2]},
    context:{exercise:"practiced",checks:[1,2,3,4],quiz:{context1:[1],context2:[0],context3:[2]}}});
  assert.equal(courseSummary(state).complete,2);
  for (const ch of course.chapters) assert.equal(chapterSummary(state,ch).percent,0);
  for (const ch of course.chapters) state.chapters[ch.id] = completed(ch);
  assert.deepEqual(courseSummary(state), {total:13,complete:13,percent:100});
  assert.deepEqual(normalize(state), state);
});

test("all chapter notes, bookmarks, attempts, steps and legacy progress survive a new store", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(),"quest-full-course-"));
  try {
    const value = normalize({notes:"Original chapter",context:{notes:"Context chapter"},chapters:Object.fromEntries(course.chapters.map(ch=>[ch.id,completed(ch)]))});
    await createStore(directory).save(value);
    const restored = await createStore(directory).load();
    assert.deepEqual(restored,value);
    assert.equal(courseSummary(restored).complete,11);
    assert.equal(restored.notes,"Original chapter");
    assert.equal(restored.context.notes,"Context chapter");
  } finally {await fs.rm(directory,{recursive:true,force:true});}
});

test("local prior-practice records never fabricate quiz passes or earned milestones", () => {
  const ids = ["foundation", "context", ...course.chapters.map(ch => ch.id)];
  const records = Object.fromEntries(ids.map(id => [id, {status:"practiced",note:"Previously practiced; keep evidence separate"}]));
  const state = normalize({records,resume:{view:"chapter",chapter:"delegation",tab:"practice"},followUps:{"scheduled-run":{status:"deferred",note:"No real run yet"}}});
  assert.equal(courseSummary(state).complete,0);
  assert.equal(state.resume.chapter,"delegation");
  assert.equal(state.records.github.status,"practiced");
  assert.equal(state.followUps["scheduled-run"].status,"deferred");
  assert.equal(state.followUps["image-edit"].status,"not-recorded");
  assert.deepEqual(normalize(state),state);
  const invalid = normalize({resume:{view:"unknown",chapter:"capstone",tab:"execute"},records:{foundation:{status:"mastered"}}});
  assert.equal(invalid.resume.view,"lesson");
  assert.equal(invalid.records.foundation.status,"not-recorded");
});

test("course and earlier quiz totals follow content changes without separate count edits", () => {
  const content = require("../src/content.js");
  const stateApi = require("../src/state.js");
  const originalTotal = stateApi.courseSummary(normalize()).total;
  const firstLength = content.questions.length;
  const contextLength = content.context.questions.length;
  const chapterLength = course.chapters.length;
  try {
    content.questions.push({...content.questions[0], id:"extra-foundation"});
    content.context.questions.push({...content.context.questions[0], id:"extra-context"}, {...content.context.questions[1], id:"extra-context-two"});
    course.chapters.push({...course.chapters[0], id:"extra-chapter", number:course.chapters.at(-1).number + 1});
    const value = normalize({exercise:"practiced",checks:[1,2,3],quiz:{q1:[0],q2:[1],q3:[2]}});
    assert.equal(stateApi.summary(value).complete,false);
    value.quiz["extra-foundation"]=[content.questions[0].correct];
    assert.equal(stateApi.summary(value).complete,true);
    value.context.exercise="practiced";value.context.checks=content.context.steps.map((_, i)=>i+1);
    value.context.quiz=Object.fromEntries(content.context.questions.map(q=>[q.id,[q.correct]]));
    assert.equal(stateApi.contextSummary(value).correct,content.context.questions.length);
    assert.equal(stateApi.contextSummary(value).complete,true);
    assert.equal(stateApi.courseSummary(value).total,originalTotal+1);
  } finally {
    content.questions.length=firstLength;content.context.questions.length=contextLength;course.chapters.length=chapterLength;
  }
});
