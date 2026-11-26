import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    # UUID instead of an auto-increment int so IDs in URLs don't reveal how many users exist.
    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)

    # Store emails lowercased (normalize before insert) so the unique index is effectively case-insensitive.
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    # Never store the raw password, only a hash (e.g. bcrypt/argon2).
    password_hash: Mapped[str] = mapped_column(String(255))
    display_name: Mapped[str] = mapped_column(String(100))

    # Matches the client's i18next language codes: "en", "ar", later "he".
    preferred_language: Mapped[str] = mapped_column(String(8), default="en", server_default="en")

    # Lets us disable an account without deleting its data.
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r}>"
