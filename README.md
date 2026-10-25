# AI Discovery Quest

A Windows desktop course built from a real beginner's AI learning journey. This development version contains **13 chapters**, **39 quiz questions**, **84 searchable reference entries**, and **10 optional follow-ups**. See [the course guide](COURSE-GUIDE.md) for coverage, prerequisites, and evidence limits.

The course teaches use of real AI tools. Its practical tasks take place in an AI chat, file tool, browser, coding environment, or connected service. The app organizes lessons, prompts, inspection checks, notes, and progress; it does not replace those tools with a built-in AI coach.

The published `v0.1.0-preview.1` ZIP still contains only the original first chapter. This branch is the full-course update for review; it does not update an already downloaded executable or publish a new release.

## Use the app

- Open **Learning journey** to choose a chapter. Each explains the topic, lists the preparation, and provides a practical exercise.
- Read **Understand**, then follow **Try it** one manageable step at a time in the relevant real tool.
- Inspect the actual result before recording practice. Skip/defer are separate outcomes.
- Use **Check** for three retryable questions. A milestone requires both practical completion and the knowledge check.
- Use **Questions & sources** and **Reference library** to revisit explanations and corrections.
- Save personal chapter notes. **Continue where I left off** returns to the saved chapter, section, and step.
- Use **My journey** to record previous experience without retaking lessons, manage unfinished follow-ups, or export/import a personal backup.

Completion records describe your own practice and understanding. The app cannot observe external chats or verify those actions automatically. Existing-practice records do not fabricate quiz answers or award titles.

Lessons are written for a new learner without requiring knowledge of the project's authors or development history. Editorial provenance is kept in [CHAPTER-SOURCES.md](CHAPTER-SOURCES.md), outside the learner interface.

## Development

Requires Node.js and a package manager. Electron 45.0.0 is pinned; dependencies remain locked in pnpm-lock.yaml.

```sh
pnpm install
pnpm start
pnpm test
```

Installation can require internet to obtain the official runtime. Bundled lessons, quizzes, notes, and local progress work offline afterward. Official-source links and most external practical tasks need their relevant connections. No AI API key is required by this app.

`Launch Learning Hub.cmd` launches the installed development runtime and exits its console. The optional local shortcut contains machine-specific paths and is excluded from Git.

## Local data and backups

The app stores personal progress in `progress.json` under its OS user-data directory. On Windows: `%APPDATA%/AI Discovery Quest/`. Notes are local plain text, not encrypted or automatically synced. Different extraction folders can use the same Windows account's data. Runtime data is not part of source control or the app package.

This version preserves the earlier chapter-one fields and adds independent chapter, resume, prior-practice, and follow-up records. Prior-practice records are separate from in-app quiz results. Exported backups contain personal data: keep them private. Import previews the candidate state before replacement and saves the previous state to a dated local recovery file. Malformed JSON is rejected; corrupt saved progress is kept intact and editing blocked for recovery.

Avoid using an old and new app version against the same profile in parallel: older versions do not understand the newer chapter fields. Back up progress before switching versions. No learner-specific resume or notes are seeded into the public app.

## Checks

The GitHub Actions **Progress checks** workflow runs syntax and Node progress/storage/content tests on Windows and Linux for pull requests into `main`. These tests cover completion gates, invalid state, chapter data, old-progress retention, and persistence. They do not open Electron or exercise external accounts.

Desktop QA is separate: chapter routing, one-step practice, wrong-answer feedback, all quiz flows, notes/restart, resume, backup/import recovery, reference search, and narrow-window layout. Test profiles and screenshots stay in ignored `test-results/`. A successful app test does not demonstrate that every external lesson was performed by a learner.

## Build a Windows app ZIP

On Windows x64 after dependencies are installed:

```sh
pnpm build:win
```

The script copies the official runtime and explicit source/license payload, creates a ZIP and checksum in ignored `dist/`, and records the source revision. It refuses to replace an existing generated build directory. Preserve an older generated build deliberately before rebuilding the same version.

Extract the entire ZIP and open `AI Discovery Quest.exe`; keep the surrounding files together. No separate Node.js installation is needed for the packaged app. This is an unsigned app ZIP, not an installer or automatic updater. Publisher signing and an installer are separate distribution work.

The package excludes Git history, development dependencies, tests, screenshots, course-private journals, and personal progress. Runtime license notices are retained. A source ZIP from GitHub is for developers, not the packaged end-user download.

## License and contributions

Original source and associated course documentation use the [MIT License](LICENSE). Dependencies retain their own licenses. MIT permits broad use/modification/redistribution, including commercial use, while preserving required notices; contributions back are welcome, not mandatory. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Technical choices

Electron desktop window; bundled HTML/CSS/JavaScript; isolated sandboxed renderer; restricted preload for local progress and fixed official-reference links. No production framework, external AI API, or remote executable content is added. The shared chapter data drives the later lesson screens; earlier progress remains compatible.
