import json
from typing import List, Dict
from fastapi import HTTPException, status

from sqlalchemy.orm import Session

from ..util.gemini_client import GeminiClient
from ..service.google_books_service import GoogleBooksService
from ..repository.book_repository import BookRepository
from ..repository.recommendation_repository import RecommendationRepository
from ..models.Book import Book


class RecommendationService:
    def __init__(self):
        self.gemini = GeminiClient()
        self.google = GoogleBooksService()
        self.book_repo = BookRepository()
        self.rec_repo = RecommendationRepository()

    def _raw_recommendations(self, favorite_genres: List[str], last_book: str, count: int = 8) -> List[Dict]:
        genres_text = ", ".join(favorite_genres) if favorite_genres else "any"
        last_book_text = last_book if last_book else "None provided"

        prompt = f"""
        You are a book concierge. Recommend {count} books tailored to the user's taste.

        Favorite genres: {genres_text}
        Last book read: {last_book_text}

        Respond ONLY with a valid JSON array of objects using this exact shape:
        [
          {{
            "title": "string",
            "author": "string",
            "genre": "string",
            "description": "1-2 sentence blurb",
            "cover_url": "https://example.com/cover.jpg",
            "rating": 0-5 (number, may be a float)
          }}
        ]

        Do not include markdown fences or extra text.
        """

        try:
            raw = self.gemini.generate_content(prompt)
            cleaned = raw.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("```", 2)[1]
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:]
            data = json.loads(cleaned)
            if isinstance(data, list):
                normalized = []
                for item in data:
                    if not isinstance(item, dict):
                        continue
                    normalized.append(
                        {
                            "title": item.get("title", ""),
                            "author": item.get("author", ""),
                            "genre": item.get("genre", ""),
                            "description": item.get("description", ""),
                            "cover_url": item.get("cover_url", ""),
                            "rating": item.get("rating", None),
                        }
                    )
                return normalized[:count]
        except Exception as e:
            print(f"Recommendation parse error: {e}")

        return []

    def generate_and_store(
        self,
        db: Session,
        user_id,
        favorite_genres: List[str],
        last_book: str,
        count: int = 8,
    ) -> List[Book]:
        """Generate recommendations via Gemini, enrich via Google Books, upsert books, and store user recommendations."""
        raw_recs = self._raw_recommendations(favorite_genres, last_book, count)
        results: List[Book] = []

        for rec in raw_recs:
            query_parts = [rec.get("title", "")]
            if rec.get("author"):
                query_parts.append(rec["author"])
            query = " ".join(part for part in query_parts if part).strip()
            if not query:
                continue

            enriched = None
            google_books = self.google.search_books(query, max_results=1)
            if google_books:
                enriched = google_books[0]

            isbn = (enriched or {}).get("isbn") or rec.get("isbn")
            existing = self.book_repo.get_book_by_isbn(db, isbn) if isbn else None
            if existing:
                book = existing
            else:
                book = Book(
                    isbn=isbn,
                    title=(enriched or rec).get("title", ""),
                    author=(enriched or rec).get("author", ""),
                    cover_url=(enriched or rec).get("cover_url", ""),
                    description=(enriched or rec).get("description", ""),
                )
                self.book_repo.create_book(db, book)

            # Store recommendation mapping
            self.rec_repo.upsert(db, user_id, book.book_id)
            results.append(book)

        return results

    def _existing_recommendations(self, db: Session, user_id) -> List[Book]:
        recs = self.rec_repo.list_for_user(db, user_id)
        if not recs:
            return []

        book_ids = [rec.book_id for rec in recs]
        books = self.book_repo.get_by_ids(db, book_ids)
        if not books:
            return []

        book_map = {book.book_id: book for book in books}
        return [book_map[book_id] for book_id in book_ids if book_id in book_map]

    def get_or_generate(self, db: Session, user, count: int = 8) -> List[Book]:
        """
        Return cached recommendations for a user if they exist; otherwise generate, store, and return.
        Requires onboarding to be completed before generating.
        """
        if not getattr(user, "onboarding_completed", False):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Complete onboarding to receive recommendations.",
            )

        existing = self._existing_recommendations(db, user.user_id)
        if existing:
            return existing

        return self.generate_and_store(
            db,
            user.user_id,
            user.favorite_genres or [],
            user.last_book_read or "",
            count=count,
        )

    def recommend_from_query(
        self,
        query: str,
        favorite_genres: List[str] = None,
        recent_books: List[str] = None,
        count: int = 5,
    ) -> List[Dict]:
        """
        Get AI-powered book recommendations based on a natural language query.

        Args:
            query: User's natural language query (e.g., "books like Harry Potter", "rainy day reads")
            favorite_genres: List of user's favorite genre IDs
            recent_books: List of book titles the user has recently read/added
            count: Number of books to recommend (default: 5)

        Returns:
            List of book dictionaries with full details from Google Books
        """
        # Build context for the prompt
        context_parts = []

        if favorite_genres and len(favorite_genres) > 0:
            genres_str = ", ".join(favorite_genres)
            context_parts.append(f"User's favorite genres: {genres_str}")

        if recent_books and len(recent_books) > 0:
            books_str = ", ".join(recent_books[:5])
            context_parts.append(f"Books the user has recently added to their collection: {books_str}")

        context = "\n".join(context_parts) if context_parts else "No additional context about the user."

        prompt = f"""You are a helpful book recommendation assistant. Based on the user's request and their reading preferences, suggest exactly {count} books.

User's Request: "{query}"

User Context:
{context}

IMPORTANT: Respond ONLY with a valid JSON array of book objects. Each object must have exactly these fields:
- "title": The full book title
- "author": The author's name

Do not include any other text, explanation, or markdown formatting. Just the JSON array.

Example format:
[
  {{"title": "The Hobbit", "author": "J.R.R. Tolkien"}},
  {{"title": "Ender's Game", "author": "Orson Scott Card"}}
]

Now provide {count} book recommendations:"""

        try:
            raw = self.gemini.generate_content(prompt)
            print(f"Gemini response for query '{query}': {raw}")

            # Parse the JSON response
            cleaned = raw.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("```", 2)[1]
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:]

            # Try to find JSON array in the response
            import re
            array_match = re.search(r'\[[\s\S]*\]', cleaned)
            if array_match:
                cleaned = array_match.group(0)

            recommendations = json.loads(cleaned)

            if not isinstance(recommendations, list):
                print(f"Expected list, got {type(recommendations)}")
                return []

            # Enrich each recommendation with Google Books data
            enriched_books = []
            for rec in recommendations[:count]:
                title = rec.get("title", "")
                author = rec.get("author", "")

                if not title:
                    continue

                # Search Google Books for this specific book
                search_query = f"{title} {author}".strip()
                books = self.google.search_books(search_query, max_results=3)

                if books:
                    best_match = books[0]
                    best_match["recommended_title"] = title
                    best_match["recommended_author"] = author
                    enriched_books.append(best_match)
                else:
                    # If Google Books doesn't have it, still include basic info
                    enriched_books.append({
                        "id": None,
                        "title": title,
                        "author": author,
                        "description": "",
                        "cover_url": "",
                        "isbn": None,
                        "page_count": None,
                        "published_date": "",
                        "categories": [],
                        "not_found_on_google_books": True
                    })

            return enriched_books

        except Exception as e:
            print(f"Error getting query-based recommendations: {e}")
            return []
