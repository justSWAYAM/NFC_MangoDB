from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse
from dotenv import load_dotenv
import google.generativeai as genai
from PIL import Image
import io
import os
import json

# Load environment variables
load_dotenv()

# Configure Gemini with API key
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Define allowed origins (for React frontend)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

# Initialize FastAPI app
app = FastAPI(default_response_class=ORJSONResponse)

# Apply CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = genai.GenerativeModel(model_name="gemini-1.5-flash")

try:
    test_response = model.generate_content("Give 3 ideas for a tech hackathon")
    print("Gemini Test:", test_response.text)
except Exception as e:
    print("Gemini Test Failed:", str(e))


@app.get("/")
async def root():
    return {"message": "FastAPI + Gemini is running"}


@app.post("/analyze-abuse/")
async def analyze_image_for_abuse(file: UploadFile = File(...)):
    """
    Analyzes an uploaded image for abusive content using the Gemini Vision API.
    Returns a structured JSON response indicating if abuse was found, the type,
    and a brief analysis.
    """
    try:
        if file.content_type not in ["image/jpeg", "image/png", "image/gif"]:
            raise HTTPException(status_code=400, detail="Only JPEG, PNG, and GIF images are supported.")

        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        # The improved core prompt for Gemini Vision with explicit keywords
        prompt = (
    "You are a highly accurate and professional content analysis system for identifying workplace harassment cases, especially under POSH (Prevention of Sexual Harassment) guidelines in India. "
    "Your task is to analyze the following user-submitted content, which may describe a real incident of inappropriate behavior, verbal abuse, or harassment. "
    "Use Natural Language Processing to identify the presence and type of harassment. "
    "Return a structured JSON response for each input. "

    "The JSON must have the following fields:\n"
    "1. is_abusive: true/false — Whether harassment or abuse is present\n"
    "2. abuse_type: One of ['Sexual Harassment', 'Verbal Abuse', 'Hate Speech', 'Threats', 'Cyberbullying', 'Safe']\n"
    "3. keywords: A list of offensive or sensitive words found (e.g., ['bitch', 'fuck'])\n"
    "4. analysis: A formal explanation of why it is considered abusive or not\n"
    "5. suggested_action: Recommended next step (e.g., 'File a POSH complaint', 'Flag for review', 'No action needed')\n"

    "Here is an example of a valid response if abuse is found:\n"
    "{\n"
    "  'is_abusive': true,\n"
    "  'abuse_type': 'Sexual Harassment',\n"
    "  'keywords': ['touching', 'uncomfortable'],\n"
    "  'analysis': 'The message describes a workplace incident where inappropriate physical behavior occurred.',\n"
    "  'suggested_action': 'File a POSH complaint'\n"
    "}\n"

    "If no abuse is detected, respond like:\n"
    "{\n"
    "  'is_abusive': false,\n"
    "  'abuse_type': 'Safe',\n"
    "  'keywords': [],\n"
    "  'analysis': 'No abusive, harassing, or offensive language was found.',\n"
    "  'suggested_action': 'No action needed'\n"
    "}\n"

    "Now analyze this input and return your JSON response only, without any explanation or extra text.\n\n"
    "User Content:\n"
)

        # Generate content with the structured prompt
        response = model.generate_content([prompt, image])
        
        gemini_text = response.text
        # Clean the response string by removing Markdown fences if they exist
        if gemini_text.strip().startswith('```json') and gemini_text.strip().endswith('```'):
            gemini_text = gemini_text.strip()[7:-3].strip()

        try:
            # Use json.loads() for safe and proper parsing of the JSON string
            gemini_output = json.loads(gemini_text)
        except json.JSONDecodeError:
            # Fallback for unexpected or malformed responses
            gemini_output = {"is_abusive": False, "abuse_type": "Uncertain", "analysis": response.text}
        
        return {"gemini_output": gemini_output}

    except HTTPException as he:
        return ORJSONResponse(content={"error": he.detail}, status_code=he.status_code)
    except Exception as e:
        print(f"Error processing image: {e}")
        return ORJSONResponse(content={"error": f"An error occurred: {e}"}, status_code=500)