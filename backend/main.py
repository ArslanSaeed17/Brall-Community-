from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from supabase import create_client, Client
import os, uuid, secrets
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Brall Community API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "brall@admin2024")
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", secrets.token_hex(32))

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ─── Auth ────────────────────────────────────────────────────────────────────

def verify_token(token: str = None):
    if not token or token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True

@app.post("/api/admin/login")
async def login(data: dict):
    if data.get("password") == ADMIN_PASSWORD:
        return {"token": ADMIN_TOKEN, "message": "Login successful"}
    raise HTTPException(status_code=401, detail="Wrong password")

@app.get("/api/admin/verify")
async def verify(token: str):
    verify_token(token)
    return {"valid": True}

# ─── History Posts ────────────────────────────────────────────────────────────

@app.get("/api/history")
async def get_history():
    res = supabase.table("history_posts").select("*").order("created_at", desc=True).execute()
    return res.data

@app.post("/api/history")
async def create_history(
    title: str = Form(...),
    content: str = Form(...),
    era: str = Form(""),
    token: str = Form(...),
    image: UploadFile = File(None)
):
    verify_token(token)
    image_url = None
    if image and image.filename:
        ext = image.filename.split(".")[-1]
        fname = f"history/{uuid.uuid4()}.{ext}"
        data = await image.read()
        supabase.storage.from_("brall-media").upload(fname, data, {"content-type": image.content_type})
        image_url = supabase.storage.from_("brall-media").get_public_url(fname)

    res = supabase.table("history_posts").insert({
        "title": title, "content": content, "era": era,
        "image_url": image_url, "created_at": datetime.utcnow().isoformat()
    }).execute()
    return res.data[0]

@app.delete("/api/history/{post_id}")
async def delete_history(post_id: int, token: str):
    verify_token(token)
    supabase.table("history_posts").delete().eq("id", post_id).execute()
    return {"deleted": True}

@app.put("/api/history/{post_id}")
async def update_history(post_id: int, data: dict):
    verify_token(data.get("token"))
    res = supabase.table("history_posts").update({
        "title": data.get("title"),
        "content": data.get("content"),
        "era": data.get("era")
    }).eq("id", post_id).execute()
    return res.data[0]

# ─── Gallery ──────────────────────────────────────────────────────────────────

@app.get("/api/gallery")
async def get_gallery():
    res = supabase.table("gallery_items").select("*").order("created_at", desc=True).execute()
    return res.data

@app.post("/api/gallery")
async def upload_gallery(
    caption: str = Form(""),
    category: str = Form("general"),
    token: str = Form(...),
    file: UploadFile = File(...)
):
    verify_token(token)
    ext = file.filename.split(".")[-1].lower()
    media_type = "video" if ext in ["mp4", "webm", "mov"] else "image"
    fname = f"gallery/{uuid.uuid4()}.{ext}"
    data = await file.read()
    supabase.storage.from_("brall-media").upload(fname, data, {"content-type": file.content_type})
    url = supabase.storage.from_("brall-media").get_public_url(fname)

    res = supabase.table("gallery_items").insert({
        "url": url, "caption": caption, "category": category,
        "media_type": media_type, "created_at": datetime.utcnow().isoformat()
    }).execute()
    return res.data[0]

@app.delete("/api/gallery/{item_id}")
async def delete_gallery(item_id: int, token: str):
    verify_token(token)
    supabase.table("gallery_items").delete().eq("id", item_id).execute()
    return {"deleted": True}

# ─── Stats ────────────────────────────────────────────────────────────────────

@app.get("/api/stats")
async def get_stats():
    history = supabase.table("history_posts").select("id", count="exact").execute()
    gallery = supabase.table("gallery_items").select("id", count="exact").execute()
    return {
        "history_count": history.count,
        "gallery_count": gallery.count,
    }
