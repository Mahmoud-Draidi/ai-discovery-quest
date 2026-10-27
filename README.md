# AI Discovery Quest

Learn to use AI through practical exercises.

A free, beginner-friendly Windows desktop course. Each chapter has a short
explanation, a hands-on task in a real AI tool, and a knowledge check, with
personal notes and progress saved on your computer.

**[Download for Windows](https://github.com/Mahmoud-Draidi/ai-discovery-quest/releases/latest)**
· [Course guide](COURSE-GUIDE.md) · [Contribute](CONTRIBUTING.md)

## Get started

1. Download the Windows x64 app ZIP from the release linked above (not "Source code").
2. Extract the whole ZIP and open **AI Discovery Quest.exe**.
3. Open **Learning journey**, choose a chapter, then follow **Understand → Try it → Check → Questions & sources → My note → Mark chapter completed**. Writing a note is optional.

**In the download:** use the matching release notes for the features included in that version.

**In local source:** the material is being rebuilt as feature-by-feature tutorials after learner feedback. All 64 currently inventoried topics now have feature-specific tutorial drafts, covering everyday app controls, useful work, integrations and developer workflows. Live account/client trials are still required; a written tutorial is not a claim that a feature is available or mastered. Earlier prompt-led lessons remain in a separate archive. This work is unreleased. See the [course reset plan](docs/FEATURE-FIRST-COURSE-RESET.md). Development builds identify their version and lesson revision under **Course guide**.

No Node.js, developer tools, or API key needed. The app is unsigned and has
no installer or automatic updates, so Windows may show an unrecognized-publisher
notice.

## How it works

Exercises use AI tools you choose, and some may need an account or internet
access. Each chapter lists what it needs. You record what you actually did;
the app cannot observe other tools. Bundled lessons, quizzes, and progress work
offline. External source links need internet access.

## Your data

Notes and progress are saved locally and are not uploaded:

```text
%APPDATA%/AI Discovery Quest/progress.json
```

Use **Progress & backups** to export or import a backup. Close the older app
and back up before updating; versions share the same saved progress.
Notes and backups are plain text, so keep them private.

## For developers

```sh
pnpm install --frozen-lockfile
pnpm start      # run from source
pnpm test       # run checks
pnpm build:win  # build the Windows ZIP
```

Required Node.js and pnpm versions and the Electron dependency are in
[package.json](package.json). See [CONTRIBUTING.md](CONTRIBUTING.md) for setup,
content checks, desktop verification, and release preparation.

## Feedback and license

[Report a bug or suggest an improvement](https://github.com/Mahmoud-Draidi/ai-discovery-quest/issues)
(include the app version and steps, but no personal notes). MIT licensed;
dependencies keep their own licenses. See [LICENSE](LICENSE).
