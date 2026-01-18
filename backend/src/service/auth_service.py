from ..repository.user_repository import UserRepository
from sqlalchemy.orm import Session
from ..dto.auth_schemas import SignupRequest, SignUpResponse, LoginRequest, LoginResponse
from ..models.User import User
from .jwt_service import JwtService
import bcrypt

jwt_service = JwtService()


class AuthService:

    def __init__(self):
        self.repo = UserRepository()

    # Sign up user
    def signup(self, db: Session, data: SignupRequest) -> SignUpResponse:
        # If user already exists then throw error
        existing = self.repo.find_by_email(db, data.email)
        if existing:
            raise ValueError("User with this email already exists")
        
        user = User()
        user.email = data.email
        user.password = self._hash_password(data.password)
        self.repo.create_user(db, user)
        return SignUpResponse()
    
    # Log in user
    def login(self, db: Session, data: LoginRequest) -> LoginResponse:
        # Check for valid credentials
        user = self.repo.find_by_email(db, data.email)
        if not user or not self._verify_password(data.password, user.password):
            raise ValueError("Invalid credentials")

        # JWT stuff
        token = jwt_service.create_token(data.email)
        return LoginResponse(accessToken=token)
    
    """

    Private methods

    """

    # Hash password so it can be stored in database
    def _hash_password(self, password: str) -> str:
        return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    # Verify input password with hashed password stored in database
    def _verify_password(self, password: str, stored: str) -> bool:
        return bcrypt.checkpw(password.encode(), stored.encode())