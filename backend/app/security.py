import uuid
from datetime import UTC, datetime, timedelta

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerificationError

from app.config import settings

# Argon2id with the library's recommended defaults. Each hash includes its own random salt.
_hasher = PasswordHasher()

# Checked against when the email doesn't exist, so a wrong email takes as long as a wrong
# password. Otherwise response time would reveal which emails have accounts.
_DUMMY_HASH = _hasher.hash("dummy-password-for-timing")

JWT_ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str | None) -> bool:
    """True if the password matches the stored hash. Pass None when there is no such user."""
    try:
        return _hasher.verify(password_hash or _DUMMY_HASH, password) and password_hash is not None
    except VerificationError:
        return False


def create_access_token(user_id: uuid.UUID) -> str:
    now = datetime.now(UTC)
    payload = {
        "sub": str(user_id),  # who the token belongs to
        "iat": now,  # issued at
        "exp": now + timedelta(minutes=settings.access_token_expire_minutes),  # expires at
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> uuid.UUID | None:
    """The user id inside a valid token, or None if the token is fake, edited or expired."""
    try:
        payload = jwt.decode(
            token, settings.jwt_secret_key, algorithms=[JWT_ALGORITHM], options={"require": ["sub", "exp"]}
        )
        return uuid.UUID(payload["sub"])
    except (jwt.InvalidTokenError, ValueError):
        return None
