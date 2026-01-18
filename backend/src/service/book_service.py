from typing import List
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..repository.book_repository import BookRepository
from ..repository.user_book_repository import UserBookRepository
from ..models.Book import Book


class BookService:
    def __init__(self):
        self.book_repo = BookRepository()
        self.user_book_repo = UserBookRepository()

    def _get_or_create_book(
        self,
        db: Session,
        book_id: UUID | None,
        isbn: str | None,
        title: str | None = None,
        author: str | None = None,
        cover_url: str | None = None,
        description: str | None = None,
    ) -> Book:
        book = None
        if book_id:
            book = self.book_repo.get_by_id(db, book_id)
        if not book and isbn:
            book = self.book_repo.get_book_by_isbn(db, isbn)
        if not book and isbn:
            book = Book(
                isbn=isbn,
                title=title or "",
                author=author or "",
                cover_url=cover_url,
                description=description,
            )
            self.book_repo.create_book(db, book)
        if not book:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
        return book

    def _get_book(self, db: Session, book_id: UUID | None, isbn: str | None) -> Book:
        book = None
        if book_id:
            book = self.book_repo.get_by_id(db, book_id)
        if not book and isbn:
            book = self.book_repo.get_book_by_isbn(db, isbn)
        if not book:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
        return book

    def _serialize_user_book(self, user_book):
        book = getattr(user_book, "book", None)
        return {
            "user_book_id": user_book.user_book_id,
            "user_id": user_book.user_id,
            "isbn": user_book.isbn,
            "tbr": user_book.tbr,
            "added_at": user_book.added_at,
            "book_id": getattr(book, "book_id", None),
            "title": getattr(book, "title", None),
            "author": getattr(book, "author", None),
            "cover_url": getattr(book, "cover_url", None),
            "description": getattr(book, "description", None),
        }

    def list_user_tbr(self, db: Session, user_id: UUID):
        # Return all user_books (both TBR and collection) so the client can filter locally
        records = self.user_book_repo.list_for_user(db, user_id)
        return [self._serialize_user_book(record) for record in records]

    def add_book_to_tbr(
        self,
        db: Session,
        user_id: UUID,
        book_id: UUID | None,
        isbn: str | None,
        title: str | None = None,
        author: str | None = None,
        cover_url: str | None = None,
        description: str | None = None,
    ):
        book = self._get_or_create_book(db, book_id, isbn, title, author, cover_url, description)
        saved = self.user_book_repo.upsert(db, user_id, book, tbr=True)
        return self._serialize_user_book(saved)

    def remove_book_from_tbr(self, db: Session, user_id: UUID, book_id: UUID | None, isbn: str | None) -> None:
        book = self._get_book(db, book_id, isbn)
        self.user_book_repo.delete_for_user_isbn(db, user_id, book.isbn)

    def mark_book_read(
        self,
        db: Session,
        user_id: UUID,
        book_id: UUID | None,
        isbn: str | None,
        title: str | None = None,
        author: str | None = None,
        cover_url: str | None = None,
        description: str | None = None,
    ) -> None:
        book = self._get_or_create_book(db, book_id, isbn, title, author, cover_url, description)
        self.user_book_repo.upsert(db, user_id, book, tbr=False)
