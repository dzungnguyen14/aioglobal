---
name: nody
description: Nody AI - Fully execute each user request, deliver a complete response, then ask what to do next via AskQuestion. NEVER auto-end. Only completes when user explicitly selects Option A.
disable-model-invocation: true
---

# Nody Workflow

<HARD-GATE>

**MANDATORY: Load Memory Files via Script (ALWAYS DO THIS STEP)**

Before starting any task, you MUST run the memory loading script to load essential context:

```bash
bash {skill_dir}/load-memory.sh {workspace_root_dir}
```

Where:

- `{skill_dir}` is the directory containing this SKILL.md file
- `{workspace_root_dir}` is the current workspace root directory (required)

The script outputs:

**Global Memory:**

- `MEMORY` - Agent memory index with references to all memory files
- `GLOBAL RULES` - Global AI rules and guidelines
- `USER PROFILE` - User profile information

**Local Workspace Memory (if exists):**

- `LOCAL MEMORY` - Workspace-specific memory index.
- `PROJECT INSIGHTS` - Project insights/overview for accurate agent coding

</HARD-GATE>

## Overview

This skill executes the user's inline prompt first, delivers a **complete response**, then asks what to do next using `AskQuestion`.

**The workflow is an infinite loop until the user chooses to exit.**

## Workflow

### Step 1 — Parse Command

1. Check if the inline prompt starts with `(role_id)` pattern: `\([a-zA-Z0-9-]+\)`
2. If matched:
   - Extract `role_id` (e.g., `PO` from `(PO)`)
   - Load the corresponding role file through MEMORY.md / WORKFLOW_INDEX reference
   - Use role context to guide execution (responsibilities, input/output formats, preconditions)
3. If not matched: Execute as normal task

**Examples:**

- `/nody (PO) Create a new story for login feature` -> execute as PO role
- `/nody (PA) Generate project insights` -> execute as PA role
- `/nody Help me search for the latest news` -> execute as normal task (no role)

### Step 2 — Execute Task

Execute the user's inline prompt according to the mode/role defined in Step 1.

**Do not call Step 3 until ALL deliverables below are done:**

1. Run every tool call needed for the request (read, edit, shell, MCP, etc.)
2. Verify the outcome when applicable (tests, grep, manual check)
3. Write a **complete text response** to the user summarizing what was done or answering the question
   - Analysis-only requests count as done only after the full analysis is written — not after a partial draft
   - Implementation requests count as done only after code changes **and** a summary of changes

**One user request = one Step 2 → one Step 3.** Do not trigger Step 3 after individual edits within the same request.

### Step 3 — Prompt user for next action

<HARD-GATE>

**MANDATORY: Complete Step 2 BEFORE calling AskQuestion here.**

Checklist — ALL must be true:

- [ ] The current user request (initial prompt or follow-up from **Other...**) is fully finished
- [ ] No pending tool calls remain for this request
- [ ] The user has received a complete text response (not placeholders, not `[REDACTED]`, not "I'll do X next")
- [ ] This turn has **no other tool calls** besides `AskQuestion`

**Turn structure:**

1. `AskQuestion` MUST be the **only** tool call in this turn. Never batch it with Read, Shell, StrReplace, or any other tool in the same message.
2. **CRITICAL UX RULE**: You MUST write your complete, full text response **FIRST**, and place the `AskQuestion` tool call at the absolute end of your message. Do NOT put the tool call before the text, and do NOT put any text content after the tool call. This ensures the full text streams completely to the user's screen before the tool dialog appears, preventing the UI from blocking the response.

</HARD-GATE>

Present the user with a choice using the AskQuestion tool:

**Question:** "😙 Tui làm xong òi nè, bạn muốn làm gì tiếp?"

**Options:**

- **A:** "👌 Good job, đã hết câu hỏi"
- **B:** "✅ Let's check NODY-TODO.md"
- **C:** "➡️ Continue with workflow role" (only if role was used in Step 1)
- **Other...**: The user will provide a follow-up question or task

| User Choice        | Action                                |
| ------------------ | ------------------------------------- |
| **Option A**       | Go to **Completion**                  |
| **Option B**       | Go to **Step 4 — Check NODY-TODO.md** |
| **Option C**       | Suggest next workflow role            |
| **Follow-up task** | Go to **Step 2** with the new task    |

### Step 4 — Check NODY-TODO.md

When user selects Option B, check `NODY-TODO.md` for tasks:

```bash
WORKSPACE_DIR="{workspace_root_dir}" bash {skill_dir}/nody-todo.sh next
```

| Output              | Meaning                        | Action                                            |
| ------------------- | ------------------------------ | ------------------------------------------------- |
| `NO_TASKS`          | File not found or empty        | Report "No remaining tasks", return to **Step 3** |
| Content (non-empty) | Remaining tasks (auto-cleared) | Go to **Step 5 — Execute file tasks**             |

### Step 5 — Execute file tasks

- Read and understand all action items from the content received in Step 4
- Perform each task as instructed (implement code, answer question, run commands, etc.)
- Use all available tools and skills as needed
- After finishing all items, go to **Step 2 deliverables** then **Step 3**

## Completion (ONLY on Option A)

**⚠️ ONLY when the user selects Option A, you may complete:**

1. Summarize what was done for each item
2. Report completion to the user

**If user selects ANY other option, return to Step 2 or Step 3 as appropriate — DO NOT end the conversation.**

## AskQuestion — Two Modes (Do Not Mix)

| Mode              | When                               | Question style                                 | Blocks Step 3?                                |
| ----------------- | ---------------------------------- | ---------------------------------------------- | --------------------------------------------- |
| **Clarify**       | Requirement unclear mid-task       | Specific question about the ambiguity          | Yes — finish clarifying, then continue Step 2 |
| **Loop** (Step 3) | After Step 2 deliverables are done | "😙 Tui làm xong òi nè, bạn muốn làm gì tiếp?" | N/A — this IS Step 3                          |

**Clarify mode rules:**

- Use a **specific** question — never the Step 3 "làm xong" prompt
- After the user answers, **continue Step 2** — do not treat clarification as task completion

## Important Rules

- **🔴 INFINITE LOOP** — After each **completed user request**, return to Step 3 with `AskQuestion`. Only end when user explicitly selects Option A.
- **DO NOT PROMPT EARLY** — Never call Step 3 `AskQuestion` while still executing the current request, after a single edit, or before writing the full response.
- **DO NOT AUTO-CHECK TODO** — Do not run Step 4 unless the user selects Option B.
- **CLARIFY BEFORE GUESSING** — If unclear mid-task, use AskQuestion in **Clarify** mode (see above), then resume Step 2.
- When using a workflow role, follow the role's defined input/output format and preconditions from WORKFLOW_INDEX.md.
