from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session, joinedload
from ..models.TBRItem import TBRItem

class TBRRepository:
    def list_for_user(self, db: Session, user_id: UUID) -> List[TBRItem]:
        return (
            db.query(TBRItem)
            .options(joinedload(TBRItem.book))
            .filter(TBRItem.user_id == user_id)
            .order_by(TBRItem.created_at.desc())
            .all()
        )

    def get_item(self, db: Session, user_id: UUID, book_id: UUID) -> Optional[TBRItem]:
        return (
            db.query(TBRItem)
            .options(joinedload(TBRItem.book))
            .filter(TBRItem.user_id == user_id, TBRItem.book_id == book_id)
            .first()
        )

    def add_item(self, db: Session, user_id: UUID, book_id: UUID) -> TBRItem:
        item = TBRItem(user_id=user_id, book_id=book_id)
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    def delete_item(self, db: Session, item: TBRItem) -> None:
        db.delete(item)
        db.commit()
