# LexiFlow AI Backend - Quick Start Guide

## 🎯 Overview

The LexiFlow AI backend is a FastAPI-based REST API with SQLite3 database providing secure user authentication for the PDF Reader application.

## ✨ Features Implemented

### ✅ Authentication System
- **User Registration** - Create new user accounts with validation
- **User Login** - JWT token-based authentication
- **Protected Routes** - Secure endpoints requiring authentication
- **Password Security** - Bcrypt hashing for password storage
- **Email Validation** - Email format verification
- **Token Management** - JWT tokens with configurable expiration

### ✅ Database
- **SQLite3** - Lightweight, serverless database
- **Indexed Queries** - Optimized email lookups
- **User Management** - Full CRUD operations for users

### ✅ API Documentation
- **Swagger UI** - Interactive API testing at `/docs`
- **ReDoc** - Alternative documentation at `/redoc`

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
cd Backend
./setup.sh
```

This script will:
- Create a virtual environment
- Install all dependencies
- Initialize the database
- Set up environment variables

### Option 2: Manual Setup

```bash
cd Backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On macOS/Linux
# OR
venv\Scripts\activate     # On Windows

# Install dependencies
pip install -r requirements.txt

# Initialize database
python database.py

# Start server
python main.py
```

## 🌐 Running the Server

### Development Mode
```bash
cd Backend
source venv/bin/activate  # Activate virtual environment
python main.py
```

The server will start at: **http://localhost:8000**

### Access Points
- **API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🧪 Testing the API

### Using the Test Script
```bash
cd Backend
source venv/bin/activate
python test_api.py
```

This will run comprehensive tests including:
- Root and health endpoints
- User registration
- User login
- Protected routes
- Error handling

### Manual Testing with cURL

**1. Register a new user:**
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**2. Login:**
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**3. Get user profile (replace TOKEN):**
```bash
curl -X GET "http://localhost:8000/auth/me" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📡 API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| GET | `/health` | Health check |
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | User login |

### Protected Endpoints (Require Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/me` | Get current user profile |
| GET | `/auth/verify` | Verify token validity |

## 🔌 Frontend Integration

### Step 1: Install Axios in Frontend
```bash
cd Frontend
npm install axios
```

### Step 2: Create API Service

Create `Frontend/src/services/api.js`:

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';
const TOKEN_KEY = 'lexiflow_token';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', {
    full_name: data.fullName,
    email: data.email,
    password: data.password,
  }),
  
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    localStorage.setItem(TOKEN_KEY, response.data.access_token);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
  },
  
  getProfile: () => api.get('/auth/me'),
  
  isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY),
};

export default api;
```

### Step 3: Update Login Component

```javascript
import { authAPI } from '../services/api';

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    await authAPI.login({
      email: formData.email,
      password: formData.password,
    });
    navigate('/dashboard');
  } catch (error) {
    setErrors({ general: 'Login failed' });
  } finally {
    setIsLoading(false);
  }
};
```

### Step 4: Update Register Component

```javascript
import { authAPI } from '../services/api';

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    await authAPI.register({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
    });
    navigate('/login');
  } catch (error) {
    setErrors({ general: 'Registration failed' });
  } finally {
    setIsLoading(false);
  }
};
```

## 📁 Backend Structure

```
Backend/
├── main.py                          # Application entry point
├── config.py                        # Configuration management
├── database.py                      # Database setup & management
├── models.py                        # Pydantic models (validation)
├── auth.py                          # Authentication utilities
├── routers/                         # API route modules
│   ├── __init__.py
│   └── auth.py                     # Authentication routes
├── requirements.txt                 # Python dependencies
├── .env                            # Environment variables
├── .env.example                    # Example environment file
├── .gitignore                      # Git ignore rules
├── setup.sh                        # Setup script
├── run.sh                          # Run script
├── test_api.py                     # API test script
├── frontend_integration_example.js  # Integration examples
├── README.md                        # Detailed documentation
└── lexiflow.db                     # SQLite database (auto-created)
```

## 🔒 Security Features

- ✅ **Password Hashing** - Bcrypt with automatic salting
- ✅ **JWT Tokens** - Secure token-based authentication
- ✅ **Token Expiration** - Configurable expiration time
- ✅ **Email Validation** - RFC-compliant email validation
- ✅ **Password Requirements** - Minimum 8 characters, letters + digits
- ✅ **SQL Injection Prevention** - Parameterized queries
- ✅ **CORS Protection** - Configurable allowed origins
- ✅ **Input Validation** - Comprehensive request validation

## ⚙️ Configuration

Edit `.env` file to customize settings:

```env
# REQUIRED: Change this in production!
SECRET_KEY=your-super-secret-key-here

# JWT settings
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database
DATABASE_URL=sqlite:///./lexiflow.db

# CORS (add your frontend URLs)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Environment
ENVIRONMENT=development
```

## 🐛 Troubleshooting

### Server won't start
- Ensure virtual environment is activated
- Check if port 8000 is available
- Verify all dependencies are installed: `pip install -r requirements.txt`

### Database errors
- Delete `lexiflow.db` and run `python database.py` to recreate
- Check file permissions

### CORS errors
- Add your frontend URL to `CORS_ORIGINS` in `.env`
- Restart the server after changing `.env`

### Token validation errors
- Check token hasn't expired
- Verify `SECRET_KEY` in `.env` hasn't changed
- Clear localStorage in browser and login again

### Import errors
- Activate virtual environment: `source venv/bin/activate`
- Reinstall dependencies: `pip install -r requirements.txt`

## 📊 Database Schema

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

## 🔮 Next Steps

Now that authentication is working, you can:

1. ✅ **Integrate with Frontend** - Update Login/Register components
2. 📄 **Add PDF Upload** - Implement file upload endpoints
3. 🔍 **Add OCR Processing** - Integrate OCR capabilities
4. 🤖 **Add AI Chat** - Implement chatbot endpoints
5. 📚 **Add Document Management** - CRUD operations for PDFs
6. 👤 **Add User Profiles** - Extended user information
7. 🔐 **Add Password Reset** - Forgot password functionality

## 📝 Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| SECRET_KEY | JWT signing key | - | ✅ Yes |
| ALGORITHM | JWT algorithm | HS256 | No |
| ACCESS_TOKEN_EXPIRE_MINUTES | Token lifetime | 30 | No |
| DATABASE_URL | Database path | sqlite:///./lexiflow.db | No |
| CORS_ORIGINS | Allowed origins | localhost:3000,3001 | No |
| ENVIRONMENT | Environment mode | development | No |

## 🆘 Support

For issues or questions:
1. Check the detailed README.md in Backend folder
2. Review API documentation at http://localhost:8000/docs
3. Run the test script: `python test_api.py`
4. Check server logs for error messages

## ⚠️ Production Checklist

Before deploying to production:

- [ ] Change `SECRET_KEY` to a strong random value
- [ ] Set `ENVIRONMENT=production` in `.env`
- [ ] Use PostgreSQL instead of SQLite for production
- [ ] Enable HTTPS
- [ ] Set up proper logging
- [ ] Implement rate limiting
- [ ] Add monitoring and health checks
- [ ] Regular database backups
- [ ] Use environment variables (don't commit `.env`)
- [ ] Review security settings

---

**Made with ❤️ for LexiFlow AI**

