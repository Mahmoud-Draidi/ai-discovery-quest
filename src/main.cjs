const { app, BrowserWindow, ipcMain, shell, dialog } = require("electron");
const path = require("node:path");
const fs = require("node:fs/promises");
const { pathToFileURL } = require("node:url");
const { createStore } = require("./store.cjs");
const { sources } = require("./course.js");

const testMode = process.env.QUEST_TEST_MODE === "1";
if (testMode && process.env.QUEST_TEST_DATA) app.setPath("userData", process.env.QUEST_TEST_DATA);
app.setName("AI Discovery Quest");
if (process.platform === "win32") app.setAppUserModelId("io.github.mahmoud-draidi.ai-discovery-quest");
let store;
let primaryWindow;
let companionWindow;
let companionData = { key: "none", title: "Practice companion", text: "Open a practice step in the main window.", readOnly: true };
let quitting = false;
const page = pathToFileURL(path.join(__dirname, "index.html")).href;
const allowedSources = new Set([
  "https://learn.chatgpt.com/docs/skills-and-plugins",
  "https://learn.chatgpt.com/docs/prompting",
  "https://learn.chatgpt.com/docs/projects",
  "https://learn.chatgpt.com/docs/agent-configuration/agents-md",
  "https://learn.chatgpt.com/docs/use-chatgpt",
  ...Object.values(sources).map(source => source[1])
]);

function validateSender(event) {
  if (event.senderFrame?.url !== page) throw new Error("Unrecognized application page.");
}
async function createWindow() {
  const win = new BrowserWindow({
    title: "AI Discovery Quest", width: 1240, height: 860, minWidth: 620, minHeight: 560,
    backgroundColor: "#212121", icon:path.join(__dirname,"assets","quest-logo.png"), autoHideMenuBar: true,
    show: !testMode || process.env.QUEST_TEST_SHOW === "1",
    webPreferences: { preload: path.join(__dirname, "preload.cjs"), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  primaryWindow = win;
  win.on("closed", () => { primaryWindow = null; if (companionWindow && !companionWindow.isDestroyed()) companionWindow.close(); });
  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  win.webContents.on("will-navigate", event => event.preventDefault());
  await win.loadFile(path.join(__dirname, "index.html"));
}
const primaryInstance = app.requestSingleInstanceLock();
if (!primaryInstance) {
  app.quit();
} else {
app.on("second-instance", () => {
  const win = primaryWindow;
  if (win) {
    if (win.isMinimized()) win.restore();
    win.show();
    win.focus();
  }
});
app.whenReady().then(async () => {
  store = createStore(app.getPath("userData"));
  function updateCompanion(value) {
    // Only the primary lesson renderer supplies bounded text, never arbitrary HTML or navigation.
    const data = {};
    for (const key of ["key", "title", "text", "prompt", "check", "materials", "sample", "expected", "failure", "recovery"]) data[key] = typeof value?.[key] === "string" ? value[key].slice(0, 12000) : "";
    data.checked = value?.checked === true; data.readOnly = value?.readOnly === true;
    data.canNext = value?.canNext === true; data.canNotes = value?.canNotes === true;
    companionData = data;
    if (companionWindow && !companionWindow.isDestroyed()) companionWindow.webContents.send("quest:companion-data", data);
  }
  ipcMain.handle("quest:companion-update", (event, value) => { validateSender(event); updateCompanion(value); });
  ipcMain.handle("quest:companion-open", async (event, value) => {
    validateSender(event); updateCompanion(value);
    if (companionWindow && !companionWindow.isDestroyed()) { companionWindow.show(); companionWindow.focus(); return; }
    companionWindow = new BrowserWindow({title:"AI Discovery Quest · Practice companion",icon:path.join(__dirname,"assets","quest-logo.png"),width:440,height:650,minWidth:340,minHeight:400,alwaysOnTop:true,autoHideMenuBar:true,backgroundColor:"#212121",show:!testMode||process.env.QUEST_TEST_SHOW==="1",webPreferences:{preload:path.join(__dirname,"companion-preload.cjs"),contextIsolation:true,nodeIntegration:false,sandbox:true}});
    companionWindow.webContents.setWindowOpenHandler(()=>({action:"deny"}));
    companionWindow.webContents.on("will-navigate",event=>event.preventDefault());
    companionWindow.on("closed",()=>{companionWindow=null;});
    await companionWindow.loadFile(path.join(__dirname,"companion.html"));
  });
  function validateCompanion(event) {
    if (!companionWindow || event.sender !== companionWindow.webContents || event.senderFrame?.url !== pathToFileURL(path.join(__dirname,"companion.html")).href) throw new Error("Unrecognized companion.");
  }
  ipcMain.handle("quest:companion-load", event => {validateCompanion(event);return companionData;});
  ipcMain.handle("quest:companion-check", (event, value) => {
    validateCompanion(event);
    if (value?.key !== companionData.key || companionData.readOnly || typeof value?.checked !== "boolean") return;
    if (primaryWindow && !primaryWindow.isDestroyed()) primaryWindow.webContents.send("quest:companion-check", {key:value.key,checked:value.checked});
  });
  ipcMain.handle("quest:companion-pin", (event, value) => {validateCompanion(event);companionWindow.setAlwaysOnTop(value===true);});
  ipcMain.handle("quest:companion-action", (event, value) => {
    validateCompanion(event);
    if (value?.key !== companionData.key || !["next", "notes", "return"].includes(value?.action)) return;
    if (value.action === "next" && !companionData.canNext || value.action === "notes" && !companionData.canNotes) return;
    if (!primaryWindow || primaryWindow.isDestroyed()) return;
    primaryWindow.webContents.send("quest:companion-action", {key:value.key,action:value.action});
    if (value.action !== "next") { primaryWindow.show(); primaryWindow.focus(); companionWindow.hide(); }
  });
  ipcMain.handle("quest:info", event => { validateSender(event); return {version:app.getVersion(),packaged:app.isPackaged}; });
  ipcMain.handle("quest:load", event => { validateSender(event); return store.load(); });
  ipcMain.handle("quest:save", (event, value) => { validateSender(event); return store.save(value); });
  ipcMain.handle("quest:export", async event => {
    validateSender(event);
    await store.flush();
    const progress = await store.load();
    const result = await dialog.showSaveDialog(BrowserWindow.fromWebContents(event.sender), {
      title: "Export personal learning backup", defaultPath: "AI-Discovery-Quest-progress.json", filters: [{ name: "Progress backup", extensions: ["json"] }]
    });
    if (result.canceled || !result.filePath) return false;
    await fs.writeFile(result.filePath, JSON.stringify({ kind: "ai-discovery-quest", exportedAt: new Date().toISOString(), progress }, null, 2), "utf8");
    return true;
  });
  ipcMain.handle("quest:import", async (event, value) => {
    validateSender(event);
    await store.flush();
    const previous = await store.load();
    await fs.mkdir(app.getPath("userData"), { recursive: true });
    await fs.writeFile(path.join(app.getPath("userData"), `progress-before-import-${Date.now()}.json`), JSON.stringify(previous, null, 2), { encoding: "utf8", flag: "wx" });
    return store.save(value);
  });
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
