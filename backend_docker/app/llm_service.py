import json
import asyncio
from typing import List, Dict, Any, Optional
from groq import AsyncGroq
from fastapi import HTTPException
import logging

from app.config import settings
from app.schemas import LLMPlanResponse, LLMTaskResponse

# Configure logging
logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.max_retries = 3
        self.retry_delay = 1.0
        self.timeout = 30.0
        # Initialize Groq client
        self.client = AsyncGroq(api_key=settings.groq_api_key)
        # Best Groq models for task planning
        self.model = "llama-3.3-70b-versatile"  # Fast and intelligent model
        # Alternative models: "mixtral-8x7b-32768", "llama3-8b-8192"

    async def generate_task_plan(self, goal_text: str) -> LLMPlanResponse:
        """Generate a task plan from a goal using Groq's LLM models"""
        prompt = self._create_planning_prompt(goal_text)

        for attempt in range(self.max_retries):
            try:
                response = await self._call_groq_api(prompt)
                return self._parse_llm_response(response)
            except Exception as e:
                logger.warning(f"Groq API call attempt {attempt + 1} failed: {str(e)}")
                if attempt == self.max_retries - 1:
                    # Last attempt failed, raise exception
                    raise HTTPException(
                        status_code=503,
                        detail="AI service temporarily unavailable. Please try again later."
                    )
                # Wait before retrying
                await asyncio.sleep(self.retry_delay * (2 ** attempt))

        # This should never be reached, but just in case
        raise HTTPException(
            status_code=503,
            detail="AI service temporarily unavailable"
        )

    def _create_planning_prompt(self, goal_text: str) -> str:
        """Create a structured prompt for task planning optimized for Groq models"""
        return f"""You are an expert project manager and task planning assistant. Your job is to break down user goals into actionable tasks with clear dependencies and realistic time estimates.

INSTRUCTIONS:
1. Analyze the following goal and break it down into 3-8 concrete, actionable tasks
2. Each task should be specific, measurable, and achievable
3. Estimate realistic duration in days for each task (minimum 1 day)
4. Identify dependencies between tasks (which tasks must be completed before others can start)
5. Tasks should follow a logical sequence that leads to goal completion
6. Return your response in valid JSON format ONLY - no additional text

GOAL: {goal_text}

Return a JSON response with this exact structure:
{{
  "tasks": [
    {{
      "name": "Task name (be specific and actionable)",
      "description": "Detailed description of what needs to be done",
      "duration_days": 3,
      "depends_on": ["Name of prerequisite task 1", "Name of prerequisite task 2"]
    }}
  ]
}}

CRITICAL REQUIREMENTS:
- Task names in "depends_on" must exactly match the "name" field of other tasks
- Use empty array [] for tasks with no dependencies
- Only include tasks that are necessary to achieve the goal
- Be realistic with time estimates (minimum 1 day per task)
- Focus on the most critical path to success
- Response must be valid JSON only

JSON Response:"""

    async def _call_groq_api(self, prompt: str) -> str:
        """Make an API call to Groq with error handling"""
        try:
            # Make the API call to Groq
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a professional project manager. Always respond with valid JSON only. Do not include any explanatory text before or after the JSON."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=2000,
                temperature=0.7,
                top_p=0.9,
                stream=False
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            logger.error(f"Groq API error: {str(e)}")
            # Check for specific error types
            if "rate_limit" in str(e).lower():
                raise HTTPException(
                    status_code=429,
                    detail="AI service rate limit exceeded. Please try again later."
                )
            elif "api_key" in str(e).lower() or "authentication" in str(e).lower():
                raise HTTPException(
                    status_code=401,
                    detail="AI service authentication failed. Please check configuration."
                )
            else:
                raise HTTPException(
                    status_code=503,
                    detail="AI service temporarily unavailable"
                )

    def _parse_llm_response(self, response_text: str) -> LLMPlanResponse:
        """Parse the LLM response into structured data"""
        try:
            # Clean the response - remove any markdown formatting or extra text
            cleaned_response = response_text.strip()

            # Remove markdown code blocks if present
            if cleaned_response.startswith("```json"):
                cleaned_response = cleaned_response[7:]
            elif cleaned_response.startswith("```"):
                cleaned_response = cleaned_response[3:]

            if cleaned_response.endswith("```"):
                cleaned_response = cleaned_response[:-3]

            cleaned_response = cleaned_response.strip()

            # Sometimes Groq models add explanatory text, try to extract JSON
            if not cleaned_response.startswith('{'):
                # Look for JSON object in the response
                start_idx = cleaned_response.find('{')
                end_idx = cleaned_response.rfind('}') + 1
                if start_idx != -1 and end_idx != 0:
                    cleaned_response = cleaned_response[start_idx:end_idx]

            # Parse JSON
            response_data = json.loads(cleaned_response)

            # Validate structure
            if "tasks" not in response_data:
                raise ValueError("Response missing 'tasks' field")

            tasks = []
            for task_data in response_data["tasks"]:
                # Validate required fields
                if "name" not in task_data:
                    raise ValueError("Task missing 'name' field")

                task = LLMTaskResponse(
                    name=task_data["name"],
                    description=task_data.get("description", ""),
                    duration_days=max(1, task_data.get("duration_days", 1)),
                    depends_on=task_data.get("depends_on", [])
                )
                tasks.append(task)

            logger.info(f"Successfully parsed {len(tasks)} tasks from Groq response")
            return LLMPlanResponse(tasks=tasks)

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Groq JSON response: {e}")
            logger.error(f"Response text: {response_text}")
            # Fallback: create a simple single task
            return self._create_fallback_plan(goal_text)
        except Exception as e:
            logger.error(f"Error parsing Groq response: {e}")
            return self._create_fallback_plan(goal_text)

    def _create_fallback_plan(self, goal_text: str) -> LLMPlanResponse:
        """Create a simple fallback plan when LLM parsing fails"""
        # Extract a reasonable task name from the goal
        task_name = goal_text[:100] if len(goal_text) <= 100 else goal_text[:97] + "..."

        fallback_task = LLMTaskResponse(
            name=f"Complete: {task_name}",
            description="This task was created as a fallback when AI planning was unavailable. Please break this down into smaller tasks manually.",
            duration_days=7,
            depends_on=[]
        )

        logger.warning(f"Using fallback plan for goal: {goal_text}")
        return LLMPlanResponse(tasks=[fallback_task])

# Global instance
llm_service = LLMService()
