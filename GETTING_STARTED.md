# 🚀 LexiFlow AI - Getting Started Guide

**Complete setup guide to get your application running in under 5 minutes!**

## 📋 Prerequisites Checklist

Before you begin, make sure you have:

- [ ] **Python 3.8+** installed (`python3 --version`)
- [ ] **Node.js 14+** installed (`node --version`)
- [ ] **npm** installed (`npm --version`)
- [ ] **Terminal/Command Prompt** access
- [ ] **Text Editor/IDE** (VS Code, PyCharm, etc.)

## 🎯 Quick Start (5 Minutes)

### Option A: Super Quick Setup (Automated)

```bash
# 1. Navigate to Backend
cd Backend

# 2. Run automated setup
./setup.sh

# 3. Start backend server
python main.py
```

**Backend will be running at: http://localhost:8000** ✅

### Option B: Step-by-Step Setup

#### Backend Setup (3 minutes)

**Step 1: Create Virtual Environment**
```bash
cd Backend
python3 -m venv venv
```

**Step 2: Activate Virtual Environment**

On macOS/Linux:
```bash
source venv/bin/activate
```

On Windows:
```bash
venv\Scripts\activate
```

**Step 3: Install Dependencies**
```bash
pip install -r requirements.txt
```

**Step 4: Initialize Database**
```bash
python database.py
```

You should see: `✅ Database initialized successfully`

**Step 5: Start Backend Server**
```bash
python main.py
```

You should see:
```
🚀 Starting LexiFlow AI Backend...
✅ Database initialized successfully
✅ Running in development mode
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Keep this terminal open!** Backend is running. ✅

#### Frontend Setup (2 minutes)

**Open a NEW terminal window**

**Step 1: Navigate to Frontend**
```bash
cd Frontend
```

**Step 2: Install Dependencies**
```bash
npm install
```

**Step 3: Start Frontend**
```bash
npm start
```

Browser will automatically open at: http://localhost:3000 ✅

## ✅ Verify Everything is Working

### Test 1: Backend Health Check

Open a new terminal:
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "environment": "development",
  "version": "1.0.0"
}
```

### Test 2: API Documentation

Open browser and visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

You should see interactive API documentation. ✅

### Test 3: Frontend

Open browser and visit:
- **Frontend**: http://localhost:3000

You should see the LexiFlow AI landing page. ✅

### Test 4: Run Automated Tests

In Backend directory:
```bash
cd Backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python test_api.py
```

Expected output:
```
🚀 Starting LexiFlow AI Backend API Tests
...
📊 TEST SUMMARY
✅ PASS - Root
✅ PASS - Health Check
✅ PASS - Registration
✅ PASS - Login
...
Results: X/X tests passed
🎉 All tests passed successfully!
```

## 🎮 Try It Out!

### Manual Testing Flow

**1. Register a New User**

Visit: http://localhost:8000/docs

Click on **POST /auth/register**
- Click "Try it out"
- Enter:
  ```json
  {
    "full_name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123"
  }
  ```
- Click "Execute"
- Should see: `201 Created` with success message ✅

**2. Login**

Click on **POST /auth/login**
- Click "Try it out"
- Enter:
  ```json
  {
    "email": "test@example.com",
    "password": "TestPass123"
  }
  ```
- Click "Execute"
- Should see: `200 OK` with `access_token` ✅
- **Copy the access_token value**

**3. Get User Profile (Protected)**

Click on **GET /auth/me**
- Click "Try it out"
- Click the 🔒 lock icon (top right)
- Enter token: `Bearer YOUR_TOKEN_HERE`
- Click "Execute"
- Should see: `200 OK` with your user profile ✅

## 🔌 Frontend Integration

Now that the backend is working, integrate it with your frontend:

### Step 1: Install Axios

```bash
cd Frontend
npm install axios
```

### Step 2: Create API Service

Create file: `Frontend/src/services/api.js`

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
  
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
  },
  
  getProfile: () => api.get('/auth/me'),
  
  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};

export default api;
```

### Step 3: Update Login Component

In `Frontend/src/components/Login.js`, replace the simulated API call:

```javascript
import { authAPI } from '../services/api';

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;

  setIsLoading(true);
  
  try {
    // Replace setTimeout with actual API call
    await authAPI.login({
      email: formData.email,
      password: formData.password,
    });
    
    navigate('/dashboard');
  } catch (error) {
    console.error('Login failed:', error);
    setErrors({ 
      general: error.response?.data?.detail || 'Login failed. Please try again.' 
    });
  } finally {
    setIsLoading(false);
  }
};
```

### Step 4: Update Register Component

In `Frontend/src/components/Register.js`, replace the simulated API call:

```javascript
import { authAPI } from '../services/api';

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;

  setIsLoading(true);
  
  try {
    // Replace setTimeout with actual API call
    await authAPI.register({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
    });
    
    navigate('/login', { 
      state: { 
        message: 'Registration successful! Please sign in with your credentials.' 
      } 
    });
  } catch (error) {
    console.error('Registration failed:', error);
    setErrors({ 
      general: error.response?.data?.detail || 'Registration failed. Please try again.' 
    });
  } finally {
    setIsLoading(false);
  }
};
```

### Step 5: Test Full Integration

1. Open frontend: http://localhost:3000
2. Click "Get Started" or "Sign In"
3. Register a new account
4. Login with your credentials
5. You should be redirected to Dashboard ✅

## 🐛 Troubleshooting

### Backend Issues

**Problem: Port 8000 already in use**
```bash
# Find process using port 8000
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill the process or use different port
uvicorn main:app --port 8001
```

**Problem: Module not found**
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

**Problem: Database locked**
```bash
# Delete and recreate database
rm lexiflow.db
python database.py
```

### Frontend Issues

**Problem: Can't connect to backend**
- Ensure backend is running: http://localhost:8000
- Check browser console for CORS errors
- Verify API_BASE_URL in api.js

**Problem: CORS errors**
```bash
# In Backend/.env, update CORS_ORIGINS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Restart backend server
```

**Problem: npm install fails**
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Common Errors

**Error: "Could not validate credentials"**
- Token expired or invalid
- Clear localStorage in browser
- Login again

**Error: "Email already registered"**
- Email is already in use
- Try different email or login with existing account

**Error: "Password must be at least 8 characters"**
- Password too short
- Must contain letters and numbers

## 📊 Project Status

| Component | Status | Port | URL |
|-----------|--------|------|-----|
| Backend API | ✅ Ready | 8000 | http://localhost:8000 |
| Swagger Docs | ✅ Ready | 8000 | http://localhost:8000/docs |
| Frontend | ✅ Ready | 3000 | http://localhost:3000 |
| Database | ✅ Ready | - | lexiflow.db |

## 🔐 Test Accounts

You can create test accounts with any email/password combination that meets requirements:

**Requirements:**
- Email: Valid email format
- Password: Minimum 8 characters, at least 1 letter and 1 digit
- Full Name: At least 2 characters

**Example Test Account:**
```
Full Name: John Doe
Email: john.doe@example.com
Password: TestPass123
```

## 📚 Next Steps

Now that everything is working:

1. ✅ **Authentication is working** - Users can register and login
2. 📄 **Add PDF Management** - Upload and list PDFs
3. 🔍 **Add OCR Processing** - Extract text from scanned PDFs
4. 🤖 **Add AI Chat** - Interact with PDFs using AI

See detailed implementation guides in:
- `Backend/README.md` - Backend documentation
- `Backend/ARCHITECTURE.md` - System architecture
- `IMPLEMENTATION_SUMMARY.md` - What's been completed

## 🆘 Getting Help

### Documentation
- Main README: `README.md`
- Backend Setup: `BACKEND_SETUP.md`
- Implementation Summary: `IMPLEMENTATION_SUMMARY.md`

### Testing Tools
- API Documentation: http://localhost:8000/docs
- Test Script: `python Backend/test_api.py`
- Health Check: http://localhost:8000/health

### Common Commands

**Start Backend:**
```bash
cd Backend
source venv/bin/activate
python main.py
```

**Start Frontend:**
```bash
cd Frontend
npm start
```

**Test API:**
```bash
cd Backend
source venv/bin/activate
python test_api.py
```

**View Database:**
```bash
cd Backend
sqlite3 lexiflow.db
.tables
SELECT * FROM users;
.quit
```

## ✨ Success!

If you've made it this far, congratulations! 🎉

You now have:
- ✅ A running FastAPI backend with authentication
- ✅ A React frontend with beautiful UI
- ✅ SQLite database with user management
- ✅ JWT token-based security
- ✅ Interactive API documentation
- ✅ Complete testing suite

**You're ready to start building amazing features!** 🚀

---

**Need help?** Check the documentation files or test the API at http://localhost:8000/docs

**Happy coding!** 💻✨

