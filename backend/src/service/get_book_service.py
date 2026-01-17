from sqlalchemy.orm import Session
import json
import requests
from ..repository.book_repository import BookRepository
from ..models.Book import Book
from ..util.elevenlabs_client import ElevenLabsClient
from ..util.gemini_client import GeminiClient
from ..util.download import download_tiktok_audio

class GetBookService:
    
    def __init__(self):
        self.book_repo = BookRepository()
        self.elevenlabs = ElevenLabsClient()
        self.gemini = GeminiClient()
    
    def get_book_from_tt(self, db: Session, link: str):
        """
        Extract book information from TikTok audio file and save to database.
        
        Args:
            db: SQLAlchemy database session
            link: TikTok video URL
        
        Returns:
            Book object with extracted information
        """
        try:
            # Step 1: Download and transcribe audio to text
            print("downloading...")
            audio_file_path = download_tiktok_audio(link)
            print("downloaded!")
            print("transcribing...")
            transcribed_text = self.elevenlabs.transcribe(audio_file_path)
            print("transcribed!")
            
            if not transcribed_text:
                raise Exception("Failed to transcribe audio")
            
            print(f"Transcribed text: {transcribed_text}")
            
            # Step 2: Extract book info from transcribed text
            book_data = self._extract_book_info(transcribed_text)
            
            if not book_data:
                raise Exception("Failed to extract book information")
            
            # Step 3: Create Book object and save to database
            book = Book(
                title=book_data.get("title"),
                author=book_data.get("author"),
                isbn=book_data.get("isbn"),
                cover_url=book_data.get("cover_url"),
                description=book_data.get("description")
            )
            
            self.book_repo.create_book(db, book)
            
            print(f"Book saved: {book.title} by {book.author}")
            return book
        
        except Exception as e:
            print(f"Error in get_book_from_tt: {e}")
            return None
    
    def _extract_book_info(self, text: str):
        """
        Extract book title, author, ISBN, cover URL, and description from transcribed text.
        
        Args:
            text: Transcribed text from audio
        
        Returns:
            Dictionary with title, author, isbn, cover_url, and description
        """
        try:
            # Step 1: Use Gemini to extract title and author
            prompt = f"""
            From the following text, extract the book title and author name.
            If any information is not found, use "Not found" for that field.
            
            Return ONLY a valid JSON object with this exact format (no extra text):
            {{
                "title": "book title here",
                "author": "author name here"
            }}
            
            Text to analyze:
            {text}
            """
            
            response = self.gemini.generate_content(prompt)
            response_text = response.strip()
            
            # Remove markdown code blocks if present
            if response_text.startswith('```'):
                response_text = response_text.split('```')[1]
                if response_text.startswith('json'):
                    response_text = response_text[4:]
            
            book_data = json.loads(response_text)
            
            # Step 2: Search for ISBN, cover URL, and description online using Google Books API
            title = book_data.get("title")
            author = book_data.get("author")
            
            isbn_data = self._find_isbn_online(title, author)
            book_data["isbn"] = isbn_data.get("isbn")
            book_data["cover_url"] = isbn_data.get("cover_url")
            book_data["description"] = isbn_data.get("description")
            
            return book_data
        
        except json.JSONDecodeError as e:
            print(f"Failed to parse Gemini response: {e}")
            return None
        except Exception as e:
            print(f"Error extracting book info: {e}")
            return None
    
    def _find_isbn_online(self, title: str, author: str):
        """
        Search Google Books API for ISBN, cover URL, and description.
        
        Args:
            title: Book title
            author: Book author
        
        Returns:
            Dictionary with isbn, cover_url, and description
        """
        if title == "Not found":
            return {"isbn": "Not found", "cover_url": None, "description": None}
        
        try:
            # Build search query
            query = f"{title}"
            if author != "Not found":
                query += f" {author}"
            
            # Google Books API endpoint
            url = "https://www.googleapis.com/books/v1/volumes"
            params = {
                "q": query,
                "maxResults": 1
            }
            
            response = requests.get(url, params=params)
            
            if response.status_code == 200:
                data = response.json()
                
                if "items" in data and len(data["items"]) > 0:
                    book = data["items"][0]
                    volume_info = book.get("volumeInfo", {})
                    
                    # Extract ISBN
                    identifiers = volume_info.get("industryIdentifiers", [])
                    isbn = "Not found"
                    
                    for identifier in identifiers:
                        if identifier["type"] == "ISBN_13":
                            isbn = identifier["identifier"]
                            break
                    
                    if isbn == "Not found":
                        for identifier in identifiers:
                            if identifier["type"] == "ISBN_10":
                                isbn = identifier["identifier"]
                                break
                    
                    # Extract cover URL
                    cover_url = volume_info.get("imageLinks", {}).get("thumbnail")
                    
                    # Extract description
                    description = volume_info.get("description")
                    
                    return {"isbn": isbn, "cover_url": cover_url, "description": description}
            
            return {"isbn": "Not found", "cover_url": None, "description": None}
        
        except Exception as e:
            print(f"Error searching for ISBN: {e}")
            return {"isbn": "Not found", "cover_url": None, "description": None}