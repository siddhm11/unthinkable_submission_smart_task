import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import get_db, Base
import tempfile
import os

# Create a temporary database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module")
def client():
    # Create the database tables
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as test_client:
        yield test_client
    # Clean up
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("test.db"):
        os.remove("test.db")

def test_health_check(client):
    """Test the health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_root_endpoint(client):
    """Test the root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_user_registration(client):
    """Test user registration"""
    user_data = {
        "email": "test@example.com",
        "name": "Test User",
        "password": "testpassword123"
    }
    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 200
    assert response.json()["success"] is True

def test_user_login(client):
    """Test user login"""
    # First register a user
    user_data = {
        "email": "login@example.com",
        "name": "Login User",
        "password": "loginpassword123"
    }
    client.post("/api/v1/auth/register", json=user_data)

    # Then login
    login_data = {
        "username": "login@example.com",
        "password": "loginpassword123"
    }
    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"

def test_create_goal_without_auth(client):
    """Test creating a goal without authentication should fail"""
    goal_data = {"text": "Test goal"}
    response = client.post("/api/v1/goals/", json=goal_data)
    assert response.status_code == 401

def get_auth_headers(client):
    """Helper function to get authentication headers"""
    # Register and login
    user_data = {
        "email": "auth@example.com",
        "name": "Auth User",
        "password": "authpassword123"
    }
    client.post("/api/v1/auth/register", json=user_data)

    login_data = {
        "username": "auth@example.com",
        "password": "authpassword123"
    }
    response = client.post("/api/v1/auth/login", data=login_data)
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_create_goal_with_auth(client):
    """Test creating a goal with authentication"""
    headers = get_auth_headers(client)
    goal_data = {"text": "Launch a mobile app"}
    response = client.post("/api/v1/goals/", json=goal_data, headers=headers)
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert "goal_id" in response.json()["data"]

def test_get_user_goals(client):
    """Test getting user goals"""
    headers = get_auth_headers(client)

    # Create a goal first
    goal_data = {"text": "Test goal for listing"}
    client.post("/api/v1/goals/", json=goal_data, headers=headers)

    # Get goals
    response = client.get("/api/v1/goals/", headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

if __name__ == "__main__":
    pytest.main([__file__])
