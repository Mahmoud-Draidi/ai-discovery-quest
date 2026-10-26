(function (root) {
  const content = {
  "concepts": [
    {
      "name": "Model",
      "verb": "Interprets & reasons",
      "text": "The AI that interprets your request and works out a response or next step.",
      "example": "You ask for dinner ideas. The model suggests a meal using ingredients you already have."
    },
    {
      "name": "Tool",
      "verb": "Performs an action",
      "text": "A capability the assistant uses to act, such as searching the web or creating a file.",
      "example": "A search tool checks today's opening hours for a nearby grocery store."
    },
    {
      "name": "Skill",
      "verb": "Guides a repeatable task",
      "text": "Reusable instructions that guide the assistant through a particular kind of task.",
      "example": "A meal-planning skill guides dietary questions, a weekly menu, and a shopping list."
    }
  ],
  "questions": [
    {
      "id": "q1",
      "prompt": "You ask for dinner ideas. What interprets your request and decides what to suggest?",
      "correct": 0,
      "explanation": "The model interprets the request and reasons about a response. A tool may help it take an action.",
      "feedback": [
        "The model interprets the request and reasons about a response. A tool may help it take an action.",
        "A tool serves a different role here. The model interprets the request and reasons about a response. A tool may help it take an action.",
        "A skill serves a different role here. The model interprets the request and reasons about a response. A tool may help it take an action."
      ]
    },
    {
      "id": "q2",
      "prompt": "The assistant checks a store's current opening hours using web search. What performs that search?",
      "correct": 1,
      "explanation": "The search tool performs the action. The model decides how to use its result.",
      "feedback": [
        "A model serves a different role here. The search tool performs the action. The model decides how to use its result.",
        "The search tool performs the action. The model decides how to use its result.",
        "A skill serves a different role here. The search tool performs the action. The model decides how to use its result."
      ]
    },
    {
      "id": "q3",
      "prompt": "A reusable checklist tells the assistant how to review an essay. What is that checklist?",
      "correct": 2,
      "explanation": "A skill supplies reusable instructions for a type of task. It isn't the model or the action-performing tool.",
      "feedback": [
        "A model serves a different role here. A skill supplies reusable instructions for a type of task. It isn't the model or the action-performing tool.",
        "A tool serves a different role here. A skill supplies reusable instructions for a type of task. It isn't the model or the action-performing tool.",
        "A skill supplies reusable instructions for a type of task. It isn't the model or the action-performing tool."
      ]
    }
  ],
  "library": [
    {
      "title": "Model, tool, or skill?",
      "tag": "Core concepts",
      "text": "The model interprets and reasons; a tool performs an action; a skill provides reusable instructions. They can work together on the same task."
    },
    {
      "title": "Did it actually create my file?",
      "tag": "Verification",
      "text": "An answer saying it created a file is a claim. Open the actual file, inspect the content, and check its location. Tool activity can help explain what happened."
    },
    {
      "title": "Does naming a folder grant access?",
      "tag": "Context",
      "text": "No. A path identifies a location. The assistant still needs permission and a tool that can access it. Attach files or open a supported workspace when necessary."
    },
    {
      "title": "What if my chat cannot create files?",
      "tag": "Troubleshooting",
      "text": "Ask for the note's text, save it yourself in a text editor, and record that limitation. This alternative practices the concepts but not AI-operated file creation."
    },
    {
      "title": "Can I trust completion just because AI says so?",
      "tag": "Practical habit",
      "text": "Inspect the output. For a file task, open the file. For a calculation, check an example. Distinguish actions you observed from explanations you only read."
    }
  ],
  "context": {
    "title": "Files, context, and continuity",
    "questions": [
      {
        "id": "context1",
        "prompt": "A note exists in your project folder. What is a useful next step when asking about its contents?",
        "choices": [
          "Assume every word is already in the chat",
          "Ask the assistant to read that note using its available file access, or attach it",
          "Enable automatic memory first"
        ],
        "correct": 1,
        "explanation": "A file's location and its use in a task are different. Supply access and ask for a source-grounded answer; inspect the note to check it.",
        "feedback": [
          "This choice assumes assume every word is already in the chat. A file's location and its use in a task are different. Supply access and ask for a source-grounded answer; inspect the note to check it.",
          "A file's location and its use in a task are different. Supply access and ask for a source-grounded answer; inspect the note to check it.",
          "This choice assumes enable automatic memory first. A file's location and its use in a task are different. Supply access and ask for a source-grounded answer; inspect the note to check it."
        ]
      },
      {
        "id": "context2",
        "prompt": "A new chat correctly resumes from your saved progress note. What does that demonstrate?",
        "choices": [
          "It recovered useful context from the supplied record",
          "It received every message from the original chat",
          "It enabled account-wide memory"
        ],
        "correct": 0,
        "explanation": "The record can supply enough context to resume. This does not prove that the new chat inherited the full original conversation.",
        "feedback": [
          "The record can supply enough context to resume. This does not prove that the new chat inherited the full original conversation.",
          "This choice assumes it received every message from the original chat. The record can supply enough context to resume. This does not prove that the new chat inherited the full original conversation.",
          "This choice assumes it enabled account-wide memory. The record can supply enough context to resume. This does not prove that the new chat inherited the full original conversation."
        ]
      },
      {
        "id": "context3",
        "prompt": "You want future chats to teach one step at a time. Where should this preference go?",
        "choices": [
          "Only in the filename of your note",
          "Only in an unrelated old chat",
          "In supported project instructions, with progress recorded separately"
        ],
        "correct": 2,
        "explanation": "Instructions guide behavior; progress records describe what happened and what comes next. Use your product's supported instruction mechanism; memory need not be enabled for this exercise.",
        "feedback": [
          "This choice assumes only in the filename of your note. Instructions guide behavior; progress records describe what happened and what comes next. Use your product's supported instruction mechanism; memory need not be enabled for this exercise.",
          "This choice assumes only in an unrelated old chat. Instructions guide behavior; progress records describe what happened and what comes next. Use your product's supported instruction mechanism; memory need not be enabled for this exercise.",
          "Instructions guide behavior; progress records describe what happened and what comes next. Use your product's supported instruction mechanism; memory need not be enabled for this exercise."
        ]
      }
    ],
    "steps": [
      {
        "title": "Bring your first note",
        "text": "Use the note you created in chapter 1. In a file-capable workspace, ask the assistant to locate it; in an attachment-based chat, attach the actual file. A filename or local path alone does not give a web chat access to your computer.",
        "prompt": "Help me locate MY-FIRST-NOTE.md in this workspace. Tell me whether you can read it. If you cannot access it, ask me to attach it; do not guess its contents.",
        "check": "I supplied the actual note through a supported attachment or accessible workspace.",
        "hint": "If you have not created a note yet, copy the sample below, save it as MY-FIRST-NOTE.md, and supply that file to your assistant."
      },
      {
        "title": "Read it and check the answer",
        "text": "Ask a question about an example in the note, then open the actual note and compare the answer. This checks whether the response matches the source, not merely whether it sounds plausible.",
        "prompt": "Read MY-FIRST-NOTE.md. What everyday example does it give for a tool? Identify the file you used. If you cannot read it, say so.",
        "check": "I compared the answer with the actual tool example in my note.",
        "hint": "The supplied sample uses a search tool checking a grocery store's opening hours. Your note may have a different example; compare with your actual file. A correct answer alone is not proof of how the assistant obtained it. Inspect file/tool activity where available."
      },
      {
        "title": "Keep instructions and progress",
        "text": "Save teaching preferences in project instructions and completed work in PROGRESS.md. Codex supports AGENTS.md; other products may have project-instruction settings instead. Use a practice project, preserve existing content, and inspect proposed changes before saving.",
        "prompt": "Help me save this preference in this practice project's supported instructions: Treat me as a beginner, explain unfamiliar terms, and teach one manageable step at a time. Also create or update PROGRESS.md to record that I created/read the first note and checked its tool example. Next step: explain the difference between instructions and progress. Preserve existing content, show proposed changes first, and tell me where each item belongs. Do not change machine-wide settings.",
        "check": "I inspected the saved project preference and progress record and confirmed they describe my actual work.",
        "hint": "Review the proposed edits, ask it to save the agreed changes, then open the saved result. If the assistant cannot write files, save the progress text yourself and use project-instruction settings where supported. If those settings are unavailable, supply the preference explicitly in the next chat and record that limitation. Do not claim persistent instructions were tested."
      },
      {
        "title": "Resume in another chat",
        "text": "Start a new chat with your saved instructions and progress record. Compare its summary with those records and correct missing or stale details. Shared files can help you resume without assuming that every chat shares the full transcript.",
        "prompt": "Read the supplied project instructions and PROGRESS.md. What teaching preferences should you follow, what have I actually completed, and what is the next step? Name the records you used. Tell me if a needed record is missing; do not infer completed exercises.",
        "check": "In a new chat, I supplied the records and compared its summary with them, correcting stale or missing information.",
        "hint": "Start a separate chat in the same supported project, or attach the records and supply your preference there. Check the files again if the answer is stale. This tests record-based continuity, not automatic memory. Enabling memory is not required."
      }
    ],
    "sampleNote": "A model is the AI that interprets your request and works out a response or next step.\nExample: You ask for dinner ideas, and the model suggests a meal using ingredients you already have.\n\nA tool lets the AI perform an action, such as searching the web or creating a file.\nExample: A search tool checks today's opening hours for your nearby grocery store.\n\nA skill is a reusable set of instructions that guides the AI through a particular kind of task.\nExample: A meal-planning skill guides dietary questions, a week's meals, and a shopping list.",
    "library": [
      {
        "title": "Is every project file already read?",
        "tag": "Context",
        "text": "File access makes a source available; it does not prove the assistant read every file for this task. Ask it to read the relevant source and compare its answer with that source. Attach a file when the chat cannot access its local folder."
      },
      {
        "title": "Do separate chats share everything?",
        "tag": "Continuity",
        "text": "Do not assume full transcripts transfer between chats. Supply the instructions and progress records the next chat needs, ask it to read them, and check its summary against the saved facts."
      },
      {
        "title": "Instructions, progress, or memory?",
        "tag": "Instructions",
        "text": "Instructions describe how to work. A progress note records completed actions and the next step. Memory is a separate product capability with its own settings and scope. File-based resumption does not require enabling it."
      }
    ],
    "sources": [
      {
        "label": "OpenAI · Projects and chats",
        "url": "https://learn.chatgpt.com/docs/projects"
      },
      {
        "label": "OpenAI · Project instructions with AGENTS.md",
        "url": "https://learn.chatgpt.com/docs/agent-configuration/agents-md"
      },
      {
        "label": "OpenAI · Bringing files into a chat",
        "url": "https://learn.chatgpt.com/docs/use-chatgpt"
      }
    ]
  }
};
  if (typeof module !== "undefined") module.exports = content;
  else root.QuestContent = content;
})(typeof window !== "undefined" ? window : globalThis);
