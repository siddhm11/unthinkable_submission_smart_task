#!/usr/bin/env python3
"""
Smart Task Planner - Startup Script
Powered by Groq's Lightning-Fast LLM Infrastructure
"""
import uvicorn
import sys
import os
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

def main():
    """Run the FastAPI application"""
    try:
        from app.config import settings

        print("🚀 Starting Smart Task Planner API...")
        print("⚡ Powered by Groq's Ultra-Fast LLMs")
        print(f"📍 Environment: {settings.environment}")
        print(f"🔧 Debug mode: {settings.debug}")
        print(f"🧠 AI Model: Llama 3 70B (via Groq)")
        print()
        print("📚 API Documentation: http://localhost:8000/docs")
        print("❤️  Health Check: http://localhost:8000/health")
        print("🔑 Don't forget to set your GROQ_API_KEY!")
        print()

        # Check if Groq API key is set
        if not settings.groq_api_key:
            print("⚠️  WARNING: GROQ_API_KEY not found!")
            print("   Get your free API key at: https://console.groq.com")
            print("   Set it in your .env file or environment variables")
            print()
        else:
            print("✅ Groq API key configured")
            print()

        print("Press Ctrl+C to stop the server")
        print("-" * 60)

        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8000,
            reload=settings.debug,
            log_level="info" if not settings.debug else "debug"
        )
    except KeyboardInterrupt:
        print("\n👋 Shutting down gracefully...")
    except ImportError as e:
        print(f"❌ Import Error: {e}")
        print("💡 Make sure to install dependencies: pip install -r requirements.txt")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
