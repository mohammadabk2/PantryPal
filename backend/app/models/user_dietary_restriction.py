import uuid
from datetime import datetime
from enum import StrEnum

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class DietaryRestriction(StrEnum):
    """Allowed values for UserDietaryRestriction.restriction.

    Checked in code, not by the database, so adding one here needs no database change.
    The client shows these via translation keys, so add a translation when you add one.
    """

    VEGETARIAN = "vegetarian"
    VEGAN = "vegan"
    GLUTEN_FREE = "gluten_free"
    DAIRY_FREE = "dairy_free"
    NUT_FREE = "nut_free"
    HALAL = "halal"
    KOSHER = "kosher"


class UserDietaryRestriction(Base):
    """A hard rule: recipes that break it are never recommended, whatever their score."""

    __tablename__ = "user_dietary_restrictions"

    # Rows are deleted automatically when the user is deleted.
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    restriction: Mapped[str] = mapped_column(String(32), primary_key=True)  # a DietaryRestriction value
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
