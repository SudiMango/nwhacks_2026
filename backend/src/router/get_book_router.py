from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..util.db import get_db
from ..service.get_book_service import GetBookService
from pydantic import BaseModel

router = APIRouter(prefix="/get-book", tags=["book"])

get_book_service = GetBookService()

class TikTokLinkRequest(BaseModel):
    tiktok_url: str

@router.get("/from-tiktok")
def get_book_from_tt(request: TikTokLinkRequest, db: Session = Depends(get_db)):
    return get_book_service.get_book_from_tt(db, request.tiktok_url)