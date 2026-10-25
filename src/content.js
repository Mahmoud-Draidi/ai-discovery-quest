(function (root) {
  const content = {
    concepts: [
      { name: "Model", verb: "Interprets & reasons", text: "The AI that interprets your request and works out a response or next step.", example: "You ask for dinner ideas. The model suggests a meal using ingredients you already have." },
      { name: "Tool", verb: "Performs an action", text: "A capability the assistant uses to act, such as searching the web or creating a file.", example: "A search tool checks today's opening hours for a nearby grocery store." },
      { name: "Skill", verb: "Guides a repeatable task", text: "Reusable instructions that guide the assistant through a particular kind of task.", example: "A meal-planning skill guides dietary questions, a weekly menu, and a shopping list." }
    ],
    questions: [
      { id: "q1", prompt: "You ask for dinner ideas. What interprets your request and decides what to suggest?", correct: 0, explanation: "The model interprets the request and reasons about a response. A tool may help it take an action." },
      { id: "q2", prompt: "The assistant checks a store's current opening hours using web search. What performs that search?", correct: 1, explanation: "The search tool performs the action. The model decides how to use its result." },
      { id: "q3", prompt: "A reusable checklist tells the assistant how to review an essay. What is that checklist?", correct: 2, explanation: "A skill supplies reusable instructions for a type of task. It isn't the model or the action-performing tool." }
    ],
    library: [
      { title: "Model, tool, or skill?", tag: "Core concepts", text: "The model interprets and reasons; a tool performs an action; a skill provides reusable instructions. They can work together on the same task." },
      { title: "Did it actually create my file?", tag: "Verification", text: "An answer saying it created a file is a claim. Open the actual file, inspect the content, and check its location. Tool activity can help explain what happened." },
      { title: "Does naming a folder grant access?", tag: "Context", text: "No. A path identifies a location. The assistant still needs permission and a tool that can access it. Attach files or open a supported workspace when necessary." },
      { title: "What if my chat cannot create files?", tag: "Troubleshooting", text: "Ask for the note's text, save it yourself in a text editor, and record that limitation. This alternative practices the concepts but not AI-operated file creation." },
      { title: "Can I trust completion just because AI says so?", tag: "Practical habit", text: "Inspect the output. For a file task, open the file. For a calculation, check an example. Distinguish actions you observed from explanations you only read." }
    ],
    roadmap: ["Prompting & verification", "Files, context & memory", "Research & artifacts", "Browser & computer use", "Plugins, MCP & skills", "Plans, goals & schedules", "Coding, Git & GitHub", "Worktrees & cloud", "Subagents & coordinated chats", "Hooks & automation"]
  };
  if (typeof module !== "undefined") module.exports = content;
  else root.QuestContent = content;
})(typeof window !== "undefined" ? window : globalThis);
