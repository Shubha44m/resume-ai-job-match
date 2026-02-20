# prompt_rules.md — Gemini Prompting Rules & Constraints

This file documents the prompting rules used in ResumeAI and the reasoning behind each decision.

---

## Core Prompt (in `ai_logic.py`)

The prompt is sent to Gemini 1.5 Flash as a single user turn. It:
1. Defines the AI's role as "ATS expert and career coach"
2. Specifies the exact JSON schema to return
3. Provides clear rules for quality
4. Appends the resume and JD as labeled blocks

---

## Rules

### 1. Always Demand Structured JSON
```
Return your analysis ONLY as a valid JSON object with this exact structure:
{ ... }
```
**Why**: Free-form text is unparseable. JSON ensures reliable field extraction without regex hacks.

### 2. Schema-First Prompting
Always include the full schema in the prompt — field names AND types.  
**Why**: LLMs hallucinate field names. An explicit schema prevents `matched_skill` vs `matched_skills` type mismatches.

### 3. Rules Block
Include explicit rules at the end of the schema definition:
- Minimum item counts (e.g., "at least 5 missing skills")
- Score range constraints
- Return format ("Return ONLY the JSON object, no markdown")

**Why**: Without floor constraints, the model may return empty arrays or inflated scores.

### 4. Context Labeling
Always label the resume and JD clearly:
```
--- RESUME ---
{resume_text}

--- JOB DESCRIPTION ---
{job_description}
```
**Why**: Prevents context leakage — the model must distinguish between the two texts.

### 5. Post-Processing
Always strip Markdown code fences in Python before `json.loads()`:
```python
raw_text = re.sub(r'^```(?:json)?\n?', '', raw_text)
raw_text = re.sub(r'\n?```$', '', raw_text)
```
**Why**: Even when instructed otherwise, Gemini occasionally wraps JSON in code fences.

---

## Prompt Anti-Patterns to Avoid

| Anti-Pattern | Problem |
|---|---|
| "Analyze the resume and give feedback" | Too vague, returns prose |
| Putting schema in system role | Flash doesn't have separate system role |
| Asking for multiple formats | Model gets confused, mixes outputs |
| No examples in schema | Model guesses field meanings |

---

## Testing New Prompts

Before deploying any prompt change:
1. Test with a strong resume vs. a matching JD (expect score ≥ 80).
2. Test with a weak resume vs. a senior JD (expect score ≤ 45).
3. Test with a completely unrelated resume (expect score ≤ 25, many missing skills).
4. Verify all JSON fields are present and correctly typed.
