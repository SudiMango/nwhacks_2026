from sqlalchemy import Column, DateTime, func, text, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from .Base import Base


class UserRecommendation(Base):
    __tablename__ = "user_recommendations"

    recommendation_id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    book_id = Column(UUID(as_uuid=True), ForeignKey("books.book_id", ondelete="CASCADE"), nullable=False)
    
    __table_args__ = (
        UniqueConstraint("user_id", "book_id", name="uq_user_recommendations_user_book"),
    )
