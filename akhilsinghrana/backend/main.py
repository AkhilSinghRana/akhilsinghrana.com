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
from typing import Optional

from fastapi import FastAPI, Request, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from together import Together
from akhilsinghrana.backend.RAG_Chat import RAGChat

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

PAGES_DIR = os.getenv("PAGES_DIR", "../frontend/public/blogs")
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

class QueueItem(BaseModel):
    name: str
    email: str
    message: str

queue = deque()

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

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(run_queue_tasks())

request_history = defaultdict(list)

def is_rate_limited(client_ip: str, max_requests: int = 5, time_frame: int = 60) -> bool:
    current_time = time.time()
    request_history[client_ip] = [
        t for t in request_history[client_ip] if current_time - t < time_frame
    ]
    if len(request_history[client_ip]) >= max_requests:
        return True
    request_history[client_ip].append(current_time)
    return False

@app.post("/contact")
async def contact(
    request: Request,
    background_tasks: BackgroundTasks,
    name: str = Form(...),
    email: str = Form(...),
    message: str = Form(...),
):
    client_ip = request.client.host
    if is_rate_limited(client_ip):
        raise HTTPException(status_code=429, detail="Too many requests")
    item = QueueItem(name=name, email=email, message=message)
    queue.append(item)
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

    body = f"Name: {name}\nEmail: {email}\nMessage: {message}"
    msg.attach(MIMEText(body, "plain"))

    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.send_message(msg)

@app.get("/api/blog/{slug}")
async def get_blog(slug: str):
    blog_path = os.path.join(PAGES_DIR, f"{slug}.html")
    try:
        with open(blog_path, "r", encoding="utf-8") as f:
            content = f.read()
        return {"html": content}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Blog not found")

class ChatMessage(BaseModel):
    message: str

MAX_CACHE_SIZE = 30

@lru_cache(maxsize=20)
def cached_get_answer(message: str, reset_cache: bool = False, cache_file: str = "./bot_cache.json") -> str:
    question = {"input": message}
    cache_file_path = cache_file

    if reset_cache:
        cached_data = OrderedDict()
    else:
        try:
            with open(cache_file_path, "r") as file:
                cached_data = json.load(file, object_pairs_hook=OrderedDict)
        except FileNotFoundError:
            print(f"Cache file not found. Creating a new one at {cache_file_path}")
            cached_data = OrderedDict()
        except json.JSONDecodeError:
            print("Invalid JSON in cache file. Starting with an empty cache.")
            cached_data = OrderedDict()
        except Exception as e:
            print(f"Error loading cached data: {e}")
            cached_data = OrderedDict()

    question_key = json.dumps(question)

    if question_key in cached_data:
        print("Data fetched from local cache")
        cached_data.move_to_end(question_key)
        return cached_data[question_key]

    logging.info("Sending API request")
    bot_reply = custom_chatBot.get_answer(question)

    if len(cached_data) >= MAX_CACHE_SIZE:
        cached_data.popitem(last=False)

    cached_data[question_key] = bot_reply
    cached_data.move_to_end(question_key)

    try:
        with open(cache_file_path, "w") as file:
            json.dump(cached_data, file)
    except Exception as e:
        print(f"Error saving cache: {e}")

    return bot_reply

@app.post("/api/chat")
async def chat_endpoint(chat_message: ChatMessage):
    try:
        response = cached_get_answer(chat_message.message)
        print(response)
        return {"response": response["response"]}
    except Exception as e:
        gc.collect()
        print("Something went wrong with Groq, falling back to use huggingface")
        try:
            custom_chatBot.llm = custom_chatBot.get_hf_llm()
            print(custom_chatBot.llm)
            custom_chatBot.create_execution_pipeline()
            response = cached_get_answer(chat_message.message)
            print(response)
            return {"response": response["response"]}
        except Exception as e:
            gc.collect()
            raise HTTPException(status_code=500, detail=str(e))

async def periodic_garbage_collection():
    while True:
        await asyncio.sleep(300)
        gc.collect()

@app.on_event("startup")
async def start_periodic_tasks():
    asyncio.create_task(periodic_garbage_collection())
