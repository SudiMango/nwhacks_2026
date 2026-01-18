from sqlalchemy import Column, DateTime, ForeignKey, UniqueConstraint, func, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .Book import Base, Book

class TBRItem(Base):
    __tablename__ = "tbr_items"
    __table_args__ = (
        UniqueConstraint("user_id", "book_id", name="uq_tbr_user_book"),
    )

    tbr_id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), nullable=False)
    book_id = Column(UUID(as_uuid=True), ForeignKey("books.book_id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    book = relationship(Book, lazy="joined")
