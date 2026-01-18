from typing import List
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..repository.user_repository import UserRepository


class UserService:
  def __init__(self):
    self.user_repo = UserRepository()

  def _get_user_or_404(self, db: Session, user_id: UUID):
    user = self.user_repo.get_by_id(db, user_id)
    if not user:
      raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="User not found",
      )
    return user

  def add_favorite_genres(self, db: Session, user_id: UUID, genres: List[str]):
    user = self._get_user_or_404(db, user_id)
    return self.user_repo.update_favorite_genres(db, user, genres)

  def delete_favorite_genres(self, db: Session, user_id: UUID, genres: List[str]):
    user = self._get_user_or_404(db, user_id)
    return self.user_repo.remove_favorite_genres(db, user, genres)

  def set_last_book_read(self, db: Session, user_id: UUID, book_name: str):
    user = self._get_user_or_404(db, user_id)
    return self.user_repo.set_last_book_read(db, user, book_name)

  def clear_last_book_read(self, db: Session, user_id: UUID):
    user = self._get_user_or_404(db, user_id)
    return self.user_repo.clear_last_book_read(db, user)

  def set_name(self, db: Session, user_id: UUID, name: str):
    user = self._get_user_or_404(db, user_id)
    return self.user_repo.set_name(db, user, name)

  def set_reading_formats(self, db: Session, user_id: UUID, formats: List[str]):
    user = self._get_user_or_404(db, user_id)
    return self.user_repo.set_reading_formats(db, user, formats)

  def get_user(self, db: Session, user_id: UUID):
    return self._get_user_or_404(db, user_id)

  def save_recommendations(self, db: Session, user_id: UUID, recommendations: List[str]):
    user = self._get_user_or_404(db, user_id)
    return self.user_repo.save_recommendations(db, user, recommendations)
