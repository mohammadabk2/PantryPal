"""Create any missing tables. Run from backend/:  python -m app.init_db

create_all only adds tables that don't exist yet; it won't change existing ones.
"""
from app.database import engine
from app.models import Base


def main() -> None:
    Base.metadata.create_all(bind=engine)
    print("Tables ready:", ", ".join(sorted(Base.metadata.tables)))


if __name__ == "__main__":
    main()
