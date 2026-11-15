import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class UserDietaryRestriction(Base):
    """A hard rule: recipes that break it are never recommended, whatever their score.

    Allowed values are listed in DietaryRestriction in app/recommendations/weights.py.
    """

    __tablename__ = "user_dietary_restrictions"

    # Rows are deleted automatically when the user is deleted.
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    restriction: Mapped[str] = mapped_column(String(32), primary_key=True)  # e.g. "vegetarian"
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
