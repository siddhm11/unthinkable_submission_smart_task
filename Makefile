# Smart Task Planner Makefile

.PHONY: help install run test clean docker-build docker-run docker-stop

help:
	@echo "Smart Task Planner - Available Commands:"
	@echo "  install      Install Python dependencies"
	@echo "  run          Run the development server"
	@echo "  test         Run the test suite"
	@echo "  clean        Clean up temporary files"
	@echo "  docker-build Build Docker image"
	@echo "  docker-run   Run with Docker Compose"
	@echo "  docker-stop  Stop Docker services"

install:
	pip install -r requirements.txt

run:
	python run.py

test:
	pytest tests/ -v

clean:
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	rm -f *.db test.db

docker-build:
	docker build -t smart-task-planner .

docker-run:
	docker-compose up -d

docker-stop:
	docker-compose down

docker-logs:
	docker-compose logs -f app
