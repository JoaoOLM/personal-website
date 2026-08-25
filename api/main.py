import os
import json
import shutil
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
from google import genai
from google.genai import types
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from itsdangerous import URLSafeTimedSerializer

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Config
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "")
SECRET_KEY = os.environ.get("SECRET_KEY", "change-me-in-production")
serializer = URLSafeTimedSerializer(SECRET_KEY)

PROFILE_PATH = os.path.join(os.path.dirname(__file__), "..", "profile.json")
IMAGES_DIR = os.path.join(os.path.dirname(__file__), "..", "web", "public", "images")
TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "templates")

# Ensure images dir exists
os.makedirs(IMAGES_DIR, exist_ok=True)


def load_profile():
    try:
        with open(PROFILE_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {"error": "profile.json not found"}


def save_profile(data: dict):
    with open(PROFILE_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


profile_data = load_profile()

# Initialize Gemini Client via Vertex AI
try:
    project = os.environ.get("GCP_PROJECT_ID")
    location = os.environ.get("GCP_LOCATION")
    client = genai.Client(vertexai=True, project=project, location=location)
except Exception as e:
    client = None
    print(f"Warning: Failed to initialize Gemini Client: {e}")


# === Auth ===

def verify_token(request: Request):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = auth[7:]
    try:
        data = serializer.loads(token, max_age=86400)  # 24h
        if data.get("email") != ADMIN_EMAIL:
            raise HTTPException(status_code=403, detail="Forbidden")
        return data
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


class GoogleCredential(BaseModel):
    credential: str


@app.post("/api/auth/google")
def google_auth(cred: GoogleCredential):
    try:
        idinfo = id_token.verify_oauth2_token(
            cred.credential, google_requests.Request(), GOOGLE_CLIENT_ID
        )
        email = idinfo.get("email", "")
        if email != ADMIN_EMAIL:
            raise HTTPException(status_code=403, detail="Email not authorized")
        token = serializer.dumps({"email": email, "name": idinfo.get("name", "")})
        return {"token": token, "email": email, "name": idinfo.get("name", "")}
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google credential")


# === Admin Page ===

@app.get("/admin", response_class=HTMLResponse)
def admin_page():
    template_path = os.path.join(TEMPLATE_DIR, "admin.html")
    with open(template_path, "r", encoding="utf-8") as f:
        html = f.read()
    html = html.replace("{{GOOGLE_CLIENT_ID}}", GOOGLE_CLIENT_ID)
    return HTMLResponse(content=html)


# === Profile API ===

@app.get("/api/profile")
def get_profile(_=Depends(verify_token)):
    return load_profile()


@app.put("/api/profile")
async def update_profile(request: Request, _=Depends(verify_token)):
    body = await request.json()
    save_profile(body)
    global profile_data
    profile_data = body
    return {"status": "ok"}


# === Images API ===

@app.get("/api/images")
def list_images(_=Depends(verify_token)):
    if not os.path.isdir(IMAGES_DIR):
        return []
    return sorted([f for f in os.listdir(IMAGES_DIR) if not f.startswith(".")])


@app.post("/api/upload-image")
async def upload_image(file: UploadFile = File(...), _=Depends(verify_token)):
    dest = os.path.join(IMAGES_DIR, file.filename)
    with open(dest, "wb") as f:
        content = await file.read()
        f.write(content)
    return {"filename": file.filename}


@app.delete("/api/images/{filename}")
def delete_image(filename: str, _=Depends(verify_token)):
    path = os.path.join(IMAGES_DIR, filename)
    if os.path.exists(path):
        os.remove(path)
        return {"status": "deleted"}
    raise HTTPException(status_code=404, detail="Image not found")


# === Chat API ===

class ChatRequest(BaseModel):
    message: str


@app.post("/api/chat")
def chat(request: ChatRequest):
    if not client:
        raise HTTPException(status_code=500, detail="Gemini client not initialized.")

    current_profile = load_profile()
    system_instruction = f"""
Você é um assistente de IA integrado ao terminal pessoal do João. Responda às perguntas com base neste perfil:
{json.dumps(current_profile, indent=2)}

Seja amigável, direto, conciso e profissional. O visual do site é terroso e voltado para terminal, então você pode ocasionalmente usar um estilo que lembre sistemas ou respostas pragmáticas.
IMPORTANTE: Nunca use formatação markdown (como **negrito**, *itálico*, ou # títulos). Responda sempre usando apenas texto puro (plain text), como em um terminal clássico.
"""

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash-lite',
            contents=request.message,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7,
            ),
        )
        return {"reply": response.text}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
