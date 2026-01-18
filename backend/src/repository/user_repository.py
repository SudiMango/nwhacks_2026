from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session

from ..models.User import User


class UserRepository:
    def get_by_id(self, db: Session, user_id: UUID) -> Optional[User]:
        return db.query(User).filter(User.user_id == user_id).first()

    def update_favorite_genres(self, db: Session, user: User, genres: List[str]) -> User:
        existing = set(user.favorite_genres or [])
        merged = list(existing.union(genres))
        user.favorite_genres = merged
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def remove_favorite_genres(self, db: Session, user: User, genres: List[str]) -> User:
        existing = set(user.favorite_genres or [])
        updated = [g for g in existing if g not in set(genres)]
        user.favorite_genres = updated
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def set_last_book_read(self, db: Session, user: User, book_name: str) -> User:
        user.last_book_read = book_name
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def clear_last_book_read(self, db: Session, user: User) -> User:
        user.last_book_read = None
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def set_name(self, db: Session, user: User, name: str) -> User:
        user.name = name
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
  
    def find_by_email(self, db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()
    
    def find_by_username(self, db: Session, username: str) -> Optional[User]:
        return db.query(User).filter(User.username == username).first()
    
    def find_users_by_ids(self, db: Session, user_ids: list[UUID]) -> list[User]:
        return db.query(User).filter(User.user_id.in_(user_ids)).all()

    def create_user(self, db: Session, user: User) -> None:
        db.add(user)
        db.commit()
        db.refresh(user)

    def find_by_id(self, db: Session, user_id) -> Optional[User]:
        return db.query(User).filter(User.user_id == user_id).first()