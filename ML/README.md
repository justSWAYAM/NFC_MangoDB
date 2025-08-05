# Legal Report Generation Backend

This Flask application generates legal reports from uploaded evidence images using OCR and AI.

## Setup Instructions

1. **Install Python Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Install Tesseract OCR (Required for OCR functionality):**
   
   **Windows:**
   - Download from: https://github.com/UB-Mannheim/tesseract/wiki
   - Install the latest version (e.g., `tesseract-ocr-w64-setup-5.3.1.20230401.exe`)
   - Make sure to check "Add to PATH" during installation
   - Restart your terminal after installation
   
   **macOS:**
   ```bash
   brew install tesseract
   ```
   
   **Linux (Ubuntu/Debian):**
   ```bash
   sudo apt-get install tesseract-ocr
   ```

3. **Set Environment Variables:**
   ```bash
   export GOOGLE_API_KEY="your_google_api_key_here"
   ```

4. **Run the Server:**
   ```bash
   python legal_report.py
   ```

   The server will start on `http://127.0.0.1:5000`

## API Endpoint

- **POST** `/generate_report`
  - **Content-Type:** `multipart/form-data`
  - **Body:** Form data with field `evidence` containing an image file
  - **Response:** PDF file download

## Features

- OCR text extraction from images (requires Tesseract installation)
- AI-powered legal report generation using Google Gemini
- PDF generation with proper formatting
- CORS enabled for frontend integration
- Graceful fallback when Tesseract is not installed

## Frontend Integration

The frontend now includes a "Generate Legal Report" button that appears when evidence is uploaded. The button:
- Sends the image to the backend API
- Opens the generated PDF in a new tab
- Handles loading states and error messages 