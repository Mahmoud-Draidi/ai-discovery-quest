const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("quest", {
  load: () => ipcRenderer.invoke("quest:load"),
  save: value => ipcRenderer.invoke("quest:save", value),
  openSource: url => ipcRenderer.invoke("quest:source", url),
  exportProgress: () => ipcRenderer.invoke("quest:export"),
  importProgress: value => ipcRenderer.invoke("quest:import", value),
  openCompanion: value => ipcRenderer.invoke("quest:companion-open", value),
  updateCompanion: value => ipcRenderer.invoke("quest:companion-update", value),
  onCompanionCheck: callback => ipcRenderer.on("quest:companion-check", (_event, value) => callback(value)),
  onCompanionAction: callback => ipcRenderer.on("quest:companion-action", (_event, value) => callback(value))
});
