from datetime import datetime
from app import db


class AnalysisHistory(db.Model):
    """Stores each resume-vs-JD analysis performed by the user."""
    __tablename__ = 'analysis_history'

    id = db.Column(db.Integer, primary_key=True)
    job_title = db.Column(db.String(200), nullable=True)
    company_name = db.Column(db.String(200), nullable=True)
    resume_text = db.Column(db.Text, nullable=False)
    job_description = db.Column(db.Text, nullable=False)
    overall_score = db.Column(db.Float, nullable=False)
    skills_score = db.Column(db.Float, nullable=True)
    experience_score = db.Column(db.Float, nullable=True)
    education_score = db.Column(db.Float, nullable=True)
    missing_skills = db.Column(db.Text, nullable=True)   # JSON-encoded list
    matched_skills = db.Column(db.Text, nullable=True)   # JSON-encoded list
    suggestions = db.Column(db.Text, nullable=True)       # JSON-encoded list
    ats_tips = db.Column(db.Text, nullable=True)          # JSON-encoded list
    summary = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        import json
        return {
            'id': self.id,
            'job_title': self.job_title,
            'company_name': self.company_name,
            'overall_score': self.overall_score,
            'skills_score': self.skills_score,
            'experience_score': self.experience_score,
            'education_score': self.education_score,
            'missing_skills': json.loads(self.missing_skills) if self.missing_skills else [],
            'matched_skills': json.loads(self.matched_skills) if self.matched_skills else [],
            'suggestions': json.loads(self.suggestions) if self.suggestions else [],
            'ats_tips': json.loads(self.ats_tips) if self.ats_tips else [],
            'summary': self.summary,
            'created_at': self.created_at.isoformat(),
        }
