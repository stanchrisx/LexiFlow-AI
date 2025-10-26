"""
Pydantic models for request/response validation
"""
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime


# User Models
class UserBase(BaseModel):
    """Base user model with common fields"""
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)


class UserCreate(UserBase):
    """Model for user registration"""
    password: str = Field(..., min_length=8, max_length=100)
    
    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Validate password meets minimum security requirements"""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isalpha() for char in v):
            raise ValueError('Password must contain at least one letter')
        return v


class UserLogin(BaseModel):
    """Model for user login"""
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserResponse(UserBase):
    """Model for user data in responses"""
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserInDB(UserResponse):
    """Model for user data stored in database"""
    hashed_password: str


# Token Models
class Token(BaseModel):
    """JWT token response"""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Data encoded in JWT token"""
    email: Optional[str] = None


# Response Models
class MessageResponse(BaseModel):
    """Generic message response"""
    message: str
    detail: Optional[str] = None


class ErrorResponse(BaseModel):
    """Error response model"""
    error: str
    detail: Optional[str] = None
    status_code: int


# PDF Document Models
class ContentBlock(BaseModel):
    """A single content block from PDF (text, image, etc.)"""
    type: str  # 'text', 'image', 'heading', 'paragraph'
    content: str  # Text content or base64 encoded image
    page_number: int
    position: Dict[str, float]  # x, y, width, height
    order: int  # Order within the page
    metadata: Optional[Dict[str, Any]] = None
    is_editable: bool = True


class PDFPage(BaseModel):
    """Single page of PDF with extracted content"""
    page_number: int
    content_blocks: List[ContentBlock]
    original_image: Optional[str] = None  # Base64 encoded page image
    has_ocr: bool = False
    ocr_confidence: Optional[float] = None


class PDFDocument(BaseModel):
    """Complete PDF document model"""
    title: str
    filename: str
    user_id: int
    pages: List[PDFPage]
    total_pages: int
    file_size: int  # in bytes
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    processed_at: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class PDFDocumentResponse(BaseModel):
    """PDF document response without full content"""
    id: str
    title: str
    filename: str
    user_id: int
    total_pages: int
    file_size: int
    uploaded_at: datetime
    processed_at: Optional[datetime] = None
    has_content: bool
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class PDFUploadResponse(BaseModel):
    """Response after PDF upload"""
    message: str
    document_id: str
    title: str
    total_pages: int
    processing_status: str


class ContentUpdateRequest(BaseModel):
    """Request to update content block"""
    page_number: int
    block_order: int
    new_content: str

