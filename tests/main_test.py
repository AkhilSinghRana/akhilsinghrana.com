from fastapi.testclient import TestClient
from akhilsinghrana.backend.main import app

client = TestClient(app)


def test_contact_honeypot():
    """Honeypot field filled → silently returns 200 without sending email."""
    response = client.post("/contact", data={
        "name": "Bot",
        "email": "bot@spam.com",
        "message": "Buy cheap meds",
        "website": "http://spam.com",  # honeypot filled
    })
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_blog_not_found():
    response = client.get("/api/blog/nonexistent-slug")
    assert response.status_code == 404
