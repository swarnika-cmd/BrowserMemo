from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, memories
from app.config import settings
from contextlib import asynccontextmanager
from sqlalchemy import text

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Asynchronous database connection lifecycle setup
    async with engine.begin() as conn:
        # Enable pgvector in Postgres
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        # Create tables automatically for local development
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
    title="Smarana v2 API",
    description="Privacy-preserving local-first backend with pgvector support.",
    version="2.0.0",
    lifespan=lifespan
)

# CORS configuration supporting extension context calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount endpoints
app.include_router(auth.router)
app.include_router(memories.router)

@app.get("/")
def read_root():
    return {
        "status": "Smarana API Online",
        "encryption": "AES-256 Client-Side Enforced",
        "indexing": "pgvector 384-dimensional Cosine Similarity"
    }
