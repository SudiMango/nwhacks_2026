from sqlalchemy import Column, DateTime, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from .Base import Base


class Video(Base):
    __tablename__ = "videos"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    platform = Column(Text, nullable=True)  # e.g. "tiktok", "youtube"
    url = Column(Text, nullable=False, unique=True)
    transcript = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
