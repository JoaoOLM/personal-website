import os
import json
import shutil
import sqlite3
import hashlib
import time
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
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

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROFILE_PATH = os.path.join(BASE_DIR, "..", "profile.json")
IMAGES_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "web", "public", "images"))
TEMPLATE_DIR = os.path.join(BASE_DIR, "templates")
CACHE_DB = os.path.join(BASE_DIR, "cache.db")
PORTFOLIO_DB = os.path.join(BASE_DIR, "portfolio.db")

# Ensure images dir exists
os.makedirs(IMAGES_DIR, exist_ok=True)

# === AI Cache Setup ===
def init_cache_db():
    conn = sqlite3.connect(CACHE_DB)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS ai_cache
                 (query_hash TEXT PRIMARY KEY, response TEXT)''')
    conn.commit()
    conn.close()

init_cache_db()

def get_cached_response(query: str):
    q_hash = hashlib.md5(query.lower().strip().encode()).hexdigest()
    conn = sqlite3.connect(CACHE_DB)
    c = conn.cursor()
    c.execute("SELECT response FROM ai_cache WHERE query_hash=?", (q_hash,))
    res = c.fetchone()
    conn.close()
    return res[0] if res else None

def save_to_cache(query: str, response: str):
    q_hash = hashlib.md5(query.lower().strip().encode()).hexdigest()
    conn = sqlite3.connect(CACHE_DB)
    c = conn.cursor()
    c.execute("INSERT OR REPLACE INTO ai_cache VALUES (?, ?)", (q_hash, response))
    conn.commit()
    conn.close()

def init_portfolio_db():
    conn = sqlite3.connect(PORTFOLIO_DB)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS profile_data (id INTEGER PRIMARY KEY, data TEXT)''')
    
    # Migration from profile.json if db is empty
    c.execute("SELECT COUNT(*) FROM profile_data")
    if c.fetchone()[0] == 0:
        if os.path.exists(PROFILE_PATH):
            with open(PROFILE_PATH, "r", encoding="utf-8") as f:
                data = f.read()
                c.execute("INSERT INTO profile_data (id, data) VALUES (1, ?)", (data,))
        else:
            c.execute("INSERT INTO profile_data (id, data) VALUES (1, '{}')")
    
    conn.commit()
    conn.close()

init_portfolio_db()

def load_profile():
    conn = sqlite3.connect(PORTFOLIO_DB)
    c = conn.cursor()
    c.execute("SELECT data FROM profile_data WHERE id=1")
    row = c.fetchone()
    conn.close()
    if row:
        return json.loads(row[0])
    return {}

def save_profile(data: dict):
    conn = sqlite3.connect(PORTFOLIO_DB)
    c = conn.cursor()
    c.execute("UPDATE profile_data SET data=? WHERE id=1", (json.dumps(data, ensure_ascii=False),))
    conn.commit()
    conn.close()


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
    
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    html = html.replace("{{FRONTEND_URL}}", frontend_url)
    
    return HTMLResponse(content=html)


# === Profile API ===

@app.get("/api/profile")
def get_profile():
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

@app.post("/api/upload-cv")
async def upload_cv(file: UploadFile = File(...), _=Depends(verify_token)):
    content = await file.read()
    
    mgc_bucket = os.getenv("MGC_BUCKET_NAME")
    mgc_access_key = os.getenv("MGC_ACCESS_KEY")
    mgc_secret_key = os.getenv("MGC_SECRET_KEY")
    mgc_endpoint = os.getenv("MGC_ENDPOINT_URL")

    # If S3 credentials are provided, upload to Magalu Cloud Bucket
    if mgc_bucket and mgc_access_key and mgc_secret_key and mgc_endpoint:
        import boto3
        s3 = boto3.client(
            's3',
            endpoint_url=mgc_endpoint,
            aws_access_key_id=mgc_access_key,
            aws_secret_access_key=mgc_secret_key,
            region_name="us-east-1" # Often required by boto3 even for custom endpoints
        )
        try:
            s3.put_object(
                Bucket=mgc_bucket,
                Key='cv.pdf',
                Body=content,
                ContentType='application/pdf',
                ACL='public-read'
            )
            return {"status": "ok", "filename": "cv.pdf", "storage": "s3"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"S3 Upload failed: {str(e)}")
    
    # Fallback to local storage if no S3 config
    cv_dest = os.path.join(IMAGES_DIR, "..", "cv.pdf")
    cv_dest = os.path.abspath(cv_dest)
    with open(cv_dest, "wb") as f:
        f.write(content)
    return {"status": "ok", "filename": "cv.pdf", "storage": "local"}



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
        cached_res = get_cached_response(request.message)
        
        if cached_res:
            def iter_cached_response():
                chunk_size = 4
                for i in range(0, len(cached_res), chunk_size):
                    yield cached_res[i:i+chunk_size]
                    time.sleep(0.01)
            return StreamingResponse(iter_cached_response(), media_type="text/plain")

        response_stream = client.models.generate_content_stream(
            model='gemini-2.5-flash-lite',
            contents=request.message,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7,
            ),
        )
        
        def iter_response():
            full_response = ""
            for chunk in response_stream:
                if chunk.text:
                    full_response += chunk.text
                    yield chunk.text
            save_to_cache(request.message, full_response)

        return StreamingResponse(iter_response(), media_type="text/plain")
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
