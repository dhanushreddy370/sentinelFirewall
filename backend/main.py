from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os
import shutil
from typing import List, Optional
import uvicorn
from crew_app import SentinelCrew

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
TEST_DATA_DIR = os.path.join(os.path.dirname(__file__), '../test_data')
FRONTEND_DIST_DIR = os.path.join(os.path.dirname(__file__), '../frontend_app/dist')

if not os.path.exists(TEST_DATA_DIR):
    os.makedirs(TEST_DATA_DIR)

# Models
class AgentRequest(BaseModel):
    userPrompt: str
    webpageContent: str
    safeMode: bool
    userConfirmation: bool = False
    denyAction: bool = False

# --- API ENDPOINTS ---

@app.get("/api/files")
async def list_files():
    try:
        files = os.listdir(TEST_DATA_DIR)
        return files
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/files/{filename}")
async def get_file_content(filename: str):
    # Check if it's a URL (simple check, in reality frontend encodes it)
    if filename.startswith("http"):
        return {"content": f"URL_TARGET: {filename}"}

    filepath = os.path.join(TEST_DATA_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        if filename.lower().endswith('.pdf'):
            from pypdf import PdfReader
            reader = PdfReader(filepath)
            content = ""
            for page in reader.pages:
                content += page.extract_text() + "\n"
            return {"content": content}
        else:
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            return {"content": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        filepath = os.path.join(TEST_DATA_DIR, file.filename)
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"message": "File uploaded successfully", "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/agent/execute")
async def execute_agent(request: AgentRequest):
    try:
        print(f"DEBUG: Processing Agent Request. Confirmation: {request.userConfirmation}, Deny: {request.denyAction}")
        
        # Initialize the Crew
        crew = SentinelCrew(request.userPrompt, request.webpageContent, request.safeMode, request.userConfirmation, request.denyAction)
        result = crew.run()
        
        status = "SUCCESS"
        details = "Processed by Sentinel Crew"

        # Check for HITL Trigger
        if "[[CONFIRMATION_REQUIRED]]" in result:
            status = "CONFIRMATION_REQUIRED"
            # Extract details
            details = result.replace("[[CONFIRMATION_REQUIRED]]", "").strip()

        # Check for our special tag from the Analyst Agent
        elif "[[THREAT_NEUTRALIZED]]" in result:
             status = "PROTECTED"
             details = "Indirect Prompt Injection detected and neutralized."
             # Remove the tag for the user
             result = result.replace("[[THREAT_NEUTRALIZED]]", "").strip()

        elif "THREAT BLOCKED" in result:
             status = "PROTECTED"
             if "THREAT BLOCKED:" in result:
                 details = result.split("THREAT BLOCKED:", 1)[1].strip()
             else:
                 details = "Security protocols engaged. Threat neutralized."
        
        if "COMPROMISED" in result and "THREAT BLOCKED" not in result:
            status = "COMPROMISED"
            details = "System Compromised by Indirect Prompt Injection."

        return {
            "status": status,
            "message": result,
            "details": details
        }
    except Exception as e:
        print(f"Error: {e}")
        return {
            "status": "ERROR",
            "message": "Internal Server Error",
            "details": str(e)
        }

# Serve Frontend (Must be last)
if os.path.exists(FRONTEND_DIST_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST_DIR, html=True), name="static")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3000)
