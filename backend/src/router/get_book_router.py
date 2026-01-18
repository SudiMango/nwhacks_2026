from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..util.db import get_db
from ..service.get_book_service import GetBookService
from ..service.google_books_service import GoogleBooksService
from pydantic import BaseModel

router = APIRouter(prefix="/get-book", tags=["book"])

get_book_service = GetBookService()
google_books_service = GoogleBooksService()

class TikTokLinkRequest(BaseModel):
    tiktok_url: str

@router.get("/from-tiktok")
def get_book_from_tt(request: TikTokLinkRequest, db: Session = Depends(get_db)):
    return get_book_service.get_book_from_tt(db, request.tiktok_url)

@router.get("/search", summary="Search books by name using Google Books API")
def search_books(
    q: str = Query(..., description="Search query (book title, author, etc.)"),
    max_results: int = Query(20, ge=1, le=40, description="Maximum number of results to return")
):
    """
    Search for books using Google Books API
    
    - **q**: Search query (e.g., "Harry Potter", "J.K. Rowling", "1984")
    - **max_results**: Maximum number of results (1-40, default: 20)
    
    Returns a list of books with title, author, description, cover image, ISBN, etc.
    """
    books = google_books_service.search_books(q, max_results)
    return {
        "query": q,
        "count": len(books),
        "books": books
    }