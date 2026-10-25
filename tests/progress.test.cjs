const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { normalize, summary } = require("../src/state.js");
const { createStore } = require("../src/store.cjs");

test("viewing and quiz answers alone never award a practice milestone", () => {
  assert.equal(summary(normalize()).complete, false);
  assert.equal(summary(normalize({ lessonSeen: true })).percent, 0);
  assert.equal(summary(normalize({ quiz: { q1: [0], q2: [1], q3: [2] } })).complete, false);
  assert.equal(summary(normalize({ exercise: "practiced", checks: [1, 2, 3] })).complete, false);
  for (const exercise of ["skipped", "deferred"]) {
    assert.equal(summary(normalize({ exercise, quiz: { q1: [0], q2: [1], q3: [2] } })).complete, false);
  }
});
test("wrong attempts allow correction and a complete exercise earns the title", () => {
  const state = normalize({ checks: [1, 2, 3], exercise: "practiced", quiz: { q1: [2, 0], q2: [0, 1], q3: [2] } });
  assert.equal(summary(state).correct, 3);
  assert.equal(summary(state).complete, true);
  assert.equal(summary(state).percent, 100);
  state.checks.pop();
  assert.equal(summary(normalize(state)).complete, false);
});
test("invalid saved choices and incomplete checklists do not grant completion", () => {
  const state = normalize({ exercise: "practiced", checks: [1, 1, "3", 88], quiz: { q1: [9, "0"], q2: null } });
  assert.deepEqual(state.checks, [1]);
  assert.equal(state.exercise, "not-started");
  assert.equal(summary(state).correct, 0);
});
test("saved notes, quiz attempts and progress survive a new store instance", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "quest-store-"));
  try {
    const first = createStore(directory);
    assert.equal(summary(await first.load()).percent, 0);
    const value = normalize({ notes: "My own example: a recipe is like a skill.\nSecond line.", checks: [1, 2, 3], exercise: "practiced", quiz: { q1: [1, 0], q2: [1], q3: [2] } });
    await Promise.all([first.save({ ...value, notes: "earlier" }), first.save(value)]);
    assert.deepEqual(await createStore(directory).load(), value);
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
});
test("damaged progress is reported without destroying the original file", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "quest-corrupt-"));
  try {
    const store = createStore(directory);
    await fs.writeFile(store.file, "broken-json");
    await assert.rejects(store.load(), /kept intact/);
    assert.equal(await fs.readFile(store.file, "utf8"), "broken-json");
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
});
