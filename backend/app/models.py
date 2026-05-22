import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float
from sqlalchemy.dialects.postgresql import UUID
from pgvector.sqlalchemy import Vector
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Memory(Base):
    __tablename__ = "memories"

    # Client generates UUIDs so we support seamless offline capture and conflict-free syncing
    id = Column(UUID(as_uuid=True), primary key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Client-side AES-256 encrypted fields (Base64 URL-safe or standard strings)
    # Server never sees plain titles, plain URLs, or raw text content.
    encrypted_title = Column(String, nullable=False)
    encrypted_url = Column(String, nullable=False)
    encrypted_text_content = Column(String, nullable=False)
    
    # 384-dimensional dense vector representing the local WASM embedding
    embedding = Column(Vector(384), nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Spaced Repetition (SM-2) engine states
    interval = Column(Integer, default=0, nullable=False)
    repetitions = Column(Integer, default=0, nullable=False)
    ease_factor = Column(Float, default=2.5, nullable=False)
    next_review = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
