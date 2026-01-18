from datetime import datetime
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..service.book_service import BookService
from ..util.db import get_db

router = APIRouter(prefix="/users/{user_id}/tbr", tags=["tbr"])
book_service = BookService()

class AddToTBRRequest(BaseModel):
    book_id: UUID

class TBRBook(BaseModel):
    book_id: UUID
    title: Optional[str] = None
    author: Optional[str] = None
    isbn: Optional[str] = None
    cover_url: Optional[str] = None
    description: Optional[str] = None

    class Config:
        orm_mode = True

class TBRItemResponse(BaseModel):
    tbr_id: UUID
    user_id: UUID
    book_id: UUID
    created_at: datetime
    book: Optional[TBRBook] = None

    class Config:
        orm_mode = True

@router.get("/", response_model=List[TBRItemResponse])
def list_tbr(user_id: UUID, db: Session = Depends(get_db)):
    return book_service.list_user_tbr(db, user_id)

@router.post("/", response_model=TBRItemResponse, status_code=status.HTTP_201_CREATED)
def add_to_tbr(user_id: UUID, request: AddToTBRRequest, db: Session = Depends(get_db)):
    return book_service.add_book_to_tbr(db, user_id, request.book_id)

@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_tbr(user_id: UUID, book_id: UUID, db: Session = Depends(get_db)):
    book_service.remove_book_from_tbr(db, user_id, book_id)
    return None
