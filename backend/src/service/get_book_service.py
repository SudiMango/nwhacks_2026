import os
from sqlalchemy.orm import Session
import json
import requests
from ..repository.book_repository import BookRepository
from ..repository.video_repository import VideoRepository
from ..models.Book import Book
from ..models.Video import Video
from ..util.elevenlabs_client import ElevenLabsClient
from ..util.gemini_client import GeminiClient
from ..util.download import download_tiktok_audio

class GetBookService:
    
    def __init__(self):
        self.book_repo = BookRepository()
        self.video_repo = VideoRepository()
        self.elevenlabs = ElevenLabsClient()
        self.gemini = GeminiClient()
    
    def get_book_from_tt(self, db: Session, link: str):
        """
        Extract book information from TikTok audio file and save to database.
        Creates video record if it doesn't exist, and book record if it doesn't exist.
        Deletes the audio file after processing.
        
        Args:
            db: SQLAlchemy database session
            link: TikTok video URL
        
        Returns:
            Book object with extracted information
        """
        audio_file_path = None
        
        try:
            # Check if video already exists
            existing_video = self.video_repo.get_video_by_url(db, link)
            
            if existing_video:
                print(f"Video already exists: {link}")
                transcript = existing_video.transcript
            else:
                # Download and transcribe
                print("downloading...")
                audio_file_path = download_tiktok_audio(link)
                print("downloaded!")
                print("transcribing...")
                transcribed_text = self.elevenlabs.transcribe(audio_file_path)
                print("transcribed!")
                
                if not transcribed_text:
                    raise Exception("Failed to transcribe audio")
                
                transcript = transcribed_text
                
                # Create video record
                video = Video(
                    platform="tiktok",
                    url=link,
                    transcript=transcribed_text
                )
                self.video_repo.create_video(db, video)
                print(f"Video saved: {link}")
            
            # Extract book info
            book_data = self._extract_book_info(transcript)
            
            if not book_data:
                raise Exception("Failed to extract book information")
            
            # Check if book already exists
            isbn = book_data.get("isbn")
            existing_book = None
            
            if isbn and isbn != "Not found":
                existing_book = self.book_repo.get_book_by_isbn(db, isbn)
            
            if existing_book:
                print(f"Book already exists: {existing_book.title} by {existing_book.author}")
                return existing_book
            
            # Create new book
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
            db.rollback()
            return None
        
        finally:
            # Delete the audio file if it was downloaded
            if audio_file_path and os.path.exists(audio_file_path):
                try:
                    os.remove(audio_file_path)
                    print(f"Audio file deleted: {audio_file_path}")
                except Exception as e:
                    print(f"Failed to delete audio file: {e}")
    
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