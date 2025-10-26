# LexiFlow AI - Backend API

FastAPI backend with user authentication using SQLite3 for the LexiFlow AI PDF Reader application.

## Features

- ✅ User registration with email validation
- ✅ User login with JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ Email validation
- ✅ Protected routes with token verification
- ✅ SQLite3 database with proper indexing
- ✅ CORS configuration for frontend integration
- ✅ Comprehensive API documentation (Swagger/ReDoc)
- ✅ Request/response validation with Pydantic
- ✅ Security best practices

## Tech Stack

- **Framework**: FastAPI 0.104.1
- **Database**: SQLite3
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: Pydantic v2
- **Server**: Uvicorn

## Project Structure

```
Backend/
├── main.py                 # Application entry point
├── config.py              # Configuration management
├── database.py            # Database setup and management
├── models.py              # Pydantic models
├── auth.py                # Authentication utilities
├── routers/               # API route modules
│   ├── __init__.py
│   └── auth.py           # Authentication routes
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables (not in git)
├── .env.example          # Example environment variables
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## Installation

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Setup Steps

1. **Navigate to Backend directory:**
   ```bash
   cd Backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   **⚠️ IMPORTANT**: Edit `.env` and change the `SECRET_KEY` to a secure random string in production!

6. **Initialize database:**
   ```bash
   python database.py
   ```

## Running the Server

### Development Mode (with auto-reload)

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at:
- **API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Public Endpoints

#### 1. Root
- **GET** `/`
- Returns API information and status

#### 2. Health Check
- **GET** `/health`
- Returns health status of the API

### Authentication Endpoints

#### 1. Register User
- **POST** `/auth/register`
- **Body:**
  ```json
  {
    "full_name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }
  ```
- **Response:** `201 Created`
  ```json
  {
    "message": "User registered successfully",
    "detail": "Welcome, John Doe! Please login with your credentials."
  }
  ```

#### 2. Login
- **POST** `/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "SecurePass123"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer"
  }
  ```

#### 3. Get Current User Profile (Protected)
- **GET** `/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK`
  ```json
  {
    "id": 1,
    "full_name": "John Doe",
    "email": "john@example.com",
    "is_active": true,
    "created_at": "2023-10-26T12:00:00"
  }
  ```

#### 4. Verify Token (Protected)
- **GET** `/auth/verify`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK`
  ```json
  {
    "message": "Token is valid",
    "detail": "Authenticated as john@example.com"
  }
  ```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

## Security Features

- **Password Hashing**: Passwords are hashed using bcrypt before storage
- **JWT Authentication**: Secure token-based authentication
- **Email Validation**: Email format validation using email-validator
- **Password Requirements**: Minimum 8 characters, at least one letter and one digit
- **Token Expiration**: Configurable token expiration time
- **CORS Protection**: Configurable CORS origins
- **SQL Injection Prevention**: Parameterized queries
- **Input Validation**: Comprehensive request validation with Pydantic

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Secret key for JWT encoding | Required |
| `ALGORITHM` | JWT algorithm | HS256 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration time | 30 |
| `DATABASE_URL` | SQLite database path | sqlite:///./lexiflow.db |
| `CORS_ORIGINS` | Allowed CORS origins | http://localhost:3000,http://localhost:3001 |
| `ENVIRONMENT` | Environment mode | development |

## Testing with cURL

### Register a new user
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

### Login
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

### Get user profile (replace TOKEN with actual token)
```bash
curl -X GET "http://localhost:8000/auth/me" \
  -H "Authorization: Bearer TOKEN"
```

## Integration with Frontend

The backend is configured to accept requests from:
- `http://localhost:3000` (default React development server)
- `http://localhost:3001` (alternative port)

To integrate with your React frontend:

1. Install axios in frontend:
   ```bash
   npm install axios
   ```

2. Create an API service file (`src/services/api.js`):
   ```javascript
   import axios from 'axios';

   const API_BASE_URL = 'http://localhost:8000';

   const api = axios.create({
     baseURL: API_BASE_URL,
     headers: {
       'Content-Type': 'application/json',
     },
   });

   // Add token to requests
   api.interceptors.request.use((config) => {
     const token = localStorage.getItem('token');
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });

   export const authAPI = {
     register: (data) => api.post('/auth/register', data),
     login: (data) => api.post('/auth/login', data),
     getProfile: () => api.get('/auth/me'),
     verifyToken: () => api.get('/auth/verify'),
   };

   export default api;
   ```

## Development Tips

1. **Auto-reload**: The server automatically reloads when code changes in development mode
2. **Interactive Docs**: Visit `/docs` for interactive API testing
3. **Database Browser**: Use DB Browser for SQLite to inspect the database
4. **Logging**: Check console output for request logs and errors

## Production Deployment

For production deployment:

1. **Change SECRET_KEY**: Use a strong, random secret key
2. **Disable auto-reload**: Remove `--reload` flag
3. **Use environment variables**: Don't commit `.env` file
4. **Enable HTTPS**: Use a reverse proxy (nginx, Apache)
5. **Database backup**: Implement regular backup strategy
6. **Rate limiting**: Add rate limiting middleware
7. **Logging**: Configure production logging
8. **Monitoring**: Add health check monitoring

## Troubleshooting

### Database Locked Error
- Ensure no other process is accessing the database
- Check file permissions

### CORS Errors
- Verify frontend URL is in `CORS_ORIGINS`
- Check if preflight requests are allowed

### Import Errors
- Ensure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

### Token Validation Errors
- Check token hasn't expired
- Verify `SECRET_KEY` matches between sessions

## Future Enhancements

- [ ] Password reset functionality
- [ ] Email verification
- [ ] Refresh token implementation
- [ ] Rate limiting
- [ ] PDF upload and processing endpoints
- [ ] OCR processing integration
- [ ] AI chatbot endpoints
- [ ] User profile management
- [ ] Document management endpoints

## License

MIT License - See LICENSE file for details

## Support

For issues or questions, please open an issue on the GitHub repository.

