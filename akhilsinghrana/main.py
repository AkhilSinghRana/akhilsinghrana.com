import os
from fastapi import BackgroundTasks
import asyncio
from fastapi import FastAPI, Request, Form, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import logging
from collections import defaultdict
import time
from together import Together
import gc
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


@app.post("/contact")
async def contact(
    request: Request,
    name: str = Form(...),
    email: str = Form(...),
    message: str = Form(...),
):
    # Simple rate limiting (you might want to use a more robust solution)
    client_ip = request.client.host
    if is_rate_limited(client_ip):
        raise HTTPException(status_code=429, detail="Too many requests")

    try:
        send_email(name, email, message)
        # Redirect to the home page after successful form submission
        return RedirectResponse(url="/", status_code=303)
    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send email")


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


# client = Together(api_key=os.getenv("TOGETHER_API_KEY"))
# def together_api(user_query):
#     response = client.chat.completions.create(
#         model="meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo",
#         messages=[{"role": "user", "content": user_query}],
#         max_tokens=1024,
#         temperature=0.7,
#         top_p=0.7,
#         top_k=50,
#         repetition_penalty=1,
#         stop=["<|eot_id|>"],
#         stream=True,
#     )

#     # Since the response is streamed, we need to collect all chunks
#     full_response = ""
#     for chunk in response:
#         if chunk.choices[0].delta.content is not None:
#             full_response += chunk.choices[0].delta.content

#     return full_response




@app.post("/api/chat")
async def chat_endpoint(chat_message: ChatMessage):
    try:
        # response = together_api(chat_message.message)
        question = {"input": chat_message.message}

        response = custom_chatBot.get_answer(question)
        print(response)
        # Perform garbage collection
        #gc.collect()
        return {"response": response["response"]}

    except Exception as e:
        # Perform garbage collection even if an error occurs
        gc.collect()
        raise HTTPException(status_code=500, detail=str(e))


async def periodic_garbage_collection():
    while True:
        await asyncio.sleep(300)  # Run every 5 minutes
        gc.collect()


@app.on_event("startup")
async def start_periodic_tasks():
    asyncio.create_task(periodic_garbage_collection())
