from sqlalchemy import (
    Column,
    Text,
    Boolean,
    DateTime,
    func
)
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy import text
from sqlalchemy.orm import relationship

from .Base import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    email = Column(Text, nullable=False, unique=True)
    name = Column(Text, nullable=True)

    favorite_genres = Column(ARRAY(Text), nullable=True)
    reading_format = Column(Text, nullable=True)
    last_book_read = Column(Text, nullable=True)

    onboarding_completed = Column(Boolean, nullable=False, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )