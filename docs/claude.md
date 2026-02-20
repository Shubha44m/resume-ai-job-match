# claude.md — AI Guidance for ResumeAI

This file documents how AI (Claude, Gemini, etc.) should assist when working on the ResumeAI codebase.

---

## Project Context

ResumeAI is a Python/Flask + React application that uses Google Gemini to analyze resumes against job descriptions. It produces structured JSON output containing scores, skill gaps, and ATS tips.

---

## Architecture Philosophy

- **Separation of concerns**: AI logic lives exclusively in `backend/app/utils/ai_logic.py`. Keep it there.
- **Structured AI output**: The Gemini prompt always requests a JSON object. Never parse free-form text.
- **Graceful degradation**: If AI fails, return a meaningful `error` key in the response. Never crash the server.
- **No auth**: This is a single-user tool. Do not add authentication unless explicitly asked.

---

## Coding Standards

### Backend (Python)
- Use type hints on all new functions.
- Validate request inputs before calling AI — fail fast with clear HTTP 4xx errors.
- Use `db.session.rollback()` in except blocks inside DB operations.
- Never log full resume text (it may contain PII).

### Frontend (React/JSX)
- All components are functional. No class components.
- State lives in `App.jsx` or the component that owns it. Avoid prop drilling beyond 2 levels.
- API calls live exclusively in `src/api/client.js`. Components import from there.
- Use `framer-motion` for all enter/exit animations.

---

## Modifying the AI Prompt

The prompt is in `backend/app/utils/ai_logic.py → analyze_resume_with_ai()`.

**Rules**:
1. Always request pure JSON — no markdown code fences in the prompt.
2. Include the full JSON schema in the prompt so the model knows what to produce.
3. Strip any accidental code fences from the response before `json.loads()`.
4. Test any prompt change with at least 2 different resume/JD pairs.

---

## Adding New API Endpoints

1. Add the route function to `backend/app/routes.py`.
2. Add the corresponding function to `frontend/src/api/client.js`.
3. Document it in `README.md` under the API Endpoints table.

---

## Database Schema Changes

1. Modify `backend/app/models.py`.
2. Delete `resume_match.db` locally to regenerate (dev only).
3. For production, use Alembic migrations.

---

## Do NOT

- Introduce new Python dependencies without updating `requirements.txt`.
- Add global state to the frontend beyond what's in `App.jsx`.
- Store full resume text beyond the first 5000 characters in the DB.
- Expose the Gemini API key in any frontend code.
