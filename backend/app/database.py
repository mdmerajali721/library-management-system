from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings

# SQLAlchemy Engine তৈরি
engine = create_engine(
    settings.DATABASE_URL,
    echo=True
)

# প্রতিটি রিকোয়েস্টের জন্য Database Session তৈরি করার Factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base Class যা থেকে সব ORM Model তৈরি হবে
class Base(DeclarativeBase):
    pass

# Dependency Injection: API 요청 সেবার সময় DB Session পাওয়ার জন্য
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()