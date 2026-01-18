from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..util.db import get_db
from ..service.get_book_service import GetBookService
from ..service.google_books_service import GoogleBooksService
from ..service.library_service import LibraryService
from ..service.recommendation_service import RecommendationService
from pydantic import BaseModel
from ..models.User import User
from ..models.UserBooks import UserBook
from ..models.Book import Book
from ..util.auth_state import get_current_user

router = APIRouter(prefix="/get-book", tags=["book"])

get_book_service = GetBookService()
google_books_service = GoogleBooksService()
library_service = LibraryService()
recommendation_service = RecommendationService()

class TikTokLinkRequest(BaseModel):
    tiktok_url: str

@router.get("/from-tiktok")
def get_book_from_tt(request: TikTokLinkRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_book_service.get_book_from_tt(db, request.tiktok_url, current_user.user_id)

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
    max_distance: float = Query(15, description="Maximum search distance in kilometers")
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


class RecommendRequest(BaseModel):
    query: str
    favorite_genres: Optional[List[str]] = None
    recent_books: Optional[List[str]] = None
    count: int = 5


@router.post("/recommend", summary="Get AI-powered book recommendations")
def recommend_books(request: RecommendRequest):
    """
    Get AI-powered book recommendations based on a natural language query.

    - **query**: Natural language query (e.g., "books like Harry Potter", "cozy rainy day reads")
    - **favorite_genres**: Optional list of user's favorite genre IDs
    - **recent_books**: Optional list of book titles the user has recently read
    - **count**: Number of recommendations to return (default: 5)

    Returns a list of recommended books with full details from Google Books API.
    """
    books = recommendation_service.recommend_from_query(
        query=request.query,
        favorite_genres=request.favorite_genres,
        recent_books=request.recent_books,
        count=request.count
    )
    return {
        "query": request.query,
        "count": len(books),
        "books": books
    }
@router.get("/my-books", summary="Get current user's books")
def get_my_books(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_books = db.query(UserBook).filter(UserBook.user_id == current_user.user_id).all()
    
    books = []
    for user_book in user_books:
        book = db.query(Book).filter(Book.isbn == user_book.isbn).first()
        if book:
            books.append({
                "user_book_id": user_book.user_book_id,
                "isbn": user_book.isbn,
                "title": book.title,
                "author": book.author,
                "cover_url": book.cover_url,
                "description": book.description,
                "tbr": user_book.tbr,
                "added_at": user_book.added_at
            })
    
    return books
