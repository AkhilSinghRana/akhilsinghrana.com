import os
from fastapi import FastAPI, Request, Form, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import logging
from collections import defaultdict
import time
# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.mount("/static", StaticFiles(directory="akhilsinghrana/static", html=True), name="static")

templates = Jinja2Templates(directory="akhilsinghrana/pages")

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse({"request": request}, "homepage.html")

@app.post("/contact")
async def contact(request: Request, name: str = Form(...), email: str = Form(...), message: str = Form(...)):
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
    msg['From'] = smtp_username
    msg['To'] = recipient_email
    msg['Subject'] = f"New Contact Form Submission from {name}"

    body = f"Name: {name}\nEmail: {email}\nMessage: {message}"
    msg.attach(MIMEText(body, 'plain'))

    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.starttls()
        server.login(smtp_username, smtp_password)
        
        server.send_message(msg)



# Store the last request times for each IP
request_history = defaultdict(list)

def is_rate_limited(client_ip: str, max_requests: int = 5, time_frame: int = 60) -> bool:
    current_time = time.time()
    
    # Remove old requests
    request_history[client_ip] = [t for t in request_history[client_ip] if current_time - t < time_frame]
    
    # Check if the number of recent requests exceeds the limit
    if len(request_history[client_ip]) >= max_requests:
        return True
    
    # Add the current request time
    request_history[client_ip].append(current_time)
    
    return False