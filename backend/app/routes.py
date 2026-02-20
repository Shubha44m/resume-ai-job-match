import json
from flask import Blueprint, request, jsonify
from app import db
from app.models import AnalysisHistory
from app.utils.resume_parser import extract_text_from_file
from app.utils.ai_logic import analyze_resume_with_ai

api_bp = Blueprint('api', __name__)


@api_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'ok', 'message': 'Resume Match API is running'}), 200


@api_bp.route('/analyze', methods=['POST'])
def analyze_resume():
    """
    Analyze a resume against a job description.
    Accepts multipart form data:
      - resume: File (PDF, DOCX, TXT) OR resume_text: string
      - job_description: string (required)
    """
    try:
        job_description = request.form.get('job_description', '').strip()
        if not job_description:
            return jsonify({'error': 'job_description is required'}), 400

        # Extract resume text
        resume_text = ''
        if 'resume' in request.files and request.files['resume'].filename:
            file = request.files['resume']
            resume_text = extract_text_from_file(file)
        elif request.form.get('resume_text'):
            resume_text = request.form.get('resume_text').strip()
        else:
            return jsonify({'error': 'Please upload a resume file or paste resume text'}), 400

        if len(resume_text) < 100:
            return jsonify({'error': 'Resume text is too short. Please provide a complete resume.'}), 400

        # Run AI analysis
        ai_result = analyze_resume_with_ai(resume_text, job_description)

        # Save to database
        record = AnalysisHistory(
            job_title=ai_result.get('job_title'),
            company_name=ai_result.get('company_name'),
            resume_text=resume_text[:5000],  # Store first 5000 chars
            job_description=job_description[:5000],
            overall_score=float(ai_result.get('overall_score', 0)),
            skills_score=float(ai_result.get('skills_score', 0)),
            experience_score=float(ai_result.get('experience_score', 0)),
            education_score=float(ai_result.get('education_score', 0)),
            missing_skills=json.dumps(ai_result.get('missing_skills', [])),
            matched_skills=json.dumps(ai_result.get('matched_skills', [])),
            suggestions=json.dumps(ai_result.get('suggestions', [])),
            ats_tips=json.dumps(ai_result.get('ats_tips', [])),
            summary=ai_result.get('summary', ''),
        )
        db.session.add(record)
        db.session.commit()

        return jsonify({
            'success': True,
            'analysis_id': record.id,
            'result': record.to_dict()
        }), 200

    except ValueError as e:
        return jsonify({'error': str(e)}), 422
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500


@api_bp.route('/history', methods=['GET'])
def get_history():
    """Get all analysis history, sorted by most recent."""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        records = AnalysisHistory.query.order_by(
            AnalysisHistory.created_at.desc()
        ).paginate(page=page, per_page=per_page, error_out=False)

        return jsonify({
            'history': [r.to_dict() for r in records.items],
            'total': records.total,
            'page': records.page,
            'pages': records.pages,
            'has_next': records.has_next,
            'has_prev': records.has_prev,
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api_bp.route('/history/<int:analysis_id>', methods=['GET'])
def get_analysis(analysis_id):
    """Get a single analysis by ID."""
    record = AnalysisHistory.query.get_or_404(analysis_id)
    return jsonify(record.to_dict()), 200


@api_bp.route('/history/<int:analysis_id>', methods=['DELETE'])
def delete_analysis(analysis_id):
    """Delete an analysis record."""
    try:
        record = AnalysisHistory.query.get_or_404(analysis_id)
        db.session.delete(record)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Analysis deleted'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
