import os
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .util.db import lifespan
from .router import health_router, get_book_router, book_router, users_router, auth_router

# Ensure selector loop on Windows for psycopg async pool
if os.name == "nt":
    try:
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    except Exception:
        pass

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Add frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router.router)
app.include_router(get_book_router.router)
app.include_router(book_router.router)
app.include_router(users_router.router)
app.include_router(auth_router.router)