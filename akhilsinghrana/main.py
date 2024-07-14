# Docstring
"""This is the main file for the FastAPI app."""
# Importing the required modules
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI()

# mount our homepage
app.mount(
    "/static", StaticFiles(directory="akhilsinghrana/static", html=True), name="static"
)

# Set up Jinja2 template
templates = Jinja2Templates(directory="akhilsinghrana/pages")


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse({"request": request}, "homepage.html")
