const {contextBridge,ipcRenderer}=require("electron");
contextBridge.exposeInMainWorld("companion",{
  load:()=>ipcRenderer.invoke("quest:companion-load"),
  check:value=>ipcRenderer.invoke("quest:companion-check",value),
  pin:value=>ipcRenderer.invoke("quest:companion-pin",value),
  action:value=>ipcRenderer.invoke("quest:companion-action",value),
  onUpdate:callback=>ipcRenderer.on("quest:companion-data",(_event,value)=>callback(value))
});
