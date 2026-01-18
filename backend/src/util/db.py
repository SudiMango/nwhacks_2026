import os
import sys
import asyncio
from contextlib import asynccontextmanager
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from psycopg_pool import AsyncConnectionPool  # for async queries

# psycopg async pool needs a selector loop on Windows
if os.name == "nt":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app):
    dsn = os.getenv("DATABASE_URL")
    if not dsn:
        raise RuntimeError("DATABASE_URL environment variable is not set")

    # Skip async pool on Windows (Proactor loop issue); fallback to sync engine
    if os.name == "nt":
        app.state.pool = None
        yield
        return

    pool = AsyncConnectionPool(dsn, min_size=1, max_size=10)
    await pool.open()
    app.state.pool = pool
    try:
        yield
    finally:
        await pool.close()
