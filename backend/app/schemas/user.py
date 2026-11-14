import uuid
from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, StringConstraints

# Must match the language codes the client's i18next setup uses.
Language = Literal["en", "ar", "he"]


class UserCreate(BaseModel):
    """Body of POST /api/auth/register."""

    email: EmailStr
    # Upper limit stops someone sending a huge string to make hashing slow.
    password: str = Field(min_length=8, max_length=128)
    display_name: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
    preferred_language: Language = "en"


class UserRead(BaseModel):
    """What the API sends back about a user. Never includes password_hash."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    display_name: str
    preferred_language: str
    created_at: datetime
