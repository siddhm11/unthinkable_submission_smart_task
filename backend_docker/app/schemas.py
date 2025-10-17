from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None

class User(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Authentication Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Task Schemas
class TaskBase(BaseModel):
    name: str
    description: Optional[str] = None
    duration_days: int = 1

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    duration_days: Optional[int] = None

class TaskDependency(BaseModel):
    id: UUID
    depends_on_task_id: UUID

    class Config:
        from_attributes = True

class Task(TaskBase):
    id: UUID
    goal_id: UUID
    status: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    created_at: datetime
    dependencies: List[TaskDependency] = []

    class Config:
        from_attributes = True

# Goal Schemas
class GoalBase(BaseModel):
    text: str

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    text: Optional[str] = None
    status: Optional[str] = None

class Goal(GoalBase):
    id: UUID
    user_id: UUID
    status: str
    created_at: datetime
    tasks: List[Task] = []

    class Config:
        from_attributes = True

class GoalSummary(BaseModel):
    id: UUID
    text: str
    status: str
    created_at: datetime
    task_count: int
    completed_tasks: int

    class Config:
        from_attributes = True

# LLM Schemas
class LLMTaskResponse(BaseModel):
    name: str
    description: Optional[str] = None
    duration_days: int = 1
    depends_on: List[str] = []

class LLMPlanResponse(BaseModel):
    tasks: List[LLMTaskResponse]

# API Response Schemas
class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None

class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    error_code: Optional[str] = None
