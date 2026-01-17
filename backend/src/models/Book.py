from sqlalchemy import Column, Text, DateTime, func, text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from .Base import Base

class Book(Base):
    __tablename__ = "books"

    book_id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    isbn = Column(Text, nullable=True)
    title = Column(Text, nullable=True)
    author = Column(Text, nullable=True)
    cover_url = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())