# AI Discovery Quest

A Windows desktop learning app built around practical AI exercises. First development version: one complete chapter, **Models, tools, and skills**. The remaining journey is a labeled roadmap, not completed content.

## Try the first chapter

1. Start with Overview and open the chapter.
2. Read the concepts, then use **Try it** to create and edit a real note with your chosen AI assistant.
3. Inspect your external result before recording the exercise as practiced. Skip/defer are separate outcomes.
4. Complete the three-question check; incorrect answers give feedback and allow retries.
5. Save a personal note. Completing the exercise and all questions earns **AI Explorer**.

The app cannot observe your external assistant. Exercise completion is self-reported. The quiz tests simple distinctions, not expert mastery.

## Development

Requires Node.js and a package manager. Electron is pinned in package.json; dependencies are locked in pnpm-lock.yaml.

```sh
pnpm install
pnpm start
```

If Electron's executable has not been downloaded yet, its launcher downloads the official binary on first run. Internet is needed for installation and external source links, not for bundled lessons or local progress afterward.

```sh
pnpm test
```

After installing the runtime, `Launch Learning Hub.cmd` opens the desktop executable and immediately exits its console. On the development machine, the local `AI Discovery Quest.lnk` shortcut opens it directly with no command window. The shortcut contains local paths and is excluded from Git. These are development launchers, not a Windows installer.

## Local data

Personal progress is saved as `progress.json` in Electron's OS-specific user-data folder. On Windows this app uses `%APPDATA%/AI Discovery Quest/`. Notes are local plain text in that file, not encrypted or synced. App source does not read the original course's private journal or progress file. Do not commit a user-data folder.

The app stores note edits as you type and shows save status. If saving fails, the header reports it. If progress cannot be parsed, the file is left intact and editing is blocked until recovery.

## Project status

Development preview only. A public repository, Windows installer, automatic updates, full curriculum, and embedded AI are not part of this build yet. Publication remains a separate review checkpoint.

## License and contributions

The app's original source code and associated course documentation are licensed under the [MIT License](LICENSE). Dependencies retain their own licenses.

You may use, modify, and redistribute this project, including commercially, while preserving the required copyright and license notice. Sharing modifications back here is welcome, but not required by MIT. See [CONTRIBUTING.md](CONTRIBUTING.md) for how to propose improvements.

## Technical choices

Electron desktop window; bundled HTML/CSS/JavaScript; a restricted preload interface for local progress and allowlisted source links. No remote executable content or external API service is loaded by the application. No production JavaScript framework is required.

References: [Electron installation](https://www.electronjs.org/docs/latest/tutorial/installation), [Electron security guidance](https://www.electronjs.org/docs/latest/tutorial/security).
