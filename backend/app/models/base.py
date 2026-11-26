from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Parent class for every table. Base.metadata knows about all models that are imported."""
