"""
LexiFlow AI - FastAPI Backend
Main application entry point
"""
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from config import settings
from database import init_database
from mongodb import MongoDB, init_mongodb
from routers import auth
from routers import pdf


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    print("🚀 Starting LexiFlow AI Backend...")
    init_database()
    MongoDB.connect()
    init_mongodb()
    print(f"✅ Running in {settings.ENVIRONMENT} mode")
    yield
    # Shutdown
    print("👋 Shutting down LexiFlow AI Backend...")
    MongoDB.close()


# Initialize FastAPI application
app = FastAPI(
    title="LexiFlow AI API",
    description="Backend API for LexiFlow AI PDF Reader with intelligent document processing",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(auth.router)
app.include_router(pdf.router)


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint - API health check
    """
    return {
        "message": "Welcome to LexiFlow AI API",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
        "environment": settings.ENVIRONMENT
    }


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint for monitoring
    """
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": "healthy",
            "environment": settings.ENVIRONMENT,
            "version": "1.0.0"
        }
    )


# Custom exception handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Handle 404 errors"""
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={
            "error": "Not Found",
            "detail": "The requested resource was not found",
            "status_code": 404
        }
    )


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """Handle 500 errors"""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "detail": "An unexpected error occurred",
            "status_code": 500
        }
    )


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.ENVIRONMENT == "development"
    )

