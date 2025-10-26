"""
Authentication routes for user registration, login, and profile management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from datetime import timedelta
import sqlite3

from models import UserCreate, UserLogin, UserResponse, Token, MessageResponse
from auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_active_user,
    get_user_by_email
)
from database import get_db_connection
from config import settings


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user: UserCreate,
    conn: sqlite3.Connection = Depends(get_db_connection)
):
    """
    Register a new user
    
    Args:
        user: User registration data
        conn: Database connection
    
    Returns:
        Success message
    
    Raises:
        HTTPException: If email already exists
    """
    # Check if user already exists
    existing_user = get_user_by_email(conn, user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash the password
    hashed_password = get_password_hash(user.password)
    
    # Insert new user into database
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            INSERT INTO users (full_name, email, hashed_password)
            VALUES (?, ?, ?)
            """,
            (user.full_name, user.email, hashed_password)
        )
        # Commit is handled by the get_db_connection dependency
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    return MessageResponse(
        message="User registered successfully",
        detail=f"Welcome, {user.full_name}! Please login with your credentials."
    )


@router.post("/login", response_model=Token)
async def login_user(
    user_credentials: UserLogin,
    conn: sqlite3.Connection = Depends(get_db_connection)
):
    """
    Authenticate user and return JWT token
    
    Args:
        user_credentials: User login credentials
        conn: Database connection
    
    Returns:
        JWT access token
    
    Raises:
        HTTPException: If credentials are invalid
    """
    # Get user from database
    user = get_user_by_email(conn, user_credentials.email)
    
    # Verify user exists and password is correct
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )
    
    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: UserResponse = Depends(get_current_active_user)
):
    """
    Get current authenticated user's profile
    
    Args:
        current_user: Current authenticated user
    
    Returns:
        User profile data
    """
    return current_user


@router.get("/verify", response_model=MessageResponse)
async def verify_token(
    current_user: UserResponse = Depends(get_current_active_user)
):
    """
    Verify if the provided token is valid
    
    Args:
        current_user: Current authenticated user
    
    Returns:
        Success message with user info
    """
    return MessageResponse(
        message="Token is valid",
        detail=f"Authenticated as {current_user.email}"
    )

