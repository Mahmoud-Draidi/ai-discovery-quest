const fs=require('node:fs');
const path=require('node:path');
const course=require('../src/course.js');
const basics={foundation:{title:'Models, tools, and skills',preparation:'An AI chat and a text editor, or a file-capable workspace after the app tour.',steps:[{title:'Create a first note and inspect the definitions and everyday examples'},{title:'Request an edit and inspect the saved result'},{title:'Identify model, tool, and reusable instructions'}]},context:{title:'Files, context, and continuity',preparation:'The first note or the supplied sample, plus an upload-capable chat or accessible workspace.',steps:require('../src/content.js').context.steps}};
const title=id=>basics[id]?.title||course.chapters.find(ch=>ch.id===id).title;
const lines=['# AI course guide','','A practical course for using real AI tools. Follow Understand → Try it → Check, inspect actual results, and keep private notes. No knowledge of the authors is needed.','','This guide is generated from course data with `node scripts/generate-course-guide.cjs`. Do not maintain a separate chapter count or duplicate lesson list.','','## Course route',''];
for(const id of course.order){
 const ch=basics[id]||course.chapters.find(ch=>ch.id===id);
 lines.push(`- **${ch.title}**`);
}
lines.push('','## Preparation and practice','');
for(const id of course.order){
 const ch=basics[id]||course.chapters.find(ch=>ch.id===id);
 lines.push(`### ${ch.title}`,'',ch.preparation,'');
 if(ch.prerequisites?.length)lines.push('Bring: '+ch.prerequisites.map(title).join('; ')+'. Equivalent work is accepted; prerequisites guide rather than lock the route.','');
 if(ch.projectTask)lines.push('Project thread: '+ch.projectTask,'');
 for(const step of ch.steps)lines.push('- '+step.title);
 lines.push('');
}
lines.push('## Honest progress','','The app records your report; it cannot observe external chats or files. Quizzes alone do not earn practice titles. If tools are missing, defer the individual step and explore another. Deferred/skipped steps stay unfinished; completion requires every practical check. Existing experience is optional and separate from checked practice.','','## Study support','','Use the compact companion from Try it to keep the current step visible beside your AI tool. The companion can stay on top and synchronizes its checkbox with the main lesson; only the main app saves progress. Use Next step to explore without claiming completion, My chapter note to return to the main note editor, or Return to lesson. Practice-step buttons let you revisit unfinished work directly. Use chapter questions/sources, library search and topic filters, and your notes when returning.','','## Capstone','','Extend the same tiny tracker through planning, a worktree, bounded delegation, a pull request and review, and an inspected recurring check. This is different from developing or releasing this learning app.','','## Product availability','','Inspect the mode, account, tool and host before each external task. Labels and capabilities change. Product comparisons are reference unless you actually try them; extra competitor subscriptions are optional. Never paste credentials into lesson notes or chat.','');
const target=path.join(__dirname,'..','COURSE-GUIDE.md');
const result=lines.join('\n');
if(process.argv.includes('--check')){if(fs.readFileSync(target,'utf8').replace(/\r\n/g,'\n')!==result)throw new Error('COURSE-GUIDE.md is stale; run node scripts/generate-course-guide.cjs');}
else fs.writeFileSync(target,result);
