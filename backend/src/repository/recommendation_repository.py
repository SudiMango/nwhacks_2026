from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session

from ..models.Reccomended_Books import UserRecommendation


class RecommendationRepository:
    def upsert(self, db: Session, user_id: UUID, book_id: UUID) -> UserRecommendation:
        existing = (
            db.query(UserRecommendation)
            .filter(UserRecommendation.user_id == user_id, UserRecommendation.book_id == book_id)
            .first()
        )
        if existing:
            return existing

        rec = UserRecommendation(user_id=user_id, book_id=book_id)
        db.add(rec)
        db.commit()
        db.refresh(rec)
        return rec

    def list_for_user(self, db: Session, user_id: UUID) -> List[UserRecommendation]:
        return (
            db.query(UserRecommendation)
            .filter(UserRecommendation.user_id == user_id)
            .all()
        )

    def delete_for_user(self, db: Session, user_id: UUID) -> None:
        db.query(UserRecommendation).filter(UserRecommendation.user_id == user_id).delete()
        db.commit()

    def delete_one(self, db: Session, rec_id: UUID) -> None:
        db.query(UserRecommendation).filter(UserRecommendation.recommendation_id == rec_id).delete()
        db.commit()
