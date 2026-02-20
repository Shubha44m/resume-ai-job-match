# ResumeAI — AI-Powered Resume & Job Match Analyzer

> Upload your resume, paste a job description, and let Gemini AI score your fit, identify missing skills, and give ATS optimization tips.

---

## 🚀 Features

- 📄 **Resume Upload** — Supports PDF, DOCX, TXT
- 🤖 **AI Scoring** — Powered by Google Gemini 1.5 Flash
- 📊 **Detailed Analysis** — Overall score + Skills / Experience / Education sub-scores
- 🎯 **ATS Tips** — Concrete tips to pass Applicant Tracking Systems
- 💡 **Improvement Suggestions** — Actionable feedback from AI
- 📚 **History Dashboard** — Persistent SQLite storage of all analyses

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.10+, Flask 3, SQLAlchemy, SQLite |
| AI | Google Gemini 1.5 Flash (`google-generativeai`) |
| Frontend | React 19, Vite 7, Tailwind CSS 3, Framer Motion |
| File Parsing | PyPDF2, docx2txt |
| HTTP Client | Axios |

---

## 📁 Project Structure

```
Resume_job_match/
├── backend/
│   ├── app/
│   │   ├── __init__.py        # Flask app factory
│   │   ├── models.py          # SQLAlchemy model (AnalysisHistory)
│   │   ├── routes.py          # API endpoints (analyze, history CRUD)
│   │   └── utils/
│   │       ├── resume_parser.py   # PDF/DOCX/TXT extraction
│   │       └── ai_logic.py        # Gemini AI prompt & parsing
│   ├── run.py                 # Entry point
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── HeroSection.jsx
│   │   │   ├── AnalyzeForm.jsx
│   │   │   ├── ResultsPanel.jsx
│   │   │   └── HistoryDashboard.jsx
│   │   ├── api/client.js      # Axios API layer
│   │   ├── App.jsx
│   │   └── index.css
│   ├── vite.config.js
│   └── package.json
├── docs/
│   ├── claude.md
│   ├── agents.md
│   └── prompt_rules.md
└── README.md
```

---

## ⚡ Setup & Run

### 1. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Run backend
python run.py
# Backend runs on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend

# Install dependencies (already done)
npm install

# Run dev server
npm run dev
# Frontend runs on http://localhost:3000
```

---

## 🔑 Getting a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key (free tier available)
3. Add it to `backend/.env`:
   ```
   GEMINI_API_KEY=your_key_here
   ```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/analyze` | Analyze resume vs JD |
| `GET` | `/api/history` | List all analyses (paginated) |
| `GET` | `/api/history/:id` | Get single analysis |
| `DELETE` | `/api/history/:id` | Delete an analysis |

### POST `/api/analyze` — Form Data

| Field | Type | Required |
|---|---|---|
| `resume` | File (PDF/DOCX/TXT) | One of these |
| `resume_text` | string | One of these |
| `job_description` | string | ✅ |

---

## 🧠 Key Technical Decisions

1. **Gemini 1.5 Flash** — Chosen for speed + structured JSON output capability at no cost on free tier.
2. **SQLite** — Zero-config relational DB perfect for this scope; easily swappable to PostgreSQL via SQLAlchemy config.
3. **Flask Application Factory** — Enables clean testing and future blueprint expansion.
4. **Vite Proxy** — Routes `/api/*` from the dev server to Flask, avoiding CORS issues in development.
5. **Tailwind CSS v3** — Used for rapid styling with full custom design system (not relying on component libraries).

---

## ⚠️ Known Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Gemini rate limits | Flash model has generous free quota; add retry logic for production |
| PDF text extraction failures | Fallback to plain text paste mode |
| Prompt injection via resume | Text is sent as user content, not system commands |
| SQLite not production-ready for scale | Use `DATABASE_URL` env var to point to PostgreSQL |

---

## 🔭 Extension Ideas

- User accounts with OAuth login
- Resume improvement co-pilot (AI rewrites sections)
- Bulk upload and comparison mode
- Email report export
- Interview question generator based on gaps
