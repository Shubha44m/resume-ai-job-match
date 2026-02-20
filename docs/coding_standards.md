# coding_standards.md — Coding Standards for ResumeAI

All contributors (human and AI) must follow these standards when modifying the ResumeAI codebase.

---

## Python (Backend)

### Style
- Follow **PEP 8** for all Python code
- Max line length: **100 characters**
- Use **4 spaces** for indentation (no tabs)
- Module-level imports first, then third-party, then local (separated by blank lines)

### Type Hints
- All public functions MUST have type hints on parameters and return values:
  ```python
  # ✅ Correct
  def extract_text_from_pdf(file_stream: io.BytesIO) -> str:
  
  # ❌ Wrong
  def extract_text_from_pdf(file_stream):
  ```

### Error Handling
- Use specific exception types — never bare `except:` clauses
- All Flask route functions must handle exceptions with appropriate HTTP status codes:
  - `400` — Bad request (invalid input)
  - `422` — Unprocessable entity (valid input, logic failure)
  - `500` — Unexpected server error
- Log errors before raising; never silently swallow exceptions

### Database
- Never use raw SQL — always use SQLAlchemy ORM
- Call `db.session.rollback()` inside `except` blocks that touch the DB
- Never store raw plaintext passwords (not applicable currently but follows security-first approach)

### AI/Prompt Code
- All AI calls live exclusively in `app/utils/ai_logic.py`
- Never call external AI APIs from routes directly
- Always strip markdown code fences from AI responses before `json.loads()`
- Always validate AI JSON output has required keys before returning to the caller

### Naming Conventions
```python
# Variables and functions: snake_case
resume_text = ""
def extract_text_from_file(): ...

# Classes: PascalCase
class AnalysisHistory(db.Model): ...

# Constants: UPPER_SNAKE_CASE
GEMINI_MODEL = 'gemini-2.5-flash'
MAX_TEXT_LENGTH = 3000
```

### Security Rules
- **Never** hardcode API keys or secrets in source code
- **Never** log full resume text (PII risk) — log only IDs and scores
- Limit stored resume text to first 5000 characters in the database
- Sanitize file uploads: check extension AND content size before processing

---

## JavaScript / React (Frontend)

### Style
- Use **2 spaces** for indentation
- Use **single quotes** for strings, **template literals** for interpolated strings
- End every statement with a semicolon

### Components
- All components are **functional** — no class components ever
- One component per file
- Component files use **PascalCase**: `AnalyzeForm.jsx`
- Utility files use **camelCase**: `client.js`

### State Management
- State lives in the component that owns it
- Global page state lives in `App.jsx`
- Never prop-drill beyond 2 levels — if deeper, use Context
- No external state libraries (Redux, Zustand) unless explicitly approved

### API Calls
- All API calls go through `src/api/client.js`
- Components **never** call `fetch()` or `axios` directly
- Every API call must handle errors and show a `react-hot-toast` notification

### Animations
- Use `framer-motion` for all enter/exit animations
- Prefer `motion.div` over CSS `@keyframes` for component-level animations
- Keep animation durations between **0.2s–0.6s** for snappy feel

### Styling
- Use **Tailwind CSS utility classes** — no inline `style={{}}` unless for dynamic values (e.g., `strokeDashoffset`)
- Custom design tokens live in `tailwind.config.js` — never hardcode color hex values in JSX
- Glassmorphism pattern: use `.glass` or `.glass-strong` utility classes defined in `index.css`
- Every interactive element must have a `:hover` state

### Naming Conventions
```jsx
// Components: PascalCase
function AnalyzeForm() {}

// Hooks: camelCase starting with 'use'
const [loading, setLoading] = useState(false);

// Event handlers: handle + EventName
const handleSubmit = async (e) => {};
const handleDelete = async (id, e) => {};

// API functions: verb + noun
export const analyzeResume = async () => {};
export const getHistory = async () => {};
```

---

## Git Commit Standards

- Use **imperative mood** in commit messages: "Add feature" not "Added feature"
- Prefix with type: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`
- Keep first line under **72 characters**

```
# ✅ Good
feat: add PDF text extraction with PyPDF2
fix: increase maxOutputTokens to prevent JSON truncation
docs: add walkthrough covering AI usage and risks

# ❌ Bad
added pdf support
```

---

## Files That Must NEVER Be Committed

- `backend/.env` — contains API keys
- `backend/venv/` — virtual environment
- `backend/resume_match.db` — local database
- `frontend/node_modules/` — npm packages
- `frontend/dist/` — build output
- `*.log`, `error.txt` — runtime logs
