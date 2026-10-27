# Course reset: learn a feature by using it

27 October 2026. This supersedes the previous curriculum improvement plan. Local only.

## The goal we missed

The learner wants to understand a ChatGPT Windows feature and operate it personally from start to finish. A sequence of requests asking another AI to explain or implement the topic does not provide that instruction. Renaming Copy prompt or hiding preparation does not fix the material.

The earlier phases improved software behavior and added material, but did not establish educational acceptance. Their passing tests are evidence about the app and supplied code, not proof of a successful course. Do not describe the curriculum as finished or release-ready.

## The replacement lesson format

Each learning unit teaches one feature:

1. What it does, one useful everyday example, and when to choose it.
2. What app/surface is being taught and what access it needs.
3. Where to find it, using documented visible control names. State layout uncertainty instead of inventing a button.
4. Numbered actions the learner performs in the real app.
5. The concrete screen, object, file or result to inspect after the action.
6. A small edit or variation proving the learner can operate it again.
7. A route for missing access or an unexpected result.
8. How to pause, disable, undo or clean up the trial where relevant.
9. A small practical use chosen by the learner.

A short message is appropriate when sending a message is how that feature is invoked. It must not outsource the tutorial to another AI. The lesson itself supplies the explanation and navigation. No generic You/Assistant role paragraphs, unrelated tracker prerequisite, or repeated request to ask AI for teaching instructions.

## First replacement: Scheduled

The in-app pilot covers: purpose → find Scheduled → create a simple daily learning question → inspect its saved instructions/timezone/next run → inspect a real run → edit the time → pause and verify → reflection.

No Node, Git, repository, checker script or connected account is required. One scheduling request is provided because chat-based creation is a documented method. The lesson then teaches management through Scheduled; it does not delegate that management lesson to a prompt. A created task, manual Run now test and actual timed execution are distinguished.

The lesson cites current official documentation. It has not been exercised in the learner’s actual ChatGPT account. Exact layout and edit controls still require client-specific validation; no screenshot or live account execution is claimed. Reading, copying and choosing a time in this learning app create no schedule.

The trial record is separate from old chapter XP. Old records are preserved; completing an old chapter is not inferred as completion of the rewritten tutorial.

## Replacement course sequence

| Sequence | Independently taught features | Required hands-on outcome |
| --- | --- | --- |
| 1. Find your way | Chat/Work/Codex selector; model and reasoning controls; new chat; stop/steer; plus/@ menus | Locate and use one control at a time, observe what changes, return to the previous view. |
| 2. Useful everyday features | Scheduled; file attachment; image creation; image editing; web search; maps when available | Create a real task/artifact or inspect a sourced result, make one change and manage/stop it. |
| 3. Keep work organized | Projects; uploaded sources versus local folders; project instructions; notes and fresh chats | Create a disposable learning project, add a harmless source/instruction and check its scope across chats. |
| 4. Understand continuity | Context; memory controls; account/project/host boundaries; shared project context | Inspect the actual setting and distinguish it from an explicitly supplied record; no account switching or memory deletion required. |
| 5. Produce and inspect work | PDFs; spreadsheets; presentations; interactive visuals; Sites preview and publishing as separate lessons | Open the actual artifact, inspect its output, edit it and export or preview it. Publishing is a separate chosen action. |
| 6. See and act | Appshots/screenshots; connected browser; in-app tabs; computer use; graphical cloud computer; private sign-in | Identify the exact window/browser/host, perform a harmless real action, inspect it and stop. Never put credentials in chat. |
| 7. Extend the app | Plugins; connections and resource permissions; skills; GPTs; MCP inspection/setup where supported | Find the relevant control, understand its scope, use one bounded capability and manage or remove the trial appropriately. |
| 8. Interface extras | Voice; dictation; floating Mini; Pets; Codex Micro hardware | Try each independently with the required app/device access and explain what changed. Mini and Micro are distinct. |
| 9. Developer tools | Git from a ZIP or checkout; staging/commit/branch; GitHub push/PR; code review; worktrees; Codex Cloud | Follow the same small project only once coding begins, while teaching each control and saved object directly. |
| 10. Coordinated workflows | Plan; Goal; subagents; model handoff; parallel chats; messaging/waiting; hooks | Operate the available feature, inspect intermediate states/results and verify cleanup. Prompts are used only where invoking the feature requires them. |

All 64 topics in the current inventory now have feature-specific tutorial drafts. They cover app controls, context and memory, research, artifacts, Sites, integrations, app/browser/computer workflows, personalization, Git/GitHub, cloud environments, hooks, subagents and coordinated work. Codex Micro is correctly treated as optional hardware distinct from Mini. Preparation links connect dependent developer activities.

This completes the current writing queue, not educational acceptance or live-client validation. Every tutorial still needs a real learner/client trial where access exists; unavailable features must remain unavailable rather than earn practice credit. This dated inventory is not a promise to cover every future button or app version. Re-author instructions when official documentation or an observed client differs. Earlier technical phase completion is not proof that the new curriculum has been validated.

## What stays and what changes

Keep the working save/backup system, optional notes, navigation, availability records and useful feedback. Stop treating the previous 17-chapter completion meter or 60 prompt exercises as evidence the new material is finished. Keep historical records until a deliberate, tested curriculum migration is designed.

Replace the material and its primary journey progressively with feature tutorials. The feature-first material is now the default Overview, Learning journey and Course guide. Earlier chapters are behind explicit archive links. Feature notes and earlier chapter notes share one picker, and both remain in backups. Tutorial practice never infers credit from old chapter completion. See FEATURE-TUTORIAL-COVERAGE.md for the generated inventory. Defer release packaging until the rewritten material has a genuine learner trial.

## Pilot sources

- [Scheduled tasks](https://learn.chatgpt.com/docs/automations): management in Scheduled, chat-based creation, run inspection and local execution conditions.
- [Quickstart](https://learn.chatgpt.com/docs/quickstart): Windows product/workflow selection and the desktop sidebar illustration.

Account access, exact UI layout and actual timed execution remain unverified for the learner’s client. Those are content-validation tasks, not something automated UI tests of this learning app can establish.
