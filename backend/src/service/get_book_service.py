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
from ..models.UserBooks import UserBook

class GetBookService:
    
    def __init__(self):
        self.book_repo = BookRepository()
        self.video_repo = VideoRepository()
        self.elevenlabs = ElevenLabsClient()
        self.gemini = GeminiClient()
    




    def get_book_from_tt(self, db: Session, link: str, user_id: str):
        audio_file_path = None
        
        try:
            # 1. Handle Video/Transcript (Existing logic)
            existing_video = self.video_repo.get_video_by_url(db, link)
            if existing_video:
                transcript = existing_video.transcript
            else:
                audio_file_path = download_tiktok_audio(link)
                transcribed_text = self.elevenlabs.transcribe(audio_file_path)
                
                if not transcribed_text:
                    raise Exception("Failed to transcribe audio")
                
                transcript = transcribed_text
                video = Video(platform="tiktok", url=link, transcript=transcribed_text)
                self.video_repo.create_video(db, video)

            # 2. Extract Book Data
            books_data = self._extract_book_info(transcript)
            if not books_data:
                raise Exception("Failed to extract book information")
            
            saved_books = []
            
            for book_data in books_data:
                isbn = book_data.get("isbn")
                if not isbn or isbn == "Not found":
                    continue # Cannot accurately link UserBook without ISBN

                # 3. Ensure Book exists in the global 'books' table
                book = self.book_repo.get_book_by_isbn(db, isbn)
                if not book:
                    book = Book(
                        title=book_data.get("title"),
                        author=book_data.get("author"),
                        isbn=isbn,
                        cover_url=book_data.get("cover_url"),
                        description=book_data.get("description")
                    )
                    self.book_repo.create_book(db, book)
                
                # 4. Handle User-Book Relationship
                # Check if this specific user already has this book
                existing_user_book = db.query(UserBook).filter(
                    UserBook.user_id == user_id,
                    UserBook.isbn == isbn
                ).first()

                if not existing_user_book:
                    new_user_book = UserBook(
                        user_id=user_id,
                        isbn=isbn,
                        tbr=True # Defaulting to To-Be-Read
                    )
                    db.add(new_user_book)
                    print(f"Book {isbn} added to user {user_id}'s list.")
                else:
                    print(f"User already has book {isbn} in their list.")

                saved_books.append(book)
            
            db.commit() # Commit all new relations
            return saved_books
        
        except Exception as e:
            print(f"Error in get_book_from_tt: {e}")
            db.rollback()
            return []
        finally:
            if audio_file_path and os.path.exists(audio_file_path):
                os.remove(audio_file_path)





    def _extract_book_info(self, text: str):
        try:
            # Step 1: Use Gemini to extract all books mentioned
            prompt = f"""
            From the following text, extract ALL books mentioned.

            For each book:
            1. Identify the book title.
            2. Identify the author.
            3. If the author or title is not explicitly stated in the text, use your general knowledge to infer the most likely correct information.
            4. If after best-effort inference you are still unsure or cannot confidently determine the information, set the field value to "Not found".

            Return ONLY a valid JSON array with this exact structure (no extra text, no explanations):

            [
            {{
                "title": "book title here",
                "author": "author name here"
            }}
            ]

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
            
            books_data = json.loads(response_text)
            
            # Ensure it's a list
            if not isinstance(books_data, list):
                books_data = [books_data]
            
            # Step 2: Search for ISBN, cover URL, and description for each book
            for book_data in books_data:
                title = book_data.get("title")
                author = book_data.get("author")
                
                isbn_data = self._find_isbn_online(title, author)
                book_data["isbn"] = isbn_data.get("isbn")
                book_data["cover_url"] = isbn_data.get("cover_url")
                book_data["description"] = isbn_data.get("description")
            
            return books_data
        
        except json.JSONDecodeError as e:
            print(f"Failed to parse Gemini response: {e}")
            return []
        except Exception as e:
            print(f"Error extracting book info: {e}")
            return []
    







    def _find_isbn_online(self, title: str, author: str):
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