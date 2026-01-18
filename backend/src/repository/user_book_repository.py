from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session

from ..models.UserBooks import UserBook
from ..models.Book import Book


class UserBookRepository:
    def upsert(self, db: Session, user_id: UUID, book: Book, tbr: bool = True) -> UserBook:
        existing = (
            db.query(UserBook)
            .filter(UserBook.user_id == user_id, UserBook.isbn == book.isbn)
            .first()
        )
        if existing:
            existing.tbr = tbr
            existing.book = book
            db.add(existing)
            db.commit()
            db.refresh(existing)
            return existing

        record = UserBook(user_id=user_id, isbn=book.isbn, tbr=tbr)
        record.book = book
        db.add(record)
        db.commit()
        db.refresh(record)
        return record

    def set_tbr(self, db: Session, user_id: UUID, isbn: str, tbr: bool) -> Optional[UserBook]:
        record = (
            db.query(UserBook)
            .filter(UserBook.user_id == user_id, UserBook.isbn == isbn)
            .first()
        )
        if not record:
            return None
        record.tbr = tbr
        db.add(record)
        db.commit()
        db.refresh(record)
        return record

    def list_collection(self, db: Session, user_id: UUID) -> List[UserBook]:
        return (
            db.query(UserBook)
            .filter(UserBook.user_id == user_id, UserBook.tbr == False)
            .all()
        )

    def list_tbr(self, db: Session, user_id: UUID) -> List[UserBook]:
        return (
            db.query(UserBook)
            .filter(UserBook.user_id == user_id, UserBook.tbr == True)
            .all()
        )

    def list_for_user(self, db: Session, user_id: UUID) -> List[UserBook]:
        return (
            db.query(UserBook)
            .filter(UserBook.user_id == user_id)
            .order_by(UserBook.added_at.desc())
            .all()
        )

    def delete_for_user_isbn(self, db: Session, user_id: UUID, isbn: str) -> None:
        db.query(UserBook).filter(UserBook.user_id == user_id, UserBook.isbn == isbn).delete()
        db.commit()
