# Mini-lesson migration

Curriculum edition: `chapters-v1+mini-v1`.

The chapter route retains its existing 17 chapters, knowledge checks, review gate, explicit completion action, and 100 XP per completed chapter. The independent-practice catalog is an additional way to enter an exercise. It does not replace chapter completion.

## Stable identity and old progress

`src/mini-lessons.js` explicitly maps the 60 existing exercise positions to semantic IDs (for example `foundation.first-note` and `coding.git-snapshot`). These keys are frozen identities: do not derive them from display titles, rename them when wording changes, or reuse one for a different task. If chapter steps are reordered, update their explicit index mapping with a migration and regression tests.

Mapped activities read and write the original chapter check, availability and observation. They never copy completion into another ledger. Done/Undo is reflected in both entry routes. A practical check alone cannot bypass the knowledge check, question review, optional-note visit or final chapter completion action.

The five combined feature-lab exercises have `legacy-` identities and remain under Earlier combined practice records. Their original checks and chapter role stay intact. They are excluded from the new catalog total to avoid counting a combined exercise and its newly separated topics as equivalent independent results.

The 12 newly separated optional capabilities use `optional.*` IDs. They start untried, even when the original combined exercise was checked. No evidence is inferred that the learner used every feature in a mixed task. These capabilities include image creation/editing, Pet/compact interfaces, GPT use, in-app/hosted browser routes, private sign-in inspection, voice/dictation, MCP inspection and private plugin packaging.

## Counts and outcomes

The main catalog contains 55 mapped exercises plus 12 new optional activities. Its practical-result counter is separate from chapter completion and XP. Changing that catalog cannot lower an existing chapter title or expand the chapter denominator. No optional activity awards XP.

Optional records keep `outcome`, `availability` and an observation of up to 1,000 characters. Outcomes distinguish practiced, fallback reviewed, deferred, skipped and not started. Availability is independently unknown, available, needs setup or unavailable. Changing availability never erases a practiced result. A reviewed fallback does not claim hands-on execution.

## Save, resume and backup compatibility

Normalization adds default optional records to older saves, validates IDs/enums, and bounds observations. Invalid resume IDs fall back to the regular lesson route. A valid mini-lesson resume uses the stable ID and its canonical parent chapter. The normal store and export/import path carry these fields; no separate file or account is required.

Old app versions do not know these new fields and may discard them if they rewrite a backup. Keep a backup from the newer app before opening progress in an older build.

## Verification

- `tests/mini-lessons.test.cjs`: legacy checks, independent split outcomes, mapped Done/Undo, fallback honesty, malformed records, resume/backup round trips, unchanged chapter denominator and rewards.
- `scripts/verify-mini-lessons.cjs`: catalog search/filter, independent image activities, missing-tool fallback, saved observations, exact resume, mapped check sync and narrow layout.
- Existing desktop, first-task, practice-guidance and dashboard suites continue to cover the original chapter route.

These tests exercise this app. They do not establish access to any external AI feature or prove that its external exercise ran.
