from sqlalchemy.orm import Session
from sqlalchemy import func,case
from typing import List, Optional
from uuid import UUID
import uuid

from app import models, schemas
from app.auth import get_password_hash

# User CRUD operations
def get_user(db: Session, user_id: UUID) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        name=user.name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: UUID, user_update: schemas.UserUpdate) -> Optional[models.User]:
    db_user = get_user(db, user_id)
    if not db_user:
        return None

    update_data = user_update.dict(exclude_unset=True)
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))

    for field, value in update_data.items():
        setattr(db_user, field, value)

    db.commit()
    db.refresh(db_user)
    return db_user

# Goal CRUD operations
def get_goal(db: Session, goal_id: UUID, user_id: UUID) -> Optional[models.Goal]:
    return db.query(models.Goal).filter(
        models.Goal.id == goal_id,
        models.Goal.user_id == user_id
    ).first()

def get_user_goals(db: Session, user_id: UUID, skip: int = 0, limit: int = 100) -> List[models.Goal]:
    return db.query(models.Goal).filter(
        models.Goal.user_id == user_id
    ).offset(skip).limit(limit).all()

# In smart-task-planner/app/crud.py

# In smart-task-planner/app/crud.py

def get_user_goals_summary(db: Session, user_id: UUID, skip: int = 0, limit: int = 100) -> List[dict]:
    goals = db.query(
        models.Goal.id,
        models.Goal.text,
        models.Goal.status,
        models.Goal.created_at,
        func.count(models.Task.id).label('task_count'),
        func.sum(case((models.Task.status == 'completed', 1), else_=0)).label('completed_tasks')
    ).outerjoin(models.Task).filter(
        models.Goal.user_id == user_id
    ).group_by(
        models.Goal.id,
        models.Goal.text,
        models.Goal.status,
        models.Goal.created_at
    ).offset(skip).limit(limit).all()

    return [
        {
            "id": goal.id,
            "text": goal.text,
            "status": goal.status,
            "created_at": goal.created_at,
            "task_count": goal.task_count or 0,
            "completed_tasks": goal.completed_tasks or 0
        }
        for goal in goals
    ]

def create_goal(db: Session, goal: schemas.GoalCreate, user_id: UUID) -> models.Goal:
    db_goal = models.Goal(
        text=goal.text,
        user_id=user_id
    )
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

def update_goal(db: Session, goal_id: UUID, user_id: UUID, goal_update: schemas.GoalUpdate) -> Optional[models.Goal]:
    db_goal = get_goal(db, goal_id, user_id)
    if not db_goal:
        return None

    update_data = goal_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_goal, field, value)

    db.commit()
    db.refresh(db_goal)
    return db_goal

def delete_goal(db: Session, goal_id: UUID, user_id: UUID) -> bool:
    db_goal = get_goal(db, goal_id, user_id)
    if not db_goal:
        return False

    db.delete(db_goal)
    db.commit()
    return True

# Task CRUD operations
def get_task(db: Session, task_id: UUID, user_id: UUID) -> Optional[models.Task]:
    return db.query(models.Task).join(models.Goal).filter(
        models.Task.id == task_id,
        models.Goal.user_id == user_id
    ).first()

def get_goal_tasks(db: Session, goal_id: UUID, user_id: UUID) -> List[models.Task]:
    return db.query(models.Task).join(models.Goal).filter(
        models.Task.goal_id == goal_id,
        models.Goal.user_id == user_id
    ).all()

def create_task(db: Session, task: schemas.TaskCreate, goal_id: UUID) -> models.Task:
    db_task = models.Task(
        name=task.name,
        description=task.description,
        duration_days=task.duration_days,
        goal_id=goal_id
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def create_tasks_bulk(db: Session, tasks_data: List[dict], goal_id: UUID) -> List[models.Task]:
    db_tasks = []
    task_name_to_id = {}

    # First pass: create all tasks
    for task_data in tasks_data:
        db_task = models.Task(
            name=task_data["name"],
            description=task_data.get("description"),
            duration_days=task_data.get("duration_days", 1),
            goal_id=goal_id
        )
        db.add(db_task)
        db.flush()  # Flush to get the ID without committing
        db_tasks.append(db_task)
        task_name_to_id[task_data["name"]] = db_task.id

    # Second pass: create dependencies
    for i, task_data in enumerate(tasks_data):
        if "depends_on" in task_data and task_data["depends_on"]:
            for dep_name in task_data["depends_on"]:
                if dep_name in task_name_to_id:
                    dependency = models.TaskDependency(
                        task_id=db_tasks[i].id,
                        depends_on_task_id=task_name_to_id[dep_name]
                    )
                    db.add(dependency)

    db.commit()

    # Refresh all tasks to get updated relationships
    for task in db_tasks:
        db.refresh(task)

    return db_tasks

def update_task(db: Session, task_id: UUID, user_id: UUID, task_update: schemas.TaskUpdate) -> Optional[models.Task]:
    db_task = get_task(db, task_id, user_id)
    if not db_task:
        return None

    update_data = task_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)

    db.commit()
    db.refresh(db_task)
    return db_task

def delete_task(db: Session, task_id: UUID, user_id: UUID) -> bool:
    db_task = get_task(db, task_id, user_id)
    if not db_task:
        return False

    db.delete(db_task)
    db.commit()
    return True

# Task Dependency CRUD operations
def create_task_dependency(db: Session, task_id: UUID, depends_on_task_id: UUID) -> models.TaskDependency:
    dependency = models.TaskDependency(
        task_id=task_id,
        depends_on_task_id=depends_on_task_id
    )
    db.add(dependency)
    db.commit()
    db.refresh(dependency)
    return dependency

def delete_task_dependency(db: Session, task_id: UUID, depends_on_task_id: UUID) -> bool:
    dependency = db.query(models.TaskDependency).filter(
        models.TaskDependency.task_id == task_id,
        models.TaskDependency.depends_on_task_id == depends_on_task_id
    ).first()

    if not dependency:
        return False

    db.delete(dependency)
    db.commit()
    return True

def check_circular_dependency(db: Session, task_id: UUID, depends_on_task_id: UUID) -> bool:
    """Check if adding a dependency would create a circular reference"""
    def has_path(start_id: UUID, target_id: UUID, visited: set) -> bool:
        if start_id == target_id:
            return True
        if start_id in visited:
            return False

        visited.add(start_id)
        dependencies = db.query(models.TaskDependency).filter(
            models.TaskDependency.depends_on_task_id == start_id
        ).all()

        for dep in dependencies:
            if has_path(dep.task_id, target_id, visited.copy()):
                return True

        return False

    return has_path(depends_on_task_id, task_id, set())
