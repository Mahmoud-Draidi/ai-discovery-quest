# AI Discovery Quest — desktop Learning Hub

Status: See [CHANGELOG.md](CHANGELOG.md) for release notes and unreleased changes, and [Releases](https://github.com/Mahmoud-Draidi/ai-discovery-quest/releases/latest) for the shipped version.

## Purpose

Turn our practical AI learning journey into a beginner-friendly Windows desktop course and searchable reference that other people can follow at their own pace.

The actual journey is the foundation. Improve explanations, prerequisites, navigation, and checks; label genuinely new exercises as enhancements. Do not replace the journey with an unrelated course or require the original learner to repeat completed exercises to author content. Keep personal learning progress separate from app-development progress.

The learner directs and reviews AI-led development. Teach the tools through useful work, explain unfamiliar terms, and distinguish what has been demonstrated from what has only been explained.

## Experience

- A neutral charcoal interface with subtle borders, readable off-white text, and white accents. Inspired by ChatGPT's visual simplicity, with our own identity.
- A journey organized into chapters, with a clear next action and a way to resume.
- Searchable explanations, examples, questions and answers, troubleshooting, and official sources.
- Personal notes, bookmarks, and progress, kept separately from the shared curriculum.
- A named local learner profile, a time-of-day greeting, and XP/level titles based on completed chapters, with a progress bar toward the next title.

The learner's early drawing was an exercise only; it is not the product design specification.

## Chapter experience

Example chapter: **Models, tools, and skills**.

1. Read a short explanation of the three concepts and one everyday example for each.
2. Follow a practical exercise using an AI assistant: ask it to create a short note and inspect its result.
3. Record the exercise as completed, skipped, or still to do. This is learner-reported evidence; the app does not pretend to observe an external chat.
4. Answer short practice questions, one at a time, with useful feedback and retries.
5. Save a personal note and return to it after restarting the app.
6. Earn 100 XP after completing the practice check and the exercise; the learner header shows progress toward the next level title.
7. See the chapter's status and next action on the home screen.

Each chapter gives a self-contained explanation, preparation, practice, and checks for a new learner. The Learning Hub build/release itself is project work, excluded from the course chapters.

## First-version acceptance checks

- Opens as a desktop window on Windows.
- Fresh users start with zero XP, no completed lessons and the AI Newcomer title.
- Selecting an incorrect answer explains the distinction and allows another attempt.
- XP is not awarded merely for visiting a lesson or repeating a quiz.
- Notes, answers, exercise status, and completion survive closing and reopening the app.
- Progress belongs to this local user and does not alter the shared curriculum files.
- The chapter is usable with keyboard controls and readable at common window sizes.
- No AI API key, external account, or internet connection is needed to read the bundled chapter and save local progress. External practice instructions explain which tools are needed.

## Curriculum

See the generated [course guide](COURSE-GUIDE.md) for the chapter route, preparation, and practice checkpoints.

Keep the questions discovered during our journey as a searchable reference. Rewrite them for general learners, add requirements and source links, and preserve corrections. Track deferred or unavailable features honestly and provide alternatives where useful.

## Sharing and repository

- Create a fresh app repository, separate from the course folder and existing practice tracker.
- Target a public repository containing app source, curated lessons, documentation, and appropriate licensing.
- Review the exact initial public files before publishing. Do not upload the course folder wholesale.
- Keep personal progress, notes, raw conversations, machine-specific paths, and credentials out of the public curriculum and Git history.
- Provide a downloadable Windows release after the desktop build has been verified.
- MIT selected for the app's original source and associated course documentation. Dependencies retain their licenses. The reviewed initial source is now published in the public repository.

## Not required for the first version

Built-in AI coaching, accounts, cloud sync, sharing personal notes, every historical artifact, achievements across the full course, automatic assessment of external apps, and running multiple agents inside the Learning Hub.

These can be considered later. The initial product is a learning app; it does not need to become another AI chat client to be useful.

## Build checkpoints

1. Review this brief and build the desktop shell plus one polished chapter.
2. Verify persistence, quiz feedback, learner XP/levels, and the real desktop window.
3. Review the files selected for the fresh repository and its license.
4. Publish the reviewed source and, later, a tested Windows release.
5. Expand the course in small verified chapters while continuing the original learning journey.

## Learner-facing presentation

The interface is a standalone AI course. Do not show author-history panels, original-learner status, or retrospective dialogue. Use the real learning experiences as editorial source material, then teach the concepts directly. Keep provenance and project history in development documentation. Personal resume data remains local.
