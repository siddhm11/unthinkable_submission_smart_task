# Smart Task Planner API

An AI-powered task planning system that breaks down user goals into actionable tasks with dependencies using **Groq's Lightning-Fast LLM Infrastructure**.

## 🚀 Why Groq?

- **⚡ Ultra-Fast Inference**: 10x faster than traditional cloud LLMs
- **💰 Cost-Effective**: More affordable than OpenAI for high-volume usage  
- **🧠 Powerful Models**: Llama 3 70B, Mixtral 8x7B, and other state-of-the-art models
- **🔒 Reliable**: Enterprise-grade infrastructure with high availability

## Features

- 🎯 **Goal-driven task generation**: Submit high-level goals and get detailed task breakdowns
- ⚡ **Lightning-fast AI planning**: Uses Groq's speed-optimized LLMs for instant task generation
- 📊 **Task dependencies**: Automatically creates task dependency graphs (DAG)
- 🔐 **JWT Authentication**: Secure user authentication and authorization
- 📱 **RESTful API**: Clean, well-documented API endpoints
- 🐳 **Docker ready**: Containerized for easy deployment
- 📈 **Scalable architecture**: Built with FastAPI for high performance

## Quick Start

### Prerequisites

- Python 3.11+
- Docker and Docker Compose (optional)
- **Groq API key** (get free at [console.groq.com](https://console.groq.com))

### Get Your Groq API Key

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `gsk_...`)

### Environment Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd smart-task-planner
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```env
DATABASE_URL=postgresql://username:password@localhost/taskplanner
SECRET_KEY=your-secret-key-here-change-in-production
GROQ_API_KEY=gsk_your_groq_api_key_here
```

### Running with Docker (Recommended)

1. Set your Groq API key:
```bash
export GROQ_API_KEY=gsk_your_groq_api_key_here
```

2. Start the services:
```bash
docker-compose up -d
```

3. Access the services:
   - **API**: http://localhost:8000
   - **API Documentation**: http://localhost:8000/docs  
   - **Database Admin**: http://localhost:8080

### Running Locally

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the development server:
```bash
python run.py
```

## 🤖 AI Models Available

Groq supports multiple high-performance models:

- **`llama3-70b-8192`** (Default) - Best for complex reasoning and task planning
- **`mixtral-8x7b-32768`** - Excellent for structured output and long context
- **`llama3-8b-8192`** - Fast and efficient for simpler tasks

The system automatically uses `llama3-70b-8192` for optimal task planning results.

## API Documentation

### Authentication

#### Register a new user
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securepassword"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=securepassword
```

### Goals

#### Create a new goal (triggers AI task generation)
```http
POST /api/v1/goals/
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Launch a mobile app in 3 months"
}
```

#### Get all user goals
```http
GET /api/v1/goals/
Authorization: Bearer <token>
```

#### Get specific goal with tasks
```http
GET /api/v1/goals/{goal_id}
Authorization: Bearer <token>
```

### Tasks

#### Update a task
```http
PATCH /api/v1/tasks/{task_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed",
  "name": "Updated task name"
}
```

#### Add task dependency
```http
POST /api/v1/tasks/{task_id}/dependencies
Authorization: Bearer <token>
Content-Type: application/json

{
  "depends_on_task_id": "uuid-of-prerequisite-task"
}
```

## Architecture

The system follows a three-tier architecture:

1. **Frontend**: React/Vue.js client application
2. **Backend**: FastAPI application with:
   - JWT authentication
   - **Groq LLM integration** for ultra-fast AI planning
   - RESTful API endpoints
   - Background task processing
3. **Database**: PostgreSQL with:
   - User management
   - Goal storage
   - Task management with dependencies

## Project Structure

```
smart-task-planner/
├── app/
│   ├── routers/           # API route handlers
│   ├── models.py          # SQLAlchemy models
│   ├── schemas.py         # Pydantic schemas
│   ├── crud.py           # Database operations
│   ├── auth.py           # Authentication logic
│   ├── llm_service.py    # Groq integration
│   ├── dependencies.py   # FastAPI dependencies
│   ├── config.py         # Configuration
│   └── main.py           # FastAPI application
├── alembic/              # Database migrations
├── tests/                # Test files
├── requirements.txt      # Python dependencies
├── Dockerfile           # Container configuration
├── docker-compose.yml   # Multi-container setup
└── README.md           # This file
```

## 🚀 Performance Benefits with Groq

### Speed Comparison
- **Groq**: ~100-500 tokens/second
- **OpenAI GPT-4**: ~20-40 tokens/second
- **Result**: 5-10x faster task generation

### Cost Benefits
- **Groq**: $0.59/1M input tokens, $0.79/1M output tokens (Llama 3 70B)
- **OpenAI GPT-4**: $30/1M input tokens, $60/1M output tokens
- **Result**: ~50-75x more cost-effective

## Development

### Running Tests

```bash
pytest
```

### Database Migrations

```bash
# Generate migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head
```

### Code Formatting

```bash
# Format code
black app/

# Sort imports
isort app/
```

## Deployment

### Production Docker Build

```bash
docker build -t smart-task-planner .
docker run -p 8000:8000 -e GROQ_API_KEY=your_key smart-task-planner
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `sqlite:///./taskplanner.db` |
| `SECRET_KEY` | JWT signing key | Required |
| `GROQ_API_KEY` | Groq API key (from console.groq.com) | Required |
| `ENVIRONMENT` | Runtime environment | `development` |
| `DEBUG` | Enable debug mode | `True` |

## API Features

### Task Dependency Management

The system automatically creates task dependencies based on Groq LLM analysis:

- **Finish-to-Start**: Task B cannot start until Task A finishes
- **Circular dependency detection**: Prevents invalid dependency loops
- **Dependency visualization**: Tasks form a Directed Acyclic Graph (DAG)

### Groq LLM Integration

- **Lightning-fast task breakdown**: Uses Llama 3 70B for intelligent goal analysis
- **Advanced error handling**: Robust error handling for API failures
- **Fallback mechanisms**: Graceful degradation when AI services are unavailable
- **Smart retry logic**: Automatic retries with exponential backoff
- **Model flexibility**: Easy to switch between Groq's available models

### Security

- **JWT authentication**: Stateless token-based authentication
- **Password hashing**: Secure password storage with bcrypt
- **Input validation**: Comprehensive request validation with Pydantic
- **CORS configuration**: Configurable cross-origin resource sharing

## 🔧 Groq Configuration

### Available Models
```python
# In app/llm_service.py, you can change the model:
self.model = "llama3-70b-8192"     # Best for complex reasoning (default)
self.model = "mixtral-8x7b-32768"  # Great for structured output
self.model = "llama3-8b-8192"      # Fastest option
```

### Performance Tuning
```python
# Adjust these parameters in LLMService for your needs:
self.max_retries = 3        # Number of retry attempts
self.retry_delay = 1.0      # Base delay between retries
self.timeout = 30.0         # Request timeout in seconds
```

## Example Usage

```bash
# 1. Create a goal
curl -X POST "http://localhost:8000/api/v1/goals/" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "Build and launch a SaaS product in 4 months"}'

# 2. The system will use Groq to break this down into tasks like:
# - Market research and competitor analysis (5 days)
# - Define product requirements and features (3 days) 
# - Design user interface and user experience (7 days)
# - Set up development environment (2 days)
# - Develop core features (45 days, depends on previous tasks)
# - Implement user authentication (5 days)
# - Create landing page and marketing site (7 days)
# - Launch and monitor initial release (3 days)
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Run tests: `pytest`
5. Commit your changes: `git commit -am 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue on GitHub or contact the development team.

---

**Powered by Groq's Lightning-Fast LLM Infrastructure** ⚡
