import os
from fastapi import BackgroundTasks
import asyncio
from fastapi import FastAPI, Request, Form, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from typing import Optional
from collections import deque
from fastapi.templating import Jinja2Templates
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import logging
from collections import defaultdict
import time
import json
from collections import OrderedDict
from together import Together
import gc
from functools import cache, lru_cache
from akhilsinghrana.RAG_Chat import RAGChat

# Create my Chatbot
custom_chatBot = RAGChat(recreateVectorDB=False, folder="./akhilsinghrana/pages")

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.mount(
    "/static", StaticFiles(directory="akhilsinghrana/static", html=True), name="static"
)

templates = Jinja2Templates(directory="akhilsinghrana/pages")


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse({"request": request}, "homepage.html")


@app.get("/blog/{blog_name}", response_class=HTMLResponse)
async def read_blog(request: Request, blog_name: str):
    return templates.TemplateResponse(f"{blog_name}.html", {"request": request})


class QueueItem(BaseModel):
    name: str
    email: str
    message: str

# Initialize a queue as a deque (double-ended queue)
queue = deque()

# Define a task function for handling queue items
def process_queue_item(item: QueueItem):
    try:
        send_email(item.name, item.email, item.message)
        logger.info("Email sent successfully")
    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")

# Define a function for running queue tasks in the background
async def run_queue_tasks():
    while True:
        # Check if there are items in the queue
        if queue:
            item = queue.popleft()
            process_queue_item(item)
        else:
            # If the queue is empty, wait for a short period before checking again
            await asyncio.sleep(0.5)

# Start the queue task in the background when the app starts
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(run_queue_tasks())

# Modify the contact function to add items to the queue
@app.post("/contact")
async def contact(
    request: Request,
    background_tasks: BackgroundTasks,
    name: str = Form(...),
    email: str = Form(...),
    message: str = Form(...),
):
    # Simple rate limiting (you might want to use a more robust solution)
    client_ip = request.client.host
    if is_rate_limited(client_ip):
        raise HTTPException(status_code=429, detail="Too many requests")

    # Create a queue item and add it to the queue
    item = QueueItem(name=name, email=email, message=message)
    queue.append(item)

    # Return immediately without waiting for the email to be sent
    return RedirectResponse(url="/", status_code=303)

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


# Store the last request times for each IP
request_history = defaultdict(list)


def is_rate_limited(
    client_ip: str, max_requests: int = 5, time_frame: int = 60
) -> bool:
    current_time = time.time()

    # Remove old requests
    request_history[client_ip] = [
        t for t in request_history[client_ip] if current_time - t < time_frame
    ]

    # Check if the number of recent requests exceeds the limit
    if len(request_history[client_ip]) >= max_requests:
        return True

    # Add the current request time
    request_history[client_ip].append(current_time)

    return False


# Implementation for integrating LLMs
class ChatMessage(BaseModel):
    message: str


MAX_CACHE_SIZE = 30
@lru_cache(maxsize=20)
def cached_get_answer(message: str, reset_cache: bool = False, cache_file: str = "bot_cache.json") -> str:
    question = {"input": message}
    cache_file_path = os.path.join("akhilsinghrana", "static", cache_file)

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

    # Convert the question dict to a string for use as a key
    question_key = json.dumps(question)

    if question_key in cached_data:
        print("Data fetched from local cache")
        # Move the accessed item to the end to mark it as most recently used
        cached_data.move_to_end(question_key)
        return cached_data[question_key]

    logging.info("Sending API request")
    bot_reply = custom_chatBot.get_answer(question)

    # Update the cache
    if len(cached_data) >= MAX_CACHE_SIZE:
        # Remove the least recently used item (first item in OrderedDict)
        cached_data.popitem(last=False)
    
    cached_data[question_key] = bot_reply
    # Move the new item to the end to mark it as most recently used
    cached_data.move_to_end(question_key)

    # Save the updated cache
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
        # Perform garbage collection even if an error occurs
        gc.collect()
        print("Something went wrong with Groq, falling back to use huggingface")

        try:
            custom_chatBot.llm = custom_chatBot.get_hf_llm()
            print(custom_chatBot.llm)
            custom_chatBot.create_execution_pipeline()
            # response = together_api(chat_message.message)
            response = cached_get_answer(chat_message.message)
            print(response)
            # Perform garbage collection

            return {"response": response["response"]}
        except Exception as e:
            gc.collect()
            raise HTTPException(status_code=500, detail=str(e))


async def periodic_garbage_collection():
    while True:
        await asyncio.sleep(300)  # Run every 5 minutes
        gc.collect()c


@app.on_event("startup")
async def start_periodic_tasks():
    asyncio.create_task(periodic_garbage_collection())
