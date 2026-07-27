import os
<<<<<<< HEAD
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()  # reads variables from a .env file if present

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./salesgenie.db")

# connect_args is only needed for SQLite (allows use across threads)
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
=======

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set.")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)
>>>>>>> 0a08b43 (Update backend code)

Base = declarative_base()


def get_db():
<<<<<<< HEAD
    """
    This function is used by FastAPI as a 'dependency'.
    It opens a database session, gives it to the route function,
    and makes sure it is closed afterwards - even if an error happens.
    """
=======
>>>>>>> 0a08b43 (Update backend code)
    db = SessionLocal()
    try:
        yield db
    finally:
<<<<<<< HEAD
        db.close()
=======
        db.close()
>>>>>>> 0a08b43 (Update backend code)
