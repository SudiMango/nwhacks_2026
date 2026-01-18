from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..util.db import get_db
from ..service.get_book_service import GetBookService
from ..service.google_books_service import GoogleBooksService
from ..service.library_service import LibraryService
from pydantic import BaseModel

router = APIRouter(prefix="/books", tags=["book"])

get_book_service = GetBookService()
google_books_service = GoogleBooksService()
library_service = LibraryService()

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

@router.get("/find", summary="Find nearby libraries with book availability")
async def find_book_at_libraries(
    isbn: str = Query(..., description="Book ISBN"),
    lat: float = Query(..., description="User's latitude"),
    lng: float = Query(..., description="User's longitude"),
    max_distance: float = Query(20.0, description="Maximum search distance in kilometers")
):
    """
    Find nearby libraries and check book availability
    
    - **isbn**: Book ISBN (e.g., "9780358434733")
    - **lat**: User's latitude
    - **lng**: User's longitude
    - **max_distance**: Maximum distance to search in km (default: 20)
    
    Returns a list of nearby libraries with availability status, holds, copies, etc.
    """
    libraries = await library_service.find_book_at_libraries(isbn, lat, lng, max_distance)
    return {
        "isbn": isbn,
        "location": {"lat": lat, "lng": lng},
        "count": len(libraries),
        "libraries": libraries
    }