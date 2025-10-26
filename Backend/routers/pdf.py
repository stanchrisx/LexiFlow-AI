"""
PDF document management routes
Upload, process, retrieve, and edit PDF documents
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import List
from datetime import datetime
from bson import ObjectId
from pymongo.database import Database

from models import (
    PDFUploadResponse, 
    PDFDocumentResponse, 
    PDFDocument,
    PDFPage,
    ContentUpdateRequest,
    UserResponse,
    MessageResponse
)
from mongodb import get_mongodb
from pdf_extraction_service import pdf_extraction_service
from auth import get_current_active_user
import logging


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/pdf", tags=["PDF Documents"])


@router.post("/upload", response_model=PDFUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_pdf(
    file: UploadFile = File(...),
    current_user: UserResponse = Depends(get_current_active_user),
    db: Database = Depends(get_mongodb)
):
    """
    Upload and process a PDF file
    Extracts text and images using PyMuPDF and Tesseract OCR
    
    Args:
        file: PDF file to upload
        current_user: Current authenticated user
        db: MongoDB database
        
    Returns:
        PDFUploadResponse with document ID and processing status
    """
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed"
        )
    
    try:
        # Read PDF file
        pdf_bytes = await file.read()
        
        logger.info(f"Processing PDF upload: {file.filename} for user {current_user.id}")
        
        # Extract content from PDF
        pages, file_size = pdf_extraction_service.extract_pdf_content(pdf_bytes, file.filename)
        
        # Create document object
        document = PDFDocument(
            title=file.filename.replace('.pdf', ''),
            filename=file.filename,
            user_id=current_user.id,
            pages=pages,
            total_pages=len(pages),
            file_size=file_size,
            uploaded_at=datetime.utcnow(),
            processed_at=datetime.utcnow(),
            metadata={
                "original_filename": file.filename,
                "content_type": file.content_type
            }
        )
        
        # Convert to dict for MongoDB
        document_dict = document.model_dump()
        
        # Convert datetime to ISO format
        document_dict['uploaded_at'] = document_dict['uploaded_at'].isoformat() if isinstance(document_dict['uploaded_at'], datetime) else document_dict['uploaded_at']
        document_dict['processed_at'] = document_dict['processed_at'].isoformat() if isinstance(document_dict['processed_at'], datetime) else document_dict['processed_at']
        
        # Insert into MongoDB
        result = db.documents.insert_one(document_dict)
        
        logger.info(f"PDF document saved to MongoDB with ID: {result.inserted_id}")
        
        return PDFUploadResponse(
            message="PDF uploaded and processed successfully",
            document_id=str(result.inserted_id),
            title=document.title,
            total_pages=document.total_pages,
            processing_status="completed"
        )
        
    except Exception as e:
        logger.error(f"Failed to process PDF: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process PDF: {str(e)}"
        )


@router.get("/documents", response_model=List[PDFDocumentResponse])
async def get_user_documents(
    current_user: UserResponse = Depends(get_current_active_user),
    db: Database = Depends(get_mongodb)
):
    """
    Get all PDF documents for the current user
    
    Args:
        current_user: Current authenticated user
        db: MongoDB database
        
    Returns:
        List of PDFDocumentResponse objects
    """
    try:
        # Query documents for user
        documents = db.documents.find(
            {"user_id": current_user.id}
        ).sort("uploaded_at", -1)
        
        result = []
        for doc in documents:
            result.append(PDFDocumentResponse(
                id=str(doc['_id']),
                title=doc['title'],
                filename=doc['filename'],
                user_id=doc['user_id'],
                total_pages=doc['total_pages'],
                file_size=doc['file_size'],
                uploaded_at=doc['uploaded_at'],
                processed_at=doc.get('processed_at'),
                has_content=len(doc.get('pages', [])) > 0
            ))
        
        return result
        
    except Exception as e:
        logger.error(f"Failed to retrieve documents: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve documents: {str(e)}"
        )


@router.get("/document/{document_id}", response_model=PDFDocument)
async def get_document(
    document_id: str,
    current_user: UserResponse = Depends(get_current_active_user),
    db: Database = Depends(get_mongodb)
):
    """
    Get full PDF document with all content
    
    Args:
        document_id: MongoDB document ID
        current_user: Current authenticated user
        db: MongoDB database
        
    Returns:
        Complete PDFDocument object
    """
    try:
        # Validate ObjectId
        if not ObjectId.is_valid(document_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid document ID"
            )
        
        # Query document
        document = db.documents.find_one({
            "_id": ObjectId(document_id),
            "user_id": current_user.id
        })
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Remove MongoDB _id field
        document.pop('_id', None)
        
        return PDFDocument(**document)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to retrieve document: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve document: {str(e)}"
        )


@router.get("/document/{document_id}/page/{page_number}", response_model=PDFPage)
async def get_document_page(
    document_id: str,
    page_number: int,
    current_user: UserResponse = Depends(get_current_active_user),
    db: Database = Depends(get_mongodb)
):
    """
    Get a specific page from a PDF document
    
    Args:
        document_id: MongoDB document ID
        page_number: Page number (1-indexed)
        current_user: Current authenticated user
        db: MongoDB database
        
    Returns:
        PDFPage object
    """
    try:
        # Validate ObjectId
        if not ObjectId.is_valid(document_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid document ID"
            )
        
        # Query document
        document = db.documents.find_one({
            "_id": ObjectId(document_id),
            "user_id": current_user.id
        })
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Find the requested page
        pages = document.get('pages', [])
        page = next((p for p in pages if p['page_number'] == page_number), None)
        
        if not page:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Page {page_number} not found"
            )
        
        return PDFPage(**page)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to retrieve page: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve page: {str(e)}"
        )


@router.put("/document/{document_id}/content", response_model=MessageResponse)
async def update_content(
    document_id: str,
    update_request: ContentUpdateRequest,
    current_user: UserResponse = Depends(get_current_active_user),
    db: Database = Depends(get_mongodb)
):
    """
    Update a content block in a PDF document
    
    Args:
        document_id: MongoDB document ID
        update_request: Content update data
        current_user: Current authenticated user
        db: MongoDB database
        
    Returns:
        Success message
    """
    try:
        # Validate ObjectId
        if not ObjectId.is_valid(document_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid document ID"
            )
        
        # Update the specific content block
        result = db.documents.update_one(
            {
                "_id": ObjectId(document_id),
                "user_id": current_user.id,
                "pages.page_number": update_request.page_number
            },
            {
                "$set": {
                    "pages.$[page].content_blocks.$[block].content": update_request.new_content
                }
            },
            array_filters=[
                {"page.page_number": update_request.page_number},
                {"block.order": update_request.block_order}
            ]
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document or content block not found"
            )
        
        logger.info(f"Content updated for document {document_id}, page {update_request.page_number}, block {update_request.block_order}")
        
        return MessageResponse(
            message="Content updated successfully",
            detail=f"Updated block {update_request.block_order} on page {update_request.page_number}"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update content: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update content: {str(e)}"
        )


@router.delete("/document/{document_id}", response_model=MessageResponse)
async def delete_document(
    document_id: str,
    current_user: UserResponse = Depends(get_current_active_user),
    db: Database = Depends(get_mongodb)
):
    """
    Delete a PDF document
    
    Args:
        document_id: MongoDB document ID
        current_user: Current authenticated user
        db: MongoDB database
        
    Returns:
        Success message
    """
    try:
        # Validate ObjectId
        if not ObjectId.is_valid(document_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid document ID"
            )
        
        # Delete document
        result = db.documents.delete_one({
            "_id": ObjectId(document_id),
            "user_id": current_user.id
        })
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        logger.info(f"Document {document_id} deleted by user {current_user.id}")
        
        return MessageResponse(
            message="Document deleted successfully",
            detail=f"Document {document_id} has been removed"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete document: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete document: {str(e)}"
        )

