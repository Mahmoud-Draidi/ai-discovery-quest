(function(root) {
  // Study estimates include reading, practice and the knowledge check, not downloads or account setup.
  const minutes = {
    orientation:[10,15], foundation:[15,20], context:[20,30], memory:[15,20],
    "feature-lab":[30,45], prompting:[15,20], research:[20,30], artifacts:[45,60],
    seeing:[20,30], extensions:[30,45], control:[20,30], coding:[40,60],
    github:[40,60], environments:[30,45], delegation:[30,45], automation:[30,45], capstone:[60,90]
  };
  const levels = [
    {percent:0,title:"AI Newcomer"}, {percent:20,title:"AI Explorer"},
    {percent:40,title:"AI Practitioner"}, {percent:60,title:"AI Builder"},
    {percent:80,title:"AI Navigator"}, {percent:100,title:"AI Trailblazer"}
  ];
  function estimate(id) { const range=minutes[id]; return range ? `About ${range[0]}–${range[1]} min` : "Flexible pace"; }
  function reward(complete,total) {
    const count=Math.max(0,Math.min(total,complete));
    const percent=total>0?Math.round(count/total*100):0;
    const index=total>0?levels.reduce((best,level,i)=>count>=Math.ceil(total*level.percent/100)?i:best,0):0;
    const xp=count*100, floor=Math.ceil(total*levels[index].percent/100)*100;
    const next=index<levels.length-1?Math.ceil(total*levels[index+1].percent/100)*100:null;
    return {level:index+1,title:levels[index].title,xp,percent,complete:count,total,
      nextTitle:next===null?null:levels[index+1].title,xpToNext:next===null?0:next-xp,
      levelPercent:next===null?100:next>floor?Math.max(0,Math.min(100,Math.round((xp-floor)/(next-floor)*100))):0};
  }
  function greeting(hour) { return hour<12?"Good morning":hour<18?"Good afternoon":"Good evening"; }
  const api={minutes,levels,estimate,reward,greeting};
  if(typeof module!=="undefined")module.exports=api;else root.QuestJourney=api;
})(typeof window!=="undefined"?window:globalThis);
