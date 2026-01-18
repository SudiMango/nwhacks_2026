from sqlalchemy.orm import Session
from ..models.Video import Video

class VideoRepository:

    def create_video(self, db: Session, video: Video):
        db.add(video)
        db.commit()
        db.refresh(video)

    def get_video_by_url(self, db: Session, url: str):
        return db.query(Video).filter(Video.url == url).first()