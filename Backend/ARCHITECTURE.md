# LexiFlow AI Backend - Architecture Documentation

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                        │
│  ┌────────────┐  ┌────────────┐  ┌─────────────┐              │
│  │   Login    │  │  Register  │  │  Dashboard  │              │
│  └────────────┘  └────────────┘  └─────────────┘              │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/HTTPS (CORS enabled)
                         │ JWT Bearer Token
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FastAPI Backend (Python)                     │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    API Layer (main.py)                    │ │
│  │  - CORS Middleware                                        │ │
│  │  - Request/Response Handling                              │ │
│  │  - Exception Handling                                     │ │
│  └───────────────────────────────────────────────────────────┘ │
│                           │                                     │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                  Routers (routers/)                       │ │
│  │  ┌────────────────────────────────────────────┐          │ │
│  │  │  Authentication Router (auth.py)           │          │ │
│  │  │  - POST /auth/register                     │          │ │
│  │  │  - POST /auth/login                        │          │ │
│  │  │  - GET  /auth/me (protected)               │          │ │
│  │  │  - GET  /auth/verify (protected)           │          │ │
│  │  └────────────────────────────────────────────┘          │ │
│  └───────────────────────────────────────────────────────────┘ │
│                           │                                     │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              Authentication Layer (auth.py)               │ │
│  │  - Password Hashing (bcrypt)                              │ │
│  │  - JWT Token Generation                                   │ │
│  │  - Token Verification                                     │ │
│  │  - User Authentication                                    │ │
│  └───────────────────────────────────────────────────────────┘ │
│                           │                                     │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │               Validation Layer (models.py)                │ │
│  │  - Request Validation (Pydantic)                          │ │
│  │  - Response Serialization                                 │ │
│  │  - Data Type Enforcement                                  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                           │                                     │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              Database Layer (database.py)                 │ │
│  │  - Connection Management                                  │ │
│  │  - Query Execution                                        │ │
│  │  - Transaction Handling                                   │ │
│  └───────────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SQLite3 Database (lexiflow.db)                │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Users Table                                              │ │
│  │  - id (PRIMARY KEY)                                       │ │
│  │  - full_name                                              │ │
│  │  - email (UNIQUE, INDEXED)                                │ │
│  │  - hashed_password                                        │ │
│  │  - is_active                                              │ │
│  │  - created_at                                             │ │
│  │  - updated_at                                             │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Authentication Flow

### User Registration Flow
```
Client                  API                  Auth Layer          Database
  │                      │                      │                   │
  ├─1. POST /auth/register────────────────────►│                   │
  │    {fullName, email, password}             │                   │
  │                      │                      │                   │
  │                      ├─2. Validate input────►                   │
  │                      │    (Pydantic models) │                   │
  │                      │                      │                   │
  │                      │                      ├─3. Check if email │
  │                      │                      │    exists         │
  │                      │                      │──────────────────►│
  │                      │                      │◄──────────────────┤
  │                      │                      │    (user or null) │
  │                      │                      │                   │
  │                      │                      ├─4. Hash password  │
  │                      │                      │    (bcrypt)       │
  │                      │                      │                   │
  │                      │                      ├─5. Insert user────►│
  │                      │                      │                   │
  │                      │◄─────────────────────┤                   │
  │◄─6. 201 Created──────┤                      │                   │
  │    {message, detail} │                      │                   │
```

### User Login Flow
```
Client                  API                  Auth Layer          Database
  │                      │                      │                   │
  ├─1. POST /auth/login──────────────────────►│                   │
  │    {email, password} │                      │                   │
  │                      │                      │                   │
  │                      ├─2. Validate input────►                   │
  │                      │    (Pydantic)        │                   │
  │                      │                      │                   │
  │                      │                      ├─3. Get user by────►│
  │                      │                      │    email          │
  │                      │                      │◄──────────────────┤
  │                      │                      │    (user data)    │
  │                      │                      │                   │
  │                      │                      ├─4. Verify password│
  │                      │                      │    (bcrypt)       │
  │                      │                      │                   │
  │                      │                      ├─5. Generate JWT   │
  │                      │                      │    token          │
  │                      │                      │                   │
  │                      │◄─────────────────────┤                   │
  │◄─6. 200 OK───────────┤                      │                   │
  │    {access_token,    │                      │                   │
  │     token_type}      │                      │                   │
  │                      │                      │                   │
  ├─7. Store token       │                      │                   │
  │    (localStorage)    │                      │                   │
```

### Protected Endpoint Access Flow
```
Client                  API                  Auth Layer          Database
  │                      │                      │                   │
  ├─1. GET /auth/me──────────────────────────►│                   │
  │    Authorization:    │                      │                   │
  │    Bearer <token>    │                      │                   │
  │                      │                      │                   │
  │                      ├─2. Extract token─────►                   │
  │                      │    from header       │                   │
  │                      │                      │                   │
  │                      │                      ├─3. Decode & verify│
  │                      │                      │    JWT token      │
  │                      │                      │    (signature,    │
  │                      │                      │     expiration)   │
  │                      │                      │                   │
  │                      │                      ├─4. Get user by────►│
  │                      │                      │    email from     │
  │                      │                      │    token          │
  │                      │                      │◄──────────────────┤
  │                      │                      │    (user data)    │
  │                      │                      │                   │
  │                      │◄─────────────────────┤                   │
  │◄─5. 200 OK───────────┤                      │                   │
  │    {user profile}    │                      │                   │
```

## 📦 Component Breakdown

### 1. Main Application (main.py)
**Responsibilities:**
- Application initialization
- CORS middleware configuration
- Router registration
- Global exception handling
- Lifespan events (startup/shutdown)

**Key Features:**
- Automatic database initialization on startup
- Interactive API documentation (Swagger/ReDoc)
- Health check endpoint
- Environment-aware configuration

### 2. Configuration (config.py)
**Responsibilities:**
- Environment variable management
- Settings validation
- Configuration centralization

**Key Settings:**
- JWT secret key and algorithm
- Token expiration time
- Database connection string
- CORS allowed origins
- Environment mode

### 3. Database Layer (database.py)
**Responsibilities:**
- Database connection management
- Schema initialization
- Context manager for safe connections
- Dependency injection for FastAPI

**Features:**
- Automatic table creation
- Index management for performance
- Row factory for dict-like access
- Transaction handling

### 4. Models (models.py)
**Responsibilities:**
- Request/response validation
- Data serialization/deserialization
- Type enforcement
- Business logic validation

**Model Types:**
- `UserCreate` - Registration validation
- `UserLogin` - Login validation
- `UserResponse` - Safe user data for responses
- `UserInDB` - Database representation
- `Token` - JWT token response
- `MessageResponse` - Generic messages

### 5. Authentication (auth.py)
**Responsibilities:**
- Password hashing and verification
- JWT token generation and validation
- User authentication
- Dependency injection for protected routes

**Security Features:**
- Bcrypt password hashing with automatic salting
- JWT with expiration
- Token signature verification
- Secure password comparison

### 6. Authentication Router (routers/auth.py)
**Responsibilities:**
- Authentication endpoint implementation
- Request handling
- Response formatting
- Error handling

**Endpoints:**
- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication
- `GET /auth/me` - Get current user (protected)
- `GET /auth/verify` - Verify token (protected)

## 🔐 Security Architecture

### Defense Layers

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Input Validation                                   │
│ - Pydantic models validate all inputs                       │
│ - Email format validation                                   │
│ - Password strength requirements                            │
│ - Type checking and coercion                                │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Authentication                                      │
│ - JWT token verification                                     │
│ - Token expiration checking                                 │
│ - Signature validation                                      │
│ - Bearer token scheme                                        │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Authorization                                       │
│ - User active status check                                   │
│ - Role-based access (future)                                │
│ - Resource ownership (future)                               │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: Data Protection                                     │
│ - Password hashing (bcrypt)                                  │
│ - SQL injection prevention (parameterized queries)          │
│ - XSS prevention (response validation)                      │
│ - CORS protection                                            │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow

### Request Processing Pipeline

```
1. Client Request
   │
   ├─► CORS Middleware ──► Check origin allowed
   │                       Add CORS headers
   │
   ├─► Request Validation ──► Pydantic model validation
   │                          Type checking
   │                          Format validation
   │
   ├─► Authentication ──────► Extract token (if required)
   │                          Verify JWT signature
   │                          Check expiration
   │                          Load user from database
   │
   ├─► Business Logic ──────► Execute endpoint logic
   │                          Database operations
   │                          Process data
   │
   ├─► Response Validation ─► Serialize with Pydantic
   │                          Ensure no sensitive data leaked
   │
   └─► Client Response
```

## 🗄️ Database Design

### Users Table Schema

```sql
CREATE TABLE users (
    -- Primary key
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- User information
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    
    -- Security
    hashed_password TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance optimization
CREATE INDEX idx_users_email ON users(email);
```

**Design Decisions:**
- `email` is UNIQUE to prevent duplicate accounts
- `hashed_password` stores bcrypt hash, never plain text
- `is_active` allows soft account deactivation
- Indexed `email` for fast lookups during login
- Timestamps for audit trail

## 🚀 Performance Considerations

### Current Optimizations
1. **Database Indexing** - Email column indexed for fast lookups
2. **Connection Pooling** - Context managers for efficient connections
3. **Lazy Loading** - Dependencies only loaded when needed
4. **Response Validation** - Only necessary fields serialized
5. **Token Caching** - JWT tokens cached client-side

### Future Optimizations
1. **Redis Caching** - Cache user sessions and frequently accessed data
2. **Database Migration** - Move to PostgreSQL for production
3. **Connection Pooling** - Implement proper connection pool
4. **Rate Limiting** - Prevent abuse of authentication endpoints
5. **CDN Integration** - Serve static assets via CDN

## 🔮 Extensibility

### Easy Extensions

1. **Add New Endpoints**
   ```python
   # Create new router file
   # routers/documents.py
   from fastapi import APIRouter
   
   router = APIRouter(prefix="/documents", tags=["Documents"])
   
   @router.get("/")
   async def list_documents():
       return {"documents": []}
   
   # Register in main.py
   from routers import documents
   app.include_router(documents.router)
   ```

2. **Add New Models**
   ```python
   # models.py
   class DocumentCreate(BaseModel):
       title: str
       file_path: str
   ```

3. **Add Middleware**
   ```python
   # main.py
   from fastapi.middleware.trustedhost import TrustedHostMiddleware
   
   app.add_middleware(
       TrustedHostMiddleware, 
       allowed_hosts=["example.com"]
   )
   ```

## 📈 Scalability Path

```
Phase 1: Current (Single Instance)
└─ SQLite + FastAPI on single server

Phase 2: Horizontal Scaling
├─ PostgreSQL (shared database)
├─ Multiple FastAPI instances
└─ Load balancer

Phase 3: Microservices
├─ Auth Service
├─ Document Service
├─ OCR Service
└─ AI Chat Service

Phase 4: Cloud Native
├─ Kubernetes deployment
├─ Cloud database (RDS/Cloud SQL)
├─ Object storage (S3/GCS)
└─ Managed services
```

## 🧪 Testing Strategy

### Current Testing
- Manual API testing via `/docs`
- Automated test script (`test_api.py`)
- Request/response validation

### Future Testing
- Unit tests for each module
- Integration tests for API endpoints
- Load testing for performance
- Security testing (OWASP Top 10)
- End-to-end testing with frontend

## 📚 Dependencies

### Core Dependencies
- **FastAPI** - Modern web framework
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation
- **python-jose** - JWT handling
- **passlib** - Password hashing

### Why These Choices?
- **FastAPI**: High performance, automatic docs, type hints
- **Pydantic v2**: Fast validation, clear error messages
- **bcrypt**: Industry standard for password hashing
- **JWT**: Stateless authentication, mobile-friendly
- **SQLite**: Zero-config, perfect for development

---

**Architecture Version:** 1.0  
**Last Updated:** October 2025  
**Author:** LexiFlow AI Team

