import requests
from typing import List, Dict, Optional

class GoogleBooksService:
    BASE_URL = "https://www.googleapis.com/books/v1/volumes"
    
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
                "fields": "items(id,volumeInfo(title,authors,description,imageLinks,industryIdentifiers,pageCount,publishedDate,categories))"
            }
            
            response = requests.get(self.BASE_URL, params=params, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            if "items" not in data:
                return []
            
            books = []
            for item in data["items"]:
                volume_info = item.get("volumeInfo", {})
                
                # Extract ISBN-13 or ISBN-10
                isbn = None
                industry_identifiers = volume_info.get("industryIdentifiers", [])
                for identifier in industry_identifiers:
                    if identifier.get("type") == "ISBN_13":
                        isbn = identifier.get("identifier")
                        break
                    elif identifier.get("type") == "ISBN_10" and not isbn:
                        isbn = identifier.get("identifier")
                
                book = {
                    "id": item.get("id"),
                    "title": volume_info.get("title", ""),
                    "author": ", ".join(volume_info.get("authors", [])),
                    "description": volume_info.get("description", ""),
                    "cover_url": volume_info.get("imageLinks", {}).get("thumbnail", ""),
                    "isbn": isbn,
                    "page_count": volume_info.get("pageCount"),
                    "published_date": volume_info.get("publishedDate", ""),
                    "categeries": volume_info.get("categories", []),
                }
                books.append(book)
            
            return books
                
        except requests.RequestException as e:
            print(f"HTTP error when calling Google Books API: {e}")
            return []
        except Exception as e:
            print(f"Error searching books: {e}")
            return []
