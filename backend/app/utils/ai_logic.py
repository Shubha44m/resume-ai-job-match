import os
import json
import re
import requests
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
GEMINI_MODEL = 'gemini-2.5-flash'


def analyze_resume_with_ai(resume_text: str, job_description: str) -> dict:
    """
    Use Google Gemini REST API to analyze a resume against a job description.
    Returns a structured JSON dict with scores, missing skills, suggestions, etc.
    """
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY not configured. Please set it in the .env file.")

    # Truncate inputs to keep the prompt short and avoid token overflow
    resume_short = resume_text[:3000]
    jd_short = job_description[:2000]

    prompt = f"""You are an ATS and career coach AI. Analyze the resume against the job description.

Return ONLY a valid JSON object. No markdown, no explanation, just raw JSON:
{{
  "overall_score": 72.5,
  "skills_score": 68.0,
  "experience_score": 75.0,
  "education_score": 80.0,
  "job_title": "Software Engineer",
  "company_name": "Google",
  "matched_skills": ["Python", "SQL", "REST APIs", "Git", "Agile"],
  "missing_skills": ["Kubernetes", "Terraform", "Go", "Kafka", "AWS"],
  "suggestions": [
    "Add metrics to your project descriptions (e.g. improved performance by 40%).",
    "Include a dedicated Skills section with exact keywords from the JD.",
    "Quantify team size and scope of projects you led.",
    "Add open source contributions or GitHub links.",
    "Tailor your summary to match the specific role."
  ],
  "ats_tips": [
    "Use the exact job title from the JD in your resume header.",
    "Avoid tables and columns - ATS cannot parse them reliably.",
    "Include keywords: Kubernetes, Terraform, AWS exactly as written in the JD.",
    "Save as a plain .docx or PDF without graphics."
  ],
  "summary": "The candidate has solid Python and backend experience but lacks cloud infrastructure skills (Kubernetes, Terraform) required for this role. With targeted upskilling and resume keyword optimization, this is a strong application."
}}

Analyze this resume vs JD and return a JSON in that exact structure with realistic scores.

RESUME:
{resume_short}

JOB DESCRIPTION:
{jd_short}"""

    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    )
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 8192,
            "responseMimeType": "application/json",
        }
    }

    try:
        response = requests.post(url, json=payload, timeout=90)
        response.raise_for_status()
        data = response.json()

        # Check for safety blocks or empty candidates
        candidates = data.get('candidates', [])
        if not candidates:
            raise ValueError("Gemini returned no candidates. The content may have been blocked.")

        raw_text = (
            candidates[0]
            .get('content', {})
            .get('parts', [{}])[0]
            .get('text', '')
            .strip()
        )

        if not raw_text:
            finish_reason = candidates[0].get('finishReason', 'UNKNOWN')
            raise ValueError(f"Gemini returned empty text. Finish reason: {finish_reason}")

        # Strip Markdown code fences if present
        if raw_text.startswith("```"):
            raw_text = re.sub(r'^```(?:json)?\n?', '', raw_text)
            raw_text = re.sub(r'\n?```$', '', raw_text)

        result = json.loads(raw_text)
        return result

    except requests.exceptions.HTTPError as e:
        raise ValueError(f"Gemini API error: {e.response.status_code} — {e.response.text}")
    except json.JSONDecodeError as e:
        raise ValueError(f"AI returned invalid JSON. Please try again. Details: {str(e)}")
    except Exception as e:
        raise ValueError(f"AI analysis failed: {str(e)}")
