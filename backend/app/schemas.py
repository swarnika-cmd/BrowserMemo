from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from datetime import datetime
from typing import List, Optional

# --- Authentication Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters long")

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str


# --- Memory Schemas ---
class MemoryCreate(BaseModel):
    id: UUID
    encrypted_title: str
    encrypted_url: str
    encrypted_text_content: str
    # 384-dimensional local embedding float array
    embedding: List[float] = Field(..., min_length=384, max_length=384)

class MemoryResponse(BaseModel):
    id: UUID
    user_id: UUID
    encrypted_title: str
    encrypted_url: str
    encrypted_text_content: str
    created_at: datetime
    interval: int
    repetitions: int
    ease_factor: float
    next_review: datetime

    class Config:
        from_attributes = True


# --- Search & RAG Schemas ---
class MemorySearchRequest(BaseModel):
    embedding: List[float] = Field(..., min_length=384, max_length=384)
    top_k: Optional[int] = Field(default=5, ge=1, le=50)

class MemorySearchResult(BaseModel):
    id: UUID
    encrypted_title: str
    encrypted_url: str
    encrypted_text_content: str
    similarity: float
    created_at: datetime
    interval: int
    repetitions: int
    ease_factor: float
    next_review: datetime
