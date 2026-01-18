from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..util.db import get_db
from ..service.get_book_service import GetBookService
from pydantic import BaseModel
from ..util.auth_state import get_current_user
from ..models.User import User

router = APIRouter(prefix="/user", tags=["user"])

get_book_service = GetBookService()

class TikTokLinkRequest(BaseModel):
    tiktok_url: str

@router.post("/sync-user")
async def sync_user(user_data=Depends(get_current_user), db: Session = Depends(get_db)):
    # 'user_data' is what is returned by supabase.auth.get_user()
    # It contains the unique ID and email from Google/Supabase
    supabase_user_id = user_data.user.id
    email = user_data.user.email
    
    existing_user = db.query(User).filter(User.user_id == supabase_user_id).first()
    if not existing_user:
        new_user = User(id=supabase_user_id, email=email)
        db.add(new_user)
        db.commit()

    return {"status": "success", "message": f"User {email} synced."}