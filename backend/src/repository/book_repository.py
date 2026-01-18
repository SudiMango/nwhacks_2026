from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from ..models.Book import Book

class BookRepository:
    def get_all(self, db: Session) -> List[Book]:
        return db.query(Book).order_by(Book.created_at.desc()).all()

    def get_by_id(self, db: Session, book_id: UUID) -> Optional[Book]:
        return db.query(Book).filter(Book.book_id == book_id).first()

    def get_by_ids(self, db: Session, book_ids: List[UUID]) -> List[Book]:
        if not book_ids:
            return []
        return db.query(Book).filter(Book.book_id.in_(book_ids)).all()

    def create_book(self, db: Session, book: Book) -> Book:
        db.add(book)
        db.commit()
        db.refresh(book)
        return book

    def update_book(self, db: Session, book: Book) -> Book:
        # Book is assumed to be already mutated by caller
        db.add(book)
        db.commit()
        db.refresh(book)
        return book

    def delete_book(self, db: Session, book: Book) -> None:
        db.delete(book)
        db.commit()
        db.refresh(book)

    def get_book_by_isbn(self, db: Session, isbn: str):
        return db.query(Book).filter(Book.isbn == isbn).first()
