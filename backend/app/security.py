from argon2 import PasswordHasher
from argon2.exceptions import VerificationError

# Argon2id with the library's recommended defaults. Each hash includes its own random salt.
_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    """For login: True if the password matches the stored hash."""
    try:
        return _hasher.verify(password_hash, password)
    except VerificationError:
        return False
