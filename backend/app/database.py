import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "salesgenie.db")
DEFAULT_SQLITE_URL = f"sqlite:///{DB_PATH.replace('\\', '/')}"

DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_SQLITE_URL)

try:
    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    else:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            pass
except Exception:
    engine = create_engine(DEFAULT_SQLITE_URL, connect_args={"check_same_thread": False})

# Ensure updated_at column exists on pre-existing leads table
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE leads ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
        conn.commit()
    except Exception:
        pass

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()