import os
import asyncio
import json
import time
import gc
import logging
import smtplib
from collections import deque, defaultdict, OrderedDict
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from functools import lru_cache

from fastapi import FastAPI, Request, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from akhilsinghrana.backend.RAG_Chat import RAGChat

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

_BACKEND_DIR = os.path.dirname(__file__)
PAGES_DIR = os.getenv("PAGES_DIR", os.path.join(_BACKEND_DIR, "..", "frontend", "public", "blogs"))
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

custom_chatBot = RAGChat(recreateVectorDB=False, folder=PAGES_DIR)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Email queue ───────────────────────────────────────────────────────────────

class QueueItem(BaseModel):
    name: str
    email: str
    message: str

queue: deque = deque()

def process_queue_item(item: QueueItem):
    try:
        send_email(item.name, item.email, item.message)
        logger.info("Email sent successfully")
    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")

async def run_queue_tasks():
    while True:
        if queue:
            item = queue.popleft()
            process_queue_item(item)
        else:
            await asyncio.sleep(0.5)

async def periodic_garbage_collection():
    while True:
        await asyncio.sleep(300)
        gc.collect()

@app.on_event("startup")
async def startup_event():
    # Both background tasks registered in a single startup handler
    asyncio.create_task(run_queue_tasks())
    asyncio.create_task(periodic_garbage_collection())

# ── Rate limiting ─────────────────────────────────────────────────────────────

request_history: defaultdict = defaultdict(list)

def is_rate_limited(client_ip: str, max_requests: int = 20, time_frame: int = 60) -> bool:
    """Chat rate limit: 20 requests per 60 seconds per IP."""
    current_time = time.time()
    key = f"chat:{client_ip}"
    request_history[key] = [t for t in request_history[key] if current_time - t < time_frame]
    if len(request_history[key]) >= max_requests:
        return True
    request_history[key].append(current_time)
    return False

def is_contact_rate_limited(client_ip: str, max_requests: int = 3, time_frame: int = 3600) -> bool:
    """Contact rate limit: 3 submissions per hour per IP."""
    current_time = time.time()
    key = f"contact:{client_ip}"
    request_history[key] = [t for t in request_history[key] if current_time - t < time_frame]
    if len(request_history[key]) >= max_requests:
        return True
    request_history[key].append(current_time)
    return False

# ── Contact endpoint ──────────────────────────────────────────────────────────

@app.post("/contact")
async def contact(
    request: Request,
    background_tasks: BackgroundTasks,
    name: str = Form(...),
    email: str = Form(...),
    message: str = Form(...),
    website: str = Form(""),  # Honeypot — bots fill this, humans don't
):
    client_ip = request.client.host

    # Silently succeed if honeypot triggered
    if website:
        logger.info(f"Honeypot triggered from {client_ip}")
        return {"status": "ok", "message": "Message received"}

    if is_contact_rate_limited(client_ip):
        raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")

    queue.append(QueueItem(name=name, email=email, message=message))
    return {"status": "ok", "message": "Message received"}

def send_email(name: str, email: str, message: str):
    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")
    recipient_email = os.getenv("RECIPIENT_EMAIL")

    msg = MIMEMultipart()
    msg["From"] = smtp_username
    msg["To"] = recipient_email
    msg["Subject"] = f"New Contact Form Submission from {name}"
    msg.attach(MIMEText(f"Name: {name}\nEmail: {email}\nMessage: {message}", "plain"))

    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.send_message(msg)

# ── Blog endpoint ─────────────────────────────────────────────────────────────

@app.get("/api/blog/{slug}")
async def get_blog(slug: str):
    blog_path = os.path.join(PAGES_DIR, f"{slug}.html")
    try:
        with open(blog_path, "r", encoding="utf-8") as f:
            content = f.read()
        return {"html": content}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Blog not found")

# ── Chat endpoint ─────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    message: str

MAX_CACHE_SIZE = 30
_BOT_CACHE_FILE = os.path.join(os.path.dirname(__file__), "bot_cache.json")
_bot_cache: OrderedDict = OrderedDict()

def get_cached_answer(message: str, cache_file: str = _BOT_CACHE_FILE) -> dict:
    """
    File-backed cache for chat answers. Avoids lru_cache issues with mutable
    state and chatbot fallback (HF swap invalidates lru_cache implicitly).
    """
    global _bot_cache

    # Load from disk on first call
    if not _bot_cache:
        try:
            with open(cache_file, "r") as f:
                _bot_cache = json.load(f, object_pairs_hook=OrderedDict)
        except (FileNotFoundError, json.JSONDecodeError):
            _bot_cache = OrderedDict()

    question_key = json.dumps({"input": message})

    if question_key in _bot_cache:
        logger.info("Cache hit")
        _bot_cache.move_to_end(question_key)
        return _bot_cache[question_key]

    logger.info("Cache miss — calling LLM")
    bot_reply = custom_chatBot.get_answer({"input": message})

    # Evict oldest if at capacity
    if len(_bot_cache) >= MAX_CACHE_SIZE:
        _bot_cache.popitem(last=False)

    _bot_cache[question_key] = bot_reply
    _bot_cache.move_to_end(question_key)

    try:
        with open(cache_file, "w") as f:
            json.dump(_bot_cache, f)
    except Exception as e:
        logger.warning(f"Could not save cache: {e}")

    return bot_reply

@app.post("/api/chat")
async def chat_endpoint(request: Request, chat_message: ChatMessage):
    client_ip = request.client.host
    if is_rate_limited(client_ip):
        raise HTTPException(status_code=429, detail="Too many requests. Please slow down.")
    try:
        response = get_cached_answer(chat_message.message)
        return {"response": response["response"]}
    except Exception as e:
        gc.collect()
        logger.warning(f"Groq failed ({e}), falling back to HuggingFace")
        try:
            custom_chatBot.llm = custom_chatBot.get_hf_llm()
            custom_chatBot.create_execution_pipeline()
            response = get_cached_answer(chat_message.message)
            return {"response": response["response"]}
        except Exception as e2:
            gc.collect()
            logger.error(f"HF fallback also failed: {e2}")
            raise HTTPException(status_code=500, detail="Chat service temporarily unavailable")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("akhilsinghrana.backend.main:app", host="0.0.0.0", port=8000, reload=True)
