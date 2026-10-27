# Fresh learner review and improvement plan

> Superseded as the curriculum direction on 27 October 2026. The learner rejected the prompt-led material. Completed phases below describe technical implementation, not acceptance of the course. Follow `FEATURE-FIRST-COURSE-RESET.md` for the replacement material. Release preparation is on hold while the course is rebuilt.

Reviewed: 26 October 2026. Status: review completed; implementation status is recorded per phase below. Local verification does not mean a published release.

## Scope and evidence

Persona: a software engineer with a new ChatGPT Plus subscription on Windows, familiar with ordinary chat and file uploads, but new to agents, advanced tools, Git and GitHub. Goal: learn the requested capabilities through guided practical work, with a useful project connecting the lessons.

I launched the current local app with a fresh, isolated learner profile, explored all 17 chapter screens and their practice/reference sections, tested deferring and moving to another exercise, searched the reference library, and typed/reopened a note. I inspected lesson source content and current official documentation. I did not execute every external AI exercise, verify access on a real new Plus account, or treat the review as completed learning. The review profile finished with zero XP. Your personal learner profile was untouched.

Local evidence: `test-results/learner-review-1793012204785/observations.json`, with screenshots in that folder. These files are ignored and should not enter a public source package.

The published baseline is v0.3.0. The local app additionally removes “In other tools.” That removal has not been published. No app implementation was changed during this review.

## Overall finding

The app is now substantially easier to navigate and record progress in. It still relies too often on the learner asking another AI to explain how to perform the exercise. It needs to become a guided practical course, with concrete inputs and visible outcomes, rather than primarily a collection of prompts.

The existing field-guide-to-learning-tracker project is a good backbone. Keep it and make the handoffs between chapters explicit.

## A first-time learner's experience

| Moment | What works | Where I get stuck | Proposed improvement |
| --- | --- | --- | --- |
| First launch | Name entry is optional; the first action is clear. | The introduction and XP header occupy a lot of space before the actual task. I cannot choose a route for the app/account I have. | A short setup asks what I use and offers a first 10-minute task. Use a compact learner header inside lessons. |
| Opening the app tour | The explanations distinguish modes, location and permissions. | The full map introduces 16 controls before I have used one. | Teach Chat/Work/Codex and the model label first; keep the complete map in optional reference. |
| First exercise | There is an example inventory and a copyable prompt. | “Find its mode selector and model label, usually near the chat controls” still leaves the navigation problem to me. | Annotated Windows walkthrough, separate actions, filled-in sample, and an “I don't see this” route. |
| Moving between apps | The compact companion exists. | The course does not introduce it when I first need it; switching between lesson and AI app can lose my place. | Offer the companion at the first external action and include the current instruction and success example. |
| Missing a feature | Skip and Revisit later preserve independent step outcomes; Next remains available. | Deferring the first exercise still leaves the overview recommending the app tour. There is no availability profile or deferred-work list. | Separate Resume from Recommended next, retain deferred work in a revisit list, and suggest an available activity. |
| Doing an exercise | One Done action, Undo and a counter are clear. | The app cannot tell me whether an unfamiliar output is correct. Most tasks lack an expected example and recovery instructions. | Show supplied inputs, expected result, a common failure and recovery beside every exercise. Keep completion explicitly learner-reported. |
| Finishing a chapter | The final completion action, celebrations and green review cards make the outcome visible. | Expanding every question simultaneously is a mechanical gate; revisiting a tab resets the expansions. Reading is not verified by expansion. | Preserve the current policy initially; propose remembering question review across visits. Agree on any change from “all open now” to “opened once” before implementing it. |
| Finding a term | Reference search works. | Searching token/runtime/branch returns discussions using the terms, not a short definition beside my task. | A small contextual glossary; keep the current task visible. |
| Notes | One picker includes all chapters; blue Added note updates while typing; notes persist on reopen. | A note is not linked to a specific exercise or result. | Offer an optional prefilled reflection and an artifact/path field; retain free-form chapter notes and autosave. |
| Feature lab | Several real activities and some fallback prompts exist. | Maps, images, credentials, hosted browsers and interface shortcuts share one chapter. Similar assistant/shortcut work appears twice. | Independent mini-lessons with individual availability and outcomes. Remove duplicated exercises. |
| Git and GitHub | The same tracker is reused; there are real diffs, branches, PRs and targeted undo. | The conceptual relationship between working files, staging, commits, local branches and remote branches is still compressed into prose. | A visual sequence following one file through the actual tracker change. Include a setup route for missing Node/Git and a downloaded ZIP without Git history. |
| Advanced workflows | Subagent, worktree, handoff and hook prompts have meaningful boundaries. | Setup, expected intermediate artifacts and failure recovery remain too dependent on the other AI. | Supplied starter project, worked examples, role-specific prompts, expected handoff and independent checks. |
| Finding all requested topics | Most requested features are mentioned somewhere. | Ten optional follow-up records remain in data without a rendered app route. A mention is easy to mistake for a tutorial. | A visible feature coverage index linking to accessible lessons. Retire or restore hidden follow-ups deliberately. |

Measured content gap: there are 53 practice steps in the newer chapter data, four context steps and three foundation checks: 60 exercise units total. Only the three memory steps and four context steps have dedicated expected-result/recovery fields. Other exercises sometimes include useful checks or expected numbers in prose; they are not all empty or unusable. The missing piece is consistent, beginner-ready guidance.

## Comparison with the two previous tables

These tables record the original review baseline, before Phases 0–6. For current local results and remaining work, see [27 October learner review](LOCAL-LEARNER-REVIEW-2026-10-27.md).

First table:

| ID | Earlier issue | Fresh verdict |
| --- | --- | --- |
| A1 | Advertised source and download differ | v0.3.0 resolved the old v0.2.2 mismatch. Release synchronization still needs a repeatable gate. Local removal of comparisons is not shipped; README still abbreviates the flow to Understand → Try it → Check. |
| A2 | First lesson is another discovery task | Still a high-priority problem. The filled-in inventory helps, but does not replace click-by-click guidance. |
| A3 | Too many opening controls | Still present: 16 control-map entries appear upfront. |
| A4 | Unrelated capabilities grouped together | Still partial: some exercises were separated, but completion and availability remain bundled in one chapter. |
| A5 | Missing features obstruct progress | The navigation obstacle is fixed. Finding the next usable activity and handling partial course completion remain unresolved. |
| A6 | Correct results are hard to judge | Still present across most exercises; files and memory are the stronger examples to extend. |

Second table:

| ID | Earlier improvement | Fresh verdict |
| --- | --- | --- |
| B1 | Next-action dashboard | Presentation improved; recommendation logic and deferred-work handling are still partial. |
| B2 | Consistent lesson format | Still the main content investment needed. |
| B3 | Contextual glossary | Still missing. Search is not a replacement. |
| B4 | Stronger Git teaching | Existing tracker tasks are useful; visual explanations and setup/recovery are still needed. |
| B5 | Advanced labs | Useful prompts already exist. Expand them with setup, starter inputs and demonstrable handoffs rather than rewrite everything. |
| B6 | Better product comparisons | Superseded by your decision to remove the entire generic section. Keep it removed. No new competitor-comparison project is planned. |
| B7 | Coverage checklist | Still missing, made more important by hidden optional follow-ups. |
| B8 | Updated Windows release | Done for v0.3.0; run the same package verification for subsequent releases. |

New priorities revealed by this pass: make external-app handoffs explicit; expose true tutorial coverage; introduce the companion at the right moment; preserve learner achievements when restructuring lessons; keep account availability separate from course understanding; and maintain one accurate release/source story.

## Product rules to preserve

- Keep the simple Done/Undo control and counter, optional autosaved notes, green completed cards and progress, chapter time estimates, celebrations, current identity/theme, and the sidebar rail with the logo visible.
- Keep Questions & sources before optional notes and explicit chapter completion. Do not silently remove your question-review requirement.
- Keep the removed In other tools section out. Relevant product names may still appear where needed to explain the feature itself.
- Keep AI-led development: the learner directs, checks and understands; manual terminal typing is optional.
- Do not require an API key, another subscription, or unavailable account features to follow the core learning route.
- The course must never claim it observed an external task, tested account access or measured token savings when it did not.
- Keep personal data local; do not upload screenshots, tokens, account details or learner notes as course content.

## Implementation sequence

Each phase ends with a local demo and learner review. Mark a phase complete only after its acceptance checks pass. PRs, merges and releases remain separate deliberate steps.

### Phase 0 — Establish an accurate baseline and coverage inventory

Status: [x] Local implementation verified. Covers A1, B7, B8 and hidden follow-ups. Added Course guide with version/revision, coverage labels, and eight reachable optional prompts; retired the comparison prompt and duplicate Mini prompt. README distinguishes this source from v0.3.0. Not published yet.

Deliverables:
- Add an About area with app version and lesson revision; distinguish shipped release from local/unreleased work in developer documentation.
- Update README to match the full completion flow.
- Create a maintained feature inventory with one of: guided tutorial, short introduction, reference only, planned, or removed. Link every accessible item to its lesson; never treat keyword mentions as coverage.
- Inventory all ten hidden optional follow-ups. Move useful activities into explicit optional lessons; retire duplicates and the removed competitor-comparison exercise. Preserve legacy backup records without exposing author-history panels.
- Record current screenshot/control-label provenance and source-review dates.

Acceptance: every advertised feature links to reachable content; release and app versions agree; no personal data enters the public inventory; the local comparison removal is clearly identified as unreleased.

### Phase 1 — Make the first 10 minutes work

Status: [x] Initial local walkthrough implemented and verified; learner review pending. Covers A2 and A3. Includes optional setup, an annotated layout illustration explicitly labelled as an example (not an actual app screenshot), saved observations, missing-control routes, first-note examples/edit/recovery and compact lesson headers. A dated screenshot from a specific supported Windows client remains an editorial follow-up; the illustration is not presented as proof of exact current control positions.

Deliverables:
- Ask only useful setup questions: Windows app/web, Chat/Work/Codex, new/returning learner, and observed feature availability. Allow Unknown and Skip setup. A Plus subscription alone must not mark every feature available.
- Build a short Windows walkthrough with an annotated, non-sensitive example screenshot and text alternative. Start with the product/mode control, then the model label. Avoid exact model-name assumptions.
- Explain each term immediately. Move the complete 16-control map into optional reference.
- Generate a ready-to-copy observation prompt from fields the learner fills in; detect unfilled placeholders and offer Not found.
- First useful result: create a three-sentence MY-FIRST-NOTE, request one edit, open the actual result and check it against a shown example. Offer supplied text if file tools are absent.
- Introduce Open companion at the first action in the external AI app. Keep the active exercise clear when returning.
- Use a compact XP header on lesson screens so instructions and actions need less scrolling.

Acceptance: a new learner can follow without prior Git, terminal or tool knowledge; a missing selector has an immediate alternative; the first result is visible and checkable; all control-map topics are still available as optional reference.

### Phase 2 — Standardize the practical exercise format

Status: [x] Local implementation and automated UI verification completed; learner review pending. Covers A6 and B2. The shared format now covers all 60 chapter exercises, with preparation/sample inputs, actor roles, practice-only estimates, expected results, common failures, recovery, help/unavailable actions and optional local observations. The companion receives the same guidance. External feature execution and fuller advanced setup remain Phase 6 work; this does not upgrade every outline into a full tutorial.

Every exercise supplies:
1. The useful outcome and approximate time.
2. Required app/surface and preparation.
3. Complete sample input, downloadable starter or clearly named prior artifact.
4. Small actions with an explicit split between learner actions and assistant actions.
5. A prepared prompt using the chosen inputs.
6. A concrete expected result and a check the learner can perform.
7. One common failure and one recovery action.
8. Need help, Unavailable on my account, Revisit later and Done/Undo outcomes.
9. An optional observation or artifact reference, without making notes compulsory.

Example: the spreadsheet task supplies three named lessons with two done; changing the third must update the count from 2 to 3. If it does not, show where to inspect the formula and a repair prompt.

Acceptance: no pilot exercise depends on undefined sample data or unexplained labels; expected results are visible before Done; prepared prompts contain no accidental unresolved placeholders; the companion shows the same current task and success check. Then apply the schema to all remaining exercises.

### Phase 3 — Availability-aware progress and a useful dashboard

Status: [x] Local implementation and automated verification completed; learner review pending. Covers A5 and B1. Resume preserves the saved task while a separate preparation/availability-aware recommendation skips postponed work. Revisit entries restore exact exercises and recovery guidance. Availability, reasons, observations and explicit equivalent preparation persist without awarding credit. Expanded question panels persist; the all-currently-open rule remains unchanged. Chapter completion totals and optional prompt credit remain unchanged; independent mini-lesson progress is still Phase 4.

Deliverables:
- Separate availability (Unknown / Available / Needs setup / Unavailable) from action outcome (Not started / Done / Deferred / Skipped).
- Preserve completed exercises when one is deferred. A fallback can teach a concept without falsely marking the unavailable feature as tried.
- Keep one primary Resume action with the actual current exercise title, a separate recommended usable task, and a compact Revisit later list. Do not make an unavailable early topic the only suggestion.
- Recommend by preparation, observed availability and learner choice, not merely earliest incomplete chapter. Explain the recommendation in one sentence and allow choosing another topic.
- Save help/deferred reasons and a clear next recovery action. Need help works offline using supplied guidance; do not imply a built-in AI coach exists.
- Keep progress understandable: distinguish core learning completion from optional feature attempts. Explain why a chapter is unfinished and what specifically remains.
- Persist question-review progress without confusing it with verified comprehension. Present the proposed all-open-versus-opened-once policy for review before changing the current gate.

Acceptance: a learner without image tools can proceed to a usable task; a deferred step survives restart and appears in Revisit later; returning to a task restores its location; no skipped or unavailable feature receives false practical credit.

### Phase 4 — Split mixed chapters into independent mini-lessons

Status: [x] Implemented and verified locally (not released). Covers A4 and B7. Learning journey now has a searchable independent-practice catalog: 55 individually mapped chapter exercises, 12 new optional feature activities, and 5 preserved combined legacy records. Each has an entry, availability and practical outcome. Existing chapter checks remain shared with their mapped activity; optional outcomes and fallback reviews do not award XP. Stable IDs, normalization and migration tests preserve old achievements and the 17-chapter denominator. See `MINI-LESSON-MIGRATION.md`. Dedicated setup walkthroughs and worked examples remain scoped to Phases 5–6; these new feature activities are honestly labeled practice outlines.

Keep a small number of course chapters, but give each practical mini-lesson an independent identity, availability, completion and entry link. Candidate grouping:

| Learning area | Mini-lessons and a concrete result |
| --- | --- |
| First controls | Chat vs Work vs Codex; mode/model controls; plus/@; local vs cloud. Result: a small observed-control inventory. |
| Files and continuity | Attach a note; use a local folder; project instructions; resume in a new chat; inspect memory scope. Result: MY-FIRST-NOTE and a truthful handoff. |
| Everyday creation | Research; map; image creation; image editing; PDF; spreadsheet; slides; interactive visual; Sites preview. Each produces its own inspectable artifact. |
| Seeing and acting | Screenshot/Appshot; regular connected tab; in-app browser; one Notepad computer action; hosted graphical browser; private sign-in boundary. Result: identify what was seen and which action actually occurred. |
| Reusable tools | Installed plugin and connection; MCP concept; reusable skill; plugin packaging where available; GPT introduction. Result: a tested recap workflow with missing-input behavior. |
| Interface extras | Pets; the actual Mini/Micro label found in the client; voice versus dictation. Optional and individually completable. |
| Coding and collaboration | Local Git; branch/commit/push; PR review; merge; worktree. Result: the same small tracker developed step by step. |
| Advanced workflows | Parallel subagents; model handoff; coordinated chats; cloud task; schedule; hook. Each has a separate setup path, worked result and cleanup. |

Migration acceptance: stable IDs, backup/import compatibility, and tests mapping old checks to equivalent new tasks. Preserve earned achievements; avoid title regression or duplicate XP when topics move or split. Added curriculum should appear as newly available learning, without rewriting the learner's history. Version the course and explain any new completion denominator.

### Phase 5 — Teach vocabulary, context and Git visually

Status: [x] Implemented and verified locally (not released). Covers B3 and B4. Twenty searchable definitions open beside lessons with keyboard close and focus/scroll return. Coding, GitHub and environment lessons include a seven-stage worked tracker example, real small diffs, working/staged/local/online comparisons, and seven recovery routes. A dependency-free sample is verified in a disposable local Git repository. Memory has five comparison cases for supplied instructions, project guidance, a record, fresh-chat continuity and observed boundaries; no account switch or memory-setting change is required. See `LESSON-SUPPORT.md`. Advanced external labs remain Phase 6.

Deliverables:
- Inline glossary definitions for model, tool, skill, plugin, MCP, context, token, runtime, repository, staging, commit, branch, remote, push, PR and worktree. Provide one example and return to the same reading/scroll position.
- Memory exercise: compare an explicit instruction, project instruction, attached record, fresh chat and an unknown automatic-memory setting. Show observed evidence and what it does not establish. Add an account/host/project boundary exercise without requiring account switching or deleting memories.
- Git diagram follows one tracker file: working edit → staged selection → commit → local branch → pushed remote branch → PR → merged main. Use real small diffs and explain that staging chooses the next snapshot.
- Include “I downloaded a ZIP,” missing Git/Node, missing author identity, wrong folder, failed push and merge-conflict recovery paths.
- Let the assistant perform routine commands and explain outcomes. Manual typing remains an optional practice mode.

Acceptance: the learner can explain where the file, saved snapshot and online branch live; identify what the PR changes; and resume the tracker without relying on another chat remembering everything.

### Phase 6 — Make advanced workflows demonstrable

Status: [x] Guided lab content and local implementation verified (not released); external feature execution remains unverified. Covers B5 and the advanced items in the original request. Eight worked guides supply starter files, exact handoff inputs, intermediate illustrative results, setup/recovery/cleanup and saved reading positions. They are tied to matching practice exercises and do not grant completion by browsing. The tracker/checker, seeded review failure/repair and manual hook helper were actually executed in disposable local fixtures. No cloud environment, scheduled task, lifecycle configuration, external message, PR or sign-in was created for validation. See `ADVANCED-WORKFLOW-LABS.md`; live account-specific pilot runs belong in the Phase 7 validation record.

Use a supplied tracker/README starter as well as the learner's own project. Each lab must include setup, a worked output, failure recovery, and cleanup:

| Lab | Concrete task | Observable result |
| --- | --- | --- |
| Subagents | One explains tracker logic; another checks README accuracy; parent waits. | Two bounded findings plus a synthesis identifying what was inspected. |
| Planner/implementer models | Plan completion percentage, implement in an isolated copy, review empty-list behavior. | Plan, actual selected configuration, diff and checks. Never promise savings from labels; record usage only when actually observable and comparable. |
| Coordinated chats | Specification chat produces a small contract; implementation chat waits for it. | Exact authorized destinations, received handoff and output matching the contract. Distinguish relayed messages from direct peer messaging. |
| Local/worktree/cloud | Run the same tracker in three identified locations. | Directory/source revision/runtime/output and a clear account of which files are shared. Include a published-environment setup path. |
| Schedule | Manually validate a read-only task; create a temporary run with chosen timezone/host; inspect and pause it. | Actual run result, configured time/host and verified paused state. No schedule is created by the lesson itself. |
| Hook | Manually test a checker, then run it through one real supported lifecycle event, then disable it. | Separate manual and event logs; narrow reviewed configuration; verified cleanup. |
| Code review | Add a disclosed example defect to a disposable tracker copy and review against its requirements. | Finding tied to code and behavior, a correction and passing regression check; no manufactured independent approval. |
| Browser/computer/credentials | Read a public page, perform one harmless text action, inspect the sign-in boundary. | Named browser/window, visible result, no secret in chat or notes. A coding cloud environment does not stand in for a graphical cloud computer. |

Acceptance: a learner sees the intermediate evidence rather than just receiving a long prompt. If a feature is absent, the lab clearly records Demonstration reviewed or Unavailable, never Hands-on completed.

### Phase 7 — Publish an honest, tested course update

Status: [ ] Partially complete locally, 27 October 2026. Covers A1 and B8. An interactive clean-profile review and repeatable cross-feature path verified missing-control recovery, manual-save fallback, notes, glossary, cold restart, offline bundled reading, keyboard tabs, text contrast spot checks and actual backup export/import. Two learner-facing fixes keep missing-control help open and replace stale prior-practice backup wording. README now separates download instructions from unreleased source. Release preflight requires a clean repository root and packages only tracked runtime files. The source folder has no Git history, so no release binary, version bump, PR, tag or publication has been created. Clean-commit packaging/extracted-EXE checks and live external account/client pilot runs remain pending; see `LOCAL-LEARNER-REVIEW-2026-10-27.md`.

Deliverables:
- Fresh-profile usability pass, not only automated clicks: perform the first useful task, encounter one missing feature, use recovery, resume after closing, find a definition and identify the next task.
- Regression checks for legacy progress, stable XP/titles, new mini-lesson mapping, no duplicate credit, note autosave, availability-aware recommendations, keyboard/contrast, narrow layouts and reduced motion.
- Validate each lesson against its stated expected result and official product guidance. A reviewed date alone is not evidence of an executed lab or account availability.
- Keep screenshots annotated, dated and free of personal data. Test offline reading and helpful unavailable-tool routes.
- Update version/changelog/README, build from a clean verified commit, inspect the ZIP's source payload and personal-data exclusions, test the extracted executable, publish matching download and checksum, then clear obsolete development branches after merge.

Acceptance: documentation, coverage labels and the shipped download describe the same experience. Claims of real external execution identify what was actually tested. A beginner can explain what they did, what they inspected, and what remains untried.

## First implementation batch

Start with Phases 0 and 1 only: an honest coverage inventory, a minimal setup route, and one complete Windows first-task walkthrough. Demonstrate that before expanding the shared exercise format or rebuilding the whole curriculum. No new theme, animations, social features or built-in AI backend are needed for this batch.

## Official documentation checks and maintenance

These sources guide future writing; they do not establish which features a particular Plus account can access:

- [Use ChatGPT](https://learn.chatgpt.com/docs/use-chatgpt): Work and Codex overlap; the mode explanation should describe interface/workflow emphasis rather than imply Work cannot code or Codex cannot create documents.
- [Projects and chats](https://learn.chatgpt.com/docs/projects): distinguish shared uploaded sources and instructions from local folders and separate chat transcripts.
- [Codex environments](https://learn.chatgpt.com/docs/environments/modes): cloud tasks require an accessible published environment; the course needs an actual setup route.
- [Browser](https://learn.chatgpt.com/docs/browser): the built-in browser has a distinct profile; regular browser context needs its supported connection route.
- [Computer Use](https://learn.chatgpt.com/docs/computer-use): Windows foreground behavior and the chosen app matter; a lesson should explain what the learner will observe before starting.
- [Scheduled tasks](https://learn.chatgpt.com/docs/automations): host/file access and run conditions belong in the lab, not an assumption that every task runs with the PC off.
- [Features](https://learn.chatgpt.com/docs/features) and [Codex Micro](https://learn.chatgpt.com/docs/features/codex-micro): maintain a dated label inventory. The current index uses Micro; do not assume it is identical to every older Mini control without checking the actual client.

## Decisions recorded

- This is a plan, not permission to silently publish future changes or contact external accounts.
- The generic In other tools section remains removed; the older comparison-card proposal is retired.
- Current note autosave, Done/Undo and optional-note behavior remain intact.
- Keep your question-review requirement unless its proposed persistence/policy change is explicitly chosen during implementation review.
- No automatic purchases, subscriptions, credential changes or account-wide memory changes are part of learning completion.
