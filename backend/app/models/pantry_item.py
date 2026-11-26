import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy import CheckConstraint, Date, ForeignKey, Numeric, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class PantryItem(Base):
    __tablename__ = "pantry_items"
    __table_args__ = (
        CheckConstraint("quantity > 0", name="ck_pantry_items_quantity_positive"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(200))
    quantity: Mapped[Decimal] = mapped_column(Numeric(10, 3))
    unit: Mapped[str] = mapped_column(String(32))
    expiration_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    barcode: Mapped[str | None] = mapped_column(String(64), nullable=True)