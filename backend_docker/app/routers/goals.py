from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
import uuid

from app.database import get_db
from app.dependencies import get_current_active_user, verify_goal_access
from app.schemas import Goal, GoalCreate, GoalUpdate, GoalSummary, APIResponse
from app.llm_service import llm_service
from app import crud, models

router = APIRouter(prefix="/goals", tags=["goals"])

@router.post("/", response_model=APIResponse)
async def create_goal(
    goal: GoalCreate,
    background_tasks: BackgroundTasks,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new goal and generate tasks using LLM"""
    # Create the goal first
    db_goal = crud.create_goal(db, goal, current_user.id)

    # Schedule task generation in the background
    background_tasks.add_task(generate_tasks_for_goal, db_goal.id, goal.text)

    return APIResponse(
        success=True,
        message="Goal created successfully. Tasks are being generated...",
        data={
            "goal_id": str(db_goal.id),
            "status": "processing"
        }
    )

@router.get("/", response_model=List[GoalSummary])
async def get_user_goals(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """Get all goals for the current user"""
    goals = crud.get_user_goals_summary(db, current_user.id, skip, limit)
    return goals

@router.get("/{goal_id}", response_model=Goal)
async def get_goal(
    goal: models.Goal = Depends(verify_goal_access),
    db: Session = Depends(get_db)
):
    """Get a specific goal with all its tasks"""
    return goal

@router.put("/{goal_id}", response_model=Goal)
async def update_goal(
    goal_update: GoalUpdate,
    goal: models.Goal = Depends(verify_goal_access),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Update a goal"""
    updated_goal = crud.update_goal(db, goal.id, current_user.id, goal_update)
    if not updated_goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    return updated_goal

@router.delete("/{goal_id}", response_model=APIResponse)
async def delete_goal(
    goal: models.Goal = Depends(verify_goal_access),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Delete a goal and all its tasks"""
    success = crud.delete_goal(db, goal.id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )

    return APIResponse(
        success=True,
        message="Goal deleted successfully"
    )

@router.post("/{goal_id}/regenerate-tasks", response_model=APIResponse)
async def regenerate_tasks(
    background_tasks: BackgroundTasks,
    goal: models.Goal = Depends(verify_goal_access),
    db: Session = Depends(get_db)
):
    """Regenerate tasks for a goal using LLM"""
    # Delete existing tasks
    existing_tasks = crud.get_goal_tasks(db, goal.id, goal.user_id)
    for task in existing_tasks:
        crud.delete_task(db, task.id, goal.user_id)

    # Schedule new task generation
    background_tasks.add_task(generate_tasks_for_goal, goal.id, goal.text)

    return APIResponse(
        success=True,
        message="Tasks are being regenerated...",
        data={"status": "processing"}
    )

async def generate_tasks_for_goal(goal_id: uuid.UUID, goal_text: str):
    """Background task to generate tasks using LLM"""
    try:
        # Get a new database session for the background task
        from app.database import SessionLocal
        db = SessionLocal()

        try:
            # Generate plan using LLM
            plan = await llm_service.generate_task_plan(goal_text)

            # Convert LLM response to the format expected by crud.create_tasks_bulk
            tasks_data = []
            for task in plan.tasks:
                tasks_data.append({
                    "name": task.name,
                    "description": task.description,
                    "duration_days": task.duration_days,
                    "depends_on": task.depends_on
                })

            # Create tasks in database
            crud.create_tasks_bulk(db, tasks_data, goal_id)

        finally:
            db.close()

    except Exception as e:
        # Log the error (in production, use proper logging)
        print(f"Error generating tasks for goal {goal_id}: {str(e)}")
        # In production, you might want to update the goal status to indicate failure
