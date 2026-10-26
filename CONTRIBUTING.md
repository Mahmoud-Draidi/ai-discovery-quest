# Contributing to AI Discovery Quest

Help make practical AI learning clearer, more accessible, and easier to verify. Contributions can improve lessons, fix bugs, strengthen checks, or refine the interface.

## A useful contribution

- Discuss substantial features before building them so the scope fits the learning journey.
- Keep one focused improvement per branch and pull request.
- Explain the problem, what changed, and how you verified the result.
- For product-specific lessons, link current official documentation and distinguish tested behavior from assumptions.
- Keep exercises beginner-friendly: explanation, actual action, inspection, feedback, and checkpoint.
- Do not claim the app observed an external action it cannot see.

## Working locally

1. Fork the repository and clone your fork, or use an authorized branch in the original repository.
2. Follow the development instructions in README.md.
3. Make your change in a feature branch.
4. Run `pnpm test` and check the affected desktop flow. For saved progress changes, test closing and reopening with a separate test profile.
5. Push your branch and open a PR explaining the behavior and checks.

Keep personal notes, progress files, credentials, raw conversations, dependencies, test profiles, and machine-specific shortcuts out of commits. The repository's `.gitignore` covers the development artifact locations; review the diff as well.

Use the Node.js and pnpm versions declared in `package.json`, then run
`pnpm install --frozen-lockfile`. Installation may need internet access for
dependencies and the official Electron runtime. `Launch Learning Hub.cmd` is
an optional Windows development launcher.

## Content and desktop checks

Run `node scripts/generate-course-guide.cjs` after editing lesson metadata.
`node scripts/generate-course-guide.cjs --check` verifies that the guide matches
the course. Keep chapter lists in the generated guide rather than duplicating
them in the README.

Optional desktop QA uses an existing Playwright installation: set
`QUEST_PLAYWRIGHT` to its module path, or make `playwright` available to Node,
then run `node scripts/verify-desktop.cjs`. It launches a separate test profile
under ignored `test-results/`, tests interaction and companion-window behavior,
and closes its windows. It does not modify the real learner profile.

See [chapter sources](CHAPTER-SOURCES.md) for editorial provenance and dated
reference checks, [review response](REVIEW-RESPONSE.md) for review findings,
and [.github/workflows](.github/workflows) for automated checks.

## Repository settings and releases

See [release preparation](docs/RELEASING.md) for the GitHub About settings,
build verification, and release-note template. Source changes reach learners
when a new app ZIP is published.

## License

By submitting a contribution, you agree to license that contribution under this project's MIT License, unless you clearly identify different terms and the maintainers explicitly agree before accepting it. Only contribute material you have permission to share.

Contributions to this repository are encouraged, not required as a condition of using or modifying the project.
