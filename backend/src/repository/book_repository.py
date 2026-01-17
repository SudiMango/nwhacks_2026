from sqlalchemy.orm import Session
from ..models.Book import Book

class BookRepository:

    def create_book(self, db: Session, book: Book):
        db.add(book)
        db.commit()
        db.refresh(book)

    def get_book_by_isbn(self, db: Session, isbn: str):
        return db.query(Book).filter(Book.isbn == isbn).first()