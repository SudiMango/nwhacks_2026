from sqlalchemy.orm import Session
from ..models.Book import Book

class BookRepository:

    def create_book(self, db: Session, book: Book):
        db.add(book)
        db.commit()
        db.refresh(book)