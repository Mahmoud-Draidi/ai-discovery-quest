let current;
function show(data){
  current=data;
  for(const key of ["title","text","prompt"])document.getElementById(key).textContent=data[key]||"";
  document.getElementById("check-label").textContent=data.check||"Use the main window to continue.";
  document.getElementById("check").checked=data.checked===true;
  document.getElementById("check").disabled=data.readOnly===true;
  document.getElementById("copy").disabled=!data.prompt;
  document.getElementById("next").disabled=!data.canNext;
  document.getElementById("notes").disabled=!data.canNotes;
  document.getElementById("copy-result").textContent="";
}
window.companion.onUpdate(show);
window.companion.load().then(show);
document.getElementById("check").addEventListener("change",async event=>{try{await window.companion.check({key:current.key,checked:event.target.checked});}catch{document.getElementById("copy-result").textContent="Return to the main window to record this step.";}});
document.getElementById("pin").addEventListener("change",event=>window.companion.pin(event.target.checked));
document.getElementById("copy").addEventListener("click",async()=>{
  try{await navigator.clipboard.writeText(current.prompt);document.getElementById("copy-result").textContent="Copied. Paste into your AI tool.";}
  catch{document.getElementById("copy-result").textContent="Select the prompt and copy it manually.";}
});
for (const action of ["next", "notes", "return"]) document.getElementById(action).addEventListener("click",async()=>{
  try { await window.companion.action({key:current.key,action}); }
  catch { document.getElementById("copy-result").textContent="Return to the main lesson to continue."; }
});
