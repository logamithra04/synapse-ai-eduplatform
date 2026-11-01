from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import logging

logger = logging.getLogger(__name__)

DEFAULT_SQLITE_URL = "sqlite:///./platform.db"
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_SQLITE_URL)

Base = declarative_base()

def create_resilient_engine(db_url: str):
    """
    Creates an SQLAlchemy engine with pooling and health checks.
    If PostgreSQL fails (e.g., placeholder password or network error),
    gracefully falls back to local SQLite so the platform remains fully functional.
    """
    clean_url = (db_url or "").strip()
    
    # Check if placeholder is present
    if not clean_url or "[YOUR-PASSWORD]" in clean_url or "YOUR-PASSWORD" in clean_url:
        logger.info("[Database] DATABASE_URL contains placeholder. Operating in SQLite mode.")
        return create_engine(
            DEFAULT_SQLITE_URL,
            connect_args={"check_same_thread": False}
        ), DEFAULT_SQLITE_URL

    if clean_url.startswith("postgresql://") or clean_url.startswith("postgres://"):
        try:
            # Recommended pool configuration from Supabase Best Practices
            eng = create_engine(
                clean_url,
                pool_size=10,
                max_overflow=20,
                pool_timeout=5,
                pool_pre_ping=True
            )
            # Verify connectivity with a quick query
            with eng.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("[Database] Successfully connected to Supabase PostgreSQL!")
            return eng, clean_url
        except Exception as ex:
            logger.warning(f"[Database] Failed to connect to PostgreSQL ({ex}). Falling back to SQLite.")
            return create_engine(
                DEFAULT_SQLITE_URL,
                connect_args={"check_same_thread": False}
            ), DEFAULT_SQLITE_URL

    # Default SQLite
    return create_engine(
        clean_url or DEFAULT_SQLITE_URL,
        connect_args={"check_same_thread": False}
    ), clean_url or DEFAULT_SQLITE_URL

# Global engine and sessionmaker
engine, ACTIVE_DATABASE_URL = create_resilient_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def switch_database_engine(new_url: str):
    """Dynamically re-binds SQLAlchemy to a new database URL (e.g. Supabase PostgreSQL)."""
    global engine, SessionLocal, ACTIVE_DATABASE_URL
    new_eng, active_url = create_resilient_engine(new_url)
    engine = new_eng
    ACTIVE_DATABASE_URL = active_url
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    # Ensure tables exist
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        logger.warning(f"[Database] Base.metadata.create_all warning: {e}")
    return active_url
