const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");

async function build() {
  if (process.platform !== "win32" || process.arch !== "x64") throw new Error("This build targets Windows x64. Run it on Windows x64.");
  const root = path.resolve(__dirname, "..");
  const pkg = JSON.parse(await fs.readFile(path.join(root, "package.json"), "utf8"));
  if (!/^\d+\.\d+\.\d+$/.test(pkg.version)) throw new Error("Expected a simple numeric app version.");
  const base = `AI-Discovery-Quest-${pkg.version}-windows-x64`;
  const dist = path.join(root, "dist");
  const output = path.join(dist, base);
  if (!output.startsWith(dist + path.sep)) throw new Error("Invalid output directory.");
  try { await fs.access(output); throw new Error(`Build directory already exists: ${output}. Preserve or remove the old generated build deliberately before rebuilding.`); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  const electronExe = require("electron");
  const electronDist = path.dirname(electronExe);
  console.log("Copying the official Electron runtime…");
  await fs.mkdir(dist, { recursive: true });
  await fs.cp(electronDist, output, { recursive: true });
  await fs.rename(path.join(output, "electron.exe"), path.join(output, "AI Discovery Quest.exe"));
  await fs.rename(path.join(output, "electron_wer.dll"), path.join(output, "AI Discovery Quest_wer.dll"));
  const app = path.join(output, "resources", "app");
  await fs.mkdir(app, { recursive: true });
  // Only the runtime source and public app license enter this payload.
  await fs.cp(path.join(root, "src"), path.join(app, "src"), { recursive: true });
  await fs.copyFile(path.join(root, "LICENSE"), path.join(app, "LICENSE"));
  await fs.copyFile(path.join(root, "LICENSE"), path.join(output, "APP-LICENSE.txt"));
  const runtimePackage = { name: pkg.name, version: pkg.version, main: pkg.main, description: pkg.description, license: pkg.license };
  await fs.writeFile(path.join(app, "package.json"), JSON.stringify(runtimePackage, null, 2));
  const commit = spawnSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" });
  const dirty = spawnSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8" });
  if (commit.status !== 0 || dirty.status !== 0) throw new Error("Cannot read the source revision.");
  await fs.writeFile(path.join(output, "BUILD-INFO.json"), JSON.stringify({
    name: pkg.name, version: pkg.version, platform: "win32", arch: "x64",
    sourceCommit: commit.stdout.trim(), sourceDirty: !!dirty.stdout.trim(),
    electron: JSON.parse(await fs.readFile(path.join(root, "node_modules", "electron", "package.json"), "utf8")).version,
    builtAt: new Date().toISOString()
  }, null, 2));
  await fs.writeFile(path.join(output, "START-HERE.txt"), [
    "AI Discovery Quest — Windows x64", "",
    "1. Extract the entire ZIP to a folder. Do not run the app from inside the ZIP.",
    "2. Open AI Discovery Quest.exe. Keep the surrounding files and folders together.",
    "3. Open Learning journey to explore the course, or Continue where I left off.", "",
    "No Node.js, developer tools, AI API key, or installation is needed to read the bundled course.",
    "Practical exercises use real AI tools and may require relevant accounts or runtimes.",
    "This app guides practice and tracks learning; it does not replace those tools with an AI coach.",
    "Source links require internet access.",
    "Your notes and progress are saved on your PC in %APPDATA%/AI Discovery Quest/progress.json.",
    "Portable here means no installation; notes are not stored beside the EXE or synced.",
    "Progress & backups supports local backup/import and prior-practice records without fabricating quiz answers.",
    "Close any older version and export a backup before updating; versions share saved progress.",
    "This app is unsigned. It does not have a verified publisher signature.",
    "Source and MIT license: https://github.com/Mahmoud-Draidi/ai-discovery-quest", "",
    "APP-LICENSE.txt covers this app. LICENSE and LICENSES.chromium.html retain runtime notices.",
    "This is not an installer and does not update automatically.", ""
  ].join("\r\n"));
  console.log("Creating the downloadable ZIP…");
  const psQuote = text => "'" + text.replace(/'/g, "''") + "'";
  const zipPath = path.join(dist, base + ".zip");
  const powershell = path.join(process.env.SystemRoot || "C:\\Windows", "System32", "WindowsPowerShell", "v1.0", "powershell.exe");
  const zipCommand = `$ErrorActionPreference = 'Stop'; Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory(${psQuote(output)}, ${psQuote(zipPath)}, [System.IO.Compression.CompressionLevel]::Optimal, $true)`;
  const zip = spawnSync(powershell, ["-NoProfile", "-NonInteractive", "-Command", zipCommand], { stdio: "inherit", windowsHide: true });
  if (zip.status !== 0) throw new Error("ZIP creation failed; preserve the generated folder to investigate.");
  const hash = crypto.createHash("sha256").update(await fs.readFile(zipPath)).digest("hex");
  await fs.writeFile(path.join(dist, "SHA256SUMS.txt"), `${hash}  ${base}.zip\n`);
  console.log(`Built: ${zipPath}`);
  console.log(`SHA-256: ${hash}`);
}
build().catch(error => { console.error(error.message); process.exitCode = 1; });
