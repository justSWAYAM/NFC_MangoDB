import io
import os
from datetime import datetime

from flask import Flask, request, send_file, abort
from flask_cors import CORS
from PIL import Image
import pytesseract
import google.generativeai as genai
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------
OCR_LANG   = "eng"            
KEYWORDS   = {
    "abuse":        "Section 506 IPC – Criminal intimidation",
    "harassment":   "Section 354A IPC – Sexual harassment",
    "cheating":     "Section 420 IPC – Cheating",
    "defamation":   "Section 499 IPC – Defamation",
    "threat":       "Section 503 IPC – Criminal threat",
    "insult":       "Section 509 IPC – Word/gesture insulting woman’s modesty",
}
PDF_TITLE  = "Legal_Report.pdf"

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

app = Flask(__name__)
CORS(app)

# -----------------------------------------------------------------------------
# Utility helpers
# -----------------------------------------------------------------------------
def run_ocr(image_bytes: bytes) -> str:
    try:
        img = Image.open(io.BytesIO(image_bytes))
        return pytesseract.image_to_string(img, lang=OCR_LANG).strip()
    except Exception as e:
        if "tesseract" in str(e).lower():
            # If Tesseract is not installed, return a placeholder text
            return "TEXT_EXTRACTED_FROM_IMAGE: [OCR not available - Tesseract not installed]"
        else:
            # For other OCR errors, return a generic message
            return "TEXT_EXTRACTED_FROM_IMAGE: [OCR processing failed]"

def extract_sender(ocr_text: str) -> str:
    first_line = next((ln for ln in ocr_text.splitlines() if ln.strip()), "")
    return first_line.split(":")[0].strip()

def fake_nlp(ocr_text: str) -> dict:
    lc_text = ocr_text.lower()
    matched = [kw for kw in KEYWORDS if kw in lc_text]
    return {
        "person_name": extract_sender(ocr_text) or "Unknown",
        "keywords": matched,
        "entities": [],  # Expand if needed
        "sentiment": "negative" if matched else "neutral",
        "possible_laws": [KEYWORDS[k] for k in matched],
    }

def ask_gemini(ocr_text: str, nlp: dict, sample_txt: str) -> str:
    prompt = f"""
You are a legal assistant. Your task is to draft a formal legal notice/report in plain English, 
strictly following the structure, style, and language of the following reference legal notice.

Inputs to guide your drafting:
- REFERENCE_DOCUMENT (the format/sample): 
\"\"\"
{sample_txt}
\"\"\"

- EVIDENCE_TEXT: 
\"\"\"
{ocr_text}
\"\"\"

- NLP_STRUCTURED: 
{nlp}

Instructions:
- Match all major headings, signature blocks, overall flow of the reference document.
- Adapt names, addresses, facts, and case details from the latest evidence and NLP output above.
- Do NOT use bold/italics; keep standard legal formatting.
- Do NOT use any Hindi or bilingual content.
-Just use the sample_text for reference dont include any personal detail from it.

Produce a ready-to-send, professional English legal notice.
"""
    response = model.generate_content(prompt)
    return response.text.strip()

def report_to_pdf(report_text: str) -> bytes:
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    y = height - 40
    for line in report_text.splitlines():
        if not line:
            y -= 18
            continue
        c.drawString(40, y, line)
        y -= 14
        if y < 40:
            c.showPage()
            y = height - 40
    c.save()
    buffer.seek(0)
    return buffer.read()

# -----------------------------------------------------------------------------
# Main endpoint
# -----------------------------------------------------------------------------
@app.route("/generate_report", methods=["POST"])
def generate_report():
    if "evidence" not in request.files:
        abort(400, "Upload the screenshot as form-data field 'evidence'.")

    img_bytes = request.files["evidence"].read()
    ocr_text  = run_ocr(img_bytes)
    nlp_out   = fake_nlp(ocr_text)
    
    # Always read the latest sample.txt
    try:
        with open("sample.txt", "r", encoding="utf-8") as f:
            sample_txt = f.read()
    except Exception as e:
        abort(500, f"Could not read legal format (sample.txt): {e}")

    gemini_report = ask_gemini(ocr_text, nlp_out, sample_txt)
    pdf_bytes = report_to_pdf(gemini_report)

    return send_file(
        io.BytesIO(pdf_bytes),
        mimetype="application/pdf",
        as_attachment=True,
        download_name=PDF_TITLE,
    )

# -----------------------------------------------------------------------------
# Run
# -----------------------------------------------------------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
