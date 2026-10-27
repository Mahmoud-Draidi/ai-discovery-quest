(function(root){
  const revision='2026.10.27-feature-first-pilot';
  const items=[
    ['controls','Chat, Work, Codex and the model selector','guided','orientation','A Windows walkthrough, observed labels and an I don’t see this route.'],
    ['models','Models, tools and skills','guided','foundation','Create, edit and inspect your first short note.'],
    ['files','Files, attachments and context','guided','context','Supply a real note and test a fresh-chat handoff.'],
    ['memory','Memory and account/project boundaries','guided','memory','Inspect labels without changing memory; test supplied context.'],
    ['projects','Projects and shared sources','outline','context','Explains sources and instructions; a dedicated project-creation walkthrough is still planned.'],
    ['research','Web research and sources','outline','research','A research prompt and inspection checks; detailed troubleshooting is still planned.'],
    ['maps','Maps','outline','feature-lab','Public destinations and a sourced-list alternative.'],
    ['images','Image generation and editing','outline','feature-lab','Separate image-creation and editing mini-lessons, each with its own result and fallback.'],
    ['pdf','PDFs','outline','artifacts','Create and inspect a short PDF from your research.'],
    ['sheets','Spreadsheets','outline','artifacts','Change an input and check a formula result.'],
    ['slides','Presentations','outline','artifacts','Create editable slides and inspect a requested change.'],
    ['visuals','Interactive visuals','outline','artifacts','Build a calculator and check its output.'],
    ['sites','Sites','outline','artifacts','Preview a small learning board; publishing is not taught as a full workflow yet.'],
    ['snapshots','Screenshots and Appshots','outline','seeing','Supply a harmless snapshot and compare the answer with it.'],
    ['browser','Connected browser tabs and in-app browser','outline','seeing','Read an identified tab; detailed browser connection setup is still planned.'],
    ['computer','Computer use','outline','seeing','One harmless Notepad action; availability must be checked in your own app.'],
    ['passwords','Passwords and private sign-in','reference','feature-lab','Inspect descriptions and boundaries. This is not a password-management tutorial.'],
    ['cloud-computer','Graphical cloud computer','outline','feature-lab','A public-page task if hosted graphical access is available.'],
    ['plugins','Plugins, connections and MCP','outline','extensions','Inspect capabilities, resource access and approval policy separately.'],
    ['skills','Reusable skills','outline','extensions','Create and test a bounded recap workflow where supported.'],
    ['gpts','GPTs and reusable assistants','outline','feature-lab','Try an existing reusable assistant. GPT creation is not a full tutorial here.'],
    ['pets','Pets and Mini/Micro controls','outline','feature-lab','Try an available shortcut. Copy your client’s actual label; names can vary.'],
    ['voice','Voice and dictation','outline','seeing','Separate voice and dictation practice outlines, with expected results and availability checks.'],
    ['plans','Plan mode and goals','outline','control','Propose a bounded plan, then inspect implementation and its stopping point.'],
    ['usage','Context, tokens and usage limits','reference','control','Interpret observed counters; no measured cost-optimization lab yet.'],
    ['git','Git and local branches','outline','coding','Create the tracker, inspect diffs, commit, branch and try a targeted undo.'],
    ['github','GitHub and pull requests','outline','github','Publish a practice branch and inspect a draft PR and review exchange.'],
    ['review','Code review','outline','github','Review the tracker against requirements. A disclosed empty-input defect, regression test and repair are available in the worked lab.'],
    ['worktrees','Worktrees','outline','environments','Compare two separate copies; setup help is still being expanded.'],
    ['cloud','Codex Cloud and environments','outline','environments','A worked local/worktree/cloud lab includes the environment selection/creation path, source/runtime checks and recovery.'],
    ['subagents','Parallel subagents','outline','delegation','A supplied tracker, two bounded read-only reviews, explicit waiting, received findings and a synthesis example.'],
    ['handoff','Planner/implementer model handoff','outline','delegation','A complete percentage contract, plan/implementation handoff, four checks and configuration/usage evidence; no promised savings.'],
    ['chats','Coordinated chats and messaging','outline','delegation','A waiting receiver, self-contained contract, chosen delivery route and verified receipt/result.'],
    ['schedule','Scheduled tasks','outline','capstone','A feature-first pilot covers finding Scheduled, creating a simple learning task, inspecting its run, editing and pausing it. Other course material is awaiting rewrite.'],
    ['hooks','Hooks','outline','automation','A supplied local logger, manual versus real lifecycle evidence, reviewed project scope and verified demo cleanup.'],
    ['glossary','Glossary beside the current task','reference',null,'Twenty short definitions and course examples open beside your lesson. Close to return to the same place.'],
    ['mini-lessons','Independent feature mini-lessons','outline',null,'Each practical activity has its own entry, availability and result. Chapter completion and XP remain separate.']
  ].map(([id,title,status,chapter,detail])=>({id,title,status,chapter,detail}));
  const labels={guided:'Guided tutorial',outline:'Practice outline',reference:'Introduction / reference',planned:'Planned'};
  function clean(value){return typeof value==='string'?value.replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,100):'';}
  function normalizeSetup(raw={}){
    const pick=(key,values)=>values.includes(raw?.[key])?raw[key]:'unknown';
    return {complete:raw?.complete===true,surface:pick('surface',['windows','web','other','unknown']),workflow:pick('workflow',['chat','work','codex','unknown']),experience:pick('experience',['new','returning','unknown']),modeLabel:clean(raw?.modeLabel),modelLabel:clean(raw?.modelLabel),files:pick('files',['available','unavailable','unknown'])};
  }
  function inventoryPrompt(raw){
    const setup=normalizeSetup(raw);
    return `I am learning AI. Here is what I actually observed.\nApp: ${({windows:'ChatGPT Windows app',web:'ChatGPT in a browser',other:'Another AI app',unknown:'Not sure'})[setup.surface]}.\nMode label: ${setup.modeLabel || 'Not found'}.\nModel label: ${setup.modelLabel || 'Not found'}.\nExplain these labels simply, with one example. If a label is missing, tell me what remains unknown and ask one short question. Do not claim you can see my screen or know my account features. Do not change settings or install anything.`;
  }
  const api={revision,items,labels,normalizeSetup,inventoryPrompt};
  if(typeof module!=='undefined')module.exports=api;else root.QuestLearningMap=api;
})(typeof window!=='undefined'?window:globalThis);
