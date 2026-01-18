from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Text,
    text
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .Base import Base


class UserBook(Base):
    __tablename__ = "user_books"

    user_book_id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False,)

    isbn = Column(Text, ForeignKey("books.isbn", ondelete="CASCADE"), nullable=False,)
    tbr = Column(Boolean, nullable=False, default=True)

    added_at = Column(DateTime(timezone=True), server_default=func.now())