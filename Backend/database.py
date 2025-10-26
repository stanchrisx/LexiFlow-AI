"""
Database setup and management using SQLite3
"""
import sqlite3
from contextlib import contextmanager
from typing import Generator
import os


DATABASE_PATH = "lexiflow.db"


def init_database():
    """Initialize the database with required tables"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create index on email for faster lookups
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_users_email 
        ON users(email)
    """)
    
    conn.commit()
    conn.close()
    print("✅ Database initialized successfully")


@contextmanager
def get_db() -> Generator[sqlite3.Connection, None, None]:
    """
    Context manager for database connections
    Ensures proper connection handling and cleanup
    """
    conn = sqlite3.connect(DATABASE_PATH)
    # Enable Row factory for dict-like access
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def get_db_connection():
    """
    Get a database connection for dependency injection
    Used in FastAPI endpoints
    """
    conn = sqlite3.connect(DATABASE_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


if __name__ == "__main__":
    # Initialize database when run directly
    init_database()

