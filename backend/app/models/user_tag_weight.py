import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, Float, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class UserTagWeight(Base):
    """How much a user likes a tag: -1 dislikes, 0 neutral, +1 loves.

    Learned from feedback, or set directly when the user says what they like.
    """

    __tablename__ = "user_tag_weights"
    __table_args__ = (
        CheckConstraint("weight BETWEEN -1 AND 1", name="ck_user_tag_weights_weight_range"),
    )

    # Rows are deleted automatically when the user is deleted.
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    tag: Mapped[str] = mapped_column(String(64), primary_key=True)  # lowercase, e.g. "italian", "mushrooms"
    weight: Mapped[float] = mapped_column(Float)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
