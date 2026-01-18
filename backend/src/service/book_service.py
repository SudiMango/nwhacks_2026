from typing import List
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from ..repository.book_repository import BookRepository
from ..repository.tbr_repository import TBRRepository
from ..models.TBRItem import TBRItem

class BookService:
    def __init__(self):
        self.book_repo = BookRepository()
        self.tbr_repo = TBRRepository()

    def list_user_tbr(self, db: Session, user_id: UUID) -> List[TBRItem]:
        return self.tbr_repo.list_for_user(db, user_id)

    def add_book_to_tbr(self, db: Session, user_id: UUID, book_id: UUID) -> TBRItem:
        book = self.book_repo.get_by_id(db, book_id)
        if not book:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")

        existing_item = self.tbr_repo.get_item(db, user_id, book_id)
        if existing_item:
            return existing_item

        item = self.tbr_repo.add_item(db, user_id, book_id)
        # ensure relationship is populated without another query
        item.book = book
        return item

    def remove_book_from_tbr(self, db: Session, user_id: UUID, book_id: UUID) -> None:
        item = self.tbr_repo.get_item(db, user_id, book_id)
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not in TBR list")
        self.tbr_repo.delete_item(db, item)
