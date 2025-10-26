"""
Authentication utilities for JWT token handling and password hashing
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import sqlite3

from config import settings
from models import TokenData, UserInDB
from database import get_db_connection


# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# HTTP Bearer token scheme
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate password hash"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token
    
    Args:
        data: Dictionary containing token payload
        expires_delta: Optional expiration time delta
    
    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    return encoded_jwt


def decode_access_token(token: str) -> TokenData:
    """
    Decode and verify JWT access token
    
    Args:
        token: JWT token string
    
    Returns:
        TokenData object with decoded information
    
    Raises:
        HTTPException: If token is invalid or expired
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        
        if email is None:
            raise credentials_exception
        
        return TokenData(email=email)
    
    except JWTError:
        raise credentials_exception


def get_user_by_email(conn: sqlite3.Connection, email: str) -> Optional[UserInDB]:
    """
    Get user from database by email
    
    Args:
        conn: Database connection
        email: User's email address
    
    Returns:
        UserInDB object if found, None otherwise
    """
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM users WHERE email = ?",
        (email,)
    )
    row = cursor.fetchone()
    
    if row:
        return UserInDB(
            id=row["id"],
            full_name=row["full_name"],
            email=row["email"],
            hashed_password=row["hashed_password"],
            is_active=bool(row["is_active"]),
            created_at=datetime.fromisoformat(row["created_at"])
        )
    
    return None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    conn: sqlite3.Connection = Depends(get_db_connection)
) -> UserInDB:
    """
    Get current authenticated user from JWT token
    
    Args:
        credentials: HTTP Bearer credentials from request
        conn: Database connection
    
    Returns:
        Current user object
    
    Raises:
        HTTPException: If authentication fails
    """
    token = credentials.credentials
    token_data = decode_access_token(token)
    
    user = get_user_by_email(conn, email=token_data.email)
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    return user


async def get_current_active_user(
    current_user: UserInDB = Depends(get_current_user)
) -> UserInDB:
    """
    Get current active user (additional check for user status)
    
    Args:
        current_user: Current authenticated user
    
    Returns:
        Current active user
    
    Raises:
        HTTPException: If user is inactive
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    return current_user

