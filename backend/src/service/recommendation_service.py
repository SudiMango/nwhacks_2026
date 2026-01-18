import json
from typing import List, Dict

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
