import requests
from typing import List, Dict, Optional

class GoogleBooksService:
    BASE_URL = "https://www.googleapis.com/books/v1/volumes"
    
    def _extract_year(self, published_date: str) -> Optional[int]:
        """Extract a 4-digit year from the publishedDate field."""
        if not published_date:
            return None
        try:
            year = int(published_date[:4])
            return year
        except Exception:
            return None
    
    def _score_volume(self, has_isbn13: bool, has_cover: bool, year: Optional[int], page_count: Optional[int]) -> float:
        """
        Heuristic scoring to prefer common, modern physical editions:
        - ISBN13: strong signal
        - Cover image present
        - Newer year preferred
        - Page count present
        """
        score = 0.0
        if has_isbn13:
            score += 4
        if has_cover:
            score += 2
        if page_count:
            score += 0.5
        if year:
            if year >= 2015:
                score += 3
            elif year >= 2005:
                score += 2
            elif year >= 1990:
                score += 1
        return score
    
    def search_books(self, query: str, max_results: int = 20) -> List[Dict]:
        """
        Search for books using Google Books API
        
        Args:
            query: Search query (book title, author, etc.)
            max_results: Maximum number of results to return (default: 20)
            
        Returns:
            List of book dictionaries with relevant information
        """
        try:
            params = {
                "q": query,
                "maxResults": min(max_results, 40),  # Google Books API max is 40
                "printType": "books",  # exclude magazines
                # request saleInfo.isEbook so we can drop digital-only results
                "fields": "items(id,volumeInfo(title,authors,description,imageLinks,industryIdentifiers,pageCount,publishedDate,categories),saleInfo/isEbook)",
            }
            
            response = requests.get(self.BASE_URL, params=params, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            if "items" not in data:
                return []
            
            # Deduplicate and pick the best/common physical edition per title/author
            deduped: Dict[str, Dict] = {}

            for item in data["items"]:
                sale_info = item.get("saleInfo", {}) or {}
                # Skip ebooks; we only want physical print results
                if sale_info.get("isEbook") is True:
                    continue

                volume_info = item.get("volumeInfo", {})
                
                # Extract ISBN-13 or ISBN-10
                isbn13 = None
                isbn10 = None
                industry_identifiers = volume_info.get("industryIdentifiers", [])
                for identifier in industry_identifiers:
                    if identifier.get("type") == "ISBN_13" and not isbn13:
                        isbn13 = identifier.get("identifier")
                    elif identifier.get("type") == "ISBN_10" and not isbn10:
                        isbn10 = identifier.get("identifier")
                isbn = isbn13 or isbn10
                if not isbn:
                    continue  # drop entries with no ISBN (likely less useful)

                cover_url = volume_info.get("imageLinks", {}).get("thumbnail", "")
                if not cover_url:
                    continue  # require a cover image for common/physical editions
                year = self._extract_year(volume_info.get("publishedDate", ""))
                page_count = volume_info.get("pageCount")

                book = {
                    "id": item.get("id"),
                    "title": volume_info.get("title", ""),
                    "author": ", ".join(volume_info.get("authors", [])),
                    "description": volume_info.get("description", ""),
                    "cover_url": cover_url,
                    "isbn": isbn,
                    "page_count": page_count,
                    "published_date": volume_info.get("publishedDate", ""),
                    "categeries": volume_info.get("categories", []),
                }

                # Score this edition
                score = self._score_volume(has_isbn13=bool(isbn13), has_cover=bool(cover_url), year=year, page_count=page_count)

                # Group key by normalized title/author
                key = f"{book['title'].strip().lower()}|{book['author'].strip().lower()}"
                if not key.strip("|"):
                    key = book["isbn"]

                existing = deduped.get(key)
                if not existing or score > existing.get("_score", 0):
                    book["_score"] = score
                    book["_year"] = year or 0
                    deduped[key] = book
                elif existing and score == existing.get("_score", 0):
                    # Tie-breaker: newer year wins
                    if (year or 0) > existing.get("_year", 0):
                        book["_score"] = score
                        book["_year"] = year or 0
                        deduped[key] = book

            # Return sorted by score (desc) then year (desc)
            books = list(deduped.values())
            books.sort(key=lambda b: (b.get("_score", 0), b.get("_year", 0)), reverse=True)
            # Remove helper fields before returning
            for b in books:
                b.pop("_score", None)
                b.pop("_year", None)
            return books[:max_results]
                
        except requests.RequestException as e:
            print(f"HTTP error when calling Google Books API: {e}")
            return []
        except Exception as e:
            print(f"Error searching books: {e}")
            return []
