from datetime import datetime
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..service.book_service import BookService
from ..util.db import get_db

router = APIRouter(prefix="/users/{user_id}/tbr", tags=["tbr"])
book_service = BookService()

class AddToTBRRequest(BaseModel):
    book_id: UUID | None = None
    isbn: str | None = None
    title: str | None = None
    author: str | None = None
    cover_url: str | None = None
    description: str | None = None

class UserBookResponse(BaseModel):
    user_book_id: UUID
    user_id: UUID
    isbn: str
    tbr: bool
    added_at: datetime
    book_id: UUID | None = None
    title: str | None = None
    author: str | None = None
    cover_url: str | None = None
    description: str | None = None

    class Config:
        orm_mode = True

@router.get("/", response_model=List[UserBookResponse])
def list_tbr(user_id: UUID, db: Session = Depends(get_db)):
    return book_service.list_user_tbr(db, user_id)

@router.post("/", response_model=UserBookResponse, status_code=status.HTTP_201_CREATED)
def add_to_tbr(user_id: UUID, request: AddToTBRRequest, db: Session = Depends(get_db)):
    return book_service.add_book_to_tbr(
        db,
        user_id,
        request.book_id,
        request.isbn,
        request.title,
        request.author,
        request.cover_url,
        request.description,
    )

@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_tbr(user_id: UUID, book_id: UUID, isbn: str | None = None, db: Session = Depends(get_db)):
    book_service.remove_book_from_tbr(db, user_id, book_id, isbn)
    return None

@router.post("/mark-read", status_code=status.HTTP_200_OK)
def mark_book_read(user_id: UUID, request: AddToTBRRequest, db: Session = Depends(get_db)):
    book_service.mark_book_read(
        db,
        user_id,
        request.book_id,
        request.isbn,
        request.title,
        request.author,
        request.cover_url,
        request.description,
    )
    return {"status": "ok"}
