from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.config import settings

# Create async engine for pgvector database interaction
engine = create_async_engine(settings.DATABASE_URL, echo=False, future=True)

# Create sessionmaker with AsyncSession class
async_session = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with async_session() as session:
        yield session
