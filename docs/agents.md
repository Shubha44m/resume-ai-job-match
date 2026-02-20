# agents.md — Agent Configuration for ResumeAI

This file defines roles, responsibilities, and behavior rules for any AI agents working on the ResumeAI project.

---

## Agent Roles

### 1. Backend Agent
**Scope**: `backend/` folder only  
**Can modify**: `routes.py`, `models.py`, `utils/`, `requirements.txt`  
**Cannot modify**: Frontend source, `.env` API keys  
**Primary tools**: Python, Flask, SQLAlchemy, `google-generativeai`  

### 2. Frontend Agent
**Scope**: `frontend/src/` folder  
**Can modify**: All JSX, CSS, `vite.config.js`  
**Cannot modify**: Backend code, environment variables  
**Primary tools**: React, Tailwind CSS, Framer Motion, Axios  

### 3. AI Prompt Engineer
**Scope**: `backend/app/utils/ai_logic.py` only  
**Responsibility**: Improve, tune, and test the Gemini prompt  
**Output contract**: Must always return valid JSON matching `AnalysisHistory.to_dict()` schema  

---

## Shared Rules for All Agents

1. **Read before writing** — Always inspect existing files before making changes.
2. **One concern at a time** — Don't refactor AND add features in the same step.
3. **Fail loudly** — Prefer explicit errors over silent fallbacks.
4. **Test the change** — After making any change, verify it with a concrete example or command.
5. **Document intent** — Add a comment above any non-obvious code block.

---

## Escalation

If an agent cannot complete a task without modifying files outside its scope, it must:
1. Document what additional change is needed and why.
2. Stop and ask the user instead of making the out-of-scope change.

---

## Constraints

- Never call external APIs other than `generativelanguage.googleapis.com` (Gemini).
- Never log or persist full resume text beyond 5000 characters.
- Never hardcode API keys — always read from environment variables.
