from fastapi.testclient import TestClient
from akhilsinghrana.main import app

client = TestClient(app)


def test_info():
    response = client.get("/")
    assert response.status_code == 200
