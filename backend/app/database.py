import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()  # reads variables from a .env file if present

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./salesgenie.db")

# connect_args is only needed for SQLite (allows use across threads)
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    This function is used by FastAPI as a 'dependency'.
    It opens a database session, gives it to the route function,
    and makes sure it is closed afterwards - even if an error happens.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
