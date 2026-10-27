# Lesson-side support

Implemented locally, 26 October 2026. This is not a published package update.

## Definitions beside the task

`lesson-support.js` contains twenty short definitions and examples. Lessons, mini-lessons and the reference library expose Terms & definitions. The first occurrences of up to eight terms per screen become dotted definition buttons; code samples, editable notes and interactive controls are excluded.

The native dialog traps keyboard focus, supports Escape and Close, and returns focus without scrolling the lesson away from its saved reading position. Opening/searching definitions does not rerender the lesson, submit notes or change progress. Definitions can also be opened from Course guide.

## One tracker across Git stages

Coding, GitHub and environment lessons expose a collapsed worked example with seven stages. The learner compares the working file, staged selection, local snapshot and online branch. A small title diff and the Remaining change show what moved, where it is saved and what still needs checking.

The supplied three-lesson tracker is a standalone `.cjs` sample. Its initial output is 2 of 3 completed; the Remaining addition prints 1. A disposable local Git test verifies that staging snapshots the selected content, a later working edit is separate, committing uses the staged content, and the exercise branch's uncommitted change does not alter the base snapshot. This test does not contact GitHub, push, open a PR or merge an external repository. Online steps are explicitly worked examples.

Seven expandable recovery routes supply concrete requests for the learner's assistant: source ZIP without history, missing Node/Git, author identity, wrong folder, push failure, conflict and resuming from a handoff. Routine commands remain AI-led; manual typing is optional. The interface does not execute these requests.

## Context-source comparisons

The memory lesson compares a current instruction, supported project guidance, an attached record, explicitly supplied fresh-chat context and observed account/project/host labels. Each case gives an input, expected evidence and an inference it cannot establish. No account switching, credential collection, deletion or memory-setting changes are required. Existing chapter exercises, counts and completion gates remain unchanged.

## Source checks

- [Git: Recording changes](https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository): working files, staging and commits.
- [Git: Worktrees](https://git-scm.com/docs/git-worktree): separate checkout folders sharing repository history.
- [GitHub: Pull requests](https://docs.github.com/en/pull-requests/reference/pull-requests): source/base changes and the review context.
- [OpenAI: Projects and chats](https://learn.chatgpt.com/docs/projects): project guidance/sources, local folders and explicit durable context.

These sources support the explanations. They do not prove that a particular account has a feature or that a learner completed an external activity.

## Verification

`tests/lesson-support.test.cjs` checks required vocabulary, example boundaries, recovery cases and actual local Git behavior. `scripts/verify-lesson-support.cjs` checks definition search and keyboard return, unchanged progress, Git stage selection, memory comparisons, note preservation and narrow layout. Existing desktop and course suites cover the surrounding flows.
