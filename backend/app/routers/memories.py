from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc, and_
from app.database import get_db
from app.models import Memory, User
from app.schemas import MemoryCreate, MemoryResponse, MemorySearchRequest, MemorySearchResult
from app.auth import get_current_user
from datetime import datetime, timedelta
from typing import List
from uuid import UUID

router = APIRouter(prefix="/api/memories", tags=["Memories"])

@router.post("", response_model=MemoryResponse, status_code=status.HTTP_201_CREATED)
async def save_memory(
    memory_in: MemoryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Check if memory already exists (supports client-side upsert/deduplication)
    result = await db.execute(
        select(Memory).where(
            and_(Memory.id == memory_in.id, Memory.user_id == current_user.id)
        )
    )
    existing_memory = result.scalars().first()
    
    if existing_memory:
        # Overwrite encrypted values and embeddings (refreshing the memory)
        existing_memory.encrypted_title = memory_in.encrypted_title
        existing_memory.encrypted_url = memory_in.encrypted_url
        existing_memory.encrypted_text_content = memory_in.encrypted_text_content
        existing_memory.embedding = memory_in.embedding
        existing_memory.created_at = datetime.utcnow()
        # Keep existing SM-2 state to avoid resetting learning progress
        await db.commit()
        await db.refresh(existing_memory)
        return existing_memory

    # Create new memory record
    new_memory = Memory(
        id=memory_in.id,
        user_id=current_user.id,
        encrypted_title=memory_in.encrypted_title,
        encrypted_url=memory_in.encrypted_url,
        encrypted_text_content=memory_in.encrypted_text_content,
        embedding=memory_in.embedding,
        created_at=datetime.utcnow(),
        next_review=datetime.utcnow() # initially reviewable immediately
    )
    db.add(new_memory)
    await db.commit()
    await db.refresh(new_memory)
    return new_memory


@router.get("", response_model=List[MemoryResponse])
async def get_all_memories(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Memory).where(Memory.user_id == current_user.id).order_by(desc(Memory.created_at))
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/search", response_model=List[MemorySearchResult])
async def search_memories(
    search_req: MemorySearchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # pgvector cosine similarity = 1 - cosine_distance
    cosine_distance = Memory.embedding.cosine_distance(search_req.embedding)
    similarity = (1.0 - cosine_distance).label("similarity")

    stmt = (
        select(Memory, similarity)
        .where(Memory.user_id == current_user.id)
        .order_by(cosine_distance)
        .limit(search_req.top_k)
    )
    
    result = await db.execute(stmt)
    hits = result.all()
    
    search_results = []
    for row in hits:
        mem, sim = row
        search_results.append(
            MemorySearchResult(
                id=mem.id,
                encrypted_title=mem.encrypted_title,
                encrypted_url=mem.encrypted_url,
                encrypted_text_content=mem.encrypted_text_content,
                similarity=float(sim),
                created_at=mem.created_at,
                interval=mem.interval,
                repetitions=mem.repetitions,
                ease_factor=mem.ease_factor,
                next_review=mem.next_review
            )
        )
    return search_results


@router.get("/review", response_model=List[MemoryResponse])
async def get_review_queue(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Retrieve memories due for review based on SM-2 scheduled next_review date
    now = datetime.utcnow()
    stmt = (
        select(Memory)
        .where(
            and_(
                Memory.user_id == current_user.id,
                Memory.next_review <= now
            )
        )
        .order_by(Memory.next_review)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/{memory_id}/review", response_model=MemoryResponse)
async def submit_memory_review(
    memory_id: UUID,
    quality: int,  # Recall rating between 0 and 5
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not (0 <= quality <= 5):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Review quality score must be an integer between 0 (complete blackout) and 5 (perfect recall)."
        )

    stmt = select(Memory).where(
        and_(Memory.id == memory_id, Memory.user_id == current_user.id)
    )
    result = await db.execute(stmt)
    memory = result.scalars().first()
    
    if not memory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Memory not found or access denied."
        )

    # --- SM-2 (SuperMemo 2) Spaced Repetition Logic ---
    repetitions = memory.repetitions
    interval = memory.interval
    ease_factor = memory.ease_factor

    if quality >= 3:
        if repetitions == 0:
            interval = 1
        elif repetitions == 1:
            interval = 6
        else:
            interval = round(interval * ease_factor)
        repetitions += 1
    else:
        # Reset repetition learning phase on lapse
        repetitions = 0
        interval = 1

    # Update ease factor formula
    ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    if ease_factor < 1.3:
        ease_factor = 1.3

    # Commit calculations back to memory record
    memory.repetitions = repetitions
    memory.interval = interval
    memory.ease_factor = ease_factor
    memory.next_review = datetime.utcnow() + timedelta(days=interval)
    
    await db.commit()
    await db.refresh(memory)
    return memory
