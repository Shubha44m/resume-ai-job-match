# ResumeAI — 10–15 Minute Walkthrough

> This document supports a verbal/recorded walkthrough of the ResumeAI project. It covers project structure, AI usage, risks, and extension approach — suitable for a 10–15 minute presentation.

---

## 1. Introduction (1 min)

**ResumeAI** is an AI-powered tool that helps job seekers understand how well their resume matches a given job description. The user uploads their resume, pastes a job description, and the system uses Google Gemini 2.5 Flash to:

- Score the match (0–100) across Overall, Skills, Experience, and Education dimensions
- Identify which skills are present vs. missing
- Provide specific improvement suggestions
- Give ATS (Applicant Tracking System) optimization tips
- Store every analysis in a history dashboard

**Tech Stack**: Python + Flask (backend) · React + Vite + Tailwind CSS (frontend) · SQLite (database) · Google Gemini 2.5 Flash (AI)

---

## 2. Project Structure (2 min)

```
Resume_job_match/
│
├── backend/                    ← Python/Flask API
│   ├── app/
│   │   ├── __init__.py         ← App factory (register blueprints, init DB)
│   │   ├── models.py           ← AnalysisHistory SQLAlchemy model
│   │   ├── routes.py           ← REST API endpoints
│   │   └── utils/
│   │       ├── ai_logic.py     ← Gemini REST API call & JSON parsing
│   │       └── resume_parser.py← PDF/DOCX/TXT text extraction
│   ├── run.py                  ← Entry point
│   └── requirements.txt
│
├── frontend/                   ← React + Vite app
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx          ← Glassmorphism sticky nav
│       │   ├── HeroSection.jsx     ← Landing with CTAs
│       │   ├── AnalyzeForm.jsx     ← Upload + paste input form
│       │   ├── ResultsPanel.jsx    ← Score rings + skill badges
│       │   └── HistoryDashboard.jsx← Paginated analysis history
│       ├── api/client.js           ← Axios API layer (all fetch calls)
│       └── App.jsx                 ← Root: page routing via AnimatePresence
│
├── docs/                       ← AI guidance files
│   ├── claude.md               ← Rules for AI assistants working on this repo
│   ├── agents.md               ← Agent roles and scope constraints
│   ├── prompt_rules.md         ← Gemini prompting strategy and rules
│   └── coding_standards.md     ← Language-specific coding standards
│
├── README.md                   ← Setup, API docs, technical decisions
└── WALKTHROUGH.md              ← This file
```

**Key design decision**: The backend uses a Flask Application Factory pattern (`create_app()`), which separates concerns, makes the app testable, and allows future blueprints to be added cleanly.

---

## 3. Running the App (1 min)

```bash
# Terminal 1 — Backend
cd backend
venv\Scripts\activate           # Windows
python run.py                   # Starts on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev                     # Starts on http://localhost:3000
```

**Environment Variable**: Set `GEMINI_API_KEY` in `backend/.env` (get a free key from Google AI Studio).

---

## 4. AI Usage — How Gemini Is Used (3–4 min)

### How it works
The AI logic lives entirely in `backend/app/utils/ai_logic.py`.

When a user submits a resume + JD, the backend:
1. **Extracts text** from the uploaded file (PDF via PyPDF2, DOCX via python-docx, TXT plain read)
2. **Truncates** inputs to 3000 / 2000 characters to keep the prompt concise
3. **Sends a structured prompt** to Gemini 2.5 Flash via the REST API
4. **Parses the JSON response** and saves it to SQLite

### The Prompt Strategy
The prompt uses:
- **Role priming**: "You are an expert ATS and career coach AI"
- **Schema-first prompting**: The full JSON schema with example values is embedded in the prompt so the model knows exactly what to return
- **Explicit rules**: Minimum item counts (≥5 skills), score realism, JSON-only output
- **Context labeling**: Resume and JD are separated with `--- RESUME ---` / `--- JOB DESCRIPTION ---` delimiters

```python
"generationConfig": {
    "temperature": 0.2,           # Low temp = consistent, factual output
    "maxOutputTokens": 8192,      # High enough to never truncate JSON
    "responseMimeType": "application/json",  # Forces valid JSON output
}
```

> **Why `responseMimeType: "application/json"`?**
> Without it, Gemini occasionally wraps the JSON in markdown code fences or adds a preamble sentence. Setting this mime type forces the model to output raw, valid, parseable JSON every time.

### Why Gemini 2.5 Flash?
- ✅ Available on the free tier
- ✅ Fast response time (~3–5 seconds)
- ✅ Supports `responseMimeType: application/json`
- ✅ Works via direct REST API (no SDK required → avoids Python 3.14 compatibility issues with grpcio)

---

## 5. API Endpoints (1 min)

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | Uptime check |
| `POST` | `/api/analyze` | Analyze resume vs JD |
| `GET` | `/api/history` | List all analyses (paginated) |
| `GET` | `/api/history/:id` | Get single analysis |
| `DELETE` | `/api/history/:id` | Delete an analysis |

The `POST /api/analyze` endpoint accepts multipart form data with either a file upload (`resume`) or pasted text (`resume_text`), plus a `job_description` string.

---

## 6. Database (1 min)

The `AnalysisHistory` model stores:
- `overall_score`, `skills_score`, `experience_score`, `education_score` (floats)
- `matched_skills`, `missing_skills`, `suggestions`, `ats_tips` (JSON-encoded lists)
- `job_title`, `company_name`, `summary` (strings)
- `resume_text[:5000]`, `job_description[:5000]` (first 5000 chars only — PII protection)
- `created_at` (timestamp)

SQLite is used for zero-configuration development. Switching to PostgreSQL requires only changing the `DATABASE_URL` environment variable — SQLAlchemy handles the rest.

---

## 7. Frontend Architecture (1 min)

The React app uses **client-side page routing** via `AnimatePresence` from Framer Motion — no React Router needed at this scale. State lives in `App.jsx`:

```
home → analyze → [result] → history
         ↑           ↓
         └─── analyze another ─┘
```

All backend calls are centralized in `src/api/client.js` — no component talks to the API directly. This makes it trivial to change the base URL or add auth headers in one place.

**Design**: Glassmorphism dark theme (`backdrop-filter: blur`), animated SVG score rings (via `motion.circle` with `strokeDashoffset`), skill badges color-coded by presence/absence.

---

## 8. Known Risks & Mitigations (2 min)

| Risk | Severity | Mitigation Applied |
|---|---|---|
| **AI JSON truncation** | High | `maxOutputTokens: 8192` + `responseMimeType: application/json` |
| **Gemini rate limits (429)** | Medium | Used `gemini-2.5-flash` (higher quota than 2.0); add retry logic for production |
| **PDF extraction failures** | Medium | Fallback to plain text paste mode in UI |
| **Prompt injection via resume** | Low | Content is sent as user data, not system commands; Gemini applies safety filters |
| **SQLite not scalable** | Medium | Swappable via `DATABASE_URL` env var to PostgreSQL |
| **Python 3.14 SDK incompatibility** | High (was) | **Resolved**: call Gemini via direct REST API with `requests` instead of `google-generativeai` SDK |
| **API key exposure** | High | `.env` is in `.gitignore`; only `.env.example` is committed |

---

## 9. Extension Approach (2 min)

The codebase is designed so that all major extensions are isolated additions, not rewrites:

### Feature Extensions
| Extension | Where to Add |
|---|---|
| **User Accounts** | New `User` model + `/api/auth` blueprint; frontend login page |
| **Resume Co-pilot** | New endpoint `/api/improve` calling Gemini with a rewrite prompt |
| **Bulk Upload & Compare** | `AnalyzeForm` accepts multiple files; backend loops and returns array |
| **Email Report** | Add `pdfkit` or `reportlab` to backend; new `/api/history/:id/export` endpoint |
| **Interview Prep** | New Gemini prompt based on `missing_skills` from an analysis |

### Infrastructure Extensions
| Extension | Approach |
|---|---|
| **PostgreSQL** | Change `DATABASE_URL` to `postgresql://...` — zero code changes |
| **Production Deployment** | `gunicorn` is already in `requirements.txt`; add `Dockerfile` + `fly.toml` |
| **CI/CD** | GitHub Actions: `pytest` on push + `npm run build` check |
| **Caching** | Add `Flask-Caching` to cache identical resume+JD pairs for 1 hour |

---

## 10. AI Guidance Files Summary (1 min)

| File | Purpose |
|---|---|
| `docs/claude.md` | Rules for any AI assistant editing this codebase (what to do, what NOT to do) |
| `docs/agents.md` | Defines backend, frontend, and prompt engineer agent roles with explicit scope boundaries |
| `docs/prompt_rules.md` | Documents the Gemini prompting strategy, anti-patterns, and test requirements |
| `docs/coding_standards.md` | Language-specific standards for Python and React code in this repo |

---

## 11. What Makes This Submission Original

- All code written specifically for this assessment
- No employer-owned or proprietary code used
- AI assistance was used for code generation and review — all decisions documented in `docs/claude.md`
- The Gemini REST API integration was debugged and adapted specifically for Python 3.14 compatibility
