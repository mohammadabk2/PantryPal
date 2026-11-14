# Import every model here so Base.metadata sees all tables.
from app.models.base import Base
from app.models.user import User

__all__ = ["Base", "User"]
