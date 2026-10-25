const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("quest", {
  load: () => ipcRenderer.invoke("quest:load"),
  save: value => ipcRenderer.invoke("quest:save", value),
  openSource: url => ipcRenderer.invoke("quest:source", url)
});
