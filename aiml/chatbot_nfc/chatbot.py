# chatbot.py

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv
from fastapi.responses import FileResponse

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel(model_name="gemini-1.5-flash")

app = FastAPI()

# Allow frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend domain in production
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat_with_gemini(request: ChatRequest):
    user_msg = request.message.strip()

    prompt = (
    "You are a calm, emotionally aware, and well-informed assistant trained to support individuals facing workplace harassment under POSH and related Indian laws. "
    "Your tone should be supportive, therapeutic, and empowering — as if you're a trained counselor. "
    "When someone describes an incident or asks a legal question, do the following:\n"
    "- Give a short empathetic intro acknowledging their experience.\n"
    "- Offer a helpful and elaborative response (at least 4–5 lines) including legal insight.\n"
    "- Mention the relevant section of Indian law or POSH Act if possible (e.g., IPC 354A, POSH Sec 9).\n"
    "- If the user asks or hints at drafting something, offer a well-worded 100-word incident message or complaint template.\n"
    "- End with 1–2 actionable next steps that the AI itself can assist with (e.g., 'I can help you draft a report' or 'Would you like me to explain how to file it?')\n"
    "- If the user's message is vague, gently ask clarifying questions while offering emotional reassurance.\n\n"
    "Respond in a warm but clear tone. Always avoid robotic or generic replies. NOTE: AVOID USING EM-DASHES\n\n"
    "User: " + user_msg
)

    try:
        response = model.generate_content(prompt)
        return {"response": response.text}
    except Exception as e:
        return {"error": str(e)}
    
    #PDF generation when the word pdf appears
@app.get("/download-sample-pdf")
async def download_sample_pdf():
    return FileResponse(
        "POSH_Report_Template.pdf",
        media_type="application/pdf",
        filename="POSH_report.pdf"
    )