# AI Discovery Quest — desktop Learning Hub

Status: first chapter implemented and desktop development build verified. Public repository and packaged Windows installer remain pending.

## Purpose

Turn our practical AI learning journey into a beginner-friendly Windows desktop course and searchable reference that other people can follow at their own pace.

The learner directs and reviews AI-led development. Teach the tools through useful work, explain unfamiliar terms, and distinguish what has been demonstrated from what has only been explained.

## Experience

- A dark charcoal interface with subtle borders, readable off-white text, and a restrained green/teal accent. Inspired by ChatGPT's visual simplicity, with our own identity.
- A journey organized into chapters, with a clear next action and a way to resume.
- Searchable explanations, examples, questions and answers, troubleshooting, and official sources.
- Personal notes, bookmarks, and progress, kept separately from the shared curriculum.
- Milestone titles earned by completing practical checks, rather than simply opening pages.

The learner's early drawing was an exercise only; it is not the product design specification.

## First complete slice

One chapter: **Models, tools, and skills**.

1. Read a short explanation of the three concepts and one everyday example for each.
2. Follow a practical exercise using an AI assistant: ask it to create a short note and inspect its result.
3. Record the exercise as completed, skipped, or still to do. This is learner-reported evidence; the app does not pretend to observe an external chat.
4. Answer three short practice questions, one at a time, with useful feedback and retries.
5. Save a personal note and return to it after restarting the app.
6. Earn the title **AI Explorer** after completing the practice check and the exercise.
7. See the chapter's status and next action on the home screen.

Only this chapter is interactive in the first version. Future chapters can be shown as a roadmap, clearly labeled as not yet available. Do not present placeholder lessons as complete course content.

## First-version acceptance checks

- Opens as a desktop window on Windows.
- Fresh users start with no completed lessons or earned titles.
- Selecting an incorrect answer explains the distinction and allows another attempt.
- A milestone is not awarded merely for visiting a lesson.
- Notes, answers, exercise status, and completion survive closing and reopening the app.
- Progress belongs to this local user and does not alter the shared curriculum files.
- The chapter is usable with keyboard controls and readable at common window sizes.
- No AI API key, external account, or internet connection is needed to read the bundled chapter and save local progress. External practice instructions explain which tools are needed.

## Content plan after the first chapter

Expand the curated route: prompting and verification; files and context; instructions and memory; research; artifacts; browser and computer use; plugins/MCP; reusable skills; planning/goals/scheduling; coding and Git; GitHub and PR review; local/cloud/worktrees; subagents/model handoffs/coordinated chats; hooks; cross-product comparisons.

Keep the questions discovered during our journey as a searchable reference. Rewrite them for general learners, add requirements and source links, and preserve corrections. Track deferred or unavailable features honestly and provide alternatives where useful.

## Sharing and repository

- Create a fresh app repository, separate from the course folder and existing practice tracker.
- Target a public repository containing app source, curated lessons, documentation, and appropriate licensing.
- Review the exact initial public files before publishing. Do not upload the course folder wholesale.
- Keep personal progress, notes, raw conversations, machine-specific paths, and credentials out of the public curriculum and Git history.
- Provide a downloadable Windows release after the desktop build has been verified.
- MIT selected for the app's original source and associated course documentation. Dependencies retain their licenses. Public repository publication remains pending.

## Not required for the first version

Built-in AI coaching, accounts, cloud sync, sharing personal notes, every historical artifact, achievements across the full course, automatic assessment of external apps, and running multiple agents inside the Learning Hub.

These can be considered later. The initial product is a learning app; it does not need to become another AI chat client to be useful.

## Build checkpoints

1. Review this brief and build the desktop shell plus one polished chapter.
2. Verify persistence, quiz feedback, milestones, and the real desktop window.
3. Review the files selected for the fresh repository and its license.
4. Publish the reviewed source and, later, a tested Windows release.
5. Expand the course in small verified chapters while continuing the original learning journey.
