from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.auth import get_current_user
from app import models

# Security scheme
security = HTTPBearer()

def get_current_active_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> models.User:
    """Get the current authenticated user"""
    token = credentials.credentials
    user = get_current_user(db, token)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return user

def verify_goal_access(
    goal_id: str,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> models.Goal:
    """Verify that the current user has access to the specified goal"""
    from app import crud
    import uuid

    try:
        goal_uuid = uuid.UUID(goal_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid goal ID format"
        )

    goal = crud.get_goal(db, goal_uuid, current_user.id)
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    return goal

def verify_task_access(
    task_id: str,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> models.Task:
    """Verify that the current user has access to the specified task"""
    from app import crud
    import uuid

    try:
        task_uuid = uuid.UUID(task_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID format"
        )

    task = crud.get_task(db, task_uuid, current_user.id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return task
