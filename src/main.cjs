const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { createStore } = require("./store.cjs");

const testMode = process.env.QUEST_TEST_MODE === "1";
if (testMode && process.env.QUEST_TEST_DATA) app.setPath("userData", process.env.QUEST_TEST_DATA);
app.setName("AI Discovery Quest");
if (process.platform === "win32") app.setAppUserModelId("io.github.mahmoud-draidi.ai-discovery-quest");
let store;
let quitting = false;
const page = pathToFileURL(path.join(__dirname, "index.html")).href;
const allowedSources = new Set([
  "https://learn.chatgpt.com/docs/skills-and-plugins",
  "https://learn.chatgpt.com/docs/prompting"
]);

function validateSender(event) {
  if (event.senderFrame?.url !== page) throw new Error("Unrecognized application page.");
}
async function createWindow() {
  const win = new BrowserWindow({
    title: "AI Discovery Quest", width: 1240, height: 860, minWidth: 620, minHeight: 560,
    backgroundColor: "#171919", autoHideMenuBar: true,
    show: !testMode || process.env.QUEST_TEST_SHOW === "1",
    webPreferences: { preload: path.join(__dirname, "preload.cjs"), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  win.webContents.on("will-navigate", event => event.preventDefault());
  await win.loadFile(path.join(__dirname, "index.html"));
}
const primaryInstance = app.requestSingleInstanceLock();
if (!primaryInstance) {
  app.quit();
} else {
app.on("second-instance", () => {
  const win = BrowserWindow.getAllWindows()[0];
  if (win) {
    if (win.isMinimized()) win.restore();
    win.show();
    win.focus();
  }
});
app.whenReady().then(async () => {
  store = createStore(app.getPath("userData"));
  ipcMain.handle("quest:load", event => { validateSender(event); return store.load(); });
  ipcMain.handle("quest:save", (event, value) => { validateSender(event); return store.save(value); });
  ipcMain.handle("quest:source", (event, url) => {
    validateSender(event);
    if (!allowedSources.has(url)) throw new Error("Unknown source link.");
    return shell.openExternal(url);
  });
  await createWindow();
  app.on("activate", () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
});
app.on("before-quit", event => {
  if (quitting || !store) return;
  event.preventDefault();
  quitting = true;
  store.flush().catch(() => {}).finally(() => app.quit());
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
}
