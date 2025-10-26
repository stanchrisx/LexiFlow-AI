# LexiFlow AI - Intelligent PDF Reader 📚🤖

A full-stack application for reading and processing PDFs with AI assistance, featuring OCR capabilities and an intelligent chatbot.

## 🎯 Project Overview

LexiFlow AI is a modern web application that combines React frontend with FastAPI backend to provide an intelligent PDF reading experience. The application includes user authentication, document management, OCR processing, and AI-powered PDF interaction.

## ✨ Features

### ✅ Implemented
- **User Authentication**
  - Secure registration with email validation
  - JWT-based login system
  - Password hashing with bcrypt
  - Protected routes and session management
  
- **Modern UI**
  - Beautiful, responsive React interface
  - Smooth animations with Framer Motion
  - Professional dashboard design
  - Grid and list view for documents

### 🚧 Ready for Integration
- PDF upload and management
- OCR processing for scanned documents
- AI chatbot for PDF interaction
- Document reader with highlighting

## 🏗️ Architecture

```
LexiFlow-AI/
├── Frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── OCRProcessing.js
│   │   │   ├── PDFChatbot.js
│   │   │   └── Reader.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── Backend/                  # FastAPI application
│   ├── main.py              # Application entry point
│   ├── config.py            # Configuration management
│   ├── database.py          # Database setup
│   ├── models.py            # Pydantic models
│   ├── auth.py              # Authentication utilities
│   ├── routers/             # API routes
│   │   └── auth.py         # Auth endpoints
│   ├── requirements.txt     # Python dependencies
│   ├── README.md           # Backend documentation
│   └── ARCHITECTURE.md     # Architecture details
│
├── BACKEND_SETUP.md        # Quick start guide
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 14+ and npm (for Frontend)
- **Python** 3.8+ and pip (for Backend)

### 1️⃣ Backend Setup

```bash
# Navigate to Backend directory
cd Backend

# Automated setup (recommended)
./setup.sh

# OR Manual setup
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python database.py

# Start the backend server
python main.py
```

Backend will be available at:
- **API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 2️⃣ Frontend Setup

```bash
# Navigate to Frontend directory
cd Frontend

# Install dependencies
npm install

# Start the development server
npm start
```

Frontend will be available at:
- **App**: http://localhost:3000

### 3️⃣ Test the System

```bash
# Test backend API
cd Backend
source venv/bin/activate
python test_api.py

# Open frontend in browser
# Navigate to http://localhost:3000
# Try registering and logging in
```

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| GET | `/auth/me` | Get current user | Yes |
| GET | `/auth/verify` | Verify token | Yes |

### Example Requests

**Register:**
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Login:**
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

## 🔐 Security Features

- ✅ **Bcrypt Password Hashing** - Industry-standard password security
- ✅ **JWT Authentication** - Secure, stateless authentication
- ✅ **Token Expiration** - Configurable token lifetime
- ✅ **Email Validation** - RFC-compliant email verification
- ✅ **Password Requirements** - Minimum 8 characters, mixed content
- ✅ **SQL Injection Prevention** - Parameterized queries
- ✅ **CORS Protection** - Configurable allowed origins
- ✅ **Input Validation** - Comprehensive Pydantic validation

## 💻 Tech Stack

### Frontend
- **React** 18 - UI library
- **React Router** - Navigation
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Axios** - HTTP client (ready to integrate)

### Backend
- **FastAPI** - Modern Python web framework
- **SQLite3** - Lightweight database
- **Pydantic** v2 - Data validation
- **JWT** - Token-based authentication
- **Bcrypt** - Password hashing
- **Uvicorn** - ASGI server

## 🔌 Frontend-Backend Integration

### Step 1: Install Axios
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
  headers: { 'Content-Type': 'application/json' },
});

// Add token to requests
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
  
  logout: () => localStorage.removeItem(TOKEN_KEY),
  getProfile: () => api.get('/auth/me'),
  isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY),
};
```

### Step 3: Update Login Component

Replace the simulated API call in `Login.js`:

```javascript
import { authAPI } from '../services/api';

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;
  
  setIsLoading(true);
  
  try {
    await authAPI.login({
      email: formData.email,
      password: formData.password,
    });
    navigate('/dashboard');
  } catch (error) {
    setErrors({ 
      general: error.detail || 'Login failed' 
    });
  } finally {
    setIsLoading(false);
  }
};
```

### Step 4: Update Register Component

Replace the simulated API call in `Register.js`:

```javascript
import { authAPI } from '../services/api';

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;
  
  setIsLoading(true);
  
  try {
    await authAPI.register({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
    });
    navigate('/login', { 
      state: { message: 'Registration successful!' } 
    });
  } catch (error) {
    setErrors({ 
      general: error.detail || 'Registration failed' 
    });
  } finally {
    setIsLoading(false);
  }
};
```

## 📚 Documentation

- **[BACKEND_SETUP.md](./BACKEND_SETUP.md)** - Quick start guide for backend
- **[Backend/README.md](./Backend/README.md)** - Detailed backend documentation
- **[Backend/ARCHITECTURE.md](./Backend/ARCHITECTURE.md)** - System architecture details
- **[Backend/frontend_integration_example.js](./Backend/frontend_integration_example.js)** - Integration examples

## 🛠️ Development

### Running Development Servers

**Terminal 1 - Backend:**
```bash
cd Backend
source venv/bin/activate
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm start
```

### Testing

**Backend API Tests:**
```bash
cd Backend
source venv/bin/activate
python test_api.py
```

**Manual Testing:**
- Visit http://localhost:8000/docs for interactive API testing
- Use the React app at http://localhost:3000 for end-to-end testing

## 🐛 Troubleshooting

### Backend Issues

**Server won't start:**
- Ensure virtual environment is activated
- Check port 8000 is not in use
- Verify dependencies: `pip install -r requirements.txt`

**Database errors:**
- Delete `lexiflow.db` and reinitialize: `python database.py`

**CORS errors:**
- Verify frontend URL in `.env` CORS_ORIGINS
- Restart backend after changing `.env`

### Frontend Issues

**Can't connect to backend:**
- Ensure backend is running on http://localhost:8000
- Check browser console for CORS errors
- Verify API_BASE_URL in api.js

**Build errors:**
- Delete `node_modules` and reinstall: `npm install`
- Clear cache: `npm cache clean --force`

## 🔮 Next Steps

### Phase 1: Authentication Integration ✅
- [x] Create FastAPI backend
- [x] Implement user authentication
- [x] Set up SQLite database
- [ ] Connect frontend to backend

### Phase 2: Document Management
- [ ] Add PDF upload endpoint
- [ ] Implement file storage
- [ ] Create document CRUD operations
- [ ] Update dashboard with real data

### Phase 3: OCR Processing
- [ ] Integrate OCR library (Tesseract/Google Vision)
- [ ] Add OCR processing endpoint
- [ ] Implement progress tracking
- [ ] Add text extraction and storage

### Phase 4: AI Chatbot
- [ ] Integrate LLM (OpenAI/Anthropic)
- [ ] Add chat endpoint
- [ ] Implement context management
- [ ] Add conversation history

### Phase 5: Advanced Features
- [ ] Password reset functionality
- [ ] Email verification
- [ ] User profile management
- [ ] Document sharing
- [ ] Export functionality

## 📦 Database Schema

### Current Schema

```sql
-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Future Tables

```sql
-- Documents table (to be implemented)
CREATE TABLE documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    pages INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Chat history (to be implemented)
CREATE TABLE chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    document_id INTEGER NOT NULL,
    role TEXT NOT NULL,  -- 'user' or 'assistant'
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (document_id) REFERENCES documents(id)
);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- FastAPI for the excellent Python framework
- React team for the UI library
- Framer Motion for smooth animations
- Lucide for beautiful icons

## 📞 Support

For issues or questions:
1. Check the documentation in `Backend/README.md`
2. Review the architecture in `Backend/ARCHITECTURE.md`
3. Test the API at http://localhost:8000/docs
4. Open an issue on GitHub

---

**Version:** 1.0.0  
**Status:** Authentication Complete ✅  
**Next:** Document Management  

**Made with ❤️ for intelligent document processing**

