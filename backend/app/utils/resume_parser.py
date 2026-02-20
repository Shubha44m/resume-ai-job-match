import io
import PyPDF2
from docx import Document


def extract_text_from_pdf(file_stream) -> str:
    """Extract text from a PDF file stream."""
    try:
        reader = PyPDF2.PdfReader(file_stream)
        text_parts = []
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
        return "\n".join(text_parts).strip()
    except Exception as e:
        raise ValueError(f"Could not parse PDF: {str(e)}")


def extract_text_from_docx(file_stream) -> str:
    """Extract text from a DOCX file stream using python-docx."""
    try:
        doc = Document(file_stream)
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        return "\n".join(paragraphs).strip()
    except Exception as e:
        raise ValueError(f"Could not parse DOCX: {str(e)}")


def extract_text_from_file(file_storage) -> str:
    """
    Extract text from an uploaded file (PDF, DOCX, or TXT).
    file_storage: Flask FileStorage object
    """
    filename = file_storage.filename.lower()
    file_stream = io.BytesIO(file_storage.read())

    if filename.endswith('.pdf'):
        return extract_text_from_pdf(file_stream)
    elif filename.endswith('.docx') or filename.endswith('.doc'):
        return extract_text_from_docx(file_stream)
    elif filename.endswith('.txt'):
        return file_stream.read().decode('utf-8', errors='ignore').strip()
    else:
        raise ValueError("Unsupported file type. Please upload PDF, DOCX, or TXT.")
