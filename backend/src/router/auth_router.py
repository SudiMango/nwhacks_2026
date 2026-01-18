from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..util.db import get_db
from ..dto.auth_schemas import SignupRequest, SignUpResponse, LoginRequest, LoginResponse
from ..service.auth_service import AuthService
from ..models.User import User
from ..util.auth_state import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/users", tags=["users"])
service = AuthService()


@router.post("/signup", response_model=SignUpResponse, status_code=status.HTTP_201_CREATED)
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    try:
        return service.signup(db, data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    try:
        d: LoginResponse = service.login(db, data)
        print(d.accessToken)
        return d
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    
@router.get("/me")
def get_current_user_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get the current authenticated user's profile"""
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    return {
        "id": current_user.user_id,
        "email": current_user.email,
        "name": current_user.name,
        "favoriteGenres": current_user.favorite_genres or [],
        "readingFormat": current_user.reading_format,
        "lastBookRead": current_user.last_book_read,
        "onboardingCompleted": current_user.onboarding_completed,
        "createdAt": current_user.created_at.isoformat() if current_user.created_at else None,
    }

class UpdateProfileRequest(BaseModel):
    display_name: str | None = None
    favorite_genres: list[str] | None = None
    reading_format: str | None = None
    onboarding_completed: bool | None = None

@router.patch("/me")
def update_current_user_profile(data: UpdateProfileRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update the current authenticated user's profile"""
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    # Update only provided fields
    if data.display_name is not None:
        current_user.name = data.display_name
    if data.favorite_genres is not None:
        current_user.favorite_genres = data.favorite_genres
    if data.reading_format is not None:
        current_user.reading_format = data.reading_format
    if data.onboarding_completed is not None:
        current_user.onboarding_completed = data.onboarding_completed
    
    db.commit()
    db.refresh(current_user)
    
    return {
        "id": current_user.user_id,
        "email": current_user.email,
        "name": current_user.name,
        "favoriteGenres": current_user.favorite_genres or [],
        "readingFormat": current_user.reading_format,
        "lastBookRead": current_user.last_book_read,
        "onboardingCompleted": current_user.onboarding_completed,
        "createdAt": current_user.created_at.isoformat() if current_user.created_at else None,
    }