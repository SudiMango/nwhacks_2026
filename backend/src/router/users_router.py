from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..service.user_service import UserService
from ..service.recommendation_service import RecommendationService
from ..util.db import get_db

router = APIRouter(prefix="/users", tags=["users"])
user_service = UserService()
recs_service = RecommendationService()


class FavoriteGenresRequest(BaseModel):
  genres: List[str]


class LastBookRequest(BaseModel):
  book_name: str

class NameRequest(BaseModel):
  name: str


@router.post("/{user_id}/favorite-genres")
def add_favorite_genres(user_id: UUID, request: FavoriteGenresRequest, db: Session = Depends(get_db)):
  return user_service.add_favorite_genres(db, user_id, request.genres)


@router.delete("/{user_id}/favorite-genres")
def delete_favorite_genres(user_id: UUID, request: FavoriteGenresRequest, db: Session = Depends(get_db)):
  return user_service.delete_favorite_genres(db, user_id, request.genres)


@router.put("/{user_id}/last-book")
def set_last_book_read(user_id: UUID, request: LastBookRequest, db: Session = Depends(get_db)):
  return user_service.set_last_book_read(db, user_id, request.book_name)


@router.delete("/{user_id}/last-book")
def clear_last_book_read(user_id: UUID, db: Session = Depends(get_db)):
  return user_service.clear_last_book_read(db, user_id)


@router.put("/{user_id}/name")
def set_user_name(user_id: UUID, request: NameRequest, db: Session = Depends(get_db)):
  return user_service.set_name(db, user_id, request.name)


@router.get("/{user_id}/recommendations")
def get_recommendations(user_id: UUID, db: Session = Depends(get_db)):
  user = user_service._get_user_or_404(db, user_id)
  recs = recs_service.recommend(user.favorite_genres or [], user.last_book_read or "", count=8)
  titles = [item.get("title", "") for item in recs if item.get("title")]
  user_service.save_recommendations(db, user_id, titles)
  return {"recommendations": recs}
