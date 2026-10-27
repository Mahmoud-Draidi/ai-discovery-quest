# Repository settings and release preparation

## GitHub About

Description (also used in `package.json`):

> Beginner-friendly Windows desktop course for learning AI through practical exercises.

Website: leave blank, or use the repository's latest-release URL.

Suggested topics: `ai`, `ai-learning`, `education`, `course`, `beginner-friendly`,
`prompt-engineering`, `electron`, `windows`, `desktop-app`, `offline-first`.

Show Releases in the sidebar. Hide Packages and Deployments when unused.
These settings are edited on GitHub; changing this document does not apply them.

## Prepare a release

1. Review `CHANGELOG.md`. Move the changes being shipped from Unreleased into
   a dated release entry and set `package.json` to an unused version. Do not
   replace an existing release ZIP with different source under the same version.
2. Use a Git checkout on Windows x64. Install dependencies with
   `pnpm install --frozen-lockfile`, run `pnpm test`, and perform desktop QA
   as described in [CONTRIBUTING.md](../CONTRIBUTING.md).
3. Commit the reviewed source, then run `pnpm build:win` from a clean working
   tree at the app repository root. A source ZIP without Git history cannot produce
   a release. Preflight checks run before copying the Electron runtime. The payload
   includes only Git-tracked runtime files, excluding ignored notes or scratch data.
   The source is checked again before ZIP creation. The build refuses to overwrite
   an existing generated build folder;
   preserve earlier artifacts before deliberately removing that folder.
4. Inspect `dist/AI-Discovery-Quest-<version>-windows-x64/BUILD-INFO.json`.
   Confirm the version matches `package.json`, `sourceCommit` is the intended
   release commit, and `sourceDirty` is `false`.
5. Extract the generated ZIP into a new folder. Read `START-HERE.txt`, launch
   `AI Discovery Quest.exe`, and check the main learning and backup flows.
   Use a separate Windows test account for a fresh profile; extraction folders
   under the same account share saved progress.
6. Confirm the ZIP's SHA-256 matches `dist/SHA256SUMS.txt`, for example with
   PowerShell's `Get-FileHash -Algorithm SHA256 -LiteralPath <zip-path>`.
7. Create tag `v<version>` on the exact `sourceCommit`. Title the release
   `AI Discovery Quest <version>`. Publish as the latest stable release only
   after verification; the README uses `/releases/latest`.
8. Attach `AI-Discovery-Quest-<version>-windows-x64.zip` and `SHA256SUMS.txt`.
   Replace every placeholder below with verified values. Link the changelog
   at the release tag so the history stays tied to the shipped source.

The version currently in `package.json` is not proof that a fresh release is
ready. Check existing releases before choosing a version. Never invent a build
commit or checksum for a source folder without Git history.

## Release-note template

```markdown
## AI Discovery Quest <version>

A free, beginner-friendly Windows desktop course for learning AI through
practical exercises.

### Download
Download **AI-Discovery-Quest-<version>-windows-x64.zip** below. The
"Source code" downloads are for developers.

1. Extract the entire ZIP to a folder.
2. Open **AI Discovery Quest.exe**.

No Node.js, developer tools, or API key needed.

### What's new
<Summarize the changes actually included in this build from CHANGELOG.md.>

### Good to know
- Unsigned Windows x64 build. Windows may show an unrecognized-publisher notice.
- No installer or automatic updates.
- Close older versions before running this one; versions share saved progress.
  Back up first using Progress & backups → Export.
- Some exercises need external AI tools or accounts.

### Verify your download
SHA-256: `<exact ZIP hash from SHA256SUMS.txt>`

Full history: [CHANGELOG.md](https://github.com/Mahmoud-Draidi/ai-discovery-quest/blob/v<version>/CHANGELOG.md)
```
