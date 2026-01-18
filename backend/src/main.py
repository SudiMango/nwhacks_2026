from fastapi import FastAPI
from .util.db import lifespan
from fastapi.middleware.cors import CORSMiddleware
from .router import health_router, get_book_router, book_router

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
