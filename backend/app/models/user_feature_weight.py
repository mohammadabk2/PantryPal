import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, Float, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class UserFeatureWeight(Base):
    """How much one scoring factor matters to one user (used by the recipe recommender).

    Only stored once a user's weight differs from the default in
    app/recommendations/weights.py, so a new user has no rows here.
    Feature names are validated in code, so adding one needs no database change.
    """

    __tablename__ = "user_feature_weights"
    __table_args__ = (
        # The scoring formula decides whether a factor adds or subtracts, so weights are never negative.
        CheckConstraint("weight >= 0", name="ck_user_feature_weights_weight_non_negative"),
    )

    # Rows are deleted automatically when the user is deleted.
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    feature: Mapped[str] = mapped_column(String(32), primary_key=True)  # e.g. "expiring"
    weight: Mapped[float] = mapped_column(Float)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
