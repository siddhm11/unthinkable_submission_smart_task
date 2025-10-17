from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.database import engine
from app import models
from app.routers import auth, goals, tasks

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up...")
    # Create database tables
    models.Base.metadata.create_all(bind=engine)
    logger.info("Database tables created")
    yield
    # Shutdown
    logger.info("Shutting down...")

# Create FastAPI app
app = FastAPI(
    title=settings.project_name,
    description="An AI-powered task planning system that breaks down goals into actionable tasks with dependencies using Groq's Lightning-Fast LLMs",
    version="1.0.0",
    openapi_url=f"{settings.api_v1_str}/openapi.json",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Smart Task Planner API is running", "powered_by": "Groq Lightning-Fast LLMs"}

# Include routers
app.include_router(auth.router, prefix=settings.api_v1_str)
app.include_router(goals.router, prefix=settings.api_v1_str)
app.include_router(tasks.router, prefix=settings.api_v1_str)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception handler caught: {exc}")
    return HTTPException(
        status_code=500,
        detail="Internal server error"
    )

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to Smart Task Planner API",
        "version": "1.0.0",
        "powered_by": "Groq Lightning-Fast LLMs ⚡",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )
