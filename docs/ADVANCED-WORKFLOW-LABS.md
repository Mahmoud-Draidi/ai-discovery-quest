# Advanced workflow labs

Local curriculum revision: `2026.10.27-workflow-labs`. Not yet released.

## What was added

Eight worked guides are reachable in relevant chapters and mini-lessons:

| Guide | Concrete intermediate result |
| --- | --- |
| Subagents | Two actual bounded read-only findings received before a synthesis; sequential fallback stays labeled sequential. |
| Model handoff | A reviewed percentage contract/plan, implementation in an isolated copy, four checks and observed configuration. Savings remain unmeasured unless comparable counters exist. |
| Coordinated chats | A waiting receiver, a complete contract, chosen authorized delivery route and actual received result. Manual relay is separate from direct messaging. |
| Local/worktree/cloud | Directory, branch, source revision, runtime and output for each location; a supported environment creation/selection route. |
| Schedule | Manual checker result, selected time/timezone/host, real scheduled run evidence, then verified paused state. |
| Hook | Manual-source logger output, proposed project-local configuration, correlated real event evidence, then cleanup verification. |
| Review | A disclosed empty-array defect, actual failing assertion, code-based finding, minimal guard and passing regression tests. |
| Browser/computer/sign-in | Identified public page, visible fresh-Notepad action, inspected private sign-in boundary and distinct graphical-cloud capability. |

The main app executes none of these external workflows. Each guide labels its sample output illustrative, leaves missing access unverified and directs the learner to inspect actual evidence. Reading a guide or copying its prompt does not mark an exercise done or award XP.

Try it exposes the guide matching the current practice activity. Understand can offer related examples from that chapter. Saved guide positions and related selections are validated, normalized and carried through the normal save/backup path. Existing exercise checks, availability, notes, completion gates and chapter totals remain unchanged.

## Supplied inputs

`src/workflow-labs.js` holds:

- `learning-tracker.cjs`, README and `check-tracker.cjs`: a dependency-free three-lesson starter with an expected 2-of-3 count.
- A completion contract and four regression cases: 2/3 → 67%, 0/3 → 0%, 3/3 → 100%, empty → 0%, plus no input mutation.
- A deliberately defective completion function for a disposable review exercise.
- `quest-hook-demo.cjs`: a project-local checker/logger that emits valid JSON, does not block or continue a turn, and does not read transcripts or transmit data.

Starter requests require a new chosen practice folder and stop at existing filenames. The starter checker is intentionally specific to the fixed sample. For an evolved course tracker or another project, inspect the actual requirements and adapt expectations explicitly; do not silently replace its data with the starter.

The hook helper is source code to inspect, not active configuration. It is never written into this repository’s `.codex` directory by the app. A manual invocation with an event label is insufficient evidence of an actual lifecycle event; the guide requires correlation with client activity and a real event.

## Local verification and limits

`tests/workflow-labs.test.cjs` executes the starter/checker, verifies a changed input fails, reproduces the empty-list review defect, validates its minimal repair, and runs the manual hook helper with both passing and failing checks in disposable fixtures. It also checks guide metadata and migration without progress credit.

`scripts/verify-workflow-labs.cjs` visits all eight guides through matching exercises, checks example labels, step navigation, saved reading positions and selections, cleanup content, mini-lesson entry and narrow layout. The surrounding desktop, first-step, guidance, dashboard, mini-lesson and glossary suites cover existing behavior.

External subagent runs, multi-model usage, cross-chat messaging, cloud environments, scheduled execution, real lifecycle hook activation, PR review publication, sign-in and computer-use actions were not executed as part of these app tests. They remain account/client-dependent learner pilot work. No such result is claimed by an illustrative example.

## Official guidance checked

- [Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents): independent delegated work, waiting, configuration and token use.
- [Codex environments](https://learn.chatgpt.com/docs/environments/modes): local/worktree/cloud locations and accessible published environments.
- [Scheduled tasks](https://learn.chatgpt.com/docs/automations): host/time choices, run inspection, paused state and local machine availability.
- [Hooks](https://learn.chatgpt.com/docs/hooks): project-local reviewed configuration, real lifecycle events and JSON output for Stop handlers.

The guides use current client observations rather than fixed model names, assumed account entitlements or fabricated run evidence. Existing chapter sources provide browser, sign-in and review references.
